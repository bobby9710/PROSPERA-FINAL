# Output Examples: Prospera Squad

## PM: User Story Requirement
"Como usuário PRO, quero escanear minha nota fiscal para que meus gastos sejam categorizados automaticamente sem preenchimento manual."
**Critério de Aceite:** 
- Sucesso de leitura > 95%. 
- Tempo de resposta < 3s. 
- Mapeamento correto com Categorias existentes.

## Designer: Theme Definition (Tailwind)
```json
{
  "theme": {
    "extend": {
      "colors": {
        "prospera-purple": "#895af6",
        "bg-dark": "#121212",
        "text-primary": "var(--text-main)"
      }
    }
  }
}
```

## Developer: Theme Switch Hook
```typescript
const useTheme = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);
  return { theme, setTheme };
}
```
