let io;

module.exports = {
  init: (server, corsOption) => {
    const { Server } = require("socket.io");
    io = new Server(server, { cors: corsOption });

    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error("Socket.io not initialized!");
    }

    return io;
  },
};
