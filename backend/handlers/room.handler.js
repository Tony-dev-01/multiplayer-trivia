const { MongoClient } = require('mongodb');
const ShortUniqueId = require('short-unique-id');
const {rooms} = require('../config/game.config');

const {database} = require('../config/app.config');

const shortUUID = new ShortUniqueId({dictionary: 'number', length: 10}).dict.join('');


module.exports = (io) => {

    const joinRoom = async function (gameRoomId, username, callback) {
        const socket = this;

        try{
        socket.join(gameRoomId); // join the room lobby

        // update number of online players
        if (rooms[gameRoomId].users[username] === undefined){
            let updatedOnlineUsers = rooms[gameRoomId].onlineUsers + 1;
            rooms[gameRoomId].onlineUsers = updatedOnlineUsers;
            
            // add user to the room
            const newUser = { username, "score": 0, "numWrongAnswers": 0, "numCorrectAnswers": 0}
            rooms[gameRoomId].users[username] = newUser;
        } else {
            console.log('user already in room');
        }
            
        const roomUsers = Object.entries(rooms[gameRoomId].users).map(([key, value]) => ({
            username: key,
            ...value
        }));


        // const sockets = await io.in(gameRoomId).fetchSockets();

        // const roomUsers = sockets.map(socket => {
        //     return {
        //         roomUserId: socket.id,
        //         username: socket.username
        //     };
        // });

        socket.to(gameRoomId).emit('user-connected', username, roomUsers);

        callback({
            status: 'ok',
            message: 'You joined the room.',
            roomUsers
        })
        
        console.log(socket.username + ' joined room ' + gameRoomId)
        } catch(err){
            callback({
                status: "ERROR",
                err
            })
        }
    };

    const createRoom = async (callback) => {
        // Generate game room ID
        const gameRoomId = Number(shortUUID);

        // Create new room in rooms object
        rooms[gameRoomId] = {"_id": gameRoomId, questions: [], users: {}, onlineUsers: 0};

        callback({
            status: 'OK',
            gameRoomId
        })
    };

    const verifyRoom = (gameRoomId, callback) => {
        if (rooms[gameRoomId]){
            console.log('room exists');
            callback({status: 'OK'});
        } else {
            callback({status: 'ERROR', message: 'Please enter a valid game ID.'})
        }
    }

    const userInGame = async (gameRoomId, callback) => {

        const roomUsers = Object.entries(rooms[gameRoomId].users).map(([key, value]) => ({
            username: key,
            ...value
        }));

        callback({
            status: 'OK',
            roomUsers
        })
    };

    const userDisconnect = async (gameRoomId, username) => {
        // remove the user from room
        if (gameRoomId !== undefined){
                // let updatedOnlineUsers = rooms[gameRoomId].onlineUsers;
                console.log(rooms)
                // rooms[gameRoomId].onlineUsers = updatedOnlineUsers - 1;
                // emit a disconnection event to the room
                
                // console.log(rooms[gameRoomId]);
                console.log('A user disconnected');
            }

        // socket.to(gameRoomId).emit('user-disconnected', username)
    };

    return {
        createRoom,
        verifyRoom,
        joinRoom, 
        userInGame,
        userDisconnect
    }

};