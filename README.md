## Sentiant

Comprehensive sentiment analysis demo/project that combines:

- A Flask-based Python backend that fetches YouTube comments and runs VADER sentiment analysis.
- A Node/Express server that provides authentication helpers and proxies analysis requests to the Python backend.
- A React (Create React App) client for the UI.

This README explains how to set up and run the project locally on Windows (PowerShell) and includes alternatives (WSL/Git Bash). It also covers environment variables, common issues, and troubleshooting tips.

---

## Repository layout

- `sentiant-platform/python-backend/` — Python Flask app (entry: `app.py`). Requires `YOUTUBE_API_KEY` in `.env`.
- `sentiant-platform/server/` — Node/Express server (entry: `index.js`). Proxies to the Python API.
- `sentiant-platform/client/` — React app (Create React App).

---

## Requirements

- Node.js (recommended 16.x or 18.x)
- npm (comes with Node.js)
- Python 3.8+
- (Windows) PowerShell; Git Bash or WSL recommended for best parity with UNIX-style npm scripts

Optional: a Google Cloud YouTube Data API key to allow the backend to fetch comments.

---

## Environment variables

Create a `.env` file in `sentiant-platform/python-backend/` with the following:

```text
YOUTUBE_API_KEY=YOUR_YOUTUBE_API_KEY_HERE
```

The Python backend uses `python-dotenv` and will load this file automatically.

Server configuration notes:
- The Node server may be configured to call a remote Python API by default (check `sentiant-platform/server/index.js`).
- If you want the Node server to call your local Python backend, either:
  - (Preferred) set an environment variable before starting the server (if supported by `index.js`) — example shown below, or
  - edit `sentiant-platform/server/index.js` and replace the hard-coded Python API URL with `http://127.0.0.1:5001/api/process-video`.

---

## Ports used

- Python backend (Flask): 5001 (default in `app.py`)
- Node server (Express): 8080
- React dev server (CRA): 3000

If any port is already in use, change the port in the respective component.

---

## Quick setup & run (PowerShell)

Open three terminals (one per component) so they can run concurrently.

1) Python backend

```powershell
cd 'c:\Users\gaura\OneDrive\Desktop\Projects\Sentiant\sentiant-platform\python-backend'
# Create and activate a venv (skip if you already have one)
python -m venv venv
.\venv\Scripts\Activate.ps1

# Upgrade pip and install requirements
pip install --upgrade pip
pip install -r requirements.txt

# Ensure .env contains YOUTUBE_API_KEY, then run
python app.py

# The Flask app listens on http://127.0.0.1:5001 by default
```

2) Node server

Open a second PowerShell terminal for the server:

```powershell
cd 'c:\Users\gaura\OneDrive\Desktop\Projects\Sentiant\sentiant-platform\server'
npm install

# If the server supports overriding the Python API URL with an environment variable, set it:
$env:PYTHON_API_URL = 'http://127.0.0.1:5001/api/process-video'

npm start

# The server listens on http://localhost:8080
```

If `index.js` is hard-coded to call a remote URL (the upstream repo used a remote Render URL), either edit the file and replace that URL with `http://127.0.0.1:5001/api/process-video`, or set `PYTHON_API_URL` in environment if the file reads it.

3) React client (recommended: Git Bash or WSL for smooth postinstall)

Open a third terminal:

Option A — (Recommended) Git Bash or WSL

```bash
cd '/c/Users/gaura/OneDrive/Desktop/Projects/Sentiant/sentiant-platform/client'
npm install
npm start
```

Option B — PowerShell (Windows) — avoids the `chmod` postinstall issue

```powershell
cd 'c:\Users\gaura\OneDrive\Desktop\Projects\Sentiant\sentiant-platform\client'
# Install ignoring lifecycle scripts (skips chmod that fails on Windows)
npm install --ignore-scripts
# Start via npx so react-scripts is executed (it will load from node_modules if available)
npx react-scripts start
```

The CRA dev server opens on http://localhost:3000.

---

## Test the stack manually (quick checks)

- Check Flask is reachable (a 404 is fine; connectivity is what matters):

```powershell
curl http://127.0.0.1:5001/ -UseBasicParsing
```

- Check Node server connectivity:

```powershell
curl http://127.0.0.1:8080/ -UseBasicParsing
```

- Use the Node server analyze endpoint (example payload):

```powershell
curl http://127.0.0.1:8080/api/analyze -Method POST -Body (@{videoURL='https://www.youtube.com/watch?v=dQw4w9WgXcQ'} | ConvertTo-Json) -ContentType 'application/json'
```

This hits the Node server which should proxy to the Python API to analyze comments.

---

## Common issues & troubleshooting

- Client `postinstall` chmod failure on Windows:
  - Symptom: `chmod: not recognized` or `EPERM` on postinstall.
  - Workarounds: run `npm install --ignore-scripts` and then `npx react-scripts start`, or install/run the client from Git Bash/WSL which supports chmod. If you want, remove or replace the `postinstall` script in `sentiant-platform/client/package.json` with a cross-platform no-op.

- Missing YouTube API key:
  - Symptom: Python backend returns an error like "YouTube API Key not found." Ensure `.env` exists and `YOUTUBE_API_KEY` is set.

- Node server proxies to a remote URL by default:
  - If the server doesn't call your local Flask instance, check `sentiant-platform/server/index.js` for the hard-coded `PYTHON_API_URL`. Either set `PYTHON_API_URL` environment variable (if code reads it) or edit the file to use the local URL.

- npm audit / vulnerabilities:
  - `npm install` may report vulnerabilities. For local development these usually don't block, but run `npm audit` and `npm audit fix` if you want to attempt automatic remediation. Use `--force` only when you accept potential breaking changes.

---

## Development notes & recommended changes

- Make `sentiant-platform/server/index.js` read the Python API URL from `process.env.PYTHON_API_URL` so you can point it to a local backend without editing source on each run. Example (PowerShell temporary env):

```powershell
$env:PYTHON_API_URL = 'http://127.0.0.1:5001/api/process-video'
npm start
```

- Make `sentiant-platform/client/package.json` postinstall more cross-platform (remove `chmod` or replace with a small Node script) to avoid Windows friction.

- Secure secrets: remove hard-coded `JWT_SECRET` or other sensitive strings from `sentiant-platform/server/index.js` and load them from `.env` instead.

---

## Useful scripts & commands summary

- Start Python backend (from `python-backend/`):

```powershell
.\venv\Scripts\Activate.ps1
python app.py
```

- Start server (from `server/`):

```powershell
npm install
$env:PYTHON_API_URL = 'http://127.0.0.1:5001/api/process-video'  # if supported
npm start
```

- Start client (from `client/`):

```powershell
npm install --ignore-scripts
npx react-scripts start
```

---

## Contributing

If you'd like to contribute, please:

1. Open an issue describing the bug or feature.
2. Create a small, focused pull request with tests if applicable.

Notes:
- Keep secrets out of the repository. Use `.env` or your deployment's secret management.

---
