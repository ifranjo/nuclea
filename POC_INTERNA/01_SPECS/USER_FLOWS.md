# Flujos de Usuario NUCLEA

Documentación completa de todos los flujos de usuario en la aplicación.

## Flujo principal: Primera apertura

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FLUJO DE ONBOARDING                          │
└─────────────────────────────────────────────────────────────────────┘

[App Launch]
     │
     ▼
┌─────────────────────────────────────┐
│ PANTALLA 1: Cápsula Cerrada        │
│                                     │
│ • Fondo blanco puro                 │
│ • Cápsula metálica centrada         │
│ • Sin UI visible                    │
│ • Texto "NUCLEA" grabado            │
│                                     │
│ Interacción: TAP en cápsula         │
│ Duración máxima: indefinida         │
└─────────────────────────────────────┘
     │
     │ [TAP]
     ▼
┌─────────────────────────────────────┐
│ PANTALLA 2: Animación Apertura     │
│                                     │
│ • Cápsula se separa horizontalmente │
│ • Polaroids emergen del centro      │
│ • Flotan con rotación suave         │
│ • Globos de diálogo aparecen        │
│                                     │
│ Duración: ~4 segundos               │
│ Auto-avanza a P3                    │
└─────────────────────────────────────┘
     │
     │ [AUTO]
     ▼
┌─────────────────────────────────────┐
│ PANTALLA 3: Manifiesto             │
│                                     │
│ • Cápsula cerrada arriba (pequeña)  │
│ • "Somos las historias que          │
│    recordamos."                     │
│ • "Haz que las tuyas permanezcan."  │
│ • Texto explicativo centrado        │
│ • "NUCLEA transforma recuerdos      │
│    en legado."                      │
│                                     │
│ Interacción: Scroll down o TAP      │
└─────────────────────────────────────┘
     │
     │ [SCROLL/TAP]
     ▼
┌─────────────────────────────────────┐
│ PANTALLA 4: Selección de Cápsula   │
│                                     │
│ Header:                             │
│ • Menú hamburguesa (izq)            │
│ • "NUCLEA" centrado                 │
│                                     │
│ Contenido:                          │
│ • Tagline                           │
│ • "Elige tu cápsula"                │
│ • 6 cards de selección              │
│   - Legacy Capsule                  │
│   - Life Chapter Capsule            │
│   - Together Capsule                │
│   - Social Capsule                  │
│   - Pet Capsule                     │
│   - Origin Capsule                  │
│ • "Aquí guardas lo que no           │
│    quieres perder"                  │
│                                     │
│ Interacción: TAP en card            │
└─────────────────────────────────────┘
     │
     │ [SELECT CAPSULE TYPE]
     ▼
```

## Flujo: Creación de cápsula

```
┌─────────────────────────────────────────────────────────────────────┐
│                     FLUJO DE CREACIÓN                               │
└─────────────────────────────────────────────────────────────────────┘

[Desde P4: Selección]
     │
     ▼
┌─────────────────────────────────────┐
│ PANTALLA TIPO: Detalle Cápsula     │
│                                     │
│ • Flecha atrás                      │
│ • Título del tipo                   │
│ • Subtítulo emocional               │
│ • Imagen cápsula específica         │
│ • Descripción larga                 │
│ • Funcionalidades específicas       │
│ • [Crear esta cápsula]              │
│ • Nota al pie                       │
│                                     │
│ Interacción: TAP en botón           │
└─────────────────────────────────────┘
     │
     │ [CREATE CAPSULE]
     ▼
┌─────────────────────────────────────┐
│ GATE: ¿Usuario autenticado?        │
│                                     │
│ • SÍ → Ir a Legal                   │
│ • NO → Ir a Registro                │
└─────────────────────────────────────┘
     │
     ├──────── [NO AUTH] ────────┐
     │                           │
     ▼                           ▼
┌───────────────────┐   ┌───────────────────┐
│ REGISTRO          │   │ LEGAL             │
│                   │   │                   │
│ • Logo NUCLEA     │   │ • "Tu historia es │
│ • "Crea tu cuenta"│   │    tuya. Y solo   │
│ • Email           │   │    tuya."         │
│ • Contraseña x2   │   │ • Privacidad      │
│ • [Crear cuenta]  │   │ • Personas        │
│ • --- o ---       │   │   designadas      │
│ • Apple Sign In   │   │ • Entrega auto    │
│ • Google Sign In  │   │ • Responsabilidad │
│ • "¿Ya tienes...?"│   │ • [He leído y     │
│                   │   │    acepto]        │
└───────────────────┘   └───────────────────┘
     │                           │
     └───────────┬───────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│ SUSCRIPCIÓN Y PAGO                 │
