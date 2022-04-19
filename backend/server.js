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
    //#Handle Room creation, Joining a room, giving room information to users.
    socket.on('request_room', (username)=>{
      var id = generateID();
      let set_leader = 
      {
        username:username,
        points: 0,
        background: `rgb(${Math.floor( Math.random()*256/2)},${Math.floor(Math.random()*256/2)},${Math.floor(Math.random()*256/2)})`
      }
      lobbies[id] = {
        users: [set_leader],
        sockets: [{id: socket.id, role: 'leader'}],
        currentUserTurn : 0
      }
   
      socket.emit('roomID', {id:id});
    })

   

    socket.on('validate_room', ({id}, username)=>{
      list = Array.from(io.sockets.adapter.rooms);
      list = list.filter(room => !room[1].has(room[0]))
      list = list.map(rooms=>rooms[0])
      
      let found  = list.indexOf(id)
      if(found != -1 || lobbies.length < 6){
        lobbies[id]['users'].push({
          username:username,
          points:0,
          background: `rgb(${Math.floor( Math.random()*256/2)},${Math.floor(Math.random()*256/2)},${Math.floor(Math.random()*256/2)})`,
        })
        lobbies[id]['sockets'].push({id:socket.id, role:'player'})
      }
      else {
        found = -1;
      }
      socket.emit('validation_response', found,{id: id});
    })
    


    socket.on('join_room', ({id})=>{
      id = id.slice(1);
      currentUserIndex =  lobbies[id].length - 1;
      socket.join(id);
      io.to(id).emit('new_user', lobbies[id].users , currentUserIndex);
      //#Give users roles.
     
      let socketRole = lobbies[id]['sockets'].map(obj=>{if(obj.id == socket.id) return obj.role})
       socketRole = socketRole[0];
       console.log(socketRole);
      io.to(socket.id).emit('get_role', socketRole)
    })
    //////////////////////////////////////////////////
    //#Handle gameplay start session
  

//#Handle Drawing
    socket.on('position',({x,y,x2,y2}, {id})=>{
      id = id.slice(1);
      io.to(id).emit('draw', {x,y,x2,y2})
    })

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