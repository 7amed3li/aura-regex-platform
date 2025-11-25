import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Zap, Code2, BookOpen, ArrowRight } from "lucide-react";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { useLocation } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Code2 className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{APP_TITLE}</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">Hoşgeldiniz, {user.name}</span>
              <Button
                onClick={() => {
                  logout();
                }}
                variant="outline"
              >
                Çıkış Yap
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Welcome Card */}
            <Card className="md:col-span-2 bg-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-3xl">Aura Regex Platformu'na Hoşgeldiniz</CardTitle>
                <CardDescription className="text-lg mt-2">
                  Yapay zeka kullanarak regex desenleri oluşturun, test edin ve yönetin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => navigate("/dashboard")}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Kontrol Paneline Git
                  <ArrowRight className="mr-2 w-5 h-5" />
                </Button>
              </CardContent>
            </Card>

            {/* Features */}
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Ana Özellikler
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Yapay Zeka ile Oluştur</h4>
                    <p className="text-sm text-gray-600">Doğal dil açıklamasından regex deseni oluşturun</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Anında Test</h4>
                    <p className="text-sm text-gray-600">Desenleri test edin ve eşleşmeleri vurgulayın</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Kaydet ve Düzenle</h4>
                    <p className="text-sm text-gray-600">Kurallarınızı klasörlerde organize edin</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Start */}
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-500" />
                  Hızlı Başlangıç
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Adım 1: Kontrol Paneline Git</h4>
                  <p className="text-gray-600">Yukarıdaki düğmeye tıklayın</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Adım 2: Açıklama Girin</h4>
                  <p className="text-gray-600">Ne eşleştirmek istediğinizi yazın</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Adım 3: Test ve Kaydet</h4>
                  <p className="text-gray-600">Deseni test edin ve kaydedin</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <Card className="bg-white border-0 shadow-lg text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-blue-600">∞</div>
                <p className="text-gray-600 text-sm mt-2">Sınırsız Desen</p>
              </CardContent>
            </Card>
            <Card className="bg-white border-0 shadow-lg text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-green-600">⚡</div>
                <p className="text-gray-600 text-sm mt-2">Anında Oluştur</p>
              </CardContent>
            </Card>
            <Card className="bg-white border-0 shadow-lg text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-purple-600">🔒</div>
                <p className="text-gray-600 text-sm mt-2">Güvenli ve Güvenilir</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <Code2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{APP_TITLE}</h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Left Side - Features */}
          <div className="space-y-6">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Regex Desenleri Kolayca Oluşturun
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Yapay zeka kullanarak karmaşık regex desenleri basit açıklamalardan oluşturun
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Hızlı Oluşturma</h3>
                  <p className="text-sm text-gray-600">Saniyeler içinde regex desenleri alın</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Code2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">İnteraktif Test</h3>
                  <p className="text-sm text-gray-600">Desenleri test edin ve eşleşmeleri görün</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Kaydet ve Yönet</h3>
                  <p className="text-sm text-gray-600">Kurallarınızı klasörlerde organize edin</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Card */}
          <div className="flex items-center justify-center">
            <Card className="w-full bg-white border-0 shadow-2xl">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Hoşgeldiniz</CardTitle>
                <CardDescription>
                  Regex desenleri oluşturmaya başlayın
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => {
                    window.location.href = getLoginUrl();
                  }}
                  size="lg"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-base h-12"
                >
                  Giriş Yap
                </Button>
                <p className="text-center text-sm text-gray-600">
                  Hesabınız yoksa ilk girişte otomatik olarak oluşturulacak
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-600 text-sm">
          <p>© 2024 Aura Regex Platformu. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </div>
  );
}
