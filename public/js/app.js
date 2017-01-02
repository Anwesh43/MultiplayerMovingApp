var socket = io('http://localhost:8000/game')
socket.on('hello',(data)=>{
    console.log("greeted by server")
    console.log(data.msg)
})
