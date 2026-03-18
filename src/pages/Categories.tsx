import { useState, useEffect } from "react";
import { Plus, Tag, Pencil, Trash2, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory, useSeedCategories } from "@/hooks/useCategories";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "sonner";

const EXPENSE_SVG_ICONS = [
  { file: "food.svg", name: "Alimentação" },
  { file: "bars_and_restaurants.svg", name: "Restaurantes" },
  { file: "transportation.svg", name: "Transporte" },
  { file: "home.svg", name: "Moradia" },
  { file: "health.svg", name: "Saúde" },
  { file: "entertainment.svg", name: "Lazer" },
  { file: "shopping.svg", name: "Compras" },
  { file: "clothing.svg", name: "Vestuário" },
  { file: "education.svg", name: "Educação" },
  { file: "pets.svg", name: "Pets" },
  { file: "work.svg", name: "Trabalho" },
  { file: "groceries.svg", name: "Mercado" },
  { file: "travel.svg", name: "Viagem" },
  { file: "investments.svg", name: "Investimentos" },
  { file: "personal_care.svg", name: "Cuidados" },
  { file: "subscriptions_and_services.svg", name: "Assinaturas" },
  { file: "family_and_children.svg", name: "Família" },
  { file: "taxes.svg", name: "Impostos" },
  { file: "debts_and_loans.svg", name: "Dívidas" },
  { file: "gifts_and_donations.svg", name: "Presentes" },
  { file: "other.svg", name: "Outros" }
];

const INCOME_SVG_ICONS = [
  { file: "salary.svg", name: "Salário" },
  { file: "earning_investments.svg", name: "Investimentos" },
  { file: "loans.svg", name: "Empréstimos" },
  { file: "other_earnings.svg", name: "Outros" }
];

const categoryColors = [
  "#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", 
  "#EC4899", "#6366F1", "#14B8A6", "#F97316", "#84CC16"
];

