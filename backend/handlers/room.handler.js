const { MongoClient } = require('mongodb');
const ShortUniqueId = require('short-unique-id');
const {rooms} = require('../config/game.config');

const {database} = require('../config/app.config');

const shortUUID = new ShortUniqueId({dictionary: 'number', length: 10}).dict.join('');


module.exports = (io) => {

    const joinRoom = async function (gameRoomId, username, callback) {
        const socket = this;

        try{
            if (!rooms[gameRoomId]){
                // Create new room in rooms object
                rooms[gameRoomId] = {"_id": gameRoomId, questions: [], users: {}, onlineUsers: 0};
            }
            socket.join(gameRoomId); // join the room lobby

            // update number of online players
            let updatedOnlineUsers = rooms[gameRoomId].onlineUsers;
            rooms[gameRoomId].onlineUsers = updatedOnlineUsers + 1;
            
            // add user to the room
            const newUser = { username, "score": 0, "numWrongAnswers": 0, "numCorrectAnswers": 0}
            rooms[gameRoomId].users[username] = newUser;

                
            const roomUsers = Object.entries(rooms[gameRoomId].users).map(([key, value]) => ({
                username: key,
                ...value
            }));

            console.log('joining room: ' + rooms[gameRoomId])

            // const sockets = await io.in(gameRoomId).fetchSockets();

            // const roomUsers = sockets.map(socket => {
            //     return {
            //         roomUserId: socket.id,
            //         username: socket.username
            //     };
            // });
            console.log(rooms)

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

    const userDisconnect = async (socket) => {
        // remove the user from room
        // console.log(socket.auth.username);
        // console.log(socket.auth.gameRoomId);
        const username = socket.handshake.auth.username;
        const gameRoomId = socket.handshake.auth.gameRoomId;
        // console.log(socket.username);
        // console.log(socket.gameRoomId);
        if (gameRoomId !== undefined){
            // update number of online members
            let updatedOnlineUsers = rooms[gameRoomId].onlineUsers;
            rooms[gameRoomId].onlineUsers = updatedOnlineUsers - 1;

            // delete user from room
            delete rooms[gameRoomId].users[username];

            const timeoutDelay = setTimeout(() => {
                // delete room after timeout if room is still empty
                clearTimeout(timeoutDelay);
                if (!rooms[gameRoomId].users[username]){
                    // notify the room if user is not back within 5 seconds
                    const roomUsers = Object.entries(rooms[gameRoomId].users).map(([key, value]) => ({
                        username: key,
                        ...value
                    }));
        
                    console.log(username + ' has left')
                    // emit a disconnection event to the room
                    socket.to(gameRoomId).emit('user-disconnected', username, roomUsers);
                } 
                
                if (rooms[gameRoomId].onlineUsers === 0){
                    // delete room if empty after 5 seconds
                    console.log('deleting room')
                    delete rooms[gameRoomId];
                };

            }, 5000);
            
            
        }

    };

    return {
        createRoom,
        verifyRoom,
        joinRoom, 
        userInGame,
        userDisconnect
    }

};