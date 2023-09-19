import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { List, Pagination } from "antd";
import "./m-ListLink.css";
import "./ListLink.css";
import { API_URL } from "../config/constants";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
dayjs.locale("ko");

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function M_ListLink() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const query = useQuery();
  const [sortedDebates, setSortedDebates] = useState([]);
  const listRef = React.createRef();
  const [currentPage, setCurrentPage] = useState(
    Number(query.get("page")) || 1
  );

  useEffect(() => {
    setCurrentPage(Number(query.get("page")) || 1);
  }, [query]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(API_URL + "/debates");
        const debatesData = await res.json();
        let sortedDebates = [...debatesData];

        switch (id) {
          case "1":
            sortedDebates.sort((a, b) => b.userNumber - a.userNumber);
            break;
          case "2":
            sortedDebates.sort((a, b) => b.messageCount - a.messageCount);
            break;
          case "3":
            sortedDebates.sort((a, b) => {
              if (a.affirmativeVotes + a.negativeVotes <= 10) {
                return 1;
              } else if (b.affirmativeVotes + b.negativeVotes <= 10) {
                return -1;
              } else {
                return a.voteDifference - b.voteDifference;
              }
            });
            break;
          case "4":
            sortedDebates.sort((a, b) => b.id - a.id);
            break;
          default:
            break;
        }

        setSortedDebates(sortedDebates);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [id]);

  const handlePageChange = (page) => {
    const queryStr = `${location.pathname}?page=${page}`;
    navigate(queryStr);
  };

  const currentData = sortedDebates.slice(
    (currentPage - 1) * 15,
    currentPage * 15
  );

  return (
    <div className="m-list-container" ref={listRef}>
      <div className="list-header">
        <div className="m-header-item name">Name</div>
        <div className="m-header-item votes">참여 인원</div>
        <div className="m-header-item votes">채팅수</div>
      </div>
      <List
        itemLayout="horizontal"
        dataSource={currentData}
        renderItem={(debate) => {
          return (
            <List.Item className="list-item">
              <Link
                to={`/debate/${debate.id}`}
                className="m-list-item-content name"
              >
                {debate.name}
              </Link>
              <div className="m-list-item-content votes">
                {debate.userNumber}
              </div>
              <div className="m-list-item-content votes">
                {debate.messageCount}
              </div>
            </List.Item>
          );
        }}
      />

      <Pagination
        current={currentPage}
        total={sortedDebates.length}
        pageSize={15}
        onChange={handlePageChange}
      />
    </div>
  );
}

export default M_ListLink;