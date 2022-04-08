const express = require('express');
const app  = express();
const server = require('http').createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
app.use(express.static('build'));

var current_list = [];
io.on('connection', (socket)=>{
    current_list.push(socket.id)
    console.log(current_list);
    
    socket.on('position',({x,y,x2,y2})=>{
  
      io.emit('draw', {x,y,x2,y2})

    })
    


  socket.on("disconnect", ()=>{
    let user = current_list.indexOf(socket.id);
    current_list.splice(user, 1);
  })  
})




server.listen(80, ()=>{
    console.log('Server is on http://localhost')
})