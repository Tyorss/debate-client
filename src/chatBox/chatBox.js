import React, { useState, useEffect, useRef } from "react";
import { Layout, Input, Button, Radio, Spin } from "antd";
import { useParams } from "react-router-dom";
import "./chatBox.css";

const { Content } = Layout;

const ChatBox = () => {
  const { debateID } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [disagreeCount, setDisagreeCount] = useState(0);
  const [agreeCount, setAgreeCount] = useState(0);
  const [title, setTitle] = useState("");
  const [backgroundPosition, setBackgroundPosition] = useState(50);
  const [debate, setDebate] = useState(null);
  const [stance, setStance] = useState("neutral");
  const ws = useRef(null);
  const [connected, setConnected] = useState(false);
  const chatBoxRef = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:8080");

    ws.current.onopen = () => {
      console.log("Connected to the websocket");
      ws.current.send(JSON.stringify({ type: "INITIAL_MESSAGES", debateID }));
      setConnected(true);
    };

    ws.current.onmessage = (event) => {
      const receivedData = JSON.parse(event.data);

      if (receivedData.type === "INITIAL_MESSAGES") {
        setMessages(receivedData.messages);
      } else {
        setMessages((prevMessages) => [...prevMessages, receivedData]);
      }
    };

    ws.current.onclose = (event) => {
      console.log("Disconnected from the websocket", event);
      setConnected(false);
    };

    return () => {
      ws.current.close();
    };
  }, [debateID]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`http://localhost:8080/debates/${debateID}`);
        const data = await res.json();
        setDebate(data);
        setAgreeCount(data.affirmativeVotes);
        setDisagreeCount(data.negativeVotes);
        setTitle(data.name);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, [debateID]);

  useEffect(() => {
    if (chatBoxRef.current) {
      const { scrollHeight } = chatBoxRef.current;
      chatBoxRef.current.scrollTop = scrollHeight;
    }
  }, [messages]);

  const addMessage = () => {
    if (input.trim() !== "") {
      const message = {
        debateID: debateID,
        text: input,
        stance: stance,
        upvotes: 0,
        downvotes: 0,
      };

      if (ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({ type: "NEW_MESSAGE", message }));
      }

      setInput("");
    }
  };

  const handleVote = async (index, type) => {
    const newMessages = [...messages];
    const messageId = newMessages[index].id;
    if (type === "up") {
      newMessages[index].upvotes += 1;
    } else {
      newMessages[index].downvotes += 1;
    }

    try {
      const res = await fetch(`http://localhost:8080/messages/${messageId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          upvotes: newMessages[index].upvotes,
          downvotes: newMessages[index].downvotes,
        }),
      });

      await res.json();
      setMessages(newMessages);
    } catch (error) {
      console.error(error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      addMessage();
    }
  };

  const renderEmoji = (stance) => {
    switch (stance) {
      case "agree":
        return "👍";
      case "disagree":
        return "👎";
    }
  };

  const topMessages = (stance) => {
    return messages
      .filter((message) => message.stance === stance)
      .sort((a, b) => b.upvotes - a.upvotes)
      .slice(0, 3);
  };

  const handleAClick = async () => {
    try {
      const res = await fetch(`http://localhost:8080/debates/${debateID}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ affirmativeVotes: agreeCount + 1 }),
      });
      const data = await res.json();
      setAgreeCount(data.affirmativeVotes);
    } catch (error) {
      console.error(error);
    }
  };

  const handleBClick = async () => {
    try {
      const res = await fetch(`http://localhost:8080/debates/${debateID}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ negativeVotes: disagreeCount + 1 }),
      });
      const data = await res.json();
      setDisagreeCount(data.negativeVotes);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const totalVotes = agreeCount + disagreeCount;
    if (totalVotes >= 10) {
      const diff = 50 + ((disagreeCount - agreeCount) / totalVotes) * 100;
      setBackgroundPosition(Math.min(Math.max(diff, 25), 75));
    }
  }, [agreeCount, disagreeCount]);

  if (!debate) {
    return <Spin />;
  }

  return (
    <div className="chatbox">
      <div className="sidebar">
        찬 반 실시간 상황
        <div className="vote-result">
          <div
            className="button-container"
            style={{ backgroundPositionX: backgroundPosition + "%" }}
          >
            <button className="button" onClick={handleAClick}>
              <span className="button-text">찬성</span>
              <span className="button-text">{agreeCount}</span>
            </button>
            <button className="button" onClick={handleBClick}>
              <span className="button-text">반대</span>
              <span className="button-text">{disagreeCount}</span>
            </button>
          </div>
        </div>
        <div className="top-agree-area">
          <h3>Top Agree</h3>
          <ul>
            {topMessages("agree").map((message, index) => (
              <li key={index}>
                {index + 1}. {message.text}
              </li>
            ))}
          </ul>
        </div>
        <div className="top-disagree-area">
          <h3>Top Disagree</h3>
          <ul>
            {topMessages("disagree").map((message, index) => (
              <li key={index}>
                {index + 1}. {message.text}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="main-content">
        <div className="header">{title}</div>

        <Radio.Group
          onChange={(e) => setStance(e.target.value)}
          value={stance}
          className="stance-selector"
        >
          <Radio value={"agree"}>찬성</Radio>
          <Radio value={"disagree"}>반대</Radio>
        </Radio.Group>

        <Layout className="message-area" ref={chatBoxRef}>
          <Content>
            <ul>
              {messages.map((message, index) => (
                <li key={index} className="message-item">
                  <div className="message-content">
                    <span className="emoji">{renderEmoji(message.stance)}</span>
                    {/* <span className="nickname">{message.user}:</span> */}
                    {" " + message.text}
                  </div>
                  <div className="vote-buttons">
                    <Button
                      className="vote-button"
                      onClick={() => handleVote(index, "up")}
                    >
                      Up {message.upvotes}
                    </Button>
                    <Button
                      className="vote-button"
                      onClick={() => handleVote(index, "down")}
                    >
                      Down {message.downvotes}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </Content>
        </Layout>

        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="메시지를 입력하세요."
          style={{ marginTop: "10px" }}
        />
        <Button onClick={addMessage} style={{ marginTop: "10px" }}>
          전송
        </Button>
      </div>
    </div>
  );
};

export default ChatBox;
