import { useState } from "react";
import { ChatMsg, Controls, Feed, Header } from "./components.tsx";
import "./App.css";

let userAudio: Array<Blob> = [];
let audioBlobs: Array<Blob> = [];
let streamBeingCaptured: MediaStream | null = null;
let mediaRecorder: MediaRecorder | null = null;

function get_mic() {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    console.log("getUserMedia supported.");
    return navigator.mediaDevices.getUserMedia({ audio: true });
  }
  throw "getUserMedia not supported on your browser!";
}

function startRecord() {
  audioBlobs = [];
  get_mic().then((stream) => {
    console.log("got mic");
    streamBeingCaptured = stream;
    mediaRecorder = new MediaRecorder(stream);
    console.log("Starting Recording");
    mediaRecorder.addEventListener("dataavailable", (event) => {
      audioBlobs.push(event.data);
    });
    mediaRecorder.start();
  });
}

function stopRecord() {
  if (!mediaRecorder) {
    throw "MediaRecorder not set";
  }
  if (!streamBeingCaptured) {
    throw "Stream not set";
  }
  mediaRecorder.stop();
  streamBeingCaptured.getTracks()
    .forEach((track) => track.stop());
  mediaRecorder = null;
  streamBeingCaptured = null;
  console.log("Starting Recording");
  console.log(audioBlobs);
}

function playRecord() {
  const audioBlob = new Blob(audioBlobs, { type: "audio/webm" });
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);
  audio.play();
}

function App() {
  const [recordState, setRecordState] = useState(false);
  const [chatState, setChatState] = useState([{
    role: "system",
    content: "You are a helpful assistant.",
  }]);

  function toggleRecord() {
    if (recordState == false) {
      startRecord();
      setRecordState(true);
    } else {
      stopRecord();
      setRecordState(false);
    }
  }

  function sendAudio() {
    let formData = new FormData();
    let audio = new Blob(audioBlobs, { type: "audio/webm" });
    userAudio.push(audio);
    formData.append("audio", audio);
    fetch("/get-text", {
      "method": "POST",
      "body": formData,
    }).then((res) => res.json())
      .then((res) => {
        setChatState((curState: Array<ChatMsg>) => [
          ...curState,
          {
            "role": "user",
            "content": res["user-transcript"],
            "audio": URL.createObjectURL(userAudio[userAudio.length - 1]),
          },
        ]);
        fetch("/conversation", {
          "method": "POST",
          "body": JSON.stringify([...chatState, {
            "role": "user",
            "content": res["user-transcript"],
          }]),
        }).then((res) => res.json())
          .then((res) => {
            setChatState((
              curState: Array<ChatMsg>,
            ) => [...curState, {
              ...res,
              "audio": "/speak?" + new URLSearchParams({ text: res.content }),
            }]);
          });
      });
  }

  return (
    <>
      <div className="h-screen center flex flex-col">
        <div className="w-full max-w-screen-xl self-center">
          <Header />
          <hr className="mx-3 border-t-4" />
        </div>
        <Feed chat={chatState} setChatStateFn={setChatState} />
        <Controls
          recButtonOnClick={toggleRecord}
          recordState={recordState}
          playButtonOnClick={playRecord}
          sendButtonOnClick={sendAudio}
        />
      </div>
    </>
  );
}

export default App;
