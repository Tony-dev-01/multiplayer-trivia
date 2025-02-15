
const { Server } = require("socket.io")

const httpServer = http.createServer(app);

    const io = new Server(
        httpServer, 
        {
            cors: {
                origin: clientPort,
                methods: ["GET", "POST"],
                credentials: true
            }
        }
    );

module.exports = {
    httpServer,
    io
}