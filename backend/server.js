const express = require('express');
const app  = express();
const cors = require('cors')
const server = require('http').createServer(app);
const { Server } = require('socket.io');
const fs = require('fs');

app.use(express.static('./build'))


const io = new Server(server,{
  cors:{
    origin:`http://192.168.2.177:3000`
  }
});


const all_words = getData();
getThreeWords(all_words);






app.use(cors());
let lobbies = {}; //this will store every lobby that is active.
io.on('connection', (socket)=>{
    let total_allowed_time = 100 * 1000;
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
        currentUserPos: null,
        currentRound: roundCount,
        currentUserHealth : 0,
        total_time_drawn: 0,
        currentTimer: 60,
        currentLobbyState: false,
        currentWord: null,
        currentDrawingBoard:[],
        currentAcceptedUsers: [],
        isDrawing : true,
        extra_words: wordList,
      }
   
      socket.emit('roomID', {id:id});
    })

    socket.on('check_game_status', ({id})=>{
      id = id.slice(1);
      io.to(id).emit('response_start_game', lobbies[id].currentLobbyState);
    })
    socket.on('check_lobby_status', ({id})=>{
      id = id.slice(1);
      if(lobbies[id]){
        socket.emit('response_lobby_status', true);
      }
      else {socket.emit('response_lobby_status', false);}
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
      if(lobbies[id]){
      let currentUserIndex =  lobbies[id]['users'].length - 1;
      socket.join(id);
      socket.emit('get_user', lobbies[id]['users'][currentUserIndex])
      io.to(id).emit('new_user', lobbies[id].users );
      }
      else { 
        socket.emit('leave_room')
      }
      io.to(id).emit('get_round_count', lobbies[id].currentRound);
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
    socket.on('user_response', (word)=>{
      let id = [...socket.rooms][1];
      if(lobbies[id].currentRound != 0){
      console.log('user response', lobbies[id].currentTimer);
      lobbies[id].currentWord  = word;
      let hidden_word = lobbies[id].currentWord.split(' ');
      hidden_word = hidden_word.map(letters => {return letters.length});
      console.log(hidden_word);
      io.to(id).emit('get_word', hidden_word);
      //Start Timer
      let start_time =  Date.now();
      let timer = setInterval(()=>{
        if(lobbies[id]){
          if(lobbies[id].currentTimer <= 0) {
            //When the time runs out we need to get scores and change to next player
            io.to(id).emit('current_time', 0);
            after_round_handling(id)
            clearInterval(timer);
            
          }
          else {
          lobbies[id].currentTimer = (60 - ((Date.now()-start_time)/1000))
          io.to(id).emit('current_time', lobbies[id].currentTimer);
          }
        }
        else {
          clearInterval(timer);
        }
      }, 1)
    }
    })

//#Handle Drawing
    socket.on('position',(x,y, {id})=>{
      id = id.slice(1);
      let length = lobbies[id].currentDrawingBoard.length
      lobbies[id].currentUserPos = {'x': x, 'y': y};
      if(lobbies[id].isDrawing == true){
        lobbies[id].currentDrawingBoard.push({'x':x, 'y':y});
        lobbies[id].isDrawing = false;
        length = lobbies[id].currentDrawingBoard.length
      }
      if(length === 0 ){
        lobbies[id].currentDrawingBoard.push({'x':x , 'y': y})
      }
      else {
      if((lobbies[id].currentDrawingBoard[ length-1].x != x || lobbies[id].currentDrawingBoard[length-1].y != y) && lobbies[id].currentUserHealth != 1){
        //draw
        lobbies[id].currentDrawingBoard.push({'x':x , 'y': y})
        io.to(id).emit('draw', x,y , lobbies[id].currentDrawingBoard[ length-1].x, lobbies[id].currentDrawingBoard[length-1].y );
      }
      
    }
    
      
    })

    socket.on('time_drawing', (x,y,{id})=>{
      id = id.slice(1)
      let length = lobbies[id].currentDrawingBoard.length
      if(length != 0 && (lobbies[id].currentDrawingBoard[length-1].x != lobbies[id].currentUserPos.x || lobbies[id].currentDrawingBoard[length-1].y != lobbies[id].currentUserPos.x)){
        
        lobbies[id].total_time_drawn++;
        lobbies[id].currentUserHealth = (100 * (lobbies[id].total_time_drawn/ total_allowed_time));
        io.to(id).emit('new_health', lobbies[id].currentUserHealth);
      }
      else{
    
        lobbies[id].currentUserPos.x = x; 
        lobbies[id].currentUserPos.y = y;
        lobbies[id].currentDrawingBoard.push({'x':lobbies[id].currentUserPos.x , 'y': lobbies[id].currentUserPos.y})
      }
    })
    socket.on('release', ({id})=>{
      id = id.slice(1);
      lobbies[id].isDrawing = true;
    })
//#Handling Chat message inside the lobby
  socket.on('send_chat', (username, message, {id})=>{
    id = id.slice(1); 
    //Check if the message is exactly the lobbies current word;
    check_if_matches(message, id,socket)
    socket.to(id).emit('new_message', username, message)
    
  })
  socket.on('send_color', (color,{id})=>{
    id = id.slice(1);
  
    io.to(id).emit('change_color', color)

  })
  socket.on('request_clear_board', ({id})=>{
    id = id.slice(1);
    lobbies[id].currentDrawingBoard = [];
    lobbies[id].currentUserHealth = 0;
    lobbies[id].total_time_drawn = 0;
    io.to(id).emit('clear_board', lobbies[id].currentUserHealth);
    
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
       if(lobbies[roomID]['users'].length == 0){
        console.log('Room is empty! Removing lobby.');
        delete lobbies[roomID];
        console.log(lobbies);
      }
      socket.leave(roomID);
    }
 
  })
  socket.on('leave_lobby', ()=>{
    if([...socket.rooms][1]){ 
      let roomID = [...socket.rooms][1];
      let indexOfUser = lobbies[roomID]['sockets'].indexOf(socket.id);
      lobbies[roomID]['sockets'].splice(indexOfUser,1);
       lobbies[roomID]['users'].splice(indexOfUser,1);      
       if(lobbies[roomID]['users'].length == 0){
        console.log('Room is empty! Removing lobby.');
        delete lobbies[roomID];
        console.log(lobbies);
      }
      socket.leave(roomID);
    }
    
  })

  })  






