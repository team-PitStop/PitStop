import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Register from "./Register";
import Login from "./Login";
import Dashboard from "./Dashboard";
import EditVehicleForm from "./EditVehicleForm";
import Garage from "./Garage";
import AddVehicleForm from "./AddVehicleForm";
import ServiceLog from "./ServiceLog";

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

          {/* Service log for a vehicle */}
          <Route path="/vehicles/:id/service-log" element={<ServiceLog />} />

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
