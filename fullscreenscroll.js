export default class FSS{
    constructor(){
        this.containers = [];
        this.revcontainers = [];

        this.touchController;
        
        this.allowScroll;
    }

    initWheelEvent(){
        this.touchController = new TouchController();

        this.revcontainers = [].concat(this.containers).reverse();
        this.allowScroll = true;

        history.scrollRestoration = "manual";

        window.addEventListener('wheel', this.#handleScroll.bind(this));
        window.addEventListener('touchstart', () => {
            this.touchController.clearTouches();
        });
        window.addEventListener('touchmove', () => {
            var touch = event.touches[0] || event.changedTouches[0];
            this.touchController.touch(touch, this.#handleTouchBottom.bind(this), this.#handleTouchTop.bind(this));
        });
        window.addEventListener('touchend', () => {
            var directionY = this.touchController.directionY();

            if(directionY == 0){
                return;
            }
            else if(directionY > 0){
                this.#handleTouchTop();
            }
            else{
                this.#handleTouchBottom();
            }
        });
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

    #handleTouchBottom(){
        if(!this.allowScroll){
            return;
        }
        var delay = 0;
        this.allowScroll = false;

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

        if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)){
            setTimeout(() => {this.allowScroll = true}, 0);
        }
        setTimeout(() => {this.allowScroll = true}, delay);
    }

    #handleTouchTop(){
        if(!this.allowScroll){
            return;
        }
        var delay = 0;
        this.allowScroll = false;

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

        if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)){
            setTimeout(() => {this.allowScroll = true}, 0);
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
        this.epsilon = 50;

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
        this.counterEvents = 0;

        if(this.#checkApprox(this.offset, this.limit, this.epsilon)){
            this.offset = this.limit;
            this.container.style.transform = "translateY(" + (this.offset) + "px)";
        }
        if(this.#checkApprox(this.offset, this.startTranslate, this.epsilon)){
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

        if(this.#checkApprox(this.offset, this.limit, this.epsilon)){
            this.offset = this.limit;
            this.container.style.transform = "translateY(" + (this.offset) + "px)";
        }
        if(this.#checkApprox(this.offset, this.startTranslate, this.epsilon)){
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

        this.stepRatio = 2;
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

        this.stepRatio = 1;
    }

    stepForwardCalculate(){
        return Math.round(this.offset + this.containerHeight / this.stepRatio);
    }

    stepBackwardCalculate(){
        return Math.round(this.offset - this.containerHeight / this.stepRatio);
    }
}

class TouchController{
    constructor(){
        this.touches = [];
    }

    touch(touch, func_bottom, func_top){
        this.touches.push(touch.clientY);

        /* if(this.touches.length > 5){
            var directionY = this.directionY();

            if(directionY == 0){
                return;
            }
            else if(directionY > 0){
                func_top();
            }
            else{
                func_bottom();
            }

            this.clearTouches();
        } */
    }

    clearTouches(){
        this.touches = [];
    }

    directionY(){
        if(this.touches.length <= 1){
            return 0;
        }
        var dif = this.touches[this.touches.length - 1] - this.touches[0];

        return dif;
    }
}