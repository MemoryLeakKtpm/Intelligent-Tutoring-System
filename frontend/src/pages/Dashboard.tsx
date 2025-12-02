import React, { useState, useEffect } from 'react';
import { User, AlertCircle, CheckCircle2, Settings } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import DashboardLayout from '@/components/DashboardLayout';
import { cn } from '@/lib/utils';

const API_URL = 'http://localhost:3001';

const DashboardPage = () => {
    const { user, token, updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        password: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name,
                email: user.email
            }));
        }
    }, [user]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage({ type: '', text: '' });

        const payload = {};
        if (formData.name !== user.name) payload.name = formData.name;
        if (formData.email !== user.email) payload.email = formData.email;
        if (formData.password) payload.password = formData.password;

        if (Object.keys(payload).length === 0) {
            setIsSaving(false);
            setIsEditing(false);
            return;
        }

        try {
            const res = await fetch(`${API_URL}/users/me`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error('Failed to update profile');

            const updatedUser = await res.json();
            updateUser(updatedUser);
            setMessage({ type: 'success', text: 'Profile updated successfully' });
            setIsEditing(false);
            setFormData(prev => ({...prev, password: ''}));
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Account Role</CardTitle>
                            <User className="h-4 w-4 text-slate-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold capitalize">{user?.role}</div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Profile Settings</CardTitle>
                                <CardDescription>Manage your account information.</CardDescription>
                            </div>
                            {!isEditing && (
                                <Button variant="outline" onClick={() => setIsEditing(true)}>
                                    <Settings className="mr-2 h-4 w-4" />
                                    Edit Profile
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {message.text && (
                            <div className={cn(
                                "mb-4 flex items-center gap-2 rounded-md p-3 text-sm",
                                message.type === 'error' ? "bg-red-50 text-red-500" : "bg-green-50 text-green-600"
                            )}>
                                {message.type === 'error' ? <AlertCircle className="h-4 w-4"/> : <CheckCircle2 className="h-4 w-4"/>}
                                <span>{message.text}</span>
                            </div>
                        )}

                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="dash-name">Full Name</Label>
                                    <Input
                                        id="dash-name"
                                        value={formData.name}
                                        onChange={e => setFormData(prev => ({...prev, name: e.target.value}))}
                                        disabled={!isEditing}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="dash-email">Email</Label>
                                    <Input
                                        id="dash-email"
                                        value={formData.email}
                                        onChange={e => setFormData(prev => ({...prev, email: e.target.value}))}
                                        disabled={!isEditing}
                                    />
                                </div>
                            </div>

                            {isEditing && (
                                <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="dash-pass" className="text-yellow-900">New Password (Optional)</Label>
                                        <Input
                                            id="dash-pass"
                                            type="password"
                                            placeholder="Leave blank to keep current"
                                            value={formData.password}
                                            onChange={e => setFormData(prev => ({...prev, password: e.target.value}))}
                                            className="border-yellow-200 bg-white"
                                        />
                                    </div>
                                </div>
                            )}

                            {isEditing && (
                                <div className="flex gap-2 pt-2">
                                    <Button type="submit" disabled={isSaving}>
                                        {isSaving ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                    <Button type="button" variant="ghost" onClick={() => { setIsEditing(false); setMessage({type:'', text:''}); }}>Cancel</Button>
                                </div>
                            )}
                        </form>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default DashboardPage;