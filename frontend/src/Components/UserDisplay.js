import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faCrown} from '@fortawesome/free-solid-svg-icons'
export default function UserDisplay(props){

 
    
    //let user = props.user.user; this will be an object of UserName, Role, Points
    return(
        <div className=" flex items-center border-b-2 border-black p-4">
                <div className="max-w-2/5 text-ellipsis overflow-hidden whitespace-nowrap ">
                    {props.user.username}
                    
                </div>
                {props.user.role ==='leader'&&
                    <span className='pl-3'><FontAwesomeIcon icon = {faCrown}/></span>}
                <div className='ml-auto bg-green-600 text-white px-3 rounded-lg'>
                    {props.user.points}
                </div>
        </div>

    );
}