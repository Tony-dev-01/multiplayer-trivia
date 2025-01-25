

module.exports = (io) => {
    const sendMessage = function (gameRoomId, message, userId) {
        const socket = this;
        console.log(userId);
        socket.to(gameRoomId).emit('receive-message', message, userId);
    };

    return{
        sendMessage
    }
}