import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCrown } from "@fortawesome/free-solid-svg-icons";

export default function UserProfile(props){


    return(
       <div className="flex items-center text-md relative text-white">
           {props.role === 'leader' && <span className="absolute -top-10"><FontAwesomeIcon icon = {faCrown}/></span>}
        <div 
        className="h-16  w-16 overflow-auto  rounded-full self-center  flex items-center text-white justify-center"
        style = {{backgroundColor:props.background}}
        >
        {props.children && props.children[0].toUpperCase()}
        </div>
        <span className="w-36 pl-4 overflow-ellipsis whitespace-nowrap overflow-hidden"> {props.children.toUpperCase()}</span>
        <span className="absolute right-5">{props.points}</span>
       </div>
    );
    
}