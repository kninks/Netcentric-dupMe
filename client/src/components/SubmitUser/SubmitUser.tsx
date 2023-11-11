import React, { useEffect, useState } from "react";
import { AvatarGenerator } from "random-avatar-generator";
import NameInput from "./NameInput";
import './User.css'

function SubmitUser() {
  const generator = new AvatarGenerator();
  // Get a random avatar
  const [avatar, setAvatar] = useState(generator.generateRandomAvatar())

  const handleRefreshAvatar = () => {
    setAvatar(generator.generateRandomAvatar());
    
  }
  return (
    <>
      <img
        // style={{ width: "200px", height: "200px", flexWrap: "wrap" }}
        className='avatar'
        src={avatar}
        alt="avatar1"
      />
      <p></p>
      <p></p>
      <button onClick={handleRefreshAvatar}>New avatar</button>
      <p></p>
      <NameInput avatar={avatar} />
    </>
  );
}

export default SubmitUser;
