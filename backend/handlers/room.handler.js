

module.exports = (io) => {
    const createRoom = function (callback) {
        callback({
            status: 'ok',
            gameRoomId: shortUUID
        })
    };

    const joinRoom = function (gameRoomId, callback) {
        const socket = this;

        socket.join(gameRoomId);
        console.log(socket.id + ' joined room ' + gameRoomId)
        socket.to(gameRoomId).emit('user-connected', socket.id);
        callback({
            status: 'ok',
            message: 'You joined the room.'
        })
    };

    return {
        joinRoom, 
        createRoom
    }

};