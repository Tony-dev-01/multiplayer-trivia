// process requests before they reach the controllers
// like authentication, logging and request validation

module.exports = () => {
    const authentication = (socket, next) => {
        const username = socket.handshake.auth.username;
        console.log(username)

        if (!username) {
            return next(new Error("invalid username"));
        }
        socket.username = username;
        next();
    };

    return {
        authentication
    }
}