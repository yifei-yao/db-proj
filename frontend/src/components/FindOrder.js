import React, { useState } from "react";
import HomeIcon from "./HomeIcon";

function FindOrder() {
  const [orderID, setOrderID] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    setOrderID(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setData(null);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("You must be logged in to access this feature.");
        return;
      }

      const response = await fetch(`/order/${orderID}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setData(result.items);
      } else {
        const result = await response.json();
        setError(result.detail || "An error occurred.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div>
      <HomeIcon /> {}
      <h1>Find Order Items</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Enter Order ID:
          <input
            type="number"
            value={orderID}
            onChange={handleInputChange}
            required
          />
        </label>
        <br />
        <button type="submit">Find</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {data && (
        <div>
          <h2>Order Items</h2>
          <ul>
            {data.map((item) => (
              <li key={item.itemID}>
                <strong>{item.description}</strong> (Color: {item.color}, Material: {item.material})
                <ul>
                  {item.pieces.map((piece, index) => (
                    <li key={index}>
                      <strong>Piece {piece.pieceNum}:</strong> {piece.description} 
                      (Dimensions: {piece.dimensions.length}x{piece.dimensions.width}x{piece.dimensions.height}) 
                      - Room: {piece.location.roomNum}, Shelf: {piece.location.shelfNum} 
                      ({piece.location.shelfDescription})
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default FindOrder;
