const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

app.use('/static', express.static(__dirname + '/static'));
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

cursors = {};

io.on('connection', (socket) => {
    console.log('socket connected with id ' + socket.id);
    cursors[socket.id] = '|';
    io.emit('user connection', cursors);

    socket.on('wordupdate', (html) => {
        cursors[socket.id] = html;
        io.emit('wordrefresh', html, socket.id);
    });

    socket.on('disconnect', () => {
        io.emit('user disconnection', socket.id);
        delete cursors[socket.id];
        io.emit
        console.log('user ' + socket.id + ' disconnected');
    });
});



server.listen(3000, () => {
    console.log('listening on *:3000');
});
