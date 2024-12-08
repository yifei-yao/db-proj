import React from "react";

function Home({ isLoggedIn, logout }) {
  return (
    <div>
      <h1>Welcome Home</h1>
      {isLoggedIn ? (
        <div>
          <button onClick={logout}>Logout</button>
          <p>
            <a href="/find-item">Find Item</a>
          </p>
        </div>
      ) : (
        <p>
          <a href="/register">Register</a> | <a href="/login">Login</a>
        </p>
      )}
    </div>
  );
}

export default Home;
