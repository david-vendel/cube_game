require('dotenv').config();
const WEBSOCKET_SERVER_PORT = process.env.WEBSOCKET_SERVER_PORT;
const PATH_ROOT = process.env.PATH_ROOT;
const PRODUCTION_MODE = process.env.NODE_ENV === 'production';

const CONSTANT = 1;

// let SERVER = "http://localhost:6900";
// if (PRODUCTION_MODE) {
//   SERVER = "/back";
// }

console.log(
    'WEBSOCKET_SERVER_PORT',
    WEBSOCKET_SERVER_PORT,
    'prod: (must be true if you run this on server)',
    PRODUCTION_MODE,
    'path to your encryption',
    PATH_ROOT
);

const webSocketsServerPort = WEBSOCKET_SERVER_PORT;
const express = require('express');
const app = express();
const fs = require('fs');
const https = require('https');
const http = require('http');
const WebSocket = require('ws');

let server;
const uniqueIDs = [];
gamesHistory = {};

if (PRODUCTION_MODE) {
    const options = {
        cert: fs.readFileSync(`${PATH_ROOT}cert.pem`),
        key: fs.readFileSync(`${PATH_ROOT}privkey.pem`),
    };
    server = https.createServer(options, app);

    // const io = require('socket.io').listen(https);
} else {
    server = http.createServer(app);
}

const wss = new WebSocket.Server({ server });

server.listen(webSocketsServerPort, () => {
    console.log(`https- listening on *:${webSocketsServerPort}`);
});

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
    let uniqueID = s4() + '_' + s4();
    if (uniqueIDs.some((uid) => uid === uniqueID)) {
        console.error(' ------------ UNIQUE ID DUPLICIT --------- ');
        console.log('uniqueids', uniqueIDs);
        uniqueID = getuniqueID();
        return;
    }
    console.log('>>> Unique ID: ', uniqueID);
    uniqueIDs.push(uniqueID);
    return uniqueID;
};

const kickOutIfDisconnected = (userID) => {
    clearTimeout(clients_timeouts[userID]);
    clients_timeouts[userID] = setTimeout(() => {
        delete clients[userID];

        console.log(
            'User ',
            userID,
            ' is disconnected, connected users are: ',
            Object.getOwnPropertyNames(clients)
        );

        resignedOrLeft(userID, undefined, 'left');
        console.log('games', games.slice(-3));
    }, 1000 * CONSTANT + 2200);
};

