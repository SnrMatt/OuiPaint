import { useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { SocketContext } from "../Utils/Socketprovider";
import UserProfile from "../Components/UserProfile";
import SelfMessage from "../Components/Messages/self_message";
import OthersMessage from "../Components/Messages/others_message";
import { faChessKing, faTrash, faComment, faUser, faXmark } from "@fortawesome/free-solid-svg-icons";
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
    const [user, setUser] = useState();
    const [chatMessages, addMessages] = useState([]);
    const [startGame, setGameState] = useState();
    var drawColor = 'black'
    const [displayChoice, setDisplay] = useState(false);
    const [currentChoices, setChoices] = useState(null);
    const [currentRound, setRoundCount] = useState(0);
    const [currentTime, setTime] = useState(null);
    const [currentWord, setWord] = useState(null);
    /**-----------------------Mobile Drawers State----------------------- */
    const [chatIsOpen, setChatStatus] = useState(false);
    const [infoIsOpen, setInfoStatus] = useState(false);
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
        canvas.width = window.innerWidth ;
        canvas.height = window.innerHeight;
        ctx.fillStyle='white';
        ctx.fillRect(0,0,canvas.width, canvas.height);

    })
     canvas.addEventListener('mousemove', (e)=>{
      x = e.offsetX;
      y = e.offsetY;
     })
     canvas.addEventListener('touchmove', (e)=>{
        x = e.touches[0].clientX;
        y = e.touches[0].clientY;
       })
       canvas.addEventListener('touchmove', (e)=>{
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
        socket.on('update_points', (lobby_info)=>{
            setLobby(lobby_info);           
        })
        socket.on('get_round_count', ()=>{
            setRoundCount(currentRound + 1);
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
                timerCtx.arc(timer.width/2, timer.height /2, timer.width / 2- 10, 0,  (2 * Math.PI) * ((current_time/10)));
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
    
            socket.emit('send_chat', user.username.toString(), message, roomID);
  
            addMessages([...chatMessages, <SelfMessage username = {user.username}>{message}</SelfMessage>])
            e.target.value = '';
        }
    }
    const handleChatDrawer = ()=>{
        if(chatIsOpen){
            setChatStatus(false);
        }
        else{
            setChatStatus(true);
        }
    }
    const handleInfoDrawer = ()=>{
        if(infoIsOpen){
            setInfoStatus(false);
        }
        else{
            setInfoStatus(true);
        }
    }
    const handleWordChoice = (word)=>{
        console.log(word);
            socket.emit('user_response', word)
            setDisplay(false)
    }
            //#Chat Message Listeners
            socket.on('new_message', (username, message)=>{
                addMessages([...chatMessages, <OthersMessage username = {username}>{message}</OthersMessage>])
            })

    return(
        <>
            <div className="h-screen w-screen text-black overflow-hidden relative">
                {/**-----------------------Color Tools----------------------- */}
                <div className="flex gap-5 absolute top-5 left-1/2 -translate-x-1/2">
                    {color.map((currentColor)=>{
                        return <button key={currentColor} onClick={()=>{socket.emit('send_color',currentColor,roomID)}} className ="w-10 h-10 rounded-full border-black border-4 focus:border-blue-500" style ={{backgroundColor: `${currentColor}`}}></button>
                    })}
                    <button 
                    className="w-10 h-10"
                    onClick = {()=>{socket.emit('request_clear_board', roomID)}}
                    >
                        <FontAwesomeIcon className="text-4xl" icon={faTrash}/>
                    </button>
                </div>     
                {/**-----------------------Drawing Board-----------------------*/}
                <canvas height = {window.innerHeight} width={window.innerWidth} ref={canvasRef} ></canvas>
                {/**-----------------------Health Bar-----------------------*/}
                <canvas className='rounded-full absolute top-20 left-1/2 -translate-x-1/2' height= {20} width={300}  ref={healthBarRef}></canvas>
                {/**-----------------------Timer-----------------------*/}
                <canvas className="absolute top-0" height = {40} width={40} ref={timerRef}></canvas>

                {/**-----------------------UI Buttons for Mobile-----------------------*/}
                <button 
                    className="md:hidden w-14 h-14 flex justify-center items-center p-4 bg-gradient-to-r from-purple-500 to-pink-500 absolute bottom-24 left-5 rounded-full transition-all duration-200  active:translate-y-1 active:bg-green-500"
                    onClick={()=>{handleChatDrawer()}}
                >
                    <FontAwesomeIcon className="text-3xl -scale-x-100 text-white" icon={faComment}/>
                </button>

                <input 
                    className="bg-gray-600 px-6 py-3 absolute bottom-10 rounded-full left-1/2 -translate-x-1/2 text-white focus:outline-none" 
                    type={'text'} 
                    placeholder="Enter Answer or Message!"
                    onKeyUp={(e)=>handleChat(e)}
                />
                <button
                    className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full absolute bottom-24 right-5 transition-all duration-200  active:translate-y-1 active:bg-green-500"
                    onClick={()=>{handleInfoDrawer()}}
                >
                    <FontAwesomeIcon className="text-white text-3xl " icon={faUser}/>
                </button>
                {/**-----------------------UI Components-----------------------*/}
                {/**Message Display for Mobile*/}
            <div className={`${chatIsOpen ? '':'-translate-x-full'} md:translate-x-0 md:w-1/6 h-screen w-screen absolute bg-gray-700 top-0 flex flex-col duration-500 transition-all`}>
                <div className="w-full h-5/6 flex flex-col relative p-4 gap-5 overflow-y-auto ">
                    {chatMessages && chatMessages.map(message=>{return message})}
                </div>
                <div className="w-fill h-1/6 relative">
                    <div className="md:hidden absolute flex bottom-10 left-1/2 -translate-x-1/2 w-full gap-4 justify-center items-center">
                        <input 
                            className="bg-gray-600 px-6 py-3  rounded-full  text-white focus:outline-none" 
                            type={'text'} 
                            placeholder="Enter Answer or Message!"
                            onKeyUp={(e)=>handleChat(e)}
                        />
                        <button
                            className="h-12 w-12 bg-red-500  rounded-full flex justify-center items-center"
                            onClick={()=>{handleChatDrawer()}}
                        >
                            <FontAwesomeIcon className="text-white text-3xl" icon={faXmark}/>
                        </button>
                    </div>
                </div>
                </div>
                {/**Lobby Information for Mobile */}
                <div className={`${infoIsOpen ? '' : 'translate-x-full'} md:translate-x-0 md:w-1/6 md:right-0 h-screen w-screen  absolute bg-gray-700 top-0 transition-all duration-500`}>
                    <div className="h-4/6 w-full">
                        {lobby && lobby.map(user =>{return <div key={user.username.toString()} className="p-1"> < UserProfile background={user.background} points ={user.points}>{user.username}</UserProfile> </div>})}
                    </div>
                    <div className="h-2/6 w-full p-5 text-white text-3xl">
                        {currentRound && <span>Round: {currentRound}</span>}
                    </div>
                    <button 
                    className="md:hidden absolute bottom-10 h-14 w-14 bg-red-500 rounded-full left-1/2 -translate-x-1/2"
                    onClick={()=>{handleInfoDrawer()}}
                    >
                        <FontAwesomeIcon className="text-white text-3xl" icon ={faXmark}/>
                    </button>
                </div>

            </div>
        </>
    );
}


