const fs = require('fs');

// Read the base64 content (without the wrapper)
const base64Content = fs.readFileSync('./logo_base64_complete.txt', 'utf8').trim();

// Create the proper TypeScript constant file on a single line
const code = `export const LOGO_BASE64 = "data:image/png;base64,${base64Content}";\n`;

// Write the file
fs.writeFileSync('./backend/src/modules/mail/logo.constant.ts', code);

console.log('File created, size:', code.length, 'bytes');
console.log('First 100 chars:', code.substring(0, 100));
console.log('Last 50 chars:', code.substring(code.length - 50));

// Verify it has proper structure
const lines = code.split('\n').filter(l => l.trim());
console.log('Lines:', lines.length);
console.log('✓ Logo constant file created successfully');
