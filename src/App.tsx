// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import BarcodeGenerator from "./pages/BarcodeGenerator";
import BarcodeBatch from "./pages/BarcodeBatch";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/barcode" element={<BarcodeGenerator />} />
        <Route path="/barcode/batch" element={<BarcodeBatch />} />
      </Routes>
    </Router>
  );
}

export default App;
