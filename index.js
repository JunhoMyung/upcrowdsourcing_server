require("dotenv").config();
const app = require("express")();
const http = require("http").createServer(app);
const fs = require("fs");
// const options = {
//     key: fs.readFileSync('key.pem'),
//     cert: fs.readFileSync('cert.pem')
// };
const https = require("https").createServer(options, app);
const io = require("socket.io")(https, {
  cors: {
    origin: "*",
    methods: "*",
  },
});

http.listen(process.env.HTTP_PORT, () => {
  console.log(`listening on port ${process.env.HTTP_PORT}`);
});
// https.listen(process.env.HTTPS_PORT, () => {
//   console.log(`listening on port ${process.env.HTTPS_PORT}`);
// });

io.on('connection', function (socket) {
    console.log(' user connected');
    socket.on('disconnect', function () {
        console.log('a user disconnected');
    });
    socket.on('try', function(){
        console.log('connection')
    });
});