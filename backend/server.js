const express = require('express');
const app  = express();
const cors = require('cors')
const server = require('http').createServer(app);
const { Server } = require('socket.io');
const fs = require('fs');



const io = new Server(server,{
  cors:{
    origin:'http://localhost:3000'
  }
});

const all_words = getData();
getThreeWords(all_words);






app.use(cors());
let lobbies = {};
io.on('connection', (socket)=>{
    
/**
 * @description Listeners for creating and joining a room.
 */
    socket.on('request_room', (username,roundCount, wordList)=>{
      var id = generateID();
      let set_leader = 
      {
        username:username,
        role: 'leader',
        points: 0,
        background: `rgb(${Math.floor( Math.random()*256/2)},${Math.floor(Math.random()*256/2)},${Math.floor(Math.random()*256/2)})`
      }

      lobbies[id] = {
        users: [set_leader],
        sockets: [socket.id],
        currentUserTurn : 0,
        currentRound: roundCount,
        currentTimer: 80,
        currentLobbyState: false,
        extra_words: wordList,
      }
   
      socket.emit('roomID', {id:id});
    })

    socket.on('check_game_status', ({id})=>{
      id = id.slice(1);
      io.to(id).emit('response_start_game', lobbies[id].currentLobbyState);
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
          role:'player',
          background: `rgb(${Math.floor( Math.random()*256/2)},${Math.floor(Math.random()*256/2)},${Math.floor(Math.random()*256/2)})`,
        })
        lobbies[id]['sockets'].push(socket.id)
      }
      else {
        found = -1;
      }
      socket.emit('validation_response', found,{id: id});
    })
    


    socket.on('join_room', ({id})=>{
      id = id.slice(1);
      let currentUserIndex =  lobbies[id]['users'].length - 1;
      socket.join(id);
      socket.emit('get_user', lobbies[id]['users'][currentUserIndex])
      io.to(id).emit('new_user', lobbies[id].users );
    })
    /**
     * @
     */
    socket.on('start_game', ({id})=>{
      id = id.slice(1);
      lobbies[id].currentLobbyState = true;
      io.to(id).emit('response_start_game', lobbies[id].currentLobbyState)
      StartRoundGameplay(socket,id)
    })

    //////////////////////////////////////////////////
    //#Handle gameplay start session
  

//#Handle Drawing
    socket.on('position',({x,y,x2,y2}, {id}, color)=>{
   
      id = id.slice(1);
      io.to(id).emit('draw', {x,y,x2,y2}, color)
      
    })
//#Handling Chat message inside the lobby
  socket.on('send_chat', (username, message, {id})=>{
    id = id.slice(1); 
    socket.to(id).emit('new_message', username, message)
    
  })
  socket.on('send_color', (color,{id})=>{
    id = id.slice(1);
  
    io.to(id).emit('change_color', color)

  })
  socket.on('request_clear_board', ({id})=>{
    id = id.slice(1);
    io.to(id).emit('clear_board', 100);
    
  })

  socket.on('send_health_amount', (total_health, total_time_drawn, {id})=>{
      id = id.slice(1);
      let total_allowed_time = .5 * 1000
      total_time_drawn++;
      total_health = total_time_drawn/total_allowed_time;
      io.to(id).emit('new_health_amount', total_health, total_time_drawn)
  })

  socket.on("disconnect", ()=>{
    console.log('user has disconnected')

  })

  socket.on('disconnecting', ()=>{
   
    if([...socket.rooms][1]){ 
      let roomID = [...socket.rooms][1];
      let indexOfUser = lobbies[roomID]['sockets'].indexOf(socket.id);
      lobbies[roomID]['sockets'].splice(indexOfUser,1);
       lobbies[roomID]['users'].splice(indexOfUser,1);      
       
       
    }
  })

  })  






server.listen(4001, ()=>{
    console.log('Server is on *4001')
})

function generateID() {
  return Math.floor((1+Math.random()) * 0x1000).toString(16).substring();
}

function getData(){
  let data = fs.readFileSync('./words.txt', 'utf8');
  data = data.split('\r\n');
  data = data.map(word => {return word.toLowerCase()});
  return data;
}
function getThreeWords(data){
  let three_words = []
  for(var i = 0; i < 3; i++){
    three_words.push(data[Math.floor(Math.random() * data.length)])
  }
  return three_words
}

function StartRoundGameplay(socket,id){ 
  let user_choice;
  let choices = getThreeWords(all_words);  
  io.to(lobbies[id].sockets[lobbies[id].currentUserTurn]).emit('create_user_choices', choices);
  socket.on('user_response', (word)=>{
    console.log('clicked');
    //Start Timer
    let start_time =  Date.now();
    let timer = setInterval(()=>{
      lobbies[id].currentTimer = (80 - (Math.floor((Date.now()-start_time)/1000)))
      io.to(id).emit('current_time', lobbies[id].currentTimer);

   
      if(lobbies[id].currentTimer === 0) {
        clearInterval(timer);
      }
        
    }, 1000)
  })
 

}
