import type { CapsuleType } from '@/types'

export interface CapsuleDetailContent {
  type: CapsuleType
  title: string
  tagline: string
  summary: string
  features: string[]
}

export const CAPSULE_DETAIL_CONTENT: Record<CapsuleType, CapsuleDetailContent> = {
  legacy: {
    type: 'legacy',
    title: 'Legacy Capsule',
    tagline: 'Para que tu historia siga presente.',
    summary:
      'Funciona como un diario personal para guardar mensajes, fotos, videos y recuerdos que quieres que perduren en el tiempo.',
    features: [
      'Entrega manual, programada o por inactividad.',
      'Mensajes futuros con fecha de desbloqueo.',
      'Multiples destinatarios con control de acceso.',
    ],
  },
  together: {
    type: 'together',
    title: 'Together Capsule',
    tagline: 'Una cápsula creada para parejas.',
    summary:
      'Pensada para guardar la historia de una relacion y abrirla en un momento especial como aniversario, boda o regalo.',
    features: [
      'Modo compartido y modo regalo.',
      'Creacion conjunta o individual.',
      'Fecha de apertura configurable.',
    ],
  },
  social: {
    type: 'social',
    title: 'Social Capsule',
    tagline: 'Momentos que compartimos con amigos.',
    summary:
      'Espacio para compartir momentos con amigos o familia y conservar experiencias como viajes, fiestas o etapas de vida.',
    features: [
      'Colaboracion multiusuario.',
      'Timeline compartido cronologico.',
      'Invitaciones por enlace o email.',
    ],
  },
  pet: {
    type: 'pet',
    title: 'Pet Capsule',
    tagline: 'Momentos que compartimos con nuestras mascotas.',
    summary:
      'Disenada para preservar recuerdos de mascotas: fotos, videos, audios y momentos que representan amor incondicional.',
    features: [
      'Perfil de mascota y galeria de recuerdos.',
      'Modo memorial opcional.',
      'Compartir con familia de forma controlada.',
    ],
  },
  'life-chapter': {
    type: 'life-chapter',
    title: 'Life Chapter Capsule',
    tagline: 'Para guardar etapas de tu vida.',
    summary:
      'Permite documentar etapas concretas como maternidad, viaje, superacion o cualquier antes y despues importante.',
    features: [
      'Templates por etapa.',
      'Hitos y timeline por capitulo.',
      'Entrega futura configurable.',
    ],
  },
  origin: {
    type: 'origin',
    title: 'Origin Capsule',
    tagline: 'Una cápsula creada por padres para sus hijos.',
    summary:
      'Creada por padres para guardar la historia de sus hijos desde el nacimiento y entregarla cuando llegue el momento.',
    features: [
      'Recuerdos por etapa de crecimiento.',
      'Mensajes para momentos clave.',
      'Entrega por edad o fecha objetivo.',
    ],
  },
}

