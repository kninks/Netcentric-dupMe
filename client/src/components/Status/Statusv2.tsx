import React, { useEffect, useState } from 'react'
import socket from '../../socket';
import { useNavigate, Link } from "react-router-dom";
import './Status.css'

function Statusv2() {
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
    };

    const handleRestart = () => {
        socket.emit("client-restart");
      };
    
    const handleSurrender = () => {
        socket.emit("surrender");
    };

    // const handleMode = (mode: string) => {
    //     if (mode === "Easy") {
    //         setMode("Hard");
    //         socket.emit('set_mode', "Hard");
    //     } else if (mode === "Hard") {
    //         setMode("Easy");
    //         socket.emit('set_mode', "Easy");
    //     }
    // }

    const handleMode = (mode: string) => {
        setMode(mode);
        socket.emit('set_mode', mode);
    }

    useEffect(() => {
        if (mode === "Easy") {
            setEasyModeCSS(true);
        } else if (mode === "Hard") {
            setEasyModeCSS(false);
        }
    }, [mode])

    useEffect(() => {
        socket.on('mode', (data) => {
            setMode(data.mode)
        });

        socket.on('turn', (data) => {
            setMessage(data.message)
        });

        socket.on('time', (data) => {
            setTime(data.time)
        });

        socket.on('opponent_ready', (data) => {
            setOpponentReady(data);
        })

        socket.on('start_game_server', () => {
            setPlaying(true);
            socket.emit('start_game_client');
        });

        socket.on('start_game', () => {
            setPlaying(true);
        });

        socket.on('end_game', (data) => {
            // combine tie and winner
            setPlaying(false);
            setIsAfterMatch(true);
            // if (data.tie) {
            //     // setResult('Tie !')
            // } else {
            //     // setResult(`The winner is ${data.winner}`)
            // }
            console.log(data)
        });

        socket.on('restart', (data) => {
            setIsReady(false);
            setPlaying(false);
            setIsAfterMatch(false);
            setMessage("");
        });

        return () => {
            socket.off('mode');
            socket.off('turn');
            socket.off('time');
            socket.off('opponent_ready')
            socket.off('start_game_server');
            socket.off('start_game');
            socket.off('end_game');
            socket.off('restart');
        }

    }, [socket]);

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

export default Statusv2;