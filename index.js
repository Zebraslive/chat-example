var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});
var vuur = 0;
const users = {};
const connsx = {};
io.on('connection', function(socket){

   socket.on('visit', function(msg){
 socket.username = msg.username;
 users[msg.username] = socket.id;
 connsx[socket.id] = msg.username;
 var actualx = Object.keys(users).length;
     vuur = socket.client.conn.server.clientsCount;
     io.emit('visit', {total: vuur, uniq: users.length, ffx: actualx});
   });
  socket.on('disconnect', function () {
    vuur = socket.client.conn.server.clientsCount;

    io.emit('visit', vuur);
  });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});
