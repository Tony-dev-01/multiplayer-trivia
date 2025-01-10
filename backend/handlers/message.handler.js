

module.exports = (io) => {
    const sendMessage = function (gameRoomId, message) {
        const socket = this;
        console.log(message);
        socket.to(gameRoomId).emit('receive-message', message);
    };

    return{
        sendMessage
    }
}