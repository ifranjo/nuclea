import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Términos de Servicio - NUCLEA',
  description: 'Términos y condiciones de uso de la plataforma NUCLEA.',
}

export default function TerminosPage() {
  return (
    <main className="min-h-screen bg-nuclea-bg py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-nuclea-gold hover:underline text-sm mb-8 inline-block">
          &larr; Volver al inicio
        </Link>

        <h1 className="font-display text-4xl text-white font-semibold mb-2">
          T&eacute;rminos de Servicio
        </h1>
        <p className="text-white/40 text-sm mb-10">
          &Uacute;ltima actualizaci&oacute;n: febrero 2026 &middot; Versi&oacute;n 2.0
        </p>

        {/* Table of Contents */}
        <nav className="mb-12 p-6 rounded-xl border border-white/[0.06] bg-white/[0.02]">
          <h2 className="text-white text-sm font-semibold uppercase tracking-wider mb-4">
            &Iacute;ndice
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-nuclea-gold text-sm">
            <li><a href="#objeto" className="hover:underline">Objeto del servicio</a></li>
            <li><a href="#aceptacion" className="hover:underline">Aceptaci&oacute;n de los t&eacute;rminos</a></li>
            <li><a href="#descripcion" className="hover:underline">Descripci&oacute;n del servicio</a></li>
            <li><a href="#registro" className="hover:underline">Registro y cuenta de usuario</a></li>
            <li><a href="#planes" className="hover:underline">Modelo de pago</a></li>
            <li><a href="#contenido" className="hover:underline">Propiedad intelectual y contenido del usuario</a></li>
            <li><a href="#avatar" className="hover:underline">Avatar IA y datos biom&eacute;tricos</a></li>
            <li><a href="#cierre" className="hover:underline">Modelo de cierre de c&aacute;psula</a></li>
            <li><a href="#limitaciones" className="hover:underline">Limitaciones y uso prohibido</a></li>
            <li><a href="#cancelacion" className="hover:underline">Cancelaci&oacute;n y eliminaci&oacute;n de cuenta</a></li>
            <li><a href="#responsabilidad" className="hover:underline">Limitaci&oacute;n de responsabilidad</a></li>
            <li><a href="#modificaciones" className="hover:underline">Modificaciones de los t&eacute;rminos</a></li>
            <li><a href="#jurisdiccion" className="hover:underline">Legislaci&oacute;n aplicable y jurisdicci&oacute;n</a></li>
            <li><a href="#contacto" className="hover:underline">Contacto</a></li>
          </ol>
        </nav>

        <div className="space-y-10 text-white/70 text-[15px] leading-relaxed">

          {/* 1. Objeto */}
          <section id="objeto">
            <h2 className="text-white text-lg font-semibold mb-3">
              1. Objeto del servicio
            </h2>
            <p>
              Los presentes T&eacute;rminos de Servicio (en adelante, &laquo;T&eacute;rminos&raquo;) regulan
              el acceso y uso de la plataforma NUCLEA, un servicio de legado digital que permite a los usuarios
              crear c&aacute;psulas digitales del tiempo para la preservaci&oacute;n de memorias personales,
              la comunicaci&oacute;n post-mortem y la creaci&oacute;n de avatares de inteligencia artificial
              basados en la voz y apariencia del usuario.
            </p>
          </section>

          {/* 2. Aceptación */}
          <section id="aceptacion">
            <h2 className="text-white text-lg font-semibold mb-3">
              2. Aceptaci&oacute;n de los t&eacute;rminos
            </h2>
            <p>
              Al registrarte, acceder o utilizar cualquier funcionalidad de NUCLEA, aceptas estos
              T&eacute;rminos de Servicio y nuestra{' '}
              <Link href="/privacidad" className="text-nuclea-gold hover:underline">
                Pol&iacute;tica de Privacidad
              </Link>
              . Si no est&aacute;s de acuerdo con alguna de las condiciones, no debes utilizar el servicio.
              El uso continuado de la plataforma tras cualquier modificaci&oacute;n de estos T&eacute;rminos
              constituye la aceptaci&oacute;n de los mismos.
            </p>
          </section>

          {/* 3. Descripción */}
          <section id="descripcion">
            <h2 className="text-white text-lg font-semibold mb-3">
              3. Descripci&oacute;n del servicio
            </h2>
            <p className="mb-3">NUCLEA ofrece las siguientes funcionalidades:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Creaci&oacute;n de c&aacute;psulas digitales con contenido multimedia (fotograf&iacute;as, v&iacute;deos, audio, texto y documentos).</li>
              <li>Seis tipos de c&aacute;psula: Legacy, Together, Social, Pet, Life Chapter y Origin, cada uno con finalidad y caracter&iacute;sticas diferenciadas.</li>
              <li>Programaci&oacute;n de mensajes futuros con cifrado de extremo a extremo.</li>
              <li>Avatar IA (EverLife) para interacci&oacute;n post-mortem basada en clonaci&oacute;n de voz y personalidad.</li>
              <li>Descarga local y eliminaci&oacute;n del contenido de nuestros servidores tras el cierre de la c&aacute;psula, garantizando cero coste de almacenamiento continuado.</li>
            </ul>
          </section>

          {/* 4. Registro */}
          <section id="registro">
            <h2 className="text-white text-lg font-semibold mb-3">
              4. Registro y cuenta de usuario
            </h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Debes ser mayor de 16 a&ntilde;os para registrarte en NUCLEA.</li>
              <li>Eres responsable de mantener la confidencialidad de tus credenciales de acceso.</li>
              <li>La informaci&oacute;n proporcionada durante el registro debe ser veraz, completa y actualizada.</li>
              <li>Cada persona f&iacute;sica puede tener una &uacute;nica cuenta.</li>
              <li>NUCLEA se reserva el derecho de suspender o cancelar cuentas que incumplan estos T&eacute;rminos.</li>
            </ul>
          </section>

          {/* 5. Modelo de pago */}
          <section id="planes">
            <h2 className="text-white text-lg font-semibold mb-3">
              5. Modelo de pago
            </h2>
            <p className="mb-3">
              NUCLEA opera bajo un modelo de <strong className="text-white/90">pago &uacute;nico</strong>.
              No existen suscripciones mensuales ni anuales. La creaci&oacute;n de la cuenta y el uso
              b&aacute;sico de la plataforma son gratuitos.
            </p>
            <p className="mb-3">
              El &uacute;nico producto de pago es el <strong className="text-white/90">Video Regalo</strong>,
              que se desbloquea mediante un pago puntual. Este pago da derecho a la generaci&oacute;n y
              descarga del v&iacute;deo, sin renovaciones autom&aacute;ticas ni compromisos de permanencia.
            </p>
            <p>
              Los precios pueden modificarse con un preaviso m&iacute;nimo de 30 d&iacute;as naturales.
              Los precios incluyen IVA cuando sea aplicable.
            </p>
          </section>

          {/* 6. Propiedad intelectual */}
          <section id="contenido">
            <h2 className="text-white text-lg font-semibold mb-3">
              6. Propiedad intelectual y contenido del usuario
            </h2>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong className="text-white/90">Contenido del usuario:</strong> conservas todos los derechos de
                propiedad intelectual sobre el contenido que subes a NUCLEA. Al utilizar el servicio, nos otorgas
                una licencia limitada, no exclusiva, revocable y no sublicenciable para almacenar, procesar y
                transmitir tu contenido con el &uacute;nico fin de prestar el servicio contratado.
              </li>
              <li>
                <strong className="text-white/90">Uso del contenido:</strong> NUCLEA no utilizar&aacute; tu contenido
                para fines publicitarios, de marketing ni lo compartir&aacute; con terceros sin tu consentimiento
                previo, salvo cuando sea necesario para la prestaci&oacute;n del servicio (e.g., encargados del
                tratamiento).
              </li>
              <li>
                <strong className="text-white/90">Propiedad de NUCLEA:</strong> la plataforma, su dise&ntilde;o,
                c&oacute;digo fuente, logotipos, marcas y documentaci&oacute;n son propiedad de NUCLEA y est&aacute;n
                protegidos por las leyes de propiedad intelectual aplicables.
              </li>
              <li>
                <strong className="text-white/90">Responsabilidad del contenido:</strong> el usuario es el &uacute;nico
                responsable de que su contenido no infrinja derechos de propiedad intelectual de terceros ni las
                leyes aplicables.
              </li>
            </ul>
          </section>

          {/* 7. Avatar IA */}
          <section id="avatar">
            <h2 className="text-white text-lg font-semibold mb-3">
              7. Avatar IA y datos biom&eacute;tricos
            </h2>
            <p className="mb-3">
              El servicio de Avatar IA (EverLife) requiere el procesamiento de datos biom&eacute;tricos
              (grabaciones de voz e imagen facial), considerados datos de categor&iacute;a especial conforme
              al Art&iacute;culo 9 del RGPD.
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                Este tratamiento requiere un <strong className="text-white/90">consentimiento expl&iacute;cito y
                separado</strong> que se recaba a trav&eacute;s de la{' '}
                <Link href="/consentimiento" className="text-nuclea-gold hover:underline">
                  p&aacute;gina de consentimiento biom&eacute;trico
                </Link>.
              </li>
              <li>
                Puedes revocar este consentimiento en cualquier momento. La revocaci&oacute;n implica la
                desactivaci&oacute;n del Avatar IA y la eliminaci&oacute;n de los datos biom&eacute;tricos
                asociados en un plazo m&aacute;ximo de 30 d&iacute;as.
              </li>
              <li>
                La revocaci&oacute;n del consentimiento biom&eacute;trico no afecta al acceso a las
                dem&aacute;s funcionalidades del servicio.
              </li>
            </ul>
          </section>

          {/* 8. Cierre de cápsula */}
          <section id="cierre">
            <h2 className="text-white text-lg font-semibold mb-3">
              8. Modelo de cierre de c&aacute;psula
            </h2>
            <p>
              Tras el cierre de una c&aacute;psula, NUCLEA empaqueta el contenido para su descarga local
              en un formato est&aacute;ndar (ZIP). Una vez completada la descarga y confirmada por el
              usuario, todo el contenido asociado a dicha c&aacute;psula se elimina de nuestros servidores.
              Este modelo garantiza que NUCLEA no retiene datos innecesarios y que el usuario mantiene el
              control total sobre su contenido: tus memorias son tuyas.
            </p>
          </section>

          {/* 9. Limitaciones */}
          <section id="limitaciones">
            <h2 className="text-white text-lg font-semibold mb-3">
              9. Limitaciones y uso prohibido
            </h2>
            <p className="mb-3">El usuario se compromete a no utilizar NUCLEA para:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Almacenar, transmitir o difundir contenido ilegal, difamatorio, pornogr&aacute;fico infantil, violento o que incite al odio.</li>
              <li>Realizar spam, phishing o cualquier forma de comunicaci&oacute;n no solicitada.</li>
              <li>Intentar acceder a cuentas o datos de otros usuarios sin autorizaci&oacute;n.</li>
              <li>Utilizar el servicio para eludir leyes de exportaci&oacute;n, sanciones o regulaciones aplicables.</li>
              <li>Superar los l&iacute;mites de almacenamiento o n&uacute;mero de c&aacute;psulas establecidos mediante medios fraudulentos.</li>
              <li>Realizar ingenier&iacute;a inversa, descompilar o intentar extraer el c&oacute;digo fuente de la plataforma.</li>
            </ul>
            <p className="mt-3">
              NUCLEA se reserva el derecho de suspender o cancelar cuentas que incumplan estas limitaciones,
              con notificaci&oacute;n previa siempre que sea posible.
            </p>
          </section>

          {/* 10. Cancelación */}
          <section id="cancelacion">
            <h2 className="text-white text-lg font-semibold mb-3">
              10. Cancelaci&oacute;n y eliminaci&oacute;n de cuenta
            </h2>
            <ul className="list-disc list-inside space-y-2">
              <li>
                Puedes cancelar tu cuenta en cualquier momento desde la configuraci&oacute;n de tu perfil o
                escribiendo a <span className="text-nuclea-gold">hola@nuclea.app</span>.
              </li>
              <li>
                La cancelaci&oacute;n inicia un periodo de gracia de 30 d&iacute;as durante el cual puedes
                reactivar tu cuenta. Transcurrido este plazo, se proceder&aacute; a la eliminaci&oacute;n
                definitiva e irreversible de tu cuenta y todo su contenido.
              </li>
              <li>
                Conforme al Art&iacute;culo 17 del RGPD (derecho de supresi&oacute;n), puedes solicitar la
                eliminaci&oacute;n inmediata de tus datos sin esperar al periodo de gracia.
              </li>
              <li>
                Al no existir suscripciones, la cancelaci&oacute;n de la cuenta no genera cargos
                recurrentes pendientes. Los pagos &uacute;nicos realizados (Video Regalo) no son
                reembolsables una vez entregado el producto, salvo que la legislaci&oacute;n aplicable
                disponga lo contrario.
              </li>
            </ul>
          </section>

          {/* 11. Responsabilidad */}
          <section id="responsabilidad">
            <h2 className="text-white text-lg font-semibold mb-3">
              11. Limitaci&oacute;n de responsabilidad
            </h2>
            <ul className="list-disc list-inside space-y-2">
              <li>
                NUCLEA se compromete a aplicar las mejores pr&aacute;cticas de seguridad y disponibilidad,
                pero no garantiza la disponibilidad ininterrumpida ni libre de errores del servicio.
              </li>
              <li>
                Nuestra responsabilidad total frente al usuario se limita al importe efectivamente pagado
                por el usuario en los 12 meses anteriores al evento que genere la reclamaci&oacute;n.
              </li>
              <li>
                NUCLEA no ser&aacute; responsable de da&ntilde;os indirectos, consecuentes, especiales o
                punitivos, incluida la p&eacute;rdida de datos derivada de causas ajenas a nuestro control
                razonable (fuerza mayor, fallos de proveedores de infraestructura, etc.).
              </li>
              <li>
                Las limitaciones anteriores se aplicar&aacute;n en la medida m&aacute;xima permitida por
                la legislaci&oacute;n aplicable.
              </li>
            </ul>
          </section>

          {/* 12. Modificaciones */}
          <section id="modificaciones">
            <h2 className="text-white text-lg font-semibold mb-3">
              12. Modificaciones de los t&eacute;rminos
            </h2>
            <p>
              NUCLEA se reserva el derecho de modificar estos T&eacute;rminos de Servicio. Cualquier
              modificaci&oacute;n sustancial ser&aacute; notificada a los usuarios con un m&iacute;nimo
              de <strong className="text-white/90">30 d&iacute;as naturales de antelaci&oacute;n</strong> mediante
              correo electr&oacute;nico y/o aviso destacado en la plataforma. Si no est&aacute;s de acuerdo
              con las modificaciones, podr&aacute;s cancelar tu cuenta antes de que entren en vigor. El uso
              continuado del servicio tras la entrada en vigor de las modificaciones constituye la
              aceptaci&oacute;n de los T&eacute;rminos modificados.
            </p>
          </section>

          {/* 13. Jurisdicción */}
          <section id="jurisdiccion">
            <h2 className="text-white text-lg font-semibold mb-3">
              13. Legislaci&oacute;n aplicable y jurisdicci&oacute;n
            </h2>
            <p>
              Estos T&eacute;rminos se rigen por la legislaci&oacute;n espa&ntilde;ola. Para cualquier
              controversia derivada de la interpretaci&oacute;n o ejecuci&oacute;n de los presentes
              T&eacute;rminos, las partes se someten a los juzgados y tribunales de la ciudad de
              Barcelona, Espa&ntilde;a, con renuncia expresa a cualquier otro fuero que pudiera
              corresponderles, salvo cuando la legislaci&oacute;n de protecci&oacute;n de consumidores
              establezca un fuero imperativo diferente.
            </p>
          </section>

          {/* 14. Contacto */}
          <section id="contacto">
            <h2 className="text-white text-lg font-semibold mb-3">
              14. Contacto
            </h2>
            <p>
              Para consultas sobre estos T&eacute;rminos de Servicio:{' '}
              <span className="text-nuclea-gold">legal@nuclea.app</span>
            </p>
            <p className="mt-2">
              Para cuestiones de privacidad y protecci&oacute;n de datos:{' '}
              <span className="text-nuclea-gold">privacidad@nuclea.app</span>
            </p>
          </section>

        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-white/30 text-xs">
          <span>NUCLEA &copy; 2026. Todos los derechos reservados.</span>
          <div className="flex gap-4">
            <Link href="/privacidad" className="hover:text-nuclea-gold transition-colors">
              Pol&iacute;tica de Privacidad
            </Link>
            <Link href="/consentimiento" className="hover:text-nuclea-gold transition-colors">
              Consentimiento IA
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
