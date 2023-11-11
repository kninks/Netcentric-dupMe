import React, { useEffect, useState } from "react";
import socket from "../../socket";
import { Link, useNavigate } from "react-router-dom";
import "./ChatRoom.css";

interface Message {
  user: string;
  message: string;
}

const ChatRoomv2: React.FC = () => {
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

  return (
    <>
        <h3 className="chat-room-title">Chat Room</h3>
        <div className="chat-messages">
            <div className="chat-message-box">
                {messages.map((message, index) => (
                <div key={index} className="chat-message">
                    <span className="username">{message.user}: </span>
                    <span className="message-text">{message.message}</span>
                </div>
                ))}
            </div>
            <div className="chat-input-tab">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="chat-input-input"
                />
                <button 
                    onClick={sendMessage}
                    className="chat-input-button"
                >
                    Send
                </button>
            </div>
            
        </div>
        
    </>
  );
};

export default ChatRoomv2;
