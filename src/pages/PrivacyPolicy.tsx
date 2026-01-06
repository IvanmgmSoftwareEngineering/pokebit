import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <header className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Política de Privacidad
          </h1>
          <p className="text-muted-foreground">
            PokeBit - High Entropy Wallet Generator
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </header>

        {/* Content */}
        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Introducción</h2>
            <p className="text-muted-foreground leading-relaxed">
              PokeBit es una extensión de navegador diseñada para generar y gestionar wallets de criptomonedas 
              de forma segura. Esta política de privacidad explica cómo manejamos (o más bien, cómo NO manejamos) 
              sus datos personales.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. Datos que NO recopilamos</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              PokeBit está diseñado con un enfoque de privacidad total. <strong>No recopilamos, almacenamos, 
              ni transmitimos ningún dato personal</strong>. Específicamente:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>No recopilamos frases semilla (seed phrases)</li>
              <li>No recopilamos claves privadas</li>
              <li>No recopilamos direcciones de wallet</li>
              <li>No recopilamos contraseñas de encriptación</li>
              <li>No recopilamos información de uso o analíticas</li>
              <li>No recopilamos direcciones IP</li>
              <li>No recopilamos información del dispositivo</li>
              <li>No utilizamos cookies de seguimiento</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. Procesamiento 100% Local</h2>
            <p className="text-muted-foreground leading-relaxed">
              Toda la funcionalidad de PokeBit se ejecuta exclusivamente en su dispositivo local:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-3">
              <li><strong>Generación de wallets:</strong> Las frases semilla se generan usando entropía criptográfica local</li>
              <li><strong>Derivación de claves:</strong> Las claves privadas y públicas se derivan localmente usando estándares BIP-32/BIP-44/BIP-84</li>
              <li><strong>Encriptación:</strong> Los archivos .aes se encriptan localmente con AES-256</li>
              <li><strong>Almacenamiento:</strong> Los datos solo se guardan si usted decide exportar un archivo a su dispositivo</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Sin conexiones externas</h2>
            <p className="text-muted-foreground leading-relaxed">
              PokeBit <strong>no realiza ninguna conexión a servidores externos</strong>. La extensión funciona 
              completamente offline una vez instalada. No hay:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-3">
              <li>Servidores backend</li>
              <li>APIs de terceros</li>
              <li>Servicios de analítica</li>
              <li>Servicios de publicidad</li>
              <li>Sincronización en la nube</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Permisos de la extensión</h2>
            <p className="text-muted-foreground leading-relaxed">
              PokeBit solicita los mínimos permisos necesarios:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-3">
              <li><strong>storage:</strong> Para guardar preferencias de idioma y tema (solo localmente en su navegador)</li>
              <li><strong>tabs:</strong> Para abrir la vista de importación en una nueva pestaña</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">6. Seguridad</h2>
            <p className="text-muted-foreground leading-relaxed">
              La seguridad de sus activos criptográficos depende exclusivamente de usted:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-3">
              <li>Guarde su frase semilla en un lugar seguro offline</li>
              <li>Use contraseñas fuertes para encriptar sus archivos .aes</li>
              <li>Nunca comparta su frase semilla o claves privadas</li>
              <li>Verifique siempre que está usando la extensión oficial</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">7. Código abierto</h2>
            <p className="text-muted-foreground leading-relaxed">
              El código fuente de PokeBit está disponible para auditoría pública. Puede verificar 
              personalmente que no existe ninguna transmisión de datos revisando el código.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">8. Cambios en esta política</h2>
            <p className="text-muted-foreground leading-relaxed">
              Si realizamos cambios en esta política de privacidad, actualizaremos la fecha de 
              "última actualización" en la parte superior de esta página.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">9. Contacto</h2>
            <p className="text-muted-foreground leading-relaxed">
              Si tiene preguntas sobre esta política de privacidad, puede contactarnos en:
            </p>
            <p className="text-primary font-medium mt-2">
              joamgm88@gmail.com
            </p>
          </section>

          <section className="mt-8 p-4 bg-primary/10 border border-primary/30 rounded-xl">
            <p className="text-sm text-primary font-medium">
              🔐 <strong>Resumen:</strong> PokeBit no recopila, almacena ni transmite ningún dato. 
              Todo el procesamiento ocurre localmente en su dispositivo. Sus claves, sus cryptos.
            </p>
          </section>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-border/50 text-center">
          <p className="text-sm text-muted-foreground">
            PokeBit | doctor.bitcoin | Cryptovault 2026
          </p>
        </footer>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
