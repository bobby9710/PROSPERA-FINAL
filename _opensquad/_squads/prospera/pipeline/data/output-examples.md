# Output Examples — Prospera Evolution

## UX Structure (Paulo Produto)
**Input:** "Criar fluxo de transferência de saldo entre contas"
**Output:**
1. **Página Inicial:** Botão 'Transferir' em destaque (Cor Primária).
2. **Modal Seleção:** Cartão de Origem (Saldo disponível) → Campo Valor (Input numérico com máscara R$).
3. **Seleção Destino:** Lista de contatos recentes e botão 'Nova Conta'.
4. **Resumo:** Valor de transferência, data e taxa (se houver).
5. **Confirmação:** Botão 'Confirmar' com fundo pulsante.
**Psicologia:** Exibir o saldo restante *após* a transferência para reduzir a ansiedade do usuário.

## UI Design Premium (Aline Aparência)
**Visual:**
- **Fundo:** Dark mode (#0F172A) com gradiente radial sutil (Primary/20%).
- **Card:** Glassmorphism (Frosted Glass) com border-radius: 24px.
- **Borda:** 1px solid white/10% com inner-shadow de 2px no topo.
- **Blur:** backdrop-filter: blur(12px).
- **Tipografia:** Inter Semibold (24px) para valores financeiros.
- **Micro-detalhe:** Ícone de transferência com animação de "vai e vem" sutil.

## Front-end Code (Fabio Front)
**Snippet:**
```tsx
<div className="p-6 bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden group hover:border-primary/30 transition-all duration-500">
  <div className="flex items-center justify-between">
    <Typography variant="h3">Meu Saldo</Typography>
    <div className="p-2 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
      <ArrowRightLeft size={20} />
    </div>
  </div>
</div>
```

## QA Veredito (Vitor Veredito)
**Relatado:** "O botão de confirmação está muito colado no teclado virtual em dispositivos iPhone SE. Fabio, adicione um `pb-12` (padding-bottom) no container do modal para garantir que o CTA não seja cortado. Aline, a cor do texto do saldo (cinza 400) está com contraste 3.8:1 no fundo Dark. Vamos subir para cinza 200 (Contraste 7.2:1) para garantir acessibilidade."

---
*Exemplos de excelência técnica e visual.*
