// App.jsx (UPDATED for US-19)
//
// Change from the existing App.jsx:
//   Added ONE new route for the activity feed page (US-19)
//   AND imported the new ActivityFeed component
//
// Everything else is unchanged.

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Register from "./Register";
import Login from "./Login";
import Dashboard from "./Dashboard";
import EditVehicleForm from "./EditVehicleForm";
import Garage from "./Garage";
import AddVehicleForm from "./AddVehicleForm";
import ServiceLog from "./ServiceLog";
import EditServiceEntry from "./EditServiceEntry";
import UpcomingMaintenance from "./UpcomingMaintenance";
import ActivityFeed from "./ActivityFeed"; // US-19: NEW

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          {/* Default: redirect to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* US-2: Login and Dashboard */}
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />

          {/* US-1: Register */}
          <Route path="/register" element={<Register />} />

          {/* US-4: View My Garage */}
          <Route path="/garage" element={<Garage />} />

          {/* US-6/7: Service log for a vehicle */}
          <Route path="/vehicles/:id/service-log" element={<ServiceLog />} />

          {/* US-12: Upcoming maintenance for a vehicle */}
          <Route path="/vehicles/:id/upcoming" element={<UpcomingMaintenance />} />

          {/* US-19: Activity feed for a shared vehicle (NEW) */}
          <Route path="/vehicles/:id/activity" element={<ActivityFeed />} />

          {/* US-8: Edit Service Entry route */}
          <Route
            path="/vehicles/:vehicleId/service-entries/:id/edit"
            element={<EditServiceEntry />}
          />

          {/* US-3: Add a Vehicle */}
          <Route path="/vehicles/new" element={<AddVehicleForm />} />

          {/* US-5: Edit Vehicle route */}
          <Route path="/vehicles/:id/edit" element={<EditVehicleForm />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
