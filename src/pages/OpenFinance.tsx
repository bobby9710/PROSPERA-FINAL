import { useState } from "react";
import { 
  Building2, 
  Link, 
  Link2Off, 
  RefreshCw, 
  Check, 
  X, 
  Plus,
  ArrowRight,
  Clock,
  AlertCircle,
  Crown,
  ChevronRight
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  useBankConnections, 
  useImportedTransactions, 
  useConnectBank, 
  useDisconnectBank,
  useSyncBank,
  useMatchTransaction,
  brazilianBanks 
} from "@/hooks/useOpenFinance";
import { useTransactions } from "@/hooks/useTransactions";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function OpenFinance() {
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [disconnectId, setDisconnectId] = useState<string | null>(null);
  const [selectedBank, setSelectedBank] = useState<string | null>(null);

  const { data: connections = [], isLoading: connectionsLoading } = useBankConnections();
  const { data: importedTransactions = [] } = useImportedTransactions();
  const { data: userTransactions = [] } = useTransactions();
  
  const connectBank = useConnectBank();
  const disconnectBank = useDisconnectBank();
  const syncBank = useSyncBank();
  const matchTransaction = useMatchTransaction();

  const pendingTransactions = importedTransactions.filter(t => t.status === "pending");
  const processedTransactions = importedTransactions.filter(t => t.status !== "pending");

  const handleConnectBank = async (bank: { code: string; name: string }) => {
    await connectBank.mutateAsync({ bankCode: bank.code, bankName: bank.name });
    setConnectDialogOpen(false);
    setSelectedBank(null);
  };

  const handleDisconnect = async () => {
    if (disconnectId) {
      await disconnectBank.mutateAsync(disconnectId);
      setDisconnectId(null);
    }
  };

  const findPossibleMatches = (imported: any) => {
    return userTransactions.filter(t => {
      const amountMatch = Math.abs(Number(t.amount) - Number(imported.amount)) <= Number(imported.amount) * 0.05;
      const dateMatch = Math.abs(new Date(t.date).getTime() - new Date(imported.date).getTime()) <= 2 * 24 * 60 * 60 * 1000;
      return amountMatch && dateMatch;
    }).slice(0, 3);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected":
        return <Badge className="bg-success/20 text-success">Conectado</Badge>;
      case "pending":
        return <Badge className="bg-warning/20 text-warning">Pendente</Badge>;
      case "error":
        return <Badge className="bg-destructive/20 text-destructive">Erro</Badge>;
      default:
        return <Badge variant="outline">Desconectado</Badge>;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">Open Finance</h1>
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                  <Crown className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
              </div>
              <p className="text-muted-foreground">Conecte seus bancos e importe transações automaticamente</p>
            </div>
          </div>
          
          <Dialog open={connectDialogOpen} onOpenChange={setConnectDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Conectar Banco
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Conectar Banco</DialogTitle>
                <DialogDescription>
                  Selecione seu banco para iniciar a conexão via Open Finance
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-2">
                  {brazilianBanks.map((bank) => (
                    <button
                      key={bank.code}
                      onClick={() => setSelectedBank(bank.code)}
                      className={cn(
                        "w-full flex items-center gap-3 p-4 rounded-lg border transition-colors",
                        selectedBank === bank.code
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted"
                      )}
                    >
                      <span className="text-2xl">{bank.logo}</span>
                      <span className="flex-1 text-left font-medium">{bank.name}</span>
                      {selectedBank === bank.code && (
                        <Check className="w-5 h-5 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </ScrollArea>
              <Button
                className="w-full mt-4"
                disabled={!selectedBank || connectBank.isPending}
                onClick={() => {
                  const bank = brazilianBanks.find(b => b.code === selectedBank);
                  if (bank) handleConnectBank(bank);
                }}
              >
                {connectBank.isPending ? "Conectando..." : "Conectar Banco"}
              </Button>
            </DialogContent>
          </Dialog>
        </div>

        {/* Connected Banks */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Bancos Conectados</CardTitle>
            <CardDescription>Gerencie suas conexões bancárias</CardDescription>
          </CardHeader>
          <CardContent>
            {connections.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Nenhum banco conectado ainda</p>
                <p className="text-sm text-muted-foreground">
                  Conecte seu primeiro banco para importar transações
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {connections.map((conn) => {
                  const bank = brazilianBanks.find(b => b.code === conn.bank_code);
                  return (
                    <div
                      key={conn.id}
                      className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg"
                    >
                      <span className="text-2xl">{bank?.logo || "🏦"}</span>
                      <div className="flex-1">
                        <p className="font-medium">{conn.bank_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Última sync: {conn.last_sync_at 
                            ? format(new Date(conn.last_sync_at), "dd/MM/yyyy HH:mm", { locale: ptBR })
                            : "Nunca"
                          }
                        </p>
                      </div>
                      {getStatusBadge(conn.status)}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => syncBank.mutate(conn.id)}
                          disabled={syncBank.isPending}
                        >
                          <RefreshCw className={cn("w-4 h-4", syncBank.isPending && "animate-spin")} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDisconnectId(conn.id)}
                        >
                          <Link2Off className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Imported Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Transações Importadas</CardTitle>
            <CardDescription>Revise e combine transações do banco</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pending">
              <TabsList className="mb-4">
                <TabsTrigger value="pending" className="gap-2">
                  <Clock className="w-4 h-4" />
                  Pendentes ({pendingTransactions.length})
                </TabsTrigger>
                <TabsTrigger value="processed" className="gap-2">
                  <Check className="w-4 h-4" />
                  Processadas ({processedTransactions.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending">
                {pendingTransactions.length === 0 ? (
                  <div className="text-center py-8">
                    <Check className="w-12 h-12 mx-auto text-success mb-3" />
                    <p className="text-muted-foreground">Nenhuma transação pendente</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingTransactions.map((trans) => {
                      const possibleMatches = findPossibleMatches(trans);
                      return (
                        <div
                          key={trans.id}
                          className="p-4 border border-border rounded-lg space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{trans.description}</p>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(trans.date), "dd/MM/yyyy", { locale: ptBR })}
                              </p>
                            </div>
                            <p className="font-bold text-lg">
                              R$ {Number(trans.amount).toFixed(2)}
                            </p>
                          </div>

                          {possibleMatches.length > 0 && (
                            <div className="bg-primary/5 rounded-lg p-3">
                              <p className="text-sm font-medium mb-2 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-primary" />
                                Possíveis correspondências encontradas
                              </p>
                              <div className="space-y-2">
                                {possibleMatches.map((match) => (
                                  <div
                                    key={match.id}
                                    className="flex items-center justify-between bg-background rounded p-2"
                                  >
                                    <div>
                                      <p className="text-sm font-medium">{match.description}</p>
                                      <p className="text-xs text-muted-foreground">
                                        R$ {Number(match.amount).toFixed(2)} - {format(new Date(match.date), "dd/MM", { locale: ptBR })}
                                      </p>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => matchTransaction.mutate({
                                        importedId: trans.id,
                                        transactionId: match.id,
                                        action: "match"
                                      })}
                                    >
                                      <Link className="w-4 h-4 mr-1" />
                                      Combinar
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => matchTransaction.mutate({
                                importedId: trans.id,
                                action: "create"
                              })}
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Criar Nova
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => matchTransaction.mutate({
                                importedId: trans.id,
                                action: "ignore"
                              })}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="processed">
                {processedTransactions.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">Nenhuma transação processada ainda</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {processedTransactions.map((trans) => (
                      <div
                        key={trans.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{trans.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(trans.date), "dd/MM/yyyy", { locale: ptBR })}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className="font-medium">R$ {Number(trans.amount).toFixed(2)}</p>
                          <Badge
                            className={cn(
                              trans.status === "matched" && "bg-success/20 text-success",
                              trans.status === "imported" && "bg-primary/20 text-primary",
                              trans.status === "ignored" && "bg-muted text-muted-foreground"
                            )}
                          >
                            {trans.status === "matched" && "Combinada"}
                            {trans.status === "imported" && "Importada"}
                            {trans.status === "ignored" && "Ignorada"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Disconnect Confirmation */}
      <AlertDialog open={!!disconnectId} onOpenChange={() => setDisconnectId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desconectar banco?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação removerá a conexão e todas as transações importadas deste banco.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDisconnect} className="bg-destructive text-destructive-foreground">
              Desconectar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
