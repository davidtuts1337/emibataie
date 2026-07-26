const { maleQuestions, femaleQuestions } = require("../questions");

const rooms = new Map();

function createRoom(roomCode, boy, girl) {

    const room = {

        code: roomCode,

        boy: {
            id: boy.id,
            name: boy.name,
            answers: [],
            finished: false
        },

        girl: {
            id: girl.id,
            name: girl.name,
            answers: [],
            finished: false
        },

        currentQuestion: 0,

        totalQuestions: maleQuestions.length,

        score: 0,

        started: false,

        finished: false

    };

    rooms.set(roomCode, room);

    return room;

}

function getRoom(code) {

    return rooms.get(code);

}

function deleteRoom(code) {

    rooms.delete(code);

}

function getAllRooms() {

    return [...rooms.values()];

}

function saveAnswer(roomCode, socketId, answer) {

    const room = rooms.get(roomCode);

    if (!room)
        return;

    if (room.boy.id === socketId) {

        room.boy.answers.push(answer);

        if (room.boy.answers.length >= room.totalQuestions)
            room.boy.finished = true;

    }

    if (room.girl.id === socketId) {

        room.girl.answers.push(answer);

        if (room.girl.answers.length >= room.totalQuestions)
            room.girl.finished = true;

    }

}

function calculateScore(roomCode) {

    const room = rooms.get(roomCode);

    if (!room)
        return 0;

    let score = 0;

    for (let i = 0; i < room.totalQuestions; i++) {

        if (room.boy.answers[i] === room.girl.answers[i]) {

            score++;

        }

    }

    room.score = score;

    room.finished = true;

    return score;

}

module.exports = {

    createRoom,

    getRoom,

    deleteRoom,

    getAllRooms,

    saveAnswer,

    calculateScore

};