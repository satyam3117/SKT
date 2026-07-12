import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import keycloak from "./key-cloack.js";

keycloak.init({
    onLoad: "login-required",
    checkLoginIframe: false
}).then((authenticated) => {
    ReactDOM.createRoot(document.getElementById("root")).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
}).catch(err => {
    console.error("Keycloak initialization failed", err);
});