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
let setupMode = fs.readFileSync(`${ pathToFiles }users`, 'utf-8') === '';
// watch any change on the users file
const setupModeWatcher = fs.watch(`${ pathToFiles }users`);

setupModeWatcher.on('change', () => {
  setupMode = fs.readFileSync(`${ pathToFiles }users`, 'utf-8') === '';
});

// global bannedAddresses & users (out of IO scope)
const globalBannedAddresses = fs.readFileSync(`${ pathToFiles }banned-addresses`, 'utf-8').split(/\r?\n/);
const globalUsers = fs.readFileSync(`${ pathToFiles }users`, 'utf-8').split(/\r?\n/);
// to render users list without password
const globalUsersFormated = formatUsers(globalUsers);

// session
app.use(session);
// share session with socket.io connections
io.use(sharedSession(session));

// webSockets
const clients = [];
io.sockets.on('connection', (socket) => {
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
  socket.on('disconnect', () => {
    socket.broadcast.emit('updateClientNumber', { clientNumber : Object.keys(io.sockets.connected).length });
  });
});


// take array of users with password, return just name
const formatUsers = (arrayOfUsers) => {
	arrayOfUsers = arrayOfUsers.map((user) => {
		return user.split(' ')[0]
	});
	return arrayOfUsers;
};

// create a random string
const randomString = () => {
	const alphanumeric = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	let res = '';
	for (let i = 0; i < 10; i++) {
		res += alphanumeric.charAt(Math.floor(Math.random() * alphanumeric.length));
	}
	return res;
}

//dateUtil object
const date = new Date();
const hour = date.getHours();
const minutes = date.getMinutes();
const fullTime = date.toLocaleString();
const dateUtil = {
	time : () => {
		return `${ hour }:${ minutes }`;
	},
	fullTime : () => {
		return `${ fullTime }`
	}
};
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
