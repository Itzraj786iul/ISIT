import fs from 'fs';

const path = 'src/app/globals.css';
let css = fs.readFileSync(path, 'utf8');

if (!css.includes('html.dark body.isit-theme')) {
  css = css.replace(
    `.isit-theme {
  color: #e0f2fe;
  background:
    radial-gradient(1100px 700px at 20% 0%, rgba(8, 47, 73, 0.55), transparent 60%),
    radial-gradient(900px 580px at 80% 8%, rgba(14, 116, 144, 0.35), transparent 58%),
    radial-gradient(700px 420px at 50% 70%, rgba(15, 23, 42, 0.8), transparent 72%),
    #030712;
}`,
    `html {
  color-scheme: light;
}

html.dark {
  color-scheme: dark;
}

body.isit-theme {
  color: #0f172a;
  background: #f8fafc;
}

html.dark body.isit-theme {
  color: #e0f2fe;
  background:
    radial-gradient(1100px 700px at 20% 0%, rgba(8, 47, 73, 0.55), transparent 60%),
    radial-gradient(900px 580px at 80% 8%, rgba(14, 116, 144, 0.35), transparent 58%),
    radial-gradient(700px 420px at 50% 70%, rgba(15, 23, 42, 0.8), transparent 72%),
    #030712;
}`
  );

  css = css.replace(/^\.isit-theme /gm, 'html.dark .isit-theme ');
  css = css.replace(/^\.isit-theme$/gm, 'html.dark .isit-theme');
  css = css.replace(/html\.dark html\.dark /g, 'html.dark ');
}

if (!css.includes('html.dark .isit-cosmic-bg')) {
  css = css.replace(
    `.isit-cosmic-bg {
  background-color: #05070a;
  background-image:
    linear-gradient(rgba(148, 163, 184, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(148, 163, 184, 0.06) 1px, transparent 1px),
    radial-gradient(1100px 700px at 20% 0%, rgba(8, 47, 73, 0.45), transparent 60%),
    radial-gradient(900px 580px at 80% 8%, rgba(99, 102, 241, 0.2), transparent 58%);
  background-size: 48px 48px, 48px 48px, auto, auto;
  color: rgb(226 232 240);
  position: relative;
  overflow: hidden;
}`,
    `.isit-cosmic-bg {
  background-color: #f1f5f9;
  background-image:
    linear-gradient(rgba(148, 163, 184, 0.14) 1px, transparent 1px),
    linear-gradient(90deg, rgba(148, 163, 184, 0.14) 1px, transparent 1px);
  background-size: 48px 48px;
  color: rgb(15 23 42);
  position: relative;
  overflow: hidden;
}

html.dark .isit-cosmic-bg {
  background-color: #05070a;
  background-image:
    linear-gradient(rgba(148, 163, 184, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(148, 163, 184, 0.06) 1px, transparent 1px),
    radial-gradient(1100px 700px at 20% 0%, rgba(8, 47, 73, 0.45), transparent 60%),
    radial-gradient(900px 580px at 80% 8%, rgba(99, 102, 241, 0.2), transparent 58%);
  background-size: 48px 48px, 48px 48px, auto, auto;
  color: rgb(226 232 240);
}`
  );

  css = css.replace(
    `.isit-cosmic-bg::before {`,
    `.isit-cosmic-bg::before {
  display: none;
}

html.dark .isit-cosmic-bg::before {
  display: block;`
  );
}

if (!css.includes('html.dark .isit-landing-grid')) {
  css = css.replace(
    `.isit-landing-grid {
  background-color: #05070a;
  background-image:
    linear-gradient(rgba(148, 163, 184, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(148, 163, 184, 0.06) 1px, transparent 1px);
  background-size: 48px 48px;
}`,
    `.isit-landing-grid {
  background-color: #f8fafc;
  background-image:
    linear-gradient(rgba(148, 163, 184, 0.12) 1px, transparent 1px),
    linear-gradient(90deg, rgba(148, 163, 184, 0.12) 1px, transparent 1px);
  background-size: 48px 48px;
}

html.dark .isit-landing-grid {
  background-color: #05070a;
  background-image:
    linear-gradient(rgba(148, 163, 184, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(148, 163, 184, 0.06) 1px, transparent 1px);
  background-size: 48px 48px;
}`
  );
}

fs.writeFileSync(path, css);
console.log('globals.css theme patch applied');
