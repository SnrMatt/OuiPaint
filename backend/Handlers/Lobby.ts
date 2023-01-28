interface Lobby {
    roundCount:Number,
    wordList:Array<String>
}
class Lobby{
    currentUserTurn = 0;
    currentUserPo= { x: "", y: "" };
    total_drawn= 0;
    currentTime= 60;
    currentLobbyState= false;
    currentWord= null;
    currentDrawingBoard= [];
    currentAcceptedUsers= [];
    isDrawing= true;

        constructor(
            roundCount:Number,
            wordList:Array<String> 
        )
        {
            this.roundCount = roundCount;
            this.wordList = wordList
        }

}