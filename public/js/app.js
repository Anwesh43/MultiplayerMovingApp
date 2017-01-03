var canvas = document.createElement('canvas')
var ctx = canvas.getContext('2d')
canvas.width = 300
canvas.height = 600
var otherPlayers = {}
var currentPlayer = {}
var socket = io('http://localhost:8000/game')
var colors = ["#4DB6AC", "#F4511E", "#1976D2", "#F9A825", "#7E57C2", "#ef5350", "#76FF03"]
function TapHandler() {
  this.count = 0
  this.isShown = false
  this.x = 0
  this.y = 0
}
TapHandler.prototype.tap = function(x,y) {
   this.isShown = true
   this.count = 0
   this.x = x
   this.y = y
}
TapHandler.prototype.draw = function(ctx) {
  if(this.isShown) {
      ctx.fillStyle = "#FFAB40"
      ctx.opacity = 0.3
      ctx.beginPath()
      ctx.arc(this.x,this.y,10,0,2*Math.PI)
      ctx.fill()
      this.count++
      if(this.count == 10) {
        this.isShown = false
      }
  }
}
var tapHandler = new TapHandler()
socket.on('RECEIVE_GAME_OBJECT',(gameObjectJson)=>{
    var gameObject = JSON.parse(gameObjectJson)
    gameObject.x*=(canvas.width/gameObject.w)
    gameObject.y*=(canvas.height/gameObject.h)
    otherPlayers[''+gameObject.id] = gameObject
})
function initCurrentPlayer() {
  currentPlayer.sx = 0
  currentPlayer.sy = 0
  currentPlayer.dimen = 0
  currentPlayer.r = 50
  currentPlayer.id = Math.round(Math.random()*100000)
  currentPlayer.w = canvas.width
  currentPlayer.h = canvas.height
  currentPlayer.x =  Math.floor(Math.random()*canvas.width)
  currentPlayer.y = Math.floor(Math.random()*canvas.height)
  var colorIndex = Math.floor(Math.random()*colors.length)
  currentPlayer.color = colors[colorIndex]
  currentPlayer.finalX = currentPlayer.x
  currentPlayer.finalY = currentPlayer.y
  currentPlayer.draw = function(ctx){
      ctx.fillStyle = this.color
      ctx.beginPath()
      ctx.arc(this.x,this.y,20,0,2*Math.PI)
      ctx.fill()

  }
  currentPlayer.move = function() {
      this.x+=this.sx
      this.y+=this.sy
      if(this.dimen == 0 && this.x == this.finalX) {
          this.sx = 0
          this.sy = 0
          this.y = this.finalY
      }
      else if(this.dimen == 1 && this.y == this.finalY) {
          this.sx = 0
          this.sy = 0
          this.x = this.finalX
      }
  }
  currentPlayer.setSpeed = function(x,y) {
      if(Math.abs(this.x - x) > Math.abs(this.y -y)) {
          if(this.x != x) {
              this.sx = 20*(x-this.x)/Math.abs(x-this.x)
              this.sy = this.sx * (y-this.y)/(x-this.x)
          }
          this.dimen = 0
      }
      else {
        if(this.y != y) {
            this.sy = 20*(y-this.y)/Math.abs(y-this.y)
            this.sx = this.sy * (x-this.x)/(y-this.y)
        }
        this.dimen = 1
      }
      this.x-=this.x%20
      this.y-=this.y%20
      this.finalX = x - x%20
      this.finalY = y - y%20
  }
}
function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height)
    ctx.fillStyle = "black"
    ctx.fillRect(0,0,canvas.width,canvas.height)
    currentPlayer.draw(ctx)
    currentPlayer.move()
    ctx.fill()
    tapHandler.draw(ctx)
    if(currentPlayer.sx != 0 || currentPlayer.sy!=0) {
       socket.emit('SEND_GAME_OBJECT',JSON.stringify(currentPlayer))
    }
    Object.values(otherPlayers).forEach((currentPlayer)=>{
      ctx.fillStyle = currentPlayer.color
      ctx.beginPath()
      ctx.arc(currentPlayer.x,currentPlayer.y,20,0,2*Math.PI)
      ctx.fill()
    })
}
canvas.onmousedown = function(event) {
    console.log(event)
   currentPlayer.setSpeed(event.pageX,event.pageY)
   tapHandler.tap(event.pageX-event.pageX%10,event.pageY-event.pageY%10)
}
socket.on('hello',(data)=>{
    console.log("greeted by server")
    console.log(data.msg)
})
document.body.appendChild(canvas)
initCurrentPlayer()
setInterval(draw,50)
