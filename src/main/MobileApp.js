import { CATEGORIES } from "../categories";
import React, { useState, useEffect } from "react";
import M_ChatBox from "../chatBox/m-chatBox.js";
import { BrowserRouter as Router, Route, Link, Routes } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "./MobileApp.css";
import "./DesktopApp.css";
import M_ListLink from "../Listpage/m-ListLink";
import M_UploadPage from "../upload/m-upload";
import { API_URL } from "../config/constants";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import relativeTime from "dayjs/plugin/relativeTime";
import { List } from "antd";

dayjs.extend(relativeTime);
dayjs.locale("ko");

function Header({ onNavigateBack }) {
  return (
    <header className="m-header">
      <Link to="/">썰전</Link>
    </header>
  );
}

function Home({ title, debates, categoryID }) {
  return (
    <main className="main">
      <section className="m-content-box">
        <div className="box-title">
          <Link to={`/list/${categoryID}`} className="plus-link">
            <div className="m-content-title">
              <h2 className="title-name">{title}</h2>
              <span>more</span>
            </div>
          </Link>
        </div>

        <ul className="m-debate-line">
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
                    className="m-custom-link name"
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
      <Link to="/upload">
        <h1>new debate</h1>
      </Link>
    </footer>
  );
}

function Content() {
  const [top3, setTop3] = useState([]);

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
    <>
      <Header />
      <div className="all">
        <Routes>
          <Route path="/debate/:debateID" element={<M_ChatBox />} />
          <Route
            path="/list/:id"
            element={<M_ListLink debatesData={topDebatesByCategory} />}
          />
          <Route path="/upload" element={<M_UploadPage />} />
          <Route
            path="/"
            element={
              <main className="main">
                <section className="m-content-box-wrapper">
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
      </div>
      <Footer />
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
