var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  var vuur = socket.client.conn.server.clientsCount;
   io.emit('visit', vuur);
  
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});
