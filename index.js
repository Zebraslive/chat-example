var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});
var vuur = 0;
const users = {};
io.on('connection', function(socket){
    
   socket.on('visit', function(msg){
 
 
     vuur = socket.client.conn.server.clientsCount;
     io.emit('visit', {total: vuur, uniq: users.length});
   });
  socket.on('disconnect', function () {
    vuur = socket.client.conn.server.clientsCount;

    io.emit('visit', {total:users.length});
  });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});
