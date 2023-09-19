import { CATEGORIES } from "../categories";
import React, { useState, useEffect } from "react";
import ChatBox from "../chatBox/chatBox.js";
import { BrowserRouter as Router, Route, Link, Routes } from "react-router-dom";
import "./MobileApp.css";
import M_ListLink from "../Listpage/ListLink.js";
import UploadPage from "../upload/upload";
import { API_URL } from "../config/constants";

function Header() {
  return (
    <header className="header">
      <Link to="/">Unboxers</Link>
    </header>
  );
}

function Home({ title, debates, categoryID }) {
  return (
    <main className="main">
      <section className="content-box">
        <div className="box-title">
          <Link to={`/list/${categoryID}`} className="plus-link">
            <h2 className="title-name">{title}</h2>
          </Link>
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

function MobileApp() {
  const [top3, setTop3] = useState([]);

  useEffect(() => {
    fetch(API_URL + "/TopRankeds")
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
        <Route path="/list/:id" element={<M_ListLink debatesData={top3} />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route
          path="/"
          element={
            <main>
              <section>
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

export default MobileApp;
