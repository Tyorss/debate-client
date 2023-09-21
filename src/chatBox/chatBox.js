import React, { useState, useEffect, useRef } from "react";
import { Layout, Input, Button, Radio, Spin } from "antd";
import { useParams } from "react-router-dom";
import "./chatBox.css";
import { API_URL, WS_URL } from "../config/constants";

const { Content } = Layout;

const ChatBox = () => {
  const { debateID } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [disagreeCount, setDisagreeCount] = useState(0);
  const [agreeCount, setAgreeCount] = useState(0);
  const [agreeButtonWidth, setAgreeButtonWidth] = useState(0);
  const [disagreeButtonWidth, setDisagreeButtonWidth] = useState(0);
  const [title, setTitle] = useState("");
  const [debate, setDebate] = useState(null);
  const [stance, setStance] = useState("neutral");
  const ws = useRef(null);
  const [connected, setConnected] = useState(false);
  const chatBoxRef = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket(WS_URL);

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
        // Fetch debate details
        const resDebate = await fetch(API_URL + `/debates/${debateID}`);
        const debateData = await resDebate.json();
        setDebate(debateData);
        setAgreeCount(debateData.affirmativeVotes);
        setDisagreeCount(debateData.negativeVotes);
        setTitle(debateData.name);

        // Fetch messages
        const resMessages = await fetch(API_URL + `/messages/${debateID}`);
        const messagesData = await resMessages.json();
        setMessages(messagesData);
      } catch (error) {
        console.error(error);
      }
    };

    const intervalId = setInterval(fetchData, 1500);

    return () => clearInterval(intervalId); // Clear interval on component unmount
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
      const res = await fetch(API_URL + `/messages/${messageId}`, {
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
      const res = await fetch(API_URL + `/debates/${debateID}`, {
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
      const res = await fetch(API_URL + `/debates/${debateID}`, {
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
    const minButtonWidthPercentage = 30; // 최소 버튼 너비 비율 (%)

    if (totalVotes === 0) {
      setAgreeButtonWidth("45%");
      setDisagreeButtonWidth("45%");
      return;
    }

    const agreePercentage = Math.min(
      Math.max((agreeCount / totalVotes) * 90, minButtonWidthPercentage),
      55
    );
    const disagreePercentage = Math.max(
      90 - agreePercentage,
      minButtonWidthPercentage
    );

    setAgreeButtonWidth(`${agreePercentage}%`);
    setDisagreeButtonWidth(`${disagreePercentage}%`);
  }, [agreeCount, disagreeCount]);

  if (!debate) {
    return <Spin />;
  }

  return (
    <div className="chatbox">
      <div className="sidebar">
        찬 반 실시간 상황
        <div className="vote-result">
          <div className="button-container">
            <button
              className="button"
              onClick={handleAClick}
              style={{ width: agreeButtonWidth }}
            >
              <span className="button-text">찬성</span>
              <span className="button-text">{agreeCount}</span>
            </button>
            <button
              className="button"
              onClick={handleBClick}
              style={{ width: disagreeButtonWidth }}
            >
              <span className="button-text">반대</span>
              <span className="button-text">{disagreeCount}</span>
            </button>
          </div>
        </div>
        <div className="top-agree-area">
          <h3>Top Agree</h3>
          <ul className="top3-contents">
            {topMessages("agree").map((message, index) => (
              <li key={index} className="truncated-text">
                <span className="index">{index + 1}.</span>{" "}
                <span className="message">{message.text}</span>{" "}
              </li>
            ))}
          </ul>
        </div>
        <div className="top-disagree-area">
          <h3>Top Disagree</h3>
          <ul className="top3-contents">
            {topMessages("disagree").map((message, index) => (
              <li key={index} className="truncated-text">
                <span className="index">{index + 1}.</span>{" "}
                <span className="message">{message.text}</span>{" "}
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
            <div className="area">
              <ul className="messagechat-area">
                {messages.map((message, index) => (
                  <li
                    key={index}
                    className={`message-item ${
                      message.stance === "agree" ? "align-left" : "align-right"
                    }`}
                  >
                    <div className="message-content">
                      <span className="emoji">
                        {renderEmoji(message.stance)}
                      </span>
                      <span className="nickname">{message.user}joneo:</span>
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
            </div>
          </Content>
        </Layout>
        {stance === "neutral" ? (
          <div style={{ marginTop: "10px" }}>찬성 혹은 반대를 선택해주세요</div>
        ) : (
          <div>
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
        )}
      </div>
    </div>
  );
};

export default ChatBox;
