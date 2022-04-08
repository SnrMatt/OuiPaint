export default function Button(props){
    return(
        <button className=" p-3 px-6 rounded-2xl text-white bg-black transition-all duration-200 active:translate-y-1">
            {props.children}
        </button>

    );
}