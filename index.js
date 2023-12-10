const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
 
const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 3000
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()
 
app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      // Be sure to pass `true` as the second argument to `url.parse`.
      // This tells it to parse the query portion of the URL.
      const parsedUrl = parse(req.url, true)
      const { pathname, query } = parsedUrl
 
        await app.render(req, res, __dirname, query)
      
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
    })
})
const socketio = require("socket.io");
const fs = require("fs");
const { addWords, isBad } = require("adults");
var roomname;
var users = [];
var rooms = [];
var winners = [];
const PORT = 3000 || process.env.PORT;
const server = http.createServer(app);
// Set static folder

// Socket setup
const io = socketio(server);
var i = 0;

var roomnumber;
var people = 0;
io.on("connection", (socket) => {
  people++;
  socket.emit("userjoined");
	socket.on("roomname", room => {
		socket.on("password", password=> {
			rooms.push({room: room, password: password});
			socket.join(room);
			roomname = room;
		});
			  });
	socket.on("self", link =>{
		socket.join(link);
	});
	var x = 0;
	socket.on("room", room => {
		socket.on("pass", pass=> {
			if(rooms.length > 0){
			for(var i = 0; i < rooms.length; i++){
				if(room === rooms[i].room && pass === rooms[i].password){
					socket.join(room);
					x = 0;
				}
				if(room === rooms[i].room && pass === rooms[i].password){
					break;
				}
				else{
					x++;
				}
			}
			console.log(x);
			if(x > 0){
				socket.emit("roomnotjoined");
			}
			}
			else{
				socket.emit("roomnotjoined");
			}
		});
	});
			socket.on("username", (user) => {
    if (users.includes(user) || user === null || user === "" || isBad(user)) {
      socket.emit("usernotadded");
    } else {
      socket.nickname = user;
      users.push(user);
      socket.to(Array.from(socket.rooms)[1]).emit("useradded", users);
      socket.to(Array.from(socket.rooms)[1]).emit("joined", user);
    }
	});
  socket.on("message", message => {
		
				socket.to(Array.from(socket.rooms)[1]).emit("newmessage", {message: message.message, user: message.user});
  });
	socket.on("house", (u)=> {
		socket.broadcast.to(Array.from(socket.rooms)[1]).emit("housemade", u);
	});
	socket.on("fire", (u)=> {
		socket.broadcast.to(Array.from(socket.rooms)[1]).emit("firemade", u);
	});
  socket.on("disconnecting", () => {
    people--;
    
        socket.leave(roomnumber);
        users = users.filter((use) => use != socket.nickname);
        socket.to(Array.from(socket.rooms)[1]).emit("leave", users);
        socket.to(Array.from(socket.rooms)[1]).emit("left", socket.nickname);
  });
  socket.on("userwon", () => {
    
        io.to(Array.from(socket.rooms)[1]).emit("winnerchosen");
        io.to(Array.from(socket.rooms)[1]).emit("gg");

  });
  socket.on("playerhit", () => {
   
        socket.to(Array.from(socket.rooms)[1]).emit("damage");

  });
  socket.on("died", (user) => {
    users.filter((use) => use != user);
   
        socket.to(Array.from(socket.rooms)[1]).emit("leave", users);
        socket.to(Array.from(socket.rooms)[1]).emit("gameover", user);
     
  });
  socket.on("hit", (person) => {
        socket.to(Array.from(socket.rooms)[1]).emit("point", person);    
  });
  socket.on("won", (user) => {
   
        socket.to(Array.from(socket.rooms)[1]).emit("winner", user);
        winners.push(user);
        if (winners.length === 2) {
          io.to(Array.from(socket.rooms)[1]).emit("winners", winners);
        }
  
  });
  socket.on("move", (matrix) => {
   
        socket.to(Array.from(socket.rooms)[1]).emit("enemymoved", matrix);

  });
});
