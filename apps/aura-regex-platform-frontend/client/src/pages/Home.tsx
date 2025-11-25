import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Zap, Code2, Sparkles, Mail, Lock, User as UserIcon, ShieldCheck } from "lucide-react";
import { APP_TITLE } from "@/const";
import { useState } from "react";
import { toast } from "sonner";

// رابط الباك اند
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// تعريف الواجهات محلياً
interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: "USER" | "ADMIN";
  };
}

export default function Home() {
  const { loading, refreshProfile } = useAuth(); 

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <Loader2 className="w-16 h-16 animate-spin text-purple-600" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || (isSignup && !username)) {
      return toast.error("Lütfen tüm alanları doldurun");
    }

    setIsLoading(true);
    try {
      const endpoint = isSignup ? "/api/auth/signup" : "/api/auth/login";
      const payload: any = { email, password };
      if (isSignup) payload.username = username || email.split("@")[0];

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // ✅ 1. معالجة خاصة لخطأ كثرة المحاولات (429)
      if (res.status === 429) {
        throw new Error("Çok fazla deneme yaptınız. Lütfen 15 dakika sonra tekrar deneyin.");
      }

      // ✅ 2. التأكد من أن الرد هو JSON قبل محاولة قراءته
      const contentType = res.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        // في حالة حدوث خطأ غير متوقع من السيرفر (نصي وليس JSON)
        const text = await res.text();
        throw new Error(text || "Sunucu hatası (Geçersiz yanıt formatı).");
      }

      // معالجة الأخطاء القادمة من الباك اند
      if (!res.ok) {
        if (data.error === 'Invalid credentials or inactive account') {
            throw new Error("E-posta veya şifre hatalı.");
        }
        throw new Error(data.error || data.message || "Bir hata oluştu");
      }

      const authData = data as AuthResponse;

      // حفظ البيانات وتحديث الحالة
      localStorage.setItem("token", authData.token);
      localStorage.setItem("user", JSON.stringify(authData.user));
      
      await refreshProfile();

      if (authData.user.role === "ADMIN") {
        toast.success(`Hoş geldiniz Yönetici ${authData.user.username || ''}! 🛡️`);
      } else {
        toast.success(isSignup ? "Hesap başarıyla oluşturuldu!" : "Hoş geldiniz!");
      }

      window.location.href = "/dashboard";

    } catch (err: any) {
      // عرض رسالة الخطأ للمستخدم بشكل جميل
      toast.error(err.message || "İşlem başarısız.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8 lg:py-12">

        {/* Header */}
        <div className="text-center mb-8 lg:mb-10">
          <div className="flex justify-center items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl shadow-xl flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {APP_TITLE}
            </h1>
          </div>
          <p className="text-lg text-gray-600 mt-1">Yapay Zeka ile Regex Desenleri Oluşturun</p>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          
          {/* Left Side */}
          <div className="space-y-6 lg:space-y-8 order-2 lg:order-1">
            <div>
              <h2 className="text-4xl lg:text-5xl font-extrabold leading-tight">
                Karmaşık<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                  Regex’leri
                </span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-blue-600">
                  Bir Cümleyle
                </span>
                <br />
                <span className="text-5xl lg:text-6xl text-gray-900">Oluştur</span>
              </h2>
              <p className="text-md lg:text-lg text-gray-700 mt-4 leading-relaxed">
                Saatlerce dökümantasyon okumaya son.
                İstediğin eşleşmeyi tarif et, gerisini <span className="text-blue-600 font-bold">Aura</span> halletsin.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-4">
              {[
                { icon: Zap, title: "Hızlı & Akıllı", desc: "Saniyeler içinde sonuç" },
                { icon: Code2, title: "Canlı Test", desc: "Anında doğrulama" },
                { icon: ShieldCheck, title: "Güvenli", desc: "ReDoS koruması" },
              ].map((f, i) => (
                <div key={i} className="text-center p-4 bg-white/80 backdrop-blur rounded-xl shadow-md hover:shadow-lg transition cursor-pointer border border-gray-100">
                  <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center">
                    <f.icon className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-bold text-sm lg:text-md">{f.title}</h3>
                  <p className="text-gray-600 text-xs mt-1">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side Form */}
          <div className="order-1 lg:order-2">
            <Card className="max-w-md mx-auto bg-white/95 backdrop-blur-xl shadow-2xl rounded-2xl border-0 overflow-hidden">
              <div className="text-center pt-6 pb-4 lg:pt-8 lg:pb-6">
                <h3 className="text-3xl font-extrabold text-gray-900">
                  {isSignup ? "Hesap Oluştur" : "Giriş Yap"}
                </h3>
                <p className="text-md text-gray-600 mt-1">
                  {isSignup ? "Ücretsiz hesap oluştur" : "Hesabınla devam et"}
                </p>
              </div>

              <div className="px-6 pb-6 lg:px-8 lg:pb-8">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {isSignup && (
                    <div className="space-y-1">
                      <Label className="flex items-center gap-2 text-md text-gray-700">
                        <UserIcon className="w-4 h-4 text-purple-600" />
                        Kullanıcı Adı
                      </Label>
                      <Input
                        type="text"
                        placeholder="Örnek Kullanıcı"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="h-10 text-base border-2 focus:border-purple-500 transition"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <Label className="flex items-center gap-2 text-md text-gray-700">
                      <Mail className="w-4 h-4 text-purple-600" />
                      E-posta Adresi
                    </Label>
                    <Input
                      type="email"
                      placeholder="ornek@mail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-10 text-base border-2 focus:border-purple-500 transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="flex items-center gap-2 text-md text-gray-700">
                      <Lock className="w-4 h-4 text-purple-600" />
                      Şifre
                    </Label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-10 text-base border-2 focus:border-purple-500 transition"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 text-lg font-bold rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg transition-all duration-300 transform hover:scale-[1.01]"
                  >
                    {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : isSignup ? "Hesap Oluştur" : "Giriş Yap"}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-sm text-gray-600 hover:text-purple-600 transition"
                    onClick={() => {
                      setIsSignup(!isSignup);
                      setUsername("");
                    }}
                  >
                    {isSignup ? "Zaten hesabın var mı? Giriş yap" : "Yeni misin? Hemen kaydol"}
                  </Button>
                </form>
              </div>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-6 text-gray-500 mt-8">
          <p className="text-sm">© 2025 Hamed Mohamed</p>
          <p className="text-xs mt-1">Made with passion in Egypt & Türkiye</p>
        </div>
      </div>
    </div>
  );
}