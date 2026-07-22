const fs = require('fs');
const path = require('path');
const lucide = require('lucide');

const filePath = path.join(__dirname, 'src', 'app', 'components', 'goals', 'goals.html');
let content = fs.readFileSync(filePath, 'utf8');

const regex = /<div\s+\[innerHTML\]="getLucideSvg\('([^']+)'(?:,\s*(\d+))?\)"(.*?)><\/div>/g;
content = content.replace(regex, (match, iconName, size, rest) => {
  size = size || 24;
  const camelName = iconName.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
  const iconNode = lucide.icons[camelName];
  if (!iconNode) return match;
  const childNodes = iconNode.map(child => {
    const tag = child[0];
    const attrs = child[1] ? Object.entries(child[1]).map(([k, v]) => `${k}="${v}"`).join(' ') : '';
    return `<${tag} ${attrs}></${tag}>`;
  }).join('');
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"${rest}>${childNodes}</svg>`;
});

const regexClass = /<div\s+class="([^"]+)"\s+\[innerHTML\]="getLucideSvg\('([^']+)'(?:,\s*(\d+))?\)"(.*?)><\/div>/g;
content = content.replace(regexClass, (match, className, iconName, size, rest) => {
  size = size || 24;
  const camelName = iconName.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
  const iconNode = lucide.icons[camelName];
  if (!iconNode) return match;
  const childNodes = iconNode.map(child => {
    const tag = child[0];
    const attrs = child[1] ? Object.entries(child[1]).map(([k, v]) => `${k}="${v}"`).join(' ') : '';
    return `<${tag} ${attrs}></${tag}>`;
  }).join('');
  return `<svg class="${className}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"${rest}>${childNodes}</svg>`;
});

const regexIconClass = /<div\s+\[innerHTML\]="getLucideSvg\('([^']+)'(?:,\s*(\d+))?\)"\s+class="([^"]+)"(.*?)><\/div>/g;
content = content.replace(regexIconClass, (match, iconName, size, className, rest) => {
  size = size || 24;
  const camelName = iconName.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
  const iconNode = lucide.icons[camelName];
  if (!iconNode) return match;
  const childNodes = iconNode.map(child => {
    const tag = child[0];
    const attrs = child[1] ? Object.entries(child[1]).map(([k, v]) => `${k}="${v}"`).join(' ') : '';
    return `<${tag} ${attrs}></${tag}>`;
  }).join('');
  return `<svg class="${className}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"${rest}>${childNodes}</svg>`;
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('Icons replaced in goals.html');
