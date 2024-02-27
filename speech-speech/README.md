# Speech to Speech AI Assistant
AI assistant chat with speech recognition and tts responses

Fullstack  
- Vite, TS, React frontend
- fastapi backend
- OpenAI for LLM services

## Requirements
- python3
- npm
- OpenAI API token

## Setup
```
cd frontend
npm init
npm run build

cd ../backend
# optionally setup virtual environment of your choice
python3 -m pip install -r requirements
```

# Running 
example `backend/.env`
```
OPEN_API_KEY=<apikey>
```
```
cd backend
uvicorn --port 8080 api:app
```
