export type MessageType = 'pixels' | 'close';


export interface Message {
    type: MessageType,
}

export interface PixelsMessage extends Message {
    type: 'pixels',
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
                type: 'pixels',
                numPixels,
                x: view.getUint16(2, true),
                y: view.getUint16(4, true),
                pixels: new Uint8Array(view.buffer, 6, 3 * numPixels),
            } as PixelsMessage;
    }
}

type MessageHandler = (msg: Message) => void;


interface ConnectionOptions {
    url: URL,
}

export class Connection {
    static DEFAULT_HEARTBEAT = 1;

    socket: WebSocket;
    heartbeat: number
    listeners: Record<MessageType, MessageHandler[]>;

    constructor({ url }: ConnectionOptions) {
        this.listeners = {
            'pixels': [],
            'close': [],
        };

        const socket = new WebSocket(url);
        socket.binaryType = 'arraybuffer';
        socket.addEventListener('open', e => {
            console.log('Connected to server.');
        });
        socket.addEventListener('close', e => {
            for (const listener of this.listeners['close'])
                listener({ type: 'close' });
        });
        socket.addEventListener('message', e => {
            console.log('Received message:', e.data);
            for (const listener of this.listeners['pixels'])
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

    addEventListener = (type: MessageType, handler: MessageHandler) => {
        this.listeners[type].push(handler);
    }

    removeEventListener = (type: MessageType, handler: MessageHandler) => {
        const i = this.listeners[type].indexOf(handler);
        this.listeners[type].splice(i, 1);
    }
}
