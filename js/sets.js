/*const setSettingsIcon = document.querySelector(".setSettingsIcon")
const setSettingsMenu = document.querySelector(".setSettings")

setSettingsIcon.addEventListener('click',()=>{
    setSettingsMenu.classList.toggle('active');
})
window.addEventListener('click',(e)=>{
    if(e.target.matches('.setSettings') ||e.target.matches('.setSettingsIcon')){
        return
    }
    setSettingsMenu.classList.remove('active')
})*/

import {addNewSet , getAllSets, removeSet} from './database.js'
import {html, render} from 'https://unpkg.com/lit-html?module';

const setList = document.querySelector('.setList');
let sets;

const update = (async()=>{
    console.log("Dasdsd")
    await updateSets()
    console.log("Dasdsds")
    getAndAddEventListner('#deleteSet', 'click', (e, id)=>{
        const {name} = getSetFromId(id);
        const confirmation = confirm(`Do you really want to delete set "${name}"`)
        if(!confirmation) return;
        removeSet(id).then(()=>{
            updateSets();
        })
    })
    getAndAddEventListner('#editSet', 'click', (e, id)=>{
        window.location.href = window.location.origin + "/newset.html?edit&id=" + id
    })
    getAndAddEventListner("#exportSet","click",(e,id)=>{
        function download(content, fileName) {
            const a = document.createElement("a");
            const file = new Blob([content], {type: "text/plain"});
            const url = URL.createObjectURL(file);
            a.href = url;
            a.download = fileName;
            a.click();
            
        }
        const setObj = getSetFromId(id);

        const setWoId = removeId(setObj)

        const JSObj = JSON.stringify(
            {
                set: setWoId
            }
        );
        
        const name = setObj.name.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s/,"_").replace(/\W/gi,"") + ".kset";
        download(JSObj, name);
    })
    getAndAddEventListner(".setTitle","click",(e,id)=>{
        window.location.href = window.location.origin + "/newset.html?view&id=" + id
    })

})
update();

function getSetFromId(id){
    return sets.find((set)=> set.id === id)
}

function getAndAddEventListner(query, event, callback){
    const elements = document.querySelectorAll(query)
    elements.forEach((elem)=>{
        elem.addEventListener(event, (e)=>{
            const id = (+elem.parentNode.dataset.id) || (+elem.dataset.id)
            callback(e,id)
        })
    })

}

async function updateSets(){
    sets = await getAllSets();
    console.log(sets)
    render(
        html`
            ${sets.map(set => html`
                <li class="setItem">
                <h3 class="setTitle" data-id="${set.id}">${set.name}</h3>
                <div class="setSets">
                    <div class="setSettingsIcon">⠇</div>
                    <ul class="setSettings" data-id="${set.id}">
                        
                        <li id="editSet">
                            <p>Edit</p>
                            <i class="fas fa-pen"></i>
                        </li>
                        <li id="exportSet">
                            <p>Export</p>
                            <i class="fas fa-file-export"></i>
                        </li>
                        
                        <li id="deleteSet">
                            <p>Delete</p>
                            <i class="fas fa-trash"></i>
                        </li>
                    </ul>
                </div>
            </li>    
            `)}
        `,
        setList
    )
}

function removeId(obj){
    const converted = {};
    for(const [key, value] of Object.entries(obj)){
        if(key === "id"){
            continue;
        }
        converted[key] = value;
    }
    return converted;
}

const dropArea = document.querySelector("#dropArea");
console.log(dropArea)
function preventDefaults (e) {
    e.preventDefault()
    e.stopPropagation()
};
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    document.addEventListener(eventName, preventDefaults,true)
});
let lastTarget = null;
document.addEventListener("dragenter",(e)=>{
    dropArea.classList.add("highlight");
    document.body.classList.add("blur");
    lastTarget = e.target;
},true );

["dragleave","drop"].forEach((event)=>{
    document.addEventListener(event,(e)=>{
        if(e.target === lastTarget || e.target === document)
        {
            dropArea.classList.remove("highlight")
            document.body.classList.remove("blur")
        }
        if(event === "drop"){
            handleDrop(e);
        }
    }, true )
});


function readFile(file) {
    const reader = new FileReader();
    reader.addEventListener('load', (event) => {
        const result = event.target.result;
      // Do something with result
        const object = JSON.parse(result);
        const set = object.set;
        
        if(!set){
            alert("Sorry but your set looks weird, I cannot load him");
            return
        }
        getAllSets().then((sets)=>{
            const exits = sets.some((st)=>{
                return (JSON.stringify(set) === JSON.stringify(removeId(st)))
            })
            console.log(exits)
            if(exits){
                alert("Looks like this Set already exists!");
                return
            }
            addNewSet(set);
            update();
        })
        

    });
    reader.readAsText(file);
  }

function handleDrop(e) {
    let dt = e.dataTransfer
    let files = [...dt.files];
    files = files.filter(file =>{
        return file.name.endsWith(".kset")
    })
    console.log(files)
    ;[...files].forEach((file)=>{
        readFile(file);
    })
}