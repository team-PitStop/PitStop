import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Register from "./Register";
import EditVehicleForm from "./EditVehicleForm";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          {/* Existing route - Miguel's Register page */}
          <Route path="/" element={<Register />} />

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
