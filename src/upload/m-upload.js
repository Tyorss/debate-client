import React, { useState } from "react";
import { Form, Input, Button, message } from "antd";
import "./upload.css";
import { API_URL } from "../config/constants";

function M_UploadPage() {
  const [name, setName] = useState("");
  const [user, setUser] = useState("");

  const handleSubmit = () => {
    if (name.trim() === "" || user.trim() === "") {
      message.error("토론 주제와 닉네임을 모두 작성해주세요.");
      return;
    }
    uploadData();
  };

  const handleEnterPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  const uploadData = () => {
    fetch(API_URL + "/debates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, user }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Debate created:", data);
        window.location.reload();
      })
      .catch((error) => console.error("Error:", error));
    console.log("Name:", name);
    console.log("User:", user);
  };

  return (
    <Form className="m-upload">
      <Form.Item label="토론 주제">
        <div style={{ display: "flex", alignItems: "center" }}>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
          />
          <div style={{ marginLeft: "8px", color: "#aaa" }}>
            ({`${name.length}/60`})
          </div>
        </div>
      </Form.Item>
      <Form.Item label="닉네임">
        <Input
          value={user}
          onChange={(e) => setUser(e.target.value)}
          onKeyPress={handleEnterPress}
        />
      </Form.Item>
      <Form.Item>
        <Button type="primary" onClick={handleSubmit}>
          업로드
        </Button>
      </Form.Item>
    </Form>
  );
}

export default M_UploadPage;
