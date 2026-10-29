# CLAUDE.md — CW_FRONTEND_BDKSPA

Frontend Angular del Concentrador Web BDKSPA. Contexto, reglas y estado viven en el [CLAUDE.md de la raíz](../CLAUDE.md); aquí solo lo específico del repo. Modelo a copiar: `C:\FUENTESWEB\17-CW-BDKTINT\CW_FRONTEND_BDKTINT\` (mapa en playbook sección 18).

## Stack

Angular 17, Angular Material, AdminLTE, Chart.js. Repo: `bdksistemas/cw_bdkspa_frontend`.

## Comandos

```bash
npm install --legacy-peer-deps
ng serve          # reiniciar cada vez que cambie angular.json
ng build
```

## Estado

- Menú con reportes de SPA (agenda, tratamientos, ventas, clientes, almacén, gastos); solo se conservan los del menú actual. Restos de GYM sin menú: socios-clase, socios-asistencia, socios-inscripciones, ventas-detallado, suscripciones-vencidas, ventas-productos-cancelados.
- `auth.service.ts` y `api-service.service.ts` guardan credenciales en `sessionStorage` y mandan headers `X-Client-*`, con URL `127.0.0.1` fija: se corrige en la Fase 3.
- Por limpiar en la Fase 2: `pages/heroes`, `services/heroes.service.ts` (plantilla).
- `.gitignore` usa `/dist` (con barra) para no ignorar `src/assets/dist/`.
