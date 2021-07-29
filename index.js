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
  socket.on("send", (Name, Msg) => {
    console.log("message received");
    io.to(socket.roomName).emit("receiveMsg", {name: Name, msg: Msg});
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
});

http.listen(8080, () => {
  console.log(`listening on port 8080`);
});