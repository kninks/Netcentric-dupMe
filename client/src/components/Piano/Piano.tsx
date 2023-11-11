import React, { useEffect, useState } from "react";
import socket from "../../socket";
import Countdown from "../Countdown";
import "./Piano.css";

function Piano() {
  const allnotes = ["C", "D", "E", "F", "G", "A", "B"];

  const [notelist, setNotelist] = useState<{ id: number; note: string }[]>([]);
  const [notelistReceived, setNotelistReceived] = useState<
    { id: number; note: string }[]
  >([]);
  const [round, setRound] = useState(0);

  const [createDuration, setCreateDuration] = useState(10);
  const [isCreating, setIsCreating] = useState(false);
  const [followDuration, setFollowDuration] = useState(20);
  const [isFollowing, setIsFollowing] = useState(false);

  // Click note
  const [sound, setSound] = useState("Default");
  const [soundCSS, setSoundCSS] = useState(true);

  const handleClickNote = (item: string) => {
    if (sound == "Default") {
      const audio = new Audio(`sounds/${item}.mp3`);
      audio.play();
    } else if (sound == "Cat") {
      const audio = new Audio(`sounds_cat/${item}_cat.mp3`);
      audio.play();
    }

    if (isCreating || isFollowing) {
      setNotelist((prevNotelist) => {
        const newNote = { id: notelist.length, note: item };
        const updatedNotelist = [...prevNotelist, newNote]; //Add in array
        return updatedNotelist;
      });
    }
    return;
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) {
        return;
      } else {
        const note = event.key.toUpperCase()
        if (allnotes.includes(note)) {
          handleClickNote(note);
        }
      }
    };
  
    window.addEventListener('keydown', handleKeyDown);
  
    // Cleanup function
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [notelist, sound]);

  const handleDelete = () => {
    if (isCreating || isFollowing) {
      const updatedNotelist = [...notelist]
      updatedNotelist.pop();
      setNotelist(updatedNotelist);
    }
  }

  const handleSound = (sound: string) => {
    setSound(sound);
    if (sound === "Default") {
        setSoundCSS(true);
    } else if (sound === "Cat") {
        setSoundCSS(false);
    }
  }

  const endCreate = () => {
    socket.emit("end_create");
    setIsCreating(false);
  };

  const endFollow = () => {
    socket.emit("end_follow", { arrayR: notelistReceived, arrayS: notelist });
    setNotelist([]);
    setNotelistReceived([]);
    setIsFollowing(false);
  };

  useEffect(() => {
    socket.emit("send_notelist", { notelist: notelist });
    return;
  }, [notelist])

  // socket.on functions
  const socketMode = (data: any) => {
      setCreateDuration(data.createDuration);
      setFollowDuration(data.followDuration);
      setRound(data.round);
  }
  const socketStartCreate = () => {
    setNotelist([]);
    setNotelistReceived([]);
    setIsCreating(true);
  }
  const socketReceiveNotelist = (data: any) => {
    const updatedNotelist = data.notelist;
      setNotelistReceived(data.notelist);
      if (updatedNotelist.length > 0) {
        const lastNote = updatedNotelist[updatedNotelist.length - 1].note;
        console.log(lastNote);
        if (sound == "Default") {
          const audio = new Audio(`sounds/${lastNote}.mp3`);
          audio.play();
        } else if (sound == "Cat") {
          const audio = new Audio(`sounds_cat/${lastNote}_cat.mp3`);
          audio.play();
        }
      }
  }
  const socketStartFollow = (data: any) => {
    setNotelist([]);
    setIsFollowing(true); // also hide the received note
  }
  const socketStartTurn = (data: any) => {
    setNotelist([]);
    setNotelistReceived([]);
    setRound(data.round);
  }
  const socketRestart = (data: any) => {
    setNotelist([]);
    setNotelistReceived([]);
    setRound(data.round);
    setIsCreating(false);
    setIsFollowing(false);
  }
  const socketSurrender = (data: any) => {
    setRound(data.round);
    setIsCreating(false);
    setIsFollowing(false);
  }

  useEffect(() => {
    socket.on('mode', socketMode)
    socket.on("start_create", socketStartCreate);
    socket.on('receive_notelist', socketReceiveNotelist)
    socket.on("start_follow", socketStartFollow);
    socket.on("start_turn", socketStartTurn);
    socket.on("restart", socketRestart);
    socket.on("surrender", socketSurrender);

    return () => {
      socket.off('mode', socketMode)
      socket.off("start_create", socketStartCreate);
      socket.off('receive_notelist', socketReceiveNotelist)
      socket.off("start_follow", socketStartFollow);
      socket.off("start_turn", socketStartTurn);
      socket.off("restart", socketRestart);
      socket.off("surrender", socketSurrender);
    };
  }, [socket, notelist, notelistReceived, sound, round]);

  return (
    <>
        <div style={{display:"none"}}>
        {/* <div> */}
        <div className="countdown">
            Create a pattern:
            <Countdown
            key={`create_${round}`}
            duration={createDuration}
            running={isCreating}
            onTimeout={endCreate}
            />
        </div>

        <div className="countdown">
            Follow the pattern:
            <Countdown
            key={`follow_${round}`}
            duration={followDuration}
            running={isFollowing}
            onTimeout={endFollow}
            />
        </div>
        </div>
        <div className="display">
            <div className="display-title">Received</div>
            {!isFollowing && (
            <>
                {notelistReceived.map((item) => (
                <div className="display-note" key={item.id}>
                    {item.note}
                </div>
                ))}
            </>
            )}
        </div>

        <div className="piano-container">
            {allnotes.map((item) => (
            <div
                key={item}
                onClick={() => {handleClickNote(item)}}
            >
                {item}
            </div>
            ))}
        </div>

        <div className="display">
            <div className="display-title">Display</div>
            {notelist.map((item) => (
            <div className="display-note" key={item.id}>
                {item.note}
            </div>
            ))}
        </div>
        {/* <button onClick={handleDelete}>Delete previous note</button> */}
        <p></p>
        <div className="sound-container">
            <div className="sound-title">Piano Sound: </div>
            <button 
                onClick={() => handleSound("Default")}
                className={ soundCSS ? "button-clicked" : "button-default" }
            >
                Default
            </button>
            <button 
                onClick={() => handleSound("Cat")}
                className={ soundCSS ? "button-default" : "button-clicked" }
            >
                Cat
            </button>
        </div>
    </>
  );
}

export default Piano;