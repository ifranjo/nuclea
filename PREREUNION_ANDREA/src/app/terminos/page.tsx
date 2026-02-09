import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terminos de Servicio - NUCLEA',
  description: 'Terminos y condiciones de uso de NUCLEA.',
}

export default function TerminosPage() {
  return (
    <main className="min-h-screen bg-nuclea-bg py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-nuclea-gold hover:underline text-sm mb-8 inline-block">
          &larr; Volver al inicio
        </Link>

        <h1 className="font-display text-4xl text-white font-semibold mb-2">
          Terminos de Servicio
        </h1>
        <p className="text-white/40 text-sm mb-10">
          Ultima actualizacion: febrero 2026 &middot; Version 1.0
        </p>

        <div className="space-y-8 text-white/70 text-[15px] leading-relaxed">
          <section>
            <h2 className="text-white text-lg font-semibold mb-3">1. Objeto</h2>
            <p>
              Los presentes Terminos de Servicio regulan el acceso y uso de la plataforma
              NUCLEA, un servicio de capsulas digitales del tiempo para la preservacion de
              memorias personales, legado digital y comunicacion post-mortem.
            </p>
          </section>

          <section>
            <h2 className="text-white text-lg font-semibold mb-3">2. Aceptacion</h2>
            <p>
              Al registrarte o utilizar NUCLEA, aceptas estos Terminos de Servicio y nuestra{' '}
              <Link href="/privacidad" className="text-nuclea-gold hover:underline">
                Politica de Privacidad
              </Link>
              . Si no estas de acuerdo, no debes usar el servicio.
            </p>
          </section>

          <section>
            <h2 className="text-white text-lg font-semibold mb-3">3. Descripcion del servicio</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Creacion de capsulas digitales con contenido multimedia (fotos, videos, audio, texto).</li>
              <li>Programacion de mensajes futuros con cifrado de extremo a extremo.</li>
              <li>Avatar IA (EverLife) para interaccion post-mortem basada en voz y personalidad (plan premium).</li>
              <li>Descarga local y eliminacion del contenido de nuestros servidores tras el cierre de la capsula.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white text-lg font-semibold mb-3">4. Registro y cuenta</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Debes ser mayor de 16 anos para registrarte.</li>
              <li>Eres responsable de la seguridad de tus credenciales.</li>
              <li>La informacion proporcionada debe ser veraz y actualizada.</li>
              <li>Cada persona puede tener una unica cuenta.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white text-lg font-semibold mb-3">5. Planes y precios</h2>
            <ul className="list-disc list-inside space-y-2">
              <li><strong className="text-white/90">Gratuito:</strong> 1 capsula, 500 MB, sin Avatar IA.</li>
              <li><strong className="text-white/90">Esencial:</strong> 9,99 EUR/mes, 2 capsulas, 5 GB.</li>
              <li><strong className="text-white/90">Familiar:</strong> 24,99 EUR/mes, 10 capsulas, 50 GB, Avatar IA incluido.</li>
              <li><strong className="text-white/90">EverLife Premium:</strong> 99 EUR (pago unico), 1 capsula EverLife, 100 GB, Avatar IA, soporte dedicado.</li>
            </ul>
            <p className="mt-3">
              Los precios pueden modificarse con un preaviso de 30 dias. Las suscripciones activas
              mantienen el precio hasta su renovacion.
            </p>
          </section>

          <section>
            <h2 className="text-white text-lg font-semibold mb-3">6. Contenido del usuario</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Conservas todos los derechos sobre el contenido que subes a NUCLEA.</li>
              <li>Nos otorgas una licencia limitada para almacenar y transmitir tu contenido con el fin de prestar el servicio.</li>
              <li>No usaremos tu contenido para fines publicitarios ni lo compartiremos con terceros sin tu consentimiento.</li>
              <li>Eres responsable de que tu contenido no infrinja derechos de terceros ni leyes aplicables.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white text-lg font-semibold mb-3">7. Avatar IA y datos biometricos</h2>
            <p>
              El servicio de Avatar IA requiere el procesamiento de datos biometricos (voz e imagen facial).
              Este tratamiento requiere consentimiento explicito y separado conforme al Art. 9 del RGPD.
              Puedes revocar este consentimiento en cualquier momento, lo que implicara la desactivacion
              del Avatar IA y la eliminacion de los datos biometricos asociados.
            </p>
          </section>

          <section>
            <h2 className="text-white text-lg font-semibold mb-3">8. Modelo de cierre de capsula</h2>
            <p>
              Tras el cierre de una capsula, NUCLEA empaqueta el contenido para su descarga local.
              Una vez completada la descarga, todo el contenido se elimina de nuestros servidores.
              Este modelo garantiza que NUCLEA no retiene datos innecesarios: tu contenido es tuyo.
            </p>
          </section>

          <section>
            <h2 className="text-white text-lg font-semibold mb-3">9. Cancelacion y eliminacion</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Puedes cancelar tu cuenta en cualquier momento desde la configuracion.</li>
              <li>La cancelacion implica la eliminacion de tu cuenta y todo su contenido en un plazo de 30 dias.</li>
              <li>Los datos eliminados no son recuperables tras el periodo de gracia.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white text-lg font-semibold mb-3">10. Limitacion de responsabilidad</h2>
            <p>
              NUCLEA se compromete a aplicar las mejores practicas de seguridad, pero no garantiza
              la disponibilidad ininterrumpida del servicio. Nuestra responsabilidad se limita al
              importe pagado por el usuario en los 12 meses anteriores al evento.
            </p>
          </section>

          <section>
            <h2 className="text-white text-lg font-semibold mb-3">11. Legislacion aplicable</h2>
            <p>
              Estos Terminos se rigen por la legislacion espanola. Para cualquier controversia,
              las partes se someten a los juzgados y tribunales de la ciudad de Barcelona, Espana.
            </p>
          </section>

          <section>
            <h2 className="text-white text-lg font-semibold mb-3">12. Contacto</h2>
            <p>
              Para consultas sobre estos terminos:{' '}
              <span className="text-nuclea-gold">legal@nuclea.app</span>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 text-white/30 text-xs">
          NUCLEA &copy; 2026. Todos los derechos reservados.
        </div>
      </div>
    </main>
  )
}
