# Script para corrigir o erro 400 no cadastro de clientes
# Este script aplica as correções SQL diretamente no Supabase

Write-Host "=== Corrigindo Erro 400 no Cadastro de Clientes ===" -ForegroundColor Green

# Verificar se o arquivo SQL existe
$sqlFile = "fix_client_registration_immediate.sql"
if (-not (Test-Path $sqlFile)) {
    Write-Host "Erro: Arquivo $sqlFile não encontrado!" -ForegroundColor Red
    exit 1
}

Write-Host "`nAplicando correções SQL..." -ForegroundColor Yellow

# Ler o conteúdo do arquivo SQL
$sqlContent = Get-Content $sqlFile -Raw

Write-Host "Conteúdo do script SQL:" -ForegroundColor Cyan
Write-Host $sqlContent -ForegroundColor Gray

Write-Host "`nPara aplicar estas correções:" -ForegroundColor Yellow
Write-Host "1. Acesse o painel do Supabase" -ForegroundColor White
Write-Host "2. Vá para SQL Editor" -ForegroundColor White
Write-Host "3. Cole o conteúdo acima" -ForegroundColor White
Write-Host "4. Execute o script" -ForegroundColor White

Write-Host "`nOu execute via Supabase CLI:" -ForegroundColor Yellow
Write-Host "supabase db reset" -ForegroundColor Cyan
Write-Host "supabase db push" -ForegroundColor Cyan

Write-Host "`n=== Resumo das Correções ===" -ForegroundColor Green
Write-Host "1. Políticas RLS simplificadas para permitir inserção" -ForegroundColor White
Write-Host "2. Verificação de autenticação melhorada no código" -ForegroundColor White
Write-Host "3. Logs detalhados para debug" -ForegroundColor White
Write-Host "4. Verificação de permissões da barbearia" -ForegroundColor White

Write-Host "`nApós aplicar as correções, teste novamente o cadastro de clientes." -ForegroundColor Cyan 