export default class FSS{
    constructor(containerQuery, screenQuery, timeOffset = 2000, returnToStartWhenEnd = true){
        this.containerDOM = document.querySelector(containerQuery);
        this.screensDOM = document.querySelectorAll(screenQuery);
        this.timeOffset = timeOffset;
        this.returnToStartWhenEnd = returnToStartWhenEnd;

        this.Y = 0;
        this.scrollAllow = true;

        history.scrollRestoration = "manual";
    }

    initialize(){
        var me = this;
        function handleScroll(event){
            if(!me.scrollAllow){
                return;
            }
            me.Y += -event.deltaY;

            if(me.Y <= me.screensDOM.length * (-100) || me.Y > 0){
                if(me.returnToStartWhenEnd){
                    me.Y = 0;
                }
                else{
                    me.Y -= -event.deltaY;
                }
            }

            me.scrollAllow = false;

            me.containerDOM.style.transform = "translateY(" + me.Y + "vh)";
    
            setTimeout(function(){me.scrollAllow = true}, me.timeOffset);
        }

        window.addEventListener('wheel', handleScroll);
    }
}