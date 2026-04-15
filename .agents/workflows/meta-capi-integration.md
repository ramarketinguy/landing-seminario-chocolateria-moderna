---
description: Regla y Mejores Prácticas para Integración de Meta Pixel y CAPI
---
# Regla Interna: Integración Meta Pixel y Conversions API (CAPI)

Siempre que debas implementar o corregir una integración de Meta Pixel y CAPI, DEBES seguir estrictamente esta estructura para asegurar la máxima Calidad de Coincidencias de Eventos (Event Match Quality) y evitar la pérdida de eventos, de acuerdo a las directrices de Meta.

Esta regla requiere que las implementaciones respeten siempre estos tres pilares:
1. Generación de `external_id` único anónimo.
2. Inferencia y captura infalible del identificador de clic de Facebook (`fbc`) y de navegador (`fbp`).
3. Captura estricta de la dirección IP original del cliente en el servidor.

A continuación están las plantillas obligatorias.

## 1. Pixel en el Frontend (`index.html` o equivalente)

**Generación de Identificador Externo (`external_id`):** 
Debe crearse e inyectarse un `external_id` persistente en el `localStorage` del navegador.

```html
<!-- Meta Pixel Code -->
<script>
    // Generar o recuperar Identificador Externo para Advanced Matching
    function getExternalId() {
        let extId = localStorage.getItem('_external_id');
        if (!extId) {
            extId = 'anon_' + Math.floor(Date.now() / 1000) + '_' + Math.random().toString(36).substring(2, 15);
            localStorage.setItem('_external_id', extId);
        }
        return extId;
    }

    !function (f, b, e, v, n, t, s) {
        if (f.fbq) return; n = f.fbq = function () {
            n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
        };
        if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
        n.queue = []; t = b.createElement(e); t.async = !0;
        t.src = v; s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s)
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
        
    fbq('init', 'PIXEL_ID', { external_id: getExternalId() });
</script>
<!-- End Meta Pixel Code -->
```

## 2. Tracking de Eventos CAPI en el Frontend (`script.js` o equivalente)

**Estructura Obligatoria para `trackEvent`:**
- Generar un `event_id` único para **deduplicación exacta** entre Pixel y Servidor.
- **Robustez de Identificadores:** Implementar lógica de "Obtener o Crear" para `fbp` y `fbc`. Esto asegura que el primer evento (PageView) ya lleve identificadores aunque el Píxel aún no haya terminado de cargar.
- **Enriquecimiento del Evento:** Incluir parámetros de `custom_data` recomendados por Meta (`content_ids`, `content_type`, `num_items`, `value`, `currency`) para mejorar la optimización de anuncios.

```javascript
function trackEvent(eventName, eventData = {}, customData = {}, attributionData = {}) {
    const timeNow = Math.floor(Date.now() / 1000);
    const eventId = 'evt_' + timeNow + '_' + Math.random().toString(36).substr(2, 9);

    // 1. Enviar evento y event_id al Pixel del navegador
    if (typeof fbq === 'function') {
        fbq('track', eventName, customData, { eventID: eventId });
    }

    // 2. Lógica robusta de Cookies (Meta FBP/FBC)
    const getOrSetFbp = () => {
        const match = document.cookie.match(new RegExp('(^| )_fbp=([^;]+)'));
        if (match) return match[2];
        const newFbp = `fb.1.${Date.now()}.${Math.round(Math.random() * 10000000000)}`;
        const date = new Date();
        date.setTime(date.getTime() + (90 * 24 * 60 * 60 * 1000));
        document.cookie = `_fbp=${newFbp};expires=${date.toUTCString()};path=/`;
        return newFbp;
    };

    const getOrSetFbc = () => {
        const match = document.cookie.match(new RegExp('(^| )_fbc=([^;]+)'));
        if (match) return match[2];
        const urlParams = new URLSearchParams(window.location.search);
        const fbclid = urlParams.get('fbclid');
        if (fbclid) {
            const newFbc = `fb.1.${Date.now()}.${fbclid}`;
            const date = new Date();
            date.setTime(date.getTime() + (90 * 24 * 60 * 60 * 1000));
            document.cookie = `_fbc=${newFbc};expires=${date.toUTCString()};path=/`;
            return newFbc;
        }
        return null;
    };

    const userData = {
        client_user_agent: navigator.userAgent,
        external_id: localStorage.getItem('_external_id'),
        fbp: getOrSetFbp(),
        fbc: getOrSetFbc(),
        ...eventData
    };

    const eventPayload = {
        event_name: eventName,
        event_time: timeNow,
        action_source: "website",
        event_id: eventId,
        event_source_url: window.location.href,
        user_data: userData,
    };

    if (Object.keys(customData).length > 0) eventPayload.custom_data = customData;
    
    // Preparar y enviar Payload
    const payload = { data: [eventPayload] };
    const testCode = new URLSearchParams(window.location.search).get('test_event_code');
    if (testCode) payload.test_event_code = testCode;

    fetch('/api/meta-capi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    }).catch(err => console.error('Meta CAPI error:', err));
}
```

## 3. Servidor / Proxy CAPI (`api/meta-capi.js`, Vercel / Node)

**Requisitos del Servidor:**
- **CRÍTICO:** Capturar la IP real del cliente usando los headers estándar.
- **Seguridad PII:** El servidor DEBE asegurar que el `external_id` (y cualquier dato personal como `em` o `ph`) viaje hasheado en **SHA-256** antes de llegar a Meta.

```javascript
import crypto from 'crypto';

export default async function handler(req, res) {
    // ... configuración y CORS ...
    const PIXEL_ID = process.env.META_PIXEL_ID;
    const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
    const payload = req.body;
    
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || 
                     req.headers['x-real-ip'] || 
                     req.socket?.remoteAddress || '';

    payload.data = payload.data.map(event => {
        if (!event.user_data) event.user_data = {};
        
        // 1. Inyectar IP
        if (!event.user_data.client_ip_address && clientIp) {
            event.user_data.client_ip_address = clientIp;
        }
        
        // 2. Hashing obligatorio para EMQ (External ID, Email, etc)
        if (event.user_data.external_id) {
            const extId = String(event.user_data.external_id).trim();
            if (!/^[a-f0-9]{64}$/i.test(extId)) { // Si no es ya un hash SHA256
                event.user_data.external_id = crypto.createHash('sha256').update(extId).digest('hex');
            }
        }
        
        return event;
    });

    // ... fetch a Meta Graph API ...
}
```
