import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SocketContext } from "../Utils/Socketprovider";
import UserProfile from "../Components/UserProfile";
import SelfMessage from "../Components/Messages/self_message";
import OthersMessage from "../Components/Messages/others_message";
import {
  faTrash,
  faComment,
  faUser,
  faXmark,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquareFontAwesomeStroke } from "@fortawesome/free-brands-svg-icons";
export default function Canvasboard() {
  const navigate = useNavigate();
  const canvasRef = useRef();
  const healthBarRef = useRef();
  const timerRef = useRef();
  const roomID = useParams();
  const socket = useContext(SocketContext);
  let timerInterval;
  let color = ["black", "red", "green", "blue", "yellow"];
  const [lobby, setLobby] = useState(null);

  const [user, setUser] = useState();
  const [chatMessages, addMessages] = useState([]);
  const [startGame, setGameState] = useState();
  const [displayChoice, setDisplay] = useState(false);
  const [displayWait, setWaitDisplay] = useState();
  const [displayCorrect, setCorrectDisplay] = useState(false);
  const [displayGameOver, setGameOverDisplay] = useState(false);
  const [currentChoices, setChoices] = useState(null);
  const [currentRound, setRoundCount] = useState(0);
  const [currentWord, setWord] = useState(null);
  const [finalScoreboard, setScoreboard] = useState(null);
  /**-----------------------Mobile Drawers State----------------------- */
  const [chatIsOpen, setChatStatus] = useState(false);
  const [infoIsOpen, setInfoStatus] = useState(false);
  useEffect(() => {
    //Drawing Variables
    let x;
    let y;
    let isMouseDown = false;
    let canvas = canvasRef.current;
    let ctx = canvas.getContext("2d");
    ctx.strokeStyle = "black";
    let healthbar = healthBarRef.current;
    let healthCtx = healthbar.getContext("2d");
    let timer = timerRef.current;
    let timerCtx = timer.getContext("2d");

    gameSetup(ctx, canvas, healthCtx, healthbar);

    /**
     * Canvas / Windows Listeners
     */
    window.addEventListener("resize", () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    });

    let MouseMove;
    let TouchMove;
    let TouchEnd;
    let MouseLeave;
    let MouseDown;
    let MouseUp;
    socket.on("enable_drawing", () => {
      canvas.addEventListener(
        "mousemove",
        (MouseMove = (e) => {
          x = e.offsetX;
          y = e.offsetY;
          if (isMouseDown === true) {
            socket.emit("position", x, y, roomID);
          }
        })
      );
      canvas.addEventListener(
        "touchmove",
        (TouchMove = (e) => {
          x = e.touches[0].clientX;
          y = e.touches[0].clientY;
          socket.emit("position", x, y, roomID);
        }),
        {}
      );
      canvas.addEventListener(
        "touchend",
        (TouchEnd = () => {
          socket.emit("release", roomID);
          clearInterval(timerInterval);
        })
      );

      canvas.addEventListener(
        "mouseleave",
        (MouseLeave = () => {
          isMouseDown = false;
        })
      );

      canvas.addEventListener(
        "mousedown",
        (MouseDown = () => {
          isMouseDown = true;
        })
      );
      canvas.addEventListener(
        "mouseup",
        (MouseUp = () => {
          isMouseDown = false;
          socket.emit("release", roomID);
        })
      );
    });

    socket.on("disable_drawing", () => {
      canvas.removeEventListener("mousemove", MouseMove);
      canvas.removeEventListener("touchmove", TouchMove);
      canvas.removeEventListener("touchend", TouchEnd);
      canvas.removeEventListener("mouseleave", MouseLeave);
      canvas.removeEventListener("mousedown", MouseDown);
      canvas.removeEventListener("mouseup", MouseUp);
    });

    /**
     * Socket Emitters and Listeners
     */
    socket.emit("join_room", roomID);
    socket.emit("check_game_status", roomID);
    socket.on("response_start_game", (status) => {
      setGameState(status);
    });
    socket.on("new_user", (lobby_info) => {
      setLobby(lobby_info);
    });

    socket.on("get_user", (currentUser) => {
      setUser(currentUser);
    });
    socket.on("update_points", (lobby_info) => {
      setLobby(lobby_info);
    });
    socket.on("get_round_count", () => {
      setRoundCount(currentRound + 1);
    });

    socket.on("wait_for_user", (status) => {
      setWaitDisplay(status);
    });

    /**
     * Round Listeners
     */

    socket.on("get_word", (word) => {
      setWord(
        <div className="flex gap-10">
          {word.map((length) => {
            let blank_word = [];
            for (var i = 0; i < length; i++) {
              blank_word.push(
                <div className="w-5 h-5 border-b-2 border-black"></div>
              );
            }
            return <div className="flex gap-1">{blank_word}</div>;
          })}
        </div>
      );
    });
    socket.on("create_user_choices", (choices) => {
      console.log("display");
      setDisplay(true);
      setChoices(choices);
    });
    socket.on("correct_choice", () => {
      setCorrectDisplay(true);
      setTimeout(() => {
        setCorrectDisplay(false);
      }, 1000);
    });

    socket.on("current_time", (time_left) => {
      requestAnimationFrame(() => {
        handleTimer(time_left);
      });
    });
    socket.on("game_over", (final_scoreboard) => {
      setScoreboard(final_scoreboard);
      console.log("game over");
      setGameOverDisplay(true);
    });
    socket.on("change_color", (color) => {
      ctx.strokeStyle = color;
      console.log(color);
    });
    socket.on("clear_board", (total_health) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      requestAnimationFrame(() => {
        handleHealthBar(total_health);
      });

      // requestAnimationFrame(()=>{handleHealthBar(total_health)})
    });
    socket.on("new_health", (total_health) => {
      requestAnimationFrame(() => {
        handleHealthBar(total_health);
      });
    });
    socket.on("draw", (x, y, x2, y2) => {
      console.log("drawing");
      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x, y);
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      ctx.stroke();
      ctx.closePath();
    });

    /**
     * Functions
     */
    function gameSetup(ctx, canvas, healthCtx, healthbar) {
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      healthCtx.fillStyle = "red";
      healthCtx.fillRect(0, 0, healthbar.width, healthbar.height);
      healthCtx.fillStyle = "#22BF7B";
      healthCtx.fillRect(0, 0, healthbar.width, healthbar.height);
    }
    const handleHealthBar = (health) => {
      healthCtx.fillStyle = "red";
      healthCtx.fillRect(0, 0, healthbar.width, healthbar.height);
      healthCtx.fillStyle = "#22BF7B";
      healthCtx.fillRect(
        0,
        0,
        healthbar.width - healthbar.width * health,
        healthbar.height
      );
    };
    const handleTimer = (current_time) => {
      timerCtx.clearRect(0, 0, timer.width, timer.height);
      timerCtx.beginPath();
      timerCtx.arc(
        timer.width / 2,
        timer.height / 2,
        timer.width / 2 - 10,
        0,
        2 * Math.PI
      );
      timerCtx.lineWidth = 12;
      timerCtx.strokeStyle = "red";
      timerCtx.lineCap = "round";
      timerCtx.stroke();
      timerCtx.beginPath();
      timerCtx.arc(
        timer.width / 2,
        timer.height / 2,
        timer.width / 2 - 10,
        0,
        2 * Math.PI * (current_time / 60)
      );
      timerCtx.lineWidth = 15;
      timerCtx.strokeStyle = "#5CD676";
      timerCtx.lineCap = "round";
      timerCtx.stroke();
    };
  }, []);

  /**
   * Function for pre-render
   */

  const handleChat = (e) => {
    if (e.key === "Enter") {
      let message = e.target.value;

      socket.emit("send_chat", user.username.toString(), message, roomID);

      addMessages([
        ...chatMessages,
        <SelfMessage username={user.username}>{message}</SelfMessage>,
      ]);
      e.target.value = "";
    }
  };
  const handleChatDrawer = () => {
    if (chatIsOpen) {
      setChatStatus(false);
    } else {
      setChatStatus(true);
    }
  };
  const handleInfoDrawer = () => {
    if (infoIsOpen) {
      setInfoStatus(false);
    } else {
      setInfoStatus(true);
    }
  };
  const handleWordChoice = (word) => {
    console.log(word);
    socket.emit("user_response", word);
    setDisplay(false);
  };
  //#Chat Message Listeners
  socket.on("new_message", (username, message) => {
    addMessages([
      ...chatMessages,
      <OthersMessage username={username}>{message}</OthersMessage>,
    ]);
  });
  const listOnlineUsers = () => {
    let current_list = [];
    for (var i = 0; i < 6; i++) {
      if (i < lobby.length) {
        current_list.push(lobby[i].username[0]);
      } else {
        current_list.push("?");
      }
    }
    return (
      <div className="grid grid-cols-3 grid-rows-2 gap-5">
        {current_list.map((user) => {
          return (
            <div className="justify-self-center self-center w-14 flex justify-center items-center h-14 rounded-full bg-gray-300">
              {user}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <div className="h-screen w-screen text-black overflow-hidden relative">
        {/**-----------------------Color Tools----------------------- */}
        <div className="flex gap-5 absolute top-5 left-1/2 -translate-x-1/2">
          {color.map((currentColor) => {
            return (
              <button
                key={currentColor}
                onClick={() => {
                  socket.emit("send_color", currentColor, roomID);
                }}
                className="w-10 h-10 rounded-full border-black border-4 focus:border-blue-500"
                style={{ backgroundColor: `${currentColor}` }}
              ></button>
            );
          })}
          <button
            className="w-10 h-10"
            onClick={() => {
              socket.emit("request_clear_board", roomID);
            }}
          >
            <FontAwesomeIcon className="text-4xl" icon={faTrash} />
          </button>
        </div>
        {/**-----------------------Drawing Board-----------------------*/}
        <canvas
          height={window.innerHeight}
          width={window.innerWidth}
          ref={canvasRef}
        ></canvas>
        {/**-----------------------Health Bar-----------------------*/}
        <canvas
          className="rounded-full absolute top-20 left-1/2 -translate-x-1/2"
          height={20}
          width={300}
          ref={healthBarRef}
        ></canvas>
        {/**-----------------------Timer-----------------------*/}
        <canvas
          className="absolute top-36 right-5 md:right-1/3 md:top-20"
          height={70}
          width={70}
          ref={timerRef}
        ></canvas>
        {currentWord && (
          <div className="absolute top-28 left-1/2 -translate-x-1/2">
            {currentWord}
          </div>
        )}

        {/**-----------------------UI Buttons for Mobile-----------------------*/}
        <button
          className="md:hidden w-14 h-14 flex justify-center items-center p-4 bg-gradient-to-r from-purple-500 to-pink-500 absolute bottom-24 left-5 rounded-full transition-all duration-200  active:translate-y-1 active:bg-green-500"
          onClick={() => {
            handleChatDrawer();
          }}
        >
          <FontAwesomeIcon
            className="text-3xl -scale-x-100 text-white"
            icon={faComment}
          />
        </button>

        <input
          className="bg-gray-600 px-6 py-3 absolute bottom-24 md:bottom-10 rounded-full left-1/2 -translate-x-1/2 text-white focus:outline-none"
          type={"text"}
          placeholder="Enter Answer or Message!"
          onKeyUp={(e) => handleChat(e)}
        />
        <button
          className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full absolute bottom-24 right-5 transition-all duration-200  active:translate-y-1 active:bg-green-500"
          onClick={() => {
            handleInfoDrawer();
          }}
        >
          <FontAwesomeIcon className="text-white text-3xl " icon={faUser} />
        </button>
        {/**-----------------------UI Components-----------------------*/}
        {/**Message Display for Mobile*/}
        <div
          className={`${
            chatIsOpen ? "" : "-translate-x-full"
          } md:translate-x-0 md:w-1/6 h-screen w-screen absolute bg-gray-700 top-0 flex flex-col duration-500 transition-all`}
        >
          <div className="w-full h-5/6 flex flex-col relative p-4 gap-5 overflow-y-auto ">
            {chatMessages &&
              chatMessages.map((message) => {
                return message;
              })}
          </div>
          <div className="w-fill h-1/6 relative">
            <div className="md:hidden absolute flex bottom-24 md:bottom-10 left-1/2 -translate-x-1/2 w-full gap-4 justify-center items-center">
              <input
                className="bg-gray-600 px-6 py-3  rounded-full  text-white focus:outline-none"
                type={"text"}
                placeholder="Enter Answer or Message!"
                onKeyUp={(e) => handleChat(e)}
              />
              <button
                className="h-12 w-12 bg-red-500  rounded-full flex justify-center items-center"
                onClick={() => {
                  handleChatDrawer();
                }}
              >
                <FontAwesomeIcon
                  className="text-white text-3xl"
                  icon={faXmark}
                />
              </button>
            </div>
          </div>
        </div>
        {/**Lobby Information for Mobile */}
        <div
          className={`${
            infoIsOpen ? "" : "translate-x-full"
          } md:translate-x-0 md:w-1/6 md:right-0 h-screen w-screen  absolute bg-gray-700 top-0 transition-all duration-500`}
        >
          <div className="h-4/6 w-full">
            {lobby &&
              lobby.map((user) => {
                return (
                  <div key={user.username.toString()} className="p-1">
                    {" "}
                    <UserProfile
                      background={user.background}
                      points={user.points}
                    >
                      {user.username}
                    </UserProfile>{" "}
                  </div>
                );
              })}
          </div>
          <div className="h-2/6 w-full p-5 text-white text-xl">
            {currentRound && <span>Round:{currentRound}</span>}
          </div>
          <button
            className="md:hidden absolute bottom-24 md:bottom-10 h-14 w-14 bg-red-500 rounded-full left-1/2 -translate-x-1/2"
            onClick={() => {
              handleInfoDrawer();
            }}
          >
            <FontAwesomeIcon className="text-white text-3xl" icon={faXmark} />
          </button>
        </div>
      </div>
      {/**-----------------------Pre-Round Display-----------------------*/}
      {/**Leader Display */}
      {user && user.role === "leader" && startGame === false && (
        <div className="w-screen h-screen bg-fainted absolute top-0 flex justify-evenly items-center flex-col">
          <div className="h-3/5 w-5/6 bg-white rounded-md flex  flex-col justify-evenly items-center md:w-2/6">
            {lobby && listOnlineUsers()}
            {lobby && <span className="text-xl">{lobby.length}/6</span>}
            <span className="flex flex-col gap-3">
              <span className="border-b-2 border-gray-700">Room ID</span>
              <span className="text-center">{roomID.id.slice(1)}</span>
            </span>
            <span className="text-center text-gray-400 w-2/3 ">
              Start your game whenever everyone is ready.
            </span>
          </div>
          <div
            onClick={() => {
              socket.emit("start_game", roomID);
            }}
            className="bg-green-500 text-white text-xl w-auto px-3 py-2  rounded-full hover:cursor-pointer"
          >
            Start Game
          </div>
        </div>
      )}
      {/**Player Display */}
      {user && user.role === "player" && startGame === false && (
        <div className="w-screen h-screen bg-fainted absolute top-0  flex-col justify-evenly items-center  flex">
          <div className="h-3/5 w-5/6 bg-white rounded-md flex flex-col justify-evenly items-center  md:w-2/6">
            {lobby && listOnlineUsers()}
            {lobby && <span>{lobby.length}/6</span>}
            <span className="flex flex-col gap-3">
              <span className="border-b-2 border-gray-700">Room ID</span>
              <span className="text-center">{roomID.id.slice(1)}</span>
            </span>
            <span className="text-center text-gray-400 w-2/3">
              Waiting for the leader to start the game
            </span>
          </div>
        </div>
      )}
      {/**-----------------------Display Choices to user----------------------*/}
      {displayChoice === true && (
        <div className="h-screen w-screen bg-fainted absolute top-0 flex flex-col justify-evenly ">
          <span className="text-white self-center  h-2/6 flex justify-center items-center text-3xl">
            Choose a word
          </span>
          <div className="flex flex-col justify-evenly items-center h-full md:flex-row md:w-3/6 md:self-center md:h-auto ">
            {currentChoices.map((choice) => {
              return (
                <div
                  onClick={() => {
                    handleWordChoice(choice);
                  }}
                  className="hover:cursor-pointer bg-white rounded-full px-4 py-2 text-lg active:translate-y-1 transition-all duration-200"
                >
                  {choice}
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/**-----------------------Wait for user to choose----------------------*/}
      {displayWait === true && (
        <div className="h-screen w-screen bg-fainted absolute top-0 flex justify-center items-center">
          <span className="text-white text-4xl text-center">
            Waiting for a choice to be made.
          </span>
        </div>
      )}
      {/**-----------------------Game Over Display----------------------*/}
      {displayGameOver === true && (
        <div className="h-screen w-screen bg-fainted flex flex-col justify-evenly items-center absolute top-0">
          <div className="h-auto w-2/3 bg-white text-white rounded-md md:w-2/6 flex flex-col justify-center items-center p-2 md:p-8">
            <span className="text-center  text-gray-500 text-3xl pb-5  w-full ">
              Final Scores
            </span>
            <div className="flex flex-col w-full">
              <div className="w-full flex py-5 bg-fainted rounded-t-md">
                <span className="w-1/6 text-center">Pos.</span>
                <span className="w-3/6 text-center">Username</span>
                <span className="w-2/6 text-center">Points</span>
              </div>
              {finalScoreboard.map((user, index) => {
                console.log(index + 1, finalScoreboard.length);
                if (index + 1 === finalScoreboard.length) {
                  return (
                    <div className="w-full h-14 flex text-white rounded-b-md bg-gradient-to-r from-purple-700 to-pink-500 ">
                      <span className="w-1/6 text-center  flex justify-center items-center">
                        {index + 1}.
                      </span>
                      <span className="w-3/6 text-center flex justify-center items-center ">
                        <span className="overflow-hidden whitespace-nowrap text-ellipsis">
                          {user.name}
                        </span>
                      </span>
                      <span className="w-2/6 text-center flex justify-center items-center">
                        {user.points}
                      </span>
                    </div>
                  );
                } else {
                  return (
                    <div className="w-full h-14 flex text-white bg-gradient-to-r from-purple-700 to-pink-500  ">
                      <span className="w-1/6 text-center  flex justify-center items-center">
                        {index + 1}.
                      </span>
                      <span className="w-3/6 text-center flex justify-center items-center ">
                        <span className="overflow-hidden whitespace-nowrap text-ellipsis">
                          {user.name}
                        </span>
                      </span>
                      <span className="w-2/6 text-center flex justify-center items-center">
                        {user.points}
                      </span>
                    </div>
                  );
                }
              })}
            </div>
          </div>
          <div
            onClick={() => {
              socket.emit("leave_lobby", roomID);
              navigate("/");
            }}
            className="text-white bg-red-500 text-2xl px-4 py-2 rounded-md hover:cursor-pointer"
          >
            Leave
          </div>
        </div>
      )}
      <div
        className={`${
          displayCorrect ? "scale-1" : "scale-0"
        } absolute top-1/2 -translate-x-1/2 -translate-y-1/2 left-1/2 text-4xl bg-green-500 w-24 h-24  text-white flex justify-center items-center  rounded-full transition-all duration-300`}
      >
        {" "}
        <FontAwesomeIcon icon={faCheck} />
      </div>
    </>
  );
}
