const socket = io();

function login(){

    const password =
    document.getElementById("password").value;


    socket.emit(
        "adminLogin",
        password
    );

}



socket.on("adminAccess",()=>{


    document.getElementById("login").style.display="none";


    document.getElementById("adminPanel").style.display="block";


});

document
.getElementById("start")
.onclick=()=>{

    socket.emit("startGame");

};



document
.getElementById("reset")
.onclick=()=>{

    socket.emit("resetGame");

};




function addQuestion(type){


let data;


if(type==="boy"){


data={

text:
boyQuestion.value,


options:[

boyA.value,
boyB.value,
boyC.value,
boyD.value

],


correct:
Number(boyCorrect.value)


};


}




if(type==="girl"){


data={

text:
girlQuestion.value,


options:[

girlA.value,
girlB.value,
girlC.value,
girlD.value

],


correct:
Number(girlCorrect.value)


};


}



socket.emit(
"addQuestion",
{
type,
data
}
);



}



socket.on(
"questions",
(data)=>{


render(
"boyList",
data.boy
);


render(
"girlList",
data.girl
);



}

);





function render(id,list){


let html="";

let type = id === "boyList" ? "boy" : "girl";


list.forEach((q,index)=>{


html += `

<div class="question">

<b>
${index+1}. ${q.text}
</b>


<br>


<button onclick="removeQuestion('${type}',${index})">
🗑️ Șterge
</button>


</div>

`;


});


document.getElementById(id).innerHTML = html;


}




function removeQuestion(type,index){


socket.emit(
"deleteQuestion",
{
type,
index
}
);


}