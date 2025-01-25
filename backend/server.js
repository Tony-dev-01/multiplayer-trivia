const express = require('express');
const app = express();

const { rateLimiter } = require('./middlewares/rateLimiter.middleware.js');
const cors = require('cors');
const morgan = require('morgan');
const http = require("http");
const {v4: uuidV4} = require("uuid")
const ShortUniqueId = require('short-unique-id');
const jwt = require('jsonwebtoken');

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
const {joinRoom} = require('./handlers/room.handler.js')(io);
const {authentication} = require('./middlewares/auth.middleware.js');

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


// io.use(authentication(socket, next));
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
    // const roomUsers = [];
    // for (let [id, socket] of io.of("/").sockets) {
    //     roomUsers.push({
    //     roomUserID: id,
    //     username: socket.username,
    //     });
    // };

    // socket.emit("room-users", roomUsers);
    
    socket.on('join-room', joinRoom);
    socket.on('send-message', sendMessage);
    
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
    
    socket.onAny((event, ...args) => {
        console.log(event, args);
    });
});
        
        
        // io.use(function(socket, next){
            //     if (socket.handshake.query && socket.handshake.query.token){
                //         jwt.verify(socket.handshake.query.token, 'SECRET_KEY', function(err, decoded) {
                    //             if (err) return next(new Error('Authentication error'));
                    //             socket.decoded = decoded;
                    //             next();
//         });
//         }
//         else {
//         next(new Error('Authentication error'));
//         }    
//     })
//     .on('connection', function(socket) {
//       // Connection now authenticated to receive further events

//     socket.on('join-room', joinRoom);
//     socket.on('send-message', sendMessage);

//     socket.on('disconnect', () => {
//         console.log('A user disconnected');
//     });
//     });



httpServer.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
})

module.exports = app;