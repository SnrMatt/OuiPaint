import { Server, Socket } from "socket.io";
import { User } from "../../Objects/User";
import { Lobby } from "../../Objects/Lobby";
import { activeLobbies } from "../../server";
import { generateID } from "../General";

module.exports = (io:Server,socket:Socket, user:User) =>{

    const createRoom = (username:string, roundCount:number, extraWords:Array<String>)=> {
        let lobby_id:string = generateID();
        user.setUser(lobby_id, username, "leader");
        activeLobbies[lobby_id]= new Lobby(lobby_id, user.username,roundCount,extraWords);
        activeLobbies[lobby_id].addUser(user);
        socket.join(lobby_id)
        socket.emit('lobby:post-roomID', lobby_id)
        console.log(activeLobbies)
    }

    const joinRoom = (lobby_id:string,username:string) =>{
        //Verify if lobby is active
        if(activeLobbies[lobby_id] === undefined){
           socket.emit("lobby:verification-response", false, lobby_id);
           return;
        }
        user.setUser(lobby_id,username,"player")
        activeLobbies[lobby_id].addUser(user);
        socket.join(lobby_id);
        socket.emit("lobby:verification-response", true, lobby_id);
        io.to(lobby_id).emit('get_user', activeLobbies[lobby_id].users);
        console.log(activeLobbies)

   }

      const verifyLobby = (lobby_id:string) =>{
        if(!activeLobbies[lobby_id]){
           socket.emit("lobby:set-status", false);
        }
        socket.emit("lobby:set-status", true);
      }
   
      const handleUserPosition = (x:number, y:number, lobby_id:string) => {
         if(!user.isDrawing){
            user.lastPos = {x: x, y: y};
            return;
         }
         activeLobbies[lobby_id].handleHealth( x , y, user.lastPos.x, user.lastPos.y)
         io.to(lobby_id).emit("gameplay:draw", x , y, user.lastPos.x, user.lastPos.y);
         io.to(lobby_id).emit("lobby:set-health", activeLobbies[lobby_id].currentHealth)
         user.lastPos = {x: x, y: y};

      }
      const handleUserDrawingState = (isDrawing:boolean) => {
         user.isDrawing = isDrawing;
      }




   socket.on("lobby:create", createRoom)
   socket.on("lobby:join", joinRoom)
   socket.on("lobby:get-status", verifyLobby)
   socket.on("gameplay:user-position", handleUserPosition);
   socket.on("gameplay:user-drawing-status", handleUserDrawingState);
}