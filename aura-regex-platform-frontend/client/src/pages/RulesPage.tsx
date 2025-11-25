import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Edit2, Trash2, Plus, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function RulesPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [editingRuleId, setEditingRuleId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editPattern, setEditPattern] = useState("");
  const [copied, setCopied] = useState<number | null>(null);

  // Queries
  const { data: rules = [], isLoading: rulesLoading, refetch: refetchRules } = trpc.rules.list.useQuery();

  // Mutations
  const updateRuleMutation = trpc.rules.update.useMutation({
    onSuccess: () => {
      toast.success("Kural başarıyla güncellendi");
      setEditingRuleId(null);
      refetchRules();
    },
    onError: (error) => {
      toast.error(`Hata: ${error.message}`);
    },
  });

  const deleteRuleMutation = trpc.rules.delete.useMutation({
    onSuccess: () => {
      toast.success("Kural başarıyla silindi");
      refetchRules();
    },
    onError: (error) => {
      toast.error(`Hata: ${error.message}`);
    },
  });

  const handleEdit = (ruleId: number, name: string, pattern: string) => {
    setEditingRuleId(ruleId);
    setEditName(name);
    setEditPattern(pattern);
  };

  const handleSaveEdit = async () => {
    if (!editName.trim() || !editPattern.trim()) {
      toast.error("Lütfen tüm alanları doldurun");
      return;
    }

    try {
      await updateRuleMutation.mutateAsync({
        id: editingRuleId!,
        name: editName,
        pattern: editPattern,
      });
    } catch (error) {
      toast.error("Kural güncellenemedi");
    }
  };

  const handleDelete = async (ruleId: number) => {
    if (confirm("Bu kuralı silmek istediğinizden emin misiniz?")) {
      try {
        await deleteRuleMutation.mutateAsync(ruleId);
      } catch (error) {
        toast.error("Kural silinemedi");
      }
    }
  };

  const handleCopyPattern = (pattern: string, ruleId: number) => {
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
            <p className="text-muted-foreground">Kaydedilmiş regex kurallarını görüntüleyin, düzenleyin ve silin</p>
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
                      <th className="text-left py-3 px-4 font-semibold text-foreground">Seçenekler</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rules.map((rule) => (
                      <tr key={rule.id} className="border-b border-border hover:bg-muted/50 transition">
                        <td className="py-4 px-4 text-foreground font-medium">{rule.name}</td>
                        <td className="py-4 px-4">
                          <code className="bg-muted p-2 rounded text-sm font-mono text-foreground break-all">
                            {rule.pattern}
                          </code>
                        </td>
                        <td className="py-4 px-4 text-sm text-muted-foreground">
                          {rule.flags || "g"}
                        </td>
                        <td className="py-4 px-4 space-x-2 flex">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyPattern(rule.pattern, rule.id)}
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
                                onClick={() => handleEdit(rule.id, rule.name, rule.pattern)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Kuralı Düzenle</DialogTitle>
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
                                  disabled={updateRuleMutation.isPending}
                                  className="w-full"
                                >
                                  {updateRuleMutation.isPending ? (
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
                            disabled={deleteRuleMutation.isPending}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                          >
                            {deleteRuleMutation.isPending ? (
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
