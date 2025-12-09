import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import { Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const API_URL = 'http://localhost:3001';

export default function EditContent() {
    const { id } = useParams();
    const { token } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [availableContent, setAvailableContent] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'text',
        deadline: '',
        text: '',
        parentContentId: '',
    });

    const [selectedPrereqs, setSelectedPrereqs] = useState<{id: string, title: string}[]>([]);

    const [questions, setQuestions] = useState([
        { questionText: '', options: ['', '', '', ''], correctAnswer: '' }
    ]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const listRes = await fetch(`${API_URL}/content?limit=100`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                let allContents: any[] = [];
                if(listRes.ok) {
                    const data = await listRes.json();
                    if(Array.isArray(data) && Array.isArray(data[0])) allContents = data[0];
                    setAvailableContent(allContents);
                }

                const contentRes = await fetch(`${API_URL}/content/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if(contentRes.ok) {
                    const data = await contentRes.json();
                    setFormData({
                        title: data.title,
                        description: data.description || '',
                        type: data.type,
                        deadline: data.deadline ? new Date(data.deadline).toISOString().slice(0, 16) : '',
                        text: data.text || '',
                        parentContentId: data.parentContentId || '',
                    });

                    if(data.questions && Array.isArray(data.questions)) {
                        setQuestions(data.questions);
                    }

                    if(data.prerequisites) {
                        const prereqsWithTitles = data.prerequisites.map((p: any) => {
                            const found = allContents.find((c: any) => c.id === p.contentId);
                            return { id: p.contentId, title: found?.title || 'Unknown Content' };
                        });
                        setSelectedPrereqs(prereqsWithTitles);
                    }
                }
            } catch(e) { console.error(e); } finally { setFetching(false); }
        };
        fetchData();
    }, [id, token]);

    const handleAddPrereq = (contentId: string) => {
        if(contentId === id) return;
        const item = availableContent.find(c => c.id === contentId);
        if(item && !selectedPrereqs.find(p => p.id === item.id)) {
            setSelectedPrereqs([...selectedPrereqs, { id: item.id, title: item.title }]);
        }
    };

    const handleRemovePrereq = (pid: string) => {
        setSelectedPrereqs(selectedPrereqs.filter(p => p.id !== pid));
    };

    const handleQuestionChange = (index: number, field: string, value: string) => {
        const newQuestions = [...questions];
        (newQuestions[index] as any)[field] = value;
        setQuestions(newQuestions);
    };

    const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options[oIndex] = value;
        if (newQuestions[qIndex].correctAnswer === questions[qIndex].options[oIndex]) {
            newQuestions[qIndex].correctAnswer = value;
        }
        setQuestions(newQuestions);
    };

    const addQuestion = () => {
        setQuestions([...questions, { questionText: '', options: ['', '', '', ''], correctAnswer: '' }]);
    };

    const removeQuestion = (index: number) => {
        if (questions.length > 1) {
            setQuestions(questions.filter((_, i) => i !== index));
        } else {
            alert("You must have at least one question.");
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const prerequisites = selectedPrereqs.map(p => ({ contentId: p.id }));

            const payload = {
                title: formData.title,
                description: formData.description,
                deadline: formData.deadline ? new Date(formData.deadline).toISOString() : undefined,
                prerequisites: prerequisites,
                ...(formData.type === 'text' && { text: formData.text }),
                parentContentId: formData.parentContentId || null,
                ...(formData.type === 'quiz' && { questions }),
            };

            const res = await fetch(`${API_URL}/content/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                // FIX: Pass the folderId in state so ContentExplorer knows where to return
                navigate('/content', { state: { folderId: formData.parentContentId } });
            } else {
                const err = await res.json();
                alert(`Error: ${JSON.stringify(err.message)}`);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if(fetching) return <div className="p-8 text-center text-muted-foreground">Loading content...</div>;

    return (
        <div className="container mx-auto p-6 max-w-3xl">
            <Card>
                <CardHeader>
                    <CardTitle>Edit Content</CardTitle>
                </CardHeader>
                <form onSubmit={handleUpdate}>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                required
                                value={formData.title}
                                onChange={e => setFormData({...formData, title: e.target.value})}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={e => setFormData({...formData, description: e.target.value})}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="parent-id">Parent Folder ID</Label>
                                <Input
                                    id="parent-id"
                                    placeholder="UUID (Optional)"
                                    value={formData.parentContentId}
                                    onChange={e => setFormData({...formData, parentContentId: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="deadline">Deadline</Label>
                                <Input
                                    id="deadline"
                                    type="datetime-local"
                                    value={formData.deadline}
                                    onChange={e => setFormData({...formData, deadline: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label>Prerequisites</Label>
                            <Select onValueChange={handleAddPrereq}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Add prerequisite..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableContent.filter(c => c.id !== id).map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <div className="flex flex-wrap gap-2">
                                {selectedPrereqs.map(p => (
                                    <Badge key={p.id} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1">
                                        {p.title}
                                        <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => handleRemovePrereq(p.id)} />
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <Separator />

                        {formData.type === 'text' && (
                            <div className="space-y-2">
                                <Label htmlFor="content-text">Body Text</Label>
                                <Textarea
                                    id="content-text"
                                    className="min-h-[200px]"
                                    required
                                    value={formData.text}
                                    onChange={e => setFormData({...formData, text: e.target.value})}
                                />
                            </div>
                        )}

                        {formData.type === 'quiz' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-medium">Quiz Questions</h3>
                                    <Button type="button" size="sm" onClick={addQuestion}>
                                        <Plus className="mr-2 h-4 w-4" /> Add Question
                                    </Button>
                                </div>
                                {questions.map((q, qIndex) => (
                                    <Card key={qIndex} className="bg-slate-50 border-slate-200">
                                        <CardHeader className="flex flex-row items-start justify-between pb-2 space-y-0">
                                            <Label className="mt-2">Question {qIndex + 1}</Label>
                                            {questions.length > 1 && (
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => removeQuestion(qIndex)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <Input
                                                placeholder="Enter question text..."
                                                value={q.questionText}
                                                onChange={(e) => handleQuestionChange(qIndex, 'questionText', e.target.value)}
                                                required
                                            />
                                            <div className="grid grid-cols-2 gap-4">
                                                {q.options.map((opt, oIndex) => (
                                                    <div key={oIndex} className="flex gap-2">
                                                        <div className="flex-1 space-y-1">
                                                            <Label className="text-xs text-muted-foreground">Option {oIndex + 1}</Label>
                                                            <Input
                                                                value={opt}
                                                                onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                                                required
                                                                placeholder={`Option ${oIndex + 1}`}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Correct Answer</Label>
                                                <Select
                                                    value={q.correctAnswer}
                                                    onValueChange={(val) => handleQuestionChange(qIndex, 'correctAnswer', val)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select correct option" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {q.options.map((opt, i) => (
                                                            opt && <SelectItem key={i} value={opt}>{opt}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}

                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button variant="outline" type="button" onClick={() => navigate('/content')}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}