function goTo(endurl){
    let baseUrl = location.href.match(/https?:\/\/\w+(\.\w+)+(:\w+)?(\/(\w+\/)*)?/gi)[0];
    if(!baseUrl.endsWith("/")){
        baseUrl += "/";
    }
    
    if(endurl.startsWith("?")){
        baseUrl = location.href;
        baseUrl = baseUrl.replace(location.search, "")
    }
    
    location.href = baseUrl + endurl;
}

customElements.define('svg-arrow', class extends HTMLElement {
    connectedCallback() {
        const shadow = this.attachShadow({mode: 'open'});
        this.classList.add("arrowLeft")
        shadow.innerHTML = `<svg class="arrowLeft" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Icons" x="0px" y="0px" viewBox="0 0 32 32" style="enable-background:new 0 0 32 32;" xml:space="preserve"> <g> <path d="M11,23c-0.3,0-0.5-0.1-0.7-0.3l-6-6c-0.4-0.4-0.4-1,0-1.4l6-6c0.4-0.4,1-0.4,1.4,0s0.4,1,0,1.4L6.4,16l5.3,5.3   c0.4,0.4,0.4,1,0,1.4C11.5,22.9,11.3,23,11,23z"/> </g> <g> <path d="M27,17H5c-0.6,0-1-0.4-1-1s0.4-1,1-1h22c0.6,0,1,0.4,1,1S27.6,17,27,17z"/> </g> </svg>`;
    }
});