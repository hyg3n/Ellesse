const express = require("express");
const http = require('http');
const socketIo = require('socket.io');
const cors = require("cors");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const jwt = require("jsonwebtoken");

const usersRouter = require("./routes/users");
const authRouter = require("./routes/auth");
const bookingsRouter = require('./routes/bookings');
const messagesRouter = require('./routes/messages');
const serviceCategoriesRouter = require('./routes/serviceCategories');
const providersByCategoryRouter = require('./routes/providersByCategory');

const notFoundHandler = require("./middlewares/notFoundHandler");
const errorHandler = require("./middlewares/errorHandler");
const { storeMessage } = require('./models/messagesModel');

require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());

// Debugging: Check if JWT_SECRET is loaded
console.log("JWT_SECRET:", process.env.JWT_SECRET);

// Logging Middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/api/users", usersRouter); 
app.use("/api/auth", authRouter); 
app.use('/api/bookings', bookingsRouter);
app.use('/api/messages', messagesRouter); 
app.use('/api/service_categories', serviceCategoriesRouter);
app.use('/api/providersByCategory', providersByCategoryRouter);

// 404 Handler
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);


// Create HTTP server and attach Socket.IO
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*" }
});

// Socket.IO authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication error: No token provided."));
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return next(new Error("Authentication error: Invalid token."));
    socket.user = decoded; // Attach user data from token to socket
    next();
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected via Socket.IO, user id:', socket.user.id);
  
  // Join a specific room (e.g., booking room)
  socket.on('joinRoom', (roomId) => {
    socket.join(roomId.toString());
    console.log(`User ${socket.user.id} joined room ${roomId}`);
  });

  // Listen for sendMessage event
  socket.on('sendMessage', async (data) => {
    // data should include: booking_id, receiver_id, message
    const { booking_id, receiver_id, message } = data;
    const sender_id = socket.user.id;
    try {
      const savedMessage = await storeMessage({ booking_id, sender_id, receiver_id, message });
      // Broadcast the message only to clients in the room with the booking_id
      io.to(booking_id.toString()).emit('receiveMessage', savedMessage);
      console.log(`Message from ${sender_id} in room ${booking_id} broadcasted.`);
    } catch (err) {
      console.error("Error storing message:", err);
      socket.emit('errorMessage', { error: 'Failed to send message.' });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.user.id);
  });
});


// Start the server
server.listen(port, () => {
  console.log(`Backend API is running on http://localhost:${port}`);
});
