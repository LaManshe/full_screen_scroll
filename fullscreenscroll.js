export default class FSS{
    constructor(){
        this.containers = [];
        this.revcontainers = [];

        this.allowScroll;
        this.scrollsCount;
        this.scrollNow;

        this.nav;
    }

    init(){
        this.revcontainers = [].concat(this.containers).reverse();

        this.allowScroll = true;

        this.scrollNow = 0;
        this.scrollsCount = 0;

        this.nav = new DynamicNav();
        this.nav.createNav(this.containers);
        this.nav.links.forEach((link) => {
            link.addEventListener('click', (item) => {
                let funcDown = this.handleDown.bind(this, true);
                let funcUp = this.handleUp.bind(this, true);
                this.nav.handleLinkClick(funcDown, funcUp, this.scrollNow, link);
            });
        });

        this.#set_zIndexes(this.containers);

        history.scrollRestoration = "manual";
    }

    addContainer(containerSelector, screensSelector, stepRatio, type = "default", selfDelay, visualName){
        switch(type){
            case "start":
                var container = new StartContainer(containerSelector, screensSelector, stepRatio, selfDelay, visualName);
                this.containers.push(container);
                break;
            
            case "bottom":
                var container = new BottomContainer(containerSelector, screensSelector, stepRatio, selfDelay, visualName);
                this.containers.push(container);
                break;

            case "top":
                var container = new TopContainer(containerSelector, screensSelector, stepRatio, selfDelay, visualName);
                this.containers.push(container);
                break;

            default:
                var container = new Container(containerSelector, screensSelector, stepRatio, selfDelay, visualName);
                this.containers.push(container);
                break;
        }
    }

    handleDown(fast = false){
        if(!this.allowScroll && !fast){
            return;
        }
        var delay = 0;
        this.allowScroll = false;

        this.containers.every((container) => {
            if(container.canForward){
                container.forward();
                delay = container.delay;
                this.scrollNow ++;
                return false;
            }
            else{
                return true;
            }
        });

        setTimeout(() => {
            this.nav.links.forEach((link) => {
                link.classList.remove("active");
            });
            this.revcontainers.every((container) => {
                if(container.isUserSee()){
                    container.activeMyLink();

                    return false;
                }
                else{
                    return true;
                }
            });
            this.allowScroll = true;
        }, delay + 50);
    }

    handleUp(fast = false){
        if(!this.allowScroll && !fast){
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

        setTimeout(() => {
            this.nav.links.forEach((link) => {
                link.classList.remove("active");
            });
            this.revcontainers.every((container) => {
                if(container.isUserSee()){
                    container.activeMyLink();

                    return false;
                }
                else{
                    return true;
                }
            });
            this.allowScroll = true;
        }, delay + 50);
    }

    #set_zIndexes(...args){
        var zIndex = 100;
        args.forEach((element) => {
            element.forEach((container) => {
                container.container.style.zIndex = zIndex + "";

                zIndex += 10;
            })
        })
    }
}

class Container{
    constructor(containerSelector, screensSelector, stepRatio = 1, delay = 0, visualName = "unknown"){
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
        this.visualName = visualName;
        this.countScrollsForFull = this.stepRatio / this.screensCount;

        this.myLink;

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

    isUserSee(){
        var myPosition = {
            top: window.pageYOffset    + this.container.getBoundingClientRect().top,
            left: window.pageXOffset   + this.container.getBoundingClientRect().left,
            right: window.pageXOffset  + this.container.getBoundingClientRect().right,
            bottom: window.pageYOffset + this.container.getBoundingClientRect().bottom
        },
        windowPosition = {
            top: window.pageYOffset,
            left: window.pageXOffset,
            right: window.pageXOffset + document.documentElement.clientWidth,
            bottom: window.pageYOffset + document.documentElement.clientHeight
        };
      
        if (myPosition.bottom > windowPosition.top && 
            myPosition.top < windowPosition.bottom && 
            myPosition.right > windowPosition.left && 
            myPosition.left < windowPosition.right){ 
            return true;
        } 
        else{
            return false;
        };
    }

    activeMyLink(){
        this.myLink.classList.add("active");
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
        this.countScrollsForFull = 0;
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

class DynamicNav{
    constructor(){
        this.links = [];
    }

    createNav(...args){
        this.#createDOMElements(args);
    }

    handleLinkClick(f_down, f_up, scrollNow, link){
        var offset = link.dataset.offset;
        var steps = offset - scrollNow;

        var funcs = [];

        if(steps > 0){
            for(let i = 0; i < steps; i++){
                funcs.push(f_down);
            }
        }
        else{
            steps = Math.abs(steps);
            for(let i = 0; i < steps; i++){
                funcs.push(f_up);
            }
        }

        this.#seqRunner(funcs);

        this.links.forEach((link) => {
            link.classList.remove("active");
        });
        link.classList.add("active");
    }

    #createDOMElements(args){
        var containers = args[0];

        var nav = document.querySelector(".fss_nav");
        var ul = document.createElement('ul');
        ul.setAttribute('class','nav-container');

        nav.appendChild(ul);

        var startOffset = 0;
        for(let i = 0; i < containers.length; i++){
            var li = document.createElement('li');
            li.setAttribute('class', 'container-name');
            startOffset = startOffset + this.#getStartStepsOffset(containers[i - 1]) + containers[i].countScrollsForFull;
            li.setAttribute('data-offset', startOffset);
            li.innerHTML = containers[i].visualName;
            ul.appendChild(li);

            containers[i].myLink = li;

            this.links.push(li);
        }

        ul.children[0].classList.add("active");
    }

    #getStartStepsOffset(container){
        if(!container){
            return 0;
        }
        else{
            return container.screensCount - 1;
        }
    }

    #seqRunner(deeds){
        return deeds.reduce(function(p, deed){
            return p.then(deed);
        }, Promise.resolve());
    }
}