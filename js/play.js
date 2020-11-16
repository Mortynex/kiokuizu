import { getAllSets, getSetById } from './database.js';
import Random from 'https://unpkg.com/randomized-js/randomized.js'
const setList = document.querySelector("#gameSets");
let choices;
let sets;
const buttonsState = {};    
(async ()=>{
    sets = (await getAllSets());
    let HTML = setList.innerHTML;
    for(const { name, id } of sets){
        HTML += 
        `<option value="${id}">${name}</option>`
    }
    setList.innerHTML = HTML;
    choices = new Choices(setList);
    buttonsState["setId"] = sets[0].id
})()

function switchToWindow(selector){
    const windows = [...document.querySelectorAll(".window")];
    windows.forEach((window)=>{
        const switchToThis = (()=>{
            if(typeof selector === "string"){
                return window.matches(selector)
            }
            else if(typeof selector === "object"){
                return window === selector
            }
        })()    
        if(switchToThis){
            window.classList.add("activeWindow")
        }
        else{
            window.classList.remove("activeWindow")
        }
    })

}

const selectButtons = document.querySelectorAll(".oneButton")

setList.addEventListener("change",(e)=>{
    const id = +e.detail.value;
    buttonsState["setId"] = id;
});
for(const content of selectButtons){
    const name = content.dataset.name || "null";
    buttonsState[name] = {}
    const buttons = content.querySelectorAll("button");
    function clearButtons(){
        for(const button of buttons){
            button.classList.remove("active")
        } 
    }
    
    for(const button of buttons){
        let value = button.dataset.value || button.innerHTML;
        if(content.dataset.number !== undefined){
            value = Number(value);
        }
        if(button.dataset.default !== undefined){
            buttonsState[name] = value;
            button.classList.add("active");
        }
        button.addEventListener("click",(e)=>{
            clearButtons();
            button.classList.add("active");
            const options =document.querySelector(".hardness")
            if(name === "gameMode"){
                if(value !== 'options'){
                    options.classList.add("disabled")
                }
                else{
                    options.classList.remove("disabled")
                }
            }
            buttonsState[name] = value;
        })
    } 
}



const startGameButton = document.querySelector("#startBtn")

