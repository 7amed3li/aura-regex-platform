import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Copy, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { regexAIAPI, rulesAPI, foldersAPI, getErrorMessage, checkBackendHealth } from "@/lib/api";

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [naturalLanguageInput, setNaturalLanguageInput] = useState("");
  const [generatedRegex, setGeneratedRegex] = useState("");
  const [explanation, setExplanation] = useState("");
  const [testInput, setTestInput] = useState("");
  const [regexFlags, setRegexFlags] = useState("g");
  const [newRuleName, setNewRuleName] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [rules, setRules] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [rulesLoading, setRulesLoading] = useState(false);
  const [backendAvailable, setBackendAvailable] = useState(true);
  const [backendError, setBackendError] = useState<string | null>(null);

  // Check backend health on mount
  useEffect(() => {
    const checkHealth = async () => {
      const isHealthy = await checkBackendHealth();
      setBackendAvailable(isHealthy);
      if (!isHealthy) {
        setBackendError(
          'Backend sunucusu bağlanılamıyor. Lütfen http://localhost:8000 adresini kontrol edin.'
        );
      }
    };
    checkHealth();
  }, []);

  // Load rules and folders on mount
  useEffect(() => {
    if (user && backendAvailable) {
      loadRules();
      loadFolders();
    }
  }, [user, backendAvailable]);

  const loadRules = async () => {
    try {
      setRulesLoading(true);
      const response = await rulesAPI.getAll();
      setRules(response.data.data || []);
      setBackendError(null);
    } catch (error: any) {
      const errorMsg = getErrorMessage(error);
      console.error("Kurallar yüklenemedi:", errorMsg);
      setBackendError(errorMsg);
      setRules([]);
    } finally {
      setRulesLoading(false);
    }
  };

  const loadFolders = async () => {
    try {
      const response = await foldersAPI.getAll();
      setFolders(response.data.data || []);
      setBackendError(null);
    } catch (error: any) {
      const errorMsg = getErrorMessage(error);
      console.error("Klasörler yüklenemedi:", errorMsg);
      setBackendError(errorMsg);
      setFolders([]);
    }
  };

  const handleGenerateRegex = async () => {
    if (!naturalLanguageInput.trim()) {
      toast.error("Lütfen doğal dil açıklaması girin");
      return;
    }

    if (!backendAvailable) {
      toast.error(backendError || "Backend sunucusu bağlanılamıyor");
      return;
    }

    try {
      setIsGenerating(true);
      const response = await regexAIAPI.generate(naturalLanguageInput);
      
      if (response.data.success) {
        setGeneratedRegex(response.data.regex);
        setExplanation(response.data.explanation);
        setBackendError(null);
        toast.success("Regex başarıyla oluşturuldu");
      } else {
        toast.error(response.data.message || "Regex oluşturulamadı");
      }
    } catch (error: any) {
      const errorMsg = getErrorMessage(error);
      setBackendError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveRule = async () => {
    if (!newRuleName.trim() || !generatedRegex.trim()) {
      toast.error("Lütfen kural adı ve regex girin");
      return;
    }

    if (!backendAvailable) {
      toast.error(backendError || "Backend sunucusu bağlanılamıyor");
      return;
    }

    try {
      const response = await rulesAPI.create({
        name: newRuleName,
        pattern: generatedRegex,
        naturalLanguageInput,
        flags: regexFlags,
      });
      
      if (response.data.success) {
        toast.success("Kural başarıyla kaydedildi");
        setNewRuleName("");
        setGeneratedRegex("");
        setNaturalLanguageInput("");
        setExplanation("");
        setBackendError(null);
        loadRules();
      }
    } catch (error: any) {
      const errorMsg = getErrorMessage(error);
      setBackendError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error("Lütfen klasör adı girin");
      return;
    }

    if (!backendAvailable) {
      toast.error(backendError || "Backend sunucusu bağlanılamıyor");
      return;
    }

    try {
      const response = await foldersAPI.create({
        name: newFolderName,
      });
      
      if (response.data.success) {
        toast.success("Klasör başarıyla oluşturuldu");
        setNewFolderName("");
        setBackendError(null);
        loadFolders();
      }
    } catch (error: any) {
      const errorMsg = getErrorMessage(error);
      setBackendError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const handleCopyRegex = () => {
    navigator.clipboard.writeText(generatedRegex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const testRegex = () => {
    if (!generatedRegex || !testInput) {
      toast.error("Lütfen regex ve test metni girin");
      return;
    }

    try {
      const regex = new RegExp(generatedRegex, regexFlags);
      const matches = testInput.match(regex);
      if (matches) {
        toast.success(`${matches.length} eşleşme bulundu`);
      } else {
        toast.info("Eşleşme bulunamadı");
      }
    } catch (error: any) {
      toast.error(`Regex hatası: ${error.message}`);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Button onClick={() => navigate("/")} variant="outline">
          Giriş Yap
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Backend Error Alert */}
        {backendError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Backend Bağlantı Hatası</h3>
              <p className="text-sm text-red-800 mt-1">{backendError}</p>
              <p className="text-xs text-red-700 mt-2">
                💡 Çözüm: Backend sunucusunun çalıştığını kontrol edin: <code className="bg-red-100 px-2 py-1 rounded">npm run dev</code>
              </p>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  checkBackendHealth().then(isHealthy => {
                    setBackendAvailable(isHealthy);
                    if (isHealthy) {
                      setBackendError(null);
                      loadRules();
                      loadFolders();
                    }
                  });
                }}
                className="mt-2"
              >
                Tekrar Dene
              </Button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Regex Oluşturucu</h1>
            <p className="text-muted-foreground">Doğal dil açıklamasından regex oluşturun</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/")}>
            Çıkış Yap
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Regex Oluştur</CardTitle>
                <CardDescription>Doğal dil ile regex deseni tanımlayın</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Açıklama
                  </label>
                  <Textarea
                    placeholder="Örn: E-posta adresini eşleştir..."
                    value={naturalLanguageInput}
                    onChange={(e) => setNaturalLanguageInput(e.target.value)}
                    className="min-h-24"
                    disabled={!backendAvailable}
                  />
                </div>

                <Button
                  onClick={handleGenerateRegex}
                  disabled={isGenerating || !backendAvailable}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                      Oluşturuluyor...
                    </>
                  ) : (
                    "Regex Oluştur"
                  )}
                </Button>

                {generatedRegex && (
                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-foreground">Oluşturulan Desen:</label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyRegex}
                        className="h-8 w-8 p-0"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <code className="block bg-background p-3 rounded font-mono text-sm text-foreground break-all">
                      {generatedRegex}
                    </code>
                    {explanation && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <label className="text-sm font-medium text-foreground mb-2 block">Açıklama:</label>
                        <p className="text-sm text-muted-foreground">{explanation}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {generatedRegex && (
              <Card>
                <CardHeader>
                  <CardTitle>Regex Testi</CardTitle>
                  <CardDescription>Oluşturulan deseni test edin</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Test Metni
                    </label>
                    <Textarea
                      placeholder="Test etmek istediğiniz metni girin..."
                      value={testInput}
                      onChange={(e) => setTestInput(e.target.value)}
                      className="min-h-20"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Bayraklar
                    </label>
                    <Input
                      value={regexFlags}
                      onChange={(e) => setRegexFlags(e.target.value)}
                      placeholder="g, i, m, s, u, y"
                    />
                  </div>

                  <Button onClick={testRegex} className="w-full" variant="secondary">
                    Testi Çalıştır
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            {generatedRegex && (
              <Card>
                <CardHeader>
                  <CardTitle>Kuralı Kaydet</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input
                    placeholder="Kural adı..."
                    value={newRuleName}
                    onChange={(e) => setNewRuleName(e.target.value)}
                    disabled={!backendAvailable}
                  />
                  <Button 
                    onClick={handleSaveRule} 
                    className="w-full"
                    disabled={!backendAvailable}
                  >
                    <Plus className="mr-2 w-4 h-4" />
                    Kuralı Kaydet
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Yeni Klasör</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  placeholder="Klasör adı..."
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  disabled={!backendAvailable}
                />
                <Button 
                  onClick={handleCreateFolder} 
                  className="w-full" 
                  variant="secondary"
                  disabled={!backendAvailable}
                >
                  <Plus className="mr-2 w-4 h-4" />
                  Klasör Oluştur
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Son Kurallar</CardTitle>
              </CardHeader>
              <CardContent>
                {rulesLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                ) : rules.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {rules.slice(0, 5).map((rule) => (
                      <div
                        key={rule.id}
                        className="p-2 bg-muted rounded text-sm cursor-pointer hover:bg-muted/80 transition"
                        onClick={() => setGeneratedRegex(rule.pattern)}
                      >
                        <p className="font-medium text-foreground truncate">{rule.name}</p>
                        <code className="text-xs text-muted-foreground truncate block">
                          {rule.pattern}
                        </code>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {backendAvailable ? "Henüz kural yok" : "Backend bağlanılamıyor"}
                  </p>
                )}
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Button
                onClick={() => navigate("/rules")}
                className="w-full"
                variant="outline"
              >
                Kuralları Yönet
              </Button>
              <Button
                onClick={() => navigate("/logs")}
                className="w-full"
                variant="outline"
              >
                Günlükleri Görüntüle
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
