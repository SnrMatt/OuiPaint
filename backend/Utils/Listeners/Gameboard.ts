import { Server, Socket } from "socket.io";
import { User } from "../../Objects/User";
import { Lobby } from "../../Objects/Lobby";
import { activeLobbies } from "../../server";
import { generateWordList } from "../General";

module.exports = (io:Server, socket:Socket, user:User) => {
    const lobbyGameStatus = (lobby_id:string) =>{
        socket.emit("gameplay:post-game-status", activeLobbies[lobby_id].isPlaying)
    }

    const getUser = () =>{
        socket.emit("gameplay:post-user", user)
    }
    const getLobbyInfo = (lobby_id:string) => {
        io.to(lobby_id).emit("gameplay:post-lobby-info", activeLobbies[lobby_id])
    }
    const startGame = (lobby_id:string)=>{
        activeLobbies[lobby_id].isPlaying = true;
        /**
         * Set lobby game status to true and notify all users
         */
        io.to(lobby_id).emit("gameplay:post-game-status", activeLobbies[lobby_id].isPlaying)
        /**
         * Set non-current turn user to waiting state
         */
        const LOBBY_USER_LENGTH = activeLobbies[lobby_id].users.length;
        for(var i = 0;  i < LOBBY_USER_LENGTH; i++){ 
            if(activeLobbies[lobby_id].currentUserTurn !== i){
                io.to(activeLobbies[lobby_id].users[i].id).emit("gameplay:wait-for-user", true);
                io.to(activeLobbies[lobby_id].users[i].id).emit("gameplay:disable_drawing");
            }
        }
        /**
         * Display word list
         */
        io.to(currentUserSocketID(lobby_id)).emit("gameplay:post-list", generateWordList());
        //Allow the current turn to draw and disable keep others disabled
        io.to(currentUserSocketID(lobby_id)).emit("gameplay:enable_drawing");
    }

    const setLobbyWord = (lobby_id:string, word:string) => {
        activeLobbies[lobby_id].currentWord = word;
        //Assuming all choices are a single word.
        io.to(lobby_id).emit("gameplay:set-hidden-word", word.length);

        //Remove  Waiting for a choice to be made."
        for (var i = 0; i < activeLobbies[lobby_id].users.length; i++) {
            if (i != activeLobbies[lobby_id].currentUserTurn) {
              io.to(activeLobbies[lobby_id].users[i].id).emit("gameplay:wait-for-user", false);
            }
          }
        //Send time to lobbby
        io.to(lobby_id).emit("gameplay:set-current-time", activeLobbies[lobby_id].currentTime);
        //Start lobby timer
        var start_time = Date.now();
        var timer = setInterval(()=>{
            if(!activeLobbies[lobby_id]){ clearInterval(timer)}
            if(activeLobbies[lobby_id].currentTime <= 0){
                //Handle after round actions
                
                clearInterval(timer)
            }
            else {
                activeLobbies[lobby_id].currentTime = 60 - (Date.now()- start_time) / 1000;
                io.to(lobby_id).emit("gameplay:set-current-time", activeLobbies[lobby_id].currentTime);
            }
        },1000)

    }

    socket.on("gameplay:get-game-status", lobbyGameStatus);
    socket.on("gameplay:get-user", getUser);
    socket.on("gameplay:get-lobby-info", getLobbyInfo);
    socket.on("gameplay:request-start", startGame);
    socket.on("gameplay:set-user-choice", setLobbyWord);
    
}

function currentUserSocketID(lobby_id:string){
    return activeLobbies[lobby_id].users[activeLobbies[lobby_id].currentUserTurn].id;
}
