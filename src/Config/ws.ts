import { io } from 'socket.io-client';

export class WsConfig {
    // static SOCKET = io('http://5.35.88.252:5010');
    static SOCKET = io('http://localhost:5010');
}