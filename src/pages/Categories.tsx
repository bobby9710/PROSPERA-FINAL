import { useState } from "react";
import { Plus, Tag, Pencil, Trash2, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@/hooks/useCategories";
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

const categoryIcons = ["🍔", "🚗", "🏠", "🏥", "🎮", "🛍️", "📱", "📚", "💰", "💼", "📈", "🎁", "📦", "✈️", "🎬", "🏋️", "🐕", "💊"];
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

  const currentCategories = activeTab === "expense" ? expenseCategories : incomeCategories;
  const isLoading = expenseLoading || incomeLoading;

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setName("");
    setIcon("📦");
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
          />
        </TabsContent>

        <TabsContent value="income" className="mt-0">
          <CategoriesGrid 
            categories={incomeCategories || []} 
            isLoading={incomeLoading}
            onEdit={handleOpenEdit}
            onDelete={setDeleteId}
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
              <div className="flex flex-wrap gap-2">
                {categoryIcons.map((i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIcon(i)}
                    className={cn(
                      "w-10 h-10 rounded-lg text-xl flex items-center justify-center border-2 transition-colors",
                      icon === i ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                    )}
                  >
                    {i}
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
}

function CategoriesGrid({ categories, isLoading, onEdit, onDelete }: CategoriesGridProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-card rounded-2xl border border-border/50">
        <Tag className="w-12 h-12 mb-4 text-muted-foreground/50" />
        <p className="text-lg font-medium">Nenhuma categoria</p>
        <p className="text-sm">Crie sua primeira categoria clicando no botão acima</p>
      </div>
    );
  }

  return (
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
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ backgroundColor: `${category.color}20` }}
              >
                {category.icon}
              </div>
              <div>
                <h3 className="font-semibold">{category.name}</h3>
                {category.is_default && (
                  <span className="text-xs text-muted-foreground">Padrão</span>
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
  );
}
