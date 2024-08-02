import { isSome } from "../lib";


export enum MessageType {
    Pixels = 'pixels'
}

export interface Message {
    type: MessageType,
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
                type: MessageType.Pixels,
                numPixels,
                x: view.getUint16(2, true),
                y: view.getUint16(4, true),
                pixels: new Uint8Array(view.buffer, 6, 3 * numPixels),
            } as PixelsMessage;
    }
}


type MessageHandler = (msg: Message) => void;

type Listeners = {
    [event in MessageType]: MessageHandler[];
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
        for (const event of Object.values(MessageType))
            listeners[event] = [];
        this.listeners = listeners as Listeners;

        const socket = new WebSocket(url);
        socket.binaryType = 'arraybuffer';

        socket.addEventListener('open', e => {
            console.log('Connected to server.');
        });

        socket.addEventListener('close', e => {
            console.log('Connection to server closed.');
        });

        socket.addEventListener('message', e => {
            for (const listener of this.listeners[MessageType.Pixels])
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

    addEventListener = (type: MessageType, handler: MessageHandler) => {
        if (isSome(this.listeners[type])) {
            this.listeners[type].push(handler);
        } else {
            this.listeners[type] = [handler];
        }
    }

    removeEventListener = (type: MessageType, handler: MessageHandler) => {
        if (!isSome(this.listeners[type]))
            return;
        const i = this.listeners[type].indexOf(handler);
        this.listeners[type].splice(i, 1);
    }
}
