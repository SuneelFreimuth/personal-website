import { isSome } from "../lib";


export enum ConnectionEvent {
    Pixels = 'pixels',
    Close = 'close'
}


export interface Message {
    type: ConnectionEvent,
}

export interface PixelsMessage extends Message {
    x: number,
    y: number,
    numPixels: number,
    pixels: Uint8Array,
}

function deserializeMessage(data: ArrayBufferLike): Message {
    const view = new DataView(data);
    switch (view.getUint8(0)) {
        case 0:
        default:
            const numPixels = view.getUint8(1);
            return {
                type: ConnectionEvent.Pixels,
                numPixels,
                x: view.getUint16(2, true),
                y: view.getUint16(4, true),
                pixels: new Uint8Array(view.buffer, 6, 3 * numPixels),
            } as PixelsMessage;
    }
}


type EventHandler = (event: ConnectionEvent) => void;

type Listeners = {
    [event in ConnectionEvent]: EventHandler[];
};

interface ConnectionConfig {
    url: URL,
}

export class Connection {
    static DEFAULT_HEARTBEAT = 1;

    public socket: WebSocket;
    public heartbeat: number
    listeners: Listeners;

    constructor({ url }: ConnectionConfig) {
        const listeners = {};
        for (const event of Object.values(ConnectionEvent))
            listeners[event] = [];
        this.listeners = listeners as Listeners;

        const socket = new WebSocket(url);
        socket.binaryType = 'arraybuffer';

        socket.addEventListener('open', e => {
            console.log('Connected to server.');
        });

        socket.addEventListener('close', e => {
            for (const listener of this.listeners[ConnectionEvent.Close])
                listener(e);
        });

        socket.addEventListener('message', e => {
            for (const listener of this.listeners[ConnectionEvent.Pixels])
                listener(deserializeMessage(e.data));
        });

        this.socket = socket;
    }

    send = (msg: string) => {
        this.socket.send(msg);
    }

    close = () => {
        this.socket.close();
    }

    isOpen = () =>
        this.socket.readyState === WebSocket.OPEN;

    addEventListener = (type: ConnectionEvent, handler: MessageHandler) => {
        if (isSome(this.listeners[type])) {
            this.listeners[type].push(handler);
        } else {
            this.listeners[type] = [handler];
        }
    }

    removeEventListener = (type: ConnectionEvent, handler: MessageHandler) => {
        if (!isSome(this.listeners[type]))
            return;
        const i = this.listeners[type].indexOf(handler);
        this.listeners[type].splice(i, 1);
    }
}
