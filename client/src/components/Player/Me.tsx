import React, { useEffect, useState } from "react";
import socket from "../../socket";
import "./Player.css";

import smile from "../../assets/pictures/smile.png";
import smirk from "../../assets/pictures/smirk.png";
import blah from "../../assets/pictures/blah.png";
import angry from "../../assets/pictures/angry.png";
import clown from "../../assets/pictures/clown.png";
import aunji from "../../assets/pictures/aunji.png";
import blank from "../../assets/pictures/blank.png";

function Me() {
  const [name, setName] = useState<string>();
  const [avatar, setAvatar] = useState<string>();
  const [score, setScore] = useState(0);
  const [myReaction, settMyReaction] = useState<string>(blank);
  const allReaction = [smile, smirk, blah, angry, clown, aunji];

  const handleReaction = (item: string) => {
    socket.emit("send_reaction", { reaction: item });
    settMyReaction(item);
  };

  useEffect(() => {
    socket.on("me", (data) => {
      setName(data.name);
      setAvatar(data.avatar);
      setScore(data.score);
    });
  }, [socket]);

  return (
    <>
      <h3>You</h3>
      <img
        // style={{ width: "100px", height: "100px", flexWrap: "wrap" }}
        className="avatar"
        src={avatar}
        alt="Me"
      />
      <div className="name">{name}</div>
      <div>current score: {score}</div>

      <div className="reaction-bubble">
        <img src={`${myReaction}`} style={{ width: 30, height: 30 }} />
      </div>
      <h3>Your reaction</h3>
      {allReaction.map((item) => (
        <button
          key={item}
          onClick={() => {
            handleReaction(item);
          }}
          className="reaction-button"
        >
          <img src={`${item}`} style={{ width: 25, height: 25 }} />
        </button>
      ))}
    </>
  );
}

export default Me;
