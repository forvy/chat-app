"use client";
import { useState } from "react";
import { io } from "socket.io-client";
import ChatPage from "./chat";
import style from "./page.module.css";

export default function Home() {
  const [showChat, setShowChat] = useState(false);
  const [userName, setUserName] = useState("");
  const [roomId, setroomId] = useState("");

  var socket: any;
  socket = io(process.env.SERVER_URL || "http://localhost:3001");

  const leaveChat = (roomId: string, username: string) => {
    setShowChat(false);
    socket.emit("leave_room", roomId, username)
  }
  const handleJoin = () => {
    if (userName !== "" && roomId !== "") {
      socket.emit('new_user', userName, function (usernames: string) {
        if (usernames) {
          socket.emit("join_room", roomId);
          setShowChat(true);
        } else {
          alert("Username already taken.")
          return;
        }
      })
    } else {
      alert("Please fill in Username and Room ID");
    }
  };

  return (
    <div>
      <div className={style.chat_header} style={{ display: showChat ? "none" : "" }}>
        <h1>
          Join Chatroom
        </h1>
      </div>
      <div
        className={style.main_div}
        style={{ display: showChat ? "none" : "" }}
      >
        <input
          type="text"
          placeholder="Username"
          onChange={(e) => setUserName(e.target.value)}
        />
        <input
          type="text"
          placeholder="RoomID"
          onChange={(e) => setroomId(e.target.value)}
        />
        <button className={style.main_button} onClick={() => handleJoin()}>
          JOIN
        </button>
      </div>
      <div style={{ display: !showChat ? "none" : "" }}>
        <ChatPage socket={socket} roomId={roomId} username={userName} leaveChat={leaveChat} />
      </div>
    </div>
  );
}