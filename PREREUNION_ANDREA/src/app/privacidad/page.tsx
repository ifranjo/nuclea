import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Política de Privacidad - NUCLEA',
  description: 'Política de privacidad y protección de datos personales de NUCLEA conforme al RGPD y LOPDGDD.',
}

export default function PrivacidadPage() {
  return (
    <main className="min-h-screen bg-nuclea-bg py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-nuclea-gold hover:underline text-sm mb-8 inline-block">
          &larr; Volver al inicio
        </Link>

        <h1 className="font-display text-4xl text-white font-semibold mb-2">
          Pol&iacute;tica de Privacidad
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
            <li><a href="#responsable" className="hover:underline">Responsable del tratamiento</a></li>
            <li><a href="#datos" className="hover:underline">Datos que recopilamos</a></li>
            <li><a href="#base-legal" className="hover:underline">Base legal del tratamiento</a></li>
            <li><a href="#finalidades" className="hover:underline">Finalidades del tratamiento</a></li>
            <li><a href="#biometricos" className="hover:underline">Datos biom&eacute;tricos &mdash; Art. 9 RGPD</a></li>
            <li><a href="#derechos" className="hover:underline">Derechos ARCO+ (Arts. 15-21 RGPD)</a></li>
            <li><a href="#encargados" className="hover:underline">Encargados del tratamiento</a></li>
            <li><a href="#transferencias" className="hover:underline">Transferencias internacionales</a></li>
            <li><a href="#conservacion" className="hover:underline">Plazos de conservaci&oacute;n</a></li>
            <li><a href="#postmortem" className="hover:underline">Datos post-mortem (LOPDGDD Art. 96)</a></li>
            <li><a href="#seguridad" className="hover:underline">Medidas de seguridad</a></li>
            <li><a href="#dpd" className="hover:underline">Delegado de Protecci&oacute;n de Datos</a></li>
            <li><a href="#reclamaciones" className="hover:underline">Reclamaciones ante la AEPD</a></li>
          </ol>
        </nav>

        <div className="space-y-10 text-white/70 text-[15px] leading-relaxed">

          {/* 1. Responsable */}
          <section id="responsable">
            <h2 className="text-white text-lg font-semibold mb-3">
              1. Responsable del tratamiento
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <tbody>
                  <tr className="border-b border-white/[0.06]">
                    <td className="py-2 pr-4 text-white/50 whitespace-nowrap">Identidad</td>
                    <td className="py-2">NUCLEA (proyecto en fase de constituci&oacute;n societaria)</td>
                  </tr>
                  <tr className="border-b border-white/[0.06]">
                    <td className="py-2 pr-4 text-white/50 whitespace-nowrap">Responsables</td>
                    <td className="py-2">Imanol Franjo &Aacute;lvarez y Andrea Box L&oacute;pez</td>
                  </tr>
                  <tr className="border-b border-white/[0.06]">
                    <td className="py-2 pr-4 text-white/50 whitespace-nowrap">Domicilio</td>
                    <td className="py-2">Espa&ntilde;a</td>
                  </tr>
                  <tr className="border-b border-white/[0.06]">
                    <td className="py-2 pr-4 text-white/50 whitespace-nowrap">Contacto privacidad</td>
                    <td className="py-2"><span className="text-nuclea-gold">privacidad@nuclea.app</span></td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 text-white/50 whitespace-nowrap">Contacto general</td>
                    <td className="py-2"><span className="text-nuclea-gold">hola@nuclea.app</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm text-white/50">
              Una vez formalizada la constituci&oacute;n de la entidad jur&iacute;dica, se actualizar&aacute;n los datos
              identificativos (raz&oacute;n social, CIF, domicilio social) en esta misma pol&iacute;tica.
            </p>
          </section>

          {/* 2. Datos que recopilamos */}
          <section id="datos">
            <h2 className="text-white text-lg font-semibold mb-3">
              2. Datos que recopilamos
            </h2>
            <ul className="list-disc list-inside space-y-3">
              <li>
                <strong className="text-white/90">Datos de cuenta:</strong> nombre completo, direcci&oacute;n de correo
                electr&oacute;nico, contrase&ntilde;a (almacenada exclusivamente como hash criptogr&aacute;fico &mdash;
                nunca en texto plano), foto de perfil (si usas inicio de sesi&oacute;n con Google).
              </li>
              <li>
                <strong className="text-white/90">Contenido de c&aacute;psulas:</strong> fotograf&iacute;as, v&iacute;deos,
                grabaciones de audio, textos y documentos que el usuario sube voluntariamente a sus c&aacute;psulas.
              </li>
              <li>
                <strong className="text-white/90">Datos biom&eacute;tricos del Avatar IA (EverLife):</strong> grabaciones
                de voz para clonaci&oacute;n vocal (procesadas por ElevenLabs), fotograf&iacute;as faciales y v&iacute;deos
                de entrenamiento para generaci&oacute;n de v&iacute;deo. Estos datos constituyen datos de
                categor&iacute;a especial conforme al Art&iacute;culo 9 del RGPD y requieren consentimiento
                expl&iacute;cito separado (v&eacute;ase <a href="#biometricos" className="text-nuclea-gold hover:underline">secci&oacute;n 5</a>).
              </li>
              <li>
                <strong className="text-white/90">Datos operacionales:</strong> uso de almacenamiento,
                fecha de registro, historial de consentimientos otorgados, versiones aceptadas y registros de pagos &uacute;nicos realizados (Video Regalo).
              </li>
              <li>
                <strong className="text-white/90">Lista de espera:</strong> direcci&oacute;n de correo electr&oacute;nico
                proporcionada voluntariamente en el formulario de pre-lanzamiento.
              </li>
              <li>
                <strong className="text-white/90">Datos t&eacute;cnicos:</strong> direcci&oacute;n IP, user-agent del
                navegador y registros de acceso HTTP (recopilados autom&aacute;ticamente por la infraestructura de alojamiento).
              </li>
            </ul>
          </section>

          {/* 3. Base legal */}
          <section id="base-legal">
            <h2 className="text-white text-lg font-semibold mb-3">
              3. Base legal del tratamiento (Art. 6 y Art. 9 RGPD)
            </h2>
            <ul className="list-disc list-inside space-y-3">
              <li>
                <strong className="text-white/90">Consentimiento (Art. 6.1.a RGPD):</strong> para el env&iacute;o de
                comunicaciones comerciales, la inscripci&oacute;n en la lista de espera y el tratamiento de datos
                opcionales del perfil.
              </li>
              <li>
                <strong className="text-white/90">Ejecuci&oacute;n contractual (Art. 6.1.b RGPD):</strong> para la
                prestaci&oacute;n del servicio de c&aacute;psulas digitales, la gesti&oacute;n de la cuenta de
                usuario, la facturaci&oacute;n y la ejecuci&oacute;n de las funcionalidades contratadas seg&uacute;n
                el servicio contratado.
              </li>
              <li>
                <strong className="text-white/90">Inter&eacute;s leg&iacute;timo (Art. 6.1.f RGPD):</strong> para la
                mejora continua del servicio, la prevenci&oacute;n de fraude y la seguridad de la plataforma.
              </li>
              <li>
                <strong className="text-white/90">Consentimiento expl&iacute;cito para datos biom&eacute;tricos
                (Art. 9.2.a RGPD):</strong> para el tratamiento de datos de voz, imagen facial y datos de
                entrenamiento de personalidad del Avatar IA. Este consentimiento se recaba de forma separada,
                espec&iacute;fica e informada a trav&eacute;s de la{' '}
                <Link href="/consentimiento" className="text-nuclea-gold hover:underline">
                  p&aacute;gina de consentimiento biom&eacute;trico
                </Link>.
              </li>
            </ul>
          </section>

          {/* 4. Finalidades */}
          <section id="finalidades">
            <h2 className="text-white text-lg font-semibold mb-3">
              4. Finalidades del tratamiento
            </h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Gesti&oacute;n de la cuenta de usuario: registro, autenticaci&oacute;n y mantenimiento del perfil.</li>
              <li>Creaci&oacute;n, almacenamiento y entrega de c&aacute;psulas digitales de memoria.</li>
              <li>Creaci&oacute;n y operaci&oacute;n del Avatar IA (EverLife): clonaci&oacute;n de voz, generaci&oacute;n de v&iacute;deo e interacci&oacute;n post-mortem.</li>
              <li>Gesti&oacute;n de pagos (Video Regalo), facturaci&oacute;n y l&iacute;mites de almacenamiento.</li>
              <li>Env&iacute;o de comunicaciones sobre el servicio (transaccionales, no publicitarias).</li>
              <li>Comunicaciones comerciales y de novedades (solo con consentimiento previo del usuario).</li>
              <li>Mejora del servicio y an&aacute;lisis agregado de uso (anonimizado).</li>
              <li>Prevenci&oacute;n de fraude y garant&iacute;a de seguridad de la plataforma.</li>
            </ul>
          </section>

          {/* 5. Datos biométricos */}
          <section id="biometricos">
            <h2 className="text-white text-lg font-semibold mb-3">
              5. Datos biom&eacute;tricos &mdash; Art&iacute;culo 9 RGPD
            </h2>
            <div className="p-4 rounded-lg border border-nuclea-gold/20 bg-nuclea-gold/[0.03] mb-4">
              <p className="text-white/80 text-sm">
                <strong className="text-nuclea-gold">Atenci&oacute;n:</strong> Esta secci&oacute;n se aplica
                exclusivamente a los usuarios que activen el servicio Avatar IA, disponible en los
                la funcionalidad Avatar IA de NUCLEA.
              </p>
            </div>
            <p className="mb-3">
              El servicio Avatar IA de NUCLEA procesa los siguientes datos biom&eacute;tricos, considerados
              datos de categor&iacute;a especial conforme al Art&iacute;culo 9 del Reglamento General de
              Protecci&oacute;n de Datos (UE) 2016/679:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>
                <strong className="text-white/90">Datos de voz:</strong> grabaciones de audio utilizadas para
                la clonaci&oacute;n vocal mediante el servicio de ElevenLabs. Permiten generar una
                r&eacute;plica de la voz del usuario para la interacci&oacute;n con el Avatar IA post-mortem.
              </li>
              <li>
                <strong className="text-white/90">Datos de imagen facial:</strong> fotograf&iacute;as y
                v&iacute;deos del rostro del usuario utilizados para la generaci&oacute;n de v&iacute;deo
                del Avatar IA.
              </li>
              <li>
                <strong className="text-white/90">Datos de personalidad:</strong> textos, patrones de
                comunicaci&oacute;n y preferencias proporcionados voluntariamente para entrenar el modelo de
                personalidad del Avatar IA.
              </li>
            </ul>
            <h3 className="text-white text-base font-semibold mb-2">Base legal: Art. 9.2.a RGPD</h3>
            <p className="mb-3">
              El tratamiento de estos datos se fundamenta en el consentimiento expl&iacute;cito del
              interesado, recabado de forma:
            </p>
            <ul className="list-disc list-inside space-y-1 mb-4">
              <li><strong className="text-white/90">Libre:</strong> sin condicionamiento al acceso a otras funcionalidades del servicio.</li>
              <li><strong className="text-white/90">Espec&iacute;fica:</strong> para cada categor&iacute;a de dato biom&eacute;trico (voz, imagen facial, personalidad).</li>
              <li><strong className="text-white/90">Informada:</strong> con indicaci&oacute;n clara del prop&oacute;sito, los destinatarios y los derechos del usuario.</li>
              <li><strong className="text-white/90">Inequ&iacute;voca:</strong> mediante acci&oacute;n afirmativa clara (casillas de verificaci&oacute;n individuales).</li>
            </ul>
            <h3 className="text-white text-base font-semibold mb-2">Derecho de revocaci&oacute;n</h3>
            <p>
              El usuario puede retirar su consentimiento en cualquier momento escribiendo a{' '}
              <span className="text-nuclea-gold">privacidad@nuclea.app</span> o desde la configuraci&oacute;n
              de su cuenta. La revocaci&oacute;n implica: (a) la desactivaci&oacute;n inmediata del Avatar IA,
              (b) el inicio del proceso de eliminaci&oacute;n de todos los datos biom&eacute;tricos asociados
              en un plazo m&aacute;ximo de 30 d&iacute;as, y (c) la notificaci&oacute;n a los encargados del
              tratamiento (ElevenLabs) para que procedan a la eliminaci&oacute;n en sus sistemas. La
              revocaci&oacute;n no afecta a la licitud del tratamiento basado en el consentimiento previo a su
              retirada (Art. 7.3 RGPD).
            </p>
          </section>

          {/* 6. Derechos ARCO+ */}
          <section id="derechos">
            <h2 className="text-white text-lg font-semibold mb-3">
              6. Derechos ARCO+ (Art&iacute;culos 15-21 RGPD)
            </h2>
            <p className="mb-3">
              Como usuario puedes ejercer los siguientes derechos en cualquier momento:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong className="text-white/90">Acceso (Art. 15):</strong> solicitar una copia de tus datos
                personales en formato estructurado.
              </li>
              <li>
                <strong className="text-white/90">Rectificaci&oacute;n (Art. 16):</strong> corregir datos
                personales inexactos o completar datos incompletos.
              </li>
              <li>
                <strong className="text-white/90">Supresi&oacute;n (Art. 17 &mdash; &laquo;derecho al
                olvido&raquo;):</strong> solicitar la eliminaci&oacute;n de tus datos personales y de todo el
                contenido de tus c&aacute;psulas.
              </li>
              <li>
                <strong className="text-white/90">Limitaci&oacute;n del tratamiento (Art. 18):</strong> solicitar
                la restricci&oacute;n del tratamiento de tus datos en los supuestos legalmente previstos.
              </li>
              <li>
                <strong className="text-white/90">Portabilidad (Art. 20):</strong> recibir tus datos personales
                y el contenido de tus c&aacute;psulas en un formato estructurado, de uso com&uacute;n y lectura
                mec&aacute;nica (JSON/ZIP).
              </li>
              <li>
                <strong className="text-white/90">Oposici&oacute;n (Art. 21):</strong> oponerte al tratamiento de
                tus datos por motivos relacionados con tu situaci&oacute;n particular.
              </li>
            </ul>
            <p className="mt-4">
              Para ejercer cualquier derecho, env&iacute;a un correo a{' '}
              <span className="text-nuclea-gold">privacidad@nuclea.app</span> indicando el derecho que deseas
              ejercer y adjuntando copia de tu documento de identidad. Responderemos en un plazo m&aacute;ximo
              de 30 d&iacute;as naturales conforme al art&iacute;culo 12.3 del RGPD.
            </p>
          </section>

          {/* 7. Encargados */}
          <section id="encargados">
            <h2 className="text-white text-lg font-semibold mb-3">
              7. Encargados del tratamiento
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="py-2 pr-4 text-left text-white/50 font-medium">Proveedor</th>
                    <th className="py-2 pr-4 text-left text-white/50 font-medium">Funci&oacute;n</th>
                    <th className="py-2 text-left text-white/50 font-medium">Ubicaci&oacute;n</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/[0.06]">
                    <td className="py-2 pr-4 text-white/90">Google Firebase</td>
                    <td className="py-2 pr-4">Autenticaci&oacute;n, base de datos (Firestore), almacenamiento de archivos</td>
                    <td className="py-2">UE (europe-west1)</td>
                  </tr>
                  <tr className="border-b border-white/[0.06]">
                    <td className="py-2 pr-4 text-white/90">ElevenLabs</td>
                    <td className="py-2 pr-4">Clonaci&oacute;n de voz y s&iacute;ntesis para Avatar IA (datos biom&eacute;tricos)</td>
                    <td className="py-2">EE.UU.</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 text-white/90">Vercel</td>
                    <td className="py-2 pr-4">Alojamiento web, CDN global y registros de acceso HTTP</td>
                    <td className="py-2">CDN global</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3">
              Todos los encargados del tratamiento operan bajo contratos de procesamiento de datos (DPA)
              conforme al art&iacute;culo 28 del RGPD.
            </p>
          </section>

          {/* 8. Transferencias internacionales */}
          <section id="transferencias">
            <h2 className="text-white text-lg font-semibold mb-3">
              8. Transferencias internacionales de datos
            </h2>
            <p className="mb-3">
              Los datos principales del usuario se almacenan en servidores de Google Cloud dentro de la
              Uni&oacute;n Europea (regi&oacute;n <code className="text-nuclea-gold/80 text-sm">europe-west1</code>).
            </p>
            <p className="mb-3">
              Las siguientes transferencias fuera del Espacio Econ&oacute;mico Europeo se realizan bajo las
              garant&iacute;as previstas en los art&iacute;culos 44-49 del RGPD:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong className="text-white/90">ElevenLabs (EE.UU.):</strong> procesamiento de datos de voz
                para la clonaci&oacute;n vocal del Avatar IA. Transferencia amparada por cl&aacute;usulas
                contractuales tipo (SCCs) aprobadas por la Comisi&oacute;n Europea (Art. 46.2.c RGPD).
                Garant&iacute;as complementarias en evaluaci&oacute;n conforme a la sentencia Schrems II.
              </li>
              <li>
                <strong className="text-white/90">Vercel (CDN global):</strong> distribuci&oacute;n de contenido
                est&aacute;tico a trav&eacute;s de nodos CDN globales. Los datos personales no se almacenan de
                forma persistente en nodos fuera del EEE.
              </li>
            </ul>
          </section>

          {/* 9. Conservación */}
          <section id="conservacion">
            <h2 className="text-white text-lg font-semibold mb-3">
              9. Plazos de conservaci&oacute;n de datos
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="py-2 pr-4 text-left text-white/50 font-medium">Categor&iacute;a</th>
                    <th className="py-2 text-left text-white/50 font-medium">Plazo</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/[0.06]">
                    <td className="py-2 pr-4 text-white/90">Datos de cuenta</td>
                    <td className="py-2">Mientras la cuenta est&eacute; activa</td>
                  </tr>
                  <tr className="border-b border-white/[0.06]">
                    <td className="py-2 pr-4 text-white/90">Contenido de c&aacute;psulas</td>
                    <td className="py-2">Hasta el cierre de la c&aacute;psula; tras la descarga local, el contenido se elimina de nuestros servidores</td>
                  </tr>
                  <tr className="border-b border-white/[0.06]">
                    <td className="py-2 pr-4 text-white/90">Datos biom&eacute;tricos (Avatar IA)</td>
                    <td className="py-2">Hasta la revocaci&oacute;n del consentimiento o la eliminaci&oacute;n de la cuenta; m&aacute;ximo 30 d&iacute;as tras la solicitud de eliminaci&oacute;n</td>
                  </tr>
                  <tr className="border-b border-white/[0.06]">
                    <td className="py-2 pr-4 text-white/90">Mensajes futuros</td>
                    <td className="py-2">30 d&iacute;as tras la entrega al destinatario</td>
                  </tr>
                  <tr className="border-b border-white/[0.06]">
                    <td className="py-2 pr-4 text-white/90">Lista de espera</td>
                    <td className="py-2">M&aacute;ximo 12 meses desde la inscripci&oacute;n</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 text-white/90">Datos post-eliminaci&oacute;n de cuenta</td>
                    <td className="py-2">30 d&iacute;as (periodo de gracia); tras este plazo, eliminaci&oacute;n irreversible</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 10. Post-mortem */}
          <section id="postmortem">
            <h2 className="text-white text-lg font-semibold mb-3">
              10. Datos post-mortem (LOPDGDD, Art. 96)
            </h2>
            <p>
              Conforme al art&iacute;culo 96 de la Ley Org&aacute;nica 3/2018, de 5 de diciembre, de
              Protecci&oacute;n de Datos Personales y garant&iacute;a de los derechos digitales (LOPDGDD),
              las personas vinculadas al fallecido por razones familiares o de hecho, as&iacute; como las
              personas designadas expresamente por el usuario en vida, podr&aacute;n solicitar el acceso a
              los datos del fallecido y, en su caso, su rectificaci&oacute;n o supresi&oacute;n. NUCLEA
              facilitar&aacute; mecanismos para la designaci&oacute;n de personas autorizadas en la
              configuraci&oacute;n de la cuenta del usuario.
            </p>
          </section>

          {/* 11. Seguridad */}
          <section id="seguridad">
            <h2 className="text-white text-lg font-semibold mb-3">
              11. Medidas de seguridad
            </h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Cifrado en tr&aacute;nsito mediante TLS 1.3 en todas las comunicaciones.</li>
              <li>Cifrado en reposo AES-256 para todos los datos almacenados.</li>
              <li>Cifrado adicional AES-256-GCM en cliente para mensajes futuros antes de su almacenamiento en servidor.</li>
              <li>Contrase&ntilde;as almacenadas exclusivamente como hashes criptogr&aacute;ficos (nunca en texto plano).</li>
              <li>Autenticaci&oacute;n basada en tokens JWT con expiraci&oacute;n temporal.</li>
              <li>Separaci&oacute;n l&oacute;gica de datos entre usuarios a nivel de base de datos.</li>
            </ul>
          </section>

          {/* 12. DPD */}
          <section id="dpd">
            <h2 className="text-white text-lg font-semibold mb-3">
              12. Delegado de Protecci&oacute;n de Datos
            </h2>
            <p>
              Puedes contactar con nuestro responsable de protecci&oacute;n de datos en cualquier momento
              a trav&eacute;s de la direcci&oacute;n:{' '}
              <span className="text-nuclea-gold">privacidad@nuclea.app</span>
            </p>
            <p className="mt-2 text-sm text-white/50">
              Nota: En funci&oacute;n del volumen de datos tratados y la naturaleza del tratamiento,
              se evaluar&aacute; la designaci&oacute;n formal de un Delegado de Protecci&oacute;n de Datos
              (DPD/DPO) conforme al art&iacute;culo 37 del RGPD.
            </p>
          </section>

          {/* 13. Reclamaciones */}
          <section id="reclamaciones">
            <h2 className="text-white text-lg font-semibold mb-3">
              13. Reclamaciones ante la AEPD
            </h2>
            <p>
              Si consideras que tus derechos de protecci&oacute;n de datos no han sido debidamente
              atendidos, tienes derecho a presentar una reclamaci&oacute;n ante la Agencia Espa&ntilde;ola
              de Protecci&oacute;n de Datos (AEPD):
            </p>
            <div className="mt-3 p-4 rounded-lg border border-white/[0.06] bg-white/[0.02]">
              <p className="text-white/90 text-sm">
                <strong>Agencia Espa&ntilde;ola de Protecci&oacute;n de Datos</strong><br />
                C/ Jorge Juan 6, 28001 Madrid<br />
                Tel&eacute;fono: 901 100 099<br />
                Web: <span className="text-nuclea-gold">www.aepd.es</span>
              </p>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-white/30 text-xs">
          <span>NUCLEA &copy; 2026. Todos los derechos reservados.</span>
          <div className="flex gap-4">
            <Link href="/terminos" className="hover:text-nuclea-gold transition-colors">
              T&eacute;rminos de Servicio
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
