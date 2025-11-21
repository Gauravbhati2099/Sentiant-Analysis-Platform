import os
from dotenv import load_dotenv
from googleapiclient.discovery import build
import requests # Import the requests library
import json

load_dotenv()

API_KEY = os.getenv("YOUTUBE_API_KEY")
YOUTUBE_API_SERVICE_NAME = "youtube"
YOUTUBE_API_VERSION = "v3"

def fetch_youtube_comments(video_id, max_results=25): # Reduced for quicker testing
    # ... (the rest of this function is unchanged) ...
    if not API_KEY:
        raise ValueError("YouTube API Key not found. Please set it in your .env file.")
    try:
        youtube = build(YOUTUBE_API_SERVICE_NAME, YOUTUBE_API_VERSION, developerKey=API_KEY)
        response = youtube.commentThreads().list(
            part="snippet", videoId=video_id, textFormat="plainText", maxResults=max_results
        ).execute()
        comments = [item["snippet"]["topLevelComment"]["snippet"]["textDisplay"] for item in response["items"]]
        return comments
    except Exception as e:
        print(f"An error occurred fetching comments: {e}")
        return []

# --- MAIN EXECUTION BLOCK (Updated) ---
if __name__ == "__main__":
    target_video_id = "dQw4w9WgXcQ"
    video_comments = fetch_youtube_comments(target_video_id)

    if video_comments:
        print(f"\n--- Analyzing {len(video_comments)} Comments ---")
        # Define the URL of your running Flask API
        SENTIMENT_API_URL = "http://127.0.0.1:5001/analyze"

        for comment_text in video_comments:
            try:
                # Send the comment to the sentiment API
                response = requests.post(SENTIMENT_API_URL, json={"text": comment_text})
                response.raise_for_status() # Raise an exception for bad status codes (4xx or 5xx)

                # Get the analysis from the response
                analysis = response.json()
                classification = analysis.get('classification', 'N/A')
                
                # Print the result
                print(f"Comment: '{comment_text}'")
                print(f"Sentiment: {classification}\n")

            except requests.exceptions.RequestException as e:
                print(f"Could not connect to the sentiment API: {e}")
                print("Please make sure the Flask server (app.py) is running in another terminal.")
                break