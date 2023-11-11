import { Server, Socket } from "socket.io";
import { users, rooms } from "../dataStorage";

export function chatHandler(io: Server, socket: Socket): void {
  // socket.on("join_room", (data) => {
  //   socket.join(data);
  // });

  // socket.on("send_message", (data) => {
  //   const userIndex = users.findIndex((user) => user.sid === socket.id);
  //   if (userIndex !== -1) {
  //     const roomId = users[userIndex].roomId;

  //     // Broadcast the message to all users in the same room
  //     io.to(roomId).emit("new_message", {
  //       user: users[userIndex].name,
  //       message: data, // The message content sent by the client
  //     });
  //   }
  // });
  socket.on("send_message", (data) => {
    const userIndex = users.findIndex((user) => user.sid === socket.id);
    if (userIndex !== -1) {

      // Broadcast the message to all users in the same room
      io.emit("new_message", {
        user: users[userIndex].name,
        message: data, // The message content sent by the client
      });
    }
  });
}
