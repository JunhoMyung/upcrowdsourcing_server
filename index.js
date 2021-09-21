require("dotenv").config();
const app = require("express")();
const http = require("http").createServer(app);
const fs = require("fs");
const options = {
  key: fs.readFileSync(
    "/etc/letsencrypt/live/up-kixlabserver.us/privkey.pem"
  ),
  cert: fs.readFileSync(
    "/etc/letsencrypt/live/up-kixlabserver.us/fullchain.pem"
  ),
};
const https = require("https").createServer(options, app);
const io = require("socket.io")(https, {
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
  socket.on("confirmation", (playerName, title, description) => {
    io.to(socket.roomName).emit("confirmation", playerName)
    roomInfo[socket.roomName]["title"] = title;
    roomInfo[socket.roomName]["description"] = description;
    roomInfo[socket.roomName]["agree"] = 0;
    roomInfo[socket.roomName]["disagree"] = 0;
  })
  socket.on("finish", (title, description) => {
    if (roomInfo[socket.roomName]["progress"] == "survey"){
      console.log(title,description)
      io.to(socket.roomName).emit("finish", title, description)
      roomInfo[socket.roomName]["progress"] = "survey";
    }
  })
  socket.on("reaction", (emoji, name, num) => {
    io.to(socket.roomName).emit("reaction", emoji, name, num)
  })
  socket.on("agree", (player) => {
    io.to(socket.roomName).emit("agree", player)
    if (roomInfo[socket.roomName]["agree"]){
      const temp = roomInfo[socket.roomName]["agree"]
      roomInfo[socket.roomName]["agree"] = temp + 1
      if ((temp + 1) >= (roomInfo[socket.roomName]["participants"].length / 2)) {
        io.to(socket.roomName).emit("finish", roomInfo[socket.roomName]["title"], roomInfo[socket.roomName]["description"])
        roomInfo[socket.roomName]["progress"] = "survey";
      }
      else if((temp + 1 + roomInfo[socket.roomName]["disagree"]) == roomInfo[socket.roomName]["participants"].length){
        io.to(socket.roomName).emit("nonagreement")
      }
    }
    else{
      roomInfo[socket.roomName]["agree"] = 1
    }
    
  })
  socket.on("disagree", (player) => {
    io.to(socket.roomName).emit("disagree", player)
    const temp = roomInfo[socket.roomName]["disagree"]
    roomInfo[socket.roomName]["disagree"] = temp + 1
    if (temp + 1 > (roomInfo[socket.roomName]["participants"].length / 2)) {
      io.to(socket.roomName).emit("nonagreement")
    }
    else if((temp + 1 + roomInfo[socket.roomName]["agree"]) == roomInfo[socket.roomName]["participants"].length){
      io.to(socket.roomName).emit("nonagreement")
    }
  })
  socket.on("refuse", () => {
    if (socket.roomName != null){
      const temp = socket.roomName
      var tempList = roomInfo[temp]["participants"]
      const index = tempList.indexOf(socket.playerName);
      if (index > -1) {
        tempList.splice(index, 1);
        roomInfo[temp]["participants"] = tempList;
      }
      roomInfo[temp]["ready"] = roomInfo[temp]["ready"] - 1;
      roomInfo[temp]["accept"] = 0;
      socket.leave(temp)
      io.to(temp).emit("newMember", roomInfo[temp]["ready"]);
    }
    socket.roomName = null;
  })
  socket.on("acceptfail", () => {
    roomInfo[socket.roomName]["accept"] = 0;
  })
  socket.on("end-waiting", () => {
    if (socket.roomName != null){
      const temp = socket.roomName
      var tempList = roomInfo[temp]["participants"]
      const index = tempList.indexOf(socket.playerName);
      if (index > -1) {
        tempList.splice(index, 1);
        roomInfo[temp]["participants"] = tempList;
      }
      roomInfo[temp]["ready"] = roomInfo[temp]["ready"] - 1;
      socket.leave(temp)
      io.to(temp).emit("newMember", roomInfo[temp]["ready"]);
    }
    socket.roomName = null;
  })
});

http.listen(process.env.HTTP_PORT, () => {
  console.log(`listening on port ${process.env.HTTP_PORT}`);
});
https.listen(process.env.HTTPS_PORT, () => {
  console.log(`listening on port ${process.env.HTTPS_PORT}`);
});