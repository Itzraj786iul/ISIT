import fs from 'fs';

const path = 'src/app/globals.css';
let css = fs.readFileSync(path, 'utf8');

// Remove legacy theme block (from old :root through cosmic ::before) — keep @layer components at top
const startMarker = ':root {\n  --background: #ffffff;';
const endMarker = '@keyframes session-question-in';

const startIdx = css.indexOf(startMarker);
const endIdx = css.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
  console.error('markers not found', startIdx, endIdx);
  process.exit(1);
}

const head = css.slice(0, startIdx);
const tail = css.slice(endIdx);

const bridge = `@import "../styles/isit-tokens.css";
@import "../styles/isit-dark-cosmic.css";

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: Arial, Helvetica, sans-serif;
}

`;

// Update @layer components - remove old isit-glass definitions (now in tokens)
let headFixed = head.replace(
  /  \.isit-glass \{[\s\S]*?  \}\n\n  \.isit-chip \{[\s\S]*?  \}\n\n  \.isit-btn-primary \{[\s\S]*?  \}\n\n  \.isit-btn-secondary \{[\s\S]*?  \}\n/,
  ''
);

// Remove legacy light hacks at end
let tailFixed = tail.replace(
  /\n\/\* Light mode: legacy cyan[\s\S]*$/,
  '\n'
);

const out = headFixed + bridge + tailFixed;
fs.writeFileSync(path, out);
console.log('globals.css rebuilt', out.length);
