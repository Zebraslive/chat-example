var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});
var vuur = 0;
var users = [];
io.on('connection', function(socket){
  
   socket.on('visit', function(msg){
     var i;
     if (users.length === 0) {
        socket.nickname = msg.username;
   users[socket.nickname] = socket.id;
     } else {
         for (i = 0; i < users.length; i++) {
  if (msg.username === users[i]) {
     users[msg.username].push(socket.id);
  } else {
     socket.nickname = msg.username;
   users[socket.nickname] = socket.id;
  }
}
     }
    io.emit('tik', {total: vuur, uniq: users});
    
     vuur = socket.client.conn.server.clientsCount;
     io.emit('visit', {total: vuur, uniq: users.length});
   });
  socket.on('disconnect', function () {
    vuur = socket.client.conn.server.clientsCount;
    delete users[socket.id];
    io.emit('visit', vuur);
  });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});
