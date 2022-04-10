import { useContext, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { SocketContext } from "../Utils/Socketprovider";
export default function Canvasboard(){
    const canvasRef = useRef()
    const id = useParams();
    const socket = useContext(SocketContext);
    let x,y,lastX,lastY;
    let interval

    useEffect(()=>{
        socket.emit('join_room', id);
        let canvas = canvasRef.current
        let ctx = canvas.getContext('2d');
        ctx.fillStyle='white';
        ctx.fillRect(0,0,canvas.width, canvas.height);
        canvas.addEventListener('mousemove', (e)=>{
            x = e.offsetX;
            y = e.offsetY;
        })


        canvas.addEventListener('mousedown', ()=>{
            lastX = x;
            lastY = y;
            interval = setInterval(()=>{
            socket.emit('position', {x: x, y: y, x2: lastX, y2 :lastY})
        }, 0)
        })
        canvas.addEventListener('mouseup', ()=>{
            clearInterval(interval);
        })
        socket.on('draw',({x,y,x2,y2})=>{
            ctx.fillStyle='black';
           if(lastX != x || lastY != y){
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

        <div className="flex justify-center items-start bg-blue-300 h-screen w-screen">
            <canvas className="shadow-2xl" width={1000} height = {500} ref = {canvasRef}/>
        </div>
    );
}
