var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});
var vuur = 0;
io.on('connection', function(socket){
  vuur = socket.client.conn.server.clientsCount;
   socket.on('visit', function(msg){
     io.emit('visit', vuur);
   });
  socket.on('disconnect', function () {
    vuur = socket.client.conn.server.clientsCount;
    io.emit('visit', vuur);
  });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});
