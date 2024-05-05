const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const cors = require("cors");

const app = express();
app.use(
  cors({
    origin: "http://localhost:3001", // Allow only your client origin or use '*' for all origins
    credentials: true, // Allow cookies and sessions
  })
);

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3001",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("New client connected");

  // Join a specific room
  socket.on("joinRoom", ({ roomId }) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
  });

  // Handle sending a message to a specific room
  socket.on("sendMessage", ({ roomName, message }) => {
    io.to(roomName).emit("message", message); // Send message only to users in the room
    console.log(`Message sent to room ${roomName}: ${message.text}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});
const PORT = process.env.PORT || 3003;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
