const utils = require("./utils");

function joinResponse(roomInfo, io, socket){
    for (var i = 0; i < Object.keys(roomInfo).length; i++){
        var roomName = Object.keys(roomInfo)[i];
        if( roomInfo[roomName]["progress"] == "waiting"){
            var participantList = roomInfo[roomName]["participants"];
            if (participantList.length < 6){
                console.log(`One person joined at ${roomName}`);
                const playerName = utils.newPlayerName(participantList);
                socket.join(roomName);
                socket.roomName = roomName;
                socket.playerName = playerName;
                participantList.push(playerName);
                roomInfo[roomName]["participants"] = participantList
                socket.emit("name", playerName, roomName);
                io.to(socket.roomName).emit("currentMember", participantList)
                return;
            }
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
        ready: 0,
        accept: 0,
        intel_instruction: 0,
        creative_instruction: 0,
    };
    socket.emit("name", playerName, newRoomName);
}

function exitResponse(roomInfo, io, socket){
    if (socket.roomName){
        if(roomInfo[socket.roomName]){
            if (roomInfo[socket.roomName]["progress"] == "waiting"){
                var tempList = roomInfo[socket.roomName]["participants"]
                const index = tempList.indexOf(socket.playerName);
                if (index > -1) {
                    tempList.splice(index, 1);
                }
                roomInfo[socket.roomName]["participants"] = tempList;
                if(socket.ready){
                    roomInfo[socket.roomName]["ready"] = roomInfo[socket.roomName]["ready"] - 1;
                    io.to(socket.roomName).emit("newMember", roomInfo[socket.roomName]["ready"]);
                }
            }
            else if (roomInfo[socket.roomName]["progress"] == "task"){
                if (roomInfo[socket.roomName]["participants"].length == 2){
                    io.to(socket.roomName).emit("terminate")
                    delete roomInfo[socket.roomName]; 
                }
                else {
                    var tempList = roomInfo[socket.roomName]["participants"]
                    const index = tempList.indexOf(socket.playerName);
                    if (index > -1) {
                        tempList.splice(index, 1);
                    }
                    roomInfo[socket.roomName]["participants"] = tempList;
                    io.to(socket.roomName).emit("currentMember", tempList)
                }
            }
            else if (roomInfo[socket.roomName]["progress"] == "survey"){
                var tempList = roomInfo[socket.roomName]["participants"]
                const index = tempList.indexOf(socket.playerName);
                if (index > -1) {
                    tempList.splice(index, 1);
                }
                roomInfo[socket.roomName]["participants"] = tempList;
                console.log(tempList)
                if (tempList.length == 0) {
                    delete roomInfo[socket.roomName];
                }
                console.log(roomInfo)
            }
        }
    }
}
function acceptResponse(roomInfo, io, socket) {
    if(roomInfo[socket.roomName]){
        var temp = roomInfo[socket.roomName]["accept"];
        roomInfo[socket.roomName]["accept"] = temp + 1;
        io.to(socket.roomName).emit("accept", temp+1);
        if ((temp + 1) == 6){
            io.to(socket.roomName).emit("allAccept");
            roomInfo[socket.roomName]["progress"] = "task";
        }
    }
}
function readyResponse(roomInfo, io, socket) {
    if(roomInfo[socket.roomName]){
        if (!socket.ready){
            var temp = roomInfo[socket.roomName]["ready"];
            roomInfo[socket.roomName]["ready"] = temp + 1;
            socket.ready = true;
            if ((temp + 1) == 6){
                io.to(socket.roomName).emit("full");
            }
            io.to(socket.roomName).emit("newMember", temp+1);
        }
    }
}
function creative_instruction(roomInfo, io, socket) {
    if(roomInfo[socket.roomName]){
        var temp = roomInfo[socket.roomName]["creative_instruction"];
        roomInfo[socket.roomName]["creative_instruction"] = temp + 1;
        if ((temp + 1) == roomInfo[socket.roomName]["participants"].length){
            io.to(socket.roomName).emit("Creative-Instruction-Done");
        }
        io.to(socket.roomName).emit("Creative-Instruction", temp+1); 
    }
}
    

module.exports.joinResponse = joinResponse;
module.exports.exitResponse = exitResponse;
module.exports.acceptResponse = acceptResponse;
module.exports.readyResponse = readyResponse;
module.exports.creative_instruction = creative_instruction;