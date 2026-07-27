const express = require("express");
const http = require("http");
const path = require("path");
const fs = require("fs");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;


// ===============================
// GAME STATE (TEMPORAR)
// ===============================

const players = {};

const questionsFile = "./questions.json";


function loadQuestions(){

    if(!fs.existsSync(questionsFile)){

        return {
            boy:[],
            girl:[]
        };

    }


    return JSON.parse(
        fs.readFileSync(
            questionsFile,
            "utf8"
        )
    );

}



function saveQuestions(){

    fs.writeFileSync(
        questionsFile,
        JSON.stringify(
            {
                boy:game.boyQuestions,
                girl:game.girlQuestions
            },
            null,
            4
        )
    );

}
const savedQuestions = loadQuestions();

const game = {

    boy: null,
    girl: null,

    boyQuestions: savedQuestions.boy,
    girlQuestions: savedQuestions.girl,

    started:false,

    boyIndex:0,
    girlIndex:0,

    boyScore:0,
    girlScore:0,

    boyFinished:false,
    girlFinished:false,

    waitingFinish:{
        boy:false,
        girl:false
    },

    answerHistory:{
        boy:[],
        girl:[]
    }

};


// ===============================
// EXPRESS
// ===============================

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req,res)=>{
    res.sendFile(
        path.join(__dirname,"public","index.html")
    );
});

app.get("/game",(req,res)=>{
    res.sendFile(
        path.join(__dirname,"public","game.html")
    );
});

app.get("/admin",(req,res)=>{
    res.sendFile(
        path.join(__dirname,"public","admin.html")
    );
});


// ===============================
// SOCKET
// ===============================

io.on("connection",(socket)=>{


    console.log(
        "NOU SOCKET:",
        socket.id
    );


    console.log(
        "Connected:",
        socket.id
    );



    // ===============================
    // LOGIN PLAYER
    // ===============================


    socket.on("join",({name,gender})=>{


        if(gender==="boy"){


            if(game.boy){

                socket.emit(
                    "errorMessage",
                    "Există deja un băiat conectat!"
                );

                return;

            }


            game.boy = {

                id:socket.id,
                name:name

            };


            players[socket.id]="boy";


            socket.emit(
                "joined",
                "Ai intrat ca băiat"
            );


        }



        if(gender==="girl"){


            if(game.girl){

                socket.emit(
                    "errorMessage",
                    "Există deja o fată conectată!"
                );

                return;

            }


            game.girl = {

                id:socket.id,
                name:name

            };


            players[socket.id]="girl";


            socket.emit(
                "joined",
                "Ai intrat ca fată"
            );


        }


        checkPlayers();


    });





    // ===============================
    // ADMIN LOGIN
    // ===============================


    socket.on("adminLogin",(password)=>{


        if(password==="admin"){
            socket.join("admin");

            socket.emit(
                "adminAccess"
            );
            socket.emit(
                "questions",
                {
                    boy: game.boyQuestions,
                    girl: game.girlQuestions
                }
            );
            console.log(game.boyQuestions);
            console.log(game.girlQuestions);
        }
        else{

            socket.emit(
                "errorMessage",
                "Parolă greșită"
            );

        }


    });





    // ===============================
    // ADD QUESTION
    // ===============================


    socket.on("addQuestion",(data)=>{


        if(data.type==="boy"){


            game.boyQuestions.push(
                data.data
            );

            saveQuestions();
        }



        if(data.type==="girl"){


            game.girlQuestions.push(
                data.data
            );

            saveQuestions();
        }



        console.log(
            "Întrebare adăugată",
            data.type
        );


        socket.emit(
            "questions",
            {

                boy:game.boyQuestions,

                girl:game.girlQuestions

            }
        );


    });





    // ===============================
    // DELETE QUESTION
    // ===============================


    socket.on("deleteQuestion",(data)=>{


        if(data.type==="boy"){


            game.boyQuestions.splice(
                data.index,
                1
            );

            saveQuestions();
        }



        if(data.type==="girl"){


            game.girlQuestions.splice(
                data.index,
                1
            );
            saveQuestions();

        }


    });





    // ===============================
    // START GAME
    // ===============================


    socket.on("startGame",()=>{


        if(!game.boy || !game.girl){


            socket.emit(
                "errorMessage",
                "Nu sunt conectați ambii jucători"
            );


            return;


        }



        game.started=true;



        io.to(game.boy.id)
        .emit(
            "startQuestions"
        );



        io.to(game.girl.id)
        .emit(
            "startQuestions"
        );


    });





    // ===============================
    // GAME PAGE CONNECT
    // ===============================


    socket.on("gameConnected",(player)=>{


        console.log(
            "RECONNECT PLAYER:",
            player
        );



        if(player.gender==="boy"){


            game.boy.id=socket.id;


            players[socket.id]="boy";



            if(game.started){

                sendQuestion(
                    socket.id,
                    "boy"
                );

            }


        }





        if(player.gender==="girl"){


            game.girl.id=socket.id;


            players[socket.id]="girl";



            if(game.started){

                sendQuestion(
                    socket.id,
                    "girl"
                );

            }


        }



    });





    // ===============================
    // ANSWER
    // ===============================


    socket.on("answer",(answer)=>{


        if(game.boy && socket.id===game.boy.id){


            checkAnswer(
                "boy",
                answer
            );


        }



        if(game.girl && socket.id===game.girl.id){


            checkAnswer(
                "girl",
                answer
            );


        }


    });





    // ===============================
    // DISCONNECT
    // ===============================


    socket.on("disconnect",()=>{


        console.log(
            "Disconnected:",
            socket.id
        );



        setTimeout(()=>{


            if(game.boy?.id===socket.id){

                game.boy=null;

                console.log(
                    "Băiat eliminat"
                );

            }



            if(game.girl?.id===socket.id){

                game.girl=null;

                console.log(
                    "Fată eliminată"
                );

            }



        },5000);



    });


});


