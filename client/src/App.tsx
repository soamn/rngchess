import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/home.tsx";
import Chess from "./components/chess.tsx";

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route index element={<Home />} />
          <Route path="game" element={<Chess />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
