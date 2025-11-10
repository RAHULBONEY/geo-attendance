import { useState } from "react";
import { ethers } from "ethers";
import { getGPSCoordinates, formatLocationProof, hashLocationProof } from "./utils";
import { QRCodeSVG } from "qrcode.react";
function TeacherPanel({ contract }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [locationHash, setLocationHash] = useState("");

  const [viewSessionId, setViewSessionId] = useState("");
  const [attendees, setAttendees] = useState([]);
  const [viewError, setViewError] = useState("");

  const startSession = async () => {
    setLoading(true);
    setError("");
    setSessionId(null);
    setLocationHash("");

    try {
      // 1. Get GPS coordinates
      const { lat, lon } = await getGPSCoordinates();

      // 2. Format and hash the location
      const locationProof = formatLocationProof(lat, lon);
      const hash = hashLocationProof(locationProof);
      setLocationHash(hash);
      
      console.log("Starting session with location proof:", locationProof);
      console.log("Location Hash:", hash);

      // 3. Send transaction to smart contract
      const tx = await contract.startSession(hash);
      
      console.log("Transaction sent...", tx.hash);
      const receipt = await tx.wait();
      console.log("Transaction mined!", receipt);

      // 4. Find the SessionStarted event in the logs
      const event = receipt.events?.find(e => e.event === "SessionStarted");
      if (event) {
        const newSessionId = event.args.sessionId.toString();
        setSessionId(newSessionId);
      } else {
        throw new Error("Could not find SessionStarted event in transaction receipt.");
      }

    } catch (err) {
      console.error(err);
      setError(err.message || "An error occurred while starting the session.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendees = async () => {
    if (!viewSessionId) {
      setViewError("Please enter a Session ID.");
      return;
    }
    setViewError("");
    setAttendees([]);
    try {
      const list = await contract.getAttendees(viewSessionId);
      setAttendees(list);
      if (list.length === 0) {
        setViewError("No attendees found for this session.");
      }
    } catch (err) {
      console.error(err);
      setViewError("Failed to fetch attendees. Is the Session ID correct?");
    }
  };

  return (
    <div>
      <h2>🧑‍🏫 Teacher Panel</h2>
      <button onClick={startSession} disabled={loading}>
        {loading ? "Starting Session..." : "Start New Attendance Session"}
      </button>

      {error && <p className="error">{error}</p>}
      
      {sessionId && (
        <div className="session-info">
          <h3>✅ Session Started!</h3>
          <p><strong>Session ID: {sessionId}</strong></p>
          <p><small>Location Hash: {locationHash}</small></p>
          <p>Share the Session ID with your students.</p>
          <div className="qr-code">
          <QRCodeSVG value={sessionId} />
          </div>
        </div>
      )}

      <hr style={{margin: "30px 0"}} />

      <h3>View Attendance</h3>
      <input 
        type="number"
        placeholder="Enter Session ID"
        value={viewSessionId}
        onChange={(e) => setViewSessionId(e.target.value)}
      />
      <button onClick={fetchAttendees}>View Attendees</button>
      
      {viewError && <p className="error">{viewError}</p>}
      
      {attendees.length > 0 && (
        <div>
          <h4>Attendees ({attendees.length}):</h4>
          <ul>
            {attendees.map((addr, index) => (
              <li key={index}><small>{addr}</small></li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default TeacherPanel;