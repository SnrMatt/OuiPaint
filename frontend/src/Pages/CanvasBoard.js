import { useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { SocketContext } from "../Utils/Socketprovider";
import UserProfile from "../Components/UserProfile";
import SelfMessage from "../Components/Messages/self_message";
import OthersMessage from "../Components/Messages/others_message";
import { faChessKing, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
export default function Canvasboard(){
    const canvasRef = useRef()
    const healthBarRef = useRef();
    const timerRef = useRef();
    const roomID = useParams();
    const socket = useContext(SocketContext);
    
    let total_allowed_time = .5 * 1000
    let color = ['black', 'red', 'green', 'blue', 'yellow'];
    const [lobby, setLobby] = useState(null);
    const [user, setUser] = useState(null);
    const [chatMessages, addMessages] = useState([]);
    const [startGame, setGameState] = useState();
    var drawColor = 'black'
    const [displayChoice, setDisplay] = useState(false);
    const [currentChoices, setChoices] = useState(null);
    const [currentTime, setTime] = useState(null);
    const [currentWord, setWord] = useState(null);

    useEffect(()=>{

        //Drawing Variables
        let x;
        let y;
        let lastX;
        let lastY;
        let interval;
        let total_health = 100;
        let total_time_drawn = 0;
        let canvas = canvasRef.current
        let ctx = canvas.getContext('2d');
        let healthbar = healthBarRef.current;
        let healthCtx = healthbar.getContext('2d');
        let timer = timerRef.current;
        let timerCtx = timer.getContext('2d');
 
     
     
     
        gameSetup(ctx, canvas, healthCtx, healthbar);
     
        /**
         * Canvas / Windows Listeners
         */
    window.addEventListener('resize', ()=>{
        canvas.width = window.innerWidth - (window.innerWidth  * .25);
        canvas.height = window.innerHeight;
        ctx.fillStyle='white';
        ctx.fillRect(0,0,canvas.width, canvas.height);

    })
     canvas.addEventListener('mousemove', (e)=>{
      x = e.offsetX;
      y = e.offsetY;
     })
     canvas.addEventListener('mouseleave', ()=>{
         clearInterval(interval)
     })

     canvas.addEventListener('mousedown', ()=>{
         lastX = x;
         lastY = y;
         interval = setInterval(()=>{
         
           if(total_time_drawn !== total_allowed_time){
             socket.emit('position', {x: x, y: y, x2: lastX, y2 :lastY}, roomID, drawColor)
             if(x !== lastX  || y !== lastY){
                 socket.emit('send_health_amount', total_health, total_time_drawn, roomID);
             }
                 
           }
           else {
             clearInterval(interval) 
           }
         }, 1)


     })
     canvas.addEventListener('mouseup', ()=>{
         clearInterval(interval);
     })

      
    

     /**
      * Socket Emitters and Listeners
      */
        socket.emit('join_room', roomID);
        socket.emit('check_game_status',roomID);
        socket.on('response_start_game', (status)=>{
            setGameState(status);
        })
        socket.on('new_user', (lobby_info)=>{
                setLobby(lobby_info);
        })

        socket.on('get_user', (currentUser)=>{
           
            setUser(currentUser);
        })
         /**
         * Round Listeners
         */

        socket.on('get_word', (word)=>{
            setWord(
                <div className="flex gap-10">
                    {
                        word.map(length =>{
                           let blank_word = []
                            for(var i = 0; i < length; i++){
                                blank_word.push(<div className="w-10 h-10 border-b-2 border-black"></div>)
                            }
                           return <div className="flex gap-1">{blank_word}</div>
                        })
                    }
                </div>
            )
        })
        socket.on('create_user_choices',(choices)=>{
                    setDisplay(true);
                    setChoices(choices)
        })
        socket.on('current_time', (time_left)=>{
            setTime(time_left);
           requestAnimationFrame(()=>{handleTimer(time_left)})
        })
      
        socket.on('change_color', (color)=>{
            ctx.strokeStyle = color;
            console.log(color);
        })
        socket.on('clear_board', (health)=>{
            ctx.clearRect(0,0,canvas.width,canvas.height)
           
            total_time_drawn = 0
            total_health = total_time_drawn/total_allowed_time;
            requestAnimationFrame(()=>{handleHealthBar(total_health)})
        })
        socket.on('new_health_amount', (new_total_health, new_total_time_drawn)=>{
            
            total_health = new_total_health
            total_time_drawn = new_total_time_drawn;
            requestAnimationFrame(()=>{handleHealthBar(total_health)})
        })
        socket.on('draw',({x,y,x2,y2})=>{
           if(lastX !== x || lastY !== y){
            ctx.beginPath();
            ctx.moveTo(x2, y2);
            ctx.lineWidth =5;
            ctx.lineCap = 'round';
            ctx.lineTo(x,y)
            ctx.stroke();
           }
           lastX = x
           lastY = y;
        })


        /**
         * Functions
         */
    function gameSetup(ctx,canvas, healthCtx,healthbar) {
            ctx.fillStyle='white';
            ctx.fillRect(0,0,canvas.width, canvas.height);
           healthCtx.fillStyle = 'red';
           healthCtx.fillRect(0,0,healthbar.width, healthbar.height);
           healthCtx.fillStyle = '#22BF7B';
           healthCtx.fillRect(0,0, healthbar.width, healthbar.height);
    }
    const handleHealthBar = (health) =>{
        healthCtx.fillStyle = 'red';
        healthCtx.fillRect(0,0,healthbar.width, healthbar.height);
        healthCtx.fillStyle = '#22BF7B';
        healthCtx.fillRect(0,0,  healthbar.width - (healthbar.width * health), healthbar.height);
        }
    const handleTimer=(current_time)=>{
        //To make it look good, i need to predit where the next second will place the animation
        //Once we find the difference
        timerCtx.clearRect(0,0,timer.width,timer.height)
                timerCtx.beginPath();
                timerCtx.arc(timer.width/2, timer.height/2, timer.width /2 - 10, 0, (2*Math.PI))
                timerCtx.lineWidth = 12;
                timerCtx.strokeStyle = 'red';
                timerCtx.lineCap = 'round';
                timerCtx.stroke();

               
                timerCtx.beginPath();
                timerCtx.arc(timer.width/2, timer.height /2, timer.width / 2- 10, 0,  (2 * Math.PI) * ((current_time/80)));
                timerCtx.lineWidth = 15;
                timerCtx.strokeStyle = '#5CD676';
                timerCtx.lineCap = 'round';
                timerCtx.stroke();
    }

       

    },[])

    /**
     * Function for pre-render
     */

    const handleChat =(e)=>{
        if(e.key ==='Enter'){
            let message = e.target.value;
            console.log(message);
            socket.emit('send_chat', user.username.toString(), message, roomID);
            console.log(chatMessages);
            addMessages([...chatMessages, <SelfMessage username = {user.username}>{message}</SelfMessage>])
            e.target.value = '';
        }
    }
    const handleWordChoice = (word)=>{
            socket.emit('user_response', word)
            setDisplay(false)
    }
            //#Chat Message Listeners
            socket.on('new_message', (username, message)=>{
                console.log('message recieved');
                console.log(chatMessages);
                addMessages([...chatMessages, <OthersMessage username = {username}>{message}</OthersMessage>])
            })

    return(
        <>
            <div className ="h-screen w-screen relative  ">
            
                 {/**Chat Message*/}
                 <div className = ' flex flex-col h-screen w-1/4 bg-gray-600 border-r-2 border-gray-500'>
              
                    <div className = 'flex flex-col h-auto w-full'>
                            <div className="flex flex-col gap-1 border-b-2 border-gray-500">
                           
                                {lobby && lobby.map(user =>{return <div key={user.username.toString()} className="p-1"> < UserProfile background={user.background}>{user.username}</UserProfile> </div>})}

                            </div>
                    </div>
                    <div className="h-full w-full flex flex-col relative p-4 gap-5 overflow-y-auto">
                            {chatMessages && chatMessages.map(message=>{return message})}           
                </div>
                    <div className="w-full  p-4 flex justify-center"> <input className="w-2/3 h-10 rounded-md bg-gray-500 text-white p-1 focus:outline-none"  onKeyUp={(e)=>handleChat(e)}  type='text'/></div>
            </div>
               {(displayChoice === true) && 
               <div className="h-full w-3/4 absolute top-0 right-0  z-50" style = {{backgroundColor: 'rgb(0,0,0,.9'}}>
                   <div className="h-full w-full flex justify-evenly items-center ">{currentChoices && currentChoices.map(el=>{return <button onClick={()=>{handleWordChoice(el)}} className="bg-white text-4xl px-10 py-3 active:translate-y-0 rounded-full transition-all hover:shadow-xl  hover:-translate-y-3 hover:bg-green-500 hover:text-white">{el}</button>})}</div>
               </div> }
                {/**Player pregame messages */}
                 {(user && user.role === 'leader' && startGame === false ) && 
                   <div className="w-3/4 h-full  absolute top-0 right-0 z-50 flex flex-col justify-center items-center gap-5" style={{backgroundColor:'rgb(0,0,0,.9)'}}>
                        <h1 className="text-white text-5xl">Start Game?</h1>
                        <button onClick={()=>{socket.emit('start_game',  roomID)}} className="bg-green-500 text-3xl rounded-lg px-3 py-1 text-white hover:bg-green-700 active:translate-y-1 transition-all">Start</button>
                    </div>}
                    {(user && user.role === 'player' && startGame === false ) && 
                   <div className="w-3/4 h-full  absolute top-0 right-0 z-50 flex flex-col justify-center items-center gap-5" style={{backgroundColor:'rgb(0,0,0,.9)'}}>
                        <h1 className="text-white text-5xl text-center">Waiting for leader to start game...</h1>
                    </div>}
                {/**Drawing Board*/}
              
                <div className = 'absolute top-0 right-0'>
                <div className="absolute left-1/2 top-40 z-50 -translate-x-1/2 flex gap-4">{currentWord}</div>
                <div className="absolute right-32 top-10 z-50 text-2xl ">
                    {/**Timer Canvas */}
                    <canvas height ={100} width={100}  ref ={timerRef}></canvas>
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">{Math.floor(currentTime)}</span>
                </div>
                        <canvas  height ={window.innerHeight} width={window.innerWidth - (window.innerWidth  * .25)} ref={canvasRef}></canvas>
                                 {/**Health Bar */}
                        <canvas className="absolute top-28 left-1/2 -translate-x-1/2 rounded-xl" height = {30} width = {300} ref = {healthBarRef}/>
                    {/**Color UI*/} 
                        <div className = 'flex gap-10 absolute left-1/2 -translate-x-1/2 top-10'>
                        {color.map((currentColor) =>{return <div key ={currentColor} onClick = {()=>{socket.emit('send_color', currentColor, roomID)}} className = 'hover:cursor-pointer hover:border-sky-500 hover:translate-y-1  transition-all z-50 w-14 h-14 border-4  border-gray-700 rounded-full' style ={{backgroundColor: `${currentColor}`}}></div>})}
                        <div className="flex items-center hover:cursor-pointer hover:translate-y-1  transition-all" onClick = {()=>{socket.emit('request_clear_board', roomID)}}><FontAwesomeIcon className="h-12 hover: " icon= {faTrash}/></div>
                </div>
                </div>
            </div>
        </>
    );
}


