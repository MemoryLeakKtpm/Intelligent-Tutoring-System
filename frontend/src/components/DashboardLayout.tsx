import React from 'react';
import { LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

const DashboardLayout = ({ children }) => {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-slate-50">
            <nav className="border-b bg-white px-6 py-4">
                <div className="mx-auto flex max-w-4xl items-center justify-between">
                    <div className="flex items-center gap-2 font-semibold text-slate-900">
                        <LayoutDashboard className="h-6 w-6" />
                        <span>E-Learning Portal</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-sm text-slate-600">
                            Welcome, <span className="font-medium text-slate-900">{user?.name}</span>
                        </div>
                        <Button variant="outline" size="sm" onClick={logout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign Out
                        </Button>
                    </div>
                </div>
            </nav>
            <main className="mx-auto max-w-4xl p-6">
                {children}
            </main>
        </div>
    );
};

export default DashboardLayout;