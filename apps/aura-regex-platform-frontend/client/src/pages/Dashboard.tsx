import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Copy, Check, AlertCircle, Sparkles, Shield, Clock, FolderPlus, History, Coffee, GraduationCap, Trash2, Folder, Globe } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

// استيراد الدوال الحقيقية من ملف API الجديد
import {
  regexAIAPI,
  rulesAPI,
  foldersAPI,
  regexAPI,
  getErrorMessage,
  checkBackendHealth
} from "@/lib/api";

// --- تعريف الواجهات (Types) ---

interface Rule {
  id: string;
  name: string;
  regex: string; // Changed from pattern
  description?: string; // Changed from explanation
  naturalLang?: string; // Changed from naturalLanguageInput
  flags?: string; // Made optional
  folderId?: string; // ✅ Added folderId
  createdAt: string;
}

// توسيع واجهة المستخدم لتشمل lastSignedIn
interface DashboardUser {
  id: string;
  username: string;
  email: string;
  role: 'USER' | 'ADMIN'; // تأكدنا من الحروف الكبيرة كما في الباك اند
  lastSignedIn?: string;
}

// تنسيقات الأزرار الموحدة
const PRIMARY_GRADIENT_BUTTON = "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-95";
const SECONDARY_BUTTON = "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-purple-600 shadow-sm hover:shadow transition-all duration-300";

