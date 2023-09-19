import React, { useEffect, useState } from "react";
import DesktopApp from "./main/DesktopApp";
import MobileApp from "./main/MobileApp";

function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 800);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 800);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <div>{isMobile ? <MobileApp /> : <DesktopApp />}</div>;
}

export default App;
