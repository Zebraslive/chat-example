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
const watching = {};
io.on('connection', function(socket){

   socket.on('visit', function(msg){
     socket.user_type = msg.type;
 socket.username = msg.username;
 users[msg.username] = socket.id;
 users[msg.username]['type'] = socket.user_type;
 connsx[socket.id] = msg.username;
 var actualx = Object.keys(users).length;
     vuur = socket.client.conn.server.clientsCount;
     io.emit('visit', {total: vuur, uniq: actualx});
   });
  socket.on('disconnect', function () {
    vuur = socket.client.conn.server.clientsCount;
    var userixk = connsx[socket.id];
delete users[userixk];
 var actualx = Object.keys(users).length;
 if (vuur == 1) {
   actualx = 1;
 }
    io.emit('leftserver', {total: vuur, uniq: actualx});
  });
  socket.on('click Episode', function(msg){
     users[msg.sid] = msg.tot;
  io.emit('click Episode', {total: msg.tot, sid: msg.sid});
  });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});
// jsonObject = JSON.stringify({
//     "message" : "The web of things is approaching, let do some tests to be ready!",
//     "name" : "Test message posted with node.js",
//     "picture" : "http://youscada.com/wp-content/uploads/2012/05/logo2.png",
//     "actions" : [ {
//         "name" : "youSCADA",
//         "link" : "http://www.youscada.com"
//     } ]
// });
//
// // prepare the header
// var postheaders = {
//     'Content-Type' : 'application/json',
//     'Content-Length' : Buffer.byteLength(jsonObject, 'utf8')
// };
//
// // the post options
// var optionspost = {
//     host : 'graph.facebook.com',
//     port : 443,
//     path : '/youscada/feed?access_token=your_api_key',
//     method : 'POST',
//     headers : postheaders
// };
//
// console.info('Options prepared:');
// console.info(optionspost);
// console.info('Do the POST call');
//
// // do the POST call
// var reqPost = https.request(optionspost, function(res) {
//     console.log("statusCode: ", res.statusCode);
//     // uncomment it for header details
// //  console.log("headers: ", res.headers);
// 
//     res.on('data', function(d) {
//         console.info('POST result:\n');
//         process.stdout.write(d);
//         console.info('\n\nPOST completed');
//     });
// });
//
// // write the json data
// reqPost.write(jsonObject);
// reqPost.end();
// reqPost.on('error', function(e) {
//     console.error(e);
// });
