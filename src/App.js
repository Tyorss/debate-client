import React, { useEffect, useState } from "react";
import DesktopApp from "./main/DesktopApp";
import MobileApp from "./main/MobileApp";
import "./App.css";

function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <div>{isMobile ? <MobileApp /> : <DesktopApp />}</div>;
}

export default App;
