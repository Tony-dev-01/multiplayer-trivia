const express = require('express');
const app = express();

const { rateLimiter } = require('./middlewares/rateLimiter.middleware.js');
const cors = require('cors');
const morgan = require('morgan');
const http = require("http");
const {v4: uuidV4} = require("uuid")
const ShortUniqueId = require('short-unique-id');

const config = require('./config/app.config.js');
// const routes = require('./routes');

const PORT = config.port || 4000;
const clientPort = config.clientPort || 5173;
const shortUUID = new ShortUniqueId({dictionary: 'number', length: 10}).dict.join('');

const { createServer } = require('node:http');
const { Server } = require("socket.io");

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
const {createRoom, joinRoom} = require('./handlers/room.handler.js')(io);

// data
let activeRooms = []; // store in mongo database later

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("tiny"));
app.use(cors({
    origin: clientPort,
    methods: ["GET", "POST"],
    credentials: true,
}));
app.use(rateLimiter);

app.get('/create-room', (req, res) => {
    // const newGameRoomId = shortUUID;

    // activeRooms.push(newGameRoomId);

    // console.log(activeRooms);

    res.send({status: 200, data: {gameRoomId: shortUUID}});
});

app.get('/:gameRoomId', (req, res) => {
    // check if room is active, otherwise redirect or throw error
    console.log('user logging into the room')
    res.json({status: 200, data: {roomId: req.params.gameRoomId}});
});

io.on('connection', (socket) => {
    socket.on('join-room', joinRoom);
    socket.on('send-message', sendMessage);
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });

});

httpServer.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
})

module.exports = app;