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
    const eventDate = new Date('2026-03-22T14:00:00-03:00').getTime();
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
    // Meta CAPI & Pixel Tracking
    // =============================================
    function trackEvent(eventName, eventData = {}, customData = {}, attributionData = {}) {
        // Generate unique event_id for deduplication between Pixel and CAPI
        const timeNow = Math.floor(Date.now() / 1000);
        const eventId = 'evt_' + timeNow + '_' + Math.random().toString(36).substr(2, 9);

        // 1. Fire Pixel directly (with event_id for deduplication)
        if (typeof fbq === 'function') {
            fbq('track', eventName, customData, { eventID: eventId });
        }

        // 2. Fire CAPI via serverless proxy
        // Try to get fbc and fbp cookies for better CAPI matching
        const getCookie = (name) => {
            const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
            return match ? match[2] : null;
        };

        const userData = {
            client_user_agent: navigator.userAgent,
            ...eventData
        };

        const fbp = getCookie('_fbp');
        const fbc = getCookie('_fbc');
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

        // Add test_event_code (TEST9506) temporarily for testing
        const urlParams = new URLSearchParams(window.location.search);
        const testCode = urlParams.get('test_event_code') || 'TEST9506';
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

    // --- Track Purchase on "Reservar" buttons ---
    const btnsReservar = ['btn-reservar', 'hero-btn-reservar'];
    btnsReservar.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', () => {
                trackEvent(
                    'Purchase',
                    {},
                    { currency: "UYU", value: "2900" },
                    { attribution_share: "0.5" }
                );
            });
        }
    });

    // --- Track Contact on floating WhatsApp button ---
    if (floatingWa) {
        floatingWa.addEventListener('click', () => {
            trackEvent('Contact', {}, { content_name: 'WhatsApp Flotante' });
        });
    }
});