export default function Categories() {
  const [activeTab, setActiveTab] = useState<"expense" | "income">("expense");
  const [showDialog, setShowDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // Form state
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("📦");
  const [color, setColor] = useState(categoryColors[0]);

  const { data: expenseCategories, isLoading: expenseLoading } = useCategories("expense");
  const { data: incomeCategories, isLoading: incomeLoading } = useCategories("income");
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const seedCategories = useSeedCategories();

  const isLoading = expenseLoading || incomeLoading;

  // Auto-seed if premium catalog is incomplete (trigger if less than 21 premium categories)
  useEffect(() => {
    if (isLoading) return;
    
    const premiumCount = [...(expenseCategories || []), ...(incomeCategories || [])].filter(c => c.icon?.endsWith('.svg')).length;
    
    if (premiumCount < 21 && !seedCategories.isPending) {
      seedCategories.mutate();
    }
  }, [isLoading, expenseCategories, incomeCategories]);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setName("");
    setIcon(activeTab === "expense" ? "other.svg" : "other_earnings.svg");
    setColor(categoryColors[0]);
    setShowDialog(true);
  };

  const handleOpenEdit = (category: any) => {
    setEditingCategory(category);
    setName(category.name);
    setIcon(category.icon);
    setColor(category.color);
    setShowDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Digite o nome da categoria");
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({
          id: editingCategory.id,
          name,
          icon,
          color,
        });
        toast.success("Categoria atualizada!");
      } else {
        await createCategory.mutateAsync({
          name,
          icon,
          color,
          type: activeTab,
        });
        toast.success("Categoria criada!");
      }
      setShowDialog(false);
    } catch (error) {
      toast.error(editingCategory ? "Erro ao atualizar categoria" : "Erro ao criar categoria");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteCategory.mutateAsync(deleteId);
      toast.success("Categoria excluída!");
    } catch (error) {
      toast.error("Erro ao excluir categoria");
    }
    setDeleteId(null);
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 animate-fade-in">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Categorias</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas categorias de receitas e despesas
          </p>
        </div>
        <Button className="btn-gradient" onClick={handleOpenCreate}>
          <Plus className="w-5 h-5 mr-2" />
          Nova Categoria
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "expense" | "income")} className="animate-fade-in">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
          <TabsTrigger value="expense">Despesas</TabsTrigger>
          <TabsTrigger value="income">Receitas</TabsTrigger>
        </TabsList>

        <TabsContent value="expense" className="mt-0">
          <CategoriesGrid 
            categories={expenseCategories || []} 
            isLoading={expenseLoading}
            onEdit={handleOpenEdit}
            onDelete={setDeleteId}
            type="expense"
          />
        </TabsContent>

        <TabsContent value="income" className="mt-0">
          <CategoriesGrid 
            categories={incomeCategories || []} 
            isLoading={incomeLoading}
            onEdit={handleOpenEdit}
            onDelete={setDeleteId}
            type="income"
          />
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
            <DialogDescription>
              {editingCategory 
                ? "Atualize os dados da categoria." 
                : `Crie uma nova categoria de ${activeTab === "expense" ? "despesa" : "receita"}.`}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Alimentação, Salário..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Ícone</Label>
              <div className="grid grid-cols-5 sm:grid-cols-7 gap-2 max-h-48 overflow-y-auto p-1">
                {(activeTab === "expense" ? EXPENSE_SVG_ICONS : INCOME_SVG_ICONS).map((i) => (
                  <button
                    key={i.file}
                    type="button"
                    onClick={() => {
                      setIcon(i.file);
                      if (!name) setName(i.name);
                    }}
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all p-2",
                      icon === i.file ? "border-primary bg-primary/10 scale-110 shadow-sm" : "border-border/50 hover:border-primary/30 hover:bg-muted/50"
                    )}
                    title={i.name}
                  >
                    <img 
                      src={`/icons/categorias/${activeTab === "expense" ? "despesas" : "receitas"}/${i.file}`} 
                      alt={i.name}
                      className="w-full h-full object-contain"
                      style={{ filter: icon === i.file ? `drop-shadow(0 0 1px ${color})` : 'none' }}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="flex flex-wrap gap-2">
                {categoryColors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={cn(
                      "w-10 h-10 rounded-lg border-2 transition-all",
                      color === c ? "border-foreground scale-110" : "border-transparent"
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full btn-gradient" 
              disabled={createCategory.isPending || updateCategory.isPending}
            >
              {(createCategory.isPending || updateCategory.isPending) ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                editingCategory ? "Salvar Alterações" : "Criar Categoria"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A categoria será permanentemente excluída.
              Transações que usam esta categoria não serão afetadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}

interface CategoriesGridProps {
  categories: any[];
  isLoading: boolean;
  onEdit: (category: any) => void;
  onDelete: (id: string) => void;
  type: "expense" | "income";
}

function CategoriesGrid({ categories, isLoading, onEdit, onDelete, type }: CategoriesGridProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground bg-card/50 backdrop-blur-sm rounded-3xl border border-border/50 shadow-inner">
          <Loader2 className="w-10 h-10 animate-spin text-primary/30 mb-4" />
          <p className="text-xl font-bold text-foreground mb-2">Preparando suas categorias...</p>
          <p className="text-sm text-muted-foreground">Isso levará apenas um instante.</p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => (
            <div
              key={category.id}
              className="bg-card rounded-2xl border border-border/50 shadow-card p-4 hover:shadow-lg transition-all duration-300 animate-slide-up opacity-0"
              style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center p-2.5 shadow-sm"
                    style={{ backgroundColor: category.color }}
                  >
                    {category.icon?.endsWith('.svg') ? (
                      <img 
                        src={`/icons/categorias/${type === 'income' ? 'receitas' : 'despesas'}/${category.icon}`} 
                        alt={category.name}
                        className="w-full h-full object-contain brightness-0 invert"
                      />
                    ) : (
                      <span className="text-2xl text-white">{category.icon || "📦"}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold">{category.name}</h3>
                    {category.is_default && (
                      <span className="text-xs text-primary font-medium">Padrão</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => onEdit(category)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  {!category.is_default && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => onDelete(category.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
