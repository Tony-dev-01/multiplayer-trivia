const { all } = require("../server");


module.exports = (io) => {

    const joinRoom = async function (gameRoomId, callback) {
        const socket = this;
        // const roomUsers = [];

        socket.join(gameRoomId); // join the room lobby

        const sockets = await io.in(gameRoomId).fetchSockets();

        const roomUsers = sockets.map(socket => {
            return {
                roomUserId: socket.id,
                username: socket.username,
                role: socket.role
            };
        })
        
        socket.to(gameRoomId).emit('user-connected', roomUsers);
        
        callback({
            status: 'ok',
            message: 'You joined the room.',
            roomUsers
        })
        
        console.log(socket.id + ' joined room ' + gameRoomId)
        
        
    };

    return {
        joinRoom, 
    }

};