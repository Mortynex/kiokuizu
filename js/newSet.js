const questionList = document.querySelector('.questionList');
let lastQuestion = document.querySelector('.question');

const saveBtn = document.querySelector('#saveBtn')
const canBeReversedCheckBox = document.querySelector("#canBeReversedCB")
const mainName = document.querySelector("#title");

import {addNewSet , getSetById} from './database.js'

const searchParams = new URLSearchParams(location.search);
const editMode = searchParams.get("edit") === "" ? true : false;
const viewMode = searchParams.get("view") === "" ? true : false;
const editID = +(searchParams.get("id"));

(async ()=>{
    if(!editMode && !viewMode) return
    const set = await getSetById(editID);
    if(!set) return
    const { questions, name, options } = set;
    mainName.value = name;
    canBeReversedCheckBox.checked = options.reversable;
    document.querySelector(".question")?.remove();
    for(const question of questions){
        addQuestionToList(
            question.question,
            question.answers.join(" || "),
            false
        )
    }
    updateListener(false);

    if(viewMode){
        const inputs = [...document.querySelectorAll("input")]
        inputs.forEach(input => {
            input.readOnly = true;
            input.style.outline = "none";
            if(input.type === "checkbox"){
                input.addEventListener("click",(e)=>e.preventDefault())
            }
        })
        saveBtn.innerHTML = "Edit"
    }
})()



inputMovement()
function inputMovement(){
    const allInputs = [...document.querySelectorAll(".input")]
    
    for(let i = 0; i < allInputs.length; i++){
        const input = allInputs[i]
        function keyMoveHandler(e){
            const code = e.code;
            const inputs = [...document.querySelectorAll(".input")]
            const rnIdx = inputs.findIndex((inp)=>inp === e.target)
            const before = inputs[rnIdx - 1]
            const after = inputs[rnIdx + 1]
            if((code === "Enter" || code === "ArrowDown") ){
                if(after){
                    setCaretPosition(after, after.value.length)
                }
                else{
                    updateListener();
                    keyMoveHandler(e);
                }
            }
            else if(code === "ArrowUp" && before){
                setCaretPosition(before, before.value.length)
                e.preventDefault();
            }
            else if(code === "Backspace" && e.target.value.length === 0 && before){
                setCaretPosition(before, before.value.length)
                e.preventDefault();
            }
            
        }
        input.addEventListener("keydown",keyMoveHandler)
    }
}

function setCaretPosition(ctrl, pos) {
    // Modern browsers
    
    if (ctrl.setSelectionRange) {
      ctrl.focus();
      ctrl.setSelectionRange(pos, pos);
    
    // IE8 and below
    } else if (ctrl.createTextRange) {
      var range = ctrl.createTextRange();
      range.collapse(true);
      range.moveEnd('character', pos);
      range.moveStart('character', pos);
      range.select();
    }
  }
  


tippy('#errorIcon');
addListeners();

function addListeners(){
    
    const inputs = [...lastQuestion.querySelectorAll('input')]
    for(const input of inputs){
        input.addEventListener('input',updateListener)
    }
}
function updateListener(scroll = true){
        removeLastListeners();
        addQuestionToList("","",scroll)
}
function addQuestionToList(inp1, inp2, scroll = true){
        const n = [...questionList.childNodes].length - 1
        const newQuestion = document.createElement('li')
        newQuestion.classList.add('question')
        newQuestion.innerHTML = getQuestionCode(n ,inp1 ,inp2);
        newQuestion.querySelector('#remove').addEventListener('click',(e)=>{
            if(newQuestion === lastQuestion) return
            newQuestion.remove();
            const questions = [...questionList.childNodes].filter(node => node.nodeName !== "#text");
            for(let i = 0; i < questions.length; i++){
                const question = questions[i]
                const nid = question.querySelector('#nid');
                if(!nid) return
                nid.innerHTML = (i+1) + "."
            }
        })
        questionList.append(newQuestion);
        
        if(scroll){
            newQuestion.scrollIntoView(false)
        }
        
        lastQuestion = newQuestion;
        inputMovement();
        addListeners();
}
function removeLastListeners(){
    const inputs = [...questionList.querySelectorAll('input')]
    for(const input of inputs){
        input.removeEventListener('input',updateListener);
    }
}

saveBtn.addEventListener("click",(e)=>{
    if(viewMode){
        goTo("?edit&id=" + editID);
        return
    }
    const validation = validate();
    if(!validation) {
        const inputs = [...document.querySelectorAll("input")]
        for(const input of inputs){
            input.addEventListener("keydown",(e)=>{
                const value = e.target.value
                if(value.length !== 0 && value.length !== ""){
                    input.classList.remove('error')
                }
            })
        }
        tippy('#errorIcon');
        return
    }

    const title = mainName.value;
    const questions = [...document.querySelectorAll(".question")];
    const set = {};
    set["name"] = title;
    const questionsArr = [];
    for(const question of questions){
        const questObj = {};
        const quesVal = question.querySelector("#questionInp").value
        const ansVal = question.querySelector("#answerInp").value
        const answers = ansVal.split("||")
                               .map(answer => answer.trim())
                               .filter(answer => answer.length > 0);
        if(ansVal.length === 0 && quesVal.length === 0) continue
        questObj["question"] = quesVal;
        questObj["answers"] = answers;

        questionsArr.push(questObj)
    }
    
    set["options"] = {
        reversable: canBeReversedCheckBox.checked
    }
    if(questionsArr.length === 0){
        alert("Youre set seems quite empt")
        return;
    }
    set["questions"] = questionsArr;
    
    if(editMode){
        set["id"] = editID;
    }
        
    addNewSet(set);
    goTo("sets.html")
})

function validate(){
    const inputs = [...document.querySelectorAll('input')]
    let failed = false;
    const lastInputs = [...lastQuestion.querySelectorAll("input")]
    for(const input of inputs){
        if(lastInputs.includes(input)) continue;
        if(input.value.length === 0 || input.value === ""){
            input.classList.add("error")
            failed = true
        }
    }
    return !failed
}

function getQuestionCode(n=0,inp1 = "",inp2 = ""){
    return `<div class="utils">
    <span id="nid">${n}.</span>
    <i  id="remove" class="fas fa-times"> </i>
    
</div>
<div class="main">
    <div class="labelBox">
        <label>Question: </label>
        <input autocomplete="off" value="${inp1}" id="questionInp" type="text"  class="input">
        <i data-tippy-content="Question cannot be empty" class="fas fa-exclamation" id="errorIcon"></i>
    </div>
    <div class="labelBox">
        <label>Answer:   </label>
        <input autocomplete="off" value="${inp2}" id="answerInp" type="text" class="input">
        <i data-tippy-content="Answer cannot be empty" class="fas fa-exclamation" id="errorIcon"></i>
    </div>
</div>`
}


window.addEventListener("beforeunload",(e)=>{

    return ("You recent changes wont be saved unless you save, do you really want to leave")
    
})