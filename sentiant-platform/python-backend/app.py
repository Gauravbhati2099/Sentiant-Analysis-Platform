import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from googleapiclient.discovery import build

# Load environment variables
load_dotenv()

# --- INITIALIZATION ---
app = Flask(__name__)
analyzer = SentimentIntensityAnalyzer()
API_KEY = os.getenv("YOUTUBE_API_KEY")
YOUTUBE_API_SERVICE_NAME = "youtube"
YOUTUBE_API_VERSION = "v3"

# --- HELPER FUNCTION ---
def fetch_youtube_comments(video_id, max_results=50):
    if not API_KEY:
        raise ValueError("YouTube API Key not found.")
    
    youtube = build(YOUTUBE_API_SERVICE_NAME, YOUTUBE_API_VERSION, developerKey=API_KEY)
    response = youtube.commentThreads().list(
        part="snippet", videoId=video_id, textFormat="plainText", maxResults=max_results
    ).execute()
    
    comments = [item["snippet"]["topLevelComment"]["snippet"]["textDisplay"] for item in response["items"]]
    return comments

# --- API ENDPOINT ---
@app.route('/api/process-video', methods=['POST'])
def process_video():
    data = request.get_json()
    video_id = data.get('videoId')

    if not video_id:
        return jsonify({"error": "videoId is required"}), 400

    try:
        # 1. Fetch comments
        comments = fetch_youtube_comments(video_id)
        if not comments:
            return jsonify({"error": "Could not fetch comments or no comments found."}), 404

        # 2. Analyze sentiment for each comment
        results = []
        for comment in comments:
            scores = analyzer.polarity_scores(comment)
            compound_score = scores['compound']
            
            if compound_score >= 0.05:
                classification = 'Positive'
            elif compound_score <= -0.05:
                classification = 'Neutral'
            else:
                classification = 'Negative'
            
            results.append({
                "comment": comment,
                "classification": classification,
                "scores": scores
            })

        return jsonify(results)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)