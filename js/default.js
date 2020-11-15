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