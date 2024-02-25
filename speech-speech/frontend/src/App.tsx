import { useEffect, useRef, useState } from "react";
import {
  TbBrandOpenai,
  TbMicrophone2,
  TbPlayerPlay,
  TbPlayerStop,
} from "react-icons/tb";
import "./App.css";

type ChatMsg = {
  role: string;
  content: string;
};

let audioBlobs = [];
let streamBeingCaptured: MediaStream | null = null;
let mediaRecorder: MediaRecorder | null = null;


function get_mic() {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    console.log("getUserMedia supported.");
    return navigator.mediaDevices.getUserMedia({ audio: true });
  } else {
    console.log("getUserMedia not supported on your browser!");
  }
}

function startRecord() {
  audioBlobs = [];
  get_mic().then((stream) => {
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
  const audio =  new Audio(audioUrl);
  audio.play();
}

function playMsg(msg: ChatMsg) {
  const audio = new Audio("http://100.82.51.22:8001/speak?" + new URLSearchParams({text: msg.content}));
  console.log("loading audio and playing?")
  audio.play();
}

function Header() {
  return (
    <header className="header p-3">
      <div className="title text-5xl font-extrabold">
        Speach to Speech AI example
      </div>
    </header>
  );
}

function Feed(props: { chat: Array[ChatMsg]; setChatStateFn: any }) {
  const bottomRef = useRef(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    console.log("scroll?");
  });

  return (
    <div className="feed grow self-center w-5/6 max-w-screen-lg px-6 py-3 overflow-scroll">
      <div className="content-center  space-y-2 divide-y-4">
        {props.chat.filter((m: ChatMsg) => m.role != "system").map((
          m: ChatMsg,
          i: number,
        ) => <Msg key={i} msg={m} />)}
      </div>
      <div ref={bottomRef} />
    </div>
  );
}

function Msg(props: { msg: ChatMsg }) {
  return (
    <div className="Messege text-lg">
      <span className="font-bold">
        {props.msg.role.toUpperCase()}:
      </span>
      <br />
      <span className="ml-8">
        {props.msg.content}
      </span>
    </div>
  );
}

function Controls(props: { setChatStateFn: any; chat: Array[ChatMsg] }) {
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

  function sendAudio() {
    var formData = new FormData();
    formData.append("audio", new Blob(audioBlobs, { type: "audio/webm" }));
    fetch("http://100.82.51.22:8001/get-text", {
      "method": "POST",
      "body": formData,
    }).then((res) => res.json())
      .then((res) => {
        console.log(res);
        props.setChatStateFn((curState) => [
          ...curState,
          { "role": "user", "content": res["user-transcript"] },
        ]);
        fetch("http://100.82.51.22:8001/conversation", {
          "method": "POST",
          "body": JSON.stringify([...props.chat, {
            "role": "user",
            "content": res["user-transcript"],
          }]),
        }).then((res) => res.json())
          .then((res) => {
            props.setChatStateFn((curState) => [...curState, res]);
            console.log("attempting to play result")
            playMsg(res)
          });
      });
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

      <button
        onClick={() => {
          sendAudio();
        }}
        className="inline-flex"
      >
        <TbBrandOpenai /> SEND
      </button>
    </div>
  );
}

function App() {
  const [chatState, setChatState] = useState([{
    role: "system",
    content: "You are a helpful assistant.",
  }]);

  return (
    <>
      <div className="h-screen center flex flex-col">
        <div className="w-full max-w-screen-xl self-center">
          <Header />
          <hr className="mx-3 border-t-4" />
        </div>
        <Feed chat={chatState} setChatStateFn={setChatState} />
        <Controls setChatStateFn={setChatState} chat={chatState} />
      </div>
    </>
  );
}

export default App;
