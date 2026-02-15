'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-[100dvh] overflow-y-auto bg-white">
      {/* Top Bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-[#E5E5E5] px-6 py-4">
        <div className="flex items-center gap-3 mb-4">
          <Link
            href="/onboarding/legal"
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-[#1A1A1A]" />
          </Link>
        </div>
        <h1 className="text-2xl font-semibold text-[#1A1A1A] mb-1">
          Política de Privacidad
        </h1>
        <p className="text-sm text-[#9A9A9A]">
          Última actualización: febrero 2026
        </p>
      </div>

      {/* Content */}
      <div className="px-6 pt-6">
        {/* Section 1 */}
        <div className="border-b border-[#E5E5E5] pb-6 mb-6">
          <h2 className="text-lg font-semibold text-[#1A1A1A] mb-2">
            1. Datos que recopilamos
          </h2>
          <p className="text-sm text-[#6B6B6B] leading-relaxed">
            NUCLEA recopila únicamente la información necesaria para ofrecerte
            el servicio: tu dirección de correo electrónico, nombre de usuario,
            y el contenido que decides guardar en tus cápsulas (fotos, vídeos,
            audios y notas de texto).
          </p>
          <p className="text-sm text-[#6B6B6B] leading-relaxed mt-3">
            No recopilamos datos de ubicación, contactos del dispositivo ni
            información de navegación fuera de la aplicación.
          </p>
        </div>

        {/* Section 2 */}
        <div className="border-b border-[#E5E5E5] pb-6 mb-6">
          <h2 className="text-lg font-semibold text-[#1A1A1A] mb-2">
            2. Cómo usamos tus datos
          </h2>
          <p className="text-sm text-[#6B6B6B] leading-relaxed">
            Tu contenido es tuyo. Lo almacenamos exclusivamente para que puedas
            acceder a él desde tus dispositivos. No utilizamos tu contenido para
            entrenar modelos de inteligencia artificial, ni lo compartimos con
            terceros con fines publicitarios.
          </p>
          <p className="text-sm text-[#6B6B6B] leading-relaxed mt-3">
            Los datos de tu cuenta se utilizan para gestionar tu suscripción,
            enviarte notificaciones sobre tus cápsulas y comunicarnos contigo si
            es necesario.
          </p>
        </div>

        {/* Section 3 */}
        <div className="border-b border-[#E5E5E5] pb-6 mb-6">
          <h2 className="text-lg font-semibold text-[#1A1A1A] mb-2">
            3. Almacenamiento y seguridad
          </h2>
          <p className="text-sm text-[#6B6B6B] leading-relaxed">
            Todo el contenido se almacena cifrado en reposo. Las transferencias
            se realizan mediante conexiones seguras (TLS 1.3). Implementamos
            medidas de seguridad estándar de la industria para proteger tus
            datos.
          </p>
          <p className="text-sm text-[#6B6B6B] leading-relaxed mt-3">
            Cuando cierras una cápsula y la descargas, el contenido se elimina
            de nuestros servidores en un plazo máximo de 30 días.
          </p>
        </div>

        {/* Section 4 */}
        <div className="border-b border-[#E5E5E5] pb-6 mb-6">
          <h2 className="text-lg font-semibold text-[#1A1A1A] mb-2">
            4. Personas designadas
          </h2>
          <p className="text-sm text-[#6B6B6B] leading-relaxed">
            Si utilizas la función de personas designadas, almacenamos la
            información de contacto que proporcionas (correo electrónico) de
            dichas personas. Estas personas solo recibirán acceso al contenido
            que tú explícitamente les asignes, en la fecha que determines.
          </p>
        </div>

        {/* Section 5 */}
        <div className="border-b border-[#E5E5E5] pb-6 mb-6">
          <h2 className="text-lg font-semibold text-[#1A1A1A] mb-2">
            5. Tus derechos
          </h2>
          <p className="text-sm text-[#6B6B6B] leading-relaxed mb-3">
            De acuerdo con el RGPD, tienes derecho a:
          </p>
          <ul className="text-sm text-[#6B6B6B] leading-relaxed space-y-1 list-disc pl-5">
            <li>Acceder a todos tus datos personales</li>
            <li>Rectificar información incorrecta</li>
            <li>Solicitar la eliminación completa de tu cuenta y contenido</li>
            <li>Exportar tus datos en formato estándar</li>
            <li>Retirar tu consentimiento en cualquier momento</li>
          </ul>
          <p className="text-sm text-[#6B6B6B] leading-relaxed mt-3">
            Para ejercer estos derechos, contacta con nosotros en{' '}
            <a
              href="mailto:privacidad@nuclea.app"
              className="text-[#1A1A1A] underline"
            >
              privacidad@nuclea.app
            </a>
            .
          </p>
        </div>

        {/* Section 6 */}
        <div className="border-b border-[#E5E5E5] pb-6 mb-6">
          <h2 className="text-lg font-semibold text-[#1A1A1A] mb-2">
            6. Retención de datos
          </h2>
          <p className="text-sm text-[#6B6B6B] leading-relaxed">
            Mantenemos tus datos mientras tu cuenta esté activa. Si eliminas tu
            cuenta, todos tus datos personales y contenido se borran en un plazo
            de 30 días. Los mensajes futuros programados se conservan cifrados
            hasta su fecha de entrega, tras la cual se eliminan automáticamente.
          </p>
        </div>

        {/* Section 7 */}
        <div className="border-b border-[#E5E5E5] pb-6 mb-6">
          <h2 className="text-lg font-semibold text-[#1A1A1A] mb-2">
            7. Menores de edad
          </h2>
          <p className="text-sm text-[#6B6B6B] leading-relaxed">
            NUCLEA no está dirigido a menores de 16 años. No recopilamos
            deliberadamente datos de menores. Si descubrimos que hemos recopilado
            datos de un menor, los eliminaremos inmediatamente.
          </p>
        </div>

        {/* Section 8 */}
        <div className="border-b border-[#E5E5E5] pb-6 mb-6">
          <h2 className="text-lg font-semibold text-[#1A1A1A] mb-2">
            8. Cambios en esta política
          </h2>
          <p className="text-sm text-[#6B6B6B] leading-relaxed">
            Te notificaremos cualquier cambio material en esta política mediante
            correo electrónico o notificación en la aplicación, con al menos 30
            días de antelación.
          </p>
        </div>

        {/* Section 9 */}
        <div className="pb-6 mb-6">
          <h2 className="text-lg font-semibold text-[#1A1A1A] mb-2">
            9. Contacto
          </h2>
          <p className="text-sm text-[#6B6B6B] leading-relaxed mb-2">
            Para cualquier consulta sobre privacidad:
          </p>
          <ul className="text-sm text-[#6B6B6B] leading-relaxed space-y-1 list-disc pl-5">
            <li>
              Email:{' '}
              <a
                href="mailto:privacidad@nuclea.app"
                className="text-[#1A1A1A] underline"
              >
                privacidad@nuclea.app
              </a>
            </li>
            <li>Responsable de protección de datos: NUCLEA Technologies S.L.</li>
            <li>Dirección: Madrid, España</li>
          </ul>
        </div>

        {/* Separator */}
        <div className="border-t border-[#E5E5E5] pt-6 pb-12">
          <p className="text-xs text-[#9A9A9A] text-center">
            NUCLEA Technologies S.L. · Madrid, España
          </p>
        </div>
      </div>
    </div>
  );
}
