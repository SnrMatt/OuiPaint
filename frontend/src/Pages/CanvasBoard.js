import { useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { SocketContext } from "../Utils/Socketprovider";
export default function Canvasboard(){
    const canvasRef = useRef()
    const healthBarRef = useRef();
    const id = useParams();
    const socket = useContext(SocketContext);
    const [total_health, setHealth] = useState(100)
    let x,y,lastX,lastY;
    let interval
    let total_time_drawn = 0

    useEffect(()=>{
        socket.emit('join_room', id);
        let canvas = canvasRef.current, healthbar = healthBarRef.current;
        let ctx = canvas.getContext('2d'), healthCtx = healthbar.getContext('2d');
        ctx.fillStyle='white';
        ctx.fillRect(0,0,canvas.width, canvas.height);
        healthCtx.fillStyle = 'red';
        healthCtx.fillRect(0,0,healthbar.width, healthbar.height);
        healthCtx.fillStyle = 'yellow';
        healthCtx.fillRect(0,0, healthbar.width- 13, healthbar.height);
        canvas.addEventListener('mousemove', (e)=>{
            x = e.offsetX;
            y = e.offsetY;
        })

        canvas.addEventListener('mousedown', ()=>{
            lastX = x;
            lastY = y;
            interval = setInterval(()=>{
              console.log(total_time_drawn)
              if(total_time_drawn !== 1000){
                socket.emit('position', {x: x, y: y, x2: lastX, y2 :lastY})
                  total_time_drawn++;
                   setHealth(100 -  Math.floor((total_time_drawn/1000)*100))
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

    })
    return(
        <div className="flex flex-col gap-5 justify-start items-center bg-blue-300 h-screen w-screen">
            <canvas className="shadow-2xl" width={1000} height = {500} ref = {canvasRef}/>
            <div >
                <canvas className="rounded-xl" ref ={healthBarRef} width = {200} height= {40}></canvas>
            </div>
        </div>
    );
}
