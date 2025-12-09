import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Download, Calendar, User as UserIcon, FolderOpen, CheckCircle, XCircle, Lock, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const API_URL = 'http://localhost:3001';

export default function ContentDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();
    const [content, setContent] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Store answers as { questionIndex: optionIndex }
    const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const response = await fetch(`${API_URL}/content/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (response.ok) {
                    const data = await response.json();
                    setContent(data);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id, token]);

    // Updated to use Option Index (oIdx) to prevent selecting duplicate text
    const handleQuizOptionClick = (questionIdx: number, optionIdx: number) => {
        if (showResults) return;
        setQuizAnswers(prev => ({
            ...prev,
            [questionIdx]: optionIdx
        }));
    };

    const getOptionStyle = (qIdx: number, oIdx: number, optionText: string, correctAnswer: string) => {
        const isSelected = quizAnswers[qIdx] === oIdx;

        if (!showResults) {
            return isSelected ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-muted";
        }

        const isCorrect = optionText === correctAnswer;

        if (isCorrect) return "border-green-500 bg-green-50 text-green-700 font-medium";
        if (isSelected && !isCorrect) return "border-red-500 bg-red-50 text-red-700";

        return "opacity-50";
    };

    const formatDeadline = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = date.getTime() - now.getTime();

        const formattedDate = date.toLocaleString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
        });

        if (diffMs < 0) return `${formattedDate} (Closed)`;
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        return `${formattedDate} (${days}d ${hours}h remaining)`;
    };

    if (loading) return <div>Loading...</div>;
    if (!content) return <div>Content not found</div>;

    const renderContentBody = () => {
        switch (content.type) {
            case 'text':
                return (
                    <div className="prose max-w-none p-4 bg-muted/30 rounded-md">
                        <p className="whitespace-pre-wrap">{content.text}</p>
                    </div>
                );
            case 'file':
                return (
                    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-md">
                        <p className="mb-4 text-muted-foreground">Attached Resource File</p>
                        <Button asChild>
                            <a href={`${API_URL}/${content.fileUrl}`} target="_blank" rel="noopener noreferrer">
                                <Download className="mr-2 h-4 w-4" /> Download File
                            </a>
                        </Button>
                    </div>
                );
            case 'group':
                return (
                    <div className="flex flex-col items-center justify-center p-12 bg-slate-50 border rounded-md text-center space-y-4">
                        <FolderOpen className="h-12 w-12 text-blue-400" />
                        <div>
                            <h3 className="font-semibold text-lg">Content Module</h3>
                            <p className="text-muted-foreground">This content is a folder containing other items.</p>
                        </div>
                        <Button onClick={() => navigate('/content')}>
                            Go to Course Explorer
                        </Button>
                    </div>
                );
            case 'quiz':
                return (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-semibold">Practice Quiz</h3>
                            {!showResults && (
                                <Button onClick={() => setShowResults(true)} disabled={Object.keys(quizAnswers).length < (content.questions?.length || 0)}>
                                    Check Answers
                                </Button>
                            )}
                            {showResults && (
                                <Button variant="outline" onClick={() => { setShowResults(false); setQuizAnswers({}); }}>
                                    Reset Quiz
                                </Button>
                            )}
                        </div>
                        {content.questions?.map((q: any, qIdx: number) => (
                            <Card key={qIdx} className="overflow-hidden">
                                <CardHeader className="bg-slate-50 py-3">
                                    <CardTitle className="text-base font-medium flex justify-between">
                                        <span>Q{qIdx + 1}: {q.questionText}</span>
                                        {showResults && (
                                            q.options[quizAnswers[qIdx]] === q.correctAnswer
                                                ? <CheckCircle className="text-green-500 h-5 w-5"/>
                                                : <XCircle className="text-red-500 h-5 w-5"/>
                                        )}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-2">
                                    {q.options.map((opt: string, oIdx: number) => (
                                        <div
                                            key={oIdx}
                                            onClick={() => handleQuizOptionClick(qIdx, oIdx)}
                                            className={`flex items-center space-x-3 p-3 rounded-md border cursor-pointer transition-all ${getOptionStyle(qIdx, oIdx, opt, q.correctAnswer)}`}
                                        >
                                            <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${quizAnswers[qIdx] === oIdx ? "border-primary" : "border-slate-300"}`}>
                                                {quizAnswers[qIdx] === oIdx && <div className="h-2 w-2 rounded-full bg-primary" />}
                                            </div>
                                            <span>{opt}</span>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                );
            default:
                return <p>Unknown content type</p>;
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-2xl">{content.title}</CardTitle>
                            <CardDescription className="mt-2 text-base">
                                {content.description}
                            </CardDescription>
                        </div>
                        <div className="text-right text-sm text-muted-foreground space-y-1">
                            <div className="flex items-center justify-end gap-2">
                                <UserIcon className="h-4 w-4" />
                                <span>Instructor ID: {content.creatorId}</span>
                            </div>
                            {content.deadline && (
                                <div className="flex items-center justify-end gap-2 text-orange-600 font-medium">
                                    <Clock className="h-4 w-4" />
                                    <span>{formatDeadline(content.deadline)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </CardHeader>

                {content.prerequisites && content.prerequisites.length > 0 && (
                    <div className="px-6 pb-2">
                        <Alert className="bg-amber-50 border-amber-200">
                            <Lock className="h-4 w-4 text-amber-600" />
                            <AlertTitle className="text-amber-800">Prerequisites Required</AlertTitle>
                            <AlertDescription className="text-amber-700 text-xs">
                                This content requires completion of {content.prerequisites.length} other item(s).
                            </AlertDescription>
                        </Alert>
                    </div>
                )}

                <Separator />
                <CardContent className="pt-6">
                    {renderContentBody()}
                </CardContent>
                {content.tags && (
                    <CardFooter className="flex gap-2">
                        {content.tags.map((tag: any, i: number) => (
                            <span key={i} className="text-xs bg-secondary px-2 py-1 rounded">
                #{tag.name}
              </span>
                        ))}
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}