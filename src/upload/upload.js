import React, { useState } from "react";
import { Form, Input, Button } from "antd";
import "./upload.css";

function UploadPage() {
  const [name, setName] = useState("");
  const [user, setUser] = useState("");

  const handleSubmit = () => {
    uploadData();
  };

  const handleEnterPress = (e) => {
    if (e.key === "Enter") {
      uploadData();
    }
  };

  const uploadData = () => {
    fetch("http://localhost:8080/debates", {
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
    <Form className="upload">
      <Form.Item label="토론 주제">
        <Input value={name} onChange={(e) => setName(e.target.value)} />
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

export default UploadPage;
