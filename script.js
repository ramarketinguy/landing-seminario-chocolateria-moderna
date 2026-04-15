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
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
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

    // --- Track PageView via CAPI (Pixel already fires in <head>) ---
    trackEvent('PageView');

    // --- Track Purchase sólo en los botones de "Reservar" (MercadoPago y Transferencia) ---
    const btnsReservar = ['btn-reservar', 'btn-mercadopago'];
    btnsReservar.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', () => {
                const value = id === 'btn-mercadopago' ? 3190 : 2900;
                trackEvent(
                    'Purchase',
                    {},
                    {
                        currency: "UYU",
                        value: value,
                        content_ids: ['seminario_chocolateria_2026'],
                        content_type: 'product',
                        content_name: 'Seminario de Chocolatería Moderna',
                        num_items: 1
                    }
                );
            });
        }
    });

    // --- Track InitiateCheckout en el botón del Hero (solo hace scroll, no es compra todavía) ---
    const heroBtn = document.getElementById('hero-btn-reservar');
    if (heroBtn) {
        heroBtn.addEventListener('click', () => {
            trackEvent('InitiateCheckout', {}, {
                content_name: 'Hero CTA Scroll',
                content_category: 'Reservar',
                content_ids: ['seminario_chocolateria_2026'],
                content_type: 'product',
                currency: "UYU",
                value: 2900
            });
        });
    }

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
        if (typeof decrementSlots === 'function') {
            decrementSlots();
        }

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

    // =============================================
    // Scarcity Counter Logic (30 Slots & Persistence)
    // =============================================
    const slotsEl = document.getElementById('slotsCount');
    if (slotsEl) {
        let currentSlots = parseInt(localStorage.getItem('choco_slots_remain'));
        const lastVisit = parseInt(localStorage.getItem('choco_last_visit')) || 0;
        const now = Date.now();
        
        // If first time or data reset, start between 18 and 24
        if (isNaN(currentSlots) || currentSlots >= 30) {
            currentSlots = Math.floor(Math.random() * (24 - 18 + 1)) + 18;
        }

        // Logic: if they return after more than 10 minutes, decrement 1-2 slots
        if (lastVisit > 0 && (now - lastVisit) > 10 * 60 * 1000) {
            const decr = Math.floor(Math.random() * 2) + 1; // 1 or 2
            currentSlots = Math.max(3, currentSlots - decr);
        }

        // Update last visit
        localStorage.setItem('choco_last_visit', now);
        localStorage.setItem('choco_slots_remain', currentSlots);
        
        // Initial display
        slotsEl.textContent = currentSlots;

        // Function to decrement slots (exported for notifications)
        window.decrementSlots = function() {
            if (currentSlots <= 3) return;
            currentSlots--;
            localStorage.setItem('choco_slots_remain', currentSlots);
            
            // Animate only if visible
            slotsEl.classList.add('pulse-text');
            slotsEl.textContent = currentSlots;
            setTimeout(() => slotsEl.classList.remove('pulse-text'), 600);
        };

        // Simulate sales while browsing (more frequent if currentSlots is high)
        function simulateSale() {
            if (currentSlots <= 4) return;
            
            // Random chance to decrement independently (10%)
            if (Math.random() < 0.10) {
                window.decrementSlots();
            }
        }

        // Check for sale periodically while on page (every 45-90s)
        setInterval(simulateSale, Math.floor(Math.random() * (90000 - 45000 + 1)) + 45000);
    }
});
