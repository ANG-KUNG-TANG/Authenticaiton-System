import { EventEmitter } from 'events'


class AppEmitter extends EventEmitter {
    constructor(){
        super()
        this.setMaxListeners(20)

        this.on('error', (err) => {
            console.error('[EventEmitter] Unhandled error event: ', err)
        })
    }

    //safe emit 
    safeEmit(event, payload){
        try{
            this.emit(event, payload)
        } catch (err) {
            console.error(`[EventEmitter] Error in handler for "${event}" : `, err)
        }
    }
}

const emitter = new AppEmitter();

export default emitter;