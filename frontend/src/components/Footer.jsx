// src/components/Footer.jsx
export default function Footer() {
    return (
      <footer className="bg-primary text-surface py-6 text-center">
        <p className="mb-2">&copy; 2025 Mi Plataforma de Aventuras</p>
        <nav className="space-x-4">
          <a href="/about" className="hover:underline">Sobre nosotros</a>
          <a href="/contact" className="hover:underline">Contacto</a>
          <a href="/privacy" className="hover:underline">Política de Privacidad</a>
        </nav>
      </footer>
    );
  }
  