const socket = io();

const playerGender =
localStorage.getItem("playerGender");


if(playerGender === "boy"){

    document.body.classList.add("boy");

}


if(playerGender === "girl"){

    document.body.classList.add("girl");

}

console.log("GAME SOCKET CREAT");

socket.on("connect", ()=>{

    console.log(
        "GAME SOCKET CONNECTAT:",
        socket.id
    );

});

socket.emit(
    "gameConnected",
    {

        gender:
        localStorage.getItem("playerGender"),

        name:
        localStorage.getItem("playerName")

    }
);



let answered=false;

let total=0;

let current=0;

let timer;

let seconds=20;



const question =
document.getElementById("question");


const buttons =
document.querySelectorAll(".answer");


const timerText =
document.getElementById("timer");


const bar =
document.getElementById("bar");

function updateTimer(){


    const circle =
    document.querySelector(".progressCircle");


    if(!circle)
        return;


    const max = 20;


    const value =
    251 - ((seconds / max) * 251);


    circle.style.strokeDashoffset =
    value;



    if(seconds <= 5){

        circle.style.stroke="#ff3344";

    }
    else if(seconds <=10){

        circle.style.stroke="#ffb300";

    }
    else{

        circle.style.stroke="#ff3f8e";

    }

}


function startTimer(){


clearInterval(timer);


seconds=20;


timerText.innerText=seconds;



timer=setInterval(()=>{


seconds--;

updateTimer();

timerText.innerText=seconds;



if(seconds<=0){


clearInterval(timer);


if(!answered){


answered=true;


socket.emit(
"answer",
-1
);


}


}



},1000);



}




socket.on(
"question",
(data)=>{

console.log("AM PRIMIT INTREBARE", data);

answered=false;


current=data.number;

total=data.total;



question.innerText=
data.data.text;



buttons.forEach((btn,index)=>{

    btn.innerText = data.data.options[index];

    btn.disabled = false;

    btn.classList.remove("correct");
    btn.classList.remove("wrong");

    btn.style.background = "";

    btn.onclick=()=>{

        if(answered)
            return;

        answered=true;

        clearInterval(timer);

        buttons.forEach(b=>{
            b.disabled=true;
        });


        const selected = Number(btn.dataset.id);


        if(selected === data.data.correct){

            btn.classList.add("correct");

        }else{

            btn.classList.add("wrong");

        }


        setTimeout(()=>{

            socket.emit(
                "answer",
                selected
            );

        },700);

    };

});



bar.style.width=
((current-1)/total)*100+"%";



startTimer();



}

);




socket.on(
"result",
(data)=>{


let percent =
Math.round(
(data.total / data.max) * 100
);



let message;


if(percent >= 90){

    message =
    "💖 Cuplu perfect!";

}
else if(percent >= 70){

    message =
    "❤️ Compatibilitate foarte bună!";

}
else if(percent >= 50){

    message =
    "💕 Mai aveți lucruri de descoperit!";

}
else{

    message =
    "💙 Aveți nevoie de mai multe momente împreună!";

}



document.body.innerHTML = `
document
.getElementById("details")
.onclick = ()=>{


let html = `

<h2>👦 Băiat</h2>

`;



data.details.boy.forEach((x,index)=>{

html += `

<div class="detail">

<b>${index+1}. ${x.question}</b>

<br>

Răspuns:
${x.answer}

<br>

${x.correct ? "✅ Corect" : "❌ Greșit"}

</div>

`;

});



html += `

<h2>👧 Fată</h2>

`;



data.details.girl.forEach((x,index)=>{

html += `

<div class="detail">

<b>${index+1}. ${x.question}</b>

<br>

Răspuns:
${x.answer}

<br>

${x.correct ? "✅ Corect" : "❌ Greșit"}

</div>

`;

});



document.querySelector(".result")
.innerHTML += html;


};

<div class="result">


<div class="heart">
❤️
</div>


<h1>
LOVE MATCH
</h1>


<h2>
${message}
</h2>



<div class="scores">


<div class="person boyScore">

<h3>👦 Băiat</h3>

<h1>
${data.boy}
</h1>

</div>



<div class="person girlScore">

<h3>👧 Fată</h3>

<h1>
${data.girl}
</h1>

</div>


</div>



<h2>

🏆 Scor final

</h2>


<div class="percent">

${percent}%

</div>


<p>

${data.total}/${data.max} răspunsuri corecte

</p>

<button id="details">
    🔍 View more details
</button>

</div>


`;



}

);
