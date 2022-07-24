export default class FSS{
    constructor(containerQuery, screenQuery, outScreens, timeOffset = 2000, returnToStartWhenEnd = true){
        this.containerDOM = document.querySelector(containerQuery);
        this.screensDOM = document.querySelectorAll(screenQuery);
        this.outScreens = document.querySelectorAll(outScreens);
        this.timeOffset = timeOffset;
        this.returnToStartWhenEnd = returnToStartWhenEnd;

        this.translates = [];
        var me = this;
        this.outScreens.forEach(function(screen){
            var style = window.getComputedStyle(screen);
            var matrix = new WebKitCSSMatrix(style.transform);
            
            me.translates.push(matrix.m42);
        });

        this.Y = 0;
        this.scrollAllow = true;

        history.scrollRestoration = "manual";
    }

    initialize(){
        var me = this;
        var outScreenNum = 0;
        
        var outScreenOffset = me.translates[0];

        function handleScroll(event){
            if(!me.scrollAllow){
                return;
            }
            me.Y += -event.deltaY;

            if(me.Y <= me.screensDOM.length * (-100)){

                if(me.outScreens.length > 0){
                    if(outScreenNum >= me.outScreens.length){
                        return;
                    }

                    me.outScreens[outScreenNum].style.zIndex = 100 * outScreenNum + 100;
                    me.outScreens[outScreenNum].style.transform = "translateY(" + (outScreenOffset + me.translates[outScreenNum]/(-10)) + "px)";
                    outScreenOffset += me.translates[outScreenNum]/(-10);

                    if(Math.abs(outScreenOffset) < 10){
                        me.outScreens[outScreenNum].style.transform = "translateY(" + 0 + "px)";
                        outScreenNum++;
                        outScreenOffset = me.translates[outScreenNum];

                        
                    }

                    return;
                }

                if(me.returnToStartWhenEnd){
                    me.Y = 0;
                }
                else{
                    me.Y -= -event.deltaY;
                }
            }
            if(me.Y > 0){
                me.Y = 0;
                return;
            }

            me.scrollAllow = false;

            me.containerDOM.style.transform = "translateY(" + me.Y + "vh)";
    
            setTimeout(function(){me.scrollAllow = true}, me.timeOffset);
        }

        window.addEventListener('wheel', handleScroll);
    }
}