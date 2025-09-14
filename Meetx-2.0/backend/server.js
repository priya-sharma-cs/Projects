const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const dashboardRoutes = require('./routes/dashboardController'); // Import the dashboard API
const messageRoutes = require('./routes/messageRoutes');  // Import the message routes

const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const { Server } = require("socket.io");
const path = require("path");

// Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

// DB Connection
require("./config-db");
dotenv.config();

const app = express();
const server = http.createServer(app); // ✅ server banaya for socket.io

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: "*", // ✅ allow frontend for dev
    methods: ["GET", "POST"]
  }
});

// Your Agora credentials
const APP_ID = process.env.AGORA_APP_ID; // Replace with your Agora App ID
const CHANNEL = 'test-channel'; // Channel Name
const TOKEN = null; // Token, null for no authentication

// Middlewares
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());

// Add this line inside your server.js where routes are defined
app.use('/api/message', messageRoutes);  // Add message routes

// Routes
app.use("/api", dashboardRoutes); // Connect the dashboard routes to your server
app.use("/api/auth", authRoutes);
app.use("/api/auth", userRoutes);
app.use('/api', messageRoutes);

let agoraClients = {}; // Track clients for Agora
let usersInRooms = {}; // To track users in each room for multiple users functionality

// Socket.IO - Handle connections
io.on('connection', (socket) => {
  console.log("User connected: " + socket.id);

  // Handle user joining a room (video call)
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);

    // Track users in the room
    if (!usersInRooms[roomId]) {
      usersInRooms[roomId] = [];
    }
    usersInRooms[roomId].push(socket.id);

    socket.to(roomId).emit('user_joined', socket.id);  // Notify others in the room
  });

  // Handle sending chat messages
  socket.on('send_message', (data) => {
    console.log(`Message in room ${data.meetingId}: ${data.message}`);
    io.to(data.meetingId).emit('receive_message', data);  // Broadcast message to room
  });

  // Agora - Join Room for Video Call
  socket.on('join_video', async (roomId) => {
    try {
      if (!agoraClients[roomId]) {
        // Initialize Agora client for this room
        agoraClients[roomId] = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
        await agoraClients[roomId].join(APP_ID, CHANNEL, TOKEN, null); // Join channel

        // Agora setup - Publish local track
        const localTrack = await AgoraRTC.createCameraVideoTrack();
        localTrack.play(`local-player-${socket.id}`); // Local player display
        await agoraClients[roomId].publish([localTrack]); // Publish track
      }

      socket.to(roomId).emit('user_joined_video', socket.id);  // Notify others for video
    } catch (error) {
      console.error("Error joining video room:", error);
    }
  });

  // Handle disconnect (clean up)
  socket.on('disconnect', () => {
    console.log("User disconnected: " + socket.id);

    // Clean up Agora client for room if no users are left
    for (let roomId in agoraClients) {
      if (agoraClients.hasOwnProperty(roomId)) {
        // Remove user from room tracking
        usersInRooms[roomId] = usersInRooms[roomId].filter(id => id !== socket.id);
        if (usersInRooms[roomId].length === 0) {
          // If no users left in the room, clean up Agora client
          agoraClients[roomId].leave();
          delete agoraClients[roomId];
        }

        // Emit user left event
        socket.to(roomId).emit('user_left_video', socket.id);
      }
    }
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
