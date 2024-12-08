import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./style.css";
import Home from "./components/Home";
import Register from "./components/Register";
import Login from "./components/Login";
import FindItem from "./components/FindItem"; // Import the FindItem component
import NotFound from "./components/NotFound";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const login = () => {
    setIsLoggedIn(true);
  };

  const logout = () => {
    // Clear token and set login state to false
    localStorage.removeItem("access_token");
    setIsLoggedIn(false);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home isLoggedIn={isLoggedIn} logout={logout} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login login={login} />} />
        <Route path="/find-item" element={<FindItem />} /> {/* Add the Find Item route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
