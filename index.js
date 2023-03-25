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

cursors = {};
words = {};

function getCurrentDate() {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}-${month}-${day}`;
  }

app.get('/words', (req, res) => {
    if(Object.keys(words).length === 0) {
        axios.get(`http://127.0.0.1:5000/date/${getCurrentDate()}/words`)
        .then(response => {
            words = response.data;
            res.send(response.data);
        })
        .catch(err => {
            console.log(err);
            res.status(500).send('Internal server error');
        });
    } else {
        res.send(words);
    }
})

app.post('/loginGoogle', (req, res) => {
    axios.post('http://127.0.0.1:5000/loginGoogle', req.body)
    .then(response => {
        res.send(response.data);
    })
    .catch(err => {
        console.log(err);
        res.status(500).send('Internal server error');
    });
});

io.on('connection', (socket) => {
    console.log('socket connected with id ' + socket.id);
    cursors[socket.id] = {
        tryword: '',
        color: '[255, 187, 0]' // default yellow color
    };

    socket.on('google signin', (googleData) => {
        cursors[socket.id] = {
            tryword: cursors[socket.id] ? cursors[socket.id].tryword : '',
            color: googleData.preferredColor,
            profilePicture: googleData.picture
        };
        io.emit('redraw cursors', cursors);
    });

    socket.on('wordupdate', (html) => {
        cursors[socket.id] = html;
        socket.broadcast.emit('wordrefresh', html, socket.id);
    });

    socket.on('disconnect', () => {
        io.emit('user disconnection', socket.id);
        delete cursors[socket.id];
        console.log('user ' + socket.id + ' disconnected');
    });
});



server.listen(3000, () => {
    console.log('listening on *:3000');
});
