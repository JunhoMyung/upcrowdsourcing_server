const app = require("express")();
const http = require("http").createServer(app);
let io = require("socket.io")(http, {
  cors: {
    origin: "*",
    methods: "*",
  },
});
const connection = require("./router/connection");
const socketHelper = require("./utils/socket")
app.use("/connection", connection);

let roomInfo = {}

io.on("connection", (socket) => {
  socket.on("disconnect", () => {
    console.log("disconnected");
    socketHelper.exitResponse(
      roomInfo,
      io,
      socket
    )
  })
  socket.on("newMember", () => {
    socketHelper.joinResponse(
      roomInfo,
      io,
      socket
    )
  }) 
  socket.on("send", (Name, Msg, Time, Reply) => {
    console.log("message received");
    io.to(socket.roomName).emit("receiveMsg", {name: Name, msg: Msg, time: Time, reply: Reply});
  })
  socket.on("accept", () => {
    socketHelper.acceptResponse(
      roomInfo,
      io,
      socket
    )
  })
  socket.on("ready", () => {
    socketHelper.readyResponse(
      roomInfo,
      io,
      socket
    )
  })
  socket.on("Creative-Instruction", () => {
    socketHelper.creative_instruction(
      roomInfo,
      io,
      socket
    )
  })
  socket.on("submitTitle", (title) => {
    io.to(socket.roomName).emit("adtitle", title)
  })
  socket.on("submitDescription", (temp) => {
    io.to(socket.roomName).emit("addescription", temp)
  })
  socket.on("finish", () => {
    io.to(socket.roomName).emit("finish")
    roomInfo[socket.roomName]["progress"] = "survey";
  })
  socket.on("reaction", (emoji, name, num) => {
    io.to(socket.roomName).emit("reaction", emoji, name, num)
  })
  socket.on("refuse", () => {
    var tempList = roomInfo[socket.roomName]["participants"]
    const index = tempList.indexOf(socket.playerName);
    if (index > -1) {
      tempList.splice(index, 1);
      roomInfo[socket.roomName]["participants"] = tempList;
      roomInfo[socket.roomName]["ready"] = roomInfo[socket.roomName]["ready"] - 1;
      io.to(socket.roomName).emit("newMember", roomInfo[socket.roomName]["ready"]);
      socket.leave(socket.roomName)
    }
  })
});

http.listen(8080, () => {
  console.log(`listening on port 8080`);
});