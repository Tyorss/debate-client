import { CATEGORIES } from "./categories";
import React, { useState, useEffect } from "react";
import ChatBox from "./chatBox/chatBox.js";
import { BrowserRouter as Router, Route, Link, Routes } from "react-router-dom";
import "./App.css";
import ListLink from "./Listpage/ListLink.js";
import UploadPage from "./upload/upload";

function Header() {
  return (
    <header
      className="header"
      style={{
        backgroundImage: "url(" + require("./image/negative.png") + ")",
        backgroundSize: "cover",
      }}
    >
      <Link className="home" to="/">
        <h1>Unboxers</h1>
      </Link>
      <div className="chatpage-move">
        {CATEGORIES.map((category) => (
          <Link key={category.id} to={`/list/${category.id}`}>
            <h1>{category.title}</h1>
          </Link>
        ))}
        <Link to="/upload">
          <h1>업로드</h1>
        </Link>
      </div>
    </header>
  );
}

function Home({ title, debates, categoryID }) {
  return (
    <main className="main">
      <section className="content-box">
        <div className="box-title">
          <h2 className="title-name">{title}</h2>
          <ul>
            <li>
              <Link to={`/list/${categoryID}`} className="plus-link">
                더보기
              </Link>
            </li>
          </ul>
        </div>
        <ul>
          {debates.map((debate) => (
            <li key={debate.debateID}>
              <Link to={`/debate/${debate.debateID}`} className="custom-link">
                {debate.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <p>Unboxers</p>
    </footer>
  );
}

function App() {
  const [top3, setTop3] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8080/TopRankeds")
      .then((response) => response.json())
      .then((data) => {
        setTop3(data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/debate/:debateID" element={<ChatBox />} />
        <Route path="/list/:id" element={<ListLink debatesData={top3} />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route
          path="/"
          element={
            <main className="main">
              <section className="content-box-wrapper">
                {top3 &&
                  top3.length > 0 &&
                  CATEGORIES.map((category, index) => {
                    const startIdx = index * 3;
                    const categoryDebates = top3.slice(startIdx, startIdx + 3);

                    return (
                      <Home
                        key={category.id}
                        title={category.title}
                        debates={categoryDebates}
                        categoryID={category.id}
                      />
                    );
                  })}
              </section>
            </main>
          }
        />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
