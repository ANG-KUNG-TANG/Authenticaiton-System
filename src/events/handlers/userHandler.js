import emitter from '../eventEmitter.js';
import { USER_EVENTS } from '../index.js';


const registerUserHandlers = () => {
    emitter.on(USER_EVENTS.CREATED, (user) => {
        console.log(`[USER] Created: ${user.email}`)
    })

    emitter.on(USER_EVENTS.UPDATED, (user) => {
        console.log(`[USER] Updated: ${user.id}`)
    })

    emitter.on(USER_EVENTS.DELETED, (user) => {
        console.log(`[USER] Deleted: ${user.id}`)
    })
};

export default registerUserHandlers