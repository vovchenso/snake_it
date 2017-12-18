const WebSocket = require('ws');
const Config = require('./config');

const wss = new WebSocket.Server({ port: Config.PORT });

wss.on('connection', ws => {

    ws.on('message', message => {
        console.log('received: %s', message);
    });

});