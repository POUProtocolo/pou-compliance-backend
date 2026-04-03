# Backend Node para POU PROTOCOLO

Este backend expõe as rotas:

- POST /api/compliance/chainalysis
- POST /api/compliance/elliptic
- POST /api/compliance/trm
- GET /health

## Uso local
1. Entre na pasta backend-node
2. Copie `.env.example` para `.env`
3. Rode:
   npm install
   npm start

## Modos rápidos
No arquivo .env você pode testar:

COMPLIANCE_MODE=clear
COMPLIANCE_MODE=blocked
COMPLIANCE_MODE=unavailable

Ou definir por provedor:
CHAINALYSIS_MODE=clear
ELLIPTIC_MODE=clear
TRM_MODE=blocked

## Produção
Se você já tiver upstreams próprios, preencha:
- CHAINALYSIS_UPSTREAM_URL
- ELLIPTIC_UPSTREAM_URL
- TRM_UPSTREAM_URL

O backend faz proxy para esses upstreams e normaliza o retorno em:
- CLEAR
- BLOCKED
- UNAVAILABLE

## Exemplo de payload recebido
{
  "address": "0xF7f2ED318CAF3Cf8793b07DFa7FdFD607Af4232d",
  "chainId": 56,
  "source": "website",
  "action": "connect"
}
