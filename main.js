const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

let players = {};
let connectedPlayers = 0;
let ready_count = 0; // モードのカウント

io.on('connection', (socket) => {
    console.log('New Player Connected:', socket.id);

    if (connectedPlayers >= 2) {
        socket.emit('full', 'The server is full');
        socket.disconnect();
        return;
    }
    
    connectedPlayers++; // プレイヤーが接続したときにカウントを増加

    if (connectedPlayers === 1) {
        socket.emit('wait', 'Please wait for the other player to connect');
    } else if (connectedPlayers === 2) {
        io.emit('start', 'ゲームを開始します');
    }

    players[socket.id] = {
        id: socket.id,
        position: {
            x: 0,
            y: 0,
            z: 0
        },
        scale: {
            x: 1,
            y: 1,
            z: 1
        }
    };

    socket.on('ready', () => {
        ready_count++;
        if (ready_count >= 2) {
            io.emit('gameStart', 'ゲームを開始します');
            ready_count = 0;
        }
        console.log('ready:', ready_count);
    });

    socket.on('unReady', () => {
        ready_count--;
        console.log('unReady:', ready_count);
    });

    
    socket.emit('myMachine', players);
    socket.emit('opponent', players[socket.id]);

    // クライアントからのデータを受信
    socket.on('position', (position) => {
        players[socket.id].position = position;
        socket.broadcast.emit('opponent', players[socket.id]);
        //console.log('Player Position:', players[socket.id]);
    });
    socket.on('scale', (scale) => {
        players[socket.id].scale = scale;
        socket.broadcast.emit('opponentScale', players[socket.id]);
        //console.log('Player Scale:', players[socket.id]);
    }
    );

    socket.on('disconnect', () => {
        connectedPlayers--; // プレイヤーが切断されたときにカウントを減少
        console.log('Player Disconnected:', socket.id);
        delete players[socket.id];
        io.emit('disconnected', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});