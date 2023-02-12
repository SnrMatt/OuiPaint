import { Socket,Server } from "socket.io";



export interface User{
    id:String,
    socket:Socket,
    io:Server
}
export class User{ 
    username:string ="";
    currentRoom:String = "";
    
    constructor( id:String){
        this.id = id
    }



    public setUser(lobby_id:string,username:string){
        this.username = username;
        this.currentRoom=lobby_id;
    }
}