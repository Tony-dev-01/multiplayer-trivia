import { io } from 'socket.io-client';

// "undefined" means the URL will be computed from the `window.location` object
const URL = process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:5555';


export const socket = io('https://multiplayer-trivia.onrender.com', {
    autoConnect: false,
    rejectUnauthorized: false,
    transports: ["websocket", "polling"],
});