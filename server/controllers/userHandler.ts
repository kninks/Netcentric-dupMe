import { Server, Socket } from "socket.io";
import { users, rooms } from "../dataStorage";
import { updatePlayerInRoom } from "./playerController";

export function userHandler(io: Server, socket: Socket) {
    const submitName = (data: any) => {
        const user = {
            sid: socket.id, 
            name: data.name, 
            avatar: data.avatar,
            roomId: "main", 
            score: 0, 
            ready: false, 
            P1: false
        };
        users.push(user);

        console.log(`user connected: ${socket.id}`);
        console.log(`connected users: ${users.length}`);

        // Send the list of all connected users to the client
        io.emit('users', users);
        io.emit('rooms', rooms);
        socket.emit('profile', { name: data.name, avatar: data.avatar })
    }

    const disconnect = () => {
        const userIndex = users.findIndex((user) => user.sid === socket.id);
        if (userIndex !== -1) {
            const previousRoomId = users[userIndex].roomId;
            users.splice(userIndex, 1);
            updatePlayerInRoom(io, socket, previousRoomId);

            // Broadcasting the list of players in the room to all users in the server and the room
            io.emit('users', users);
            io.emit('rooms', rooms);
            socket.to(previousRoomId).emit('receive_reaction', { reaction: "/pictures/blank.png" });
            socket.to(previousRoomId).emit('opponent', { avatar : "/pictures/beige.png" });
            io.to(previousRoomId).emit('opponent_ready', false);

        } else {
            console.log("disconnect: User not found");
        }

        console.log(`User disconnected: ${socket.id}`);
        console.log(`connected users: ${users.length}`);
    }

    socket.on('submit_name', submitName);
    socket.on('disconnect', disconnect);

    return () => {
        socket.off('submit_name', submitName);
        socket.off('disconnect', disconnect);
    }
}
