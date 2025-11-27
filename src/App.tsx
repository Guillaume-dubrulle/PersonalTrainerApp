import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Customers from "./pages/Customers";
import Trainings from "./pages/Trainings";
import Calendar from "./pages/Calendar";
import Statistics from "./pages/Statistics";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div style={{ paddingTop: 64 }}>
        <Routes>
        <Route path="/" element={<Navigate to="/customers" />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/trainings" element={<Trainings />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/statistics" element={<Statistics />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
