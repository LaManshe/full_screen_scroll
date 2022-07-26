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
        var delay = 0;
        this.allowScroll = false;

        if(event.deltaY > 0){
            this.containers.every(function(container){
                if(container.canForward){
                    container.forward();
                    delay = container.delay;
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
                    delay = container.delay;
                    return false;
                }
                else{
                    return true;
                }
            });
        }

        setTimeout(() => {this.allowScroll = true}, delay);
    }

    addContainer(containerSelector, screensSelector, type = "default", selfDelay = 0){

        switch(type){
            case "first":
                var container = new FirstContainer(containerSelector, screensSelector);
                container.delay = selfDelay;
                this.containers.push(container);
                break;
            
            case "bottom":
                var container = new BottomContainer(containerSelector, screensSelector);
                container.delay = selfDelay;
                this.containers.push(container);
                break;

            case "top":
                var container = new TopContainer(containerSelector, screensSelector);
                container.delay = selfDelay;
                this.containers.push(container);
                break;

            default:
                var container = new Container(containerSelector, screensSelector);
                container.delay = selfDelay;
                this.containers.push(container);
                break;
        }
    }
}

class Container{
    constructor(containerSelector, screensSelector){
        this.container = document.querySelector(containerSelector);
        this.screens = document.querySelectorAll(screensSelector);
        
        this.containerWidth = this.container.offsetWidth;
        this.containerHeight = this.container.offsetHeight;
        this.screensCount = this.screens.length;

        this.startTranslate = this.#getTranslateY(this.container);
        this.stepRatio = 6;
        this.offset = this.startTranslate;
        this.limit = Math.abs(this.startTranslate) - this.containerHeight;
        this.delay = 0;

        this.canForward = true;
        this.canBackward = false;
    }

    stepForwardCalculate(){
        return 1;
    }
    stepBackwardCalculate(){
        return 1;
    }

    forward(){
        var step = this.stepForwardCalculate();

        this.container.style.transform = "translateY(" + (step) + "px)";

        this.offset = step;

        if(this.#checkApprox(this.offset, this.limit, 50)){
            this.offset = this.limit;
            this.container.style.transform = "translateY(" + (this.offset) + "px)";
        }
        if(this.#checkApprox(this.offset, this.startTranslate, 50)){
            this.offset = this.startTranslate;
            this.container.style.transform = "translateY(" + (this.offset) + "px)";
        }
        
        if(this.offset == this.startTranslate){
            this.canForward = true;
            this.canBackward = false;
            
            return;
        }
        if(this.offset < Math.abs(this.startTranslate) && this.offset > this.limit){
            this.canForward = true;
            this.canBackward = true;
            
            return;
        }
        if(this.offset == this.limit){
            this.canForward = false;
            this.canBackward = true;

            return;
        }
    }

    downward(){
        var step = this.stepBackwardCalculate();

        this.container.style.transform = "translateY(" + (step) + "px)";

        this.offset = step;

        if(this.#checkApprox(this.offset, this.limit, 50)){
            this.offset = this.limit;
            this.container.style.transform = "translateY(" + (this.offset) + "px)";
        }
        if(this.#checkApprox(this.offset, this.startTranslate, 50)){
            this.offset = this.startTranslate;
            this.container.style.transform = "translateY(" + (this.offset) + "px)";
        }
        
        if(this.offset == this.startTranslate){
            this.canForward = true;
            this.canBackward = false;
            
            return;
        }
        if(Math.abs(this.offset) < Math.abs(this.startTranslate) && Math.abs(this.offset) > Math.abs(this.limit)){
            this.canForward = true;
            this.canBackward = true;
            
            return;
        }
        if(this.offset == this.limit){
            this.canForward = false;
            this.canBackward = true;

            return;
        }
    }

    #getTranslateY(target){
        var style = window.getComputedStyle(target);
        var matrix = new WebKitCSSMatrix(style.transform);
        return matrix.m42;
    }

    #checkApprox(num1, num2, epsilon){
        return Math.abs(num1 - num2) < epsilon;
    }
}

class FirstContainer extends Container{
    constructor(...args){
        super(...args);

        this.limit = Math.abs(this.startTranslate) - this.containerHeight + this.screens[0].offsetHeight;
    }

    stepForwardCalculate(){
        return Math.round(this.offset - this.containerHeight / this.screensCount);
    }
    
    stepBackwardCalculate(){
        return Math.round(this.offset + this.containerHeight / this.screensCount);
    }
}

class BottomContainer extends Container{
    constructor(...args){
        super(...args);
    }

    stepForwardCalculate(){
        return Math.round(this.offset - this.containerHeight / this.stepRatio);
    }
    stepBackwardCalculate(){
        return Math.round(this.offset + this.containerHeight / this.stepRatio);
    }
}

class TopContainer extends Container{
    constructor(...args){
        super(...args);
    }

    stepForwardCalculate(){
        return Math.round(this.offset + this.containerHeight / this.stepRatio);
    }

    stepBackwardCalculate(){
        return Math.round(this.offset - this.containerHeight / this.stepRatio);
    }
}