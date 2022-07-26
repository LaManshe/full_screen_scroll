export default class FSS{
    constructor(){
        this.containers = [];
        this.revcontainers = [];

        this.allowScroll;
    }

    initWheelEvent(){
        this.revcontainers = [].concat(this.containers).reverse();
        history.scrollRestoration = "manual";
        this.allowScroll = true;
        
        window.addEventListener('wheel', this.#handleScroll.bind(this));
    }

    #handleScroll(event){
        if(!this.allowScroll){
            return;
        }

        this.allowScroll = false;

        if(event.deltaY > 0){
            this.containers.every(function(container){
                if(container.canForward){
                    container.forward();
                    return false;
                }
                else{
                    return true;
                }
            });
        }
        else{
            this.revcontainers.every(function(container){
                if(container.canBackward){
                    container.downward();
                    return false;
                }
                else{
                    return true;
                }
            });
        }

        setTimeout(() => {this.allowScroll = true}, 800);
    }

    addContainer(containerSelector, screensSelector, isFirst = false){
        if(isFirst){
            var container = new FirstContainer(containerSelector, screensSelector);
            this.containers.push(container);
        }
        else{
            var container = new Container(containerSelector, screensSelector);
            container.isFirst = false;
            this.containers.push(container);
        }
    }
}

class Container{
    constructor(containerSelector, screensSelector){
        this.container = document.querySelector(containerSelector);
        this.screens = document.querySelectorAll(screensSelector);
        
        this.containerWidth = this.container.clientWidth;
        this.containerHeight = this.container.clientHeight;
        this.screensCount = this.screens.length;

        this.canForward = true;
        this.canBackward = false;
        this.offset = 0;
        this.screenNow = 0;
    }

    forward(){
        var step = 0;

        this.container.style.transform = "translateY(" + (0) + "px)";

        this.offset += step;
        this.screenNow ++;

        if(this.screenNow == 0){
            this.canForward = true;
            this.canBackward = false;

            return;
        }
        if(this.screenNow > 0){
            this.canForward = false;
            this.canBackward = true;

            return;
        }
    }

    downward(){
        var step = 0;
        if(this.screens.length > 1){
            step = this.screens[this.screenNow].clientHeigh;
        }
        else{
            step = this.screens[0].clientHeight;
        }

        this.container.style.transform = "translateY(" + (step) + "px)";

        this.offset -= step;
        this.screenNow --;

        if(this.screenNow == 0){
            this.canForward = true;
            this.canBackward = false;

            return;
        }
        if(this.screenNow > 0){
            this.canForward = false;
            this.canBackward = true;

            return;
        }
    }
}

class FirstContainer extends Container{
    constructor(...args){
        super(...args);

        this.screenNow = 1;
    }

    forward(){
        var step = 0;
        if(this.screens.length > 1){
            step = - this.screens[this.screenNow - 1].clientHeight;
        }
        else{
            step = - this.screens[0].clientHeight;
        }

        this.container.style.transform = "translateY(" + (this.offset + step) + "px)";

        this.offset += step;
        this.screenNow ++;

        if(this.screenNow == 1){
            this.canForward = true;
            this.canBackward = false;

            return;
        }
        if(this.screenNow > 1 && this.screenNow < this.screensCount){
            this.canForward = true;
            this.canBackward = true;

            return;
        }
        if(this.screenNow == this.screensCount){
            this.canForward = false;
            this.canBackward = true;
            
            return;
        }
    }

    downward(){
        var step = 0;
        if(this.screens.length > 1){
            step = - this.screens[this.screenNow - 1].clientHeight;
        }
        else{
            step = - this.screens[0].clientHeight;
        }

        this.container.style.transform = "translateY(" + (this.offset - step) + "px)";

        this.offset -= step;
        this.screenNow --;

        if(this.screenNow == 1){
            this.canForward = true;
            this.canBackward = false;

            return;
        }
        if(this.screenNow > 1 && this.screenNow < this.screensCount){
            this.canForward = true;
            this.canBackward = true;

            return;
        }
        if(this.screenNow == this.screensCount){
            this.canForward = false;
            this.canBackward = true;
            
            return;
        }
    }
}



/* export default class FSS{
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

        this.screenShow = 0;
        this.scrollAllow = true;

        history.scrollRestoration = "manual";
    }

    initialize(){
        var me = this;

        function handleScroll(event){
            if(!me.scrollAllow){
                return;
            }

            if(event.deltaY > 0){
                if(this.screenShow + 1 >= this.screensDOM.length){
                    this.scrollAllow = false;
                    this.showFPScreen(0);
                    setTimeout(function(){
                        me.scrollAllow = true;
                        me.screenShow = 0;
                    }, me.timeOffset);

                    return;
                }

                this.scrollAllow = false;
                this.showFPScreen(this.screenShow + 1);
                setTimeout(function(){
                    me.scrollAllow = true;
                    me.screenShow++;
                }, me.timeOffset);
            }
            else{
                if(this.screenShow - 1 < 0){
                    return;
                }

                this.scrollAllow = false;
                this.showFPScreen(this.screenShow - 1);
                setTimeout(function(){
                    me.scrollAllow = true;
                    me.screenShow--;
                }, me.timeOffset);
            }
        }

        window.addEventListener('wheel', handleScroll.bind(this));
    }

    showFPScreen(screenNumber){
        var offset = -screenNumber * 100;
        this.containerDOM.style.transform = "translateY(" + offset + "vh)";
    }
} */