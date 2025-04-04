const express = require('express');
const app = express();
const { Server } = require("socket.io");

// Libraries
const cors = require('cors');
const morgan = require('morgan');
const http = require("http");
const {v4: uuidV4} = require("uuid")
const ShortUniqueId = require('short-unique-id');
const jwt = require('jsonwebtoken');

// Config
const {PORT, clientPort, db} = require('./config/app.config.js');
// const {io} = require('./config/socket.config.js');

// Middlewares
const { rateLimiter } = require('./middlewares/rateLimiter.middleware.js');
const {authentication} = require('./middlewares/auth.middleware.js');

// const routes = require('./routes');

// Controllers


const shortUUID = new ShortUniqueId({dictionary: 'number', length: 10}).dict.join('');
const httpServer = http.createServer(app);

const io = new Server(
    httpServer, 
    {
        cors: {
            origin: clientPort,
            methods: ["GET", "POST"],
            credentials: true
        }
    }
);

// socket handlers
const {sendMessage} = require('./handlers/message.handler.js')(io);
const {createRoom, verifyRoom, joinRoom, userInGame, userDisconnect} = require('./handlers/room.handler.js')(io);
const {startGame, getUserAnswer, getQuestionResults} = require('./handlers/game.handler.js')(io);

// Server setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("tiny"));
app.use(cors({
    origin: ["https://multiplayer-trivia.onrender.com", clientPort],
    methods: ["GET", "POST"],
    credentials: true,
}));
app.use(rateLimiter);

app.get('/', (req, res) => {
    res.status(200).json({
        status: 200,
        message: 'This is my endpoint.'
    })
})

// Catch all endpoint
app.get('*', (req, res) => {
    res.status(404).json({
        status: 404,
        message: 'This is a catch all. Wrong endpoint. Verify if you are using a valid endpoint.' 
    });
})

// Web socket
io.use((socket, next) => {
    const username = socket.handshake.auth.username;
    const role = socket.handshake.auth.role;
    if (!username) {
        return next(new Error("invalid username"));
    }
    socket.username = username;
    socket.role = role;
    next();
});


io.on('connection', (socket) => {
    socket.on('create-room', createRoom);
    socket.on('verify-room', verifyRoom);
    socket.on('join-room', joinRoom);
    socket.on('send-message', sendMessage);
    socket.on('user-in-game', userInGame);
    socket.on('start-game', startGame);
    socket.on('send-answer', getQuestionResults);
    socket.on('user-answer', getUserAnswer);
    
    // socket.on('delete-user', userDisconnect);
    socket.on('disconnect', () => userDisconnect(socket));
    
    socket.onAny((event, ...args) => {
        console.log(event, args);
    });
});

httpServer.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
})

module.exports = app;