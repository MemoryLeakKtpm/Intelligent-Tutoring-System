import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { User, AlertCircle, CheckCircle2, Settings, BookOpen, ArrowRight, ShieldCheck, Hash } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import DashboardLayout from '@/components/DashboardLayout';
import { cn } from '@/lib/utils';

const API_URL = 'http://localhost:3001';

const DashboardPage = () => {
    const { user, token, updateUser } = useAuth();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        isTwoFactorEnabled: user?.isTwoFactorEnabled || false,
    });

    const [message, setMessage] = useState({ type: '', text: '' });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name,
                email: user.email,
                isTwoFactorEnabled: user.isTwoFactorEnabled
            }));
        }
    }, [user]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage({ type: '', text: '' });

        const payload: any = {};
        if (formData.name !== user.name) payload.name = formData.name;
        if (formData.email !== user.email) payload.email = formData.email;
        if (formData.password) payload.password = formData.password;
        if (formData.isTwoFactorEnabled !== user.isTwoFactorEnabled) payload.isTwoFactorEnabled = formData.isTwoFactorEnabled;

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
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>

                {/* Stats / Quick Links Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {/* Role Card */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Account Role</CardTitle>
                            <User className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold capitalize">{user?.role}</div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                <Hash className="h-3 w-3" />
                                <span>ID: {user?.id}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Content Module Card */}
                    <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => navigate('/content')}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Course Content</CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">Manage</div>
                            <p className="text-xs text-muted-foreground">Access materials & quizzes</p>
                        </CardContent>
                        <CardFooter className="pt-0">
                            <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent text-primary text-sm">
                                Go to Content <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                {/* Profile Settings Section */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Profile Settings</CardTitle>
                                <CardDescription>Manage your account information and security.</CardDescription>
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

                            <div className="flex items-center space-x-2 rounded-md border p-4">
                                <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium leading-none">Two-Factor Authentication</p>
                                    <p className="text-sm text-muted-foreground">
                                        Add an extra layer of security to your account.
                                    </p>
                                </div>
                                <Switch
                                    checked={formData.isTwoFactorEnabled}
                                    onCheckedChange={val => setFormData(prev => ({...prev, isTwoFactorEnabled: val}))}
                                    disabled={!isEditing}
                                />
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