import React, { useRef, useState, useEffect } from "react";
import ChatBox from "../../components/ChatBox/ChatBox";
import Conversation from "../../components/Coversation/Conversation";
import LogoSearch from "../../components/LogoSearch/LogoSearch";
import NavIcons from "../../components/NavIcons/NavIcons";
import "./Chat.css";
import { userChats } from "../../api/ChatRequests";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";

const Chat = () => {
  const dispatch = useDispatch();
  const socket = useRef();
  const { user } = useSelector((state) => state.authReducer.authData);

  const [chats, setChats] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [sendMessage, setSendMessage] = useState(null);
  const [receivedMessage, setReceivedMessage] = useState(null);

  // Get the chat in chat section
  useEffect(() => {
    console.log(user._id);  // Log to verify if user._id is present
    const getChats = async () => {
      try {
        const { data } = await userChats(user._id);
        console.log(data);  // Log the data received from the API
        setChats(data);
      } catch (error) {
        console.log(error);
      }
    };
    getChats();
  }, [user._id]);
  

  // Connect to Socket.io
  useEffect(() => {
    socket.current = io("ws://localhost:8800");
    socket.current.emit("new-user-add", user._id);

    socket.current.on("get-users", (users) => {
      setOnlineUsers(users);
    });

    socket.current.on("receive-message", (data) => {
      console.log(data);
      setReceivedMessage(data);
    });

    // Cleanup socket on component unmount
    return () => {
      socket.current.disconnect();
    };
  }, [user]);

  // Send Message to socket server
  useEffect(() => {
    if (sendMessage !== null) {
      socket.current.emit("send-message", sendMessage);
    }
  }, [sendMessage]);

  const checkOnlineStatus = (chat) => {
    const chatMember = chat.members.find((member) => member !== user._id);
    const online = onlineUsers.find((user) => user.userId === chatMember);
    return online ? true : false;
  };

  return (
    <div className="Chat">
      {/* Left Side */}
      <div className="Left-side-chat">
        <LogoSearch />
        <div className="Chat-container">
          <h2>Chats</h2>
          <div className="Chat-list">
            {chats.length > 0 ? (
              chats.map((chat) => (
                <div key={chat._id} onClick={() => setCurrentChat(chat)}>
                  <Conversation
                    data={chat}
                    currentUser={user._id}
                    online={checkOnlineStatus(chat)}
                  />
                </div>
              ))
            ) : (
              <p>No chats available</p>
            )}
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="Right-side-chat">
        <div style={{ width: "20rem", alignSelf: "flex-end" }}>
          <NavIcons />
        </div>
        <ChatBox
          chat={currentChat}
          currentUser={user._id}
          setSendMessage={setSendMessage}
          receivedMessage={receivedMessage}
        />
      </div>
    </div>
  );
};

export default Chat;
