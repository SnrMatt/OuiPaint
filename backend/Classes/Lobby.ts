import { User } from "./User";
export class Lobby{

    users:UserList = {};
    isPlaying = false;

    constructor(id:String, leader:String, roundCount:Number, extraWords:Array<String>){
        this.id = id;
        this.leader = leader;
        this.roundCount = roundCount;
    }
    public addUser(user:User){
        this.users[user.username] = user;
    }
}


export interface UserList{
    [username:string]: User
}
export interface Lobby{
    id:String,
    leader:String,
    roundCount:Number,
    extraWords:Array<String>
}