resignedOrLeft = (userID, gameID, what) => {
    if (!gameID) {
        games.forEach((game) => {
            if (game.active) {
                if (
                    game.player1?.id === userID ||
                    game.player2?.id === userID
                ) {
                    gameID = game.gameID;
                }
            }
        });
    }

    games.forEach((game) => {
        if (game.gameID === gameID) {
            game.active = false;
            game.waiting = false;
            if (game.player1?.id === userID) {
                if (game.player2) {
                    game.player2.won = true;
                }
            } else if (game.player2?.id === userID) {
                if (game.player1) {
                    game.player1.won = true;
                }
            }
            const toSend = JSON.stringify({
                type: 'leftGame',
                gameID: game.gameID,
                player1: game.player1,
                player2: game.player2,
                what: what,
                who: userID,
            });
            try {
                clients[game.player1.id].send(toSend);
            } catch (err) {
                console.warn('resigned game player1 send error');
            }

            try {
                clients[game.player2.id].send(toSend);
            } catch (err) {
                console.warn('resigned game player2 send error');
            }
        }
    });

    console.log('game was finished', games.slice(-3));
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
        'Connected ' + userID + ' connected users are: ',
        Object.getOwnPropertyNames(clients)
    );

    setTimeout(() => {
        //also ping pong
        ws.send(
            JSON.stringify({
                type: 'pingpong',
                playersCount: Object.keys(clients).length,
                ping: true,
                userID: userID,
            })
        );

        kickOutIfDisconnected(userID);
    }, 30);

    ws.on('message', function (message) {
        // console.log(getUniqueID());
        const parsedMessage = JSON.parse(message);

        if (parsedMessage.type !== 'pingpong') {
            console.log(
                'Received Message: ',
                parsedMessage,
                parsedMessage?.type
            );
        }
        if (JSON.parse(message).type === 'logIn') {
            console.log(
                'login - user ',
                parsedMessage.userID,
                ' requested a game. games are: ',
                games.slice(-3)
            );
            // pairs.push(userID);

            if (
                games.length &&
                games[games.length - 1].waiting &&
                games[games.length - 1].active
            ) {
                console.log('There exists a waiting game. I add you in.');
                games[games.length - 1].player2 = {
                    id: userID,
                    name: parsedMessage.userID,
                    active: true,
                };
                games[games.length - 1].waiting = false;
                const thisGame = games[games.length - 1];

                try {
                    clients[thisGame.player1.id].send(
                        JSON.stringify({
                            type: 'logIn',
                            status: 200,
                            waiting: false,
                            userID: thisGame.player1.id,
                            player1: thisGame.player1,
                            player2: thisGame.player2,
                            gameID: thisGame.gameID,
                        })
                    );
                } catch (err) {
                    console.warn('error player1', err);
                }

                try {
                    console.log('thisGame', thisGame, thisGame.player1);
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
                } catch (err) {
                    console.warn('error player2', err);
                }
            } else {
                console.log('There is no waiting game > create');
                games = [...games];
                const newGame = {
                    player1: {
                        id: userID,
                        name: parsedMessage.userID,
                        active: true,
                    },
                    waiting: true,
                    gameID: getUniqueID(),
                    active: true,
                };
                games.push(newGame);

                try {
                    clients[userID].send(
                        JSON.stringify({
                            type: 'logIn',
                            status: 200,
                            waiting: true,
                            userID: userID,
                            gameID: newGame.gameID,
                            player1: newGame.player1,
                        })
                    );
                } catch (err) {
                    console.warn('error sitting player to wait', err);
                }
            }
        }

        // if (JSON.parse(message).type === 'message') {
        //     console.log('message came', pairs_name, JSON.parse(message).user);

        //     for (let i = 0; i < pairs.length; i++) {
        //         if (JSON.parse(message).user === pairs_name[i]) {
        //             clients[pairs[i]].send(message);
        //             clients[pairs[i]].close();
        //             if (i % 2 === 0) {
        //                 clients[pairs[i + 1]].send(message);
        //             } else {
        //                 clients[pairs[i - 1]].send(message);
        //             }
        //         }
        //     }
        // }

        if (JSON.parse(message).type === 'resign') {
            console.log(
                'user ',
                parsedMessage.userID,
                ' from game ',
                parsedMessage.gameID,
                ' resigned or left.'
            );
            resignedOrLeft(
                parsedMessage.userID,
                parsedMessage.gameID,
                'resigned'
            );
        }

        if (JSON.parse(message).type === 'cancel') {
            console.log(
                'user ',
                parsedMessage.userID,
                ' from game ',
                parsedMessage.gameID,
                ' cancelled.'
            );

            games.forEach((game) => {
                if (game.gameID === parsedMessage.gameID) {
                    game.waiting = false;
                    game.active = false;
                }
            });

            console.log('games', games);
        }

        if (JSON.parse(message).type === 'clicked') {
            console.log(
                'user ',
                parsedMessage.userID,
                ' from game ',
                parsedMessage.gameID,
                ' clicked',
                parsedMessage.x,
                parsedMessage.y
            );

            games.forEach((game) => {
                if (game.gameID === parsedMessage.gameID) {
                    let opponent;
                    if (userID === game.player1?.id) {
                        opponent = game.player2?.id;
                    }
                    if (userID === game.player2?.id) {
                        opponent = game.player1?.id;
                    }
                    console.log(
                        'opponent',
                        opponent,
                        ' all clients are: ',
                        Object.keys(clients)
                    );
                    console.log('last 3 games:', games.slice(-3));
                    if (opponent) {
                        try {
                            clients[opponent].send(
                                JSON.stringify({
                                    type: 'clicked',
                                    who: userID,
                                    gameID: game.gameID,
                                    x: parsedMessage.x,
                                    y: parsedMessage.y,
                                })
                            );
                        } catch (err) {
                            console.log('error opponent send');
                        }
                    } else {
                        console.warn(
                            'opponent was not found. last 3 games:',
                            games.slice(-3)
                        );
                    }
                }
            });
        }

        if (parsedMessage.type === 'broadcast') {
            console.log('broadcast  from game ', parsedMessage.gameID);

            if (parsedMessage.grid) {
                gamesHistory[parsedMessage.gameID] = parsedMessage.grid;
            }

            let gamesToSend = [];
            games.slice(-2).forEach((g) => {
                gamesToSend.push({
                    gameID: g.gameID,
                    grid: gamesHistory[g.gameID],
                });
            });

            const keys = Object.keys(clients);
            keys.forEach((key) => {
                clients[key].send(
                    JSON.stringify({
                        type: 'broadcast',
                        gameID: parsedMessage.gameID,
                        // grid: parsedMessage.grid,
                        gamesToSend: JSON.stringify(gamesToSend),
                    })
                );
            });
        }

        if (JSON.parse(message).type === 'pingpong') {
            const userID = parsedMessage.userID;
            // console.log('pingpong', userID);

            setTimeout(() => {
                try {
                    clients[userID].send(
                        JSON.stringify({
                            type: 'pingpong',
                            playersCount: Object.keys(clients).length,
                            ping: true,
                            userID: userID,
                        })
                    );
                } catch (err) {
                    console.warn('couldnt send pingpong to', userID);
                }
            }, 1000 * CONSTANT);

            kickOutIfDisconnected(userID);
        }
    });
});
