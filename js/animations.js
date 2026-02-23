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

    }

    /* ════════════════════════════════════════════════════════════
       3b. DESKTOP NAV HIGHLIGHT — IntersectionObserver (precise)
           Tracks which section occupies the top portion of the
           viewport and highlights exactly that nav link.
           Also fires immediately on nav link click.
    ════════════════════════════════════════════════════════════ */
    (function () {
        var navLinks = qa('.nav-desktop a');
        if (!navLinks.length) return;

        var navEl   = document.getElementById('mainNav');
        var navH    = navEl ? navEl.offsetHeight : 60;
        /* Re-measure on resize */
        window.addEventListener('resize', debounce(function () {
            navH = navEl ? navEl.offsetHeight : 60;
        }, 200), { passive: true });

        function setDesktopActive(id) {
            navLinks.forEach(function (link) {
                link.classList.toggle('active', link.getAttribute('href') === '#' + id);
            });
        }

        /* Use a rootMargin that makes a section "intersecting" only
           when its top edge is within a narrow band just below the nav. */
        var sectionObs = new IntersectionObserver(function (entries) {
            /* Collect all currently intersecting sections, pick the one
               whose top is closest to (but below) the nav bottom. */
            var visible = [];
            entries.forEach(function (entry) {
                if (entry.isIntersecting) visible.push(entry);
            });
            if (!visible.length) return;

            /* Sort by how close the top edge is to the nav */
            visible.sort(function (a, b) {
                return Math.abs(a.boundingClientRect.top - navH)
                     - Math.abs(b.boundingClientRect.top - navH);
            });

            setDesktopActive(visible[0].target.id);
        }, {
            /* Top of observation window starts just below the nav,
               bottom ends at 40% of viewport — ensures only the
               "leading" section is ever active. */
            rootMargin: '-' + (navH + 2) + 'px 0px -60% 0px',
            threshold: 0
        });

        qa('section[id]').forEach(function (s) { sectionObs.observe(s); });

        /* Immediate highlight on click — don't wait for scroll to settle */
        navLinks.forEach(function (link) {
            link.addEventListener('click', function () {
                var id = this.getAttribute('href').replace('#', '');
                setDesktopActive(id);
            });
        });
    })();

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