startGameButton.addEventListener('click',(e)=>{
    switchToWindow(".theGame")
    fazeTwo(buttonsState);
})
//fazeTwo({gameType:'precise',setId:4, optionSize: 4})
async function fazeTwo({ gameSize, gameMode, optionSize, setId, options}){
    

    const set = await getSetById(setId);

    const preciseMode = gameMode === "precise"
    const optionsMode = gameMode === "options"

    const questionBox = document.querySelector(".thequestion")

    const setName = document.querySelector("#setName");
    setName.innerHTML = set.name;

    function setQuestion(question){
        if(question.length > 18){
            questionBox.classList.add("smaller")
        }
        else{
            questionBox.classList.remove("smaller")
        }
        questionBox.innerHTML = question;
    }
    function isLike(string,string2){
        const convert = (str) => {
            return str.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s/,"").replace(/\W/gi,"_");
        }
        string = convert(string);
        string2 = convert(string2);
        return string === string2
    }

    let play;

    const setDisplay = (elem, state) =>{
        if(typeof elem === "string"){
            elem = document.querySelector(elem)
        }
        if(typeof elem !== "object") return
        elem.style.display = state
    }
    const show = (selem) => setDisplay(selem, "flex")
    const hide = (selector) => setDisplay(selem, "none")
    
    let lastQuestion;

    if(optionsMode){
        show(".optionsAnswer");

        if(optionSize > set.questions.length) optionSize = set.questions.length;

        const optionsButtons = []
        const optionBox = document.querySelector(".optionsAnswer");

        for(let i =0; i < optionSize; i++){
            const button = document.createElement("BUTTON");
            optionsButtons.push(button);
            optionBox.append(button);
        }
    
        function setOptions(arr, callback){
            
            arr = [...arr];
            
            for(const button of optionsButtons){
                button.classList.remove(...button.classList)
                button.innerHTML = arr.pop();
                button.addEventListener("click",callback)
            }
        }
        
        play = function pick(data){
            let { questions, optionSize, options:GameOptions } = data;

            const { reversable } = GameOptions;
            
            if(reversable){
                const picked = Random.pick([1,1,1,1,1,2,2,2,2]);
                
                if(picked === 2){
                    const copy = (obj) => JSON.parse(JSON.stringify(obj))
                    questions = copy(questions).map(({question, answers})=>{
                        const newQs = Random.pick(answers);
                        const newAns = [question]
                        return {
                            question: newQs,
                            answers: newAns
                        }
                    })
                }
            }
            
            let thequestion = Random.pick(questions);
            let { question, answers} = thequestion;
            
            const rightAnswer = Random.pick(answers);
            
            if(lastQuestion === question || lastQuestion === rightAnswer){
                return pick(data);
            }
            lastQuestion = question;

            let otherQuestions = questions.filter(({question:qs})=> !isLike(qs, question));
    
            let options = [rightAnswer];
    
            otherQuestions = otherQuestions.map((qs)=>{
                qs.score = (qs.answers.reduce((tot,ar)=>{
                    return tot + stringSimilarity.compareTwoStrings(ar, rightAnswer);
                },0) / qs.answers.length);
                return qs
            });
            const halfLength = Math.floor(otherQuestions.length / 2)
            if(halfLength < (optionSize - 1)){
                options.push(
                    ...otherQuestions.slice(otherQuestions.length - optionSize)
                                     .map(({answers})=>Random.pick(answers))
                )
            }
            else if(otherQuestions.length === (optionSize - 1)){
                options.push(...otherQuestions.map(({answers})=>Random.pick(answers)))
            }
            else{
                const selected = [];
                let i = 0;
                
                while(options.length !== optionSize){
                    i++;
                    if(i > 1000){
                        console.log("Broke;")
                        break;
                    }
    
                    const { answers:ans } = Random.pick(otherQuestions);
                    if(ans.some((as) => selected.includes(as) )){
                        continue;
                    }
                    const pickedAnswer = Random.pick(ans);
                    selected.push(...ans);
                    options.push(pickedAnswer);
                }
            }
            options = Random.randomize(options);
            setQuestion(question);
            return new Promise((resolve, reject)=>{
                setOptions(options,function handler(e){
                    const userAnswer = e.target.innerHTML;
                    const rightButton = [...e.target.parentNode.childNodes]
                                        .find((elem) => elem.innerHTML === rightAnswer);
                    
                    const isUserCorrect = userAnswer === rightAnswer;
                    const userButton = e.target;
                    
                    rightButton.classList.add("right")
                    if(!isUserCorrect){
                        userButton.classList.add("wrong")
                    }
                    optionsButtons.forEach((btn)=>{
                        btn.removeEventListener("click", handler)
                    })
                    resolve(
                        {
                            userAnswer,
                            rightAnswer,
                            isUserCorrect,
                            
                        }
                    );
                })
            })
        }
    }
    else if(preciseMode){
        show(".preciseAnswer");
        const preciseInput = document.querySelector("#preciseAnswerInput");
        const preciseCheck = document.querySelector("#checkBtn");

        function resetInputClass(){
            preciseInput.classList.remove(...preciseInput.classList);
            preciseInput.value = "";
        }

        play = function pick(data){
            resetInputClass();

            let { questions, optionSize, options:GameOptions } = data

            const { reversable } = GameOptions;
            if(reversable){
                const picked = Random.pick([1,1,1,1,2,2,2]);
                if(picked === 2){
                    const copy = (obj) => JSON.parse(JSON.stringify(obj))
                    questions = copy(questions).map(({question:qs, answers:ans})=>{
                        const newQs = Random.pick(ans);
                        const newAns = [qs]
                        return {
                            question: newQs,
                            answers: newAns
                        }
                    })
                }
            }

            let thequestion = Random.pick(questions);
            let { question, answers} = thequestion;
            
            const rightAnswer = Random.pick(answers);
            
            if(lastQuestion === question || lastQuestion === rightAnswer){
                return pick(data);
            }
            lastQuestion = question;
            
            setQuestion(question);
            preciseInput.focus();
            preciseInput.addEventListener("blur",(e)=>{
                preciseInput.focus();
            })
            return new Promise((resolve)=>{
                function finish(){
                    const userAnswer = preciseInput.value;
                    const isUserCorrect = isLike(userAnswer, rightAnswer);
                    if(isUserCorrect){
                        preciseInput.classList.add("right");
                    }
                    else{
                        setQuestion(`${question} = ${rightAnswer}`)
                        preciseInput.classList.add("wrong");
                    }

                    resolve(
                        {
                            userAnswer,
                            rightAnswer,
                            isUserCorrect,
                        }
                    );
                }
                preciseCheck.addEventListener("click",function handler(e){
                    if(preciseCheck.value.length !== 0){
                        finish();
                    }
                    
                    document.removeEventListener("click",handler)
                })
                
                document.addEventListener("keyup",function handler(e){
                    const code = e.code;
                    if(code === "Enter"){
                        e.preventDefault()
                        finish();
                        document.removeEventListener("keyup",handler)
                    }
                });

            })

        }
    }

    let endOfTheGame = false;
    const nextButton = document.querySelector("#nextBtn");
    const scoreBoard = document.querySelector("#scoreBoard");
    let questionsAnswered = 0;
    let points = 0;

    function updateScoreBoard(){
        const stringPoints = String(points).padStart(String(gameSize).length,0)
        scoreBoard.innerHTML = `${stringPoints}/${gameSize}`
    }

    async function run(){
        updateScoreBoard();
        // Hide "next" button
        nextButton.style.opacity = "0";
        const {userAnswer, rightAnswer, isUserCorrect,} = await play({
            questions: set.questions, 
            optionSize: Number(optionSize), 
            options: set.options
        });
        // Show next button
        nextButton.style.opacity = "100";
        
        questionsAnswered++;
        if(isUserCorrect){
            points++;
        }
        await new Promise((resolve)=>{
            document.addEventListener("keyup",(e)=>{
                const code = e.code;
                if(code === "Enter" || code === "KeyN" || code === "Space"){
                    e.preventDefault()
                    resolve();
                }
            });
            nextButton.addEventListener("click",(e)=>{
                resolve();
            })
        });

       

        if(gameSize === questionsAnswered){
            switchToWindow(".results");
            faze3(
                {
                    answered:gameSize,
                    points,
                    set
                }
            )
            return
        }
        run();
    }
    run()
    
    

}

function faze3({answered, points, set}){
    
    const setName = set.name;
    const percent = Math.floor(( points / answered ) * 100);
    const wrongAnswers = answered - points
    {
        const percentElem = document.querySelector(".percentage");
        const questionsElem = document.querySelector(".numquestion");
        const rightAnswerElem = document.querySelector(".numranswer");
        const wrongAnswerElem = document.querySelector(".numwanswer");
        const setNameElem = document.querySelector(".nameset")

        setNameElem.innerHTML = setName;
        percentElem.innerHTML = percent + "%";
        questionsElem.innerHTML = answered;
        rightAnswerElem.innerHTML = points;
        wrongAnswerElem.innerHTML = wrongAnswers;
    }

    const playAgain = document.querySelector("#playAgain")
    const homeBtn = document.querySelector("#homeBtn")

    playAgain.addEventListener("click",(e)=>{
        window.location.reload();
        return false;
    })

    homeBtn.addEventListener("click",(e)=>{
        goTo("index.html")
    })
    
}