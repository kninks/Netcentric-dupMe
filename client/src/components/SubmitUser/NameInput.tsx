import React, { ChangeEvent, useCallback, useEffect, useState } from "react";
import socket from "../../socket";
// import { AvatarGenerator } from "random-avatar-generator";

function NameInput({ avatar }: { avatar: string }) {
  const [name, setName] = useState<string>("");

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const handleSubmitName = () => {
    socket.emit("submit_name", { name: name, avatar: avatar });
    socket.connect();
  };

  // random names
  const allNames = [
    "KninkLnWza",
    "Falaka",
    "Palm.me",
    "w่oมapalmy",
    "Chanaearn",
    "Tingtingsuaymak",
    "Kitkanan",
    "Nololo",
    "Nopocho",
    "Woroyo",
    "Kokono",
    "Balaya",
    "Aj jaidee maak",
    "Pls give me A",
    "Best Pianist",
    "Beethoven",
    "Mozart",
    "Chopin",
    "Ink Warunthorn",
    "Getsunova"
  ];

  const handleRandomName = () => {
    const i = allNames[Math.floor(Math.random() * allNames.length)];
    setName(i);
  };

  return (
    <>
      <input
        type="text"
        value={name}
        onChange={handleNameChange}
        placeholder="Enter your name"
        required
      />{" "}
      <img
        src="/pictures/game_die.png"
        onClick={handleRandomName}
        style={{
          width: 30,
          height: 30,
          cursor: "pointer",
          position: "absolute",
          marginLeft: "10px",
        }}
      />
      <p></p>
      <button onClick={handleSubmitName}>Submit</button>
    </>
  );
}

export default NameInput;
