"use client";

import { useEffect, useState } from "react";
import {
  leerConsentimiento,
  alCambiarConsentimiento,
  type Consentimiento,
} from "@/lib/consentimiento";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

let cargado = false;

function cargarScripts() {
  if (cargado) return;
  cargado = true;

  if (GA_ID) {
    const s = document.createElement("script");
    s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    s.async = true;
    document.head.appendChild(s);
    const inline = document.createElement("script");
    inline.textContent = `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`;
    document.head.appendChild(inline);
  }

  if (PIXEL_ID) {
    const inline = document.createElement("script");
    inline.textContent = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${PIXEL_ID}');
fbq('track', 'PageView');`;
    document.head.appendChild(inline);
  }
}

export default function Analytics() {
  const [consentimiento, setConsentimiento] = useState<Consentimiento>(null);

  useEffect(() => {
    setConsentimiento(leerConsentimiento());
    return alCambiarConsentimiento(setConsentimiento);
  }, []);

  useEffect(() => {
    if ((GA_ID || PIXEL_ID) && consentimiento === "aceptar") cargarScripts();
  }, [consentimiento]);

  return null;
}
