import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./style.css";
import Home from "./components/Home";
import Register from "./components/Register";
import Login from "./components/Login";
import FindItem from "./components/FindItem";
import NotFound from "./components/NotFound";
import FindOrder from "./components/FindOrder";

function App() {
  // State for login status and user info
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("access_token") ? true : false;
  });
  const [userInfo, setUserInfo] = useState(null);

  // Function to log in
  const login = async () => {
    setIsLoggedIn(true);
    await fetchUserInfo(); // Fetch user info after login
  };

  // Function to log out
  const logout = () => {
    localStorage.removeItem("access_token");
    setIsLoggedIn(false);
    setUserInfo(null); // Clear user info
  };

  // Fetch user info from the backend
  const fetchUserInfo = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      const response = await fetch("/user-info", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserInfo(data); // Save user info
      } else {
        console.error("Failed to fetch user info");
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  // Fetch user info when the app loads, if logged in
  useEffect(() => {
    if (isLoggedIn) {
      fetchUserInfo();
    }
  }, [isLoggedIn]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home isLoggedIn={isLoggedIn} userInfo={userInfo} logout={logout} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login login={login} />} />
        <Route path="/find-item" element={<FindItem />} />
        <Route path="/find-order" element={<FindOrder />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
