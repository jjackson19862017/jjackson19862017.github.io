gsap.registerPlugin(ScrollTrigger);

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

const icons = {
    email: `<svg viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/></svg>`,
    phone: `<svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.13 6.13l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
    github: `<svg viewBox="0 0 24 24"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>`,
    linkedin: `<svg viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>`,
    pin: `<svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
};

async function init() {
    initTheme();
    initMobileMenu();
    const res = await fetch('cv.json');
    const lastModified = res.headers.get('Last-Modified');
    const data = await res.json();
    render(data);
    renderLastUpdated(lastModified);
    animate();
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

function render(data) {
    const {profile, experience, portfolio, skills, education} = data;

    document.title = `${profile.name} — CV`;
    document.getElementById('profile-name').textContent = profile.name;
    document.getElementById('profile-title').textContent = profile.title;
    document.getElementById('summary-text').textContent = profile.summary;

    // Contact
    const email = profile.contact.email.split('').reverse().join('');
    const contactMap = [
        {key: 'email', icon: 'email', href: `mailto:${email}`, label: email},
        {key: 'phone', icon: 'phone', href: `tel:${profile.contact.phone}`, label: profile.contact.phone},
        {key: 'linkedin', icon: 'linkedin', href: `https://${profile.contact.linkedin}`, label: 'LinkedIn'},
        // { key: 'github',   icon: 'github',   href: `https://${profile.contact.github}`,         label: profile.contact.github.replace('github.com/', '') },
        {key: 'location', icon: 'pin', href: null, label: profile.contact.location},
    ];

    const contactBlock = document.getElementById('contact-block');
    contactMap.forEach(({key, icon, href, label}) => {
        if (!profile.contact[key]) return;
        const el = href
            ? `<a href="${href}" class="contact__item" target="_blank" rel="noopener">${icons[icon]}${label}</a>`
            : `<span class="contact__item">${icons[icon]}${label}</span>`;
        contactBlock.insertAdjacentHTML('beforeend', el);
    });

    // Experience
    const expList = document.getElementById('experience-list');
    experience.forEach(job => {
        expList.insertAdjacentHTML('beforeend', `
      <div class="experience-item">
        <div class="experience-item__header">
          <span class="experience-item__title">${job.title}</span>
          <span class="experience-item__dates">${job.dates}</span>
        </div>
        <div class="experience-item__company">${job.company}</div>
        <ul class="experience-item__bullets">
          ${job.bullets.map(b => `<li>${b}</li>`).join('')}
        </ul>
      </div>
    `);
    });

    // Portfolio
    const portfolioGrid = document.getElementById('portfolio-grid');
    portfolio.forEach(item => {
        portfolioGrid.insertAdjacentHTML('beforeend', `
      <a href="${item.url}" class="portfolio-item" target="_blank" rel="noopener">
        <div class="portfolio-item__header">
          <span class="portfolio-item__name">${item.name}</span>
          <span class="portfolio-item__tech">${item.tech}</span>
          <svg class="portfolio-item__ext" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        </div>
        <p class="portfolio-item__description">${item.description}</p>
        <span class="portfolio-item__url">${item.url.replace('https://', '')}</span>
      </a>
    `);
    });

    // Skills
    const skillsGrid = document.getElementById('skills-grid');
    Object.entries(skills).forEach(([group, tags]) => {
        skillsGrid.insertAdjacentHTML('beforeend', `
      <div class="skills-group">
        <div class="skills-group__label">${group}</div>
        <div class="skills-group__tags">
          ${tags.map(t => `<span class="skill-tag">${t}</span>`).join('')}
        </div>
      </div>
    `);
    });

    // Education
    const eduList = document.getElementById('education-list');
    education.forEach(edu => {
        eduList.insertAdjacentHTML('beforeend', `
      <div class="education-item">
        <div class="education-item__qualification">${edu.qualification}</div>
        <div class="education-item__institution">${edu.institution}</div>
        <div class="education-item__dates">${edu.dates}</div>
      </div>
    `);
    });
}

function splitNameIntoChars() {
    const el = document.getElementById('profile-name');
    if (!el) return;
    el.innerHTML = el.textContent.split('').map(ch =>
        ch === ' ' ? '<span style="display:inline-block;width:0.35em"> </span>'
                   : `<span class="char" style="display:inline-block">${ch}</span>`
    ).join('');
}

function animate() {
    const isMobile = window.innerWidth <= 768;
    const tl = gsap.timeline({defaults: {ease: 'power3.out'}});

    gsap.set('.main', {autoAlpha: 0, scale: 0.97});

    if (!isMobile) {
        splitNameIntoChars();

        gsap.set('.sidebar', {clipPath: 'inset(0 100% 0 0)'});
        gsap.set('.profile__name .char', {autoAlpha: 0, y: 24, rotateX: -90});
        gsap.set('.profile__title', {autoAlpha: 0, x: -10});
        gsap.set('.sidebar__nav a', {autoAlpha: 0, clipPath: 'inset(0 100% 0 0)'});
        gsap.set('.contact__item', {autoAlpha: 0, y: 12});
        gsap.set('.sidebar__footer', {autoAlpha: 0, y: 8});

        tl
            .to('.sidebar', {clipPath: 'inset(0 0% 0 0)', duration: 0.75, ease: 'power4.inOut'})
            .to('.profile__name .char', {
                autoAlpha: 1, y: 0, rotateX: 0,
                duration: 0.55, stagger: 0.028, ease: 'back.out(2)',
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

    // Section title clip-path wipe on scroll
    document.querySelectorAll('.section').forEach(section => {
        const title = section.querySelector('.section__title');
        if (!title) return;
        gsap.from(title, {
            scrollTrigger: {trigger: section, start: 'top 82%'},
            clipPath: 'inset(0 100% 0 0)',
            duration: 0.7, ease: 'power3.out',
        });
    });

    // Experience — slide in from right with overshoot
    document.querySelectorAll('.experience-item').forEach((item, i) => {
        gsap.from(item, {
            scrollTrigger: {trigger: item, start: 'top 88%'},
            x: 30, autoAlpha: 0,
            duration: 0.6, ease: 'back.out(1.3)', delay: i * 0.04,
        });
    });

    // Portfolio — stagger with slight clockwise rotation
    document.querySelectorAll('.portfolio-item').forEach((item, i) => {
        gsap.from(item, {
            scrollTrigger: {trigger: item, start: 'top 90%'},
            y: 28, autoAlpha: 0, rotation: 1.5,
            duration: 0.55, ease: 'power3.out', delay: i * 0.04,
        });
    });

    // Skill tags — scale + rotate in
    document.querySelectorAll('.skills-group').forEach(group => {
        gsap.from(group.querySelectorAll('.skill-tag'), {
            scrollTrigger: {trigger: group, start: 'top 88%'},
            scale: 0.75, autoAlpha: 0, rotation: -4,
            duration: 0.4, ease: 'back.out(2)', stagger: 0.04,
        });
    });

    // Education — fade up with slight rotation
    document.querySelectorAll('.education-item').forEach((item, i) => {
        gsap.from(item, {
            scrollTrigger: {trigger: item, start: 'top 88%'},
            y: 20, autoAlpha: 0, rotation: 0.8,
            duration: 0.5, ease: 'power3.out', delay: i * 0.06,
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