│                                     │
│ • Tipo de cápsula                   │
│ • Duración (ej: 3 meses)            │
│ • Precio total                      │
│ • "Renueva automáticamente..."      │
│                                     │
│ Método de pago:                     │
│ • Apple Pay                         │
│ • Tarjeta bancaria                  │
│ • Bizum                             │
│                                     │
│ • País de residencia                │
│ • Datos facturación                 │
│ • [ ] Acepto términos               │
│ • [ ] He leído privacidad           │
│ • "Nunca venderemos..."             │
│ • [Pagar y activar cápsula]         │
│ • "Puedes cancelar..."              │
└─────────────────────────────────────┘
     │
     │ [PAYMENT SUCCESS]
     ▼
┌─────────────────────────────────────┐
│ CÁPSULA ACTIVA                     │
│                                     │
│ • Flecha atrás / Menú (...)         │
│ • Imagen cápsula específica         │
│ • Nombre cápsula                    │
│                                     │
│ Acciones:                           │
│ • [Subir foto]                      │
│ • [Subir video]                     │
│ • [Grabar audio]                    │
│ • [Escribir nota]                   │
│                                     │
│ Calendario:                         │
│ • Vista mensual                     │
│ • Días con contenido marcados       │
│                                     │
│ • [+ Añadir persona]                │
└─────────────────────────────────────┘
```

## Flujo: Añadir contenido

```
┌─────────────────────────────────────────────────────────────────────┐
│                     FLUJO DE CONTENIDO                              │
└─────────────────────────────────────────────────────────────────────┘

[Desde Cápsula Activa]
     │
     ├─── [Subir foto] ───┐
     │                    ▼
     │    ┌─────────────────────────────┐
     │    │ Galería del dispositivo    │
     │    │ • Selección múltiple       │
     │    │ • Preview                   │
     │    │ • [Añadir]                  │
     │    └─────────────────────────────┘
     │
     ├─── [Subir video] ──┐
     │                    ▼
     │    ┌─────────────────────────────┐
     │    │ Galería / Grabar           │
     │    │ • Límite según plan        │
     │    │ • Compresión automática    │
     │    │ • [Añadir]                  │
     │    └─────────────────────────────┘
     │
     ├─── [Grabar audio] ─┐
     │                    ▼
     │    ┌─────────────────────────────┐
     │    │ Grabadora                   │
     │    │ • Waveform visual           │
     │    │ • Pausa/Resume              │
     │    │ • [Guardar]                 │
     │    └─────────────────────────────┘
     │
     └─── [Escribir nota] ┐
                          ▼
         ┌─────────────────────────────┐
         │ Editor de texto             │
         │ • Rich text básico          │
         │ • Fecha automática          │
         │ • [Guardar]                  │
         └─────────────────────────────┘
```

## Flujo: Cierre de cápsula

```
┌─────────────────────────────────────────────────────────────────────┐
│                     FLUJO DE CIERRE                                 │
└─────────────────────────────────────────────────────────────────────┘

[Desde menú (...) de Cápsula Activa]
     │
     ▼
┌─────────────────────────────────────┐
│ CONFIRMAR CIERRE                   │
│                                     │
│ "¿Estás seguro de que quieres      │
│  cerrar esta cápsula?"             │
│                                     │
│ • No podrás añadir más recuerdos   │
│ • Se generará el archivo final     │
│ • Podrás descargarlo               │
│                                     │
│ [Cancelar]  [Cerrar cápsula]        │
└─────────────────────────────────────┘
     │
     │ [CONFIRM]
     ▼
┌─────────────────────────────────────┐
│ PROCESANDO                         │
│                                     │
│ • Empaquetando contenido...         │
│ • Generando archivo NUCLEA...       │
│ • Progress bar                      │
└─────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────┐
│ DESCARGAR CÁPSULA                  │
│                                     │
│ "Tu cápsula está lista"            │
│                                     │
│ • Tamaño del archivo                │
│ • [Descargar ahora]                 │
│ • "Tienes 30 días para descargar"  │
│                                     │
│ IMPORTANTE:                         │
│ "Después de la descarga, el        │
│  contenido se eliminará de         │
│  nuestros servidores."             │
└─────────────────────────────────────┘
     │
     │ [DOWNLOAD]
     ▼
