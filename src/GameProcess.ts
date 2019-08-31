interface GameProcessEventCallback {
    (gameProcess: GameProcess): void
}
type GameProcessEventList = {
    onStart?: GameProcessEventCallback,
    onTick?: GameProcessEventCallback,
    onPause?: GameProcessEventCallback;
    onResume?: GameProcessEventCallback
    onComplete?: GameProcessEventCallback,
    onCancel?: GameProcessEventCallback,
}
class GameProcess {
    completed: boolean;
    cancelled: boolean;
    paused: boolean;

    onStart: GameProcessEventCallback;
    onPause: GameProcessEventCallback;
    onResume: GameProcessEventCallback;
    onTick: GameProcessEventCallback;
    onComplete: GameProcessEventCallback;
    onCancel: GameProcessEventCallback;

    constructor(events: GameProcessEventList = {}){
        const NOOP = () => {};
        this.completed = false;
        this.cancelled = false;
        this.paused = false;
        this.onStart = events.onStart || NOOP;
        this.onTick = events.onTick || NOOP;
        this.onComplete = events.onComplete || NOOP;
        this.onCancel = events.onCancel || NOOP;
        this.onPause = events.onPause || NOOP;
        this.onResume = events.onResume || NOOP;
    }
    start(){
        this.onStart(this);
    }
    tick(){
        this.onTick(this);
    }
    pause(){
        this.paused = true;
        this.onPause(this);
        
    }
    resume(){
        this.paused = false;
        this.onResume(this);
    }
    complete(){
        this.completed = true;
        this.onComplete(this);
        
    }
    cancel(){
        this.cancelled = true;
        this.onCancel(this);
        
    }
}

export { GameProcess, GameProcessEventCallback, GameProcessEventList}