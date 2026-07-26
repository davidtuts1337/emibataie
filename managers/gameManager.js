const { maleQuestions, femaleQuestions } = require("../questions");

function getQuestions(gender) {

    if (gender === "boy")
        return maleQuestions;

    return femaleQuestions;

}

function getQuestion(gender, index) {

    const list = getQuestions(gender);

    if (index >= list.length)
        return null;

    return list[index];

}

function nextQuestion(room, io) {

    room.currentQuestion++;

    if (room.currentQuestion >= room.totalQuestions) {

        return false;

    }

    sendQuestion(room, io);

    return true;

}

function sendQuestion(room, io) {

    const boyQuestion = getQuestion("boy", room.currentQuestion);
    const girlQuestion = getQuestion("girl", room.currentQuestion);

    io.to(room.boy.id).emit("question", {
        index: room.currentQuestion + 1,
        total: room.totalQuestions,
        question: boyQuestion.question,
        options: boyQuestion.options
    });

    io.to(room.girl.id).emit("question", {
        index: room.currentQuestion + 1,
        total: room.totalQuestions,
        question: girlQuestion.question,
        options: girlQuestion.options
    });

}

module.exports = {

    sendQuestion,
    nextQuestion

};