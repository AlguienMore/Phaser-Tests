var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');

var app = express();
var server = http.Server(app);
var io = socketIO(server);

var players = {};

app.set('port', 5000);
app.use('/static', express.static(__dirname + '/static'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/assets', express.static(__dirname + '/assets'));


app.get('/', function (request, response) {
    response.sendFile(path.join(__dirname, 'index.html'));
});

server.listen(5000, function () {
    console.log('Iniciando servidor en puerto 5000');
});

io.on('connection', function (socket) {
    console.log('Jugador "' + socket.id + '" conectado');


    players[socket.id] = {
        id: socket.id,
        x: 48,
        y: 44,
        speed: 150
    };
    
    socket.emit('currentPlayers', players);
    socket.broadcast.emit('newplayer', players[socket.id]);
    

    
    socket.on('disconnect', function () {
        console.log('user disconnected');
        // remove this player from our players object
        delete players[socket.id];
        // emit a message to all players to remove this player
        io.emit('disconnect', socket.id);
    });
    socket.on('muerto', function (){
        delete players[socket.id];
        io.emit('wasted', socket.id);
    });
    socket.on('movimiento', function(movimientoData){
        players[socket.id].x = movimientoData.x;
        players[socket.id].y = movimientoData.y;
        socket.broadcast.emit('jugMovido',  players[socket.id]);
        
    });
    socket.on('sanPowerupPicked', function(){
        socket.broadcast.emit('sancochito');
    });
    socket.on('acorPowerupPicked', function(){
        io.emit('acordeonmani');
    });
    socket.on('bombapuesta', function(bombap){
        let bomba = {
            x: bombap.x,
            y: bombap.y
        };
        socket.broadcast.emit('cuidao', bombap);
    });
    socket.on('bombamovida', function(bombi){
        socket.broadcast.emit('bomMovida', bombi);
    });
    socket.on('animacionpls', function(animdata){
        if(animdata.velocityx > 0 ){
            players[socket.id].anim = 'right';          
            socket.broadcast.emit('animarvalecitas', players[socket.id]);           
        } 
        else if(animdata.velocityx < 0 ){
            players[socket.id].anim = 'left';
            socket.broadcast.emit('animarvalecitas', players[socket.id]);
        }
        else if(animdata.velocityy > 0 ){
            players[socket.id].anim = 'up';
            socket.broadcast.emit('animarvalecitas', players[socket.id]);            
        }
        else if(animdata.velocityy < 0 ){
            players[socket.id].anim = 'down';
            socket.broadcast.emit('animarvalecitas', players[socket.id]);            
        }
        else if(animdata.velocityy === 0 && animdata.velocityx === 0 ){
            socket.broadcast.emit('stopanim', players[socket.id]);
        }
        
    });
    socket.on('playersvacio', function(){
       io.emit('gameOver');
    });

    
    

});

