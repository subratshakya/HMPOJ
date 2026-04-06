import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Chatroom = () => {
  const [socket, setSocket] = useState(null);
  const [username, setUsername] = useState("");
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [showChatroom, setShowChatroom] = useState(false);
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");
  const isLoggedIn = !!storedUser;

  useEffect(() => {
    if (!isLoggedIn) {
      toast.info("Please Login first");
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    if (!isLoggedIn) return;

    const storedData = localStorage.getItem("user");
    const currentUserName = storedData ? JSON.parse(storedData).user.userName : "";

    const newSocket = io(process.env.REACT_APP_API_URL, {
      transports: ["websocket"],
    });
    setSocket(newSocket);

    newSocket.on("update", function (update) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: "update", content: update },
      ]);
    });

    newSocket.on("chat", function (message) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: "other", content: message },
      ]);
    });

    newSocket.on("disconnect", function () {
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: "update", content: `${currentUserName} disconnected` },
      ]);
    });

    if (currentUserName) {
      setUsername(currentUserName);
      newSocket.emit("newuser", currentUserName);
      setShowChatroom(true);
    }

    return () => {
      newSocket.disconnect();
    };
  }, [isLoggedIn]); // eslint-disable-line react-hooks/exhaustive-deps



  const handleSendMessage = () => {
    if (messageInput.trim() !== "") {
      socket.emit("chat", { username, text: messageInput });
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: "my", content: { username, text: messageInput } },
      ]);
      setMessageInput("");
    }
  };

  const handleExit = () => {
    socket.emit("exituser", username);
    setShowChatroom(false);
    navigate("/");
  };

  return (
    <>
      <div className="flex flex-col h-screen bg-gray-100">
        {showChatroom ? (
          <>
            <div className="flex justify-between items-center bg-gray-800 text-white p-4">
              <h2 className="text-2xl  underline font-mono font-bold">Global Chatroom</h2>
              <button
                id="exit-chat"
                className="bg-gray-500 text-white font-bold py-2 px-4 rounded hover:bg-gray-600"
                onClick={handleExit}
              >
                Exit
              </button>
            </div>
            <div className="flex-grow overflow-y-auto p-4">
              <div className="messages space-y-4">
                {messages.map((message, index) => (
                  <Message
                    key={index}
                    type={message.type}
                    content={message.content}
                    username={username}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center bg-gray-200 p-4">
              <input
                type="text"
                id="message-input"
                className="flex-1 border p-2 rounded mr-2"
                placeholder="Type your message here..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault(); // Prevents the default action of pressing Enter (usually submitting forms)
                    handleSendMessage();
                  }
                }}
              />
              <button
                id="send-message"
                className="bg-gray-800 text-white font-bold py-2 px-4 rounded hover:bg-gray-500"
                onClick={handleSendMessage}
              >
                Send
              </button>
            </div>
          </>
        ) : null}
      </div>
    </>
  );
};

const Message = ({ type, content, username }) => {
  if (type === "update") {
    return <div className="update text-gray-500 italic">{content}</div>;
  } else if (type === "my") {
    return (
      <div className="message my-message flex justify-end">
        <div className="bg-blue-500 text-white p-2 rounded">
          <div className="name font-bold">YOU</div>
          <div className="text">{content.text}</div>
        </div>
      </div>
    );
  } else if (type === "other") {
    return (
      <div className="message other-message flex">
        <div className="bg-gray-300 p-2 rounded">
          <div className="name font-bold">{content.username}</div>
          <div className="text">{content.text}</div>
        </div>
      </div>
    );
  }
};

export default Chatroom;
