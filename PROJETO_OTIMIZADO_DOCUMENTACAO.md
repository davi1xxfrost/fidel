# 📱 Barbearia Fidelidade - Documentação de Arquitetura Otimizada

## 🎯 Visão Geral

Este projeto foi completamente refatorado com foco em **arquitetura limpa**, **mobile-first** e **otimização de performance** para um PWA (Progressive Web App) de cartão de fidelidade para barbearias.

## 🏗️ Arquitetura do Projeto

### Estrutura de Pastas Otimizada

```
src/
├── shared/                     # Recursos compartilhados
│   ├── types/                  # Interfaces TypeScript centralizadas
│   ├── constants/              # Constantes e configurações
│   ├── hooks/                  # Hooks customizados reutilizáveis
│   ├── contexts/               # Contextos React otimizados
│   └── components/             # Componentes compartilhados
│       ├── Layout/             # Componentes de layout
│       ├── UI/                 # Componentes de interface
│       └── Performance/        # Componentes de otimização
├── features/                   # Features organizadas por domínio
│   ├── auth/                   # Autenticação
│   ├── barbearia/              # Funcionalidades da barbearia
│   ├── cliente/                # Funcionalidades do cliente
│   └── admin/                  # Funcionalidades administrativas
├── pages/                      # Páginas da aplicação
├── routes/                     # Configuração de rotas
└── services/                   # Serviços e integrações
```

## 🚀 Principais Otimizações Implementadas

### 1. Performance e Code Splitting

#### Lazy Loading Implementado
- **Componentes**: Todos os componentes grandes são carregados sob demanda
- **Rotas**: Páginas são lazy-loaded automaticamente
- **Imagens**: Sistema de lazy loading com IntersectionObserver

```typescript
// Exemplo de lazy loading de componente
const LazyComponent = React.lazy(() => import('./HeavyComponent'));

// Uso com wrapper otimizado
<LazyWrapper fallback={<Skeleton />}>
  <LazyComponent />
</LazyWrapper>
```

#### Code Splitting Avançado
- **Vendor Chunks**: React, Supabase, Radix UI separados
- **Feature Chunks**: Admin, Barbearia, Cliente em chunks distintos
- **Tree Shaking**: Configurado para eliminar código não utilizado

### 2. Mobile-First e Responsividade

#### Sistema de Breakpoints
```typescript
// Breakpoints otimizados para mobile
const BREAKPOINTS = {
  xs: '320px',   // Extra small phones
  sm: '375px',   // Small phones
  md: '768px',   // Tablets
  lg: '1024px',  // Small laptops
  xl: '1280px',  // Large laptops
  '2xl': '1536px', // Desktop
}
```

#### Componentes Responsivos
- **MobileContainer**: Container otimizado para mobile
- **TouchButton**: Botões com targets touch-friendly (min 44px)
- **TouchFAB**: Floating Action Button para mobile

#### Safe Area Support
- Suporte completo para iOS safe areas
- CSS custom properties para diferentes devices

### 3. PWA Otimizada

#### Service Worker Avançado
- **Cache First**: Para assets estáticos
- **Network First**: Para APIs
- **Stale While Revalidate**: Para conteúdo dinâmico
- **Cache expiration**: Sistema inteligente de expiração

#### Manifest Otimizado
- Screenshots para app store
- Shortcuts para ações rápidas
- File handlers para importação
- Protocol handlers para deep linking

### 4. State Management Otimizado

#### Context Centralizado
```typescript
// Estado global otimizado com useReducer
interface AppState {
  user: User | null;
  currentBarbearia: Barbearia | null;
  deviceInfo: DeviceInfo;
  pwaState: PWAState;
  theme: 'light' | 'dark' | 'system';
  preloadedRoutes: Set<string>;
  optimizedImages: Map<string, string>;
}
```

#### React Query Configurado
- Cache inteligente para APIs
- Retry logic otimizada
- Offline-first approach
- Sincronização automática

## 🔧 Hooks Customizados

### useResponsive
```typescript
const { isMobile, isTablet, breakpoint } = useResponsive();
```

### usePWA
```typescript
const { 
  isInstallable, 
  install, 
  updateAvailable, 
  reloadApp 
} = usePWA();
```

### useMobile
```typescript
const { 
  isTouchDevice, 
  isStandalone, 
  canInstall 
} = useMobile();
```

## 📱 Componentes Mobile-Optimized

### TouchButton
```tsx
<TouchButton 
  size="touch" 
  haptic={true}
  longPress={true}
  onLongPress={() => console.log('Long press!')}
>
  Toque Aqui
</TouchButton>
```

### MobileContainer
```tsx
<MobileContainer 
  padding="md" 
  maxWidth="tablet" 
  centerContent={true}
  safeArea={true}
>
  <Content />
</MobileContainer>
```

### LazyImage
```tsx
<LazyImage 
  src="/large-image.jpg"
  alt="Descrição"
  placeholder="Carregando..."
  width={300}
  height={200}
/>
```

## 🎨 Tailwind Customizado

### Classes Mobile-First
```css
/* Touch targets */
.min-h-touch { min-height: 44px; }
.min-w-touch { min-width: 44px; }

/* Safe areas */
.pt-safe-top { padding-top: env(safe-area-inset-top); }
.pb-safe-bottom { padding-bottom: env(safe-area-inset-bottom); }

/* Mobile shadows */
.shadow-touch { box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12); }
.shadow-elevated { box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15); }
```

### Breakpoints Responsivos
```css
/* Mobile first approach */
.mobile-only { @apply sm:hidden; }
.tablet-only { @apply hidden sm:block lg:hidden; }
.desktop-only { @apply hidden lg:block; }
```

## 🔄 Patterns de Desenvolvimento

