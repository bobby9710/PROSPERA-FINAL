import { useState, useRef } from "react";
import {
  Camera,
  Upload,
  Loader2,
  Check,
  X,
  Receipt,
  Calendar,
  Store,
  CreditCard,
  Crown,
  ShoppingCart,
  FileImage,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useCategories } from "@/hooks/useCategories";
import { useCreateTransaction } from "@/hooks/useTransactions";
import { useCreditCards } from "@/hooks/useCreditCards";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ScanResult {
  success: boolean;
  data?: {
    amount: number | null;
    date: string | null;
    establishment: string | null;
    items: Array<{ name: string; quantity: number; price: number }> | null;
    paymentMethod: string | null;
    cnpj: string | null;
  };
  confidence?: number;
  error?: string;
}

// Category keyword mappings for auto-suggestion
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Alimentação': ['restaurante', 'lanchonete', 'pizzaria', 'padaria', 'açougue', 'mercado', 'supermercado', 'hortifruti', 'cafeteria', 'bar', 'churrascaria', 'sushi', 'hamburgueria', 'food', 'burger', 'pizza', 'lanches', 'delivery', 'ifood', 'rappi'],
  'Transporte': ['posto', 'combustivel', 'gasolina', 'etanol', 'uber', '99', 'cabify', 'estacionamento', 'parking', 'pedágio', 'onibus', 'metro', 'trem', 'ipiranga', 'shell', 'petrobras', 'br distribuidora'],
  'Saúde': ['farmacia', 'drogaria', 'hospital', 'clinica', 'laboratorio', 'consultorio', 'medico', 'dentista', 'otica', 'drogasil', 'pacheco', 'raia', 'panvel', 'ultrafarma'],
  'Compras': ['magazine', 'loja', 'shopping', 'outlet', 'amazon', 'mercadolivre', 'shopee', 'americanas', 'casas bahia', 'extra', 'carrefour', 'atacadao', 'assai', 'makro', 'construcao', 'material', 'ferragem'],
  'Lazer': ['cinema', 'teatro', 'show', 'ingresso', 'parque', 'clube', 'academia', 'fitness', 'gym', 'netflix', 'spotify', 'disney', 'hbo', 'prime', 'games', 'steam'],
  'Moradia': ['energia', 'eletrica', 'agua', 'saneamento', 'gas', 'aluguel', 'condominio', 'iptu', 'enel', 'cemig', 'copel', 'celesc', 'sabesp', 'cedae'],
  'Educação': ['escola', 'faculdade', 'universidade', 'curso', 'livro', 'livraria', 'papelaria', 'saraiva', 'cultura', 'udemy', 'coursera', 'alura'],
  'Assinaturas': ['netflix', 'spotify', 'amazon prime', 'disney', 'hbo', 'globoplay', 'deezer', 'youtube', 'apple', 'microsoft', 'google', 'icloud'],
};

function suggestCategory(establishment: string, categories: Array<{ id: string; name: string; type: string }>): string | null {
  const lowerEstablishment = establishment.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  for (const [categoryName, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      const normalizedKeyword = keyword.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (lowerEstablishment.includes(normalizedKeyword)) {
        const matchedCategory = categories.find(
          c => c.name.toLowerCase() === categoryName.toLowerCase() && c.type === 'expense'
        );
        if (matchedCategory) {
          return matchedCategory.id;
        }
      }
    }
  }
  return null;
}

