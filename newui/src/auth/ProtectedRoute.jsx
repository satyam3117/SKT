
import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute({
                                           children,
                                           adminOnly = false,
                                       }) {
    const { ready, authenticated, isAdmin } = useAuth();
    const location = useLocation();

    if (!ready) {
        return (
            <main className="grid min-h-screen place-items-center bg-[#F7F3E8] text-[#26372D]">
                Loading authentication...
            </main>
        );
    }

    if (!authenticated) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location }}
            />
        );
    }

    if (adminOnly && !isAdmin) {
        return (
            <main className="grid min-h-screen place-items-center bg-[#F7F3E8] px-5 text-[#26372D]">
                <section className="rounded-2xl border border-[#D8DFD1] bg-[#FFFDF7] p-8">
                    <h1 className="text-xl font-bold">Access denied</h1>

                    <p className="mt-2 text-sm">
                        Your current Keycloak account does not have the ADMIN role.
                    </p>

                    <Link
                        to="/login"
                        state={{ from: location }}
                        className="mt-4 inline-block text-[#245C45] underline"
                    >
                        Sign in with another account
                    </Link>

                    <br />

                    <Link
                        to="/"
                        className="mt-3 inline-block text-[#245C45] underline"
                    >
                        Return to store
                    </Link>
                </section>
            </main>
        );
    }

    return children;
}
