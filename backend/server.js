const express = require('express');
const app  = express();
const server = require('http').createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
app.use(express.static('build'));

var current_list = [];
io.on('connection', (socket)=>{
    current_list.push(socket.id)
    //////////////////////////////////////////////////
    //Landing Page Sockets (Validation and Setups)
    socket.on('request_room', ()=>{
      var id = generateID();
      socket.emit('roomID', {id:id});
    })

    let list;
    socket.on('join_room', ({id})=>{

      socket.join(id);
    })

    socket.on('validate_room', ({id})=>{
      list = Array.from(io.sockets.adapter.rooms);
      list = list.filter(room => !room[1].has(room[0]))
      list = list.map(rooms=>rooms[0].slice(1))
      let found  = list.indexOf(id)
      socket.emit('validation_response', found,{id: id});
    })


    //////////////////////////////////////////////////
    //Handles for Drawing

    socket.on('position',({x,y,x2,y2})=>{
      io.emit('draw', {x,y,x2,y2})

    })
  socket.on("disconnect", ()=>{
    let user = current_list.indexOf(socket.id);
    current_list.splice(user, 1);
  })
    //////////////////////////////////////////////////
})




server.listen(80, ()=>{
    console.log('Server is on http://localhost')
})

function generateID() {
  return Math.floor((1+Math.random()) * 0x1000).toString(16).substring();
}
