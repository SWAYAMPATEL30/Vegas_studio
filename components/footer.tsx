import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="relative border-t border-border/30" style={{ maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
      {/* Footer background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/IMG-FOOTER.png"
          alt=""
          fill
          className="object-cover"
        />
      </div>
      {/* Dark overlay matching design spec: rgba(26, 39, 34, 0.95) */}
      <div className="absolute inset-0 z-[1]" style={{ background: 'var(--footer-bg, rgba(26, 39, 34, 0.95))', opacity: 0.95 }} />
      <div className="container mx-auto relative z-10" style={{ padding: '34px 87px' }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo */}
          <div className="flex justify-center md:justify-start">
            <Image
              src="/images/vertical-negativo.svg"
              alt="Vegas Estudio"
              width={124}
              height={165}
              className="w-[124px] h-[165px] object-contain"
            />
          </div>

          {/* Navigation */}
          <div className="flex flex-col items-center gap-3">
            <Link href="/" className="text-foreground hover:text-primary transition-colors">
              Inicio
            </Link>
            <Link href="/#ubicacion" className="text-foreground hover:text-primary transition-colors">
              Ubicación
            </Link>
            <Link href="/servicios" className="text-foreground hover:text-primary transition-colors">
              Servicios
            </Link>
            <Link href="/agendar" className="text-foreground hover:text-primary transition-colors">
              Agendar cita
            </Link>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col items-center md:items-end gap-3 text-foreground">
            <div>
              <p className="text-muted-foreground text-sm">Ubicación</p>
              <p>Calle 76 #63-58</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Horario de atención:</p>
              <p>9:30 a. m. - 8:00 p. m.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">Contáctanos:</span>
              <a href="tel:3147801264" className="text-sm font-medium hover:text-primary transition-colors">314 780 1264</a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-border/30 text-center text-muted-foreground text-sm">
          <p>© 2026 Vegas Estudio</p>
          <p>Todos los derechos reservados</p>
        </div>
      </div>
    </footer>
  )
}
