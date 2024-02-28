import { useEffect, useRef } from "react";
import {
  TbBrandOpenai,
  TbMicrophone2,
  TbPlayerPlay,
  TbPlayerStop,
} from "react-icons/tb";

export type ChatMsg = {
  role: string;
  content: string;
  audio?: string;
};

export function Header() {
  return (
    <header className="header p-3">
      <div className="title text-5xl font-extrabold">
        Speach to Speech AI example
      </div>
    </header>
  );
}

export function Feed(props: { chat: Array<ChatMsg>; setChatStateFn: any }) {
  const bottomRef = useRef<any>(null);

  const scrollToBottom = () => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
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

export function Msg(props: { msg: ChatMsg }) {
  return (
    <div className="Messege text-lg">
      <span className="font-bold">
        {props.msg.role.toUpperCase()}:
      </span>
      <br />
      <span className="ml-8">
        {props.msg.content}
      </span>
      <audio
        controls
        autoPlay={props.msg.role == "assistant"}
        src={props.msg.audio}
      />
    </div>
  );
}

export function Controls(
  props: {
    recButtonOnClick: Function;
    recordState: Boolean;
    playButtonOnClick: Function;
    sendButtonOnClick: Function;
  },
) {
  return (
    <div className="controls self-center flex justify-evenly p-5 text-5xl border-2 border-b-0 w-1/2 max-w-screen-sm min-w-fit">
      <button
        onClick={() => props.recButtonOnClick()}
        className={"inline-flex " + (props.recordState ? "text-red-500" : "")}
      >
        {props.recordState ? <TbPlayerStop /> : <TbMicrophone2 />}
        {props.recordState ? "STOP" : "REC"}
      </button>

      <button
        onClick={() => props.playButtonOnClick()}
        className="inline-flex text-green-500"
      >
        <TbPlayerPlay /> PLAY
      </button>

      <button
        onClick={() => {
          props.sendButtonOnClick();
        }}
        className="inline-flex"
      >
        <TbBrandOpenai /> SEND
      </button>
    </div>
  );
}
