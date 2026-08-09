import keycloak from "../keycloak.js";

export default function LoginPage() {
  const handleLogin = () => {
    keycloak.login();
  };

  return (
      <div className="login-container">
        <h2>Welcome to SKT Store</h2>
        <button onClick={handleLogin}>Login</button>
      </div>
  );
}