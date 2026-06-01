import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Register from "./Register";
import Login from "./Login";
import Dashboard from "./Dashboard";
import EditVehicleForm from "./EditVehicleForm";

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

          {/* US-5: Edit Vehicle route */}
          <Route path="/vehicles/:id/edit" element={<EditVehicleForm />} />

          {/* Placeholder for Dylan's garage - he'll add this for US-4 */}
          {/* <Route path="/garage" element={<Garage />} /> */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
