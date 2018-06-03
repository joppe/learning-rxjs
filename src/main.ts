import { Observable, interval, Subject } from 'rxjs';
import { scan, filter, map, publishReplay, refCount } from 'rxjs/operators';

const updates = new Subject();
const create = new Subject();
const newMessages = new Subject();

/**
 * An event occurs when new data is pushed to a stream.
 */

/**
 * By calling the `pipe` method on the `updates` Subject, a new observable is created.
 * The new observable is assigned to `messages`.
 * The `messages` observable acts on events from the `updates` subject. When an event is fired by `updates` the 
 * `messages` observable acts on the data emitted by the event from the `updates` subject.
 * 
 * The operators that are applied to the `updates` subject, create (each time) a new observable with specific behavior.
 * The scan operator, creates an observable that acts as a reduce method.
 * The `updates` observer parts accepts functions as values, the functions operate on an array of strings (Chuck Norris facts).
 * 
 * When the data is transformed by the `operation` functions, the result is emitted as a new event. Each observer that is subscribed to
 * the `messages` observer receives the array of Chuck Norris facts.
 */
const messages = updates.pipe(
    scan((msgs, operation: Function) => operation(msgs), []),
    publishReplay(1),
    refCount()
);

messages.subscribe(msgs => {
    document.body.innerHTML = msgs.join('<br>');
});


/**
 * By applying an operator the the `create` subject, a new observable is created.
 */
create.pipe(
    /**
     * The map operator transforms the msg string to a function. The function accepts as argument an array of Chuck Norris facts and returns a new array with
     * the new fact included.
     * 
     * The value that is emited by the create observable is transformed to a function. This function is emitted as the value of the new event. Each observer 
     * that is subscribed to this observable receives this function.
     */
    map((msg) => {
        return msgs => msgs.concat(msg);
    })
).subscribe(updates);

newMessages.subscribe(create);

function addMessage(msg) {
    newMessages.next(msg);
}

async function msgFromChuck() {
    const resp = await fetch('https://api.chucknorris.io/jokes/random');
    const json = await resp.json();

    return Promise.resolve(json.value);
}

function addMsgFromChuck() {
    msgFromChuck().then(quote => {
        addMessage(quote);

        window.setTimeout(addMsgFromChuck, 400);
    });
}

// addMsgFromChuck();
