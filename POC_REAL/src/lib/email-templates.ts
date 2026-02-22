/**
 * Transactional email templates for NUCLEA.
 *
 * All templates use inline CSS, white background, simple layout.
 * Copy is in Spain Spanish.
 */

// ---------------------------------------------------------------------------
// Shared layout
// ---------------------------------------------------------------------------

function wrapLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>NUCLEA</title>
</head>
<body style="margin:0; padding:0; background-color:#f5f5f5; font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; background-color:#ffffff; border-radius:12px; overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="padding:32px 32px 16px 32px; text-align:center;">
              <span style="font-size:28px; font-weight:700; letter-spacing:2px; color:#1a1a1a;">NUCLEA</span>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:0 32px 32px 32px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px; border-top:1px solid #e8e8e8; text-align:center;">
              <p style="margin:0 0 8px 0; font-size:12px; color:#999999; line-height:1.5;">
                NUCLEA &mdash; Tu legado digital
              </p>
              <p style="margin:0 0 8px 0; font-size:12px; color:#999999; line-height:1.5;">
                Si no solicitaste este mensaje, puedes ignorarlo de forma segura.
              </p>
              <p style="margin:0; font-size:11px; color:#bbbbbb; line-height:1.5;">
                &copy; 2026 NUCLEA. Barcelona, Espa&ntilde;a.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function ctaButton(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px auto;">
  <tr>
    <td style="background-color:#1a1a1a; border-radius:8px;">
      <a href="${href}" target="_blank" style="display:inline-block; padding:14px 32px; color:#ffffff; font-size:15px; font-weight:600; text-decoration:none; letter-spacing:0.3px;">
        ${label}
      </a>
    </td>
  </tr>
</table>`
}

// ---------------------------------------------------------------------------
// Shared text footer
// ---------------------------------------------------------------------------

function textFooter(): string {
  return [
    'Si no solicitaste este mensaje, puedes ignorarlo de forma segura.',
    '',
    '\u2014 Equipo NUCLEA',
    'NUCLEA \u2014 Tu legado digital',
    '\u00a9 2026 NUCLEA. Barcelona, Espa\u00f1a.',
  ].join('\n')
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

export interface BetaInvitationEmailResult {
  subject: string
  html: string
  text: string
}

/**
 * Beta closed invitation email.
 */
export function betaInvitationEmail(acceptUrl: string, options?: { expiresInHours?: number }): BetaInvitationEmailResult {
  const expiryHours = options?.expiresInHours ?? 72
  const subject = 'Has sido invitado a la beta cerrada de NUCLEA'

  const html = wrapLayout(`
    <h1 style="margin:0 0 16px 0; font-size:22px; font-weight:600; color:#1a1a1a; line-height:1.3;">
      Bienvenido a NUCLEA
    </h1>
    <p style="margin:0 0 8px 0; font-size:15px; color:#444444; line-height:1.6;">
      Has sido seleccionado para participar en la beta cerrada de NUCLEA, la plataforma de legado digital emocional.
    </p>
    <p style="margin:0 0 8px 0; font-size:15px; color:#444444; line-height:1.6;">
      Crea c&aacute;psulas de memoria, sube fotos, v&iacute;deos y notas, y designa personas de confianza que las recibir&aacute;n en el momento adecuado.
    </p>
    <p style="margin:0 0 0 0; font-size:15px; color:#444444; line-height:1.6;">
      Pulsa el bot&oacute;n para aceptar tu invitaci&oacute;n:
    </p>
    ${ctaButton(acceptUrl, 'Aceptar invitaci\u00f3n')}
    <p style="margin:0 0 12px 0; font-size:13px; color:#d97706; line-height:1.5; font-weight:500;">
      Este enlace expira en ${expiryHours} horas.
    </p>
    <p style="margin:0; font-size:13px; color:#999999; line-height:1.5;">
      Si tienes problemas con el bot&oacute;n, copia y pega esta URL en tu navegador:<br />
      <a href="${acceptUrl}" style="color:#666666; word-break:break-all;">${acceptUrl}</a>
    </p>
  `)

  const text = [
    'Bienvenido a NUCLEA',
    '',
    'Has sido seleccionado para participar en la beta cerrada de NUCLEA, la plataforma de legado digital emocional.',
    '',
    'Crea c\u00e1psulas de memoria, sube fotos, v\u00eddeos y notas, y designa personas de confianza que las recibir\u00e1n en el momento adecuado.',
    '',
    `Acepta tu invitaci\u00f3n aqu\u00ed: ${acceptUrl}`,
    '',
    `Este enlace expira en ${expiryHours} horas.`,
    '',
    textFooter(),
  ].join('\n')

  return { subject, html, text }
}

// ---------------------------------------------------------------------------

export interface CapsuleExpiryEmailResult {
  subject: string
  html: string
  text: string
}

/**
 * Capsule expiry notification for the capsule owner.
 */
export function capsuleExpiryNotificationEmail(
  capsuleName: string,
  daysRemaining: number
): CapsuleExpiryEmailResult {
  const subject =
    daysRemaining <= 0
      ? `Tu c\u00e1psula "${capsuleName}" ha expirado`
      : `Tu c\u00e1psula "${capsuleName}" expira en ${daysRemaining} d\u00eda${daysRemaining === 1 ? '' : 's'}`

  const urgencyColor = daysRemaining <= 3 ? '#dc2626' : '#d97706'
  const urgencyLabel =
    daysRemaining <= 0
      ? 'Expirada'
      : daysRemaining <= 3
        ? 'Urgente'
        : 'Aviso'

  const html = wrapLayout(`
    <h1 style="margin:0 0 16px 0; font-size:22px; font-weight:600; color:#1a1a1a; line-height:1.3;">
      Aviso sobre tu c&aacute;psula
    </h1>
    <div style="display:inline-block; padding:4px 12px; border-radius:20px; background-color:${urgencyColor}; color:#ffffff; font-size:12px; font-weight:600; letter-spacing:0.5px; margin-bottom:16px;">
      ${urgencyLabel}
    </div>
    <p style="margin:16px 0 8px 0; font-size:15px; color:#444444; line-height:1.6;">
      ${daysRemaining <= 0
        ? `La c&aacute;psula <strong>&ldquo;${capsuleName}&rdquo;</strong> ha expirado. Ya no es posible realizar acciones sobre ella.`
        : `La c&aacute;psula <strong>&ldquo;${capsuleName}&rdquo;</strong> expira en <strong>${daysRemaining} d&iacute;a${daysRemaining === 1 ? '' : 's'}</strong>.`
      }
    </p>
    ${daysRemaining > 0
      ? `<p style="margin:0; font-size:15px; color:#444444; line-height:1.6;">
          Accede a NUCLEA para revisar su contenido y tomar las decisiones necesarias antes de que finalice el periodo.
        </p>`
      : ''
    }
  `)

  const text = [
    `Aviso sobre tu c\u00e1psula: ${capsuleName}`,
    '',
    daysRemaining <= 0
      ? `La c\u00e1psula "${capsuleName}" ha expirado.`
      : `La c\u00e1psula "${capsuleName}" expira en ${daysRemaining} d\u00eda${daysRemaining === 1 ? '' : 's'}.`,
    '',
    daysRemaining > 0
      ? 'Accede a NUCLEA para revisar su contenido y tomar las decisiones necesarias.'
      : '',
    '',
    textFooter(),
  ].join('\n')

  return { subject, html, text }
}

// ---------------------------------------------------------------------------

export interface TrustContactEmailResult {
  subject: string
  html: string
  text: string
}

/**
 * Notification to a trust contact (designated person).
 */
export function trustContactNotificationEmail(
  senderName: string,
  capsuleName: string,
  decisionUrl: string
): TrustContactEmailResult {
  const subject = `${senderName} te ha nombrado persona de confianza en NUCLEA`

  const html = wrapLayout(`
    <h1 style="margin:0 0 16px 0; font-size:22px; font-weight:600; color:#1a1a1a; line-height:1.3;">
      Has sido nombrado persona de confianza
    </h1>
    <p style="margin:0 0 8px 0; font-size:15px; color:#444444; line-height:1.6;">
      La persona <strong>${senderName}</strong> te ha designado como persona de confianza para la c&aacute;psula <strong>&ldquo;${capsuleName}&rdquo;</strong> en NUCLEA.
    </p>
    <p style="margin:0 0 8px 0; font-size:15px; color:#444444; line-height:1.6;">
      Como persona de confianza, recibir&aacute;s acceso a los contenidos de esta c&aacute;psula cuando llegue el momento.
    </p>
    <p style="margin:0 0 0 0; font-size:15px; color:#444444; line-height:1.6;">
      Puedes revisar los detalles y tomar tu decisi&oacute;n aqu&iacute;:
    </p>
    ${ctaButton(decisionUrl, 'Ver decisi\u00f3n')}
    <p style="margin:0; font-size:13px; color:#999999; line-height:1.5;">
      Si el bot&oacute;n no funciona, copia y pega este enlace en tu navegador:<br />
      <a href="${decisionUrl}" style="color:#666666; word-break:break-all;">${decisionUrl}</a>
    </p>
  `)

  const text = [
    'Has sido nombrado persona de confianza',
    '',
    `${senderName} te ha designado como persona de confianza para la c\u00e1psula "${capsuleName}" en NUCLEA.`,
    '',
    'Como persona de confianza, recibir\u00e1s acceso a los contenidos de esta c\u00e1psula cuando llegue el momento.',
    '',
    `Revisa los detalles aqu\u00ed: ${decisionUrl}`,
    '',
    textFooter(),
  ].join('\n')

  return { subject, html, text }
}
