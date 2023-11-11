import { Server, Socket } from "socket.io";
import { users, rooms } from "../dataStorage";

export function findMode (roomIndex: number) {
    const mode = rooms[roomIndex].mode;
    let createDuration = 10;
    let followDuration = 20;
    if (mode === "Easy") {
    } else if (mode === "Hard") {
        createDuration = 5;
        followDuration = 7;
    }
    return { mode: mode, createDuration: createDuration, followDuration: followDuration }
}

export function readySetGo (io: Server, socket: Socket, roomId: string, onTimeout: () => void): void {
    let currentTime = 4;
    const interval = setInterval(() => {
        if (currentTime === 0) {
            io.to(roomId).emit('time', { time: "" });
            onTimeout();
            clearInterval(interval);
        } else if (currentTime === 1) {
            currentTime--;
            io.to(roomId).emit('time', { time: "Go" });
        } else if (currentTime === 2) {
            currentTime--;
            io.to(roomId).emit('time', { time: "Set" });
        } else if (currentTime === 3) {
            currentTime--;
            io.to(roomId).emit('time', { time: "Ready" });
            socket.emit('turn', { message: "Your turn to create a pattern" });
            socket.to(roomId).emit('turn', { message: 'Waiting for another player to create a pattern'})
        } else {
            currentTime--;
        }
    }, 1000);
}

// for display only !! the real countdown work at front
export function countdown (io: Server, socket: Socket, duration: number, roomId: string): void {
    let currentTime = duration;
    io.to(roomId).emit('time', { time: currentTime });
    const interval = setInterval(() => {
        if (currentTime <= 1) {
            io.to(roomId).emit('time', { time: "" });
            // onTimeout();
            clearInterval(interval);
        } else {
            currentTime--;
            io.to(roomId).emit('time', { time: currentTime }); 
        }
    }, 1000);
    // io.to(roomId).emit('time', { time: currentTime });
    // const interval = setInterval(() => {
    //     if (currentTime === 0) {
    //         io.to(roomId).emit('time', { time: currentTime });
    //         onTimeout();
    //         clearInterval(interval);
    //     } else {
    //         currentTime--;
    //         io.to(roomId).emit('time', { time: currentTime }); 
    //     }
    // }, 1000);
}

export function startCreate (io: Server, socket: Socket, sid: string, roomId: string, round: number): void {
    io.to(sid).emit('start_create');
    io.to(roomId).emit('start_turn', { round: round }); // to reset timer
    return;
}

export function scoring (arrayR: { id: number; note: string }[], arrayS: { id: number; note: string }[]) {
    let addScore = 0;
    const minLenght = Math.min(arrayR.length, arrayS.length);
    for (let i = 0; i < minLenght; i++) {
        if (arrayR[i].id === arrayS[i].id && arrayR[i].note === arrayS[i].note) {
            addScore++;
        }
    };
    return addScore;
}

export function winner (roomId: string) {
    // find winner
    const playersInRoom = users.filter((user) => user.roomId === roomId);

    let winner = playersInRoom[0];

    if (playersInRoom[0] && playersInRoom[1]) {
        // check if tie
        if (playersInRoom[0].score === playersInRoom[1].score) {
            // tie = true;
            console.log("this match is a tie");

            playersInRoom.forEach((playerInRoom) => {
                playerInRoom.score = 0;
                playerInRoom.ready = false;
                playerInRoom.P1 = false;
            });

            return { tie: true, winner: "none" };
        } else {
            const maxScore = Math.max(playersInRoom[0].score, playersInRoom[1].score);

            for (const playerInRoom of playersInRoom) {
                if (playerInRoom.score === maxScore) {
                    winner = playerInRoom;
                    console.log("winner: ", winner.name);

                    playerInRoom.P1 = true;
                } else {
                    playerInRoom.P1 = false;
                }
            }
            return { tie: false, winner: winner.name };
        }
    } else {
        return { tie: false, winner: "there's some errorrrrr" };
    }
}