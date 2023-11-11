import { Server, Socket } from "socket.io";
import { users, rooms } from "../dataStorage";

export function serverHandler(io: Server, socket: Socket) {
    // controllers
    const serverUpdatePlayerInRoom = (roomId: string) => {
        const playerInRoom = users.filter((user) => (user.roomId === roomId));
        const playerCount = playerInRoom.length;
    
        if (playerCount === 2) {
            io.to(playerInRoom[0].sid).emit('me', { name : playerInRoom[0].name, avatar: playerInRoom[0].avatar, score: playerInRoom[0].score})
            io.to(playerInRoom[0].sid).emit('opponent', { name : playerInRoom[1].name, avatar: playerInRoom[1].avatar, score: playerInRoom[1].score})
            io.to(playerInRoom[1].sid).emit('me', { name : playerInRoom[1].name, avatar: playerInRoom[1].avatar, score: playerInRoom[1].score})
            io.to(playerInRoom[1].sid).emit('opponent', { name : playerInRoom[0].name, avatar: playerInRoom[0].avatar, score: playerInRoom[0].score})
        }
    }

    // for socket
    const serverUsers = () => {
        console.log('server called users')
        io.emit('users', users)
    }

    const serverRestartRoom = (data: any) => {
        console.log(`serverRestart ${data.roomId}`);
        const roomId = data.roomId;
        const roomIndex = rooms.findIndex((room) => room.roomId === roomId);
        const playersInRoom = users.filter((user) => user.roomId === roomId);
    
        // set new properties
        playersInRoom.forEach((playerInRoom) => {
            playerInRoom.score = 0;
            playerInRoom.ready = false;
            playerInRoom.P1 = false;
        });
    
        rooms[roomIndex].round = 0;
    
        // send info to client
        serverUpdatePlayerInRoom(roomId)
        io.to(roomId).emit('restart', { round: 0 });
        io.to(roomId).emit('opponent_ready', false);
    }

    socket.on('server_users', serverUsers);
    socket.on('server_restart', serverRestartRoom);

    return () => {
        socket.off('server_users', serverUsers);
        socket.off('server_restart', serverRestartRoom);
    }
}