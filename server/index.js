require('dotenv').config();
const WEBSOCKET_SERVER_PORT = process.env.WEBSOCKET_SERVER_PORT;
const PATH_ROOT = process.env.PATH_ROOT;
const WEBSITE_URL = process.env.WEBSITE_URL;
const PRODUCTION_MODE = process.env.NODE_ENV === 'production';

const CONSTANT = 1;

console.log(
    'WEBSOCKET_SERVER_PORT',
    WEBSOCKET_SERVER_PORT,
    'prod: (must be true if you run this on server)',
    PRODUCTION_MODE,
    'path to your encryption',
    PATH_ROOT
);

const express = require('express');
const app = express();
const fs = require('fs');
const https = require('https');
const http = require('http');
socketIo = require('socket.io');

let server;
let io;

if (PRODUCTION_MODE) {
    const options = {
        cert: fs.readFileSync(`${PATH_ROOT}cert.pem`),
        key: fs.readFileSync(`${PATH_ROOT}privkey.pem`),
    };
    server = https.createServer(options, app);

    io = socketIo(server, {
        // path: '/chat/socket.io',
        cors: {
            origin: WEBSITE_URL,
            methods: ['GET', 'POST'],
        },
        pingTimeout: 180000,
        pingInterval: 25000,
    });

    // const io = require('socket.io').listen(https);
} else {
    server = http.createServer(app);
    io = socketIo(server, {
        cors: {
            origin: WEBSITE_URL,
            methods: ['GET', 'POST'],
        },
        pingTimeout: 180000,
        pingInterval: 2500,
    });
}

gamesHistory = {};

// const server = http.Server(app).listn(8001);

