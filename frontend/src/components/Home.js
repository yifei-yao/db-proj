import React from "react";

function Home({ isLoggedIn, userInfo, logout }) {
  return (
    <div>
      <h1>Welcome Home</h1>
      {isLoggedIn ? (
        <div>
          {userInfo && (
            <p>
              Logged in as: <strong>{userInfo.first_name} {userInfo.last_name}</strong> ({userInfo.role})
            </p>
          )}
          <button onClick={logout}>Logout</button>
          <p>
            <a href="/find-item">Find Item</a>
          </p>
          <p>
            <a href="/find-order">Find Order Items</a>
          </p>
          {userInfo?.role === "staff" && (
            <p>
              <a href="/donate">Accept Donation</a> {/* Only visible to staff */}
            </p>
          )}
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
