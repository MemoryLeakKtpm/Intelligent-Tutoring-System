import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoginPage from '@/pages/Login';
import RegisterPage from '@/pages/Register';
import DashboardPage from '@/pages/Dashboard';
import ContentExplorer from '@/pages/ContentExplorer';
import CreateContent from '@/pages/CreateContent';
import EditContent from '@/pages/EditContent';
import ContentDetail from '@/pages/ContentDetail';

const App = () => {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <DashboardPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/content"
                        element={
                            <ProtectedRoute>
                                <ContentExplorer />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/content/create"
                        element={
                            <ProtectedRoute>
                                <CreateContent />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/content/edit/:id"
                        element={
                            <ProtectedRoute>
                                <EditContent />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/content/:id"
                        element={
                            <ProtectedRoute>
                                <ContentDetail />
                            </ProtectedRoute>
                        }
                    />

                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
};

export default App;