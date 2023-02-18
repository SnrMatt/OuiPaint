import { User } from "./User";
export class Lobby{

    users:Array<User> = [];
    isPlaying = false;
    currentUserTurn = 0;
    currentWord = "";
    currentTime = 60;
    currentHealth = 300
    constructor(id:String, leader:String, roundCount:Number, extraWords:Array<String>){
        this.id = id;
        this.leader = leader;
        this.roundCount = roundCount;
 
    }
    public addUser(user:User){
        this.users.push(user);
    }

    public handleHealth(x:number,y:number,lastPostX:number, lastPostY:number){
        var distance = Math.sqrt(Math.pow((lastPostX - x), 2) + Math.pow((lastPostY - y), 2));
        this.currentHealth -= distance * 0.1;
        if(this.currentHealth <= 0) {
            this.currentHealth = 0;
        }
      
    }
}



export interface Lobby{
    id:String,
    leader:String,
    roundCount:Number,
    extraWords:Array<String>
}
