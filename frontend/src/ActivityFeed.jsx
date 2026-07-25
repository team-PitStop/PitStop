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
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'timeline'

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

  const titleCase = (s) => {
    return s
      .toLowerCase()
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  const formatActionType = (action) => {
    if (!action) return action;
    // If it starts with 'Logged ', title-case the remainder
    if (action.startsWith("Logged ")) {
      const rest = action.substring(7).replace(/_/g, " ");
      return `Logged ${titleCase(rest)}`;
    }
    // fallback: title-case whole string
    return titleCase(action.replace(/_/g, " "));
  };

  return (
    <div className="page-padding">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h2>Activity Feed</h2>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button className="btn-outline" onClick={() => setViewMode(viewMode === 'list' ? 'timeline' : 'list')}>{viewMode === 'list' ? 'Timeline View' : 'List View'}</button>
          <button className="btn-outline" onClick={() => navigate("/garage")}>Back to Garage</button>
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="card"><p>No activity yet for this vehicle.</p></div>
      ) : (
        viewMode === 'list' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '720px' }}>
            {activities.map((activity) => (
              <div key={activity.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px' }}>
                  <strong style={{ fontSize: '1rem', color: 'var(--fiu-blue)' }}>{formatActionType(activity.actionType)}</strong>
                  <span className="timeline-meta">{activity.timestamp}</span>
                </div>
                <p style={{ margin: '8px 0 0', color: 'var(--text-light)' }}>By <span style={{ fontWeight: 700, color: 'var(--text-dark)' }}>{activity.performedBy}</span></p>
                {activity.details && <p style={{ marginTop: '8px', color: 'var(--text-light)' }}>{activity.details}</p>}
              </div>
            ))}
          </div>
        ) : (
          <div className="timeline">
            {activities.slice().sort((a,b) => new Date(a.timestamp) - new Date(b.timestamp)).map((activity) => (
              <div key={activity.id} className="timeline-item">
                <div className="timeline-dot" aria-hidden />
                <div className="timeline-content">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px' }}>
                    <strong style={{ fontSize: '1rem', color: 'var(--fiu-blue)' }}>{formatActionType(activity.actionType)}</strong>
                    <span className="timeline-meta">{activity.timestamp}</span>
                  </div>
                  <p style={{ margin: '8px 0 0', color: 'var(--text-light)' }}>By <span style={{ fontWeight: 700, color: 'var(--text-dark)' }}>{activity.performedBy}</span></p>
                  {activity.details && <p style={{ marginTop: '8px', color: 'var(--text-light)' }}>{activity.details}</p>}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

export default ActivityFeed;
