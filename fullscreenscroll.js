export default class FSS{
    constructor(){
        this.containers = [];
        this.revcontainers = [];
        this.layers = [];

        this.allowScroll;
        this.scrollsCount;
        this.scrollNow;
    }

    init(){
        this.revcontainers = [].concat(this.containers).reverse();
        this.allowScroll = true;

        this.scrollNow = 0;
        this.scrollsCount = 0;
        this.containers.forEach((container) => {
            this.scrollsCount += container.stepRatio;
        });

        history.scrollRestoration = "manual";
    }

    addContainer(containerSelector, screensSelector, stepRatio, stepRatioMobile, type = "default", selfDelay){
        switch(type){
            case "start":
                var container = new StartContainer(containerSelector, screensSelector, stepRatio, stepRatioMobile, selfDelay);
                this.containers.push(container);
                break;
            
            case "bottom":
                var container = new BottomContainer(containerSelector, screensSelector, stepRatio, stepRatioMobile, selfDelay);
                this.containers.push(container);
                break;

            case "top":
                var container = new TopContainer(containerSelector, screensSelector, stepRatio, stepRatioMobile, selfDelay);
                this.containers.push(container);
                break;

            default:
                var container = new Container(containerSelector, screensSelector, stepRatio, stepRatioMobile, selfDelay);
                this.containers.push(container);
                break;
        }
    }

    addLayer(layerSelector){
        var layer = new Layer(layerSelector);
        this.layers.push(layer);
    }

    handleDown(){
        if(!this.allowScroll){
            return;
        }
        var delay = 0;
        var freeze = false;
        this.allowScroll = false;
        

        this.containers.every((container) => {
            if(container.canForward){
                container.forward();
                delay = container.delay;
                this.scrollNow ++;
                return false;
            }
            else{
                if(container == this.containers[this.containers.length - 1]){
                    this.layers[0].show();
                    freeze = true;
                }
                return true;
            }
        });

        if(!freeze)
            setTimeout(() => {this.allowScroll = true}, delay);
    }

    handleUp(){
        if(this.layers[0].isOut() && this.layers[0].showed){
            this.freeze = false;
            this.allowScroll = true;

            this.layers[0].hide();

            return;
        }
        if(!this.allowScroll){
            return;
        }
        var delay = 0;
        this.allowScroll = false;

        this.revcontainers.every((container) => {
            if(container.canBackward){
                container.backward();
                delay = container.delay;
                this.scrollNow --;
                return false;
            }
            else{
                return true;
            }
        });

        setTimeout(() => {this.allowScroll = true}, delay);
    }
}

class Container{
    constructor(containerSelector, screensSelector, stepRatio = 1, stepRatioMobile = 1, delay = 0){
        this.container = document.querySelector(containerSelector);
        this.screens = document.querySelectorAll(screensSelector);

        this.containerWidth = this.container.offsetWidth;
        this.containerHeight = this.container.offsetHeight;
        this.screensCount = this.screens.length;

        this.startTranslate = this.#getTranslateY(this.container);
        this.offset = this.startTranslate;
        this.limit = Math.abs(this.startTranslate) - this.containerHeight;
        this.delay = delay;
        this.epsilon = 50;
        this.stepRatio = stepRatio;

        this.canForward = true;
        this.canBackward = false;
    }

    stepForwardCalculate(){
        return Math.round(this.offset - this.containerHeight / this.stepRatio);
    }
    stepBackwardCalculate(){
        return Math.round(this.offset + this.containerHeight / this.stepRatio);
    }

    #getTranslateY(target){
        var style = window.getComputedStyle(target);
        var matrix = new WebKitCSSMatrix(style.transform);
        return matrix.m42;
    }

    #checkApprox(num1, num2, epsilon){
        return Math.abs(num1 - num2) < epsilon;
    }

    #isBetween(n, a, b){
        return (n - a) * (n - b) < 0
    }

    #checkLimits(){
        if(this.#checkApprox(this.offset, this.limit, this.epsilon)){
            this.offset = this.limit;
            this.container.style.transform = "translateY(" + (this.offset) + "px)";
        }
        if(this.#checkApprox(this.offset, this.startTranslate, this.epsilon)){
            this.offset = this.startTranslate;
            this.container.style.transform = "translateY(" + (this.offset) + "px)";
        }
    }

    #setCans(){
        if(this.offset == this.startTranslate){
            this.canForward = true;
            this.canBackward = false;
            
            return;
        }
        if(this.#isBetween(this.offset, this.startTranslate, this.limit)){
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

    forward(){
        var step = this.stepForwardCalculate();

        this.container.style.transform = "translateY(" + (step) + "px)";
        this.offset = step;

        this.#checkLimits();

        this.#setCans();
    }

    backward(){
        var step = this.stepBackwardCalculate();

        this.container.style.transform = "translateY(" + (step) + "px)";
        this.offset = step;

        this.#checkLimits();

        this.#setCans();
    }
}

class StartContainer extends Container{
    constructor(...args){
        super(...args);

        this.limit = Math.abs(this.startTranslate) - this.containerHeight + this.screens[this.screensCount - 1].offsetHeight;
    }
}

class BottomContainer extends Container{
    constructor(...args){
        super(...args);
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

class Layer{
    constructor(layerSelector){
        this.layer = document.querySelector(layerSelector);

        this.showed = false;
    }

    show(){
        this.layer.style.transform = "translateY(" + (0) + "px)";

        document.body.style.setProperty('overflow', 'auto');

        this.showed = true;
    }

    hide(){
        this.layer.style.transform = "translateY(" + this.layer.offsetHeight + "px)";

        document.body.style.setProperty('overflow', 'hidden');

        this.showed = false;
    }

    isOut(){
        return window.pageYOffset <= 0 ? true : false;
    }
}