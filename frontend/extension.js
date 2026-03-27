const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, 'out');
const nextDir = path.join(outDir, '_next');
const newDir = path.join(outDir, 'next_assets');

console.log('🚀 Starting AttentionOS Extension Fixer...');

// 1. Rename _next folder to next_assets (Chrome blocks underscores)
if (fs.existsSync(nextDir)) {
    fs.renameSync(nextDir, newDir);
    console.log('✅ Renamed _next folder to next_assets');
}

// 2. Nuclear Option: Delete any other files starting with underscore (except our new assets)
if (fs.existsSync(outDir)) {
    const outFiles = fs.readdirSync(outDir);
    outFiles.forEach(file => {
        if (file.startsWith('_')) {
            const filePath = path.join(outDir, file);
            try {
                if (fs.statSync(filePath).isDirectory()) {
                    fs.rmSync(filePath, { recursive: true, force: true });
                } else {
                    fs.unlinkSync(filePath);
                }
                console.log(`🗑️ Removed Chrome-incompatible file: ${file}`);
            } catch (err) { }
        }
    });
}

// 3. Helper to find all relevant files
const walkSync = (dir, filelist = []) => {
    fs.readdirSync(dir).forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            filelist = walkSync(filePath, filelist);
        } else {
            if (filePath.endsWith('.html') || filePath.endsWith('.js') || filePath.endsWith('.css')) {
                filelist.push(filePath);
            }
        }
    });
    return filelist;
};

const files = walkSync(outDir);
let changedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    // A. Fix the internal Next.js path references
    if (content.includes('/_next/')) {
        content = content.replace(/\/_next\//g, '/next_assets/');
        changed = true;
    }

    // B. Extract inline scripts to bypass Chrome CSP
    // CRITICAL: We SKIP sandbox.html because it's allowed to have inline scripts
    if (file.endsWith('.html') && !file.includes('sandbox.html')) {
        let scriptCount = 0;
        const scriptRegex = /<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi;
        
        content = content.replace(scriptRegex, (match, scriptContent) => {
            if (!scriptContent.trim() || scriptContent.includes('window.parent.postMessage')) return match;
            
            const fileName = `inline-${path.basename(file, '.html')}-${scriptCount}.js`;
            const filePath = path.join(path.dirname(file), fileName);
            
            fs.writeFileSync(filePath, scriptContent, 'utf8');
            scriptCount++;
            
            return `<script src="./${fileName}"></script>`;
        });
        if (scriptCount > 0) changed = true;
    }

    if (changed) {
        fs.writeFileSync(file, content, 'utf8');
        changedCount++;
    }
});

console.log(`✅ Processed ${changedCount} files.`);
console.log('✨ SUCCESS! Run "Update" in chrome://extensions now.');