export default function Dashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const [, navigate] = useLocation();

  // State
  const [naturalLanguageInput, setNaturalLanguageInput] = useState("");
  const [generationType, setGenerationType] = useState<'DAILY' | 'ACADEMIC'>('DAILY'); // ✅ إضافة خيار النمط

  const [generatedRegex, setGeneratedRegex] = useState("");
  const [explanation, setExplanation] = useState("");
  const [testInput, setTestInput] = useState("");
  const [regexFlags, setRegexFlags] = useState("g");

  const [newRuleName, setNewRuleName] = useState("");

  const [newFolderName, setNewFolderName] = useState("");
  const [isPublic, setIsPublic] = useState(false); // 🌍 Public/Private Toggle

  const [selectedFolderId, setSelectedFolderId] = useState<string>(""); // For saving new rules
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null); // ✅ For filtering rules
  const [folders, setFolders] = useState<any[]>([]);

  const [testResults, setTestResults] = useState<string[]>([]);
  const [showTestResults, setShowTestResults] = useState(false);

  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [rules, setRules] = useState<Rule[]>([]);
  const [rulesLoading, setRulesLoading] = useState(true);

  const [backendAvailable, setBackendAvailable] = useState(true);
  const [backendError, setBackendError] = useState<string | null>(null);

  // تحويل المستخدم للنوع المحلي
  const currentUser = user as unknown as DashboardUser;

  // ********** Helper Functions **********

  // دالة تنسيق التاريخ (Last Login)
  const formatLastLogin = (dateString?: string) => {
    if (!dateString) return "İlk oturum";
    try {
      return new Date(dateString).toLocaleString('tr-TR', {
        month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    } catch (e) {
      return "Tarih hatası";
    }
  };

  // ✅ تحويل الرموز الأكاديمية إلى JS Regex للاختبار
  const convertAcademicRegex = (pattern: string): string => {
    // استبدال + بـ | (OR)
    // استبدال L = ... بـ ... (إزالة المقدمة)
    let jsRegex = pattern.replace(/^L\s*=\s*/, '');

    // استبدال + بـ | بشرط عدم وجود \ قبلها (escaped)
    jsRegex = jsRegex.replace(/(?<!\\)\+/g, '|');

    return jsRegex;
  };

  // ********** API Logic **********

  const checkHealth = useCallback(async () => {
    try {
      const isHealthy = await checkBackendHealth();
      setBackendAvailable(isHealthy);
      if (!isHealthy) {
        setBackendError('Sunucuya bağlanılamıyor. Lütfen bağlantınızı kontrol edin.');
      } else {
        setBackendError(null);
      }
    } catch (e) {
      setBackendAvailable(false);
    }
  }, []);

  const loadRules = useCallback(async () => {
    if (!backendAvailable || !user) return;
    try {
      setRulesLoading(true);
      const response = await rulesAPI.getAll();
      // التعامل بمرونة مع شكل البيانات القادم من Axios
      const fetchedRules = Array.isArray(response.data) ? response.data : (response.data.data || []);

      // ترتيب القواعد من الأحدث للأقدم
      fetchedRules.sort((a: Rule, b: Rule) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setRules(fetchedRules);
    } catch (error: any) {
      console.error("Load rules error:", error);
      // لا نظهر خطأ للمستخدم إذا كانت القائمة فارغة فقط
    } finally {
      setRulesLoading(false);
    }
  }, [user, backendAvailable]);

  const loadFolders = useCallback(async () => {
    if (!backendAvailable || !user) return;
    try {
      const response = await foldersAPI.getAll();
      setFolders(response.data || []);
    } catch (error) {
      console.warn("Folders load warning");
    }
  }, [user, backendAvailable]);

  const handleGenerateRegex = async () => {
    if (!naturalLanguageInput.trim()) {
      toast.warning("Lütfen bir açıklama girin");
      return;
    }

    try {
      setIsGenerating(true);
      // ✅ استخدام regexAIAPI من الملف الجديد مع تمرير النوع
      const response = await regexAIAPI.generate(naturalLanguageInput, generationType);
      const aiData = response.data;

      // دعم استجابة Gemini المباشرة أو المهيكلة
      const regexResult = aiData.regex || aiData.pattern;

      if (regexResult) {
        setGeneratedRegex(regexResult);
        setExplanation(aiData.explanation || "Yapay zeka açıklaması hazırlanıyor...");
        setBackendError(null);
        toast.success("Regex başarıyla oluşturuldu! ✨");
      } else {
        toast.error("Regex oluşturulamadı. Lütfen tekrar deneyin.");
      }
    } catch (error: any) {
      // محاكاة الذكاء الاصطناعي في حالة فشل الاتصال بـ Gemini (للغرض التجريبي)
      if (error.response?.status === 500) {
        const fallbackRegex = `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$`;
        setGeneratedRegex(fallbackRegex);
        setExplanation("⚠️ Demo Modu: Sunucu yanıt vermediği için örnek bir E-posta deseni gösteriliyor.");
        toast.info("Demo modu aktif edildi.");
      } else {
        toast.error(getErrorMessage(error));
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveRule = async () => {
    if (!newRuleName.trim() || !generatedRegex.trim()) {
      toast.warning("Lütfen bir isim ve regex deseni girin");
      return;
    }

    try {
      // ✅ DÜZELTME BURADA: Backend'in istediği tüm alanları gönderiyoruz
      // Backend: name, description, naturalLang, regex (pattern) istiyor
      await rulesAPI.create({
        name: newRuleName,
        pattern: generatedRegex, // Backend bunu 'regex' olarak bekliyor olabilir, api.ts'de map ediliyor
        naturalLanguageInput: naturalLanguageInput, // Backend bunu 'naturalLang' olarak bekliyor
        description: explanation || "Açıklama yok", // ✅ EKLENDİ: Zorunlu alan
        folderId: selectedFolderId || undefined, // ✅ Folder ID added
        flags: regexFlags,
        isPublic: isPublic, // ✅ Send public status
      });

      toast.success("Kural kütüphanenize kaydedildi 📚");
      setNewRuleName("");
      loadRules(); // تحديث القائمة
      loadFolders(); // ✅ تحديث المجلدات لتظهر الأعداد الجديدة
    } catch (error: any) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast.warning("Klasör adı boş olamaz");
      return;
    }
    try {
      await foldersAPI.create({ name: newFolderName });
      toast.success("Klasör oluşturuldu 📂");
      setNewFolderName("");
      loadFolders();
    } catch (e: any) {
      // ✅ Handle 409 Conflict specifically
      if (e.response && e.response.status === 409) {
        toast.error("Bu isimde bir klasör zaten var.");
      } else {
        toast.error(getErrorMessage(e));
      }
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (!confirm("Bu klasörü silmek istediğinize emin misiniz? İçindeki kurallar silinmeyecek.")) return;
    try {
      await foldersAPI.delete(folderId);
      toast.success("Klasör silindi.");
      loadFolders();
    } catch (e) {
      toast.error("Klasör silinemedi.");
    }
  };

  // ********** Effects **********
  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  useEffect(() => {
    if (user && backendAvailable) {
      loadRules();
      loadFolders();
    }
  }, [user, backendAvailable, loadRules, loadFolders]);

  // ********** Utilities **********
  const handleCopyRegex = () => {
    if (!generatedRegex) return;
    navigator.clipboard.writeText(generatedRegex);
    setCopied(true);
    toast.success("Kopyalandı!");
    setTimeout(() => setCopied(false), 2000);
  };

  const testRegex = async () => {
    if (!generatedRegex || !testInput) {
      toast.warning("Test metni giriniz");
      return;
    }
    try {
      // ✅ تحويل الـ Regex إذا كان في الوضع الأكاديمي
      let patternToTest = generatedRegex;
      if (generationType === 'ACADEMIC') {
        patternToTest = convertAcademicRegex(generatedRegex);
      }

      const response = await regexAPI.test(patternToTest, testInput, regexFlags);
      const matches = response.data.matches || [];

      setTestResults(matches);
      setShowTestResults(true);

      if (matches.length > 0) {
        toast.success(`${matches.length} eşleşme bulundu! 🎉`);
      } else {
        toast.info("Eşleşme bulunamadı.");
      }
    } catch (error: any) {
      toast.error("Regex testi başarısız.");
    }
  };

  // ********** Rendering **********

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <Loader2 className="w-16 h-16 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!user) {
    navigate("/", { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 lg:p-8 font-sans text-gray-900">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center shadow-inner">
              <Sparkles className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-gray-900">
                Aura <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Dashboard</span>
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-1">
                <span className="text-gray-500 font-medium">Hoş geldin, {currentUser.username || currentUser.email.split('@')[0]}</span>

                {/* ✅ ميزة Last Login الاحترافية */}
                {currentUser.lastSignedIn && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 animate-in fade-in">
                    <Clock className="w-3 h-3 mr-1" />
                    Son giriş: {formatLastLogin(currentUser.lastSignedIn)}
                  </span>
                )}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={() => logout()}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl px-5"
          >
            Çıkış Yap
          </Button>
        </div>

        {/* --- ERROR ALERT --- */}
        {backendError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-bold text-red-900">Bağlantı Sorunu</h3>
              <p className="text-sm text-red-700 mt-1">{backendError}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* --- LEFT COLUMN: GENERATOR (8 cols) --- */}
          <div className="lg:col-span-8 space-y-8">
            <Card className="rounded-3xl shadow-xl shadow-purple-100/50 border-0 overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500" />
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-xl font-bold text-gray-800">
                  <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
                  Yapay Zeka ile Oluştur
                </CardTitle>
                <CardDescription>İstediğiniz eşleşmeyi kendi cümlelerinizle anlatın.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">

                {/* ✅ أزرار اختيار النظام (يومي / أكاديمي) */}
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <button
                    onClick={() => setGenerationType('DAILY')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all duration-200 ${generationType === 'DAILY'
                      ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-sm'
                      : 'border-gray-100 bg-white text-gray-500 hover:bg-gray-50 hover:border-purple-200'
                      }`}
                  >
                    <Coffee className="w-5 h-5" />
                    <span className="font-bold text-sm">Günlük Kullanım</span>
                  </button>

                  <button
                    onClick={() => setGenerationType('ACADEMIC')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all duration-200 ${generationType === 'ACADEMIC'
                      ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                      : 'border-gray-100 bg-white text-gray-500 hover:bg-gray-50 hover:border-blue-200'
                      }`}
                  >
                    <GraduationCap className="w-5 h-5" />
                    <span className="font-bold text-sm">Akademik Mod</span>
                  </button>
                </div>

                <div className="relative">
                  <Textarea
                    placeholder={generationType === 'DAILY'
                      ? "Örn: Sadece @gmail.com ile biten e-posta adreslerini yakala..."
                      : "Örn: RFC 5322 standardına uygun e-posta formatı, IPv6 adresleri..."}
                    value={naturalLanguageInput}
                    onChange={(e) => setNaturalLanguageInput(e.target.value)}
                    className="min-h-[140px] rounded-2xl border-2 border-gray-100 focus:border-purple-400 focus:ring-4 focus:ring-purple-50 text-lg p-4 resize-none shadow-inner transition-all"
                    disabled={!backendAvailable}
                  />
                  <div className="absolute bottom-4 right-4">
                    <span className="text-xs text-gray-400 font-medium">{naturalLanguageInput.length} karakter</span>
                  </div>
                </div>

                <Button
                  onClick={handleGenerateRegex}
                  disabled={isGenerating || !backendAvailable}
                  className={`w-full h-14 text-lg font-bold rounded-2xl ${PRIMARY_GRADIENT_BUTTON}`}
                >
                  {isGenerating ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Sihir Yapılıyor...</span>
                    </div>
                  ) : (
                    "Regex Oluştur"
                  )}
                </Button>

                {/* Result Area */}
                {generatedRegex && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
                    <div className="bg-gray-900 rounded-2xl p-5 relative group overflow-hidden">
                      <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={handleCopyRegex}
                          className="h-8 bg-gray-800 text-white hover:bg-gray-700 border-gray-700"
                        >
                          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                      <p className="text-xs text-gray-400 font-mono mb-2">GENERATED PATTERN</p>
                      <code className="font-mono text-green-400 text-lg break-all block">
                        /{generatedRegex}/{regexFlags}
                      </code>
                    </div>

                    {explanation && (
                      <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 text-purple-900 text-sm leading-relaxed">
                        <span className="font-bold block mb-1">💡 AI Açıklaması:</span>
                        {explanation}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Input
                        placeholder="Kurala bir isim verin..."
                        value={newRuleName}
                        onChange={(e) => setNewRuleName(e.target.value)}
                        className="h-12 rounded-xl border-gray-200"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="isPublic"
                          checked={isPublic}
                          onChange={(e) => setIsPublic(e.target.checked)}
                          className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                        />
                        <label htmlFor="isPublic" className="text-sm text-gray-600 select-none cursor-pointer">
                          Toplulukla Paylaş (Public)
                        </label>
                      </div>
                      <Button onClick={handleSaveRule} disabled={!newRuleName} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
                        Kaydet
                      </Button>
                    </div>

                    {/* ✅ Folder Selection Dropdown */}
                    <div className="flex items-center gap-2 mt-2">
                      <FolderPlus className="w-4 h-4 text-gray-400" />
                      <select
                        value={selectedFolderId}
                        onChange={(e) => setSelectedFolderId(e.target.value)}
                        className="bg-transparent text-sm text-gray-600 focus:outline-none cursor-pointer hover:text-purple-600 transition-colors"
                      >
                        <option value="">Klasör Seç (İsteğe bağlı)</option>
                        {folders.map((folder) => (
                          <option key={folder.id} value={folder.id}>{folder.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 2. Live Testing Card */}
            {generatedRegex && (
              <Card className="rounded-3xl shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-green-600" />
                    Canlı Test
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <Input
                        placeholder="Test edilecek metni buraya yazın..."
                        value={testInput}
                        onChange={(e) => setTestInput(e.target.value)}
                        className="h-12 rounded-xl"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={regexFlags}
                        onChange={(e) => setRegexFlags(e.target.value)}
                        placeholder="Flags"
                        className="h-12 rounded-xl w-20 text-center font-mono"
                      />
                      <Button
                        onClick={testRegex}
                        className={`h-12 flex-1 rounded-xl ${SECONDARY_BUTTON}`}
                      >
                        Test Et
                      </Button>
                    </div>
                  </div>

                  {/* Test Results Section */}
                  {showTestResults && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-gray-700 flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-500" />
                          Test Sonuçları
                        </h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${testResults.length > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {testResults.length} Eşleşme
                        </span>
                      </div>

                      {testResults.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {testResults.map((match, index) => (
                            <span key={index} className="px-3 py-1.5 bg-white border border-purple-100 text-purple-700 rounded-lg text-sm font-mono shadow-sm">
                              {match}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">Bu metinde desenle eşleşen bir sonuç bulunamadı.</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* --- RIGHT COLUMN: SIDEBAR (4 cols) --- */}
          <div className="lg:col-span-4 space-y-6">

            <Card className="rounded-3xl border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Hızlı İşlemler</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Klasör adı..."
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    className="rounded-xl"
                  />
                  <Button size="icon" onClick={handleCreateFolder} className="rounded-xl shrink-0">
                    <FolderPlus className="w-5 h-5" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Button variant="outline" onClick={() => navigate("/rules")} className="h-20 flex-col gap-2 rounded-2xl hover:border-purple-300 hover:bg-purple-50">
                    <FolderPlus className="w-6 h-6 text-purple-600" />
                    <span>Kurallar</span>
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/logs")} className="h-20 flex-col gap-2 rounded-2xl hover:border-blue-300 hover:bg-blue-50">
                    <History className="w-6 h-6 text-blue-600" />
                    <span>Geçmiş</span>
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/community")} className="col-span-2 h-16 flex-row gap-3 rounded-2xl hover:border-indigo-300 hover:bg-indigo-50">
                    <Globe className="w-6 h-6 text-indigo-600" />
                    <span className="text-lg font-bold text-indigo-900">Topluluk</span>
                  </Button>
                </div>

                {/* ✅ Folder List Section */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-bold text-gray-500 mb-3 flex items-center gap-2">
                    <Folder className="w-4 h-4" />
                    Klasörlerim
                  </h4>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                    {folders.length > 0 ? (
                      folders.map(folder => (

                        <div
                          key={folder.id}
                          onClick={() => setActiveFolderId(activeFolderId === folder.id ? null : folder.id)}
                          className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${activeFolderId === folder.id ? 'bg-purple-100 border border-purple-200' : 'hover:bg-gray-50'
                            }`}
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <Folder className={`w-3.5 h-3.5 ${activeFolderId === folder.id ? 'text-purple-600' : 'text-purple-400'}`} />
                            <span className={`truncate font-medium ${activeFolderId === folder.id ? 'text-purple-900' : 'text-gray-700'}`}>
                              {folder.name}
                            </span>
                            <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
                              {folder.rules?.length || 0}
                            </span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteFolder(folder.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                            title="Klasörü Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 italic text-center py-2">Henüz klasör yok.</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center justify-between">
                  <div className="flex items-center">
                    <History className="w-5 h-5 mr-2 text-gray-500" />
                    {activeFolderId ? (
                      <span>
                        {folders.find(f => f.id === activeFolderId)?.name}
                        <span className="text-xs font-normal text-gray-400 ml-2">(Klasör)</span>
                      </span>
                    ) : (
                      "Son Kaydedilenler"
                    )}
                  </div>
                  {activeFolderId && (
                    <Button variant="ghost" size="sm" onClick={() => setActiveFolderId(null)} className="h-6 text-xs text-purple-600 hover:bg-purple-50">
                      Tümünü Göster
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {rulesLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                ) : rules.length > 0 ? (
                  <div className="space-y-3">
                    {rules
                      .filter(rule => !activeFolderId || rule.folderId === activeFolderId) // ✅ Filter by active folder
                      .slice(0, activeFolderId ? undefined : 4) // Show all if folder selected, else only 4
                      .map((rule) => (
                        <div
                          key={rule.id}
                          onClick={() => {
                            setGeneratedRegex(rule.regex);
                            setExplanation(rule.description || "Yüklendi.");
                            setNaturalLanguageInput(rule.naturalLang || "");
                            setNewRuleName(rule.name);
                            setRegexFlags(rule.flags || "g");
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="group p-3 rounded-2xl bg-gray-50 hover:bg-purple-50 border border-transparent hover:border-purple-100 transition-all cursor-pointer"
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-gray-800 group-hover:text-purple-700 truncate max-w-[180px]">{rule.name}</span>
                            <span className="text-[10px] text-gray-400 bg-white px-2 py-0.5 rounded-full border">/{rule.flags || 'g'}</span>
                          </div>
                          <code className="text-xs text-gray-500 truncate block font-mono bg-white px-2 py-1 rounded-lg">
                            {rule.regex}
                          </code>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <p className="text-sm">Henüz kural yok.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ✅ ADMİN BUTONU: DÜZELTİLDİ */}
            {currentUser.role === 'ADMIN' && (
              <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                <Shield className="w-16 h-16 text-white/10 absolute -right-4 -bottom-4" />
                <h3 className="font-bold text-lg mb-2">Yönetici Paneli</h3>
                <p className="text-sm text-gray-400 mb-4">Sistem ayarları ve kullanıcı yönetimi.</p>
                <Button
                  onClick={() => navigate("/admin")}
                  className="w-full bg-white text-gray-900 hover:bg-gray-100 rounded-xl font-bold"
                >
                  Giriş Yap
                </Button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}