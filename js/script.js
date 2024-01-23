const noteContainer = document.querySelector('.note-body');
const createNote = document.querySelector('.btn-create-note');
let notes = document.querySelectorAll(".inbox-text");


function showNotes(){
    noteContainer.innerHTML = localStorage.getItem("notes");
}
showNotes();

function updateStorage(){
    localStorage.setItem("notes" , noteContainer.innerHTML)
}

createNote.addEventListener("click" , ()=>{
    let inputBox = document.createElement("p");
    let deleteImg = document.createElement("img");
    inputBox.className = "inbox-text";
    inputBox.setAttribute("contenteditable" , "true")
    deleteImg.src = './images/delete.png';
    noteContainer.appendChild(inputBox).appendChild(deleteImg)
})

noteContainer.addEventListener("click" , function(event){
    if(event.target.tagName === "IMG"){
        event.target.parentElement.remove();
        updateStorage();
    }
    else if(event.target.tagName === "P"){
        notes = document.querySelectorAll(".inbox-text");
        notes.forEach(nt =>{
            nt.onkeyup = function(){
                updateStorage();
            }
        })
    }
   
})