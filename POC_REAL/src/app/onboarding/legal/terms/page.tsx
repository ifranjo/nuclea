'use client';

import Link from 'next/link';
import { ChevronLeft, AlertTriangle } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-[100dvh] overflow-y-auto bg-white">
      {/* Top Bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-[#E5E5E5]">
        <div className="px-6 py-4 flex items-center gap-3">
          <Link href="/onboarding/legal" className="text-[#1A1A1A]">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-[#1A1A1A]">
              Términos y Condiciones
            </h1>
            <p className="text-sm text-[#9A9A9A] mt-0.5">
              Última actualización: febrero 2026
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8">
        {/* Beta Notice */}
        <div className="bg-[#FFF9E6] border border-[#D4AF37] rounded-xl p-5 mb-8">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="text-lg font-semibold text-[#1A1A1A] mb-3">
                Aviso de Versión Beta
              </h2>
              <p className="text-sm text-[#6B6B6B] leading-relaxed mb-3">
                NUCLEA se encuentra actualmente en fase beta. Esto significa que:
              </p>
              <ul className="text-sm text-[#6B6B6B] leading-relaxed space-y-2 mb-3">
                <li>• Algunas funcionalidades pueden cambiar o ser modificadas</li>
                <li>• Pueden existir errores o comportamientos inesperados</li>
                <li>• El almacenamiento durante la fase beta es temporal</li>
                <li>• Las condiciones del servicio pueden actualizarse</li>
              </ul>
              <p className="text-sm text-[#6B6B6B] leading-relaxed mb-3">
                Durante la fase beta, todos los planes son gratuitos. Te notificaremos con antelación antes de cualquier transición a planes de pago.
              </p>
              <p className="text-sm text-[#6B6B6B] leading-relaxed">
                Tu participación en la beta nos ayuda a construir un servicio mejor. Agradecemos tu confianza y paciencia.
              </p>
            </div>
          </div>
        </div>

        {/* Section 1 */}
        <section className="border-b border-[#E5E5E5] pb-6 mb-6">
          <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">
            1. Objeto del servicio
          </h3>
          <p className="text-sm text-[#6B6B6B] leading-relaxed">
            NUCLEA es una plataforma de preservación de recuerdos digitales que te permite crear cápsulas del tiempo con fotos, vídeos, audios y notas de texto. El servicio incluye almacenamiento seguro, programación de entregas futuras y gestión de personas designadas.
          </p>
        </section>

        {/* Section 2 */}
        <section className="border-b border-[#E5E5E5] pb-6 mb-6">
          <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">
            2. Registro y cuenta
          </h3>
          <p className="text-sm text-[#6B6B6B] leading-relaxed">
            Para usar NUCLEA debes ser mayor de 16 años y proporcionar información veraz al registrarte. Eres responsable de mantener la seguridad de tu contraseña y de toda la actividad que ocurra bajo tu cuenta.
          </p>
        </section>

        {/* Section 3 */}
        <section className="border-b border-[#E5E5E5] pb-6 mb-6">
          <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">
            3. Contenido del usuario
          </h3>
          <p className="text-sm text-[#6B6B6B] leading-relaxed mb-3">
            Conservas todos los derechos sobre el contenido que subes a NUCLEA. Al utilizar el servicio, nos otorgas una licencia limitada para almacenar, procesar y transmitir tu contenido con el único fin de prestarte el servicio.
          </p>
          <p className="text-sm text-[#6B6B6B] leading-relaxed">
            No nos hacemos responsables de contenido que infrinja derechos de terceros. Te comprometes a no subir contenido ilegal, difamatorio o que viole derechos de propiedad intelectual.
          </p>
        </section>

        {/* Section 4 */}
        <section className="border-b border-[#E5E5E5] pb-6 mb-6">
          <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">
            4. Planes y pagos
          </h3>
          <p className="text-sm text-[#6B6B6B] leading-relaxed mb-3">
            NUCLEA ofrece diferentes planes de suscripción. Los precios están indicados en euros e incluyen IVA. Las suscripciones se renuevan automáticamente salvo que las canceles con al menos 48 horas de antelación al siguiente período de facturación.
          </p>
          <p className="text-sm text-[#6B6B6B] leading-relaxed">
            El plan EverLife es un pago único que no se renueva. Incluye almacenamiento garantizado de por vida de la cápsula.
          </p>
        </section>

        {/* Section 5 */}
        <section className="border-b border-[#E5E5E5] pb-6 mb-6">
          <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">
            5. Cápsulas y cierre
          </h3>
          <p className="text-sm text-[#6B6B6B] leading-relaxed mb-3">
            Una vez cerrada una cápsula, no podrás añadir más contenido. El archivo generado estará disponible para descarga durante 30 días. Tras la descarga, el contenido se elimina de nuestros servidores.
          </p>
          <p className="text-sm text-[#6B6B6B] leading-relaxed">
            Es tu responsabilidad descargar la cápsula dentro del plazo establecido. NUCLEA no se hace responsable de la pérdida de contenido por no descargar a tiempo.
          </p>
        </section>

        {/* Section 6 */}
        <section className="border-b border-[#E5E5E5] pb-6 mb-6">
          <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">
            6. Mensajes futuros
          </h3>
          <p className="text-sm text-[#6B6B6B] leading-relaxed mb-3">
            Los mensajes programados se almacenan cifrados hasta su fecha de entrega. NUCLEA se compromete a realizar la entrega en la fecha programada, aunque pueden existir retrasos técnicos de hasta 48 horas.
          </p>
          <p className="text-sm text-[#6B6B6B] leading-relaxed">
            Si el destinatario no reclama el mensaje en 30 días desde la entrega, este se elimina permanentemente.
          </p>
        </section>

        {/* Section 7 */}
        <section className="border-b border-[#E5E5E5] pb-6 mb-6">
          <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">
            7. Cancelación y reembolsos
          </h3>
          <p className="text-sm text-[#6B6B6B] leading-relaxed">
            Puedes cancelar tu suscripción en cualquier momento. Mantendrás acceso hasta el final del período ya pagado. No se realizan reembolsos por períodos parciales, salvo lo requerido por la legislación aplicable.
          </p>
        </section>

        {/* Section 8 */}
        <section className="border-b border-[#E5E5E5] pb-6 mb-6">
          <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">
            8. Limitación de responsabilidad
          </h3>
          <p className="text-sm text-[#6B6B6B] leading-relaxed">
            NUCLEA se proporciona &ldquo;tal cual&rdquo;. No garantizamos disponibilidad ininterrumpida del servicio. Nuestra responsabilidad máxima se limita al importe pagado en los últimos 12 meses.
          </p>
        </section>

        {/* Section 9 */}
        <section className="pb-6 mb-6">
          <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">
            9. Legislación aplicable
          </h3>
          <p className="text-sm text-[#6B6B6B] leading-relaxed">
            Estos términos se rigen por la legislación española. Cualquier disputa se someterá a los juzgados y tribunales de Madrid.
          </p>
        </section>

        {/* Footer */}
        <div className="border-t border-[#E5E5E5] pt-6">
          <p className="text-xs text-[#9A9A9A] text-center pb-12">
            NUCLEA Technologies S.L. · Madrid, España
          </p>
        </div>
      </div>
    </div>
  );
}
