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
  // Initialize `isLoggedIn` from localStorage
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("access_token") ? true : false;
  });

  // Function to log in
  const login = () => {
    setIsLoggedIn(true);
  };

  // Function to log out
  const logout = () => {
    localStorage.removeItem("access_token");
    setIsLoggedIn(false);
  };

  useEffect(() => {
    if (!localStorage.getItem("access_token")) {
      setIsLoggedIn(false);
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home isLoggedIn={isLoggedIn} logout={logout} />} />
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
