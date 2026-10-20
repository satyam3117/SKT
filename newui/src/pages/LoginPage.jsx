
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { KeyRound, ShieldCheck } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

export default function LoginPage() {
  const { ready, authenticated, user, login, logout } = useAuth();
  const location = useLocation();
  const [error, setError] = useState("");

  const destination = location.state?.from?.pathname || "/admin";

  const handleLogin = async () => {
    setError("");

    try {
      const redirectUri = new URL(
          destination,
          window.location.origin
      ).toString();

      await login(redirectUri);
    } catch (err) {
      console.error("Unable to start Keycloak login:", err);
      setError("Unable to open the login page. Please try again.");
    }
  };

  if (!ready) {
    return (
        <main className="grid min-h-screen place-items-center bg-[#F7F3E8] text-[#26372D]">
          Checking login session...
        </main>
    );
  }

  return (
      <main className="grid min-h-screen place-items-center bg-[#F7F3E8] px-5 py-10 text-[#26372D]">
        <section className="w-full max-w-md rounded-3xl border border-[#D8DFD1] bg-[#FFFDF7] p-8 shadow-sm">
          <a
              href="/"
              className="text-2xl font-extrabold tracking-tight text-[#245C45]"
          >
            SKT
          </a>

          <div className="mt-8 grid h-14 w-14 place-items-center rounded-2xl bg-[#E5EBDD] text-[#245C45]">
            <KeyRound size={28} />
          </div>

          <h1 className="mt-5 text-2xl font-bold">
            {authenticated ? "Switch account" : "Sign in to SKT"}
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#536357]">
            {authenticated
                ? `Currently signed in as ${user?.username || "your account"}. To use a different account, continue to Keycloak and enter the required credentials.`
                : "Continue securely using your SKT Keycloak account."}
          </p>

          {authenticated && (
              <button
                  type="button"
                  onClick={() => logout()}
                  className="mt-5 w-full rounded-xl border border-[#D8DFD1] px-5 py-3 font-semibold text-[#245C45] hover:bg-[#E5EBDD]"
              >
                Log out first
              </button>
          )}

          <button
              type="button"
              onClick={handleLogin}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#245C45] px-5 py-3 font-semibold text-white transition hover:bg-[#173F30]"
          >
            <ShieldCheck size={18} />
            {authenticated ? "Sign in with another account" : "Continue with Keycloak"}
          </button>

          {error && (
              <p role="alert" className="mt-4 text-sm text-red-700">
                {error}
              </p>
          )}

          <a
              href="/"
              className="mt-5 block text-center text-sm font-medium text-[#245C45] hover:underline"
          >
            Return to store
          </a>
        </section>
      </main>
  );
}
