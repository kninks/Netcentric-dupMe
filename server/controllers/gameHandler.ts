import { Server, Socket } from "socket.io";
import { users, rooms } from "../dataStorage";
import { playerInfo, updatePlayerInRoom } from "./playerController";
import { countdown, findMode, readySetGo, scoring, startCreate, winner } from "./gameController";

export function gameHandler(io: Server, socket: Socket) {
    const setMode = (mode: string) => {
        // Info
        const userInfo = playerInfo(io, socket);
        const sid = socket.id
        const userIndex = userInfo.userIndex;
        const roomId = userInfo.roomId;
        const roomIndex = userInfo.roomIndex;

        if ((userIndex !== -1) && roomId && (roomIndex !== -1)) {
            if (mode === "Easy") {
                rooms[roomIndex].mode = "Easy";
                io.to(roomId).emit('mode', { mode: "Easy", createDuration: 10, followDuration: 20, round: 10 });
            } else if (mode === "Hard") {
                rooms[roomIndex].mode = "Hard";
                io.to(roomId).emit('mode', { mode: "Hard", createDuration: 5, followDuration: 7, round: 5 });
            }
        }
        return;
    }

    const sendNoteList = (data: any) => {
        // Info
        const userInfo = playerInfo(io, socket);
        const sid = socket.id
        const userIndex = userInfo.userIndex;
        const roomId = userInfo.roomId;
        const roomIndex = userInfo.roomIndex;

        if ((userIndex !== -1) && roomId && (roomIndex !== -1)) {
            socket.to(roomId).emit('receive_notelist', data);
            return;
        }
    }

    const ready = () => {
        // Info
        const userInfo = playerInfo(io, socket);
        const sid = socket.id
        const userIndex = userInfo.userIndex;
        const roomId = userInfo.roomId;
        const roomIndex = userInfo.roomIndex;

        if ((userIndex !== -1) && roomId && (roomIndex !== -1)) {
            // Set ready to true
            users[userIndex].ready = true;
        
            // Check both players
            const playersInRoom = users.filter((user) => user.roomId === roomId);
            if (playersInRoom[0] && playersInRoom[1]) {
                // for selecting mode
                socket.to(roomId).emit('opponent_ready', true);

                const bothPlayersReady = playersInRoom.every((player) => player.ready);

                if (bothPlayersReady) {
                    let firstPlayer = playersInRoom.find((player) => player.P1);
                    let p1sid = "";
                    let p1name = "";
                    let defaultp1 = "";
                    if (!firstPlayer) {
                        p1sid = Math.random() < 0.5 ? playersInRoom[0].sid : playersInRoom[1].sid;
        
                        // update P1 to true for the person who goes first
                        users.forEach((user) => {
                            if (user.sid === p1sid) {
                                user.P1 = true;
                                p1name = user.name;
                                defaultp1 = `${p1name} is the first player at random`
                            }
                        });
                    } else {
                        p1sid = firstPlayer.sid;
                        p1name = firstPlayer.name;
                        defaultp1 = `The winner ${p1name} is the first player`
                    }

                    rooms[roomIndex].round = 1;

                    io.to(roomId).emit('turn', { message: defaultp1 });
                    io.to(roomId).emit('start_game');
                    io.to(p1sid).emit('start_game_server');
                } else {
                    socket.emit('turn', { message: "Waiting for another player" });
                    console.log('waiting for another player')
                }
            } else {
                socket.emit('turn', { message: "Waiting for another player" });
                console.log('waiting for another player');
            }
        }
        return;
    }

    const startGame = () => {
        // Info
        const userInfo = playerInfo(io, socket);
        const sid = socket.id
        const userIndex = userInfo.userIndex;
        const roomId = userInfo.roomId;
        const roomIndex = userInfo.roomIndex;

        if ((userIndex !== -1) && roomId && (roomIndex !== -1)) {
            const round = rooms[roomIndex].round;
            const mode = findMode(roomIndex);
            const createDuration = mode.createDuration;
            const followDuration = mode.followDuration;

            readySetGo(io, socket, roomId, () => {
                startCreate(io, socket, sid, roomId, round);
                countdown(io, socket, createDuration, roomId)
            })
        }
        return;
    }

    const endCreate = () => {
        // Info
        const userInfo = playerInfo(io, socket);
        const sid = socket.id
        const userIndex = userInfo.userIndex;
        const roomId = userInfo.roomId;
        const roomIndex = userInfo.roomIndex;

        if ((userIndex !== -1) && roomId && (roomIndex !== -1)) {
            socket.to(roomId).emit('start_follow');
            socket.emit('turn', { message: "Waiting for another player to follow the pattern" });
            socket.to(roomId).emit('turn', { message: "Your turn to follow the pattern"});

            const mode = findMode(roomIndex);
            const createDuration = mode.createDuration;
            const followDuration = mode.followDuration;
            countdown(io, socket, followDuration, roomId);
        }
        return;
    }

    const endFollow = (data: any) => {
        // Info
        const userInfo = playerInfo(io, socket);
        const sid = socket.id
        const userIndex = userInfo.userIndex;
        const roomId = userInfo.roomId;
        const roomIndex = userInfo.roomIndex;

        if ((userIndex !== -1) && roomId && (roomIndex !== -1)) {
            const name = users[userIndex].name;

            const arrayR = data.arrayR;
            const arrayS = data.arrayS;
            
            // score
            const addScore = scoring(arrayR, arrayS);
            users[userIndex].score = users[userIndex].score + addScore;
            console.log(`${users[userIndex].name} add ${addScore} = ${users[userIndex].score}`);

            io.to(roomId).emit('turn', { message: `${name} get ${addScore} score` });
            updatePlayerInRoom(io, socket, roomId);

            // time
            const mode = findMode(roomIndex);
            const createDuration = mode.createDuration;
            const followDuration = mode.followDuration;

            // check ending
            if (users[userIndex].P1) { // If is P1
                if (rooms[roomIndex].round >= 2) { // Round 2 = end game
                    rooms[roomIndex].round = 0;
                    const result = winner(roomId);
                    if (result.tie) {
                        io.to(roomId).emit('turn', { message: "Tie !!"});
                    } else {
                        io.to(roomId).emit('turn', { message: `The winner is ${result.winner}`});
                    }
                    io.to(roomId).emit('end_game', result);
                } else { // Round 1 = continues
                    rooms[roomIndex].round++;
                    const round = rooms[roomIndex].round;
                    readySetGo(io, socket, roomId, () => {
                        startCreate(io, socket, sid, roomId, round);
                        countdown(io, socket, createDuration,roomId)
                    })
                }
            } else { // is not P1 = always start the next turn
                const round = rooms[roomIndex].round;
                readySetGo(io, socket, roomId, () => {
                    startCreate(io, socket, sid, roomId, round);
                    countdown(io, socket, createDuration,roomId)
                })
            }
        }
        return;
    }

    const clientRestart = () => {
        // Info
        const userInfo = playerInfo(io, socket);
        const sid = socket.id
        const userIndex = userInfo.userIndex;
        const roomId = userInfo.roomId;
        const roomIndex = userInfo.roomIndex;

        if ((userIndex !== -1) && roomId && (roomIndex !== -1)) {
            const playersInRoom = users.filter((user) => user.roomId === roomId);

            playersInRoom.forEach((playerInRoom) => {
                playerInRoom.score = 0;
                playerInRoom.ready = false;
            });

            rooms[roomIndex].round = 0;

            updatePlayerInRoom(io, socket, roomId);

            io.to(roomId).emit('restart', { round: 0 });
            io.to(roomId).emit('opponent_ready', false);

            console.log(`client restart ${roomId}`)
        }
        return;
    }

    const surrender = () => {
        // Info
        const userInfo = playerInfo(io, socket);
        const sid = socket.id
        const userIndex = userInfo.userIndex;
        const roomId = userInfo.roomId;
        const roomIndex = userInfo.roomIndex;

        if ((userIndex !== -1) && roomId && (roomIndex !== -1)) {
            const loser = users[userIndex].name;
            // find winner
            const playersInRoom = users.filter((user) => user.roomId === roomId);

            let winner = playersInRoom[0];

            for (const playerInRoom of playersInRoom) {
                if (playerInRoom.sid !== sid) {
                    winner = playerInRoom;
                    console.log("winner: ", winner.name);

                    playerInRoom.P1 = true;
                } else {
                    playerInRoom.P1 = false;
                }
            }

            io.to(roomId).emit('turn', { message: `${loser} surrender. The winner is ${winner.name}` } )
            io.to(roomId).emit('winner', winner.name);
            io.to(roomId).emit('end_game', { tie: false, winner: winner.name });
            io.to(roomId).emit('surrender', { round: 0 });
        }
    }

    socket.on('set_mode', setMode)
    socket.on('send_notelist', sendNoteList);
    socket.on('ready', ready);
    socket.on('start_game_client', startGame);
    socket.on('end_create', endCreate);
    socket.on('end_follow', endFollow);
    socket.on('client-restart', clientRestart);
    socket.on('surrender', surrender);

    return () => {
        socket.off('set_mode', setMode)
        socket.off('send_notelist', sendNoteList);
        socket.off('ready', ready);
        socket.off('start_game_client', startGame);
        socket.off('end_create', endCreate);
        socket.off('end_follow', endFollow);
        socket.off('client-restart', clientRestart);
        socket.off('surrender', surrender);
    }
}