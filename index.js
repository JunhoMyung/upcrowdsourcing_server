const app = require("express")();
const http = require("http").createServer(app);
let io = require("socket.io")(http, {
  cors: {
    origin: "*",
    methods: "*",
  },
});
io.on("connection", (socket) => {
  socket.on("disconnect", () => {
    console.log("disconnected");
  })
  socket.on("try", (greeting, greeting2) => {
    console.log("click")
  })
});

http.listen(8080, () => {
  console.log(`listening on port ${process.env.PORT}`);
});