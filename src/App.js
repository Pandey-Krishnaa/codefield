import React from "react";
import { Toaster } from "react-hot-toast";
import { Route, Routes } from "react-router-dom";
import EditorPage from "./Pages/EditorPage";
import Home from "./Pages/Home";
function App() {
  return (
    <>
      <div>
        <Toaster position="top-right"></Toaster>
      </div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="editor/:roomID" element={<EditorPage />} />
      </Routes>
    </>
  );
}

export default App;
