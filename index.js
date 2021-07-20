const app = require("express")();
const http = require("http").createServer(app);
let io = require("socket.io")(http, {
  cors: {
    origin: "*",
    methods: "*",
  },
});
const connection = require("./router/connection");
app.use("/connection", connection);

io.on("connection", (socket) => {
  socket.on("disconnect", () => {
    console.log("disconnected");
  })
  socket.on("send", (Name, Msg /*Timestamp*/) => {
    console.log("message received");
    socket.emit("receiveMsg", Name, Msg);
  })
});

http.listen(8080, () => {
  console.log(`listening on port ${process.env.PORT}`);
});