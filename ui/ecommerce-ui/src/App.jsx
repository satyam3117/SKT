import React from "react";
import axios from "axios";

function App({ keycloak }) {

    console.log("App received keycloak:", keycloak);

    // ✅ HARD GUARD (fixes your crash)
    if (!keycloak || !keycloak.tokenParsed) {
        console.log("⏳ Waiting for Keycloak...");
        return <div>Loading authentication...</div>;
    }

    const callPrivateApi = async () => {
        try {
            await keycloak.updateToken(30);

            const response = await axios.get(
                "http://localhost:7070/api/product",
                {
                    headers: {
                        Authorization: `Bearer ${keycloak.token}`,
                    },
                }
            );

            console.log(response.data);

        } catch (error) {
            console.error("API error:", error);
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>Keycloak React App</h2>

            <p>
                <strong>User:</strong>{" "}
                {keycloak.tokenParsed?.preferred_username}
            </p>

            <button onClick={callPrivateApi}>
                Call API
            </button>

            <br /><br />

            <button onClick={() => keycloak.logout()}>
                Logout
            </button>
        </div>
    );
}

export default App;