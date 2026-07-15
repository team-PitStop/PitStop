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
import ActivityFeed from "./ActivityFeed";
import Layout from "./Layout"; // NEW

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/garage" element={<Garage />} />
          <Route path="/vehicles/new" element={<AddVehicleForm />} />
          <Route path="/vehicles/:id/edit" element={<EditVehicleForm />} />
          <Route path="/vehicles/:id/service-log" element={<ServiceLog />} />
          <Route path="/vehicles/:id/upcoming" element={<UpcomingMaintenance />} />
          <Route path="/vehicles/:id/activity" element={<ActivityFeed />} />
          <Route path="/vehicles/:vehicleId/service-entries/:id/edit" element={<EditServiceEntry />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;