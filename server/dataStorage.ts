export let users: {
    sid: string, 
    name: string, 
    avatar: string,
    roomId: string, 
    score: number, 
    ready: boolean, 
    P1: boolean
}[] = [];

export let rooms: {
    roomId: string, 
    mode: string,
    round: number, 
    players: number
}[] = [
    {roomId: "room 1", mode: "Easy", round: 1, players: 0},
    {roomId: "room 2", mode: "Easy", round: 1, players: 0},
    {roomId: "room 3", mode: "Easy", round: 1, players: 0},
];

export let serverSocket: string = "";