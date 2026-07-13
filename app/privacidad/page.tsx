import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aviso de privacidad",
  description:
    "Aviso de privacidad de BuscaViveros: qué datos recopilamos, para qué los usamos y cómo ejercer tus derechos ARCO.",
};

export default function PaginaPrivacidad() {
  return (
    <main className="flex-1 max-w-3xl mx-auto px-4 py-12 w-full">
      <h1 className="font-heading text-3xl font-bold">Aviso de privacidad</h1>
      <p className="text-muted mt-1">Última actualización: julio de 2026</p>

      <div className="mt-8 space-y-8 leading-relaxed">
        <section aria-labelledby="p-responsable">
          <h2 id="p-responsable" className="font-heading text-xl font-semibold">
            1. Responsable del tratamiento
          </h2>
          <p className="mt-2">
            BuscaViveros (en adelante, “el sitio”) es un directorio en línea de viveros en
            México. Somos responsables del tratamiento de los datos personales que se
            describen en este aviso. Para cualquier tema relacionado con tus datos puedes
            escribirnos al correo de contacto publicado en el pie del sitio.
          </p>
        </section>

        <section aria-labelledby="p-datos">
          <h2 id="p-datos" className="font-heading text-xl font-semibold">
            2. Qué datos recopilamos
          </h2>
          <ul className="mt-2 list-disc pl-6 space-y-1">
            <li>
              <strong>Datos de cuenta:</strong> correo electrónico y, si entras con Google,
              el nombre asociado a tu cuenta. Los usamos para iniciar sesión y avisarte del
              estado de tu solicitud.
            </li>
            <li>
              <strong>Datos de tu negocio:</strong> nombre del vivero, ubicación, teléfono,
              WhatsApp, horarios, fotos y especialidades. Son públicos: publicarlos es el
              propósito del directorio.
            </li>
            <li>
              <strong>Métricas de uso:</strong> contamos vistas y clics en los botones de
              contacto de cada ficha de forma agregada, sin identificarte.
            </li>
            <li>
              <strong>Cookies de publicidad:</strong> solo si las aceptas, Google AdSense
              usa cookies para mostrar anuncios relevantes. Puedes rechazarlas y el sitio
              funciona igual.
            </li>
          </ul>
        </section>

        <section aria-labelledby="p-fines">
          <h2 id="p-fines" className="font-heading text-xl font-semibold">
            3. Para qué los usamos
          </h2>
          <ul className="mt-2 list-disc pl-6 space-y-1">
            <li>Publicar y administrar las fichas de viveros del directorio.</li>
            <li>Verificar que quien reclama una ficha es realmente el dueño.</li>
            <li>Contactarte por WhatsApp o correo sobre tu solicitud o tu plan destacado.</li>
            <li>Mostrar publicidad que mantiene el directorio gratuito (solo con tu consentimiento).</li>
          </ul>
        </section>

        <section aria-labelledby="p-terceros">
          <h2 id="p-terceros" className="font-heading text-xl font-semibold">
            4. Con quién se comparten
          </h2>
          <p className="mt-2">
            Usamos proveedores que procesan datos por nosotros: Supabase (base de datos y
            autenticación), Vercel (alojamiento) y Google (inicio de sesión y, si aceptas
            cookies, publicidad AdSense y analítica). No vendemos tus datos personales a
            terceros.
          </p>
        </section>

        <section aria-labelledby="p-arco">
          <h2 id="p-arco" className="font-heading text-xl font-semibold">
            5. Tus derechos (ARCO)
          </h2>
          <p className="mt-2">
            Conforme a la Ley Federal de Protección de Datos Personales en Posesión de los
            Particulares, puedes <strong>Acceder</strong> a tus datos,{" "}
            <strong>Rectificarlos</strong>, <strong>Cancelarlos</strong> u{" "}
            <strong>Oponerte</strong> a su tratamiento. Escríbenos indicando tu nombre, el
            vivero asociado y el derecho que quieres ejercer; respondemos en un máximo de 20
            días hábiles. También puedes editar tu ficha directamente desde tu panel o
            pedirnos eliminarla por completo.
          </p>
        </section>

        <section aria-labelledby="p-cookies">
          <h2 id="p-cookies" className="font-heading text-xl font-semibold">
            6. Cookies
          </h2>
          <p className="mt-2">
            Las cookies esenciales mantienen tu sesión iniciada y recuerdan tu elección de
            consentimiento. Las cookies de publicidad de Google solo se instalan si eliges
            “Aceptar” en el aviso de cookies. Puedes cambiar de opinión borrando las cookies
            de tu navegador; el aviso volverá a aparecer.
          </p>
        </section>

        <section aria-labelledby="p-cambios">
          <h2 id="p-cambios" className="font-heading text-xl font-semibold">
            7. Cambios a este aviso
          </h2>
          <p className="mt-2">
            Si este aviso cambia de forma relevante, publicaremos la nueva versión en esta
            misma página con la fecha de actualización.
          </p>
        </section>
      </div>
    </main>
  );
}
