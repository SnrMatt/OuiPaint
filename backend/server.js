const express = require('express');
const app  = express();
const server = require('http').createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
app.use(express.static('build'));

var current_list = [];
let lobbies = {};
io.on('connection', (socket)=>{
    current_list.push(socket.id)
    //////////////////////////////////////////////////
    //Landing Page Sockets (Validation and Setups)
    socket.on('request_room', (username)=>{
      var id = generateID();
      let set_leader = 
      {
        username:username,
        role:'leader',
        points: 0,
        background: `rgb(${Math.floor( Math.random()*256/2)},${Math.floor(Math.random()*256/2)},${Math.floor(Math.random()*256/2)})`
      }
      lobbies[id] = [set_leader]
      console.log(lobbies) ;
      socket.emit('roomID', {id:id});
    })

    let list;
    socket.on('join_room', ({id})=>{
      id = id.slice(1);
      currentUserIndex =  lobbies[id].length - 1;
      console.log(id, "Joined room");
      socket.join(id);
      if(lobbies[id]){
        console.log(lobbies[id]);
      }
      io.to(id).emit('new_user', lobbies[id], currentUserIndex);
    })

    socket.on('validate_room', ({id}, username)=>{
      list = Array.from(io.sockets.adapter.rooms);
      list = list.filter(room => !room[1].has(room[0]))
      list = list.map(rooms=>rooms[0])
      console.log(list, id);
      let found  = list.indexOf(id)
      if(found != -1 || lobbies.length < 6){
        lobbies[id].push({
          username:username,
          role:'',
          points: 0,
          background: `rgb(${Math.floor( Math.random()*256/2)},${Math.floor(Math.random()*256/2)},${Math.floor(Math.random()*256/2)})`
        })
      }
      else {
        found = -1;
      }
      console.log(found);
      socket.emit('validation_response', found,{id: id});
    })
    
    socket.on('position',({x,y,x2,y2})=>{
      io.emit('draw', {x,y,x2,y2})
    })
    //////////////////////////////////////////////////
    


  socket.on("disconnect", ()=>{
    let user = current_list.indexOf(socket.id);
    current_list.splice(user, 1);
  })  
})




server.listen(80, ()=>{
    console.log('Server is on http://localhost')
})

function generateID() {
  return Math.floor((1+Math.random()) * 0x1000).toString(16).substring();
}