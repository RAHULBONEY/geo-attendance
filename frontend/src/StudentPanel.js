import { useState } from "react";
import { getGPSCoordinates, formatLocationProof } from "./utils";

function StudentPanel({ contract }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [sessionId, setSessionId] = useState("");

  const checkIn = async () => {
    if (!sessionId) {
      setError("Please enter a Session ID.");
      return;
    }
    
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // 1. Get GPS coordinates
      const { lat, lon } = await getGPSCoordinates();

      // 2. Format the location proof (MUST match teacher's format)
      const locationProof = formatLocationProof(lat, lon);

      console.log("Attempting check-in with location proof:", locationProof);

      // 3. Send transaction
      const tx = await contract.checkIn(sessionId, locationProof);
      
      console.log("Check-in transaction sent...", tx.hash);
      await tx.wait();
      console.log("Check-in mined!");

      setSuccess(`Successfully checked in to session ${sessionId}!`);

    } catch (err) {
      console.error(err);
      let userError = "Check-in failed.";
      
      // Try to decode the specific smart contract error
      const revertReason = err.data?.message || err.message;
      if (revertReason) {
        if (revertReason.includes("Location proof is invalid")) {
          userError = "Check-in failed: Your location does not match the session's location.";
        } else if (revertReason.includes("Student already checked in")) {
          userError = "You have already checked in for this session.";
        } else if (revertReason.includes("Session is not active")) {
          userError = "This session is not active or the Session ID is incorrect.";
        }
      } else if (err.code === 4001) { // MetaMask user rejected transaction
         userError = "Transaction was rejected.";
      }
      setError(userError);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div>
      <h2>🧑‍🎓 Student Panel</h2>
      <input
        type="number"
        placeholder="Enter Session ID from Teacher"
        value={sessionId}
        onChange={(e) => setSessionId(e.target.value)}
      />
      <button onClick={checkIn} disabled={loading}>
        {loading ? "Checking In..." : "Check In"}
      </button>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
    </div>
  );
}

export default StudentPanel;