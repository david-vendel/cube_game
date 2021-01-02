import io from 'socket.io-client';

const PRODUCTION_MODE = process.env.NODE_ENV === 'production';

const WEBSOCKET_URL = PRODUCTION_MODE ? '/' : 'http://localhost:8001';

console.log('WEBSOCKET_URL', WEBSOCKET_URL);

// let client = new W3CWebSocket(WEBSOCKET_URL);
export const socket = io(WEBSOCKET_URL, {
    secure: true,
    rejectUnauthorized: false,
    path: PRODUCTION_MODE ? '/socket.io' : '',
});
