import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import {
    Folder, FileText, File, HelpCircle, ChevronRight,
    CornerLeftUp, Lock, Calendar, MoreVertical, Trash, Edit, Clock,
    LayoutDashboard
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const API_URL = 'http://localhost:3001';

export default function ContentExplorer() {
    const [contents, setContents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
    const [folderHistory, setFolderHistory] = useState<{id: string, title: string}[]>([]);
    const [currentFolderTitle, setCurrentFolderTitle] = useState("Root");

    const { token, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.state?.folderId) {
            setCurrentFolderId(location.state.folderId);
            setCurrentFolderTitle("Current Folder");
            window.history.replaceState({}, '');
        }
    }, [location.state]);

    useEffect(() => {
        fetchContent(currentFolderId);
    }, [currentFolderId]);

    const fetchContent = async (parentId: string | null) => {
        try {
            setLoading(true);
            const query = parentId
                ? `parentContentId=${parentId}`
                : `isRoot=true`;

            const response = await fetch(`${API_URL}/content?${query}&limit=50`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data) && Array.isArray(data[0])) {
                    setContents(data[0]);
                } else {
                    setContents([]);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const deleteContent = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if(!confirm("Are you sure you want to delete this content?")) return;

        try {
            const res = await fetch(`${API_URL}/content/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if(res.ok) {
                fetchContent(currentFolderId);
            } else {
                alert("Failed to delete content");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleEnterFolder = (folder: any) => {
        setFolderHistory([...folderHistory, { id: currentFolderId || 'root', title: currentFolderTitle }]);
        setCurrentFolderId(folder.id);
        setCurrentFolderTitle(folder.title);
    };

    const handleGoUp = () => {
        if (folderHistory.length === 0) {
            if(currentFolderId) {
                setCurrentFolderId(null);
                setCurrentFolderTitle("Root");
            }
            return;
        }
        const previous = folderHistory[folderHistory.length - 1];
        const newHistory = folderHistory.slice(0, -1);

        setFolderHistory(newHistory);
        setCurrentFolderId(previous.id === 'root' ? null : previous.id);
        setCurrentFolderTitle(previous.title);
    };

    const formatDeadline = (dateString: string) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = date.getTime() - now.getTime();

        const formattedDate = date.toLocaleString('en-US', {
            month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
        });

        if (diffMs < 0) return { text: `${formattedDate} (Overdue)`, color: 'text-red-600' };

        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        const timeleft = days > 0 ? `${days}d ${hours}h left` : `${hours}h left`;
        return { text: `${formattedDate} (${timeleft})`, color: 'text-orange-600' };
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'group': return <Folder className="h-6 w-6 text-blue-500 fill-blue-100" />;
            case 'quiz': return <HelpCircle className="h-6 w-6 text-purple-500" />;
            case 'file': return <File className="h-6 w-6 text-orange-500" />;
            default: return <FileText className="h-6 w-6 text-slate-500" />;
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            {currentFolderId && (
                                <Button variant="ghost" size="icon" onClick={handleGoUp}>
                                    <CornerLeftUp className="h-5 w-5" />
                                </Button>
                            )}
                            {currentFolderTitle}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            {folderHistory.length === 0 ? "Course Overview" : `Location: ${folderHistory.map(f => f.title === 'Root' ? 'Home' : f.title).join(' / ')}`}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => navigate('/dashboard')}>
                            <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                        </Button>

                        {user?.role === 'instructor' && (
                            <Button onClick={() => navigate('/content/create', { state: { parentId: currentFolderId } })}>
                                + New Content
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg border shadow-sm min-h-[300px]">
                {loading ? (
                    <div className="p-12 text-center text-muted-foreground">Loading contents...</div>
                ) : contents.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center">
                        <Folder className="h-12 w-12 text-slate-200 mb-4" />
                        <h3 className="text-lg font-medium">This folder is empty</h3>
                        {user?.role === 'instructor' && <p className="text-sm text-muted-foreground">Start by adding content here.</p>}
                    </div>
                ) : (
                    <div className="divide-y">
                        {contents.map((item) => {
                            const deadlineInfo = formatDeadline(item.deadline);
                            return (
                                <div
                                    key={item.id}
                                    className="flex items-center p-4 hover:bg-slate-50 transition-colors group cursor-pointer"
                                    onClick={() => item.type === 'group' ? handleEnterFolder(item) : navigate(`/content/${item.id}`)}
                                >
                                    <div className="mr-4">
                                        {getIcon(item.type)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium truncate">{item.title}</span>
                                            {item.prerequisites && item.prerequisites.length > 0 && (
                                                <Lock className="h-3 w-3 text-red-400" title="Has prerequisites" />
                                            )}
                                        </div>
                                        <div className="text-xs text-muted-foreground flex flex-wrap gap-3 mt-1 items-center">
                                            {item.type === 'group' ? <span className="font-semibold">Module</span> : <span>{item.type.toUpperCase()}</span>}

                                            {deadlineInfo && (
                                                <span className={`flex items-center gap-1 ${deadlineInfo.color}`}>
                                <Clock className="h-3 w-3" />
                                                    {deadlineInfo.text}
                            </span>
                                            )}

                                            {item.tags?.map((t: any, i: number) => (
                                                <span key={i} className="bg-slate-100 px-1 rounded text-slate-600 border">
                                {t.name}
                            </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {item.type === 'group' ? (
                                            <Button variant="ghost" size="sm" className="text-muted-foreground">
                                                Open <ChevronRight className="ml-1 h-4 w-4" />
                                            </Button>
                                        ) : (
                                            <Button variant="ghost" size="sm" className="hidden sm:inline-flex">View</Button>
                                        )}

                                        {user?.role === 'instructor' && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/content/edit/${item.id}`); }}>
                                                        <Edit className="mr-2 h-4 w-4" /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={(e) => deleteContent(item.id, e)} className="text-red-600 focus:text-red-600">
                                                        <Trash className="mr-2 h-4 w-4" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}