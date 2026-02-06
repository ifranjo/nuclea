export type CapsuleType = 'legacy' | 'together' | 'social' | 'pet' | 'life-chapter' | 'origin'

export type OnboardingStep = 1 | 2 | 3 | 4

export interface CapsuleTypeInfo {
  id: CapsuleType
  name: string
  tagline: string
  description: string
}

export const CAPSULE_TYPES: CapsuleTypeInfo[] = [
  {
    id: 'legacy',
    name: 'Legacy Capsule',
    tagline: 'Para que tu historia siga presente.',
    description: 'Tu diario personal para guardar mensajes, fotos, vídeos y todo aquello que quieras que perdure.',
  },
  {
    id: 'life-chapter',
    name: 'Life Chapter Capsule',
    tagline: 'Para guardar etapas de tu vida.',
    description: 'Guarda esos capítulos importantes que merecen ser recordados y entendidos con el tiempo.',
  },
  {
    id: 'together',
    name: 'Together Capsule',
    tagline: 'Una cápsula creada para parejas.',
    description: 'Un espacio íntimo donde guardar la historia de vuestro amor.',
  },
  {
    id: 'social',
    name: 'Social Capsule',
    tagline: 'Momentos que compartimos con amigos.',
    description: 'Una cápsula para compartir todo con familia o amigos y que perdure en el tiempo.',
  },
  {
    id: 'pet',
    name: 'Pet Capsule',
    tagline: 'Momentos que compartimos con nuestras mascotas.',
    description: 'Guarda recuerdos de tu mascota: fotos, vídeos, audios y momentos compartidos.',
  },
  {
    id: 'origin',
    name: 'Origin Capsule',
    tagline: 'Una cápsula creada por padres para sus hijos.',
    description: 'Un espacio donde conservar recuerdos, palabras, imágenes y mensajes que acompañan cada etapa de su vida.',
  },
]
