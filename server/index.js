const webSocketsServerPort = 8001;
const fs = require('fs');
const https = require('https');
const WebSocket = require('ws');

// const webSocketServer = require('websocket').server;
const express = require('express');
const app = express();
//spinning the http server and the websocket server.
// const server = http.createServer(app);
// server.listen(webSocketsServerPort);

// console.log('listening on port ' + webSocketsServerPort);

var path_root = '/etc/letsencrypt/live/davidvendel.com/';
var options = {
    cert: fs.readFileSync(`${path_root}cert.pem`),
    key: fs.readFileSync(`${path_root}privkey.pem`),
};
var server = https.createServer(options, app);
server.listen(webSocketsServerPort, () => {
    console.log(`https- listening on *:${webSocketsServerPort}`);
});
// const io = require('socket.io').listen(https);
const wss = new WebSocket.Server({ server });

const CONSTANT = 10;

// const wsServer = new webSocketServer({
//     server: https,
// });

const clients = {}; //here we will store all the connected clients
const clients_timeouts = {}; //here we will store all the timeouts for clients to get rid of them if they dont respon to ping pong
let pairs = [];
let pairs_name = [];
let games = [];

const getUniqueID = () => {
    const s4 = () =>
        Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    return s4() + s4() + '_' + s4();
};

app.get('/', (req, res) => {
    console.log('hello');
    res.send('Hello World');
    // res.sendFile(path.join(__dirname, "static", "index.html"));
});

// wss.on('connection', function connection(ws) {
//     ws.on('message', function incoming(message) {
//         console.log('received: %s', message);
//     });

//     ws.send('something');
// });

wss.on('connection', (ws) => {
    var userID = getUniqueID();
    console.log('Received a new connection from origin ');

    clients[userID] = ws;
    console.log(
        'Connected ' + userID + ' in ' + Object.getOwnPropertyNames(clients)
    );
    console.log('clients', Object.keys(clients));

    setTimeout(() => {
        for (key in clients) {
            console.log('sending to client', key);
            //also ping pong
            clients[key].send(
                JSON.stringify({
                    type: 'pingpong',
                    playersCount: Object.keys(clients).length,
                    ping: true,
                    userID: key,
                })
            );
        }
    }, 30);

    ws.on('message', function (message) {
        console.log('Received Message: ', message, JSON.parse(message).type);

        if (JSON.parse(message).type === 'logIn') {
            console.log('login', pairs);
            pairs.push(userID);
            const parsedMessage = JSON.parse(message);

            if (games.length && games[games.length - 1].waiting) {
                console.log('There exists a waiting game. I add you in.');
                games[games.length - 1].player2 = {
                    id: userID,
                    name: parsedMessage.userName,
                };
                const thisGame = games[games.length - 1];

                clients[thisGame.player1.id].send(
                    JSON.stringify({
                        type: 'logIn',
                        status: 200,
                        waiting: false,
                        userID: thisGame.player1,
                        player1: thisGame.player1,
                        player2: thisGame.player2,
                        gameID: thisGame.gameID,
                    })
                );

                clients[thisGame.player2.id].send(
                    JSON.stringify({
                        type: 'logIn',
                        status: 200,
                        waiting: false,
                        userID: thisGame.player2.id,
                        player1: thisGame.player1,
                        player2: thisGame.player2,
                        gameID: thisGame.gameID,
                    })
                );
            } else {
                console.log('There is no waiting game > create');
                const newGame = {
                    player1: { id: userID, name: parsedMessage.userName },
                    waiting: true,
                    gameID: getUniqueID(),
                };
                games.push(newGame);

                clients[userID].send(
                    JSON.stringify({
                        type: 'logIn',
                        status: 200,
                        waiting: true,
                        userID: userID,
                        gameID: newGame.gameID,
                    })
                );
            }

            // if (pairs.length % 2 === 1) {
            //     console.log('length is modulo 1');
            //     clients[userID].send(
            //         JSON.stringify({
            //             type: 'logIn',
            //             status: 200,
            //             waiting: true,
            //             userID: userID,
            //         })
            //     );
            // } else {
            //     console.log('length modulo 0 ');
            //     previousUserID = pairs[pairs.length - 2];
            //     clients[userID].send(
            //         JSON.stringify({ type: 'logIn', waiting: false })
            //     );
            //     clients[previousUserID].send(
            //         JSON.stringify({ type: 'logIn', waiting: false })
            //     );
            // }
        }

        if (JSON.parse(message).type === 'message') {
            console.log('message came', pairs_name, JSON.parse(message).user);

            for (let i = 0; i < pairs.length; i++) {
                if (JSON.parse(message).user === pairs_name[i]) {
                    clients[pairs[i]].send(message);
                    clients[pairs[i]].close();
                    if (i % 2 === 0) {
                        clients[pairs[i + 1]].send(message);
                    } else {
                        clients[pairs[i - 1]].send(message);
                    }
                }
            }
        }

        if (JSON.parse(message).type === 'pingpong') {
            const userID = JSON.parse(message).userID;
            console.log('pingpong', userID);

            setTimeout(() => {
                clients[userID].send(
                    JSON.stringify({
                        type: 'pingpong',
                        playersCount: Object.keys(clients).length,
                        ping: true,
                        userID: userID,
                    })
                );
            }, 1000 * CONSTANT);

            clearTimeout(clients_timeouts[userID]);
            clients_timeouts[userID] = setTimeout(() => {
                console.log('User ', userID, ' is disconnected');
                delete clients[userID];
            }, 1000 * CONSTANT + 2200);
        }
    });
});
