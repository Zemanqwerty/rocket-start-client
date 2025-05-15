import { io } from 'socket.io-client';

export class WsConfig {
    static SOCKET = io('http://localhost:5010');
}