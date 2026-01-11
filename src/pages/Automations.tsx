import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAutomations, TRIGGER_TYPES, ACTION_TYPES } from "@/hooks/useAutomations";
import { useCategories } from "@/hooks/useCategories";
import { useGoals } from "@/hooks/useGoals";
import { 
  Zap, 
  Plus, 
  Trash2, 
  ArrowRight, 
  Crown,
  Settings,
  Bell,
  Tag,
  Target,
  Layers
} from "lucide-react";

const EXAMPLE_RULES = [
  { trigger: 'description_contains', triggerValue: 'Uber', action: 'change_category', description: '"Uber" → categoria "Transporte"' },
  { trigger: 'amount_greater', triggerValue: '500', action: 'send_notification', description: 'Valor > R$ 500 → notificar' },
  { trigger: 'description_contains', triggerValue: 'Mercado', action: 'add_tag', description: '"Mercado" → tag "essencial"' },
];

export default function Automations() {
  const { rules, loadingRules, createRule, toggleRule, deleteRule } = useAutomations();
  const { data: categories = [] } = useCategories();
  const { data: goals = [] } = useGoals();
  const [isOpen, setIsOpen] = useState(false);
  const [newRule, setNewRule] = useState({
    name: "",
    trigger_type: "new_transaction",
    trigger_value: "",
    action_type: "send_notification",
    action_value: "",
    is_active: true,
  });

  const handleCreate = () => {
    createRule.mutate({
      name: newRule.name || `Regra ${rules.length + 1}`,
      trigger_type: newRule.trigger_type,
      trigger_value: newRule.trigger_value || null,
      action_type: newRule.action_type,
      action_value: newRule.action_value || null,
      is_active: newRule.is_active,
    });
    setIsOpen(false);
    setNewRule({
      name: "",
      trigger_type: "new_transaction",
      trigger_value: "",
      action_type: "send_notification",
      action_value: "",
      is_active: true,
    });
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case "change_category": return <Layers className="h-4 w-4" />;
      case "add_tag": return <Tag className="h-4 w-4" />;
      case "send_notification": return <Bell className="h-4 w-4" />;
      case "add_to_goal": return <Target className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const needsTriggerValue = ["amount_greater", "category_equals", "description_contains"].includes(newRule.trigger_type);
  const needsActionValue = ["change_category", "add_tag", "add_to_goal"].includes(newRule.action_type);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 rounded-full p-2">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                Automações
                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
                  <Crown className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              </h1>
              <p className="text-muted-foreground">Automatize a categorização das suas transações</p>
            </div>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Regra
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Criar Nova Automação</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Nome da Regra</Label>
                  <Input
                    value={newRule.name}
                    onChange={e => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Categorizar Uber"
                  />
                </div>

                {/* Trigger Section */}
                <Card className="bg-muted/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Quando (Gatilho)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Select
                      value={newRule.trigger_type}
                      onValueChange={v => setNewRule(prev => ({ ...prev, trigger_type: v, trigger_value: "" }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TRIGGER_TYPES.map(t => (
                          <SelectItem key={t.value} value={t.value}>
                            <div>
                              <p>{t.label}</p>
                              <p className="text-xs text-muted-foreground">{t.description}</p>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {needsTriggerValue && (
                      <>
                        {newRule.trigger_type === "amount_greater" && (
                          <div>
                            <Label className="text-xs">Valor (R$)</Label>
                            <Input
                              type="number"
                              value={newRule.trigger_value}
                              onChange={e => setNewRule(prev => ({ ...prev, trigger_value: e.target.value }))}
                              placeholder="500"
                            />
                          </div>
                        )}
                        {newRule.trigger_type === "category_equals" && (
                          <div>
                            <Label className="text-xs">Categoria</Label>
                            <Select
                              value={newRule.trigger_value}
                              onValueChange={v => setNewRule(prev => ({ ...prev, trigger_value: v }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map(cat => (
                                  <SelectItem key={cat.id} value={cat.id}>
                                    {cat.icon} {cat.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        {newRule.trigger_type === "description_contains" && (
                          <div>
                            <Label className="text-xs">Texto</Label>
                            <Input
                              value={newRule.trigger_value}
                              onChange={e => setNewRule(prev => ({ ...prev, trigger_value: e.target.value }))}
                              placeholder="Uber, iFood, Netflix..."
                            />
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Arrow */}
                <div className="flex justify-center">
                  <ArrowRight className="h-6 w-6 text-muted-foreground" />
                </div>

                {/* Action Section */}
                <Card className="bg-muted/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Então (Ação)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Select
                      value={newRule.action_type}
                      onValueChange={v => setNewRule(prev => ({ ...prev, action_type: v, action_value: "" }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ACTION_TYPES.map(a => (
                          <SelectItem key={a.value} value={a.value}>
                            <div>
                              <p>{a.label}</p>
                              <p className="text-xs text-muted-foreground">{a.description}</p>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {needsActionValue && (
                      <>
                        {newRule.action_type === "change_category" && (
                          <div>
                            <Label className="text-xs">Nova Categoria</Label>
                            <Select
                              value={newRule.action_value}
                              onValueChange={v => setNewRule(prev => ({ ...prev, action_value: v }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map(cat => (
                                  <SelectItem key={cat.id} value={cat.id}>
                                    {cat.icon} {cat.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        {newRule.action_type === "add_tag" && (
                          <div>
                            <Label className="text-xs">Nome da Tag</Label>
                            <Input
                              value={newRule.action_value}
                              onChange={e => setNewRule(prev => ({ ...prev, action_value: e.target.value }))}
                              placeholder="essencial, lazer, etc."
                            />
                          </div>
                        )}
                        {newRule.action_type === "add_to_goal" && (
                          <div>
                            <Label className="text-xs">Meta</Label>
                            <Select
                              value={newRule.action_value}
                              onValueChange={v => setNewRule(prev => ({ ...prev, action_value: v }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent>
                                {goals.filter(g => g.status === "active").map(goal => (
                                  <SelectItem key={goal.id} value={goal.id}>
                                    {goal.icon} {goal.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>

                <Button onClick={handleCreate} className="w-full">
                  Criar Automação
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Example Rules */}
        <Card className="bg-muted/30 border-dashed">
          <CardHeader>
            <CardTitle className="text-sm">💡 Exemplos de automações úteis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_RULES.map((example, i) => (
                <Badge key={i} variant="secondary" className="py-1 px-3">
                  {example.description}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Rules List */}
        {loadingRules ? (
          <div className="text-center py-8 text-muted-foreground">Carregando...</div>
        ) : rules.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Nenhuma automação criada</p>
              <p className="text-muted-foreground">Crie regras para automatizar a categorização das suas transações</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {rules.map(rule => {
              const trigger = TRIGGER_TYPES.find(t => t.value === rule.trigger_type);
              const action = ACTION_TYPES.find(a => a.value === rule.action_type);
              const category = categories.find(c => c.id === rule.action_value);

              return (
                <Card key={rule.id} className={!rule.is_active ? "opacity-60" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Switch
                          checked={rule.is_active}
                          onCheckedChange={(checked) => toggleRule.mutate({ id: rule.id, is_active: checked })}
                        />
                        <div>
                          <p className="font-medium">{rule.name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{trigger?.label}</span>
                            {rule.trigger_value && (
                              <Badge variant="outline" className="text-xs">
                                {rule.trigger_type === "category_equals" 
                                  ? categories.find(c => c.id === rule.trigger_value)?.name
                                  : rule.trigger_value}
                              </Badge>
                            )}
                            <ArrowRight className="h-3 w-3" />
                            <span className="flex items-center gap-1">
                              {getActionIcon(rule.action_type)}
                              {action?.label}
                            </span>
                            {rule.action_value && (
                              <Badge variant="outline" className="text-xs">
                                {rule.action_type === "change_category" 
                                  ? `${category?.icon} ${category?.name}`
                                  : rule.action_type === "add_to_goal"
                                  ? goals.find(g => g.id === rule.action_value)?.name
                                  : rule.action_value}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteRule.mutate(rule.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
