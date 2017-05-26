class Timer {
    
    constructor(opt) {
        this.tickValue = 0;
        this.opt = opt || {};
        this.speed = this.opt._speed || 1000;
        this.isPaused = false;
        
        this._initTimer();
    }

    _initTimer() {
        this.playTimer = setInterval(() => {
            if(this.tickValue >= this.opt.limit) {
                this.stop();

                if(!!this.opt.onLast) {
                    this.opt.onLast.call(this, this.tickValue);
                }
                return;
            }

            ++this.tickValue;
            this.opt.onTick.call(this, this.tickValue);
        }, this.speed);
    }

    stop() {
        clearInterval(this.playTimer);
        this.playTimer = null;

        if(!!this.opt.onStop) {
            this.opt.onStop.call(this, this.tickValue);
        }
    }

    pause() {
        this.isPaused = true;
        clearInterval(this.playTimer);
        this.playTimer = null;

        if(!!this.opt.onPause) {
            this.opt.onPause.call(this, this.tickValue);
        }
    }

    resume() {
        this.isPaused = false;
        this._initTimer();
    }
    
}

export default Timer;