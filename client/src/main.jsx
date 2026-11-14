import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "./context/AuthContext.jsx";
import AOS from "aos";

AOS.init({
  duration: 700,
  easing: "ease-out-cubic",
  once: true, // ekbar animate hole abar scroll-e repeat hobe na
  offset: 80,
  // Jader device-e "reduce motion" on, tader jonno animation bondho
  disable: () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
