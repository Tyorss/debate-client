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

  useEffect(() => {
    function adjustMargin() {
      const viewportWidth = window.innerWidth;
      const marginLeft =
        viewportWidth >= 1500
          ? 200
          : Math.max((200 * (viewportWidth - 1000)) / 500, 0);
      listRef.current.style.marginLeft = `${marginLeft}px`;
    }

    window.addEventListener("resize", adjustMargin);
    adjustMargin();

    return () => {
      window.removeEventListener("resize", adjustMargin);
    };
  }, [listRef]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    const queryStr = `${location.pathname}?page=${page}`;
    navigate(queryStr);
  };

  return (
    <div className="m-list-container" ref={listRef}>
      <div className="list-header">
        <div className="m-header-item name">Name</div>
        <div className="m-header-item votes">참여 인원</div>
        <div className="m-header-item votes">채팅수</div>
      </div>
      <List
        itemLayout="horizontal"
        dataSource={sortedDebates}
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
        total={total}
        pageSize={15}
        onChange={handlePageChange}
      />
    </div>
  );
}

export default M_ListLink;
