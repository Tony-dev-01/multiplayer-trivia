
module.exports = (io) => {

    const joinRoom = async function (gameRoomId, username, callback) {
        const socket = this;

        socket.join(gameRoomId); // join the room lobby

        const sockets = await io.in(gameRoomId).fetchSockets();

        const roomUsers = sockets.map(socket => {
            console.log(socket.role)
            return {
                roomUserId: socket.id,
                username: socket.username,
                role: socket.role
            };
        })
        
        socket.to(gameRoomId).emit('user-connected', username, roomUsers);
        
        callback({
            status: 'ok',
            message: 'You joined the room.',
            roomUsers
        })
        
        console.log(socket.id + ' joined room ' + gameRoomId)
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