// ===============================
// FUNCTIONS
// ===============================


function checkPlayers(){


    if(game.boy && game.girl){


        io.emit(
            "playersReady"
        );


    }


}



function sendQuestion(id,type){


    let index;

    let list;

    console.log(
        "Trimit intrebare:",
        type,
        list
    );

    if(type==="boy"){

        index=game.boyIndex;
        list=game.boyQuestions;

    }


    if(type==="girl"){

        index=game.girlIndex;
        list=game.girlQuestions;

    }



    if(index>=list.length){

        finish(type);
        return;

    }


    console.log(
        "QUESTION",
        type,
        index,
        list[index]
    );
    io.to(id)
    .emit(
        "question",
        {
            number:index+1,
            total:list.length,
            data:list[index]
        }
    );


}



function checkAnswer(type,answer){


    let question;


    if(type==="boy"){

        question=
        game.boyQuestions[
            game.boyIndex
        ];

    }


    if(type==="girl"){

        question=
        game.girlQuestions[
            game.girlIndex
        ];

    }



    const correct = answer === question.correct;
    
    
    if(correct){
    
        if(type==="boy")
            game.boyScore++;
    
        if(type==="girl")
            game.girlScore++;
    
    }
    
    
    // SALVARE RASPUNS
    game.answerHistory[type].push({
    
        question: question.text,
    
        options: question.options,
    
        answer: answer,
    
        correctAnswer: question.correct,
    
        correct: correct,
    
        time: new Date().toLocaleTimeString()
    
    });

    io.to("admin").emit(
    "liveAnswer",
    {
        player: type,
        question: question.text,
        answer: answer,
        correct: correct
    }
);


    if(type==="boy")
        game.boyIndex++;


    if(type==="girl")
        game.girlIndex++;



    if(type==="boy")
        sendQuestion(game.boy.id,"boy");


    if(type==="girl")
        sendQuestion(game.girl.id,"girl");


}



function finish(type){

    game.waitingFinish[type] = true;


    console.log(
        type,
        "a terminat"
    );


    // asteapta celalalt jucator
    if(
        !game.waitingFinish.boy ||
        !game.waitingFinish.girl
    ){

        return;

    }


    const total =
    game.boyQuestions.length +
    game.girlQuestions.length;


    const score =
    game.boyScore +
    game.girlScore;



    io.emit(
        "result",
        {
            boy: game.boyScore,
            girl: game.girlScore,
            total:score,
            max:total
        }
    );

}


// ===============================
// START
// ===============================


server.listen(PORT,()=>{


    console.log(
`
=========================
 ❤️ LOVE MATCH ONLINE ❤️
 http://localhost:${PORT}
=========================
`
    );


});
