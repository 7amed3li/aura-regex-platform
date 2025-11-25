// ⚠️ ملاحظة: هذا الملف RulesPage.tsx الذي يقوم بتصحيح خطأ trim()
import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Edit2, Trash2, Plus, Copy, Check, Globe, Lock } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { rulesAPI } from "@/lib/api"; // ✅ Use centralized API

interface Rule {
  id: string;
  name: string;
  pattern: string; // Mapped from regex in API response if needed, but let's stick to what API returns
  regex?: string; // API returns regex
  flags?: string;
  isPublic: boolean; // ✅ Added isPublic
}

export default function RulesPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const [rules, setRules] = useState<Rule[]>([]);
  const [rulesLoading, setRulesLoading] = useState(true);

  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPattern, setEditPattern] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRules = async () => {
    try {
      setRulesLoading(true);
      const response = await rulesAPI.getAll();
      // Map backend response to interface if needed
      const mappedRules = response.data.map((r: any) => ({
        ...r,
        pattern: r.regex // Ensure pattern is available if used in UI
      }));
      setRules(mappedRules);
    } catch (error: any) {
      console.error("Error fetching rules:", error);
      toast.error("Kurallar yüklenemedi.");
      setRules([]);
    } finally {
      setRulesLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchRules();
  }, [user]);

  const handleEdit = (ruleId: string, name: string, pattern: string) => {
    setEditingRuleId(ruleId);
    setEditName(name);
    setEditPattern(pattern);
  };

  const handleSaveEdit = async () => {
    if (!editName || !editPattern || !editName.trim() || !editPattern.trim()) {
      toast.error("Lütfen tüm alanları doldurun");
      return;
    }

    setIsSubmitting(true);
    try {
      await rulesAPI.update(editingRuleId!, {
        name: editName,
        regex: editPattern // Backend expects regex
      });

      toast.success("Kural başarıyla güncellendi");
      setEditingRuleId(null);
      fetchRules();
    } catch (error: any) {
      toast.error("Kural güncellenemedi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (ruleId: string) => {
    if (confirm("Bu kuralı silmek istediğinizden emin misiniz?")) {
      setIsSubmitting(true);
      try {
        await rulesAPI.delete(ruleId);
        toast.success("Kural başarıyla silindi");
        fetchRules();
      } catch (error: any) {
        toast.error("Kural silinemedi");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleToggleVisibility = async (ruleId: string, currentStatus: boolean) => {
    try {
      await rulesAPI.toggleVisibility(ruleId, !currentStatus);
      toast.success(currentStatus ? "Kural gizlendi (Private)" : "Kural paylaşıldı (Public) 🌍");
      fetchRules();
    } catch (error) {
      toast.error("Durum değiştirilemedi.");
    }
  };

  const handleCopyPattern = (pattern: string, ruleId: string) => {
    navigator.clipboard.writeText(pattern);
    setCopied(ruleId);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Kuralları Yönet</h1>
            <p className="text-muted-foreground">Kaydedilmiş regex kurallarını görüntüleyin, düzenleyin ve paylaşın</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            Geri Dön
          </Button>
        </div>

        {/* Rules Table */}
        <Card>
          <CardHeader>
            <CardTitle>Kaydedilmiş Kurallar</CardTitle>
            <CardDescription>
              {rules.length > 0 ? `${rules.length} kaydedilmiş kuralınız var` : "Henüz kaydedilmiş kural yok"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {rulesLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : rules.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Ad</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Desen</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Durum</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rules.map((rule) => (
                      <tr key={rule.id} className="border-b border-border hover:bg-muted/50 transition">
                        <td className="py-4 px-4 text-foreground font-medium">{rule.name}</td>
                        <td className="py-4 px-4">
                          <code className="bg-muted p-2 rounded text-sm font-mono text-foreground break-all">
                            {rule.pattern || rule.regex}
                          </code>
                        </td>
                        <td className="py-4 px-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleVisibility(rule.id, rule.isPublic)}
                            className={`gap-2 ${rule.isPublic ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100' : 'text-gray-500 hover:bg-gray-100'}`}
                          >
                            {rule.isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                            {rule.isPublic ? "Public" : "Private"}
                          </Button>
                        </td>
                        <td className="py-4 px-4 space-x-2 flex">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyPattern(rule.pattern || rule.regex || "", rule.id)}
                            className="h-8 w-8 p-0"
                          >
                            {copied === rule.id ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(rule.id, rule.name, rule.pattern || rule.regex || "")}
                                className="h-8 w-8 p-0"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Kuralı Düzenle</DialogTitle>
                                <CardDescription className="sr-only">Kural adını ve desenini düzenle</CardDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium text-foreground mb-2 block">
                                    Ad
                                  </label>
                                  <Input
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    placeholder="Kural adı"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-foreground mb-2 block">
                                    Desen
                                  </label>
                                  <Textarea
                                    value={editPattern}
                                    onChange={(e) => setEditPattern(e.target.value)}
                                    placeholder="Regex deseni"
                                    className="font-mono"
                                  />
                                </div>
                                <Button
                                  onClick={handleSaveEdit}
                                  disabled={isSubmitting}
                                  className="w-full"
                                >
                                  {isSubmitting ? (
                                    <>
                                      <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                                      Kaydediliyor...
                                    </>
                                  ) : (
                                    "Değişiklikleri Kaydet"
                                  )}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(rule.id)}
                            disabled={isSubmitting}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                          >
                            {isSubmitting ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Henüz kaydedilmiş kural yok</p>
                <Button variant="outline" onClick={() => navigate("/dashboard")}>
                  <Plus className="mr-2 w-4 h-4" />
                  Yeni Kural Oluştur
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}