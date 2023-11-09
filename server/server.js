const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const connectionOptions = { useNewUrlParser: true, useUnifiedTopology: true };
mongoose.connect(process.env.MONGODB_URI, connectionOptions).then(() => {
  console.log('connected')
});

const userSchema = new mongoose.Schema({
  username: String,
});

const chatMessageSchema = new mongoose.Schema({
  roomId: String,
  user: String,
  msg: String,
  time: String,
});

const User = mongoose.model("User", userSchema);
const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);

const httpServer = http.createServer();


const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000", // Replace with your frontend URL
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  socket.on('new_user', async (get_username, callback) => {
    try {
      const existingUser = await User.findOne({ username: get_username });
      if (existingUser) {
        callback(false);
      } else {
        const user = new User({ username: get_username });
        await user.save();
        callback(true);
        updateNicknames();
      }
    } catch (error) {
      console.error("Error creating user:", error);
      callback(false);
    }
  });
  socket.on("join_room", async (roomId) => {
    socket.join(roomId);
    try {
      await ChatMessage.find({ roomId }).then((messages) => {
        socket.emit("load_messages", messages);
      });
    } catch (error) {
      console.error("Error retrieving chat messages:", error);
    }
  });

  socket.on("leave_room", async (roomId, nickname) => {
    socket.leave(roomId);
    updateNicknames();
    try {
      await User.findOneAndDelete({ username: nickname });
    } catch (error) {
      console.error("Error removing user:", error);
    }
  });

  socket.on("send_msg", async (data) => {
    const chatMessage = new ChatMessage({
      roomId: data.roomId,
      user: data.user,
      msg: data.msg,
      time: data.time,
    });

    try {
      await chatMessage.save();
      io.to(data.roomId).emit("receive_msg", data);
    } catch (error) {
      console.error("Error saving chat message:", error);
    }
  });

  socket.on("disconnect", async (nickname) => {
    updateNicknames();

    try {
      await User.findOneAndDelete({ username: nickname });
    } catch (error) {
      console.error("Error removing user:", error);
    }
  });
});
function updateNicknames() {
  User.find({}).sort({ _id: 1 }).exec().then((users) => {
    const usernames = users.map(user => user.username);
    io.emit('usernames', usernames);
  });
}
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.io server is running on port ${PORT}`);
});