import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCrown } from "@fortawesome/free-solid-svg-icons";

export default function UserProfile(props){
    let randomColor = `rbg (${Math.floor(Math.random())*255}, ${Math.floor(Math.random())*255},${Math.floor(Math.random())*255})`;
    console.log(randomColor);
    return(
       <div className="flex flex-col items-center text-xl relative text-white">
           <span className="absolute -top-10"><FontAwesomeIcon icon = {faCrown}/></span>
        <div 
        className="h-2/3  w-16 overflow-auto  rounded-full self-center  flex items-center justify-center"
        style = {{backgroundColor:randomColor}}
        >
        
        </div>
        <span className="w-36 text-center overflow-ellipsis whitespace-nowrap overflow-hidden"> {props.children}</span>
       </div>
    );
    
}