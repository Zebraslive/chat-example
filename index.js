var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
const fs = require('fs');
	const path = require('path');
	const pathToFiles = '';
	const bodyParser = require('body-parser');
	// create a session with a random string as secret
	const session = require('express-session')({
		secret : randomString(),
		resave : true,
		saveUninitialized : true
	});
  const sharedSession = require('express-socket.io-session');
	const bcrypt = require('bcrypt');
	// difficulty of the hash function
	const saltRounds = 10;
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});
var vuur = 0;
const users = {};
const connsx = {};
const watching = {};
const watchers = {};
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
    		socket.broadcast.emit('updateClientNumber', { clientNumber : Object.keys(io.sockets.connected).length });
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
  // open log in append mode
		let logWriter = fs.createWriteStream(`${ pathToFiles }log`, { flags : 'a' });
		// emit and update clients number
		socket.emit('updateClientNumber', { clientNumber : Object.keys(io.sockets.connected).length });
		socket.broadcast.emit('updateClientNumber', { clientNumber : Object.keys(io.sockets.connected).length });

		// banClient function
		// (case detected @IP banned at connexion (no arg)) : @IP is not allowed to create a socket conn => disconnect
		// (case asked by admin on connected client(ip arg)) : for all socketId owned by @IP banned => disconnect
		const banClient = (ip) => {
			let bannedObject = {
				message : 'It looks like you did something wrong, you are banned from the chat',
				time : dateUtil.time()
			}
			if (!ip) {
				socket.emit('banned', bannedObject);
				socket.disconnect();
			} else {
				for (let client of clients) {
					if (client.ip === ip) {
						io.sockets.to(client.id).emit('banned', bannedObject);
						socket.disconnect();
					}
				}
			}
		}

		// get client @IP, store in const clients[] and log
		let handshake = socket.handshake;
		let ipClient = handshake.address;
		clients.push({ ip : ipClient, id : socket.id });
		logWriter.write(`INFO_CONN -- ${ dateUtil.time() } -- ${ ipClient }\n`);

		// if ipClient is in bannedAddresses => disconnect from chat
		let bannedAddresses = fs.readFileSync(`${ pathToFiles }banned-addresses`, 'utf-8').split(/\r?\n/);
		if (bannedAddresses.includes(ipClient)) {
			banClient();
		}

		// message from client => broadcast to all clients
		socket.on('message', (data) => {
			logWriter.write(`NEW_MSG -- ${ dateUtil.fullTime() } -- ${ ipClient } -- ${ data.name } -- ${ data.message }\n`);
			socket.broadcast.emit('message', { name : data.name, message : data.message, time : dateUtil.time() });
			socket.broadcast.emit('messageForAdmin', { name : data.name, message : data.message, ipClient : ipClient, time : dateUtil.time() });
		});

		// message from admin => broadcast to all clients with style
		socket.on('messageFromAdmin', (data) => {
			if(socket.handshake.session.isAdmin) {
				logWriter.write(`ADMIN_MSG -- ${ dateUtil.fullTime() } name : ${ data.name } MESSAGE : ${ data.message }\n`);
				socket.broadcast.emit('messageFromAdmin', { name : data.name, message : data.message, time : dateUtil.time() });
			}
		});

		// ban this IP on request from an admin
		// server log, write to banned-addresses, call banClient(), push to globalBannedAddresses
		socket.on('banIp', (ip) => {
			if(socket.handshake.session.isAdmin) {
				logWriter.write(`ADMIN_BAN -- ${ dateUtil.fullTime() } -- ${ ip }\n`);
				let banWriter = fs.createWriteStream(`${ pathToFiles }banned-addresses`, { flags : 'a' });
				banWriter.write(`\n${ ip }`);
				banWriter.end();
				banClient(ip);
				globalBannedAddresses.push(ip);
			}
		});

		// add administrator
		socket.on('addAdmin', (data) => {
			if(socket.handshake.session.isAdmin || setupMode) {
				bcrypt.hash(data.password, saltRounds, (err, hash) => {
					let usersWriter = fs.createWriteStream(`${ pathToFiles }users`, { flags : 'a' });
					usersWriter.write(`\n${ data.name } ${ hash }`);
					usersWriter.end();
				});
				globalUsersFormated.push(data.name);
			}
		});

		// update client number on disconnect

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
