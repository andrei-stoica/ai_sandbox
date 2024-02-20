import { useState } from "react";
import { TbMicrophone2, TbPlayerPlay, TbPlayerStop } from "react-icons/tb";
import "./App.css";

function Header() {
  return (
    <header className="header p-3">
      <div className="title text-3xl font-extrabold">
        Speach to Speech AI example
      </div>
    </header>
  );
}

let audioBlobs = [];
let streamBeingCaptured = null;
let mediaRecorder = null;

function get_mic() {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    console.log("getUserMedia supported.");
    return navigator.mediaDevices.getUserMedia({ audio: true });
  } else {
    console.log("getUserMedia not supported on your browser!");
  }
}

function startRecord() {
  get_mic().then((stream) => {
    streamBeingCaptured = stream;
    mediaRecorder = new MediaRecorder(stream);
    console.log("Starting Recording");
    mediaRecorder.addEventListener("dataavailable", (event) => {
      audioBlobs.push(event.data);
    });
    mediaRecorder.start()
  });
}

function stopRecord() {
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

function Feed() {
  return (
    <div className="feed grow self-center content-center w-5/6 max-w-screen-lg px-6 py-3">
      chat history goes here
    </div>
  );
}

function Controls() {
  const [recordState, setRecordState] = useState(false);

  function toggleRecord() {
    if (recordState == false) {
      startRecord();
      setRecordState(true);
    } else {
      stopRecord();
      setRecordState(false);
    }
  }
  return (
    <div className="controls self-center flex justify-evenly p-5 text-5xl border-2 border-b-0 w-1/2 max-w-screen-sm min-w-fit">
      <button
        onClick={() => toggleRecord()}
        className={"inline-flex " + (recordState ? "text-red-500" : "")}
      >
        {recordState ? <TbPlayerStop /> : <TbMicrophone2 />}
        {recordState ? "STOP" : "REC"}
      </button>

      <button
        onClick={() => playRecord()}
        className="inline-flex text-green-500"
      >
        <TbPlayerPlay /> PLAY
      </button>
    </div>
  );
}

function App() {
  return (
    <>
      <div className="h-screen center flex flex-col">
        <div className="w-full max-w-screen-xl self-center">
          <Header />
          <hr className="mx-3 border-t-4" />
        </div>
        <Feed />
        <Controls />
      </div>
    </>
  );
}

export default App;
