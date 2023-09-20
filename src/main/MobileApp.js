import { CATEGORIES } from "../categories";
import React, { useState, useEffect } from "react";
import M_ChatBox from "../chatBox/m-chatBox.js";
import { BrowserRouter as Router, Route, Link, Routes } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "./MobileApp.css";
import M_ListLink from "../Listpage/m-ListLink";
import UploadPage from "../upload/upload";
import { API_URL } from "../config/constants";

function Header({ onNavigateBack }) {
  return (
    <header className="m-header">
      <button onClick={onNavigateBack}>←</button>
      <Link to="/">Unboxers</Link>
      <div></div>
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
      <Link to="/upload">
        <h1>new debate</h1>
      </Link>
    </footer>
  );
}

// ... (same imports)

function Content() {
  const [top3, setTop3] = useState([]);
  const navigate = useNavigate();

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
    <>
      <Header />
      <Header onNavigateBack={() => navigate(-1)} />
      <div className="all">
        <Routes>
          <Route path="/debate/:debateID" element={<M_ChatBox />} />
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
                      const categoryDebates = top3.slice(
                        startIdx,
                        startIdx + 3
                      );

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
      </div>
    </>
  );
}

function MobileApp() {
  return (
    <Router>
      <Content />
    </Router>
  );
}

export default MobileApp;
