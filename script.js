document.addEventListener('DOMContentLoaded', () => {
    // Initialize feather icons
    if (typeof feather !== 'undefined') {
        feather.replace();
    }

    // =============================================
    // Scroll Reveal with Intersection Observer
    // =============================================
    const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .fade-in-up');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    revealElements.forEach((el) => revealObserver.observe(el));

    // =============================================
    // Gallery Staggered Reveal
    // =============================================
    const galleryItems = document.querySelectorAll('.gallery-stagger');

    const galleryObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                // Stagger each item with incremental delay
                const items = entry.target.parentElement.querySelectorAll('.gallery-stagger');
                items.forEach((item, index) => {
                    setTimeout(() => {
                        item.classList.add('reveal-active');
                    }, index * 100);
                });
                galleryObserver.disconnect();
            }
        });
    }, { threshold: 0.1 });

    if (galleryItems.length > 0) {
        galleryObserver.observe(galleryItems[0]);
    }

    // =============================================
    // Hero Parallax Effect
    // =============================================
    const heroContent = document.querySelector('.hero-content');

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        if (heroContent && scrollY < window.innerHeight) {
            heroContent.style.transform = `translateY(${scrollY * 0.3}px)`;
            heroContent.style.opacity = Math.max(0, 1 - (scrollY * 0.002));
        }
    }, { passive: true });

    // =============================================
    // Smooth Scroll for Anchor Links
    // =============================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            // Only handle internal links that actually start with # and aren't just #
            if (href.startsWith('#') && href.length > 1) {
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // =============================================
    // Countdown Timer
    // =============================================
    const eventDate = new Date('2026-05-24T14:00:00-03:00').getTime();
    const countDays = document.getElementById('countDays');
    const countHours = document.getElementById('countHours');
    const countMinutes = document.getElementById('countMinutes');
    const countSeconds = document.getElementById('countSeconds');

    function updateCountdown() {
        const now = Date.now();
        const diff = eventDate - now;

        if (diff <= 0) {
            countDays.textContent = '00';
            countHours.textContent = '00';
            countMinutes.textContent = '00';
            countSeconds.textContent = '00';
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        countDays.textContent = String(days).padStart(2, '0');
        countHours.textContent = String(hours).padStart(2, '0');
        countMinutes.textContent = String(minutes).padStart(2, '0');
        countSeconds.textContent = String(seconds).padStart(2, '0');
    }

    if (countDays) {
        updateCountdown();
        setInterval(updateCountdown, 1000);
    }

    // =============================================
    // Price Counter Animation
    // =============================================
    const priceEl = document.getElementById('priceAmount');

    if (priceEl) {
        const target = parseInt(priceEl.dataset.target, 10);
        let hasAnimated = false;

        const priceObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && !hasAnimated) {
                    hasAnimated = true;
                    animateCounter(priceEl, target, 1500);
                    priceObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        priceObserver.observe(priceEl);
    }

    function animateCounter(element, target, duration) {
        const startTime = performance.now();

        function step(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(eased * target);

            element.textContent = current.toLocaleString('es-UY');

            if (progress < 1) {
                requestAnimationFrame(step);
            }
        }

        requestAnimationFrame(step);
    }

    // =============================================
    // Floating WhatsApp Button - Show on scroll
    // =============================================
    const floatingWa = document.getElementById('floatingWa');

    if (floatingWa) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 400) {
                floatingWa.classList.add('visible');
            } else {
                floatingWa.classList.remove('visible');
            }
        }, { passive: true });
    }

    // =============================================
    // El Identificador Externo (getExternalId) ya está definido globalmente en index.html
    // =============================================

    // =============================================
    // Meta CAPI & Pixel Tracking
    // =============================================
    function trackEvent(eventName, eventData = {}, customData = {}, attributionData = {}) {
        // Generate unique event_id for deduplication between Pixel and CAPI
        const timeNow = Math.floor(Date.now() / 1000);
        const eventId = 'evt_' + timeNow + '_' + Math.random().toString(36).slice(2, 11);

        // 1. Fire Pixel directly (with event_id for deduplication)
        if (typeof fbq === 'function') {
            fbq('track', eventName, customData, { eventID: eventId });
        }

        // 2. Fire CAPI via serverless proxy
        // Try to get or set fbc and fbp cookies for better CAPI matching
        const getOrSetFbp = () => {
            const match = document.cookie.match(new RegExp('(^| )_fbp=([^;]+)'));
            if (match) return match[2];
            // Meta _fbp format: fb.subdomainIndex.creationTime.random
            const newFbp = `fb.1.${Date.now()}.${Math.round(Math.random() * 10000000000)}`;
            const date = new Date();
            date.setTime(date.getTime() + (90 * 24 * 60 * 60 * 1000));
            document.cookie = `_fbp=${newFbp};expires=${date.toUTCString()};path=/`;
            return newFbp;
        };

        const getOrSetFbc = () => {
            const match = document.cookie.match(new RegExp('(^| )_fbc=([^;]+)'));
            if (match) return match[2];

            // Si no hay cookie fbc, intentar extraer el fbclid de la URL e inferir fbc
            const urlParams = new URLSearchParams(window.location.search);
            const fbclid = urlParams.get('fbclid');
            if (fbclid) {
                // Formato oficial: fb.subdomainIndex.creationTimeInMs.fbclid
                const newFbc = `fb.1.${Date.now()}.${fbclid}`;
                const date = new Date();
                date.setTime(date.getTime() + (90 * 24 * 60 * 60 * 1000));
                document.cookie = `_fbc=${newFbc};expires=${date.toUTCString()};path=/`;
                return newFbc;
            }
            return null;
        };

        const fbp = getOrSetFbp();
        const fbc = getOrSetFbc();

        const userData = {
            client_user_agent: navigator.userAgent,
            external_id: getExternalId(), // Envía un ID único para mejorar Data Quality
            ...eventData
        };

        if (fbp) userData.fbp = fbp;
        if (fbc) userData.fbc = fbc;

        const eventPayload = {
            event_name: eventName,
            event_time: timeNow,
            action_source: "website",
            event_id: eventId,
            event_source_url: window.location.href,
            user_data: userData,
        };

        // Meta API rejects the request (400) if these are sent as empty objects {}
        if (Object.keys(customData).length > 0) {
            eventPayload.custom_data = customData;
        }
        if (Object.keys(attributionData).length > 0) {
            eventPayload.attribution_data = attributionData;
        }

        const payload = {
            data: [eventPayload]
        };

        // Obtener test_event_code de la URL si existe para probar eventos
        const urlParams = new URLSearchParams(window.location.search);
        const testCode = urlParams.get('test_event_code');
        if (testCode) {
            payload.test_event_code = testCode;
        }

        fetch('/api/meta-capi', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).catch(err => console.error('Meta CAPI tracking error:', err));
    }

    // --- Eventos Básicos ---
    trackEvent('PageView');
    trackEvent('ViewContent', {}, {
        content_name: 'Seminario de Chocolatería Moderna',
        content_ids: ['seminario_chocolateria_2026'],
        content_type: 'product',
        currency: 'UYU',
        value: 2900
    });

    // ── Lógica del Modal ────────────────────────────────────────
    const overlay   = document.getElementById('modalOverlay');
    const btnClose  = document.getElementById('modalClose');

    function openModal() {
        updateWaLink();
        if(overlay) overlay.classList.add('open');
        document.body.style.overflow = 'hidden';

        trackEvent('InitiateCheckout', {}, {
            content_name: 'Seminario Seleccionado',
            currency: 'UYU', value: 2900,
            content_ids: ['seminario_chocolateria_2026'], content_type: 'product'
        });
    }

    function closeModal() {
        if(overlay) overlay.classList.remove('open');
        document.body.style.overflow = '';
    }

    if(btnClose) btnClose.addEventListener('click', closeModal);
    if(overlay) overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

    document.querySelectorAll('.btn-open-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal();
        });
    });

    // ── WhatsApp con datos del formulario ────────────────────────
    function getFormData() {
        return {
            nombre:   (document.getElementById('f-nombre')?.value   || '').trim(),
            apellido: (document.getElementById('f-apellido')?.value  || '').trim(),
            email:    (document.getElementById('f-email')?.value     || '').trim(),
            tel:      (document.getElementById('f-tel')?.value       || '').trim(),
            cert:     document.querySelector('input[name="cert"]:checked')?.value || 'No indicado'
        };
    }

    function updateWaLink() {
        const fd = getFormData();
        const msg = `Hola! Quiero enviar mi comprobante de transferencia para el Seminario de Chocolatería ($2.900 contado).

Mis datos:
• Nombre: ${fd.nombre} ${fd.apellido}
• Email: ${fd.email || '(no indicado)'}
• Tel/WhatsApp: ${fd.tel || '(no indicado)'}
• Certificado: ${fd.cert}

Adjunto el comprobante a continuación.`;
        const waBtn = document.getElementById('btn-modal-wa');
        if(waBtn) waBtn.href = 'https://wa.me/59898058264?text=' + encodeURIComponent(msg);
    }

    ['f-nombre','f-apellido','f-email','f-tel'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.addEventListener('input', updateWaLink);
    });
    document.querySelectorAll('input[name="cert"]').forEach(r => {
        r.addEventListener('change', updateWaLink);
    });

    // ── Purchase tracking ────────────────────────────────────────
    const btnMp = document.getElementById('btn-modal-mp');
    if(btnMp) btnMp.addEventListener('click', () => {
        trackEvent('Purchase', {}, { currency:'UYU', value: 3200,
            content_name: 'Seminario de Chocolatería — Tarjeta',
            content_ids: ['seminario_chocolateria_2026'], content_type:'product', num_items: 1 });
    });

    const btnWa = document.getElementById('btn-modal-wa');
    if(btnWa) btnWa.addEventListener('click', () => {
        trackEvent('Purchase', {}, { currency:'UYU', value: 2900,
            content_name: 'Seminario de Chocolatería — Contado',
            content_ids: ['seminario_chocolateria_2026'], content_type:'product', num_items: 1 });
    });

    // --- Track Contact on floating WhatsApp button ---
    if (floatingWa) {
        floatingWa.addEventListener('click', () => {
            trackEvent('Contact', {}, {
                content_name: 'WhatsApp Flotante',
                content_category: 'Soporte',
                content_ids: ['whatsapp_consult'],
                content_type: 'product'
            });
        });
    }

    // =============================================
    // FAQ Accordion
    // =============================================
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (!question) return;
        question.addEventListener('click', () => {
            const isOpen = item.classList.contains('faq-open');
            faqItems.forEach(i => i.classList.remove('faq-open'));
            if (!isOpen) {
                item.classList.add('faq-open');
            }
        });
    });

    // =============================================
    // Social Proof Notifications
    // =============================================
    // =============================================
    // Social Proof Notifications (Optimized)
    // =============================================
    const socialNotifications = [
        { name: "Lucía M.", action: "se acaba de inscribir" },
        { name: "Carlos R.", action: "reservó su lugar por transferencia" },
        { name: "Sofía G.", action: "consultó por WhatsApp" },
        { name: "Martín P.", action: "se inscribió al Seminario" },
        { name: "Valentina S.", action: "aprovechó la oferta preventa" },
        { name: "Facundo D.", action: "reservó para 2 personas" },
        { name: "Laura B.", action: "completó su inscripción" },
        { name: "Joaquín L.", action: "compró el combo individual" },
        { name: "Elena F.", action: "se acaba de inscribir" },
        { name: "Nicolás T.", action: "reservó su lugar" },
        { name: "Mariana V.", action: "se inscribió al Seminario" },
        { name: "Gabriel S.", action: "aprovechó la oferta" },
        { name: "Victoria P.", action: "se acaba de inscribir" },
        { name: "Roberto M.", action: "reservó por transferencia" },
        { name: "Silvina G.", action: "consultó disponibilidad" },
        { name: "Agustín L.", action: "se inscribió ahora" },
        { name: "Patricia K.", action: "completó el pago" },
        { name: "Fernando D.", action: "aseguró su cupo" },
        { name: "Jimena O.", action: "se inscribió al taller" },
        { name: "Andrés B.", action: "aprovechó la preventa" },
        { name: "Carolina W.", action: "se inscribió para el sábado" },
        { name: "Diego N.", action: "reservó su lugar" },
        { name: "Verónica R.", action: "se acaba de inscribir" },
        { name: "Lucas F.", action: "compró su entrada" },
        { name: "Belén M.", action: "reservó por WhatsApp" },
        { name: "Gonzalo J.", action: "se inscribió al Seminario" },
        { name: "Florencia S.", action: "aprovechó la promoción" },
        { name: "Ignacio Q.", action: "completó su reserva" },
        { name: "Camila H.", action: "se inscribió recién" },
        { name: "Esteban Z.", action: "reservó su espacio" }
    ];

    let sessionNotificationCount = 0;
    const MAX_SESSION_NOTIFICATIONS = 3;
    let shownNamesSet = new Set();

    function createNotificationToast() {
        const toast = document.createElement('div');
        toast.className = 'notification-toast';
        toast.id = 'notificationToast';
        toast.innerHTML = `
            <img src="https://ui-avatars.com/api/?name=User&background=CFA15F&color=fff" class="notif-img" alt="User">
            <div class="notif-content">
                <p class="notif-text"><strong id="notif-name"></strong> <span id="notif-action"></span></p>
                <p class="notif-time" id="notif-time"></p>
            </div>
        `;
        document.body.appendChild(toast);
        return toast;
    }

    function showRandomNotification() {
        if (sessionNotificationCount >= MAX_SESSION_NOTIFICATIONS) return;

        let toast = document.getElementById('notificationToast');
        if (!toast) toast = createNotificationToast();

        // Find a name that hasn't been shown yet this session
        let notif;
        let attempts = 0;
        do {
            notif = socialNotifications[Math.floor(Math.random() * socialNotifications.length)];
            attempts++;
        } while (shownNamesSet.has(notif.name) && attempts < 50);

        shownNamesSet.add(notif.name);
        
        const nameEl = document.getElementById('notif-name');
        const actionEl = document.getElementById('notif-action');
        const timeEl = document.getElementById('notif-time');
        const imgEl = toast.querySelector('.notif-img');

        nameEl.textContent = notif.name;
        actionEl.textContent = notif.action;
        
        const minutes = Math.floor(Math.random() * 55) + 2;
        timeEl.textContent = `Hace ${minutes} minutos`;
        
        const colors = ['CFA15F', '1B0E0D', '805D3F', '5D3A1A'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        imgEl.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(notif.name)}&background=${randomColor}&color=fff&bold=true`;

        toast.classList.add('show');
        sessionNotificationCount++;
        
        // Decrement slots when a notification appears (simulating a sale/inquiry)
        // Decrement slots removed as we use 'cupos limitados' now
        /*
        if (typeof decrementSlots === 'function') {
            decrementSlots();
        }
        */

        setTimeout(() => {
            toast.classList.remove('show');
        }, 5000);
    }

    // Interval setup: 30s initial, then 60s
    if (socialNotifications.length > 0) {
        setTimeout(() => {
            showRandomNotification();
            const intervalId = setInterval(() => {
                if (sessionNotificationCount >= MAX_SESSION_NOTIFICATIONS) {
                    clearInterval(intervalId);
                    return;
                }
                showRandomNotification();
            }, 60000);
        }, 30000);
    }

    // Scarcity Counter Logic removed as we now use static 'Cupos limitados'
    /*
    const scarcityElements = document.querySelectorAll('.slots-count-val');
    ...
    */
});
