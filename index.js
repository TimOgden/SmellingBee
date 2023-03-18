const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
const axios = require('axios');
const bodyParser = require('body-parser');


app.use(bodyParser.json());
app.use('/static', express.static(__dirname + '/static'));
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/loginGoogle', (req, res) => {
    axios.post('http://127.0.0.1:5000/loginGoogle', req.body)
    .then(response => {
        console.log(res);
        res.send(response.data);
    })
    .catch(err => {
        console.log(err);
        res.status(500).send('Internal server error');
    });
});

cursors = {};

io.on('connection', (socket) => {
    console.log('socket connected with id ' + socket.id);
    cursors[socket.id] = '';
    io.emit('user connection', cursors);

    socket.on('wordupdate', (html) => {
        cursors[socket.id] = html;
        socket.broadcast.emit('wordrefresh', html, socket.id);
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
