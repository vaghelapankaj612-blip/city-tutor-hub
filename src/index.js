import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Bootstrap
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";

import "./styles/admin.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
      
    
);
