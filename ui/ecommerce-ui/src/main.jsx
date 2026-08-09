import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import keycloak from "./keycloak";
import "./index.css";

keycloak.init({
    onLoad: "login-required",
    checkLoginIframe: false,
})
    .then((authenticated) => {
        const root = ReactDOM.createRoot(document.getElementById("root"));

        root.render(
            <StrictMode>
                <BrowserRouter>
                    <App keycloak={keycloak} isAuthenticated={authenticated} />
                </BrowserRouter>
            </StrictMode>
        );
    })
    .catch((err) => {
        console.error("Keycloak init failed:", err);
    });