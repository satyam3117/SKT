
import { BrowserRouter, Route, Routes } from "react-router-dom";

import App from "./App";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import ProductManagement from "./pages/admin/ProductManagement";
import ProductForm from "./pages/admin/ProductForm";
import InventoryManagement from "./pages/InventoryManagement";
import ProductBrands from "./pages/ProductBrands";
import ProductCategories from "./pages/ProductCategories";
export default function AppRoutes() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Public storefront */}
                    <Route path="/" element={<App />} />
                    <Route path="/login" element={<LoginPage />} />

                    {/* Admin-only pages */}
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute adminOnly>
                                <AdminDashboard />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin/products"
                        element={
                            <ProtectedRoute adminOnly>
                                <ProductManagement />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin/products/new"
                        element={
                            <ProtectedRoute adminOnly>
                                <ProductForm />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin/products/:id/edit"
                        element={
                            <ProtectedRoute adminOnly>
                                <ProductForm />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin/inventory"
                        element={
                            <ProtectedRoute adminOnly>
                                <InventoryManagement />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="*"
                        element={
                            <main style={{ padding: 32 }}>
                                <h1>Page not found</h1>
                                <a href="/">Return to store</a>
                            </main>
                        }
                    />
                    <Route
                        path="/admin/brands"
                        element={
                            <ProtectedRoute adminOnly>
                                <ProductBrands />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin/categories"
                        element={
                            <ProtectedRoute adminOnly>
                                <ProductCategories />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}
