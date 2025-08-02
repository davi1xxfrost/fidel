# Script para debugar o erro 400 no cadastro de clientes
Write-Host "=== DEBUG ERROR 400 ===" -ForegroundColor Red

Write-Host "`n1. Verifique o console do navegador (F12) e procure por:" -ForegroundColor Yellow
Write-Host "   - '=== INICIANDO CADASTRO ==='" -ForegroundColor White
Write-Host "   - 'Dados do formulário:'" -ForegroundColor White
Write-Host "   - '❌ Erro ao inserir cliente:'" -ForegroundColor White

Write-Host "`n2. Execute este script SQL no Supabase:" -ForegroundColor Yellow
Write-Host "   - Acesse: https://supabase.com/dashboard" -ForegroundColor White
Write-Host "   - Vá para SQL Editor" -ForegroundColor White
Write-Host "   - Cole o conteúdo do arquivo 'debug_rls_policies.sql'" -ForegroundColor White

Write-Host "`n3. Possíveis causas do erro 400:" -ForegroundColor Yellow
Write-Host "   - Políticas RLS muito restritivas" -ForegroundColor White
Write-Host "   - Campo obrigatório faltando" -ForegroundColor White
Write-Host "   - CPF duplicado na mesma barbearia" -ForegroundColor White
Write-Host "   - Barbearia não encontrada" -ForegroundColor White
Write-Host "   - Função generate_qr_code_id não existe" -ForegroundColor White

Write-Host "`n4. Logs adicionados no código:" -ForegroundColor Green
Write-Host "   ✅ Logs detalhados no console" -ForegroundColor White
Write-Host "   ✅ Dados do formulário" -ForegroundColor White
Write-Host "   ✅ Erro detalhado do Supabase" -ForegroundColor White
Write-Host "   ✅ Código e mensagem do erro" -ForegroundColor White

Write-Host "`n5. Para testar:" -ForegroundColor Cyan
Write-Host "   - Abra o console do navegador (F12)" -ForegroundColor White
Write-Host "   - Tente cadastrar um cliente" -ForegroundColor White
Write-Host "   - Copie os logs e me envie" -ForegroundColor White

Write-Host "`n=== FIM DEBUG ===" -ForegroundColor Red 