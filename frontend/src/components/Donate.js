import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Donate() {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [formData, setFormData] = useState({
    donor_username: "",
    item_description: "",
    photo: "",
    color: "",
    is_new: true,
    material: "",
    main_category: "",
    sub_category: "",
  });
  const [pieceData, setPieceData] = useState([]); // Default to an empty array
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Check if the user is authorized (role: staff)
  useEffect(() => {
    const token = localStorage.getItem("access_token");

    const fetchUserInfo = async () => {
      try {
        const response = await fetch("/user-info", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setIsAuthorized(data.role === "staff");
        } else {
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
        setIsAuthorized(false);
      }
    };

    fetchUserInfo();
  }, []);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handlePieceChange = (index, e) => {
    const { name, value } = e.target;
    const updatedPieces = [...pieceData];
    updatedPieces[index][name] = value;
    setPieceData(updatedPieces);
  };

  const addPiece = () => {
    setPieceData([
      ...pieceData,
      {
        pieceNum: "",
        pDescription: "",
        length: "",
        width: "",
        height: "",
        roomNum: "",
        shelfNum: "",
        pNotes: "",
      },
    ]);
  };

  const removePiece = (index) => {
    const updatedPieces = [...pieceData];
    updatedPieces.splice(index, 1);
    setPieceData(updatedPieces);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("You must be logged in to submit a donation.");
        return;
      }

      const response = await fetch("/donate", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${token}`,
        },
        body: new URLSearchParams({
          ...formData,
          piece_data: JSON.stringify(pieceData), // Send pieces as JSON string
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(`Donation accepted! Item ID: ${data.item_id}`);
        setFormData({
          donor_username: "",
          item_description: "",
          photo: "",
          color: "",
          is_new: true,
          material: "",
          main_category: "",
          sub_category: "",
        });
        setPieceData([]); // Clear the pieces after successful submission
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "An error occurred.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    }
  };

  if (!isAuthorized) {
    return (
      <div>
        <h1>Unauthorized</h1>
        <p>You are not authorized to access this page.</p>
        <button onClick={() => navigate("/")}>Go Home</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Accept Donation</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Donor Username:
          <input
            type="text"
            name="donor_username"
            value={formData.donor_username}
            onChange={handleChange}
            required
          />
        </label>
        <br />
        <label>
          Item Description:
          <textarea
            name="item_description"
            value={formData.item_description}
            onChange={handleChange}
            required
          />
        </label>
        <br />
        <label>
          Photo:
          <input
            type="text"
            name="photo"
            value={formData.photo}
            onChange={handleChange}
          />
        </label>
        <br />
        <label>
          Color:
          <input
            type="text"
            name="color"
            value={formData.color}
            onChange={handleChange}
          />
        </label>
        <br />
        <label>
          Is New:
          <input
            type="checkbox"
            name="is_new"
            checked={formData.is_new}
            onChange={handleChange}
          />
        </label>
        <br />
        <label>
          Material:
          <input
            type="text"
            name="material"
            value={formData.material}
            onChange={handleChange}
          />
        </label>
        <br />
        <label>
          Main Category:
          <input
            type="text"
            name="main_category"
            value={formData.main_category}
            onChange={handleChange}
            required
          />
        </label>
        <br />
        <label>
          Sub Category:
          <input
            type="text"
            name="sub_category"
            value={formData.sub_category}
            onChange={handleChange}
            required
          />
        </label>
        <br />

        <div>
          <h3>Pieces</h3>
          {pieceData.map((piece, index) => (
            <div key={index}>
              <label>
                Piece Number:
                <input
                  type="number"
                  name="pieceNum"
                  value={piece.pieceNum}
                  onChange={(e) => handlePieceChange(index, e)}
                  required
                />
              </label>
              <br />
              <label>
                Description:
                <input
                  type="text"
                  name="pDescription"
                  value={piece.pDescription}
                  onChange={(e) => handlePieceChange(index, e)}
                />
              </label>
              <br />
              <label>
                Dimensions (L x W x H):
                <input
                  type="number"
                  name="length"
                  value={piece.length}
                  onChange={(e) => handlePieceChange(index, e)}
                  required
                />{" "}
                x
                <input
                  type="number"
                  name="width"
                  value={piece.width}
                  onChange={(e) => handlePieceChange(index, e)}
                  required
                />{" "}
                x
                <input
                  type="number"
                  name="height"
                  value={piece.height}
                  onChange={(e) => handlePieceChange(index, e)}
                  required
                />
              </label>
              <br />
              <label>
                Room Number:
                <input
                  type="number"
                  name="roomNum"
                  value={piece.roomNum}
                  onChange={(e) => handlePieceChange(index, e)}
                  required
                />
              </label>
              <br />
              <label>
                Shelf Number:
                <input
                  type="number"
                  name="shelfNum"
                  value={piece.shelfNum}
                  onChange={(e) => handlePieceChange(index, e)}
                  required
                />
              </label>
              <br />
              <label>
                Notes:
                <textarea
                  name="pNotes"
                  value={piece.pNotes}
                  onChange={(e) => handlePieceChange(index, e)}
                />
              </label>
              <button type="button" onClick={() => removePiece(index)}>
                Remove Piece
              </button>
              <hr />
            </div>
          ))}
          <button type="button" onClick={addPiece}>
            Add Piece
          </button>
        </div>

        <button type="submit">Accept Donation</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
    </div>
  );
}

export default Donate;
