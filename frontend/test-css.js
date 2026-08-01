const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist', 'frontend', 'browser');
if (!fs.existsSync(distDir)) {
    const fallbackDir = path.join(__dirname, 'dist', 'frontend');
    if (fs.existsSync(fallbackDir)) {
        distDir = fallbackDir;
    } else {
        console.error('Dist directory not found');
        process.exit(1);
    }
}

// Find main js bundle
const files = fs.readdirSync(distDir);
const stylesFile = files.find(f => f.startsWith('styles') && f.endsWith('.css'));
if (stylesFile) {
    const stylesPath = path.join(distDir, stylesFile);
    console.log('\n=== Global Styles ===');
    const stylesCss = fs.readFileSync(stylesPath, 'utf8');
    if (stylesCss.includes('--ch-color-primary')) {
        console.log('Variables found in global styles.css');
    } else {
        console.log('Variables NOT found in global styles.css');
    }
} else {
    console.log('styles file not found in build');
}

console.log('\n=== Component Styles ===');
// Angular 17/22 bundles component styles into JS if they are standalone/emulated.
const mainFile = files.find(f => f.startsWith('main') && f.endsWith('.js'));
if (mainFile) {
    const mainJs = fs.readFileSync(path.join(distDir, mainFile), 'utf8');

    const regex = /:root\[_ngcontent[^]*?\{.*?--ch-color-primary/s;
    if (regex.test(mainJs)) {
        console.log('EVIDENCE FOUND: :root was rewritten by ViewEncapsulation!');
        const match = mainJs.match(/(:root\[_ngcontent-[^\]]+\]\s*\{[^}]*--ch-color-primary[^}]*\})/);
        if (match) {
            console.log('Compiled Rule Example:');
            console.log(match[1].substring(0, 150) + '...');
        }
    } else {
        // try non-whitespace match
        const regex2 = /:root\[_ngcontent/s;
        if (regex2.test(mainJs)) {
            console.log('EVIDENCE FOUND: :root was rewritten (basic check matched).');
        } else {
            console.log('No ViewEncapsulation rewrite of :root found in main JS.');
        }
    }
} else {
    console.log('main file not found in build');
}
