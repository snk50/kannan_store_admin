import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";  // Import the Login component

function App() {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />  {/* Set Login as the home page */}
        </Routes>
      </Router>
  );
}

export default App;
