import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import keycloak from "./keycloak.js";

console.log("🚀 Starting app...");
console.log("Keycloak object:", keycloak);

keycloak.init({
    onLoad: "login-required",
    checkLoginIframe: false,
})
    .then((authenticated) => {
        console.log("✅ Keycloak initialized");
        console.log("Authenticated:", authenticated);
        console.log("Token:", keycloak.token);
        console.log("Token Parsed:", keycloak.tokenParsed);

        if (!authenticated) {
            console.error("❌ User NOT authenticated");
            return;
        }

        const rootElement = document.getElementById("root");
        console.log("Root element:", rootElement);

        const root = ReactDOM.createRoot(rootElement);

        root.render(
            <React.StrictMode>
                <App keycloak={keycloak} />
            </React.StrictMode>
        );
    })
    .catch((err) => {
        console.error("❌ Keycloak init failed:", err);
    });