### 1. Lazy Loading Pattern
```typescript
// Para componentes pesados
const HeavyComponent = React.lazy(() => 
  import('./HeavyComponent').then(module => ({
    default: module.HeavyComponent
  }))
);

// Para páginas
const AdminPage = React.lazy(() => import('../pages/Admin'));
```

### 2. Error Boundary Pattern
```typescript
// Sempre envolver componentes críticos
<ErrorBoundary fallback={<ErrorFallback />}>
  <CriticalComponent />
</ErrorBoundary>
```

### 3. Memoization Pattern
```typescript
// Para componentes que recebem props complexas
const ExpensiveComponent = React.memo(({ data, options }) => {
  const processedData = useMemo(() => 
    processData(data, options), [data, options]
  );
  
  return <DisplayData data={processedData} />;
});
```

### 4. Custom Hook Pattern
```typescript
// Para lógica reutilizável
const useFeatureLogic = (initialState) => {
  const [state, setState] = useState(initialState);
  
  const actions = useMemo(() => ({
    action1: () => setState(prev => ({ ...prev, field: 'value' })),
    action2: () => setState(prev => ({ ...prev, field2: 'value2' })),
  }), []);
  
  return { state, ...actions };
};
```

## 🚨 Regras de Manutenção para IAs

### ❌ NÃO FAZER

1. **Não criar componentes sem lazy loading** para páginas
2. **Não usar useState** para estado global (usar Context)
3. **Não ignorar safe areas** em componentes mobile
4. **Não criar CSS inline** (usar Tailwind classes)
5. **Não usar imports absolutos** sem alias configurado
6. **Não criar componentes** sem props tipadas em TypeScript
7. **Não usar any** como tipo (sempre tipar corretamente)
8. **Não criar side effects** sem useCallback/useMemo
9. **Não ignorar loading states** em operações assíncronas
10. **Não criar botões** menores que 44px em mobile

### ✅ SEMPRE FAZER

1. **Sempre usar mobile-first** approach no CSS
2. **Sempre envolver** novos componentes em ErrorBoundary
3. **Sempre otimizar imagens** com lazy loading
4. **Sempre usar hooks customizados** para lógica complexa
5. **Sempre tipar** interfaces e props corretamente
6. **Sempre usar** componentes do design system
7. **Sempre testar** em dispositivos mobile
8. **Sempre implementar** loading states
9. **Sempre usar** memoization para cálculos pesados
10. **Sempre seguir** a estrutura de pastas estabelecida

### 🔧 Checklist de Manutenção

#### Ao Adicionar Nova Feature:
- [ ] Criar tipos TypeScript específicos
- [ ] Implementar lazy loading se necessário
- [ ] Adicionar error boundaries
- [ ] Testar responsividade mobile-first
- [ ] Otimizar performance com memoization
- [ ] Documentar hooks customizados criados
- [ ] Testar offline/PWA functionality
- [ ] Validar touch targets (min 44px)
- [ ] Implementar loading states
- [ ] Testar com React Query cache

#### Ao Otimizar Performance:
- [ ] Analisar bundle size com ferramentas
- [ ] Implementar code splitting adicional
- [ ] Otimizar imagens e assets
- [ ] Revisar cache strategies
- [ ] Verificar memory leaks
- [ ] Otimizar re-renders desnecessários
- [ ] Implementar virtualization se necessário
- [ ] Revisar service worker cache

#### Ao Adicionar Componente:
```typescript
// Template obrigatório para novos componentes
interface ComponentProps {
  // Props tipadas obrigatoriamente
  children?: React.ReactNode;
  className?: string;
  // ... outras props específicas
}

export const Component: React.FC<ComponentProps> = React.memo(({ 
  children, 
  className,
  ...props 
}) => {
  // Lógica do componente com hooks necessários
  
  return (
    <div 
      className={cn(
        'mobile-optimized-classes', // Classes mobile-first
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Component.displayName = 'Component';
```

## 📊 Métricas de Performance

### Targets de Performance:
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms
- **Bundle Size**: < 500KB inicial

### Ferramentas de Monitoramento:
- Lighthouse para PWA score
- Web Vitals para Core Web Vitals
- Bundle Analyzer para análise de chunks
- Chrome DevTools para performance profiling

## 🔐 Security Best Practices

1. **Sanitização**: Sempre sanitizar inputs do usuário
2. **Validação**: Validar dados no frontend E backend
3. **HTTPS**: Sempre usar HTTPS em produção
4. **CSP**: Content Security Policy configurado
5. **Secrets**: Nunca expor secrets no frontend
6. **Autenticação**: JWT tokens com expiração adequada

## 🌐 Deployment e CI/CD

### Build Otimizado:
```bash
# Comandos de build otimizados
npm run build          # Build produção
npm run build:dev      # Build desenvolvimento
npm run analyze        # Análise do bundle
```

### Configurações Importantes:
- **Vite**: Configurado para otimização mobile
- **Tailwind**: Purge CSS habilitado
- **Service Worker**: Auto-update implementado
- **Manifest**: Configurado para app stores

## 📱 Testing Mobile

### Testes Essenciais:
1. **Touch interactions**: Todos os elementos touch-friendly
2. **Orientation changes**: Portrait/landscape support
3. **Safe areas**: iOS notch handling
4. **Offline functionality**: Service worker funcionando
5. **Install prompt**: PWA installation working
6. **Performance**: 60fps animations
7. **Accessibility**: Screen reader support

Esta documentação deve ser seguida rigorosamente por qualquer IA que for manter ou expandir este projeto. Sempre priorize mobile-first, performance e user experience.

---

**Última atualização**: $(date)
**Versão da arquitetura**: 2.0
**Compatibilidade**: iOS 13+, Android 8+, Chrome 80+, Safari 13+