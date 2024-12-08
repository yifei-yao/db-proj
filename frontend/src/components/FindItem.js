import React, { useState } from "react";
import HomeIcon from "./HomeIcon";

function FindItem() {
  const [itemID, setItemID] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    setItemID(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setData(null);

    try {
      const token = localStorage.getItem("access_token"); // Retrieve the token
      if (!token) {
        setError("You must be logged in to access this feature.");
        return;
      }

      const response = await fetch(`/item/${itemID}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setData(result.pieces);
      } else {
        const result = await response.json();
        setError(result.detail || "An error occurred");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div>
      <HomeIcon /> {}
      <h1>Find Item Locations</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Enter Item ID:
          <input
            type="number"
            value={itemID}
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
          <h2>Item Locations</h2>
          <ul>
            {data.map((piece, index) => (
              <li key={index}>
                <strong>Piece {piece.pieceNum}:</strong> {piece.pDescription} (Dimensions: {piece.length}x{piece.width}x{piece.height}) - Room: {piece.roomNum}, Shelf: {piece.shelfNum} ({piece.shelfDescription})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default FindItem;
