import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Activity, Shield, Database, Server, AlertTriangle, Search, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { usersAPI } from "@/lib/api";
import { toast } from "sonner";
import { useState, useEffect } from "react";

export default function AdminDashboard() {
    const { user } = useAuth();
    const [, navigate] = useLocation();

    const [users, setUsers] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({
        totalUsers: 0,
        dailyApiRequests: 0,
        activeRules: 0,
        serverStatus: 'Checking...'
    });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const loadData = async () => {
        try {
            setLoading(true);
            const [usersRes, statsRes] = await Promise.all([
                usersAPI.getAll(),
                usersAPI.getStats()
            ]);
            setUsers(usersRes.data);
            setStats(statsRes.data);
        } catch (error) {
            console.error("Failed to load admin data", error);
            toast.error("Veriler yüklenemedi.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === 'ADMIN') {
            loadData();
        }
    }, [user]);

    const handleBanUser = async (userId: string) => {
        if (!confirm("Bu kullanıcıyı yasaklamak istediğinize emin misiniz?")) return;
        try {
            await usersAPI.ban(userId);
            toast.success("Kullanıcı yasaklandı.");
            loadData();
        } catch (error) {
            toast.error("İşlem başarısız.");
        }
    };

    const handleUnbanUser = async (userId: string) => {
        if (!confirm("Bu kullanıcının yasağını kaldırmak istediğinize emin misiniz?")) return;
        try {
            await usersAPI.unban(userId);
            toast.success("Kullanıcı yasağı kaldırıldı.");
            loadData();
        } catch (error) {
            toast.error("İşlem başarısız.");
        }
    };

    // Display Stats
    const statCards = [
        { title: "Toplam Kullanıcı", value: stats.totalUsers, icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
        { title: "Günlük API İsteği", value: stats.dailyApiRequests, icon: Activity, color: "text-green-600", bg: "bg-green-100" },
        { title: "Aktif Kurallar", value: stats.activeRules, icon: Database, color: "text-purple-600", bg: "bg-purple-100" },
        { title: "Sunucu Durumu", value: stats.serverStatus, icon: Server, color: "text-orange-600", bg: "bg-orange-100" },
    ];

    const filteredUsers = users.filter(u =>
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.username && u.username.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6 lg:p-10 font-sans text-gray-900">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-100 rounded-xl">
                            <Shield className="w-8 h-8 text-red-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-gray-900">Yönetici Paneli</h1>
                            <p className="text-gray-500 text-sm md:text-base">Sistem kontrol merkezi. Hoş geldin, {user?.username || "Admin"}.</p>
                        </div>
                    </div>
                    <Button
                        onClick={() => navigate("/dashboard")}
                        variant="outline"
                        className="border-gray-300 hover:bg-gray-50 rounded-xl gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Ana Panele Dön
                    </Button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statCards.map((stat, i) => (
                        <Card key={i} className="rounded-2xl shadow-sm border-0 bg-white hover:shadow-md transition-shadow">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className={`p-4 rounded-2xl ${stat.bg}`}>
                                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                                    <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Users Management */}
                <Card className="rounded-3xl shadow-lg border-0 bg-white overflow-hidden">
                    <CardHeader className="border-b border-gray-100 p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <Users className="w-5 h-5 text-gray-600" />
                                Kullanıcı Yönetimi
                            </CardTitle>
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder="Kullanıcı ara..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 rounded-xl bg-gray-50 border-gray-200 focus:ring-2 focus:ring-red-100"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-600 font-medium">
                                    <tr>
                                        <th className="p-4 whitespace-nowrap">Kullanıcı</th>
                                        <th className="p-4 whitespace-nowrap">Rol</th>
                                        <th className="p-4 whitespace-nowrap">Durum</th>
                                        <th className="p-4 whitespace-nowrap">Son Giriş</th>
                                        <th className="p-4 text-right whitespace-nowrap">İşlem</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loading ? (
                                        <tr><td colSpan={5} className="p-4 text-center">Yükleniyor...</td></tr>
                                    ) : filteredUsers.length === 0 ? (
                                        <tr><td colSpan={5} className="p-4 text-center">Kullanıcı bulunamadı.</td></tr>
                                    ) : (
                                        filteredUsers.map((u) => (
                                            <tr key={u.id} className="hover:bg-gray-50/50 transition">
                                                <td className="p-4 font-medium text-gray-900">
                                                    {u.email}
                                                    {u.username && <div className="text-xs text-gray-500">@{u.username}</div>}
                                                </td>
                                                <td className="p-4"><span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-xs font-bold">{u.role}</span></td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${u.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                                                        u.status === 'BANNED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {u.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-gray-500">
                                                    {u.lastSignedIn ? new Date(u.lastSignedIn).toLocaleString('tr-TR') : 'Hiç girmedi'}
                                                </td>
                                                <td className="p-4 text-right">
                                                    {u.status === 'BANNED' ? (
                                                        <Button variant="ghost" size="sm" onClick={() => handleUnbanUser(u.id)} className="text-green-600 hover:bg-green-50 hover:text-green-700">Yasağı Kaldır</Button>
                                                    ) : (
                                                        <Button variant="ghost" size="sm" onClick={() => handleBanUser(u.id)} className="text-red-600 hover:bg-red-50 hover:text-red-700">Banla</Button>
                                                    )}
                                                </td>
                                            </tr>
                                        )))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* System Alerts */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-yellow-800">Sistem Uyarısı</h4>
                        <p className="text-sm text-yellow-700">Veritabanı yedeklemesi 12 saat önce yapıldı. Manuel yedekleme önerilir.</p>
                    </div>
                </div>

            </div>
        </div>
    );
}