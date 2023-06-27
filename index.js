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

function getCurrentDate(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}-${month}-${day}`;
  }

app.get('/yesterday', (req, res) => {
    let date = new Date();
    date.setDate(date.getDate() - 1);

    const dateStr = getCurrentDate(date);
    axios.get(`http://127.0.0.1:5000/date/${dateStr}/summary`)
    .then(response => {
        res.send(response.data);
    }).catch(err => {
        console.log(err);
        res.status(500).send('Interal server error');
    });
});

app.get('/todaysHints', (req, res) => {
    let date = new Date();

    const dateStr = getCurrentDate(date);
    axios.get(`http://127.0.0.1:5000/date/${dateStr}/todaysHints`)
    .then(response => {
        res.send(response.data);
    }).catch(err => {
        console.log(err);
        res.status(500).send('Interal server error');
    });
})

app.get('/words', (req, res) => {
    axios.get(`http://127.0.0.1:5000/date/${getCurrentDate(new Date())}/words`)
    .then(response => {
        words = response.data;
        res.send(response.data);
    })
    .catch(err => {
        console.log(err);
        res.status(500).send('Internal server error');
    });
    
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
        if(typeof cursors[socket.id] === 'undefined') {
            cursor[socket.id] = {
                tryword: html,
                color: '[255, 187, 0]' // default yellow color
            }
        } else {
            cursors[socket.id].tryword = html;
        }
        socket.broadcast.emit('wordrefresh', html, socket.id);
    });

    socket.on('wordsubmit', (word, user) => {
        axios.post(`http://127.0.0.1:5000/date/${getCurrentDate(new Date())}/user/${user}/submit`, {"word": word, "profilePicture": cursors[socket.id].profilePicture})
        .then(response => {
            response.data.id = socket.id;
            io.emit('pointsscore', response.data);

            axios.get(`http://127.0.0.1:5000/date/${getCurrentDate(new Date())}/words`).then(res2 => {
                words = res2.data;
                io.emit('wordsubmit', words);
            }).catch(error => { console.log(error); });
        })
        .catch(error => {
            console.log(error);
        });
        
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
