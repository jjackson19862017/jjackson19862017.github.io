// Pre-renders cv.json into index.html between <!--b:id--> markers so crawlers/ATS see real content.
// Run after editing cv.json:  node build.mjs
import {readFileSync, writeFileSync} from 'node:fs';

const icons = {
    email: `<svg viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/></svg>`,
    phone: `<svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.13 6.13l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
    github: `<svg viewBox="0 0 24 24"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>`,
    linkedin: `<svg viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>`,
    pin: `<svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
};

const {profile, experience, portfolio, skills, education} = JSON.parse(readFileSync('cv.json', 'utf8'));
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ext = '<svg class="portfolio-item__ext" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>';

const c = profile.contact;
const regions = {
    'profile-name': esc(profile.name),
    'profile-title': esc(profile.title),
    'summary-text': esc(profile.summary),
    // email is stored reversed; main.js decodes it into the link so it is not in the served HTML
    'contact-block': [
        c.email && `<a href="#" class="contact__item" target="_blank" rel="noopener" aria-label="Email" data-r="${esc(c.email)}">${icons.email}</a>`,
        c.phone && `<a href="tel:${esc(c.phone)}" class="contact__item" target="_blank" rel="noopener">${icons.phone}${esc(c.phone)}</a>`,
        c.linkedin && `<a href="https://${esc(c.linkedin)}" class="contact__item" target="_blank" rel="noopener">${icons.linkedin}LinkedIn</a>`,
        c.location && `<span class="contact__item">${icons.pin}${esc(c.location)}</span>`,
    ].filter(Boolean).join('\n'),
    'experience-list': experience.map(j => `
<div class="experience-item">
  <div class="experience-item__header">
    <span class="experience-item__title">${esc(j.title)}</span>
    <span class="experience-item__dates">${esc(j.dates)}</span>
  </div>
  <div class="experience-item__company">${esc(j.company)}</div>
  <ul class="experience-item__bullets">
    ${j.bullets.map(b => `<li>${esc(b)}</li>`).join('\n    ')}
  </ul>
</div>`).join('\n'),
    'portfolio-grid': portfolio.map(p => `
<a href="${esc(p.url)}" class="portfolio-item" target="_blank" rel="noopener">
  <div class="portfolio-item__header">
    <span class="portfolio-item__name">${esc(p.name)}</span>
    <span class="portfolio-item__tech">${esc(p.tech)}</span>
    ${ext}
  </div>
  <p class="portfolio-item__description">${esc(p.description)}</p>
  <span class="portfolio-item__url">${esc(p.url.replace('https://', ''))}</span>
</a>`).join('\n'),
    'skills-grid': Object.entries(skills).map(([group, tags]) => `
<div class="skills-group">
  <div class="skills-group__label">${esc(group)}</div>
  <div class="skills-group__tags">
    ${tags.map(t => `<span class="skill-tag">${esc(t)}</span>`).join('\n    ')}
  </div>
</div>`).join('\n'),
    'education-list': education.map(e => `
<div class="education-item">
  <div class="education-item__qualification">${esc(e.qualification)}</div>
  <div class="education-item__institution">${esc(e.institution)}</div>
  <div class="education-item__dates">${esc(e.dates)}</div>
</div>`).join('\n'),
};

let html = readFileSync('index.html', 'utf8');
for (const [id, inner] of Object.entries(regions)) {
    const re = new RegExp(`(<!--b:${id}-->)[\\s\\S]*?(<!--/b:${id}-->)`);
    if (!re.test(html)) throw new Error(`marker b:${id} missing in index.html`);
    html = html.replace(re, (_, a, b) => a + inner + b);
}
writeFileSync('index.html', html);
console.log('index.html rendered from cv.json');
