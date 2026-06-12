# Log de Rastreabilidade — CampusFlow

## Decisões de Implementação vs. Protótipo (Entrega 4)

| # | Elemento | Protótipo | Implementação | Justificativa |
|---|----------|-----------|---------------|---------------|
| 1 | **Tela de Login** | Mantida | Mantida | Sem alterações. Fluxo padrão de autenticação. |
| 2 | **Tela de Cadastro** | Mantida | **Alterada** | Cadastro sem campo de senha — o protótipo original incluía campo de senha. Corrigido: campo de senha adicionado com validação de 3+ caracteres. |
| 3 | **Dashboard do Aluno** | Mantida | Mantida | Cards de atalho (Encontrar Sala, Minhas Reservas) conforme protótipo. |
| 4 | **Listagem de Espaços** | Mantida | **Alterada** | Substituída navegação por abas/categorias por busca textual (onkeyup). Escolha técnica para reduzir complexidade mantendo funcionalidade de filtro. |
| 5 | **Detalhes do Espaço** | Mantida | Mantida | Formulário de reserva com data/hora conforme protótipo. |
| 6 | **Minhas Reservas** | Mantida | **Alterada** | Adicionado botão "Cancelar" que não estava no protótipo. Necessário para fluxo completo de gerenciamento. |
| 7 | **Dashboard Admin** | Mantida | **Simplificada** | Protótipo previa gráficos e timeline; implementado com cards de métricas (totais). Gráficos exigem biblioteca externa (Chart.js), adiado para manter zero dependências. |
| 8 | **Gerenciar Reservas (Admin)** | Mantida | Mantida | Botões Aprovar/Rejeitar conforme protótipo. |
| 9 | **Histórico (Admin)** | Mantida | Mantida | Tabela completa com status. |
| 10 | **Perfil do Usuário** | Não previsto | **Adicionado** | Tela extra de perfil com estatísticas e alternador de tema. Incluída para demonstrar capacidade de expansão. |
| 11 | **Menu de Navegação** | Sidebar | **Navbar superior** | Alterado de sidebar (protótipo) para navbar superior. Melhora usabilidade em mobile e economiza espaço vertical. |
| 12 | **Tema Escuro** | Não previsto | **Adicionado** | Implementado com CSS Variables + localStorage. Decisão técnica para demonstrar suporte a personalização. |
| 13 | **Responsividade** | Mobile-first | **Ampliada** | Protótipo previa apenas mobile. Implementado com breakpoints adicionais (tablet 1024px, desktop). |
| 14 | **Persistência de Dados** | Banco de dados | **localStorage** | Protótipo assumia backend. Implementado com armazenamento local via JSON (saveData/loadData). Dados persistem entre sessões. |
| 15 | **Notificações/Toast** | Não previsto | **Adicionado** | Sistema de toast para feedback de ações. Necessário para comunicação de estados (sucesso/erro). |
| 16 | **Estados de Interface** | Parcial | **Completo** | Implementados estados de loading, erro, vazio, 404 e sem permissão — não detalhados no protótipo original. |

## Decisões de Hardware e Software

| Decisão | Escolha | Justificativa |
|---------|---------|---------------|
| **Framework** | Nenhum (Vanilla JS) | Protótipo funcional não exige framework; zero dependências reduz atrito de execução. |
| **Armazenamento** | localStorage | Única alternativa viável sem backend. Dados persistem entre sessões. |
| **Fonte** | Inter (Google Fonts) | Mesma fonte do protótipo. Carregamento via CDN. |
| **Ícones** | Unicode/Emoji | Evita dependência de bibliotecas de ícones (FontAwesome, Material Icons). |
| **Roteamento** | State-based SPA | Sem uso de History API para manter simplicidade. Limitação: refresh volta ao login. |
| **Responsividade** | CSS Grid + Media Queries | Breakpoints em 768px (mobile) e 1024px (tablet). Abordagem mobile-first. |
| **Tema** | CSS Custom Properties | Variáveis CSS permitem troca instantânea de tema sem reflow. |
| **Acessibilidade** | ARIA + Skip Link + Focus Management | Atende WCAG básico sem ferramentas externas. |

| 17 | **Atalhos de Teclado** | Não previsto | **Adicionado** | Escape fecha toasts; Ctrl+K/Ctrl+/ foca na busca. Necessário para atender requisito de "Teclado e Atalhos". |
| 18 | **Responsividade (Tablet)** | Mobile-only | **Adicionado** | Breakpoint 1024px com grid de 2 colunas para tablets. |
| 19 | **Responsividade (Desktop largo)** | Não previsto | **Adicionado** | Breakpoint 1400px com layout expandido. |
| 20 | **Responsividade (Impressão)** | Não previsto | **Adicionado** | CSS @print remove elementos não essenciais. |
| 21 | **Campo de Senha no Cadastro** | Presente | **Corrigido** | Estava ausente na implementação inicial; adicionado com validação. |

## Pendências para Versão Final

| Item | Prioridade | Observação |
|------|-----------|------------|
| Campo de senha no cadastro | Alta | Implementar e fazer hash |
| Integração com backend/API | Alta | Substituir dados mock |
| Testes automatizados | Média | Jest/Cypress |
| Sistema de notificações push | Média | Para lembretes de reserva |
| Upload de foto de perfil | Baixa | Expansão futura |
