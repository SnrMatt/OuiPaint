import { useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { SocketContext } from "../Utils/Socketprovider";
import UserProfile from "../Components/UserProfile";
import Self_Message from "../Components/Messages/self_message";
import Others_Message from "../Components/Messages/others_message";
export default function Canvasboard(){
    const canvasRef = useRef()
    const healthBarRef = useRef();
    const roomID = useParams();
    const socket = useContext(SocketContext);
    let total_health = 100,x,y,lastX,lastY,interval,total_time_drawn = 0;
    let total_allowed_time = .4 * 1000
    let color = ['black', 'red', 'green', 'blue', 'yellow'];
    const [lobby, setLobby] = useState(null);
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [choice, setChoice] = useState(null);
    const [chatMessages, addMessages] = useState([]);


    

    useEffect(()=>{
        function gameSetup(ctx,canvas, healthCtx,healthbar) {
            ctx.fillStyle='white';
            ctx.fillRect(0,0,canvas.width, canvas.height);
           // healthCtx.fillStyle = 'red';
          //  healthCtx.fillRect(0,0,healthbar.width, healthbar.height);
           // healthCtx.fillStyle = '#22BF7B';
           // healthCtx.fillRect(0,0, healthbar.width, healthbar.height);
    }
    
    

        socket.emit('join_room', roomID);
        socket.on('new_user', (lobby_info)=>{
            console.log(lobby_info);
                setLobby(lobby_info);
        })

        socket.on('get_user', (currentUser)=>{
            console.log('client got user name');
            setUser(currentUser);
        })
        socket.on('get_role', (user_role)=>{
            setRole(user_role);
        })
       let canvas = canvasRef.current
       let ctx = canvas.getContext('2d');
 
       window.addEventListener('resize', ()=>{
           canvas.width = window.innerWidth - (window.innerWidth  * .25);
           canvas.height = window.innerHeight;
           ctx.fillStyle='white';
           ctx.fillRect(0,0,canvas.width, canvas.height);
   
       })

        //let healthbar = healthBarRef.current;
        //let healthCtx = healthbar.getContext('2d');
        gameSetup(ctx, canvas);
        
        const handleHealthBar = (health) =>{
       //     healthCtx.fillStyle = 'red';
       // healthCtx.fillRect(0,0,healthbar.width, healthbar.height);
        //healthCtx.fillStyle = '#22BF7B';
        //healthCtx.fillRect(0,0,  healthbar.width - (healthbar.width * health), healthbar.height);
        }
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
                socket.emit('position', {x: x, y: y, x2: lastX, y2 :lastY}, roomID)
                if(x !== lastX  || y !== lastY){
                    total_time_drawn++;
                    total_health = total_time_drawn/total_allowed_time;
                    window.requestAnimationFrame(handleHealthBar(total_health));
                }
                    
              }
              else {
                clearInterval(interval)
              }
            }, 0)


        })
        canvas.addEventListener('mouseup', ()=>{
            clearInterval(interval);
        })
        socket.on('draw',({x,y,x2,y2})=>{
            ctx.fillStyle='black';
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

        //#Chat Message Listeners
        socket.on('new_message', (username, message)=>{
            console.log('message recieved');
            addMessages([...chatMessages, <Others_Message username = {username}>{message}</Others_Message>])
        } )
    },[])
    return(
        <>
            <div className ="bg-red-500 h-screen w-screen relative  ">
                 {/**Chat Message*/}
                 <div className = 'h-screen w-1/4 bg-red-500'>
                    <div className = 'flex'>
                            {lobby && lobby.map(user=> {return <UserProfile background = {user.background}>{user.username}</UserProfile>})}
                    </div>
                 </div>
         
                <div className = 'absolute top-0 right-0'>
                    {/**Drawing Board*/}
                        <canvas  height ={window.innerHeight} width={window.innerWidth - (window.innerWidth  * .25)} ref={canvasRef}></canvas>
                    {/**Color UI*/}     
                        <div className = 'flex gap-10 absolute left-1/2 -translate-x-1/2 top-10'>
                        {color.map((currentColor) =>{return <div className = 'hover:cursor-pointer z-50 w-14 h-14 border-4  border-gray-700 rounded-full' style ={{backgroundColor: `${currentColor}`}}></div>})}
                        </div>
                </div>
                
                
              

                    
            </div>
        </>
    );
}


