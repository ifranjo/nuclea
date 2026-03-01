# DOCSIDEBAR - Opciones Viables (claro y directo)

Fecha: 22 Feb 2026

## Top 10 opciones

1. Deploy de `POC_REAL` en Vercel  
Que implica: publicar una URL estable para demos y QA.  
Que significa: menos pruebas locales, mas validacion real.

2. Pasar Supabase local a Supabase Cloud  
Que implica: mover DB a entorno remoto.  
Que significa: no depender de Docker local para pruebas.

3. CI/CD con tests automaticos  
Que implica: correr lint, typecheck, build y Playwright en cada PR.  
Que significa: detectar fallos antes de mergear.

4. Arreglar estabilidad local (Docker + Supabase + dev server)  
Que implica: scripts de healthcheck y recuperacion.  
Que significa: menos tiempo perdido en errores de entorno.

5. Panel Admin para invitaciones beta  
Que implica: crear/revocar accesos desde UI.  
Que significa: operacion beta mas ordenada.

6. Email real (Resend/SendGrid)  
Que implica: enviar invitaciones y avisos de verdad.  
Que significa: flujos listos para usuarios reales.

7. Validar export ZIP en cloud  
Que implica: pruebas con datos reales y archivos grandes.  
Que significa: menos riesgo en la descarga final.

8. Script unico para levantar las 3 apps  
Que implica: un comando para arrancar todo.  
Que significa: iteracion mas rapida entre apps.

9. Compartir codigo comun entre apps  
Que implica: centralizar tipos y utilidades repetidas.  
Que significa: menos duplicacion y menos bugs.

10. Runbook unico de operaciones  
Que implica: un solo documento con comandos y troubleshooting.  
Que significa: cualquiera puede operar sin depender de memoria tribal.

## Orden recomendado

1. CI/CD automatico
2. Estabilidad local
3. Deploy Vercel
4. Supabase Cloud
5. Email real
6. ZIP cloud
7. Admin beta
8. Script 3 apps
9. Runbook unico
10. Codigo compartido
