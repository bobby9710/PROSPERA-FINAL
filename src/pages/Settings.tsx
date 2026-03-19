import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useSettings, useUpdateSettings, useUpdatePassword, useDeleteAccount, useProfile, useUpdateProfile } from "@/hooks/useSettings";
import { useAuth } from "@/hooks/useAuth";
import { useTheme, Theme } from "@/hooks/useTheme";
import { User, Lock, Tag, Settings2, Palette, Globe, Shield, Trash2, Save, Eye, EyeOff, Crown } from "lucide-react";
import { Link } from "react-router-dom";

export default function Settings() {
  const { user } = useAuth();
  const { data: settings, isLoading: settingsLoading } = useSettings();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const updateSettings = useUpdateSettings();
  const updatePassword = useUpdatePassword();
  const deleteAccount = useDeleteAccount();
  const updateProfile = useUpdateProfile();
  const { theme, setTheme } = useTheme();

  const [fullName, setFullName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  // Initialize form values when data loads
  useState(() => {
    if (profile?.full_name) {
      setFullName(profile.full_name);
    }
  });

  const handleSaveProfile = () => {
    updateProfile.mutate({ full_name: fullName });
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      return;
    }
    updatePassword.mutate({ currentPassword, newPassword });
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmation === "DELETAR") {
      deleteAccount.mutate();
    }
  };

  if (settingsLoading || profileLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Configurações</h1>
            <p className="text-muted-foreground">Gerencie suas preferências e conta</p>
          </div>
          <Link to="/premium">
            <Button variant="outline" className="gap-2">
              <Crown className="w-4 h-4 text-yellow-500" />
              Ver Planos
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <TabsList className="inline-flex w-auto min-w-full sm:grid sm:grid-cols-4 lg:grid-cols-7 sm:w-full">
              <TabsTrigger value="profile" className="gap-1.5 text-xs sm:text-sm px-2.5 sm:px-3">
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Perfil</span>
              </TabsTrigger>
              <TabsTrigger value="password" className="gap-1.5 text-xs sm:text-sm px-2.5 sm:px-3">
                <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Senha</span>
              </TabsTrigger>
              <TabsTrigger value="categories" className="gap-1.5 text-xs sm:text-sm px-2.5 sm:px-3">
                <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Categorias</span>
              </TabsTrigger>
              <TabsTrigger value="preferences" className="gap-1.5 text-xs sm:text-sm px-2.5 sm:px-3">
                <Settings2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Preferências</span>
              </TabsTrigger>
              <TabsTrigger value="theme" className="gap-1.5 text-xs sm:text-sm px-2.5 sm:px-3">
                <Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Tema</span>
              </TabsTrigger>
              <TabsTrigger value="privacy" className="gap-1.5 text-xs sm:text-sm px-2.5 sm:px-3">
                <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Privacidade</span>
              </TabsTrigger>
              <TabsTrigger value="danger" className="gap-1.5 text-xs sm:text-sm px-2.5 sm:px-3 text-destructive">
                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Conta</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Dados Pessoais
                </CardTitle>
                <CardDescription>Atualize suas informações de perfil</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user?.email || ""} disabled className="bg-muted" />
                  <p className="text-xs text-muted-foreground">O email não pode ser alterado</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome Completo</Label>
                  <Input
                    id="fullName"
                    value={fullName || profile?.full_name || ""}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Seu nome completo"
                  />
                </div>
                <Button onClick={handleSaveProfile} disabled={updateProfile.isPending} className="gap-2">
                  <Save className="w-4 h-4" />
                  {updateProfile.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Password Tab */}
          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Alterar Senha
                </CardTitle>
                <CardDescription>Atualize sua senha de acesso</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Senha Atual</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Digite sua senha atual"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nova Senha</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Digite a nova senha"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirme a nova senha"
                  />
                  {newPassword && confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-xs text-destructive">As senhas não coincidem</p>
                  )}
                </div>
                <Button
                  onClick={handleChangePassword}
                  disabled={updatePassword.isPending || !currentPassword || !newPassword || newPassword !== confirmPassword}
                  className="gap-2"
                >
                  <Lock className="w-4 h-4" />
                  {updatePassword.isPending ? "Alterando..." : "Alterar Senha"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Categorias Personalizadas
                </CardTitle>
                <CardDescription>Gerencie suas categorias de receitas e despesas</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/categories">
                  <Button className="gap-2">
                    <Tag className="w-4 h-4" />
                    Gerenciar Categorias
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings2 className="w-5 h-5" />
                  Preferências
                </CardTitle>
                <CardDescription>Configure moeda, formato de data e notificações</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Moeda</Label>
                    <Select
                      value={settings?.currency || "BRL"}
                      onValueChange={(value) => updateSettings.mutate({ currency: value })}
                    >
                      <SelectTrigger id="currency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BRL">R$ - Real Brasileiro</SelectItem>
                        <SelectItem value="USD">$ - Dólar Americano</SelectItem>
                        <SelectItem value="EUR">€ - Euro</SelectItem>
                        <SelectItem value="GBP">£ - Libra Esterlina</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateFormat">Formato de Data</Label>
                    <Select
                      value={settings?.date_format || "dd/MM/yyyy"}
                      onValueChange={(value) => updateSettings.mutate({ date_format: value })}
                    >
                      <SelectTrigger id="dateFormat">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dd/MM/yyyy">DD/MM/AAAA</SelectItem>
                        <SelectItem value="MM/dd/yyyy">MM/DD/AAAA</SelectItem>
                        <SelectItem value="yyyy-MM-dd">AAAA-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Notificações</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Notificações no App</Label>
                      <p className="text-sm text-muted-foreground">Receber notificações dentro do aplicativo</p>
                    </div>
                    <Switch
                      checked={settings?.notifications_enabled ?? true}
                      onCheckedChange={(checked) => updateSettings.mutate({ notifications_enabled: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Notificações por Email</Label>
                      <p className="text-sm text-muted-foreground">Receber alertas importantes por email</p>
                    </div>
                    <Switch
                      checked={settings?.email_notifications ?? true}
                      onCheckedChange={(checked) => updateSettings.mutate({ email_notifications: checked })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Idioma</Label>
                  <Select
                    value={settings?.language || "pt-BR"}
                    onValueChange={(value) => updateSettings.mutate({ language: value })}
                  >
                    <SelectTrigger id="language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Theme Tab */}
          <TabsContent value="theme">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Tema
                </CardTitle>
                <CardDescription>Escolha entre tema claro, escuro ou automático</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { value: "light" as Theme, label: "Claro", icon: "☀️" },
                    { value: "dark" as Theme, label: "Escuro", icon: "🌙" },
                    { value: "system" as Theme, label: "Sistema", icon: "💻" },
                  ].map((t) => (
                    <button
                      key={t.value}
                      onClick={() => {
                        setTheme(t.value);
                        updateSettings.mutate({ theme: t.value });
                      }}
                      className={`p-4 rounded-lg border-2 transition-all ${theme === t.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                        }`}
                    >
                      <div className="text-3xl mb-2">{t.icon}</div>
                      <div className="font-medium">{t.label}</div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Privacidade
                </CardTitle>
                <CardDescription>Configure suas opções de privacidade</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Modo Privacidade</Label>
                    <p className="text-sm text-muted-foreground">
                      Ocultar valores no dashboard quando ativo
                    </p>
                  </div>
                  <Switch
                    checked={settings?.privacy_mode ?? false}
                    onCheckedChange={(checked) => updateSettings.mutate({ privacy_mode: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Danger Zone Tab */}
          <TabsContent value="danger">
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <Trash2 className="w-5 h-5" />
                  Zona de Perigo
                </CardTitle>
                <CardDescription>Ações irreversíveis para sua conta</CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="gap-2">
                      <Trash2 className="w-4 h-4" />
                      Deletar Conta
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                      <AlertDialogDescription className="space-y-4">
                        <p>
                          Esta ação não pode ser desfeita. Isso irá deletar permanentemente sua conta
                          e remover todos os seus dados de nossos servidores.
                        </p>
                        <div className="space-y-2">
                          <Label>Digite "DELETAR" para confirmar</Label>
                          <Input
                            value={deleteConfirmation}
                            onChange={(e) => setDeleteConfirmation(e.target.value)}
                            placeholder="DELETAR"
                          />
                        </div>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setDeleteConfirmation("")}>
                        Cancelar
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        disabled={deleteConfirmation !== "DELETAR"}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Deletar Conta
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
