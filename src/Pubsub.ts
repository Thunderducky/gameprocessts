type SubscribeFn = {
    (msg: any, topic: string): void
}
class Pubsub {
    topicSubscribers: Map<string, SubscribeFn[]>
    constructor(){
        this.topicSubscribers = new Map<string, SubscribeFn[]>();
    }
    publish = (topic:string, message: any):void => {
        if(this.topicSubscribers.has(topic)){
            const subscribers = this.topicSubscribers.get(topic) as SubscribeFn[]
            subscribers.forEach(sub => sub(message,topic))
        }
    }
    subscribe = (topic:string, fn: SubscribeFn): void => {
        if(this.topicSubscribers.has(topic)){
            const subscribers = this.topicSubscribers.get(topic) as SubscribeFn[]
            subscribers.push(fn)
        } else {
            this.topicSubscribers.set(topic, [fn])
        }
    }
}
const PUBSUB = new Pubsub();
export {PUBSUB, Pubsub, SubscribeFn}