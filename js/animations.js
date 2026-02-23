/* ═══════════════════════════════════════════════════════════════
   ANIMATIONS.JS — Scroll reveals, micro-interactions, entrances
   Uses IntersectionObserver + CSS transitions (no GSAP dependency)
   GSAP CDN is loaded in index.html; this file uses gsap if available,
   else falls back to CSS transitions.
═══════════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    /* ── Utility ── */
    function q(sel)  { return document.querySelector(sel); }
    function qa(sel) { return Array.from(document.querySelectorAll(sel)); }

    /* ════════════════════════════════════════════════════════════
       1. SCROLL REVEAL — section-level
    ════════════════════════════════════════════════════════════ */
    var revealObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
            if (e.isIntersecting) {
                e.target.classList.add('revealed');
                revealObs.unobserve(e.target); /* fire once */
            }
        });
    }, { threshold: 0.07, rootMargin: '0px 0px -40px 0px' });

    qa('section[data-reveal]').forEach(function (s) {
        revealObs.observe(s);
    });

    /* ════════════════════════════════════════════════════════════
       2. CARD STAGGER — staggered entrance for grid items
    ════════════════════════════════════════════════════════════ */
    var cardObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
            if (e.isIntersecting) {
                var cards = e.target.querySelectorAll('.skill-tag, .card, .project-card');
                cards.forEach(function (card, i) {
                    var delay = i * 65;
                    card.style.transitionDelay = delay + 'ms';
                    setTimeout(function () {
                        card.style.opacity   = '1';
                        card.style.transform = 'translateY(0)';
                    }, delay);
                });
                cardObs.unobserve(e.target);
            }
        });
    }, { threshold: 0.05 });

    qa('section[data-reveal]').forEach(function (s) {
        var items = s.querySelectorAll('.skill-tag, .card, .project-card');
        items.forEach(function (item) {
            item.style.opacity   = '0';
            item.style.transform = 'translateY(22px)';
            item.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
        });
        cardObs.observe(s);
    });

    /* ════════════════════════════════════════════════════════════
       3. GSAP BUTTON RIPPLE (if GSAP is available)
    ════════════════════════════════════════════════════════════ */
    if (typeof gsap !== 'undefined') {

        qa('.btn').forEach(function (btn) {
            btn.addEventListener('mouseenter', function () {
                gsap.to(btn, {
                    duration: 0.3,
                    scale: 1.03,
                    ease: 'power2.out',
                });
            });
            btn.addEventListener('mouseleave', function () {
                gsap.to(btn, {
                    duration: 0.25,
                    scale: 1,
                    ease: 'power2.inOut',
                });
            });
        });

        /* Animated counter for header stats */
        var statsObs = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (!e.isIntersecting) return;
                qa('.stat-number').forEach(function (el) {
                    gsap.from(el, {
                        duration: 0.7,
                        opacity: 0,
                        y: 14,
                        ease: 'power3.out',
                        delay: 0.1,
                    });
                });
                statsObs.disconnect();
            });
        }, { threshold: 0.5 });

        var statsEl = q('.header-stats');
        if (statsEl) statsObs.observe(statsEl);

        /* Nav highlight on scroll — GSAP tween opacity */
        window.addEventListener('scroll', debounce(function () {
            var sections = qa('section[id]');
            var navLinks = qa('.nav-desktop a');
            if (!navLinks.length) return;

            var scrollY = window.pageYOffset;
            var current = '';

            sections.forEach(function (s) {
                if (scrollY >= s.offsetTop - 120) current = s.id;
            });

            navLinks.forEach(function (link) {
                var isActive = link.getAttribute('href') === '#' + current;
                link.classList.toggle('active', isActive);
            });
        }, 80), { passive: true });
    }

    /* ════════════════════════════════════════════════════════════
       4. WORKFLOW NODE ENTRANCE (per-modal open hook)
    ════════════════════════════════════════════════════════════ */
    window.animateWorkflowNodes = function (modalEl) {
        if (!modalEl) return;
        var nodes = modalEl.querySelectorAll('.workflow-node');
        nodes.forEach(function (node, i) {
            node.style.opacity   = '0';
            node.style.transform = 'translateY(16px)';
            node.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            setTimeout(function () {
                node.style.opacity   = '1';
                node.style.transform = 'translateY(0)';
            }, 180 + i * 80);
        });
    };

    /* ════════════════════════════════════════════════════════════
       5. SKILL TAG HOVER GLOW (lightweight CSS class toggle)
    ════════════════════════════════════════════════════════════ */
    qa('.skill-tag').forEach(function (tag) {
        tag.addEventListener('mouseenter', function () {
            tag.style.boxShadow = '0 0 18px rgba(0,212,255,0.22)';
        });
        tag.addEventListener('mouseleave', function () {
            tag.style.boxShadow = '';
        });
    });

    /* ════════════════════════════════════════════════════════════
       6. NAV SCROLL SHADOW
    ════════════════════════════════════════════════════════════ */
    var mainNav = document.getElementById('mainNav');
    if (mainNav) {
        window.addEventListener('scroll', debounce(function () {
            mainNav.classList.toggle('scrolled', window.pageYOffset > 60);
        }, 50), { passive: true });
    }

    /* ════════════════════════════════════════════════════════════
       DEBOUNCE HELPER
    ════════════════════════════════════════════════════════════ */
    function debounce(fn, ms) {
        var timer;
        return function () {
            clearTimeout(timer);
            timer = setTimeout(fn, ms);
        };
    }

    window._animationsReady = true;
})();
