const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static(__dirname + '/client'));

io.on('connection', function (socket) {
    console.log('Socket Connected');
    socket.emit('message', 'Hello Socket');
    socket.on('message', function (msg) {
        console.log(msg);
    });
});

http.listen(8080, () => console.log('Server is running @ localhost:8080')); //port
