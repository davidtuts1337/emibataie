const socket = io();


let gender = null;



function selectGender(type){


    gender = type;


    document
    .getElementById("boyBtn")
    .classList.remove("selected");


    document
    .getElementById("girlBtn")
    .classList.remove("selected");



    if(type==="boy"){

        document
        .getElementById("boyBtn")
        .classList.add("selected");

    }


    if(type==="girl"){

        document
        .getElementById("girlBtn")
        .classList.add("selected");

    }


}



function joinGame(){


    const name =
    document.getElementById("name").value;



    if(!name || !gender){

        alert(
            "Completează numele și genul!"
        );

        return;

    }



    socket.emit(
        "join",
        {

            name,
            gender

        }
    );


}



socket.on(
"joined",
(message)=>{


    localStorage.setItem(
        "playerGender",
        gender
    );


    localStorage.setItem(
        "playerName",
        document.getElementById("name").value
    );


    document
    .getElementById("status")
    .innerText=message;


}
);



socket.on(
"playersReady",
()=>{


    document
    .getElementById("status")
    .innerText=
    "❤️ Sunteți conectați! Așteptați startul...";


}

);



socket.on(
"startQuestions",
()=>{


    window.location.href="/game";


}

);



socket.on(
"errorMessage",
(msg)=>{


    alert(msg);


}

);