import { Socket } from "socket.io";

export interface User{
    id:String,
    socket:Socket
}
export class User{ 
    username:String|null = null;
    constructor( id:String, socket:Socket){
        this.id = id
        this.socket = socket;
        this.listeners();
    }

    //Getters
    public getId(){
        return this.id;
    }
    //Setters
    private setUsername(username:String){
        this.username = username;
    }
    //Methods
    private RequestRoom(){
        
    }
    //Listeners
    private listeners(){
        this.socket.on('request_room', ()=>{console.log('test')})
    }
  
}