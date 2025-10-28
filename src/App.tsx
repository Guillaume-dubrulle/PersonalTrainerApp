import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Customers from "./pages/Customers";
import Trainings from "./pages/Trainings";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div style={{ paddingTop: 64 }}>
        <Routes>
        <Route path="/" element={<Navigate to="/customers" />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/trainings" element={<Trainings />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