const onConnection = (socket) => {
    console.log('onConnection');
    console.log('on connection');

    socket.emit('game.begin');

    socket.on('message', (data) => {
        console.log(data);
    });

    socket.on('disconnect', () => {
        console.log('disconnect');
    });
};

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
            const toSend = {
                gameID: game.gameID,
                player1: game.player1,
                player2: game.player2,
                what: what,
                who: userID,
            };
            try {
                clients[game.player1.id].emit('leftGame', toSend);
            } catch (err) {
                console.warn('resigned game player1 send error');
            }
            try {
                clients[game.player2.id].emit('leftGame', toSend);
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

app.get('/socket.io', (req, res) => {
    console.log('hello socket');
    res.send('Hello World socket');
    // res.sendFile(path.join(__dirname, "static", "index.html"));
});

// wss.on('connection', function connection(ws) {
//     ws.on('message', function incoming(message) {
//         console.log('received: %s', message);
//     });

//     ws.send('something');
// });

const emitPlayersOnlineCount = (userID) => {
    //also ping pong

    // console.log('emmit players online count', Object.keys(clients).length);
    Object.keys(clients).forEach((key) => {
        const client = clients[key];

        try {
            client.emit('playersCount', {
                playersCount: Object.keys(clients).length,
                userID: userID,
            });
        } catch (err) {}
    });

    // kickOutIfDisconnected(userID);
};

io.on('connection', (ws) => {
    var userID = getUniqueID();

    // ws.onAny((event, ...args) => {
    //     console.log(`--- got ${event}`);
    // });

    clients[userID] = ws;
    console.log(
        'Connected ' + userID + ' connected users are: ',
        Object.getOwnPropertyNames(clients)
    );

    emitPlayersOnlineCount(userID);

    ws.on('disconnect', (reason) => {
        if (reason === 'io server disconnect') {
            // the disconnection was initiated by the server, you need to reconnect manually
            socket.connect();
        }
        console.log('disconnected', userID, reason);
        delete clients[userID];
        emitPlayersOnlineCount(userID);
        resignedOrLeft(userID, undefined, 'left');
        // else the socket will automatically try to reconnect
    });

    ws.on('echo', (message) => {
        ws.emit('echo', message);
    });

    ws.on('clicked', (parsedMessage) => {
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
                        console.log('sending clicked to', opponent);
                        clients[opponent].emit('clicked', {
                            who: userID,
                            gameID: game.gameID,
                            x: parsedMessage.x,
                            y: parsedMessage.y,
                            iteration: parsedMessage.iteration,
                        });
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
    });

    ws.on('logIn', (message) => {
        console.log(
            'login - user ',
            message.userName,
            ' requested a game. games are: ',
            games.slice(-3)
        );
        // pairs.push(userID);
        if (!message.userName) {
            console.error('no username in message');
            return;
        }

        if (
            games.length &&
            games[games.length - 1].waiting &&
            games[games.length - 1].active
        ) {
            console.log('There exists a waiting game. I add you in.');
            games[games.length - 1].player2 = {
                id: userID,
                name: message.userName,
                active: true,
            };
            games[games.length - 1].waiting = false;
            const thisGame = games[games.length - 1];

            try {
                clients[thisGame.player1.id].emit('logIn', {
                    status: 200,
                    waiting: false,
                    userID: thisGame.player1.id,
                    player1: thisGame.player1,
                    player2: thisGame.player2,
                    gameID: thisGame.gameID,
                });
            } catch (err) {
                console.warn('error player1', err);
            }

            try {
                console.log('thisGame', thisGame, thisGame.player1);
                clients[thisGame.player2.id].emit('logIn', {
                    status: 200,
                    waiting: false,
                    userID: thisGame.player2.id,
                    player1: thisGame.player1,
                    player2: thisGame.player2,
                    gameID: thisGame.gameID,
                });
            } catch (err) {
                console.warn('error player2', err);
            }
        } else {
            console.log('There is no waiting game > create');
            games = [...games];

            const player1 = {
                id: userID,
                name: message.userName,
                active: true,
            };

            const newGame = {
                gameID: getUniqueID(),
                player1: player1,
                waiting: true,
                active: true,
            };
            games.push(newGame);

            try {
                ws.emit('login', {
                    status: 200,
                    waiting: true,
                    userID: userID,
                    gameID: newGame.gameID,
                    player1: newGame.player1,
                });
            } catch (err) {
                console.warn('error sitting player to wait', err);
            }
        }
    });

    ws.on('broadcast', (message) => {
        console.log('broadcast  from game ', message.gameID);

        if (message.grid) {
            gamesHistory[message.gameID] = message.grid;
        }

        let gamesToSend = [];
        games.slice(-2).forEach((g) => {
            gamesToSend.push({
                gameID: g.gameID,
                grid: gamesHistory[g.gameID],
                iteration: message.iteration,
            });
        });

        const keys = Object.keys(clients);

        keys.forEach((key) => {
            clients[key].emit('broadcast', {
                gameID: message.gameID,
                // grid: message.grid,
                gamesToSend: JSON.stringify(gamesToSend),
            });
        });
    });

    ws.on('message', function (message) {
        // console.log(getUniqueID());
        const parsedMessage = JSON.parse(message);

        if (parsedMessage.type !== 'broadcast') {
            console.log(
                'Received Message: ',
                parsedMessage,
                parsedMessage?.type
            );
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

        // if (JSON.parse(message).type === 'pingpong') {
        //     const userID = parsedMessage.userID;
        //     // console.log('pingpong', userID);

        //     setTimeout(() => {
        //         try {
        //             clients[userID].send(
        //                 JSON.stringify({
        //                     type: 'pingpong',
        //                     playersCount: Object.keys(clients).length,
        //                     ping: true,
        //                     userID: userID,
        //                 })
        //             );
        //         } catch (err) {
        //             console.warn('couldnt send pingpong to', userID);
        //         }
        //     }, 1000 * CONSTANT);

        //     kickOutIfDisconnected(userID);
        // }
    });
});

server.listen(WEBSOCKET_SERVER_PORT, () => {
    console.log(`https- listening on *:${WEBSOCKET_SERVER_PORT}`);
});