┌─────────────────────────────────────┐
│ CÁPSULA CERRADA                    │
│                                     │
│ • Archivo en dispositivo            │
│ • NUCLEA actúa como visor           │
│ • No ocupa espacio en servidor      │
│ • Mensajes futuros siguen activos   │
│   (si los hay)                      │
└─────────────────────────────────────┘
```

## Flujo: Mensajes futuros (Legacy only)

```
┌─────────────────────────────────────────────────────────────────────┐
│                     FLUJO MENSAJES FUTUROS                          │
└─────────────────────────────────────────────────────────────────────┘

[Desde Cápsula Legacy Activa]
     │
     ▼
┌─────────────────────────────────────┐
│ CREAR MENSAJE FUTURO               │
│                                     │
│ Tipo:                               │
│ • Video / Audio / Texto             │
│                                     │
│ Destinatario:                       │
│ • Seleccionar persona               │
│ • Email de contacto                 │
│                                     │
│ Fecha de apertura:                  │
│ • Selector de fecha                 │
│ • "Se abrirá el DD/MM/AAAA"        │
│                                     │
│ [Grabar/Escribir mensaje]           │
│ [Programar]                         │
└─────────────────────────────────────┘
     │
     │ [SCHEDULE]
     ▼
┌─────────────────────────────────────┐
│ MENSAJE EN CUSTODIA                │
│                                     │
│ • Cifrado y bloqueado               │
│ • Candado + fecha visible           │
│ • Creador puede editar/borrar       │
│ • Destinatario no puede ver         │
└─────────────────────────────────────┘
     │
     │ [FECHA LLEGA]
     ▼
┌─────────────────────────────────────┐
│ DESBLOQUEO AUTOMÁTICO              │
│                                     │
│ • Sistema detecta fecha             │
│ • Descifra contenido                │
│ • Notifica destinatario             │
│   - Push notification               │
│   - Email con enlace seguro         │
└─────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────┐
│ VENTANA DE DESCARGA                │
│                                     │
│ • 30 días para acceder              │
│ • Destinatario descarga             │
│ • Tras plazo: borrado servidor      │
└─────────────────────────────────────┘
```

## Estados de cápsula

```
┌─────────────────────────────────────────────────────────────────────┐
│                     ESTADOS DE CÁPSULA                              │
└─────────────────────────────────────────────────────────────────────┘

[DRAFT]
   │ Usuario crea cápsula pero no completa pago
   │
   ▼
[ACTIVE]
   │ Cápsula pagada, usuario añade contenido
   │
   ├─────────────────────────┐
   │                         │
   ▼                         ▼
[CLOSED]                [EXPIRED]
   │ Usuario cierra          │ Suscripción no renovada
   │ voluntariamente         │ (grace period)
   │                         │
   ▼                         ▼
[DOWNLOADED]            [ARCHIVED]
   │ Archivo en              │ Contenido preservado
   │ dispositivo             │ pero sin acceso
   │                         │
   ▼                         │
[DELETED_FROM_SERVER]        │
   │ Solo visor local        │
   │ Mensajes futuros        │
   │ siguen en custodia      │
   │                         │
   └─────────┬───────────────┘
             │
             ▼
      [FULLY_COMPLETED]
         Todos los mensajes
         futuros entregados
         Borrado total
```

## Navegación global

```
┌─────────────────────────────────────────────────────────────────────┐
│                     MENÚ HAMBURGUESA                                │
└─────────────────────────────────────────────────────────────────────┘

≡ Menú
├── Mis cápsulas
│   ├── [Cápsula 1] - Activa
│   ├── [Cápsula 2] - Cerrada
│   └── [+ Crear nueva]
├── Mi cuenta
│   ├── Perfil
│   ├── Suscripciones
│   └── Métodos de pago
├── Configuración
│   ├── Notificaciones
│   ├── Privacidad
│   └── Personas designadas
├── Ayuda
│   ├── FAQ
│   ├── Contacto
│   └── Tutorial
└── Cerrar sesión
```

---

*Basado en análisis de 12 PDFs de Andrea + video demo*
