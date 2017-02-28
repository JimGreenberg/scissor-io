const express = require('express');
const app = express ();
const server = require('http').Server(app);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/client/index.html');
});
app.use('/client', express.static(__dirname + '/client'));
server.listen(3000);
console.log('server running...');

const SOCKET_LIST = {};
const PLAYER_LIST = {};

class Player {
  constructor(id) {
    this.id = id;
    this.x = 250;
    this.y = 250;
    this.icon = 1;
    this.rt = false;
    this.dn = false;
    this.up = false;
    this.lf = false;
    this.accel = 0.5;
    this.vx = 0;
    this.vy = 0;
  }

  updatePostition() {
    if (this.rt) {
      this.vx += this.accel;
    }
    if (this.lf) {
      this.vx -= this.accel;
    }
    if (this.up) {
      this.vy -= this.accel;
    }
    if (this.dn) {
      this.vy += this.accel;
    }
    this.x += this.vx;
    this.y += this.vy;
    this.vx = this.vx * 0.98;
    this.vy = this.vy * 0.98;

    if (this.x > 970) {
      this.x = 970;
      this.vx = -this.vx * 0.25;
      this.icon++;
    }
    if (this.y > 600) {
      this.y = 600;
      this.vy = -this.vy * 0.25;
      this.icon++;

    }
    if (this.x < 0) {
      this.x = 0;
      this.vx = -this.vx * 0.25;
      this.icon++;

    }
    if (this.y < 30) {
      this.y = 30;
      this.vy = -this.vy * 0.25;
      this.icon++;

    }
  }
}

const io = require('socket.io')(server, {});
io.sockets.on('connection', (socket) => {
  socket.id = Math.random();
  SOCKET_LIST[socket.id] = socket;

  const player = new Player(socket.id);
  PLAYER_LIST[socket.id] = player;

  socket.on('disconnect', () => {
    delete SOCKET_LIST[socket.id];
    delete PLAYER_LIST[socket.id];

  });

  socket.on('keyPress', data => {
    if (data.inputId === 'rt') {
      player.rt = data.state;
    }
    if (data.inputId === 'lf') {
      player.lf = data.state;
    }
    if (data.inputId === 'up') {
      player.up = data.state;
    }
    if (data.inputId === 'dn') {
      player.dn = data.state;
    }
  });

  console.log('socket connected');
});

setInterval(() => {
  const pack = [];
  for(var i in PLAYER_LIST) {
  const player = PLAYER_LIST[i];
    player.updatePostition();
    pack.push({
      icon: player.icon,
      x: player.x,
      y: player.y
    });
  }
  for(var j in SOCKET_LIST) {
    const socket = SOCKET_LIST[j];
    socket.emit('newPos', pack);
  }
} ,1000/60);
