from openai import OpenAI
from fastapi import FastAPI, File, Response, Request
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from json import dumps
from pydantic import BaseModel
import filetype
import whisper


app = FastAPI()
openAI_clinet = OpenAI()
model = whisper.load_model("base")


class ConversationMessege(BaseModel):
    role: str
    content: str


class Conversation(BaseModel):
    messages: list[ConversationMessege]


@app.post("/get-text")
def get_text(response: Response, audio: bytes = File()):
    response.headers["Access-Control-Allow-Origin"] = "*"
    with open("audio", "wb") as f:
        f.write(audio)
    print(len(audio))
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
    response.headers["Access-Control-Allow-Origin"] = "*"
    messages = await request.json()
    res = openAI_clinet.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=messages,
    )
    res_msg = res.choices[0].message.content
    role = res.choices[0].message.role
    print(res_msg)
    return {"role": role, "content": res_msg}
