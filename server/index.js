const webSocketsServerPort = 8001;
const webSocketServer = require('websocket').server;
const http = require('http');
const express = require('express');
const app = express();
//spinning the http server and the websocket server.
const server = http.createServer(app);
server.listen(webSocketsServerPort);

console.log('listening on port ' + webSocketsServerPort);

const wsServer = new webSocketServer({
    httpServer: server,
});

const clients = {}; //here we will store all the connected clients
const clients_timeouts = {}; //here we will store all the timeouts for clients to get rid of them if they dont respon to ping pong
let pairs = [];
let pairs_name = [];

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

wsServer.on('request', (request) => {
    var userID = getUniqueID();
    console.log('Received a new connection from origin ' + request.origin);

    const connection = request.accept(null, request.origin);
    clients[userID] = connection;
    console.log(
        'Connected ' + userID + ' in ' + Object.getOwnPropertyNames(clients)
    );
    console.log('clients', Object.keys(clients));

    setTimeout(() => {
        for (key in clients) {
            console.log('sending to client', key);
            //also ping pong
            clients[key].sendUTF(
                JSON.stringify({
                    type: 'pingpong',
                    playersCount: 1,
                    ping: true,
                    userID: key,
                })
            );
        }
    }, 3000);

    connection.on('message', function (message) {
        if (message.type === 'utf8') {
            console.log(
                'Received Message: ',
                message.utf8Data,
                JSON.parse(message.utf8Data).type
            );
            console.log('clients length', Object.keys(clients).length);

            if (JSON.parse(message.utf8Data).type === 'logIn') {
                console.log('login', pairs);
                pairs.push(userID);
                pairs_name.push(JSON.parse(message.utf8Data).user);

                if (pairs.length % 2 === 1) {
                    console.log('length is modulo 1');
                    clients[userID].sendUTF(
                        JSON.stringify({
                            type: 'logIn',
                            status: 200,
                            waiting: true,
                            userID: userID,
                        })
                    );
                } else {
                    console.log('length modulo 0 ');
                    previousUserID = pairs[pairs.length - 2];
                    clients[userID].sendUTF(
                        JSON.stringify({ type: 'logIn', waiting: false })
                    );
                    clients[previousUserID].sendUTF(
                        JSON.stringify({ type: 'logIn', waiting: false })
                    );
                }
            }

            if (JSON.parse(message.utf8Data).type === 'pingpong') {
                const userID = JSON.parse(message.utf8Data).userID;
                console.log('pingpong', userID);

                setTimeout(() => {
                    clients[userID].sendUTF(
                        JSON.stringify({
                            type: 'pingpong',
                            playersCount: Object.keys(clients).length,
                            ping: true,
                            userID: userID,
                        })
                    );
                }, 1000);

                clearTimeout(clients_timeouts[userID]);
                clients_timeouts[userID] = setTimeout(() => {
                    console.log('User ', userID, ' is disconnected');
                    delete clients[userID];
                }, 2200);
            }

            // if ( Object.keys(clients).length === 1) {
            //     for(key in clients) {
            //         clients[key].sendUTF(JSON.stringify({type: "response", value: "waiting"}));
            //         // console.log('sent Message to: ', clients[key]);
            //       }
            // }
            // broadcasting message to all connected clients

            if (JSON.parse(message.utf8Data).type === 'message') {
                console.log(
                    'message came',
                    pairs_name,
                    JSON.parse(message.utf8Data).user
                );
                // for(key in clients) {
                //     clients[key].sendUTF(message.utf8Data);
                //     // console.log('sent Message to: ', clients[key]);
                // }
                for (let i = 0; i < pairs.length; i++) {
                    if (JSON.parse(message.utf8Data).user === pairs_name[i]) {
                        clients[pairs[i]].sendUTF(message.utf8Data);
                        clients[pairs[i]].close();
                        if (i % 2 === 0) {
                            clients[pairs[i + 1]].sendUTF(message.utf8Data);
                        } else {
                            clients[pairs[i - 1]].sendUTF(message.utf8Data);
                        }
                    }
                }
            }
        }
    });
});
