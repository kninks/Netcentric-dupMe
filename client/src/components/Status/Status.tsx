import React, { useEffect, useState } from 'react'
import socket from '../../socket';
import { useNavigate, Link } from "react-router-dom";
import './Status.css'

function Status() {
    const [isReady, setIsReady] = useState(false); // data from the server
    const [opponentReady, setOpponentReady] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [afterMatch, setIsAfterMatch] = useState(false);

    const [mode, setMode] = useState("Easy");
    const [easyModeCSS, setEasyModeCSS] = useState(true);
    
    const [time, setTime] = useState<any>();
    const [message, setMessage] = useState<string>();
    
    const navigate = useNavigate();

    const handleLeave = () => {
        socket.emit('leave_room');
        navigate('/');
    };

    const handleReady = () => {
        socket.emit('ready');
        setIsReady(true);
        return;
    };

    const handleRestart = () => {
        socket.emit("client-restart");
        return;
      };
    
    const handleSurrender = () => {
        socket.emit("surrender");
        return;
    };

    const handleMode = (mode: string) => {
        setMode(mode);
        socket.emit('set_mode', mode);
        return;
    }

    useEffect(() => {
        if (mode === "Easy") {
            setEasyModeCSS(true);
        } else if (mode === "Hard") {
            setEasyModeCSS(false);
        }
    }, [mode])

    // socket.on functions
    const socketMode = (data: any) => {
        setMode(data.mode);
    }
    const socketTurn = (data: any) => {
        setMessage(data.message);
    }
    const socketTime = (data: any) => {
        setTime(data.time);
    }
    const socketOpponentReady = (data: any) => {
        setOpponentReady(data);
    }
    const socketStartGameServer = (data: any) => {
        setPlaying(true);
        socket.emit('start_game_client');
    }
    const socketStartGame = (data: any) => {
        setPlaying(true);
    }
    const socketEndGame = (data: any) => {
        setPlaying(false);
        setIsAfterMatch(true);
        if (data.tie) {
            // setResult('Tie !')
        } else {
            // setResult(`The winner is ${data.winner}`)
        }
        console.log(data)
    }
    const socketRestart = (data: any) => {
        setIsReady(false);
        setPlaying(false);
        setIsAfterMatch(false);
        setMessage("");
    }

    useEffect(() => {
        socket.on('mode', socketMode);
        socket.on('turn', socketTurn);
        socket.on('time', socketTime);
        socket.on('opponent_ready', socketOpponentReady)
        socket.on('start_game_server', socketStartGameServer);
        socket.on('start_game', socketStartGame);
        socket.on('end_game', socketEndGame);
        socket.on('restart', socketRestart);

        return () => {
            socket.off('mode', socketMode);
            socket.off('turn', socketTurn);
            socket.off('time', socketTime);
            socket.off('opponent_ready', socketOpponentReady)
            socket.off('start_game_server', socketStartGameServer);
            socket.off('start_game', socketStartGame);
            socket.off('end_game', socketEndGame);
            socket.off('restart', socketRestart);
        }
    }, [socket, mode, message, time, opponentReady, playing, afterMatch, isReady]);

  return ( <> 
        <h3>{message}</h3>
        {playing ? (<>
            <h3>{time}</h3>
            <button onClick={handleSurrender}>Surrender</button>
        </>) : (<>
            {afterMatch ? (<>
                <button onClick={handleRestart}>Restart</button>
            </>) : (<div className="not-playing-not-aftermatch">
                <div>
                    <button
                        onClick={handleReady}
                        className={isReady ? "button-ready-clicked" : "button-default"}
                    >
                        Ready
                    </button>
                </div>
                <div aria-disabled={ isReady || opponentReady }>
                    <div className="sound-title">Mode: </div>
                    <button 
                        onClick={() => handleMode("Easy")}
                        className={
                            `${easyModeCSS ? "button-clicked" : "button-default"} 
                            ${isReady || opponentReady ? "button-disabled" : "button-default"}`
                        }
                        disabled = { isReady || opponentReady }
                    >
                        Easy
                    </button>
                    <button 
                        onClick={() => handleMode("Hard")}
                        className={
                            `${easyModeCSS ? "button-default" : "button-clicked"} 
                            ${isReady || opponentReady ? "button-disabled" : "button-default"}`
                        }
                    >
                        Hard
                    </button>
                </div>
                <div>
                    <button 
                        onClick={handleLeave}
                        disabled={isReady}
                        className={isReady ? "button-disabled" : "button-default"}
                    >
                        Leave This Room
                    </button>
                </div>
                
            </div>)}
        </>)
        }
    </> );
}

export default Status;