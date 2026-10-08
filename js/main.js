window.gsap && gsap.registerPlugin(ScrollTrigger);

// ─── Theme ────────────────────────────────────────────────────
function initTheme() {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'light');
    applyTheme(theme);

    document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);
    document.getElementById('theme-toggle-mobile')?.addEventListener('click', toggleTheme);
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    const label = document.querySelector('.theme-toggle__label');
    if (label) label.textContent = theme === 'dark' ? 'Dark mode' : 'Light mode';
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
}

// ─── Mobile menu ──────────────────────────────────────────────
function initMobileMenu() {
    const toggle = document.getElementById('menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    function openMenu() {
        sidebar.classList.add('is-open');
        overlay.classList.add('is-active');
        toggle?.classList.add('is-open');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        sidebar.classList.remove('is-open');
        overlay.classList.remove('is-active');
        toggle?.classList.remove('is-open');
        document.body.style.overflow = '';
    }

    toggle?.addEventListener('click', () => {
        sidebar.classList.contains('is-open') ? closeMenu() : openMenu();
    });
    overlay?.addEventListener('click', closeMenu);
    document.querySelectorAll('.sidebar__nav a').forEach(a =>
        a.addEventListener('click', closeMenu)
    );
}

// Content is pre-rendered into index.html by build.mjs; this only decodes the email and runs the intro.
function initEmail() {
    document.querySelectorAll('[data-r]').forEach(a => {
        const email = [...a.dataset.r].reverse().join('');
        a.href = `mailto:${email}`;
        a.append(email);
    });
}

async function init() {
    initTheme();
    initMobileMenu();
    initEmail();
    if (window.gsap) animate();
    try {
        const res = await fetch('cv.json', {method: 'HEAD'});
        renderLastUpdated(res.headers.get('Last-Modified'));
    } catch (e) { /* offline: just skip the "Updated" label */ }
}

function renderLastUpdated(lastModified) {
    const el = document.getElementById('last-updated');
    if (!el) return;
    const date = lastModified
        ? new Date(lastModified).toLocaleDateString('en-GB', {day: 'numeric', month: 'long', year: 'numeric'})
        : null;
    if (!date) return;
    el.textContent = `Updated ${date}`;
}

function splitNameIntoWords() {
    const el = document.getElementById('profile-name');
    if (!el) return;
    el.innerHTML = el.textContent.trim().split(' ').map(word =>
        `<span class="word" style="display:inline-block;white-space:nowrap">${word}</span>`
    ).join(' ');
}

function animate() {
    const isMobile = window.innerWidth <= 768;
    const tl = gsap.timeline({defaults: {ease: 'power3.out'}});

    gsap.set('.main', {autoAlpha: 0, scale: 0.97});

    if (!isMobile) {
        splitNameIntoWords();

        gsap.set('.sidebar', {clipPath: 'inset(0 100% 0 0)'});
        gsap.set('.profile__name .word', {autoAlpha: 0, y: 24, rotateX: -90});
        gsap.set('.profile__title', {autoAlpha: 0, x: -10});
        gsap.set('.sidebar__nav a', {autoAlpha: 0, clipPath: 'inset(0 100% 0 0)'});
        gsap.set('.contact__item', {autoAlpha: 0, y: 12});
        gsap.set('.sidebar__footer', {autoAlpha: 0, y: 8});

        tl
            .to('.sidebar', {clipPath: 'inset(0 0% 0 0)', duration: 0.75, ease: 'power4.inOut'})
            .to('.profile__name .word', {
                autoAlpha: 1, y: 0, rotateX: 0,
                duration: 0.55, stagger: 0.1, ease: 'back.out(2)',
                transformOrigin: '50% 100%',
            }, '-=0.2')
            .to('.profile__title', {autoAlpha: 1, x: 0, duration: 0.4, ease: 'power2.out'}, '-=0.15')
            .to('.sidebar__nav a', {
                autoAlpha: 1, clipPath: 'inset(0 0% 0 0)',
                duration: 0.4, stagger: 0.07, ease: 'power3.out',
            }, '-=0.2')
            .to('.contact__item', {
                autoAlpha: 1, y: 0,
                duration: 0.5, stagger: 0.07, ease: 'back.out(1.6)',
            }, '-=0.15')
            .to('.sidebar__footer', {autoAlpha: 1, y: 0, duration: 0.4, ease: 'power2.out'}, '-=0.2')
            .to('.main', {autoAlpha: 1, scale: 1, duration: 0.7, ease: 'power2.out'}, '-=0.3');
    } else {
        tl.to('.main', {autoAlpha: 1, scale: 1, duration: 0.5, ease: 'power2.out'});
    }

    // Whole-card entrance on scroll (skip summary — it's above the fold)
    document.querySelectorAll('.section:not(.summary-section)').forEach(section => {
        gsap.from(section, {
            scrollTrigger: {trigger: section, start: 'top 88%'},
            y: 48, autoAlpha: 0, scale: 0.985,
            duration: 0.7, ease: 'power3.out',
        });
    });

    // 3D tilt on portfolio cards
    document.querySelectorAll('.portfolio-item').forEach(card => {
        card.addEventListener('mousemove', e => {
            const r = card.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;
            gsap.to(card, {
                rotateY: x * 10, rotateX: -y * 10,
                transformPerspective: 700,
                duration: 0.25, ease: 'power2.out', overwrite: 'auto',
            });
        });
        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                rotateY: 0, rotateX: 0,
                duration: 0.6, ease: 'elastic.out(1, 0.5)', overwrite: 'auto',
            });
        });
    });
}

// ─── Active nav on scroll ────────────────────────────────────
function initActiveNav() {
    const navLinks = document.querySelectorAll('.sidebar__nav a[href^="#"]');
    const sections = [...navLinks].map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === `#${entry.target.id}`));
            }
        });
    }, {rootMargin: '-20% 0px -70% 0px'});

    sections.forEach(s => observer.observe(s));
}

// ─── Download CV (print) ─────────────────────────────────────
function initDownload() {
    document.getElementById('download-btn')?.addEventListener('click', e => {
        e.preventDefault();
        window.print();
    });
}

// ─── Scroll progress bar ────────────────────────────────────
function initScrollProgress() {
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        const total = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = total > 0 ? `${(scrolled / total) * 100}%` : '0%';
    }, {passive: true});
}

init();
initActiveNav();
initDownload();
initScrollProgress();
