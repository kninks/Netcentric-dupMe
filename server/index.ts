import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import console from "console";
import path from "path";

const app = express();
app.use(cors());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/script.js', (req, res) => {
    res.setHeader('Content-Type', 'text/javascript');
    res.sendFile(path.join(__dirname, 'script.js'));
});

app.get('/dataStorage', (req, res) => {
    res.sendFile(path.join(__dirname, 'dataStorage.ts'));
})

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
    }
})

import { userHandler } from "./controllers/userHandler";
import { roomHandler } from "./controllers/roomHandler";
import { gameHandler } from "./controllers/gameHandler";
import { gameHandler2 } from "./controllers/gameV2";
import { serverHandler } from "./controllers/serverHandler";
import { chatHandler } from "./controllers/chatHandler";
// import { gameHandler3 } from "./controllers/gamev3";


io.on('connection', (socket) => {  
    console.log(`Boombayah welcome: ${socket.id}`);
    userHandler(io, socket);
    roomHandler(io, socket);
    gameHandler(io, socket);
    serverHandler(io, socket);
    chatHandler(io, socket);
})

// Run server
const PORT = 3000;
// const SERVER_IP = "127.0.0.1"; 
// server.listen(PORT, SERVER_IP, () => {
//     console.log(`Boombayah is running at http://${SERVER_IP}:${PORT}`);
// })

server.listen(PORT, () => {
    console.log(`Boombayah is running at http://:${PORT}`);
})