class Timer {
    onTick: Function;
    tickTimeMs: number;
    lastTime: bigint;
    startTime: bigint;
    running: boolean;
    timerId: any;
    bankedTimeMs: number;
    tickCount: number;
    constructor(onTick: Function, tickTimeMs = 16){
        this.onTick = onTick;
        this.tickTimeMs = tickTimeMs;
        this.lastTime = BigInt(0);
        this.startTime = BigInt(0);
        this.running = false;
        this.timerId = null;
        this.bankedTimeMs = 0;
        this.tickCount = 0;

    }
    start(){
        if(this.running){
           return; 
        }

        this.running = true;
        this.startTime = process.hrtime.bigint()
        this.lastTime = this.startTime;
        this.timerId = setInterval(() => {
            // get the time and just call ticks
            this.bankedTimeMs = this.bankedTimeMs + this._getTime().frame;
            //console.log(this.bankedTimeMs)
            while(this.bankedTimeMs > this.tickTimeMs){
                this.onTick(this.tickCount);
                //console.log("Tick " + this.tickCount);
                this.bankedTimeMs -= this.tickTimeMs;
                this.tickCount += 1;
            }

        },1)
        return this;
    }
    _ms = (nanoseconds: bigint):number => { return +Number(nanoseconds/BigInt(1000000))}
    _getTime = () => {
        const ms = this._ms;
        const {startTime, lastTime} = this;

        const now = process.hrtime.bigint()
        const total = ms(now - startTime)
        const frame = ms(now - lastTime)

        this.lastTime = now

        return {
            total,
            frame
        };
    }
}

export { Timer };