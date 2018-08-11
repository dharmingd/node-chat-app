const express = require("express");
const http = require("http");
const path = require("path");
const { generateMessage } = require("./utils/generateMessage");
const { generateLocationMessage } = require("./utils/generateLocation");
const {isRealString} = require('./utils/validation');
const {Users} = require('./utils/users');
const publicPath = path.join(__dirname + "/../public");
const PORT = process.env.PORT || 3000;
const socketIO = require("socket.io");
const app = express();
app.use(express.static(publicPath));
const server = http.createServer(app);
var io = socketIO(server);
var users = new Users();
io.on("connection", socket => {
  console.log("New User connected");
  // socket.emit("newMessage", {
  //   from: "Admin",
  //   text: "Welcome to the chat App"
  // });
  //
  // socket.broadcast.emit(
  //   "newMessage",
  //   generateMessage("Admin", "New User Joined")
  // );

    socket.on('join', (params, callback) => {
        if (!isRealString(params.name) || !isRealString(params.room)) {
            return callback('Name and room name are required.');
        }

        socket.join(params.room);
        users.removeUser(socket.id);
        users.addUser(socket.id, params.name, params.room);

        io.to(params.room).emit('updateUserList', users.getUserList(params.room));

        socket.emit("newMessage", {
            from: "Admin",
            text: `Welcome to the chat App, ${params.name}`
        });

        socket.broadcast.to(params.room).emit("newMessage",generateMessage("Admin", `${params.name} has joined`));
        callback();
    });

  socket.on("createMessage", (message, callback) => {
    console.log("create message", message);
    var user = users.getUser(socket.id);
    if(user && isRealString(message.text)){
        io.to(user.room).emit("newMessage", generateMessage(user.name, message.text));
    }
    callback();
  });

  socket.on("createLocationMessage",(coords)=>{
      var user = users.getUser(socket.id);
      if(user){
          io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, coords.latitude, coords.longitude))
      }
  })

    socket.on("disconnect", () => {
        console.log("User was disconnected");
        var user = users.removeUser(socket.id);
        console.log(users.getUserList());
        io.to(user.room).emit('updateUserList', users.getUserList(user.room));
        io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left`));
    });

});

server.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
