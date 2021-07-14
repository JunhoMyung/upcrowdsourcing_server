require("dotenv").config();
var app = require('express')();
var http = require('http').Server(app)
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});
io.on('connection', function(socket){
  console.log('a user connected');
});

http.listen(process.env.HTTP_PORT, () => {
    console.log(`listening on port ${process.env.HTTP_PORT}`);
});
https.listen(process.env.HTTPS_PORT, () => {
    console.log(`listening on port ${process.env.HTTPS_PORT}`);
});