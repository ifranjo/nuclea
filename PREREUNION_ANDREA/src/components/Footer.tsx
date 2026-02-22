import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-white/10 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="font-display text-2xl gradient-text font-semibold mb-4">
              NUCLEA
            </h3>
            <p className="text-white/50 text-sm max-w-sm">
              Somos las historias que recordamos. Haz que las tuyas permanezcan.
              Capsulas digitales del tiempo con tecnologia de IA.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Producto</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/capsulas" className="text-white/50 hover:text-white text-sm transition-colors">
                  Tipos de Capsulas
                </Link>
              </li>
              <li>
                <Link href="/#planes" className="text-white/50 hover:text-white text-sm transition-colors">
                  Video Regalo
                </Link>
              </li>
              <li>
                <Link href="/avatar-ia" className="text-white/50 hover:text-white text-sm transition-colors">
                  Avatar IA
                </Link>
              </li>
              <li>
                <Link href="/seguridad" className="text-white/50 hover:text-white text-sm transition-colors">
                  Seguridad
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/privacidad" className="text-white/50 hover:text-white text-sm transition-colors">
                  Privacidad
                </Link>
              </li>
              <li>
                <Link href="/terminos" className="text-white/50 hover:text-white text-sm transition-colors">
                  Terminos de Uso
                </Link>
              </li>
              <li>
                <Link href="/consentimiento" className="text-white/50 hover:text-white text-sm transition-colors">
                  Consentimiento IA
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="text-white/50 hover:text-white text-sm transition-colors">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/40 text-sm">
            &copy; {new Date().getFullYear()} NUCLEA. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-6">
            <a href="https://twitter.com/nuclea" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors">
              Twitter
            </a>
            <a href="https://instagram.com/nuclea" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors">
              Instagram
            </a>
            <a href="https://linkedin.com/company/nuclea" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors">
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
