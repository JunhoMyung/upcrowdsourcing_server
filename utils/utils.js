const randomstring = require("randomstring");

function newRoomName(roomInfo) {
    let rand = randomstring.generate(7);
    while (true) {
        if (!Object.keys(roomInfo).includes(rand)) {
            return rand;
        }
        rand = randomstring.generate(7);
    }
}

function newPlayerName(participantList) {
    const nameList = ["Bear", "Deer", "Bunny", "Squirrel", "Raccoon", "Owl"];
    for (var i = 0; i < nameList.length; i++){
        if (!participantList.includes(nameList[i])){
            return nameList[i];
        }
    }
}

module.exports.newRoomName = newRoomName;
module.exports.newPlayerName = newPlayerName;
