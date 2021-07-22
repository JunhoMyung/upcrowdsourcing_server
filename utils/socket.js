const utils = require("./utils");

function joinResponse(roomInfo, io, socket){
    for (var i = 0; i < Object.keys(roomInfo).length; i++){
        var roomName = Object.keys(roomInfo)[i];
        console.log(JSON.stringify(roomName));
        var participantList = roomInfo[roomName];
        if (participantList.length < 4){
            console.log(`One person joined at ${roomName}`);
            const playerName = utils.newPlayerName(participantList);
            socket.join(roomName);
            socket.roomName = roomName;
            socket.playerName = playerName;
            participantList.push(playerName);
            roomInfo[roomName] = participantList;
            socket.emit("name", playerName);
            io.to(roomName).emit("join", participantList);
            return;
        }
    }
    var newRoomName = utils.newRoomName(roomInfo);
    const playerName = utils.newPlayerName([]);
    console.log(`${newRoomName} has been hosted`);
    socket.join(newRoomName);
    socket.roomName = newRoomName;
    socket.playerName = playerName;
    roomInfo[roomName] = [playerName];
    socket.emit("name", playerName);
    io.to(newRoomName).emit("join", participantList);
}

module.exports.joinResponse = joinResponse;