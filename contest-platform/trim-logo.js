const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Trim the logo (remove transparent padding)
sharp('./frontend/public/images/jamcontest_logo_white_for_dark.png')
  .trim()
  .toBuffer((err, data, info) => {
    if (err) {
      console.error('Error trimming:', err);
      process.exit(1);
    }
    
    console.log('✓ Logo trimmed. Original size:', info.width, 'x', info.height);
    
    // Convert to base64
    const base64 = data.toString('base64');
    
    // Create the TypeScript constant file
    const code = `export const LOGO_BASE64 = "data:image/png;base64,${base64}";\n`;
    
    fs.writeFileSync('./backend/src/modules/mail/logo.constant.ts', code);
    
    console.log('✓ Base64 logo created, size:', code.length, 'bytes');
    console.log('✓ Logo constant updated successfully');
  });