server.listen(80, ()=>{

})

function generateID() {
  return Math.floor((1+Math.random()) * 0x1000).toString(16).substring();
}

function getData(){
  let data = fs.readFileSync('./words.txt', 'utf8');

  /**
   * Check if current OS is windows or any other
   */
  if(process.platform == 'win32'){
    data = data.split('\r\n');
  }
  else { data = data.split('\n')
}
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
  let choices = getThreeWords(all_words);  
  io.to(lobbies[id].sockets[lobbies[id].currentUserTurn]).emit('create_user_choices', choices);
  console.log('created choices');
}
function check_if_matches(chat,id,socket){
if(chat == lobbies[id].currentWord && lobbies[id].currentTimer != 0 && lobbies[id]['sockets'].indexOf(socket.id) != lobbies[id].currentUserTurn ){
  console.log('Correct!');
  lobbies[id].currentAcceptedUsers.push(
    {
      'user': lobbies[id]['sockets'].indexOf(socket.id), 
      'time_completed': lobbies[id].currentTimer
  })
  socket.emit('correct_choice')
  console.log(lobbies[id].currentAcceptedUsers); 
}
}

function after_round_handling(id){
//I will probably need to collect an array of users that answered;
//Check the points heres

//Calculate points for guessers
let max_amount = 1500;
lobbies[id].currentAcceptedUsers.forEach((user) => {
  let difference = 1 - ((user.time_completed / 60));
  let points = Math.floor(1500 - (Math.floor(1500 * difference)));
  lobbies[id]['users'][user.user].points += points;
  io.to(id).emit('update_points', lobbies[id]['users']);
  lobbies[id].currentAcceptedUsers = [];
});



//Create a socket in response to scoreboard display

//Move on the next user, 

let next_user = lobbies[id].currentUserTurn + 1 >= lobbies[id]['users'].length ? 0 : lobbies[id].currentUserTurn + 1;
//update current turn
if(next_user == 0){ 
  lobbies[id].currentRound-=1;
  io.to(id).emit('get_round_count');
}

if(lobbies[id].currentRound != 0){
  console.log(next_user);
lobbies[id].currentUserTurn = next_user;
lobbies[id].currentTimer = 60;
let choices = getThreeWords(all_words);

io.to(lobbies[id]['sockets'][lobbies[id].currentUserTurn]).emit('create_user_choices', choices);
}
else {
  //Organize the lobby 
  let scoreboard = bubble_sort(lobbies[id]['users'])
  io.to(id).emit('game_over',scoreboard);
}
}

// :/
function bubble_sort(points){
  points = points.map(user=>{return {'name':user.username,'points':user.points, 'background': user.background}});


 for(var i= 0; i < points.length; i++){
   for(var j = 0; j < points.length; j++){
     if(points[i].points > points[j].points){
        let temp = points[i];
        points[i] = points[j];
        points[j] = temp
     }
   }
 }
 console.log(points);
 return points;
}