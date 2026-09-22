/* ==========================================================================
   QR Code Generator — Clean Logic & High-Quality Exporters (PNG & PDF)
   ========================================================================== */

// --------------------------------------------------------------------------
// Mobile Browser Compatibility Patch (Android 10+ User-Agent fix for qrcodejs)
// --------------------------------------------------------------------------
if (typeof window !== 'undefined' && window.QRCode) {
    try {
        const _origMakeCode = window.QRCode.prototype.makeCode;
        window.QRCode.prototype.makeCode = function (text) {
            if (this._android === true) this._android = false;
            if (this._oDrawing && this._oDrawing._android === true) this._oDrawing._android = false;
            _origMakeCode.call(this, text);
            if (this._oDrawing && typeof this._oDrawing.makeImage === 'function') {
                try { this._oDrawing.makeImage(); } catch (e) { }
            }
        };
    } catch (e) {
        console.warn('QRCode patch note:', e);
    }
}

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

        // Save input in storage with cross-browser and private browsing fallback
        try {
            localStorage.setItem('qr_text', value);
        } catch (err) {
            console.warn('localStorage unavailable:', err);
        }
        try {
            sessionStorage.setItem('qr_text', value);
        } catch (err) { }

        // For maximum mobile compatibility (e.g. strict private/incognito browsing or in-app webviews),
        // also pass as URL query param if within safe URL length (<1500 chars)
        if (value.length < 1500) {
            window.location.href = 'result.html?data=' + encodeURIComponent(value);
        } else {
            window.location.href = 'result.html';
        }
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
    const downloadTransparentPng = document.getElementById('downloadTransparentPng');
    const downloadPdf = document.getElementById('downloadPdf');

    if (!qrContainer) return;

    // Retrieve stored payload text (URL query param -> localStorage -> sessionStorage)
    let text = null;
    try {
        const urlParams = new URLSearchParams(window.location.search);
        text = urlParams.get('data');
    } catch (e) { }

    if (!text) {
        try {
            text = localStorage.getItem('qr_text');
        } catch (e) { }
    }
    if (!text) {
        try {
            text = sessionStorage.getItem('qr_text');
        } catch (e) { }
    }

    if (!text || containsCode(text)) {
        window.location.href = 'index.html';
        return;
    }

    // Display payload text
    if (payloadText) {
        payloadText.textContent = text;
        payloadText.title = text;
    }

    // ── High-Reliability QR Code Renderer ──
    // Uses ISO/IEC 18004 specification with Reed-Solomon Level H error correction (30%).
    // Directly reads model module data to guarantee instant, synchronous rendering on
    // all mobile browsers (iOS Safari, Chrome for Android, Samsung Internet, WebViews).
    function renderQRCode() {
        qrContainer.innerHTML = '';

        const tempDiv = document.createElement('div');
        let qrObj = null;
        try {
            qrObj = new QRCode(tempDiv, {
                text: text,
                width: 512,
                height: 512,
                colorDark: '#000000',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.H
            });
        } catch (err) {
            console.error('QRCode generation error:', err);
            showToast('Failed to generate QR code', true);
            return;
        }

        const model = qrObj ? qrObj._oQRCode : null;

        if (model && typeof model.getModuleCount === 'function') {
            qrContainer._qrModel = model;
            const moduleCount = model.getModuleCount();

            // Zero quiet zone for edge-to-edge rendering
            const quietZone = 0;
            const totalModules = moduleCount + (quietZone * 2);

            const dpr = window.devicePixelRatio || 1;
            const baseSize = 800;
            const cellSize = (baseSize / totalModules);
            const canvasSize = baseSize * dpr;

            const displayCanvas = document.createElement('canvas');
            displayCanvas.width = canvasSize;
            displayCanvas.height = canvasSize;
            const ctx = displayCanvas.getContext('2d');

            ctx.scale(dpr, dpr);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, baseSize, baseSize);

            ctx.fillStyle = '#000000';
            for (let row = 0; row < moduleCount; row++) {
                for (let col = 0; col < moduleCount; col++) {
                    if (model.isDark(row, col)) {
                        const x = (col + quietZone) * cellSize;
                        const y = (row + quietZone) * cellSize;
                        ctx.fillRect(x, y, cellSize + 0.5, cellSize + 0.5);
                    }
                }
            }

            qrContainer._srcCanvas = displayCanvas;

            const displayImg = new Image();
            displayImg.alt = 'QR Code';
            displayImg.src = displayCanvas.toDataURL('image/png');
            displayImg.className = 'qr-code-img';
            displayImg.style.width = '100%';
            displayImg.style.height = '100%';
            displayImg.style.aspectRatio = '1 / 1';
            displayImg.style.objectFit = 'fill';
            displayImg.style.display = 'block';

            qrContainer.appendChild(displayImg);
        } else {
            const fallbackCanvas = tempDiv.querySelector('canvas');
            if (fallbackCanvas) {
                fallbackCanvas.style.width = '100%';
                fallbackCanvas.style.height = '100%';
                qrContainer.appendChild(fallbackCanvas);
                qrContainer._srcCanvas = fallbackCanvas;
            }
        }
    }

    // Render QR Code immediately
    renderQRCode();

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

    // Helper: Build crisp high-resolution export canvas (strictly 2048×2048 for print)
    function getHighResCanvas(targetResolution = 2048, quietZoneModules = 2, transparent = false) {
        const model = qrContainer._qrModel;
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = targetResolution;
        exportCanvas.height = targetResolution;
        const ctx = exportCanvas.getContext('2d');

        // Background: Crisp white or 100% transparent alpha channel
        if (!transparent) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, targetResolution, targetResolution);
        } else {
            ctx.clearRect(0, 0, targetResolution, targetResolution);
        }
        ctx.imageSmoothingEnabled = false;

        // Mathematical cell-by-cell rendering using the exact ISO matrix with integer pixel scaling
        if (model && typeof model.getModuleCount === 'function') {
            const moduleCount = model.getModuleCount();
            const totalModules = moduleCount + (quietZoneModules * 2);
            const scale = Math.max(1, Math.floor(targetResolution / totalModules));
            const qrPixelSize = totalModules * scale;
            const offset = Math.floor((targetResolution - qrPixelSize) / 2);

            ctx.fillStyle = '#000000';
            for (let row = 0; row < moduleCount; row++) {
                for (let col = 0; col < moduleCount; col++) {
                    if (model.isDark(row, col)) {
                        ctx.fillRect(
                            offset + (col + quietZoneModules) * scale,
                            offset + (row + quietZoneModules) * scale,
                            scale,
                            scale
                        );
                    }
                }
            }
            return exportCanvas;
        }

        // Secondary fallback if model is unavailable
        const canvasEl = qrContainer.querySelector('canvas') || qrContainer._srcCanvas;
        const imgEl = qrContainer.querySelector('img');
        if (canvasEl && canvasEl.width > 0) {
            const padding = Math.round(targetResolution * 0.04);
            const qrSize = targetResolution - (padding * 2);
            ctx.drawImage(canvasEl, padding, padding, qrSize, qrSize);
        } else if (imgEl && imgEl.complete) {
            const padding = Math.round(targetResolution * 0.04);
            const qrSize = targetResolution - (padding * 2);
            ctx.drawImage(imgEl, padding, padding, qrSize, qrSize);
        }

        return exportCanvas;
    }

    // 1. Download Ultra High-Quality PNG with White Background (2048×2048)
    if (downloadPng) {
        downloadPng.addEventListener('click', () => {
            try {
                const canvas = getHighResCanvas(2048, 2, false);
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

    // 2. Download Ultra High-Quality Transparent PNG without Background (2048×2048)
    if (downloadTransparentPng) {
        downloadTransparentPng.addEventListener('click', () => {
            try {
                const canvas = getHighResCanvas(2048, 2, true);
                const link = document.createElement('a');
                link.download = `qrcode-transparent-hd-${Date.now()}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
                showToast('Transparent PNG downloaded');
            } catch (err) {
                showToast('Could not download transparent PNG', true);
            }
        });
    }

    // 3. Download High-Quality PDF (A4 Document)
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
