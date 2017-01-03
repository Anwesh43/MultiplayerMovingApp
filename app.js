var express = require('express')
var app = express()
var path = require('path')
var http = require('http')
var server = http.createServer(app)
app.use(express.static(path.join(__dirname,'public')))
var socketIO = require('socket.io')
var io = socketIO(server)
var sockets = []
io.of('game').on('connection',(socket)=>{
    sockets.push(socket)
    console.log('a client is connected')
    console.log(socket)
    socket.emit("hello",{msg:"thanks for connection"})
    socket.on('SEND_GAME_OBJECT',(gameObjectJson)=>{
        console.log(gameObjectJson)
        var id = socket.id
        sockets.filter((curr_socket)=>curr_socket.id!=id).forEach((curr_socket)=>{curr_socket.emit('RECEIVE_GAME_OBJECT',gameObjectJson)})
    })

}) //Creating a namespace
server.listen(8000)
