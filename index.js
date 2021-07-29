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
  socket.on("Intel-Instruction", () => {
    socketHelper.intel_instruction(
      roomInfo,
      io,
      socket
    )
  })
  socket.on("AnswerInt", (answer, num) => {
    if(num == 0){
      console.log((answer,num));
      io.to(socket.roomName).emit("AnswerInt", num, answer, 85)
    }
    else if (num == 1){
      io.to(socket.roomName).emit("AnswerInt", num, answer, 13)
    }
    else if (num == 2){
      io.to(socket.roomName).emit("AnswerInt", num, answer, 21)
    }
    else if (num == 3){
      io.to(socket.roomName).emit("AnswerInt", num, answer, 277)
    }
    else if (num == 4){
      io.to(socket.roomName).emit("AnswerInt", num, answer, 121)
    }
  })
});

http.listen(8080, () => {
  console.log(`listening on port 8080`);
});