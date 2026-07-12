// ActivityFeed.jsx
// US-19: Activity Feed for a Shared Vehicle
//
// Shows the last 10 actions taken on a shared vehicle — service entries
// logged by the owner or any collaborator. Each entry shows:
//   - What was done (e.g. "Logged Oil Change")
//   - Who did it (their email)
//   - When it happened (the service date)
//
// URL: /vehicles/:id/activity

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function ActivityFeed() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    axios
      .get(`http://localhost:8080/api/vehicles/${id}/activity`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setActivities(response.data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        alert("Could not load activity feed.");
      });
  }, [id, navigate]);

  if (loading) return <p style={{ padding: "40px" }}>Loading activity feed...</p>;

  return (
    <div style={{ padding: "40px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <h2>Activity Feed</h2>
        <button onClick={() => navigate("/garage")}>Back to Garage</button>
      </div>

      {activities.length === 0 ? (
        <p>No activity yet for this vehicle.</p>
      ) : (
        <div style={{ display: "grid", gap: "12px", maxWidth: "640px" }}>
          {activities.map((activity) => (
            <div
              key={activity.id}
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "16px",
                backgroundColor: "#fafafa",
              }}
            >
              <strong style={{ fontSize: "1rem" }}>{activity.actionType}</strong>
              <p style={{ margin: "6px 0 0", fontSize: "0.9rem", color: "#555" }}>
                By <span style={{ fontWeight: "500" }}>{activity.performedBy}</span>
                {" · "}
                {activity.timestamp}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ActivityFeed;
