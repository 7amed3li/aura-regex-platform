import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Eye, Copy, Check } from "lucide-react";
import { toast } from "sonner";

export default function GenerationLogs() {
  const { user } = useAuth();
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [copied, setCopied] = useState<number | null>(null);

  // Queries
  const { data: logs = [], isLoading: logsLoading } = trpc.generationLogs.list.useQuery();

  const handleCopyOutput = (output: string | null | undefined, logId: number) => {
    if (!output) {
      toast.error("لا يوجد نمط لنسخه");
      return;
    }
    navigator.clipboard.writeText(output);
    setCopied(logId);
    setTimeout(() => setCopied(null), 2000);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">سجل الإنشاء</h1>
          <p className="text-muted-foreground">عرض جميع أنماط Regex التي تم إنشاؤها</p>
        </div>

        {/* Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>سجل الأنماط المُنشأة</CardTitle>
            <CardDescription>
              {logs.length > 0 ? `لديك ${logs.length} نمط مُنشأ` : "لا توجد سجلات حتى الآن"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {logsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : logs.length > 0 ? (
              <div className="space-y-4">
                {logs.map((log, index) => (
                  <div
                    key={log.id}
                    className="border border-border rounded-lg p-4 hover:bg-muted/50 transition"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-muted-foreground">
                            #{index + 1}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(log.createdAt)}
                          </span>
                        </div>
                        <p className="text-foreground font-medium line-clamp-2">
                          الوصف: {log.input}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        {log.output && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyOutput(log.output, log.id)}
                            className="h-8 w-8 p-0"
                          >
                            {copied === log.id ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedLog(log)}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>تفاصيل السجل</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium text-foreground mb-2 block">
                                  الوصف (الإدخال)
                                </label>
                                <div className="bg-muted p-3 rounded text-sm text-foreground break-words">
                                  {log.input}
                                </div>
                              </div>

                              {log.output && (
                                <div>
                                  <label className="text-sm font-medium text-foreground mb-2 block">
                                    النمط المُنشأ (الإخراج)
                                  </label>
                                  <div className="bg-muted p-3 rounded font-mono text-sm text-foreground break-all">
                                    {log.output || ""}
                                  </div>
                                </div>
                              )}

                              {log.userFeedback && (
                                <div>
                                  <label className="text-sm font-medium text-foreground mb-2 block">
                                    تقييم المستخدم
                                  </label>
                                  <div className="bg-muted p-3 rounded text-sm text-foreground">
                                    {log.userFeedback}
                                  </div>
                                </div>
                              )}

                              <div>
                                <label className="text-sm font-medium text-foreground mb-2 block">
                                  التاريخ والوقت
                                </label>
                                <div className="bg-muted p-3 rounded text-sm text-foreground">
                                  {formatDate(log.createdAt)}
                                </div>
                              </div>

                              <Button
                                onClick={() => handleCopyOutput(log.output, log.id)}
                                className="w-full"
                                variant="default"
                              >
                                <Copy className="mr-2 w-4 h-4" />
                                نسخ النمط
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>

                    {log.output && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <code className="block bg-background p-2 rounded text-xs font-mono text-foreground break-all">
                          {log.output}
                        </code>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">لا توجد سجلات حتى الآن</p>
                <Button variant="outline" onClick={() => window.location.href = "/dashboard"}>
                  إنشاء نمط جديد
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
