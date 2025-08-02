# Script para aplicar migração de níveis de fidelidade
# Execute este script para atualizar os níveis de fidelidade no Supabase

Write-Host "🎯 Aplicando migração de níveis de fidelidade..." -ForegroundColor Green

# Ler o arquivo de migração
$migrationFile = "supabase/migrations/20250731000002_update_fidelity_levels.sql"
$migrationContent = Get-Content $migrationFile -Raw

Write-Host "📄 Conteúdo da migração:" -ForegroundColor Yellow
Write-Host $migrationContent -ForegroundColor Gray

Write-Host ""
Write-Host "🚀 Para aplicar esta migração:" -ForegroundColor Cyan
Write-Host "1. Acesse o Supabase Dashboard" -ForegroundColor White
Write-Host "2. Vá para SQL Editor" -ForegroundColor White
Write-Host "3. Cole o conteúdo acima" -ForegroundColor White
Write-Host "4. Execute a migração" -ForegroundColor White

Write-Host ""
Write-Host "✅ Após aplicar a migração:" -ForegroundColor Green
Write-Host "- Os níveis serão atualizados automaticamente" -ForegroundColor White
Write-Host "- Novos níveis: PRATA, GOLD, BLACK, DIAMOND" -ForegroundColor White
Write-Host "- Trigger automático para atualizar níveis" -ForegroundColor White
Write-Host "- Pontos necessários: 0, 100, 250, 400" -ForegroundColor White

Write-Host ""
Write-Host "🎉 Migração pronta para ser aplicada!" -ForegroundColor Green 