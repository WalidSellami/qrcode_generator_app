/* ==========================================================================
   QR Code Generator — Clean Logic & High-Quality Exporters (PNG & PDF)
   ========================================================================== */

// --------------------------------------------------------------------------
// Toast Notification
// --------------------------------------------------------------------------
function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    if (!toast) return;

    const icon = isError
        ? '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>'
        : '<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';

    toast.className = `toast-msg ${isError ? 'toast-msg--error' : ''}`;
    toast.innerHTML = `${icon}<span>${message}</span>`;

    requestAnimationFrame(() => {
        toast.classList.add('is-active');
    });

    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
        toast.classList.remove('is-active');
    }, 2500);
}

// --------------------------------------------------------------------------
// --------------------------------------------------------------------------
// Code Detection Engine (Blocks programming code; accepts plain text, links, numbers)
// --------------------------------------------------------------------------
function containsCode(text) {
    if (!text || typeof text !== 'string') return false;
    const str = text.trim();

    // 1. JavaScript URL protocol (e.g. javascript:...)
    if (/^javascript:/i.test(str)) {
        return true;
    }

    // 2. HTML / XML / JSX / PHP Tags (e.g. <script>, <div>, <img />, <?php, <!--)
    if (/<[a-z!/?][\s\S]*>/i.test(str)) {
        return true;
    }

    // 3. JavaScript / TypeScript / Node.js Signatures
    const jsPatterns = [
        /\bfunction\s*[\w$]*\s*\(/i,
        /(=>|\bfunction\b)\s*\{/,
        /\b(var|let|const)\s+[\w$]+\s*=/i,
        /\b(console\.(log|warn|error|info|debug)|alert|prompt|confirm|eval)\s*\(/i,
        /\b(import\s+[\w\s{},*]+\s+from\s+['"]|export\s+(default|const|let|var|function|class)|require\s*\(['"])/i,
        /\b(if|for|while|switch)\s*\(.*?\)\s*\{/i,
        /\bclass\s+\w+(\s+extends\s+\w+)?\s*\{/i,
        /\breturn\s+[\w$"'`{\[(\-!]/i,
        /\bdocument\.(getElementById|querySelector|createElement|body|cookie)\b/i,
        /\bwindow\.(location|onload|addEventListener|localStorage)\b/i
    ];
    for (const pattern of jsPatterns) {
        if (pattern.test(str)) return true;
    }

    // 4. Python Signatures
    const pyPatterns = [
        /\bdef\s+\w+\s*\(.*?\)\s*:/,
        /\bclass\s+\w+(\s*\(.*?\))?\s*:/,
        /^\s*from\s+[\w.]+\s+import\s+/m,
        /^\s*import\s+[\w.]+(\s+as\s+\w+)?/m,
        /\bprint\s*\(.*?\)/,
        /\b(if|elif|else|for|while|try|except|finally)\s+.*:/
    ];
    for (const pattern of pyPatterns) {
        if (pattern.test(str)) return true;
    }

    // 5. C / C++ / Java / C# Signatures
    const compiledLangPatterns = [
        /#include\s*[<"][^>"]+[>"]/,
        /\b(public|private|protected)\s+(static\s+)?(void|int|float|double|String|boolean|class)\s+\w+/i,
        /\bSystem\.(out|err)\.(print|println)\s*\(/,
        /\bint\s+main\s*\([^)]*\)\s*\{/i,
        /\busing\s+namespace\s+\w+;/,
        /\bnamespace\s+[\w.]+\s*\{/
    ];
    for (const pattern of compiledLangPatterns) {
        if (pattern.test(str)) return true;
    }

    // 6. SQL Query Statements
    const sqlPattern = /\b(SELECT\s+[\s\S]*?\s+FROM|INSERT\s+INTO\s+[\s\S]*?\s+VALUES|UPDATE\s+\w+\s+SET|DELETE\s+FROM\s+\w+|DROP\s+TABLE|CREATE\s+TABLE|ALTER\s+TABLE)\b/i;
    if (sqlPattern.test(str)) {
        return true;
    }

    // 7. CSS Rules Blocks
    const cssPattern = /[.#\w-]+\s*\{\s*[\w-]+:\s*[^;]+;/;
    if (cssPattern.test(str)) {
        return true;
    }

    // 8. Shell / Terminal Commands
    const shellPatterns = [
        /^#!\/(bin|usr)\//m,
        /\b(sudo\s+|chmod\s+[+0-7]+|rm\s+-[rf]{1,2}|npm\s+(install|run|start|i)|pip\s+install|git\s+(commit|push|pull|clone|checkout))\b/i
    ];
    for (const pattern of shellPatterns) {
        if (pattern.test(str)) return true;
    }

    return false;
}

// --------------------------------------------------------------------------
// Page 1: Input & Generation Flow
// --------------------------------------------------------------------------
function initInputPage() {
    const form = document.getElementById('qrForm');
    const textInput = document.getElementById('textInput');
    const charCounter = document.getElementById('charCount');

    if (!form || !textInput) return;

    // Character counter
    textInput.addEventListener('input', () => {
        if (charCounter) {
            charCounter.textContent = textInput.value.length;
        }
    });

    // Form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const value = textInput.value.trim();

        if (!value) {
            showToast('Please enter text or a link first', true);
            textInput.focus();
            return;
        }

        // Prevent generating QR code if user typed programming code
        if (containsCode(value)) {
            showToast('Code is not allowed. Only plain text, links, and numbers are accepted.', true);
            textInput.classList.add('input-error-shake');
            setTimeout(() => textInput.classList.remove('input-error-shake'), 500);
            textInput.focus();
            return;
        }

        // Save input and navigate
        localStorage.setItem('qr_text', value);
        window.location.href = 'result.html';
    });

    // Allow Enter key (without Shift) to submit
    textInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            form.requestSubmit();
        }
    });
}

// --------------------------------------------------------------------------
// Page 2: QR Display & High-Quality Downloads
// --------------------------------------------------------------------------
function initResultPage() {
    const qrContainer = document.getElementById('qrcode');
    const payloadText = document.getElementById('payloadText');
    const copyBtn = document.getElementById('copyBtn');
    const downloadPng = document.getElementById('downloadPng');
    const downloadPdf = document.getElementById('downloadPdf');

    if (!qrContainer) return;

    // Get stored data
    const text = localStorage.getItem('qr_text');
    if (!text || containsCode(text)) {
        window.location.href = 'index.html';
        return;
    }

    // Display payload text
    if (payloadText) {
        payloadText.textContent = text;
        payloadText.title = text;
    }

    // ── High-Version Dense Matrix QR Code ──
    // Force a higher QR version for a denser grid with more modules.
    // Version 10 = 57×57 modules, Version 15 = 77×77, Version 20 = 97×97, etc.
    // We pick at least version 10 so even short URLs produce a visually dense matrix.
    function getMinVersion(text, targetMinVersion) {
        // The library auto-selects the minimum version needed for the data.
        // We enforce at least targetMinVersion for a denser, more professional look.
        // Version capacities with H error correction (alphanumeric/byte):
        //  v1=17, v5=106, v10=271, v15=520, v20=858, v25=1273, v30=1732, v40=2953
        const minRequired = targetMinVersion || 10;
        // If text is very long, the library will auto-pick a higher version anyway.
        return minRequired;
    }

    const qrVersion = getMinVersion(text, 10);

    qrContainer.innerHTML = '';
    new QRCode(qrContainer, {
        text: text,
        width: 420,
        height: 420,
        colorDark: '#0a0d14',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H, // Highest error recovery (30%)
        typeNumber: qrVersion               // Force high version for dense matrix
    });

    // Re-render QR on-screen with large modules and tight gaps
    setTimeout(() => {
        const srcCanvas = qrContainer.querySelector('canvas');
        if (!srcCanvas || srcCanvas.width === 0) return;

        const srcCtx = srcCanvas.getContext('2d');
        const srcSize = srcCanvas.width;
        const imageData = srcCtx.getImageData(0, 0, srcSize, srcSize);
        const pixels = imageData.data;
        const threshold = 128;

        // Detect module count from source canvas
        let moduleCount = 0;
        let inDark = false;
        for (let x = 0; x < srcSize; x++) {
            const idx = x * 4;
            const isDark = pixels[idx] < threshold;
            if (isDark && !inDark) { moduleCount++; inDark = true; }
            else if (!isDark && inDark) { inDark = false; }
        }
        let moduleCountV = 0;
        inDark = false;
        for (let y = 0; y < srcSize; y++) {
            const idx = (y * srcSize) * 4;
            const isDark = pixels[idx] < threshold;
            if (isDark && !inDark) { moduleCountV++; inDark = true; }
            else if (!isDark && inDark) { inDark = false; }
        }
        moduleCount = Math.max(moduleCount, moduleCountV);

        if (moduleCount > 10) {
            // Build a sharp display canvas with large blocks + tiny gaps
            const displaySize = 600; // high-res for crisp display
            const quietZone = 2;
            const totalModules = moduleCount + (quietZone * 2);
            const cellSize = displaySize / totalModules;
            const gap = Math.max(0.15, cellSize * 0.01);
            const modulePixelSize = srcSize / moduleCount;

            const displayCanvas = document.createElement('canvas');
            displayCanvas.width = displaySize;
            displayCanvas.height = displaySize;
            const ctx = displayCanvas.getContext('2d');

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, displaySize, displaySize);
            ctx.imageSmoothingEnabled = false;

            for (let row = 0; row < moduleCount; row++) {
                for (let col = 0; col < moduleCount; col++) {
                    const sx = Math.floor((col + 0.5) * modulePixelSize);
                    const sy = Math.floor((row + 0.5) * modulePixelSize);
                    const sIdx = (sy * srcSize + sx) * 4;
                    const isDark = pixels[sIdx] < threshold;

                    if (isDark) {
                        const x = (col + quietZone) * cellSize + (gap / 2);
                        const y = (row + quietZone) * cellSize + (gap / 2);
                        const size = cellSize - gap;
                        ctx.fillStyle = '#0a0d14';
                        ctx.fillRect(x, y, size, size);
                    }
                }
            }

            // Replace library output with our custom render
            qrContainer.innerHTML = '';
            const displayImg = new Image();
            displayImg.src = displayCanvas.toDataURL('image/png');
            displayImg.style.width = '100%';
            displayImg.style.height = '100%';
            displayImg.style.aspectRatio = '1 / 1';
            displayImg.style.objectFit = 'contain';
            displayImg.style.display = 'block';
            displayImg.style.imageRendering = 'crisp-edges';
            qrContainer.appendChild(displayImg);

            // Store the source canvas data for downloads
            qrContainer._srcCanvas = srcCanvas;
        } else {
            // Fallback: just show the library output
            const img = qrContainer.querySelector('img');
            if (srcCanvas && img) {
                srcCanvas.style.display = 'none';
                img.style.display = 'block';
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.aspectRatio = '1 / 1';
                img.style.objectFit = 'contain';
            }
        }
    }, 150);

    // Copy text to clipboard with micro-animation
    if (copyBtn) {
        const originalHTML = copyBtn.innerHTML;
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(text).then(() => {
                copyBtn.classList.add('is-copied');
                copyBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> Copied!';
                showToast('Copied to clipboard!');
                setTimeout(() => {
                    copyBtn.classList.remove('is-copied');
                    copyBtn.innerHTML = originalHTML;
                }, 2000);
            }).catch(() => {
                showToast('Failed to copy', true);
            });
        });
    }

    // Helper: Build crisp high-resolution export canvas
    // Renders at 2048×2048 by default for print-quality output (300+ DPI at 17cm)
    // Uses large module cells with tight gaps for the "large grids, small spaces" look
    function getHighResCanvas(targetResolution = 2048, quietZoneModules = 2) {
        const canvasEl = qrContainer.querySelector('canvas') || qrContainer._srcCanvas;
        const imgEl = qrContainer.querySelector('img');

        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = targetResolution;
        exportCanvas.height = targetResolution;
        const ctx = exportCanvas.getContext('2d');

        // Crisp white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, targetResolution, targetResolution);

        // Disable image smoothing for pixel-perfect rendering
        ctx.imageSmoothingEnabled = false;

        // Try to extract raw QR module data from the source canvas for cell-by-cell rendering
        if (canvasEl && canvasEl.width > 0) {
            const srcCtx = canvasEl.getContext('2d');
            const srcSize = canvasEl.width;
            const imageData = srcCtx.getImageData(0, 0, srcSize, srcSize);
            const pixels = imageData.data;

            // Detect module count by scanning the top row for dark/light transitions
            // The qrcode.js library renders each module as equal-width blocks
            let moduleCount = 0;
            let inDark = false;
            const threshold = 128;
            for (let x = 0; x < srcSize; x++) {
                const idx = x * 4;
                const isDark = pixels[idx] < threshold;
                if (isDark && !inDark) {
                    moduleCount++;
                    inDark = true;
                } else if (!isDark && inDark) {
                    inDark = false;
                }
            }
            // Scan first column too for verification
            let moduleCountV = 0;
            inDark = false;
            for (let y = 0; y < srcSize; y++) {
                const idx = (y * srcSize) * 4;
                const isDark = pixels[idx] < threshold;
                if (isDark && !inDark) {
                    moduleCountV++;
                    inDark = true;
                } else if (!isDark && inDark) {
                    inDark = false;
                }
            }
            moduleCount = Math.max(moduleCount, moduleCountV);

            if (moduleCount > 10) {
                // Successfully detected modules — render cell by cell
                const totalModules = moduleCount + (quietZoneModules * 2);
                const cellSize = targetResolution / totalModules;
                const gap = Math.max(0.15, cellSize * 0.01); // Ultra-tight gap (1% of cell or 0.25px min)
                const modulePixelSize = srcSize / moduleCount;

                // Draw each module as a large solid block with tight gaps
                for (let row = 0; row < moduleCount; row++) {
                    for (let col = 0; col < moduleCount; col++) {
                        // Sample the center of each source module
                        const sx = Math.floor((col + 0.5) * modulePixelSize);
                        const sy = Math.floor((row + 0.5) * modulePixelSize);
                        const sIdx = (sy * srcSize + sx) * 4;
                        const isDark = pixels[sIdx] < threshold;

                        if (isDark) {
                            const x = (col + quietZoneModules) * cellSize + (gap / 2);
                            const y = (row + quietZoneModules) * cellSize + (gap / 2);
                            const size = cellSize - gap;
                            ctx.fillStyle = '#0a0d14';
                            ctx.fillRect(x, y, size, size);
                        }
                    }
                }
            } else {
                // Fallback: simple stretch render
                const padding = targetResolution * 0.04;
                const qrSize = targetResolution - (padding * 2);
                ctx.drawImage(canvasEl, padding, padding, qrSize, qrSize);
            }
        } else if (imgEl && imgEl.complete) {
            // Fallback for img element: draw stretched with small padding
            const padding = targetResolution * 0.04;
            const qrSize = targetResolution - (padding * 2);
            ctx.drawImage(imgEl, padding, padding, qrSize, qrSize);
        }

        return exportCanvas;
    }

    // 1. Download Ultra High-Quality PNG (2048×2048 for print)
    if (downloadPng) {
        downloadPng.addEventListener('click', () => {
            try {
                const canvas = getHighResCanvas(2048, 2);
                const link = document.createElement('a');
                link.download = `qrcode-hd-${Date.now()}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
                showToast('Ultra high-resolution PNG downloaded');
            } catch (err) {
                showToast('Could not download PNG', true);
            }
        });
    }

    // 2. Download High-Quality PDF (A4 Document)
    if (downloadPdf) {
        downloadPdf.addEventListener('click', () => {
            try {
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4'
                });

                const pageW = pdf.internal.pageSize.getWidth();
                const pageH = pdf.internal.pageSize.getHeight();

                // Title
                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(22);
                pdf.setTextColor(15, 23, 42);
                pdf.text('QR Code', pageW / 2, 40, { align: 'center' });

                // Render centered ultra high-res QR image for print
                const canvas = getHighResCanvas(2048, 2);
                const imgData = canvas.toDataURL('image/png');
                const qrSizeMM = 120; // 120mm square for better print scanning
                const x = (pageW - qrSizeMM) / 2;
                const y = 55;

                // Subtle border
                pdf.setDrawColor(226, 232, 240);
                pdf.setLineWidth(0.4);
                pdf.roundedRect(x - 4, y - 4, qrSizeMM + 8, qrSizeMM + 8, 2, 2);
                pdf.addImage(imgData, 'PNG', x, y, qrSizeMM, qrSizeMM);

                // Content label
                const contentY = y + qrSizeMM + 20;
                pdf.setFont('helvetica', 'normal');
                pdf.setFontSize(10);
                pdf.setTextColor(100, 116, 139);
                pdf.text('ENCODED CONTENT:', pageW / 2, contentY, { align: 'center' });

                // Content text
                pdf.setFont('courier', 'normal');
                pdf.setFontSize(10);
                pdf.setTextColor(30, 41, 59);
                const lines = pdf.splitTextToSize(text, pageW - 40);
                pdf.text(lines, pageW / 2, contentY + 8, { align: 'center' });

                pdf.save(`qrcode-${Date.now()}.pdf`);
                showToast('High-quality PDF downloaded');
            } catch (err) {
                console.error(err);
                showToast('Could not generate PDF', true);
            }
        });
    }
}

// --------------------------------------------------------------------------
// Initialization
// --------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('qrForm')) {
        initInputPage();
    }
    if (document.getElementById('qrcode')) {
        initResultPage();
    }
});
