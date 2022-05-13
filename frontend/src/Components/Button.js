export default function Button(props){
    return(
        <button className=" p-3 px-6 rounded-2xl transition-all text-white bg-black hover:bg-purple-500  active:translate-y-1">
            {props.children}
        </button>

    );
}