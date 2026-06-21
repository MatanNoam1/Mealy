// Socket.IO setup. Each client joins a private room named `user:<id>` after
// login, so the API can push share/update/unshare events to a specific user.
//
// Custom events (in addition to the built-in connect/disconnect):
//   incoming (client -> server): user:join
//   outgoing (server -> client): recipe:shared, recipe:unshared,
//                                recipe:updated, recipe:created
module.exports = function initSockets(io) {
  io.on('connection', (socket) => {
    console.log(`[socket] connected: ${socket.id}`);

    // Client announces which user it is; we put the socket in that user's room.
    socket.on('user:join', (userId) => {
      const id = parseInt(userId, 10);
      if (!Number.isNaN(id)) {
        socket.join(`user:${id}`);
        console.log(`[socket] ${socket.id} joined room user:${id}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[socket] disconnected: ${socket.id}`);
    });
  });
};
