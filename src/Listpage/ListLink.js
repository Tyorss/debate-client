import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { List, Pagination } from "antd";
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

function ListLink() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const query = useQuery();
  const [sortedDebates, setSortedDebates] = useState([]);
  const listRef = React.createRef();

  const [currentPage, setCurrentPage] = useState(
    Number(query.get("page")) || 1
  );

  const [total, setTotal] = useState(0);

  const fetchData = async () => {
    try {
      const res = await fetch(
        `${API_URL}/debates?page=${currentPage}&sort=${id}`
      );
      const result = await res.json();
      const { debates, total: totalDebates } = result;
      setSortedDebates(debates);
      setTotal(totalDebates);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    setCurrentPage(Number(query.get("page")) || 1);
    fetchData();
  }, [currentPage, id]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    const queryStr = `${location.pathname}?page=${page}`;
    navigate(queryStr);
  };

  return (
    <div className="list-container">
      <div className="list-header">
        <div className="header-item name">Name</div>
        <div className="header-item votes">찬성</div>
        <div className="header-item votes">반대</div>
        <div className="header-item votes">참여 인원</div>
        <div className="header-item votes">채팅수</div>
        <div className="header-item votes">글쓴이</div>
        <div className="header-item-date">날짜</div>
      </div>
      <List
        itemLayout="horizontal"
        dataSource={sortedDebates}
        renderItem={(debate) => {
          const now = dayjs();
          const createdAt = dayjs(debate.createdAt);
          const diffHours = now.diff(createdAt, "hour");
          const formattedDate =
            diffHours <= 24
              ? createdAt.format("HH:mm")
              : createdAt.format("YYYY.MM.DD");
          return (
            <List.Item className="list-item">
              <Link
                to={`/debate/${debate.id}`}
                className="list-item-content name"
              >
                {debate.name}
              </Link>
              <div className="list-item-content votes">
                {debate.affirmativeVotes}
              </div>
              <div className="list-item-content votes">
                {debate.negativeVotes}
              </div>
              <div className="list-item-content votes">{debate.userNumber}</div>
              <div className="list-item-content votes">
                {debate.messageCount}
              </div>
              <div className="list-item-content votes">{debate.user}</div>
              <div className="list-item-content-date">{formattedDate}</div>
            </List.Item>
          );
        }}
      />

      <Pagination
        current={currentPage}
        total={total}
        pageSize={15}
        onChange={handlePageChange}
      />
    </div>
  );
}

export default ListLink;
