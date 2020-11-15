const main = document.querySelector('main')

document.addEventListener('mousemove',(e)=>{
    const X = ( titlePos.left - e.pageX ) * 0.02;
    const Y = ( titlePos.top - e.pageY ) * 0.02;

    main.style.left = X + 'px';
    main.style.top = Y + 'px';
})