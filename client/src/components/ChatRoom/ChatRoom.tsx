import React, { useEffect, useState } from "react";
import socket from "../../socket";
import { Link, useNavigate } from "react-router-dom";
import "./ChatRoom.css";

interface Message {
  user: string;
  message: string;
}

const ChatRoom: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
      socket.on("new_message", (message: Message) => {
          setMessages((prevMessages) => [...prevMessages, message]);
      });

      return () => {
         socket.off("new_message");
      };
  }, []);


  const sendMessage = () => {
    if (newMessage.trim() !== "") {
      socket.emit("send_message", newMessage);
      setNewMessage("");
    }
  };

  const handleBackToRoom = () => {
    navigate('/room');
    socket.emit('client_restart');
  }
  return (
    <>
      <h2>Chat Room</h2>
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className="chat-message">
            <span className="username">{message.user}: </span>
            <span className="message-text">{message.message}</span>
          </div>
        ))}
      </div>
      <div>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
      {/* <p> */}
        {/* <Link to="/room"> */}
          <button onClick={handleBackToRoom}>Back to Room</button>
        {/* </Link> */}
      {/* </p> */}
    </>
  );
};

export default ChatRoom;
