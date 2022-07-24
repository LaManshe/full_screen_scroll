export default class FSS{
    constructor(containerQuery, screenQuery, timeOffset){
        this.containerDOM = document.querySelector(containerQuery);
        this.screensDOM = document.querySelectorAll(screenQuery);
        this.timeOffset = timeOffset;

        this.Y = 0;
        this.scrollAllow = true;
    }

    initialize(){

        var me = this;
        function handleScroll(event){
            if(me.scrollAllow){
                me.scrollAllow = false;

                me.Y += -event.deltaY;

                me.containerDOM.style.transform = "translateY(" + me.Y + "vh)";
        
                setTimeout(function(){me.scrollAllow = true}, me.timeOffset);
            }
        }

        window.addEventListener('wheel', handleScroll);
    }

    
}