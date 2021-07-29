const utils = require("./utils");

function joinResponse(roomInfo, io, socket){
    for (var i = 0; i < Object.keys(roomInfo).length; i++){
        var roomName = Object.keys(roomInfo)[i];
        var participantList = roomInfo[roomName]["participants"];
        if (participantList.length < 4){
            console.log(`One person joined at ${roomName}`);
            const playerName = utils.newPlayerName(participantList);
            socket.join(roomName);
            socket.roomName = roomName;
            socket.playerName = playerName;
            participantList.push(playerName);
            if (participantList.length == 4){
                roomInfo[roomName] = {
                    participants: participantList,
                    progress: "task",
                    accept: 0
                };
                io.to(roomName).emit("full");
            }
            else {
                roomInfo[roomName] = {
                    participants: participantList,
                    progress: "waiting",
                    accept: 0
                };
            }
            socket.emit("name", playerName);
            io.to(roomName).emit("changeMember", participantList);
            return;
        }
    }
    var newRoomName = utils.newRoomName(roomInfo);
    const playerName = utils.newPlayerName([]);
    console.log(`${newRoomName} has been hosted`);
    socket.join(newRoomName);
    socket.roomName = newRoomName;
    socket.playerName = playerName;
    roomInfo[newRoomName] = {
        participants: [playerName],
        progress: "waiting",
        accept: 0
    };
    socket.emit("name", playerName);
    io.to(newRoomName).emit("changeMember", [playerName]);
}

function exitResponse(roomInfo, io, socket){
    console.log(socket.roomName)
    console.log(roomInfo)
    if (socket.roomName){
        if(roomInfo[socket.roomName]){
            if (roomInfo[socket.roomName]["progress"] == "waiting"){
                var tempList = roomInfo[socket.roomName]["participants"]
                const index = tempList.indexOf(socket.playerName);
                if (index > -1) {
                    tempList.splice(index, 1);
                }
                roomInfo[socket.roomName]["participants"] = tempList;
                io.to(socket.roomName).emit("changeMember", tempList);
                console.log(roomInfo);
            }
            else if (roomInfo[socket.roomName]["progress"] == "task"){
                io.to(socket.roomName).emit("terminate");
                delete roomInfo[socket.roomName]; 
            }
        }
    }
}
function acceptResponse(roomInfo, io, socket) {
    if(roomInfo[socket.roomName]){
        var temp = roomInfo[socket.roomName]["accept"];
        roomInfo[socket.roomName]["accept"] = temp + 1;
        if ((temp + 1) === 4){
            io.to(socket.roomName).emit("allAccept");
        }
    }
}
    

module.exports.joinResponse = joinResponse;
module.exports.exitResponse = exitResponse;
module.exports.acceptResponse = acceptResponse;