const express = require("express");
const http = require("http");
const path = require("path");
const { generateMessage } = require("./utils/generateMessage");
const { generateLocationMessage } = require("./utils/generateLocation");
const publicPath = path.join(__dirname + "/../public");
const PORT = process.env.PORT || 3000;
const socketIO = require("socket.io");
const app = express();
app.use(express.static(publicPath));
const server = http.createServer(app);
var io = socketIO(server);

io.on("connection", socket => {
  console.log("New User connected");
  socket.on("disconnect", () => {
    console.log("User was disconnected");
  });

  socket.emit("newMessage", {
    from: "Admin",
    text: "Welcome to the chat App"
  });

  socket.broadcast.emit(
    "newMessage",
    generateMessage("Admin", "New User Joined")
  );

  socket.on("createMessage", (message, callback) => {
    console.log("create message", message);
    io.emit("newMessage", generateMessage(message.from, message.text));
    callback();
  });

  socket.on("createLocationMessage",(coords)=>{
    io.emit('newLocationMessage', generateLocationMessage('Admin', coords.latitude, coords.longitude))
  })


});

server.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
