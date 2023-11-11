// import { users, rooms } from "./dataStorage";
// import { io } from "socket.io"
// const { io } = require("socket.io");

const socket = io(':3000');

function user() {
    console.log(users)
    const count = users.length;
    const playerCountElement = document.getElementById('player-count');
    if (playerCountElement) {
        playerCountElement.innerText = `${count} players online`;
    }
};

function refreshUsers() {
    socket.emit('server_users');
}

function serverRestart(roomId) {
    console.log(`${roomId} restart`);
    socket.emit('server_restart', { roomId: roomId });
}

socket.on('users', (data) => {
    console.log(data);
    const userCountServer = data.length;
    const userInfoServer = data;
    const userCountElement = document.getElementById('user-count');
    const userInfoElement = document.getElementById('user-info');
    if (userCountElement) {
        userCountElement.innerHTML = `${userCountServer} users online`
    }
    if (userInfoElement) {
        userInfoElement.innerHTML = data
        .map((user, index) => (
            `<div 
                key=${index}
            >
                <p>sid: ${user.sid}, name: ${user.name}</p>
            </div>`
        ))
        .join('');
    }
    // if (userInfoElement) {
    //     userInfoElement.innerHTML = data
    //     .map((user, index) => (
    //         `<div 
    //             key=${index}
    //         >
    //             <p>sid: ${user.sid}</p>
    //             <p>name: ${user.name}</p>
    //             <p>Room ID: ${user.roomId}</p>
    //             <p>Score: ${user.score}</p>
    //             <p>Ready: ${user.ready ? 'Yes' : 'No'}</p>
    //             <p>P1: ${user.P1 ? 'Yes' : 'No'}</p>
    //         </div>`
    //     ))
    //     .join('');
    // }
})