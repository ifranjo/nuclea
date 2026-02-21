# NUCLEA — Auditoria Arquitectural v4

**Analisis completo: modelo de datos, maquina de estados, GDPR, riesgos tecnicos y delta v4 Andrea**

Fecha: 21 de febrero de 2026 | Autor: Equipo tecnico NUCLEA | Version: 4.0

---

## Tabla de Contenidos

- [0. Resumen Ejecutivo](#0-resumen-ejecutivo)
- [1. Modelo de Datos TypeScript](#1-modelo-de-datos-typescript)
  - [1.1 Inventario de tipos por aplicacion](#11-inventario-de-tipos-por-aplicacion)
  - [1.2 Validacion Zod](#12-validacion-zod)
  - [1.3 Brechas criticas del modelo de datos](#13-brechas-criticas-del-modelo-de-datos)
  - [1.4 Recomendaciones modelo de datos](#14-recomendaciones-modelo-de-datos)
- [2. Maquina de Estados de Capsulas](#2-maquina-de-estados-de-capsulas)
  - [2.1 Estados definidos](#21-estados-definidos)
  - [2.2 Transiciones implementadas](#22-transiciones-implementadas)
  - [2.3 Brechas de la maquina de estados](#23-brechas-de-la-maquina-de-estados)
  - [2.4 Condiciones de carrera identificadas](#24-condiciones-de-carrera-identificadas)
  - [2.5 Cuotas y limites](#25-cuotas-y-limites)
- [3. Cumplimiento GDPR/RGPD](#3-cumplimiento-gdprrgpd)
  - [3.1 Puntuacion global](#31-puntuacion-global)
  - [3.2 Puntos fuertes](#32-puntos-fuertes)
  - [3.3 Brechas criticas RGPD](#33-brechas-criticas-rgpd)
  - [3.4 Matriz de cumplimiento por articulo](#34-matriz-de-cumplimiento-por-articulo)
- [4. Riesgos Tecnicos y Conflictos](#4-riesgos-tecnicos-y-conflictos)
  - [4.1 Criticos](#41-criticos)
  - [4.2 Altos](#42-altos)
  - [4.3 Medios](#43-medios)
  - [4.4 TODOs y FIXMEs en el codigo](#44-todos-y-fixmes-en-el-codigo)
- [5. Delta v4 — Cambios de Andrea vs Codigo Actual](#5-delta-v4--cambios-de-andrea-vs-codigo-actual)
  - [5.1 Nuevo actor: RECEPTOR](#51-nuevo-actor-receptor)
  - [5.2 Periodo de experiencia 30 dias](#52-periodo-de-experiencia-30-dias)
  - [5.3 Tres opciones del receptor](#53-tres-opciones-del-receptor)
  - [5.4 Video Regalo](#54-video-regalo)
  - [5.5 Sistema de avisos multicanal](#55-sistema-de-avisos-multicanal)
  - [5.6 Contactos de confianza universales](#56-contactos-de-confianza-universales)
  - [5.7 Expiracion limpia](#57-expiracion-limpia)
  - [5.8 Modelo de monetizacion implicito](#58-modelo-de-monetizacion-implicito)
  - [5.9 Tabla de impacto v4](#59-tabla-de-impacto-v4)
- [6. Preguntas para Andrea](#6-preguntas-para-andrea)

---

## 0. Resumen Ejecutivo

La plataforma NUCLEA cuenta con una base solida en la aplicacion de produccion (PREREUNION_ANDREA): tipos TypeScript bien definidos, validacion Zod en rutas API, consentimiento biometrico con auditoria y politicas de privacidad RGPD completas. Sin embargo, la auditoria revela brechas significativas en la maquina de estados de capsulas (sin verificacion de permisos de propietario, sin proteccion de idempotencia), lagunas criticas en RGPD (datos biometricos no eliminados de proveedores externos al revocar consentimiento) y, sobre todo, una **divergencia fundamental entre el modelo v4 de Andrea y el codigo actual**. El modelo v4 introduce un actor completamente nuevo (Receptor), un flujo de regalo con video generado por IA, y un posible pivote de suscripcion a pago transaccional. Ninguna de estas funcionalidades existe en el codigo. La priorizacion inmediata debe centrarse en: (1) seguridad de Firestore rules, (2) alineacion del modelo de datos con v4, y (3) cierre de brechas RGPD antes de cualquier despliegue publico.

### Semaforo por area

| Area | Estado | Detalle |
|------|--------|---------|
| Modelo de datos TypeScript | 🟡 Riesgo medio | Produccion solida, POCs sin tipado fuerte, sin tipos generados de Supabase |
| Maquina de estados | 🔴 Critico | Sin verificacion de permisos, sin idempotencia, sin enforcement post-cierre |
| Cumplimiento RGPD | 🟡 Riesgo medio | 72% — base funcional, brechas en Art. 17 y Art. 28 con proveedores |
| Riesgos tecnicos | 🔴 Critico | Firestore rules ausentes, RLS deshabilitado, admin key expuesta |
| Delta v4 Andrea | 🔴 Critico | 0% implementado — requiere rediseno de ownership, payment y media pipeline |

### Top 5 acciones prioritarias

| # | Accion | Severidad | Esfuerzo |
|---|--------|-----------|----------|
| 1 | Desplegar Firestore security rules y verificar en produccion | 🔴 Critico | Bajo |
| 2 | Implementar verificacion de owner en `closeCapsule()` y todas las mutaciones | 🔴 Critico | Bajo |
| 3 | Resolver eliminacion de datos biometricos en ElevenLabs al revocar consentimiento | 🔴 Critico | Medio |
| 4 | Alinear con Andrea el modelo de monetizacion (suscripcion vs transaccional) | 🔴 Critico | N/A (decision) |
| 5 | Generar tipos Supabase (`supabase gen types`) e integrar en POC_REAL | 🟡 Medio | Bajo |

---

## 1. Modelo de Datos TypeScript

### 1.1 Inventario de tipos por aplicacion

| Tipo | PREREUNION_ANDREA | POC_REAL | POC_INTERNA |
|------|-------------------|----------|-------------|
| `User` | ✅ Interface completa | ✅ Basico | ✅ Basico |
| `Capsule` | ✅ Con `CapsuleType` enum | ✅ `type: string` | ✅ `type: string` |
| `CapsuleContent` | ✅ Interface | ❌ Inline | ❌ Inline |
| `AIAvatar` | ✅ Interface | ❌ No existe | ❌ No existe |
| `WaitlistEntry` | ✅ Interface | ❌ No aplica | ❌ No aplica |
| `Interaction` | ✅ Interface | ❌ No existe | ❌ No existe |
| `CapsuleType` | ✅ Union type + guards | ❌ `string` | ❌ `string` |
| Type guards | ✅ `isCapsuleType()` + `isMigratedCapsuleType()` | ❌ Ninguno | ❌ Ninguno |
| Zod schemas | ✅ 3 schemas | ❌ Ninguno | ❌ Ninguno |

**Resumen:** PREREUNION_ANDREA tiene 7 tipos runtime + 2 type guards + validacion Zod. POC_REAL y POC_INTERNA operan con solo 2 tipos basicos y 1 interface minimal.

### 1.2 Validacion Zod

Schemas implementados en `PREREUNION_ANDREA/src/lib/api-validation.ts`:

```typescript
// Schemas existentes
waitlistSchema        // Email + nombre
capsuleSchema         // Titulo, tipo, descripcion
biometricConsentSchema // 3 checkboxes granulares (voz, rostro, personalidad)
revokeConsentSchema   // Revocacion con audit trail
```

**Cobertura Zod por aplicacion:**

| Aplicacion | Rutas API | Con Zod | Sin Zod | Cobertura |
|------------|-----------|---------|---------|-----------|
| PREREUNION_ANDREA | ~12 | 4 | ~8 | ~33% |
| POC_REAL | 6 | 0 | 6 | 0% |
| POC_INTERNA | 0 | N/A | N/A | N/A |

### 1.3 Brechas criticas del modelo de datos

**1. Perdida de type safety en frontera Supabase**

```typescript
// POC_REAL — tipo actual
interface Capsule {
  type: string;    // ❌ Cualquier string aceptado
  status: string;  // ❌ Sin compile-time safety
}

// PREREUNION_ANDREA — tipo correcto
type CapsuleType = 'legacy' | 'together' | 'social' | 'pet' | 'life-chapter' | 'origin';
interface Capsule {
  type: CapsuleType;  // ✅ Union type
}
```

**2. Sin tipos generados de Supabase**

El comando `supabase gen types typescript` no se ha ejecutado. Esto significa que toda interaccion con la base de datos en POC_REAL es `any` implicito.

**3. Acceso a Firestore sin tipado**

```typescript
// Patron actual en PREREUNION_ANDREA
const doc = await getDoc(docRef);
const data = doc.data(); // Returns DocumentData (Record<string, unknown>)
// Sin assertion de tipo en el boundary
```

**4. Tipos documentados pero no implementados**

`docs/TYPESCRIPT_TYPES.md` documenta 20+ tipos. Solo 7 estan implementados en codigo:

| Documentado | Implementado | Estado |
|-------------|-------------|--------|
| `CapsuleStatus` enum | ❌ | Solo string |
| `ContentType` enum | ❌ | Solo string |
| `SubscriptionTier` | ❌ | Hardcoded en PLANS constant |
| API response interfaces | ❌ | JSON inline |
| `UserProfile` (Supabase) | ❌ | Inline queries |
| `StorageQuota` | ❌ | Numeros magicos |
| `NotificationPreferences` | ❌ | No existe |

**5. `normalizeCapsuleType()` — fallback silencioso**

```typescript
export function normalizeCapsuleType(raw: string): CapsuleType {
  // ...mapping logic...
  return 'legacy'; // ❌ Default silencioso — un tipo invalido se convierte en 'legacy'
}
```

**6. No se encontro uso de `any`** — esto es positivo. El codigo es limpio en ese aspecto.

### 1.4 Recomendaciones modelo de datos

| Prioridad | Accion | Esfuerzo |
|-----------|--------|----------|
| Alta | Ejecutar `supabase gen types typescript` y tipar todas las queries de POC_REAL | Bajo |
| Alta | Crear `CapsuleStatus` y `ContentType` como enums/union types | Bajo |
| Media | Crear interfaces de respuesta API (`ApiResponse<T>`, `PaginatedResponse<T>`) | Bajo |
| Media | Tipar `doc.data()` con assertion en boundary (`as User`, con validacion) | Medio |
| Baja | Unificar modelo de tipos entre las 3 apps (shared package) | Alto |

---

## 2. Maquina de Estados de Capsulas

### 2.1 Estados definidos

En el enum de Supabase (POC_REAL) se definen 6 estados:

```
draft → active → closed → downloaded → expired → archived
```

**Diagrama de transiciones esperado:**

```
  ┌──────────┐
  │  draft   │──── (crear) ────→┌──────────┐
  └──────────┘                  │  active   │
                                └─────┬─────┘
                                      │
                          ┌───────────┼───────────┐
                          │           │           │
                          ▼           ▼           ▼
                    ┌──────────┐ ┌──────────┐ ┌──────────┐
                    │  closed  │ │ expired  │ │ archived │
                    └────┬─────┘ └──────────┘ └──────────┘
                         │
                         ▼
                   ┌──────────────┐
                   │  downloaded  │
                   └──────────────┘
```

### 2.2 Transiciones implementadas

| Transicion | Implementada | Ubicacion | Notas |
|-----------|-------------|-----------|-------|
| `→ active` | ✅ | Creacion de capsula | Siempre `status: 'active'`, `draft` NUNCA se usa |
| `active → closed` | ✅ | `closeCapsule()` | Sets `status: 'closed'` + `closed_at` |
| `closed → downloaded` | ❌ | No implementada | El ZIP se descarga pero el estado no cambia |
| `active → expired` | ❌ Parcial | `expire_old_messages()` SQL | Existe la funcion pero NO hay cron job |
| `* → archived` | ❌ | No implementada | Estado definido pero sin uso |
| `draft → active` | ❌ | No implementada | `draft` es estado muerto |

**Estado muerto: `draft`** — Definido en el enum pero nunca asignado. La creacion de capsulas salta directamente a `active`. Esto significa que no existe flujo de "borrador" (guardar sin publicar).

### 2.3 Brechas de la maquina de estados

**CRITICO: Sin verificacion de permisos de propietario**

```typescript
// Patron actual en closeCapsule()
async function closeCapsule(capsuleId: string) {
  // ❌ NO verifica que el usuario autenticado sea el owner
  // ❌ Cualquier usuario autenticado puede cerrar CUALQUIER capsula
  await supabase
    .from('capsules')
    .update({ status: 'closed', closed_at: new Date().toISOString() })
    .eq('id', capsuleId);
}
```

**CRITICO: Sin validacion de estado previo**

```typescript
// Se puede cerrar una capsula ya cerrada, expirada o archivada
// No hay guard: if (capsule.status !== 'active') throw Error(...)
```

**CRITICO: Sin proteccion de idempotencia**

Dos peticiones concurrentes de cierre ambas tienen exito. La segunda sobreescribe `closed_at`, perdiendo el timestamp original.

**ALTO: Sin enforcement post-cierre**

El cierre de capsula solo cambia el estado en base de datos. No existe middleware ni RLS que impida:
- Subir nuevo contenido a una capsula cerrada
- Modificar metadatos de una capsula cerrada
- Anadir colaboradores a una capsula cerrada

La proteccion es **solo a nivel de UI** (botones deshabilitados), facilmente evitable con llamadas API directas.

**ALTO: Orden incorrecto en cierre + descarga**

```
1. Generar ZIP con contenido         ← El usuario ya tiene los datos
2. Cambiar status a 'closed'         ← Si esto falla, capsula sigue activa
3. El usuario tiene ZIP de una capsula "activa"
```

El orden correcto seria: cambiar estado → generar ZIP → entregar, con rollback si falla la generacion.

**MEDIO: Sin cascada de eliminacion**

Al cerrar o expirar una capsula, los archivos en storage permanecen. La promesa original ("zero ongoing storage cost") no se cumple sin eliminacion explicita post-cierre.

### 2.4 Condiciones de carrera identificadas

| # | Escenario | Consecuencia | Mitigacion |
|---|-----------|-------------|------------|
| 1 | Dos cierres concurrentes | Segunda sobreescribe `closed_at` | Transaccion atomica + check estado previo |
| 2 | Upload + Cierre simultaneo | Contenido sube a capsula cerrada | RLS policy: deny INSERT si `status != 'active'` |
| 3 | Downgrade de plan + creacion rapida | Excede limite del nuevo plan | Check atomico: count + insert en transaccion |
| 4 | Colaborador sube + Owner cierra | Contenido huerfano, colaborador confundido | Lock optimista + notificacion |

### 2.5 Cuotas y limites

| Limite | Definido | Enforced | Ubicacion |
|--------|----------|----------|-----------|
| Capsulas por plan | ✅ PLANS constant | ❌ No en POC_REAL | Solo PREREUNION_ANDREA |
| Storage por plan | ✅ PLANS constant | ❌ Nunca | Ni upload check ni quota tracking |
| Colaboradores por capsula | ✅ Spec (5-20) | ❌ Nunca | Sin limite en codigo |
| Tamano archivo individual | ❌ No definido | ❌ No | Sin validacion |
| Contenidos por capsula | ❌ No definido | ❌ No | Sin limite |

---

## 3. Cumplimiento GDPR/RGPD

### 3.1 Puntuacion global

**72% — Base funcional con brechas significativas**

```
██████████████████░░░░░░░░  72/100
```

| Dimension | Puntuacion | Estado |
|-----------|-----------|--------|
| Consentimiento (Art. 6, 7, 9) | 80% | 🟡 |
| Derechos del interesado (Art. 15-21) | 70% | 🟡 |
| Seguridad del tratamiento (Art. 32) | 55% | 🔴 |
| Transferencias internacionales (Art. 44-49) | 75% | 🟡 |
| Encargados del tratamiento (Art. 28) | 40% | 🔴 |
| Notificacion de brechas (Art. 33-34) | 20% | 🔴 |
| Responsabilidad proactiva (Art. 25, 35) | 65% | 🟡 |

### 3.2 Puntos fuertes

- **Consentimiento biometrico granular (Art. 9.2.a):** Formulario interactivo con 3 checkboxes independientes (voz, rostro, personalidad). Cada uno almacena timestamp, IP y User-Agent.
- **Versionado de consentimiento:** `CURRENT_CONSENT_VERSION = '2.0'` permite rastrear cambios en las condiciones.
- **Auditoria de consentimiento:** Subcoleccion `users/{uid}/consents/{id}` con campos `signedAt`, `ipAddress`, `userAgent`.
- **Eliminacion de cuenta en cascada:** Transaccion atomica de Firestore que borra perfil, capsulas, contenido y avatar.
- **Politica de privacidad completa:** 13 secciones cubriendo Art. 15-21, Art. 44-49, Art. 96 LOPDGDD.
- **Endpoint de exportacion:** `/api/privacy/export` existe (Art. 20 — portabilidad).
- **Transferencias internacionales:** Declaracion de SCCs para ElevenLabs.

### 3.3 Brechas criticas RGPD

**1. 🔴 Datos biometricos NO eliminados de ElevenLabs al revocar (Art. 9.2.a + Art. 17 + Art. 28)**

Cuando un usuario revoca el consentimiento biometrico, el codigo:
- ✅ Marca `consentWithdrawnAt` en el documento del usuario
- ✅ Registra la revocacion en la subcoleccion de auditorias
- ❌ **NO llama a la API de ElevenLabs para eliminar el voice clone**
- ❌ **NO elimina el modelo facial del proveedor**

Esto incumple el Art. 17 (derecho de supresion) y el Art. 28 (obligaciones del encargado del tratamiento).

**2. 🔴 Creacion de avatar NO bloqueada tras revocacion (Art. 7.3)**

```typescript
// Actualmente NO existe este check:
if (user.aiAvatar?.consentWithdrawnAt) {
  throw new Error('Consent withdrawn — cannot create avatar');
}
```

Un usuario que revoca consentimiento puede volver a crear un avatar sin re-consentir.

**3. 🔴 Promesa de 30 dias de eliminacion biometrica NO enforced**

La politica de privacidad promete eliminar datos biometricos en 30 dias tras revocacion. No existe cron job ni proceso automatizado que lo ejecute.

**4. 🟡 Eliminacion inmediata vs periodo de gracia 30 dias**

Los terminos de servicio prometen un periodo de gracia de 30 dias antes de la eliminacion definitiva. El codigo ejecuta la eliminacion de forma inmediata y atomica, sin soft-delete previo.

**5. 🟡 Cascada de eliminacion incompleta**

| Dato | Eliminado en cascada | Estado |
|------|---------------------|--------|
| Perfil de usuario | ✅ | OK |
| Capsulas | ✅ | OK |
| Contenido de capsulas | ✅ | OK |
| Avatar IA | ✅ | OK |
| Subcoleccion `consents` | ❌ | **Sobrevive** |
| `designated_persons` | ❌ | **Sobrevive** |
| Share tokens | ❌ | **Sobrevive** |
| Archivos en Storage | ✅ | OK |

**6. 🟡 Waitlist sin consentimiento completo**

La entrada de waitlist registra email y nombre pero no captura version de consentimiento, IP ni User-Agent. Insuficiente para demostrar consentimiento informado.

**7. 🔴 Sin procedimiento de notificacion de brechas (Art. 33-34)**

No existe:
- Plantilla de notificacion a la AEPD (72 horas)
- Proceso de comunicacion a los afectados
- Registro de incidentes
- DPO designado

**8. 🟡 POC_REAL sin campos de consentimiento**

La tabla `users` de POC_REAL no tiene campos `terms_accepted_at`, `privacy_accepted_at`, `consent_version`. La migracion de Firebase a Supabase perdera estos datos si no se anade migracion.

### 3.4 Matriz de cumplimiento por articulo

| Articulo RGPD | Descripcion | Estado | Notas |
|---------------|------------|--------|-------|
| Art. 6 | Base legal del tratamiento | 🟢 | Consentimiento explicito |
| Art. 7 | Condiciones del consentimiento | 🟡 | Falta bloqueo post-revocacion |
| Art. 9 | Datos biometricos | 🟡 | Formulario OK, enforcement parcial |
| Art. 13-14 | Informacion al interesado | 🟢 | Politica completa |
| Art. 15 | Derecho de acceso | 🟢 | Export endpoint existe |
| Art. 17 | Derecho de supresion | 🔴 | No elimina de proveedores externos |
| Art. 20 | Portabilidad | 🟡 | Export existe, formato no estandar |
| Art. 25 | Privacidad por diseno | 🟡 | Parcial |
| Art. 28 | Encargado del tratamiento | 🔴 | Sin DPA firmado con ElevenLabs |
| Art. 32 | Seguridad del tratamiento | 🔴 | Firestore rules ausentes |
| Art. 33 | Notificacion de brechas (AEPD) | 🔴 | No existe procedimiento |
| Art. 34 | Comunicacion a interesados | 🔴 | No existe procedimiento |
| Art. 35 | Evaluacion de impacto (DPIA) | 🔴 | No realizada (obligatoria para biometricos) |
| Art. 44-49 | Transferencias internacionales | 🟡 | SCCs declarados, sin verificacion |
| LOPDGDD Art. 96 | Menores (14 anos) | 🟡 | Declarado pero sin verificacion de edad |

---

## 4. Riesgos Tecnicos y Conflictos

### 4.1 Criticos

**RT-01: Firestore security rules NO encontradas en el repositorio**

No existe fichero `firestore.rules` ni `firebase.rules.json` en ninguna ubicacion del repo. Esto implica:
- Las rules fueron desplegadas manualmente (riesgo de drift)
- O la base de datos esta en modo abierto (riesgo de exposicion total)
- No hay versionado ni revision de reglas de seguridad

**Impacto:** Cualquier persona con el ID del proyecto Firebase podria leer/escribir toda la base de datos.

**RT-02: POC_REAL RLS completamente deshabilitado**

Todas las tablas de Supabase en POC_REAL tienen Row Level Security desactivado. Si las credenciales de `anon` key se filtran (estan en el bundle del cliente), cualquier usuario puede:
- Leer todas las capsulas de todos los usuarios
- Modificar o eliminar datos de otros usuarios
- Acceder a informacion de beta invitations

**RT-03: Admin key expuesta en header HTTP**

```typescript
// Ruta /api/beta/invite
const adminKey = request.headers.get('x-admin-key');
if (adminKey !== process.env.SUPABASE_SERVICE_ROLE_KEY) { ... }
```

El `SUPABASE_SERVICE_ROLE_KEY` es una clave con permisos totales sobre la base de datos. Usarla como comparacion en un header HTTP significa que:
- Se transmite en cada peticion de admin
- Visible en logs de servidor/proxy
- No tiene rotacion ni expiracion

**RT-04: Sin rate limiting en rutas beta de POC_REAL**

Las rutas `/api/beta/invite`, `/api/beta/accept`, `/api/beta/complete` no tienen rate limiting. Un atacante podria:
- Fuerza bruta de tokens de invitacion
- Spam de solicitudes OTP
- Enumeracion de emails registrados

### 4.2 Altos

**RT-05: Firebase token refresh ausente en useCapsules**

El hook `useCapsules` establece un listener de Firestore al montar el componente. Los tokens de Firebase expiran tras 1 hora. Si el usuario mantiene la sesion abierta sin recargar, el listener falla silenciosamente.

**RT-06: Sin validacion de input en rutas beta de POC_REAL**

No hay validacion Zod ni siquiera `typeof email === 'string'` en las rutas beta. Un payload malformado podria causar errores no controlados.

**RT-07: Mismatch de campos de consentimiento entre Firebase y Supabase**

| Campo | Firebase (PREREUNION_ANDREA) | Supabase (POC_REAL) |
|-------|------------------------------|---------------------|
| `termsAcceptedAt` | ✅ Timestamp | ❌ No existe |
| `privacyAcceptedAt` | ✅ Timestamp | ❌ No existe |
| `consentVersion` | ✅ String | ❌ No existe |
| `consentSource` | ✅ String | ❌ No existe |

La migracion de Firebase a Supabase perdera datos de consentimiento criticos para RGPD.

**RT-08: Race condition en Google OAuth pending consent**

Si el usuario cierra el navegador durante el flujo de consentimiento de Google OAuth, queda en estado `pendingConsent` sin mecanismo de limpieza. `pendingFirebaseUser` persiste en estado de React pero se pierde al recargar, dejando una cuenta de Firebase sin perfil en Firestore.

### 4.3 Medios

| ID | Riesgo | Impacto | Mitigacion sugerida |
|----|--------|---------|---------------------|
| RT-09 | Firebase SDK 489KB en bundle | Performance (LCP) | Lazy loading de modulos no criticos |
| RT-10 | Sin `React.memo` en grid de capsulas | Re-renders innecesarios | Memoizar componentes de lista |
| RT-11 | `useCapsules` dedup crea array nuevo | Rompe `===` comparison, triggers re-renders | `useMemo` con dependencia estable |
| RT-12 | Sin E2E tests en CI | Regresiones no detectadas | Playwright en GitHub Actions |
| RT-13 | Sin `.env.example` | Onboarding lento, errores de config | Crear template sin secretos |
| RT-14 | Middleware POC_REAL falla silencioso | Auth bypass si Supabase no responde | Logging explicito + fail-closed verificado |
| RT-15 | Seed script no establece `file_size_bytes` | Calculos de storage inexactos | Actualizar seed con tamanos reales |
| RT-16 | `.next` cache se corrompe en Windows | Build failures intermitentes | `rm -rf .next` en script de dev |

### 4.4 TODOs y FIXMEs en el codigo

Se realizo una busqueda exhaustiva de `TODO`, `FIXME`, `HACK` y `XXX` en todos los archivos TypeScript y JavaScript del repositorio.

**Resultado: No se encontraron comentarios TODO/FIXME en el codigo fuente.**

Esto puede interpretarse de dos formas:
1. **Positivo:** El codigo no tiene deuda tecnica pendiente marcada.
2. **Preocupante:** La deuda tecnica existe (documentada en esta auditoria) pero no esta marcada en el codigo, lo que dificulta su descubrimiento por otros desarrolladores.

**Recomendacion:** Anadir `// TODO(audit-v4):` en los puntos criticos identificados en esta auditoria para que sean visibles durante el desarrollo.

---

## 5. Delta v4 — Cambios de Andrea vs Codigo Actual

> **Esta es la seccion mas importante de la auditoria.** El PDF `NUCLEA_Explicacion_Modelo_Limpio_v4.pdf` de Andrea introduce cambios fundamentales que redefinen la arquitectura de la plataforma.

### 5.1 Nuevo actor: RECEPTOR

**Modelo v4 de Andrea:**
La capsula se envia como **regalo**. El receptor recibe una invitacion (email/SMS/WhatsApp) y debe crear cuenta para reclamarla. La capsula deja de ser un objeto personal para convertirse en un **objeto transferible con destinatario**.

**Codigo actual:**
Las capsulas son 100% propiedad del creador. No existe concepto de receptor, ni flujo de invitacion para reclamar, ni modelo de transferencia de ownership.

**Impacto arquitectural:**

```typescript
// Modelo actual
interface Capsule {
  user_id: string;       // Owner unico
}

// Modelo v4 requerido
interface Capsule {
  creator_id: string;    // Quien la creo
  receiver_id?: string;  // Quien la recibe (null hasta claim)
  claimed_at?: string;   // Timestamp de reclamacion
  invitation_token?: string; // Token de invitacion (hash)
}
```

Requiere:
- Nuevo modelo de ownership dual (creator + receiver)
- Sistema de invitaciones con tokens seguros
- Flujo de claim (crear cuenta → reclamar capsula)
- Permisos diferenciados: creator puede configurar, receiver puede ver/interactuar
- Logica de que pasa si el receptor no reclama

**Esfuerzo estimado:** Alto (2-3 sprints)

### 5.2 Periodo de experiencia 30 dias

**Modelo v4 de Andrea:**
Tras reclamar la capsula, el receptor tiene 30 dias con acceso completo sin necesidad de suscripcion. Es un periodo de "experiencia" para decidir que hacer con la capsula.

**Codigo actual:**
No existe TTL en capsulas. El campo `closed_at` existe pero no se usa para expiracion automatica. La funcion SQL `expire_old_messages()` existe pero sin cron job asociado.

**Impacto arquitectural:**

```typescript
// Campos necesarios
interface Capsule {
  claimed_at: string;           // Inicio del periodo
  experience_expires_at: string; // claimed_at + 30 dias
  experience_status: 'active' | 'expiring_soon' | 'expired';
}
```

Requiere:
- Campo `claimed_at` timestamp
- Calculo automatico de `experience_expires_at`
- Cron job de expiracion (Supabase pg_cron o Edge Function scheduled)
- UI de countdown visible para el receptor
- Notificaciones pre-expiracion (7d, 3d, 1d)

**Esfuerzo estimado:** Medio (1-2 sprints)

### 5.3 Tres opciones del receptor

**Modelo v4 de Andrea:**
Al recibir la capsula, el receptor tiene 3 caminos:

| Opcion | Descripcion | Monetizacion |
|--------|------------|-------------|
| **A. Continuar Herencia Emocional** | Anadir nuevos recuerdos a la capsula | Suscripcion o gratis? (por confirmar) |
| **B. Descargar Video Regalo** | Pelicula emocional generada por IA | Pago unico (mini-trailer gratis) |
| **C. No hacer nada** | La capsula sigue su ciclo natural | Gratis (expira en 30 dias) |

**Codigo actual:**
Solo existe "Cerrar y descargar ZIP". No hay video generation, no hay continuation flow, no hay payment gateway.

**Impacto:**
- Opcion A: Requiere nuevo modelo de permisos (receptor puede anadir contenido)
- Opcion B: Requiere pipeline completo de media (ver seccion 5.4)
- Opcion C: Requiere expiracion automatica (ver seccion 5.2)

### 5.4 Video Regalo

**Modelo v4 de Andrea:**
Pelicula cinematografica emocional generada por IA a partir del contenido de la capsula. El receptor:
1. Ve un **mini-trailer gratis** (preview)
2. Paga un **pago unico** por el video completo
3. Una vez descargado, NUCLEA **elimina su copia** del servidor

**Codigo actual:**
No existe. Cero infraestructura de generacion de video.

**Impacto arquitectural (Muy Alto):**

```
Pipeline requerido:
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Contenido  │────→│  Media       │────→│  Video      │
│  capsula    │     │  Processing  │     │  Output     │
│  (fotos,    │     │  (ffmpeg +   │     │  (MP4/WebM) │
│   textos,   │     │   AI model)  │     │             │
│   audio)    │     │              │     │             │
└─────────────┘     └──────────────┘     └─────┬───────┘
                                               │
                    ┌──────────────┐            │
                    │  Stripe      │←───────────┘
                    │  Payment     │  (pago unico)
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │  Delivery    │
                    │  + Auto-     │
                    │  delete      │
                    └──────────────┘
```

Componentes necesarios:
- **Media pipeline:** ffmpeg para composicion + modelo IA para narrativa/musica
- **Storage temporal:** Para renders en progreso (puede ser costoso)
- **Payment gateway:** Stripe (pago unico, no suscripcion)
- **Mini-trailer generator:** Version reducida (30s?) del video completo
- **Delivery system:** Link de descarga temporal con auto-eliminacion
- **Job queue:** Generacion asincrona (puede tardar minutos)

**Esfuerzo estimado:** Muy Alto (4-6 sprints minimo)

### 5.5 Sistema de avisos multicanal

**Modelo v4 de Andrea:**
Email + SMS + WhatsApp Business (con opt-in). Notificaciones para:
- Capsula recibida (invitacion al receptor)
- Recordatorios de tiempo (periodo de 30 dias)
- Aviso pre-expiracion
- Contactos de confianza (inactividad)

**Codigo actual:**
Solo email basico en waitlist. No hay SMS, no hay WhatsApp Business, no hay motor de notificaciones.

**Impacto arquitectural:**

| Canal | Proveedor sugerido | Coste aprox. | Complejidad |
|-------|-------------------|-------------|-------------|
| Email transaccional | SendGrid / Resend | ~€20/mes | Baja |
| SMS | Twilio | ~€0.07/SMS | Media |
| WhatsApp Business | Meta Business API | €0.05-0.15/msg | Alta (aprobacion) |

Requiere:
- Servicio de notificaciones centralizado
- Gestion de preferencias de opt-in por usuario
- Templates por canal y tipo de notificacion
- Scheduled sends (cron jobs para recordatorios)
- Fallback chain (WhatsApp → SMS → Email)

**Nota importante:** WhatsApp Business API requiere proceso de aprobacion por Meta (2-4 semanas) y cuenta Business verificada.

**Esfuerzo estimado:** Alto (2-3 sprints)

### 5.6 Contactos de confianza universales

**Modelo v4 de Andrea:**
Todas las capsulas **excepto Social** tienen contactos de confianza. Si hay inactividad prolongada del creador, NUCLEA avisa a los contactos para que decidan que hacer con la capsula.

**Codigo actual:**
La tabla `designated_persons` existe en POC_REAL pero esta orientada exclusivamente a post-mortem (capsulas legacy). No hay deteccion de inactividad ni notificacion a contactos.

**Impacto:**

```typescript
// Actual: solo legacy
type CapsuleTypesWithContacts = 'legacy';

// v4: todos excepto social
type CapsuleTypesWithContacts = 'legacy' | 'together' | 'pet' | 'life-chapter' | 'origin';
```

Requiere:
- Extender `designated_persons` a 5 de 6 tipos de capsula
- Detector de inactividad (ultimo login, ultima interaccion)
- Umbral configurable de inactividad por tipo de capsula
- Flujo de notificacion a contactos de confianza
- Interfaz para que contactos decidan (descargar, continuar, eliminar)

**Esfuerzo estimado:** Bajo-Medio (1 sprint para extension, 1 sprint para inactividad)

### 5.7 Expiracion limpia

**Modelo v4 de Andrea:**
Ciclo completo: aviso previo → periodo de gracia → eliminacion limpia de todo el contenido.

**Codigo actual:**
- Funcion SQL `expire_old_messages()` existe pero **sin cron job**
- No hay avisos previos
- No hay periodo de gracia
- No hay eliminacion en cascada de storage

**Impacto:**

| Fase | Implementada | Requerida |
|------|-------------|-----------|
| Aviso 7 dias antes | ❌ | Notificacion email/SMS/WhatsApp |
| Aviso 3 dias antes | ❌ | Notificacion escalada |
| Aviso 1 dia antes | ❌ | Notificacion urgente |
| Expiracion automatica | ❌ Parcial (SQL sin cron) | pg_cron + Edge Function |
| Eliminacion de storage | ❌ | Cascade delete de archivos |
| Audit log | ❌ | Registro de que se elimino y cuando |

**Esfuerzo estimado:** Medio (1-2 sprints)

### 5.8 Modelo de monetizacion implicito

**Modelo v4 de Andrea:**
El PDF **NO menciona planes de suscripcion** (Free/Esencial/Familiar/EverLife). La monetizacion implicita es por **pago unico del Video Regalo**.

**Codigo actual:**
4 planes de suscripcion definidos y parcialmente enforced:

```typescript
const PLANS = {
  free:      { price: 0,     capsules: 1,  storage: '500MB' },
  esencial:  { price: 9.99,  capsules: 2,  storage: '5GB'   },
  familiar:  { price: 24.99, capsules: 10, storage: '50GB'  },
  everlife:  { price: 99,    capsules: 1,  storage: '100GB' }, // pago unico
};
```

**Impacto:** Posible pivote completo del modelo de negocio:

| Aspecto | Modelo actual (suscripcion) | Modelo v4 (transaccional) |
|---------|---------------------------|--------------------------|
| Ingreso recurrente | ✅ MRR predecible | ❌ No hay MRR |
| Barrera de entrada | Media (plan mensual) | Baja (gratis hasta pagar video) |
| Coste de adquisicion | Pago antes de valor | Valor antes de pago |
| Escalabilidad | Limitada por churn | Depende de volumen de regalos |
| Storage cost | Continuo (suscripcion cubre) | Temporal (30 dias max) |

**REQUIERE DECISION DE NEGOCIO antes de cualquier implementacion.**

### 5.9 Tabla de impacto v4

| Cambio v4 | Existe en codigo | Esfuerzo estimado | Riesgo |
|-----------|-----------------|-------------------|--------|
| Actor Receptor + invite flow | ❌ NO | Alto (2-3 sprints) | 🔴 Reestructura ownership |
| Periodo 30 dias + TTL | ⚠️ Parcial (`expire` SQL) | Medio (1-2 sprints) | 🟡 Cron + notifications |
| Continuar herencia (add memories) | ❌ NO | Medio (1-2 sprints) | 🟡 Modelo de permisos |
| Video Regalo (AI generation) | ❌ NO | Muy Alto (4-6 sprints) | 🔴 Pipeline IA + payment |
| Mini-trailer preview | ❌ NO | Alto (2-3 sprints) | 🔴 Media processing |
| Payment (pago unico) | ❌ NO | Medio (1 sprint) | 🟡 Stripe integration |
| WhatsApp Business notifications | ❌ NO | Alto (2-3 sprints) | 🔴 Aprobacion Meta |
| SMS notifications | ❌ NO | Medio (1 sprint) | 🟡 Twilio/similar |
| Contactos confianza (all types) | ⚠️ Parcial (legacy only) | Bajo (0.5 sprint) | 🟢 Extension existente |
| Inactivity detection | ❌ NO | Medio (1 sprint) | 🟡 Scheduled jobs |
| Expiracion con avisos | ⚠️ Parcial (SQL function) | Medio (1-2 sprints) | 🟡 Notifications + cron |
| Modelo transaccional vs suscripcion | ❌ NO (suscripcion actual) | Alto (2-3 sprints) | 🔴 Pivote de negocio |

**Estimacion total v4:** 16-28 sprints (4-7 meses con equipo de 2 desarrolladores)

**Ruta critica:** Receptor invite flow → TTL 30 dias → Payment → Video Regalo

---

## 6. Preguntas para Andrea

Antes de iniciar la implementacion del modelo v4, es imprescindible aclarar los siguientes puntos con Andrea:

### P1: Modelo de monetizacion

> El modelo de suscripcion actual (Free/Esencial/Familiar/EverLife) desaparece? O convive con el pago del Video Regalo?
>
> **Por que importa:** Si desaparece, hay que retirar toda la logica de planes, limites de capsulas y cuotas de storage. Si convive, hay que definir que cubre la suscripcion y que cubre el pago unico.

### P2: Visibilidad del creador post-envio

> El creador puede ver la capsula despues de enviarla al receptor? O pierde acceso completamente?
>
> **Por que importa:** Define el modelo de permisos. Acceso dual requiere ACL; transferencia completa es mas simple pero el creador pierde sus propios recuerdos.

### P3: Coste de "Continuar Herencia Emocional"

> "Continuar Herencia Emocional" — el receptor paga por esto? Es gratuito dentro de los 30 dias? Requiere suscripcion despues?
>
> **Por que importa:** Si requiere suscripcion, el modelo de suscripcion NO desaparece — se desplaza del creador al receptor. Cambia completamente el funnel.

### P4: Expiracion y contactos de confianza

> Si el receptor no hace nada en 30 dias, la capsula se elimina permanentemente? O los contactos de confianza reciben aviso antes de la eliminacion?
>
> **Por que importa:** Determina si la expiracion es automatica o requiere un paso intermedio con los contactos. Afecta la complejidad del flujo de expiracion.

### P5: Personalizacion del Video Regalo

> El Video Regalo — que nivel de personalizacion tiene el receptor? Solo pulsar "generar"? O puede elegir musica, orden de fotos, estilo visual?
>
> **Por que importa:** Un boton de "generar" es un MVP viable. Personalizacion completa multiplica x5 la complejidad del pipeline de media.

### P6: Contactos de confianza del receptor

> Los contactos de confianza del receptor son los mismos que designo el creador? O el receptor puede designar los suyos propios?
>
> **Por que importa:** Si son los del creador, el receptor no tiene control sobre quien recibe notificaciones de su inactividad. Si son propios, se duplica la gestion de contactos.

### P7: Capsulas multi-receptor

> Que pasa si el creador quiere enviar la misma capsula a multiples receptores? Cada uno recibe una copia? O es la misma capsula compartida?
>
> **Por que importa:** Copia implica duplicacion de storage y generacion independiente de videos. Compartida implica modelo de permisos multi-usuario complejo.

---

*Generado el 21 de febrero de 2026 — Auditoria Arquitectural v4*
*Herramienta: Claude Code (Opus 4.6) — Analisis estatico del repositorio nuclea*
