import { Socket,Server } from "socket.io";



export interface User{
    id:string,
    socket:Socket,
    io:Server
}
export class User{ 
    username:string ="";
    currentRoom:String = "";
    isDrawing = false;
    lastPos = {x: 0 , y: 0 }
    role = ""
    background = `rgb(${Math.floor((Math.random() * 256) / 2)},${Math.floor(
        (Math.random() * 256) / 2
      )},${Math.floor((Math.random() * 256) / 2)})`;

    points = 0;
    constructor( id:string){
        this.id = id
    }



    public setUser(lobby_id:string,username:string, role:string){
        this.username = username;
        this.currentRoom=lobby_id;
        this.role = role;
    }
}