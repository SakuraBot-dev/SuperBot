import { client as Client } from 'websocket';
import config from '../../../config';
import logger from '../logger';
import { socket as socketEmitter } from './event';

const socket = new Client();

const init = (retry: number = 0) => {
  socket.removeAllListeners('connect');
  socket.removeAllListeners('connectFailed');

  socket.on('connect', (conn) => {
    socketEmitter.emit('connect');

    conn.on('message', (data) => {
      if (data.utf8Data != null) {
        const msg = JSON.parse(data.utf8Data);
        socketEmitter.emit('message', msg);
      }
    });

    conn.on('close', (code, desc) => {
      logger('WebSocket').warn('断开连接, code:', code, ', desc:', desc);
      setTimeout(() => {
        init(retry++);
      }, config.connect.reconnect)
    })
  })

  socket.on('connectFailed', (error) => {
    logger('WebSocket').error('连接失败', error);
  });

  socket.connect(`ws://${config.connect.host}:${config.connect.ws_port}/?access_token=${config.connect.token}`);
}

export default init;