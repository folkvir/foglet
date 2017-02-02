var path = require('path');
var express = require("express");
var app = express();
var http = require('http').Server(app);
var cors = require('cors');
var io = require("socket.io")(http);
var port = process.env.PORT || 3000;

var number = 0;
var joinningPeer = null;

let clients = {};

app.use(cors());

app.use('/static', express.static(__dirname + "/"));

app.get('/:name', function(req, res){
  res.sendFile(path.resolve(__dirname+"/example/"+req.params.name+"/index.html?server=http://foglet-examples.herokuapp.com/"));
});

app.get('/', function(req, res){
  res.sendFile(__dirname + "/index.html");
});


io.on('connection', function(socket){
  number++;
  //log.info('A user is connected');
  socket.on("joinRoom",function(room){
    //log.info('A user join the room : ' + room);
    //log.info(socket.id);
    socket.join(room);
  });
  socket.on("new",function(data){
        let room = data.room;
        let offer = data.offer;
        clients[data.offer.tid] = socket ;
        //console.log("Emit the new offer on the room " + room + " for the socketId : " + socket.id);
        socket.broadcast.in(room).emit("new_spray", offer);
  });
  socket.on("accept", function(data){
    let room = data.room;
    let offer = data.offer;

    //console.log("Server received an accepted ticket for " + socketId);
    if(clients[data.offer.tid] != null){
      //console.log(offer);
      clients[data.offer.tid].emit("accept_spray", offer);
    }
    clients[data.offer.tid] = null;
  });

  socket.on('disconnect', function(room, socketId){
    //log.info('A user disconnected');
    socket.leave(room);
    number--;
  });

});

http.listen(port, function () {
  console.log('HTTP Server listening on port '+port);
});
