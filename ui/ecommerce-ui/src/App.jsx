import keycloak from "./key-cloack.js";

function App() {
  return (
      <div>
        <h1>🛒 Welcome to My E-Commerce Store</h1>

        <h3>Hello, {keycloak.tokenParsed?.preferred_username}</h3>

        <button onClick={() => keycloak.logout()}>
          Logout
        </button>
      </div>
  );
}

export default App;