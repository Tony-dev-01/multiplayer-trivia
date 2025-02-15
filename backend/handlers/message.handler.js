const { RateLimiterMemory } = require('rate-limiter-flexible');


module.exports = (io) => {
    const rateLimiter = new RateLimiterMemory(
    {
        points: 5, // 5 points
        duration: 10, // per 10 seconds
    });
    
    const sendMessage = async function (gameRoomId, message, username, callback) {
        try{
            const socket = this;
            console.log(username)
            await rateLimiter.consume(socket.handshake.address);
            socket.to(gameRoomId).emit('receive-message', message, username);
            callback({
                status: 'OK',
                message,
                username
            });
        } catch(err){
            callback({
                status: 'ERROR',
                message: 'Too many messages.',
                timeRemaining: err.msBeforeNext
            })
            console.log('too many messages');
        }
    };

    return{
        sendMessage
    }
}