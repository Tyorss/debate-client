import { CATEGORIES } from "../categories";
import React, { useState, useEffect } from "react";
import ChatBox from "../chatBox/chatBox.js";
import { BrowserRouter as Router, Route, Link, Routes } from "react-router-dom";
import "./DesktopApp.css";
import ListLink from "../Listpage/ListLink.js";
import UploadPage from "../upload/upload";
import { API_URL } from "../config/constants";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import relativeTime from "dayjs/plugin/relativeTime";
import { List } from "antd";

dayjs.extend(relativeTime);
dayjs.locale("ko");

function Header() {
  return (
    <header className="header">
      <div className="header-link">
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
      </div>
    </header>
  );
}

function Home({ title, debates, categoryID }) {
  return (
    <main className="main">
      <section className="content-box">
        <div className="box-title">
          <Link to={`/list/${categoryID}`} className="plus-link">
            <div className="content-title">
              <h2 className="title-name">{title}</h2>
              <span>more</span>
            </div>
          </Link>
        </div>
        <ul className="debate-line">
          {debates.map((debate, index) => {
            const now = dayjs();
            const createdAt = dayjs(debate.createdAt);
            const formattedDate = createdAt.format("MM.DD");

            return (
              <List key={`${index}-${categoryID}-${debate.id}`}>
                <li>
                  <span className="createdAt">{formattedDate}</span>
                  <Link
                    to={`/debate/${debate.id}`}
                    className="custom-link name"
                  >
                    {debate.name}
                  </Link>
                  <span className="user">{debate.user}</span>
                </li>
              </List>
            );
          })}
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

function DesktopApp() {
  const [topDebatesByCategory, setTopDebatesByCategory] = useState({});

  useEffect(() => {
    const fetchDebates = async (categoryId) => {
      try {
        const response = await fetch(
          `${API_URL}/debatesByCategory?categoryId=${categoryId}`
        );
        const data = await response.json();
        return data.debates;
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    Promise.all(CATEGORIES.map((cat) => fetchDebates(cat.id))).then(
      (debatesResults) => {
        const newTopDebates = {};
        CATEGORIES.forEach((cat, index) => {
          newTopDebates[cat.id] = debatesResults[index];
        });
        setTopDebatesByCategory(newTopDebates);
      }
    );
  }, []);

  return (
    <Router>
      <Header />
      <Routes className="all">
        <Route path="/debate/:debateID" element={<ChatBox />} />
        <Route
          path="/list/:id"
          element={<ListLink debatesData={topDebatesByCategory} />}
        />
        <Route path="/upload" element={<UploadPage />} />
        <Route
          path="/"
          element={
            <main className="main">
              <section className="content-box-wrapper">
                {CATEGORIES.map((category) => (
                  <Home
                    key={category.id}
                    title={category.title}
                    debates={topDebatesByCategory[category.id] || []}
                    categoryID={category.id}
                  />
                ))}
              </section>
            </main>
          }
        />
      </Routes>
      <Footer />
    </Router>
  );
}

export default DesktopApp;
