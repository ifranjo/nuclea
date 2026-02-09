import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Politica de Privacidad - NUCLEA',
  description: 'Politica de privacidad y proteccion de datos de NUCLEA.',
}

export default function PrivacidadPage() {
  return (
    <main className="min-h-screen bg-nuclea-bg py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-nuclea-gold hover:underline text-sm mb-8 inline-block">
          &larr; Volver al inicio
        </Link>

        <h1 className="font-display text-4xl text-white font-semibold mb-2">
          Politica de Privacidad
        </h1>
        <p className="text-white/40 text-sm mb-10">
          Ultima actualizacion: febrero 2026 &middot; Version 1.0
        </p>

        <div className="space-y-8 text-white/70 text-[15px] leading-relaxed">
          <section>
            <h2 className="text-white text-lg font-semibold mb-3">1. Responsable del tratamiento</h2>
            <p>
              NUCLEA, operado por Imanol Franjo Alvarez y Andrea Box Lopez (en adelante, &ldquo;NUCLEA&rdquo;,
              &ldquo;nosotros&rdquo;), con domicilio en Espana.
              Correo de contacto: <span className="text-nuclea-gold">privacidad@nuclea.app</span>
            </p>
          </section>

          <section>
            <h2 className="text-white text-lg font-semibold mb-3">2. Datos que recopilamos</h2>
            <ul className="list-disc list-inside space-y-2">
              <li><strong className="text-white/90">Datos de cuenta:</strong> nombre, email, foto de perfil (si usas Google).</li>
              <li><strong className="text-white/90">Contenido de capsulas:</strong> fotos, videos, audios, textos que tu subes voluntariamente.</li>
              <li><strong className="text-white/90">Datos de Avatar IA (EverLife):</strong> grabaciones de voz, fotos faciales y videos de entrenamiento. Estos datos son biometricos (Art. 9 RGPD) y requieren consentimiento explicito separado.</li>
              <li><strong className="text-white/90">Datos operacionales:</strong> plan contratado, uso de almacenamiento, fecha de registro.</li>
              <li><strong className="text-white/90">Lista de espera:</strong> email proporcionado voluntariamente.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white text-lg font-semibold mb-3">3. Base legal del tratamiento (Art. 6 RGPD)</h2>
            <ul className="list-disc list-inside space-y-2">
              <li><strong className="text-white/90">Consentimiento (Art. 6.1.a):</strong> para el tratamiento de datos biometricos del Avatar IA.</li>
              <li><strong className="text-white/90">Ejecucion contractual (Art. 6.1.b):</strong> para la prestacion del servicio de capsulas digitales.</li>
              <li><strong className="text-white/90">Interes legitimo (Art. 6.1.f):</strong> para la mejora del servicio y prevencion de fraude.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white text-lg font-semibold mb-3">4. Tus derechos (Arts. 15-21 RGPD)</h2>
            <p className="mb-3">Como usuario puedes ejercer los siguientes derechos:</p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong className="text-white/90">Acceso:</strong> solicitar una copia de tus datos personales.</li>
              <li><strong className="text-white/90">Rectificacion:</strong> corregir datos inexactos.</li>
              <li><strong className="text-white/90">Supresion:</strong> solicitar la eliminacion de tus datos y cuenta.</li>
              <li><strong className="text-white/90">Portabilidad:</strong> recibir tus datos en formato estructurado (JSON/ZIP).</li>
              <li><strong className="text-white/90">Oposicion:</strong> oponerte al tratamiento de tus datos.</li>
              <li><strong className="text-white/90">Limitacion:</strong> solicitar la restriccion del tratamiento.</li>
            </ul>
            <p className="mt-3">
              Para ejercer cualquier derecho, contacta a{' '}
              <span className="text-nuclea-gold">privacidad@nuclea.app</span>.
              Responderemos en un plazo maximo de 30 dias.
            </p>
          </section>

          <section>
            <h2 className="text-white text-lg font-semibold mb-3">5. Encargados del tratamiento</h2>
            <ul className="list-disc list-inside space-y-2">
              <li><strong className="text-white/90">Google Firebase:</strong> autenticacion, base de datos y almacenamiento. Sujeto a DPA de Google Cloud.</li>
              <li><strong className="text-white/90">ElevenLabs:</strong> procesamiento de voz para Avatar IA (datos biometricos).</li>
              <li><strong className="text-white/90">Vercel:</strong> alojamiento web y logs de acceso HTTP.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white text-lg font-semibold mb-3">6. Transferencias internacionales</h2>
            <p>
              Tus datos se almacenan en servidores de la Union Europea (region europe-west1).
              Las transferencias a encargados fuera del EEE se realizan bajo clausulas contractuales
              tipo aprobadas por la Comision Europea (Art. 46.2.c RGPD).
            </p>
          </section>

          <section>
            <h2 className="text-white text-lg font-semibold mb-3">7. Conservacion de datos</h2>
            <ul className="list-disc list-inside space-y-2">
              <li><strong className="text-white/90">Datos de cuenta:</strong> mientras la cuenta este activa.</li>
              <li><strong className="text-white/90">Contenido de capsulas:</strong> hasta el cierre de la capsula. Tras la descarga, el contenido se elimina de nuestros servidores.</li>
              <li><strong className="text-white/90">Mensajes futuros:</strong> 30 dias tras la entrega al destinatario.</li>
              <li><strong className="text-white/90">Lista de espera:</strong> maximo 12 meses.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white text-lg font-semibold mb-3">8. Datos post-mortem (LOPD 3/2018, Art. 96)</h2>
            <p>
              Conforme a la Ley Organica 3/2018 de Proteccion de Datos espanola, las personas
              vinculadas al fallecido por razones familiares o de hecho, asi como las personas
              designadas expresamente, podran solicitar el acceso a los datos del fallecido y
              su rectificacion o supresion.
            </p>
          </section>

          <section>
            <h2 className="text-white text-lg font-semibold mb-3">9. Seguridad</h2>
            <p>
              Aplicamos cifrado en transito (TLS 1.3) y en reposo (AES-256).
              Los mensajes futuros se cifran adicionalmente con AES-256-GCM en cliente
              antes de su almacenamiento.
            </p>
          </section>

          <section>
            <h2 className="text-white text-lg font-semibold mb-3">10. Reclamaciones</h2>
            <p>
              Si consideras que tus derechos no han sido atendidos, puedes presentar una
              reclamacion ante la Agencia Espanola de Proteccion de Datos (AEPD):
              <span className="text-nuclea-gold"> www.aepd.es</span>
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
