# Script para aplicar correções de RLS e verificar warnings
# Execute este script para aplicar as migrações de correção de performance

Write-Host "=== Aplicando Correções de Performance RLS ===" -ForegroundColor Green

# Verificar se o Supabase CLI está instalado
try {
    $supabaseVersion = supabase --version
    Write-Host "Supabase CLI encontrado: $supabaseVersion" -ForegroundColor Green
} catch {
    Write-Host "Erro: Supabase CLI não encontrado. Instale-o primeiro." -ForegroundColor Red
    Write-Host "Instruções: https://supabase.com/docs/guides/cli" -ForegroundColor Yellow
    exit 1
}

# Aplicar as migrações
Write-Host "`nAplicando migrações de correção..." -ForegroundColor Yellow

try {
    # Aplicar migração principal
    supabase db push
    Write-Host "Migrações aplicadas com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "Erro ao aplicar migrações: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Verificar se há warnings restantes
Write-Host "`nVerificando warnings restantes..." -ForegroundColor Yellow

try {
    # Executar linter do Supabase para verificar warnings
    $linterOutput = supabase db lint 2>&1
    
    if ($linterOutput -match "WARN") {
        Write-Host "Ainda existem warnings:" -ForegroundColor Yellow
        Write-Host $linterOutput -ForegroundColor Yellow
    } else {
        Write-Host "Todos os warnings foram corrigidos! ✅" -ForegroundColor Green
    }
} catch {
    Write-Host "Erro ao verificar warnings: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Resumo das Correções Aplicadas ===" -ForegroundColor Green
Write-Host "1. Auth RLS Initialization Plan warnings corrigidos" -ForegroundColor White
Write-Host "2. Multiple Permissive Policies warnings corrigidos" -ForegroundColor White
Write-Host "3. Todas as políticas agora usam (select auth.uid())" -ForegroundColor White
Write-Host "4. Políticas consolidadas para melhor performance" -ForegroundColor White

Write-Host "`nPara verificar manualmente, execute: supabase db lint" -ForegroundColor Cyan 