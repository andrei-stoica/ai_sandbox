from openai import OpenAI
from fastapi import FastAPI, File, Response, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
import whisper


app = FastAPI()
openAI_clinet = OpenAI()
model = whisper.load_model("base")

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
def get_text(response: Response, audio: bytes = File()):
    with open("audio", "wb") as f:
        f.write(audio)
    # transcript = openAI_clinet.audio.transcriptions.create(
    #    model="whisper-1",
    #    file=audio,
    #    response_format="text",
    #    RequestBody
    # )
    result = model.transcribe("audio")
    data = {"len": len(audio), "user-transcript": result["text"]}
    return data


@app.post("/conversation")
async def get_next_response(request: Request, response: Response):
    # role = "test"
    # res_msg = "temp test response"
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


@app.post("/speak", response_class=FileResponse)
def tts(text: str, response: Response):
    res = openAI_clinet.audio.speech.create(
        model="tts-1",
        voice="nova",
        input=text,
    )
    # this works for now but I need to find a way to stream this to response
    res.stream_to_file("tts.mp3")
    return "tts.mp3"
