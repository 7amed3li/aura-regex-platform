import { useState, useEffect } from "react";
import { rulesAPI } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Globe, Copy, Check, Search, MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { Input } from "@/components/ui/input";

export default function Community() {
    const { user } = useAuth();
    const [rules, setRules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Comments State
    const [expandedRuleId, setExpandedRuleId] = useState<string | null>(null);
    const [comments, setComments] = useState<any[]>([]);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [newComment, setNewComment] = useState("");

    const loadRules = async () => {
        try {
            setLoading(true);
            const response = await rulesAPI.getPublic();
            setRules(response.data);
        } catch (error) {
            console.error("Failed to load public rules", error);
            toast.error("Topluluk kuralları yüklenemedi.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRules();
    }, []);

    const handleLike = async (ruleId: string, isLiked: boolean) => {
        if (!user) {
            toast.error("Beğenmek için giriş yapmalısınız.");
            return;
        }

        // Optimistic Update
        setRules(prev => prev.map(r => {
            if (r.id === ruleId) {
                return {
                    ...r,
                    likes: isLiked ? r.likes.filter((l: any) => l.userId !== user.id) : [...r.likes, { userId: user.id }],
                    _count: { ...r._count, likes: isLiked ? r._count.likes - 1 : r._count.likes + 1 }
                };
            }
            return r;
        }));

        try {
            if (isLiked) {
                await rulesAPI.unlike(ruleId);
            } else {
                await rulesAPI.like(ruleId);
            }
        } catch (error) {
            toast.error("İşlem başarısız.");
            loadRules(); // Revert on error
        }
    };

    const handleToggleComments = async (ruleId: string) => {
        if (expandedRuleId === ruleId) {
            setExpandedRuleId(null);
            setComments([]);
            return;
        }

        setExpandedRuleId(ruleId);
        setCommentsLoading(true);
        try {
            const response = await rulesAPI.getComments(ruleId);
            setComments(response.data);
        } catch (error) {
            toast.error("Yorumlar yüklenemedi.");
        } finally {
            setCommentsLoading(false);
        }
    };

    const handleSubmitComment = async (ruleId: string) => {
        if (!newComment.trim()) return;
        if (!user) {
            toast.error("Yorum yapmak için giriş yapmalısınız.");
            return;
        }

        try {
            const response = await rulesAPI.addComment(ruleId, newComment);
            setComments(prev => [response.data, ...prev]);
            setNewComment("");

            // Update comment count locally
            setRules(prev => prev.map(r => {
                if (r.id === ruleId) {
                    return {
                        ...r,
                        _count: { ...r._count, comments: (r._count.comments || 0) + 1 }
                    };
                }
                return r;
            }));

            toast.success("Yorum gönderildi!");
        } catch (error) {
            toast.error("Yorum gönderilemedi.");
        }
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        toast.success("Regex kopyalandı!");
        setTimeout(() => setCopiedId(null), 2000);
    };

    const filteredRules = rules.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.regex.includes(searchTerm)
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6 lg:p-10 font-sans text-gray-900">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-100 rounded-xl">
                            <Globe className="w-8 h-8 text-indigo-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900">Topluluk</h1>
                            <p className="text-gray-500">Diğer geliştiricilerin paylaştığı regex kurallarını keşfedin.</p>
                        </div>
                    </div>
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Regex, isim veya açıklama ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border-gray-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all outline-none"
                        />
                    </div>
                </div>

                {/* Rules Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        [1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-64 bg-white rounded-3xl animate-pulse" />
                        ))
                    ) : filteredRules.length === 0 ? (
                        <div className="col-span-full text-center py-20">
                            <p className="text-gray-500 text-lg">Henüz hiç kural paylaşılmamış veya aramanızla eşleşen sonuç yok.</p>
                        </div>
                    ) : (
                        filteredRules.map((rule) => {
                            const isLiked = rule.likes?.some((l: any) => l.userId === user?.id);
                            const isExpanded = expandedRuleId === rule.id;

                            return (
                                <Card key={rule.id} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-white rounded-3xl overflow-hidden flex flex-col">
                                    <CardHeader className="p-6 pb-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors">
                                                @{rule.user?.username || 'Anonim'}
                                            </Badge>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className={`rounded-full hover:bg-blue-50 ${isExpanded ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-blue-600'}`}
                                                    onClick={() => handleToggleComments(rule.id)}
                                                >
                                                    <MessageCircle className="w-5 h-5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className={`rounded-full hover:bg-red-50 ${isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                                                    onClick={() => handleLike(rule.id, isLiked)}
                                                >
                                                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                                                </Button>
                                            </div>
                                        </div>
                                        <CardTitle className="text-xl font-bold text-gray-900 line-clamp-1" title={rule.name}>
                                            {rule.name}
                                        </CardTitle>
                                        <p className="text-gray-500 text-sm line-clamp-2 h-10" title={rule.description}>
                                            {rule.description || "Açıklama yok."}
                                        </p>
                                    </CardHeader>
                                    <CardContent className="p-6 pt-0 flex-1 flex flex-col justify-end gap-4">
                                        <div className="bg-gray-50 rounded-xl p-3 font-mono text-sm text-gray-700 break-all border border-gray-100 group-hover:border-indigo-100 transition-colors relative">
                                            {rule.regex}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="absolute top-1 right-1 h-7 w-7 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-lg"
                                                onClick={() => copyToClipboard(rule.regex, rule.id)}
                                            >
                                                {copiedId === rule.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                            </Button>
                                        </div>
                                        <div className="flex items-center justify-between text-sm text-gray-400 pt-4 border-t border-gray-50">
                                            <span>{new Date(rule.createdAt).toLocaleDateString('tr-TR')}</span>
                                            <div className="flex gap-3">
                                                <div className="flex items-center gap-1 text-gray-500 font-medium">
                                                    <MessageCircle className="w-3 h-3" />
                                                    {rule._count?.comments || 0}
                                                </div>
                                                <div className="flex items-center gap-1 text-red-500 font-medium">
                                                    <Heart className="w-3 h-3 fill-current" />
                                                    {rule._count?.likes || 0}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Comments Section */}
                                        {isExpanded && (
                                            <div className="mt-4 pt-4 border-t border-gray-100 animate-in slide-in-from-top-2">
                                                <div className="space-y-3 max-h-60 overflow-y-auto mb-3 pr-1">
                                                    {commentsLoading ? (
                                                        <div className="flex justify-center py-4">
                                                            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                                        </div>
                                                    ) : comments.length > 0 ? (
                                                        comments.map((comment) => (
                                                            <div key={comment.id} className="bg-gray-50 p-3 rounded-xl text-sm">
                                                                <div className="flex justify-between items-center mb-1">
                                                                    <span className="font-bold text-gray-900">{comment.user?.username || 'Anonim'}</span>
                                                                    <span className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                                                </div>
                                                                <p className="text-gray-600">{comment.content}</p>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-center text-gray-400 text-sm py-2">Henüz yorum yok. İlk yorumu sen yap!</p>
                                                    )}
                                                </div>
                                                <div className="flex gap-2">
                                                    <Input
                                                        placeholder="Yorum yaz..."
                                                        value={newComment}
                                                        onChange={(e) => setNewComment(e.target.value)}
                                                        className="h-9 text-sm rounded-lg"
                                                        onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment(rule.id)}
                                                    />
                                                    <Button size="icon" className="h-9 w-9 rounded-lg bg-indigo-600 hover:bg-indigo-700" onClick={() => handleSubmitComment(rule.id)}>
                                                        <Send className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
