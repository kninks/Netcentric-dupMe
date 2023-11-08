import { Server, Socket } from "socket.io";
import { users, rooms } from "../dataStorage";
import { playerInfo, updatePlayerInRoom,  updatePlayerInRoom2} from "./playerController";
import { countdown, findMode, readySetGo, scoring, startCreate, winner } from "./gameController";

export function gameHandler2(io: Server, socket: Socket): void {

    const setMode = (mode: string) => {
        // Info
        const userInfo = playerInfo(io, socket);
        const sid = socket.id
        const userIndex = userInfo.userIndex;
        const roomId = userInfo.roomId;
        const roomIndex = userInfo.roomIndex;

        if ((userIndex !== -1) && roomId && (roomIndex !== -1)) {
            if (mode === "easy") {
                rooms[roomIndex].mode = "easy";
                io.to(roomId).emit('mode', { mode: "easy", createDuration: 10, followDuration: 20, round: 10 });
            } else if (mode === "hard") {
                rooms[roomIndex].mode = "hard";
                io.to(roomId).emit('mode', { mode: "hard", createDuration: 5, followDuration: 7, round: 5 });
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
            io.to(sid).emit('ready_state', true);

            // Check both players
            const playersInRoom = users.filter((user) => user.roomId === roomId);
            if (playersInRoom[0] && playersInRoom[1]) {
                const bothPlayersReady = playersInRoom.every((player) => player.ready);

                if (bothPlayersReady) {
                    let firstPlayer = playersInRoom.find((player) => player.P1);
                    let p1sid = "";
                    let p1name = "";
                    if (!firstPlayer) {
                        p1sid = Math.random() < 0.5 ? playersInRoom[0].sid : playersInRoom[1].sid;
        
                        // update P1 to true for the person who goes first
                        users.forEach((user) => {
                            if (user.sid === p1sid) {
                                user.P1 = true;
                                p1name = user.name;
                            }
                        });
                    } else {
                        p1sid = firstPlayer.sid;
                        p1name = firstPlayer.name;
                    }

                    rooms[roomIndex].round = 1;

                    io.to(roomId).emit('turn', { message: `${p1name} is the first player`});
                    io.to(p1sid).emit('start_game_server');
                } else {
                    socket.emit('turn', { message: "Waiting for another player" });
                    console.log('waiting for another player')
                }
            } else {
                socket.emit('turn', { message: "Waiting for another player" });
                console.log('waiting for another player')
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
            const time = findMode(roomIndex);
            const createDuration = time.createDuration;
            const followDuration = time.followDuration;

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

            const time = findMode(roomIndex);
            const createDuration = time.createDuration;
            const followDuration = time.followDuration;
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
            const time = findMode(roomIndex);
            const createDuration = time.createDuration;
            const followDuration = time.followDuration;

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
            io.to(roomId).emit('ready_state', false);

            console.log(`client restart ${roomId}`)
        }
        return;
    }

    socket.on('set_mode', setMode)
    socket.on('send_notelist', sendNoteList);
    socket.on('ready', ready);
    socket.on('start_game_client', startGame);
    socket.on('end_create', endCreate);
    socket.on('end_follow', endFollow);
    socket.on('client-restart', clientRestart);
}