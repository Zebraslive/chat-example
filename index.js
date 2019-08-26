var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require("fs");
var port = process.env.PORT || 3000;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});
var vuur = 0;
const users = {};
const connsx = {};
const watching = {};
const watchers = {};
fs.access('users.txt', fs.F_OK, (err) => {
  if (err) {
    console.error(err)
    return
  }
  var buffer = fs.readFileSync("users.txt");
  users = buffer.toString();
  //file exists
})
io.on('connection', function(socket){

   socket.on('visit', function(msg){
     socket.user_type = msg.type;
 socket.username = msg.username;
 users[msg.username] = socket.id;
 users[msg.username]['type'] = socket.user_type;
 connsx[socket.id] = msg.username;
 var actualx = Object.keys(users).length;
     vuur = socket.client.conn.server.clientsCount;
     io.emit('visit', {total: vuur, uniq: actualx, user:msg.username});
     fs.writeFile("users.txt", users, (err) => {
  if (err) io.emit('console msg', err);
  var buffer = fs.readFileSync("users.txt");
  users = buffer.toString();
  io.emit('console msg', users);
});
   });
  socket.on('disconnect', function () {
    vuur = socket.client.conn.server.clientsCount;
    var userixk = connsx[socket.id];
    delete watchers[socket.username];
delete users[userixk];
 var actualx = Object.keys(users).length;
 if (vuur == 1) {
   actualx = 1;
 }
    io.emit('leftserver', {total: vuur, uniq: actualx, user:userixk});
  });
  socket.on('click Episode', function(msg){
if (msg.sid in watching) {
  var isgfi = parseInt(watching[msg.sid]);
  msg.tot = 1+isgfi;
} else {
  msg.tot = 1;
}
      watching[msg.sid] = msg.tot;
      watchers[socket.username] = msg.sid;
 var actfsf = Object.keys(watchers).length;
  io.emit('click Episode', {total_watching: msg.tot, sid: msg.sid, user:socket.username, title:msg.title, allU:actfsf});
  });
  socket.on('change episode', function(msg) {
    if (msg.old_sid in watching) {
      if (socket.username in watchers) {
        var isgfi = parseInt(watching[msg.old_sid]);
        var gihri = isgfi-1;
        watching[msg.old_sid] = gihri;
      watchers[socket.username] = msg.new_sid;
      if (msg.new_sid in watching) {
        var isgfi = parseInt(watching[msg.new_sid]);
        var siigf = 1+isgfi;
      } else {
        var siigf = 1;
      }
      watching[msg.new_sid] = siigf;
    io.emit('change episode', {user: socket.username, newid: msg.new_sid, oldid: msg.old_sid, title:msg.title, total_watching:siigf, old_watching:watching[msg.old_sid]});
      } else {
        socket.emit('errorx', "can not complete action");
        socket.disconnect();
      }

    }
  });
  socket.on('close Episode', function(msg){
     var actfsf = Object.keys(watchers).length;
if (msg.sid in watching) {
  if (watchers[socket.username] === msg.sid) {
    var isgfi = parseInt(watching[msg.sid]);
    msg.tot = isgfi-1;
    watching[msg.sid] = msg.tot;
    delete watchers[socket.username];
    io.emit('stoppedWatching', {user:socket.username});
io.emit('click Episode', {total_watching: msg.tot, sid: msg.sid, allU:actfsf});
  } else {
    socket.emit('errorx', "user is not watching this episode, can not complete action");
  }

}

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