export default function Scanner() {
  const [image, setImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state for editing extracted data
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [creditCardId, setCreditCardId] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const { data: categories = [] } = useCategories();
  const { data: creditCards = [] } = useCreditCards();
  const createTransaction = useCreateTransaction();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione uma imagem.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target?.result as string);
      setScanResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleScan = async () => {
    if (!image) return;

    setIsScanning(true);
    try {
      const { data, error } = await supabase.functions.invoke("scan-receipt", {
        body: { imageBase64: image },
      });

      if (error) throw error;

      setScanResult(data);

      if (data.success && data.data) {
        // Populate form with extracted data
        if (data.data.amount) setAmount(data.data.amount.toString());
        if (data.data.date) setDate(data.data.date);
        if (data.data.establishment) {
          setDescription(data.data.establishment);
          
          // Auto-suggest category based on establishment name
          const suggestedCategoryId = suggestCategory(data.data.establishment, categories);
          if (suggestedCategoryId) {
            setCategoryId(suggestedCategoryId);
          }
        }
        if (data.data.paymentMethod) {
          const method = data.data.paymentMethod === "credit_card" ? "credit" : 
                        data.data.paymentMethod === "debit_card" ? "debit" : 
                        data.data.paymentMethod;
          setPaymentMethod(method);
        }

        const suggestedMsg = categoryId ? " Categoria sugerida automaticamente." : "";
        toast({
          title: "Comprovante escaneado!",
          description: `Confiança: ${Math.round((data.confidence || 0) * 100)}%${suggestedMsg}`,
        });
      } else {
        toast({
          title: "Erro no escaneamento",
          description: data.error || "Não foi possível extrair os dados.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Scan error:", error);
      toast({
        title: "Erro ao escanear",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleSave = async () => {
    if (!amount || !description) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o valor e a descrição.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await createTransaction.mutateAsync({
        type: "expense",
        amount: parseFloat(amount),
        description,
        category_id: categoryId || undefined,
        date: date || format(new Date(), "yyyy-MM-dd"),
        payment_method: paymentMethod || undefined,
        credit_card_id: paymentMethod === "credit" ? creditCardId : undefined,
      });

      toast({
        title: "Transação salva!",
        description: "A despesa foi registrada com sucesso.",
      });

      // Reset form
      setImage(null);
      setScanResult(null);
      setAmount("");
      setDate("");
      setDescription("");
      setCategoryId("");
      setPaymentMethod("");
      setCreditCardId("");
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "Erro ao salvar",
        description: "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setScanResult(null);
    setAmount("");
    setDate("");
    setDescription("");
    setCategoryId("");
    setPaymentMethod("");
    setCreditCardId("");
  };

  const expenseCategories = categories.filter(c => c.type === "expense");

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Camera className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">Scanner de Comprovantes</h1>
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                <Crown className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            </div>
            <p className="text-muted-foreground">Digitalize notas e recibos com IA</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Area */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Enviar Comprovante</CardTitle>
              <CardDescription>
                Tire uma foto ou faça upload de um comprovante
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!image ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-xl p-12 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  <FileImage className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">Clique para enviar</p>
                  <p className="text-sm text-muted-foreground">
                    Suporta JPG, PNG e HEIC
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-xl overflow-hidden">
                    <img
                      src={image}
                      alt="Comprovante"
                      className="w-full max-h-[400px] object-contain bg-muted"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={handleReset}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {!scanResult && (
                    <Button
                      className="w-full gap-2"
                      onClick={handleScan}
                      disabled={isScanning}
                    >
                      {isScanning ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Escaneando...
                        </>
                      ) : (
                        <>
                          <Camera className="w-4 h-4" />
                          Escanear Comprovante
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Extracted Data / Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Dados Extraídos
              </CardTitle>
              <CardDescription>
                Revise e edite os dados antes de salvar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {scanResult?.success && scanResult.data?.items && scanResult.data.items.length > 0 && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <ShoppingCart className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Itens identificados</span>
                  </div>
                  <div className="space-y-1">
                    {scanResult.data.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {item.quantity}x {item.name}
                        </span>
                        <span>R$ {item.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Receipt className="w-4 h-4" />
                    Valor
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">R$</span>
                    <Input
                      type="number"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0,00"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Data
                  </Label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Store className="w-4 h-4" />
                  Estabelecimento
                </Label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Nome da loja ou descrição"
                />
              </div>

              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Forma de Pagamento
                </Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Dinheiro</SelectItem>
                    <SelectItem value="debit">Débito</SelectItem>
                    <SelectItem value="credit">Crédito</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {paymentMethod === "credit" && creditCards.length > 0 && (
                <div className="space-y-2">
                  <Label>Cartão de Crédito</Label>
                  <Select value={creditCardId} onValueChange={setCreditCardId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o cartão" />
                    </SelectTrigger>
                    <SelectContent>
                      {creditCards.map((card) => (
                        <SelectItem key={card.id} value={card.id}>
                          {card.name} •••• {card.last_digits}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleReset}
                >
                  Limpar
                </Button>
                <Button
                  className="flex-1 gap-2"
                  onClick={handleSave}
                  disabled={isSaving || !amount || !description}
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Salvar Transação
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tips */}
        <Card className="bg-muted/30">
          <CardContent className="pt-6">
            <h3 className="font-medium mb-3">💡 Dicas para melhores resultados</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Tire a foto em ambiente bem iluminado</li>
              <li>• Certifique-se de que o texto está legível</li>
              <li>• Inclua toda a nota/recibo na imagem</li>
              <li>• Evite reflexos e sombras sobre o papel</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
