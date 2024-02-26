from openai import OpenAI
from fastapi import FastAPI, File, Response, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from io import BytesIO


app = FastAPI()
openAI_clinet = OpenAI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class ConversationMessege(BaseModel):
    role: str
    content: str


class Conversation(BaseModel):
    messages: list[ConversationMessege]


@app.post("/get-text")
async def stt(audio: bytes = File()):
    with BytesIO(audio) as f:
        f.name = "audio.mp3"
        transcript = openAI_clinet.audio.transcriptions.create(
            model="whisper-1",
            file=f,
            response_format="text",
        )
    data = {"len": len(audio), "user-transcript": transcript}
    return data


@app.post("/conversation")
async def get_next_response(request: Request):
    messages = await request.json()
    res = openAI_clinet.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=messages,
    )
    res_msg = res.choices[0].message.content
    role = res.choices[0].message.role
    print(messages)
    print(res_msg)
    return {"role": role, "content": res_msg}


@app.get("/speak")
def tts(text: str):
    res = openAI_clinet.audio.speech.create(
        model="tts-1", voice="nova", input=text, response_format="mp3"
    )
    return Response(content=res.content, media_type="audio/mp3")
