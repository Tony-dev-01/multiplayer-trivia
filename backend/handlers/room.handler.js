const { MongoClient } = require('mongodb');
const ShortUniqueId = require('short-unique-id');
const {rooms} = require('../config/game.config');

const {database} = require('../config/app.config');

const shortUUID = new ShortUniqueId({dictionary: 'number', length: 10}).dict.join('');


module.exports = (io) => {

    const joinRoom = async function (gameRoomId, username, callback) {
        const socket = this;

        socket.join(gameRoomId); // join the room lobby

        const sockets = await io.in(gameRoomId).fetchSockets();

        const roomUsers = sockets.map(socket => {
            return {
                roomUserId: socket.id,
                username: socket.username
            };
        });
        
        socket.to(gameRoomId).emit('user-connected', username, roomUsers);
        
        callback({
            status: 'ok',
            message: 'You joined the room.',
            roomUsers
        })
        
        console.log(socket.username + ' joined room ' + gameRoomId)
    };

    const userInGame = async (gameRoomId, callback) => {
        const sockets = await io.in(gameRoomId).fetchSockets();

        const roomUsers = sockets.map(socket => {
            console.log(socket.role)
            return {
                roomUserId: socket.id,
                username: socket.username,
                role: socket.role
            };
        })

        console.log('call received')

        callback({
            status: 'OK',
            roomUsers
        })
    };

    return {
        joinRoom, 
        userInGame
    }

};