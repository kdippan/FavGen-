document.addEventListener('DOMContentLoaded', () => {
    // --- State Management ---
    const state = {
        image: null,
        fileType: null,
        filename: 'favicon',
        padding: 0,
        radius: 0,
        bgColor: '#ffffff',
        isTransparent: true
    };

    // --- Configuration: Comprehensive Size List ---
    // Naming convention: favicon-{width}x{height}.png (as requested)
    const config = {
        sizes: [
            // Standard / Legacy
            { width: 16, height: 16, name: 'favicon-16x16.png' },
            { width: 32, height: 32, name: 'favicon-32x32.png' },
            { width: 48, height: 48, name: 'favicon-48x48.png' },
            { width: 64, height: 64, name: 'favicon-64x64.png' },
            { width: 96, height: 96, name: 'favicon-96x96.png' },
            { width: 128, height: 128, name: 'favicon-128x128.png' },
            
            // Apple / iOS
            { width: 57, height: 57, name: 'favicon-57x57.png' },
            { width: 60, height: 60, name: 'favicon-60x60.png' },
            { width: 72, height: 72, name: 'favicon-72x72.png' },
            { width: 76, height: 76, name: 'favicon-76x76.png' },
            { width: 114, height: 114, name: 'favicon-114x114.png' },
            { width: 120, height: 120, name: 'favicon-120x120.png' },
            { width: 144, height: 144, name: 'favicon-144x144.png' },
            { width: 152, height: 152, name: 'favicon-152x152.png' },
            { width: 167, height: 167, name: 'favicon-167x167.png' },
            { width: 180, height: 180, name: 'favicon-180x180.png' },
            
            // Android / PWA
            { width: 192, height: 192, name: 'favicon-192x192.png' },
            { width: 256, height: 256, name: 'favicon-256x256.png' },
            { width: 384, height: 384, name: 'favicon-384x384.png' },
            { width: 512, height: 512, name: 'favicon-512x512.png' },

            // Windows Tiles
            { width: 70, height: 70, name: 'favicon-70x70.png' },
            { width: 150, height: 150, name: 'favicon-150x150.png' },
            { width: 310, height: 150, name: 'favicon-310x150.png' }, // Wide Tile
            { width: 310, height: 310, name: 'favicon-310x310.png' }
        ]
    };

    // --- DOM Elements ---
    const els = {
        dropZone: document.getElementById('dropZone'),
        fileInput: document.getElementById('fileInput'),
        uploadContent: document.getElementById('uploadContent'),
        previewContainer: document.getElementById('sourcePreviewContainer'),
        sourceImage: document.getElementById('sourceImage'),
        removeBtn: document.getElementById('removeImage'),
        previewGrid: document.getElementById('previewGrid'),
        downloadBtn: document.getElementById('downloadAll'),
        padding: document.getElementById('padding'),
        paddingVal: document.getElementById('paddingVal'),
        radius: document.getElementById('radius'),
        radiusVal: document.getElementById('radiusVal'),
        bgColor: document.getElementById('bgColor'),
        transparentBg: document.getElementById('transparentBg'),
        themeToggle: document.getElementById('themeToggle'),
        themeIcon: document.getElementById('themeIcon'),
        mainBg: document.getElementById('mainBg'),
        tabButtons: document.querySelectorAll('.tab-btn'),
        tabContents: document.querySelectorAll('.tab-content')
    };

    // --- Theme System ---
    function initTheme() {
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
            els.themeIcon.classList.replace('fa-moon', 'fa-sun');
            els.mainBg.classList.remove('light-mode-bg');
        } else {
            document.documentElement.classList.remove('dark');
            els.themeIcon.classList.replace('fa-sun', 'fa-moon');
            els.mainBg.classList.add('light-mode-bg');
        }
    }

    els.themeToggle.addEventListener('click', () => {
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light';
            els.themeIcon.classList.replace('fa-sun', 'fa-moon');
            els.mainBg.classList.add('light-mode-bg');
        } else {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark';
            els.themeIcon.classList.replace('fa-moon', 'fa-sun');
            els.mainBg.classList.remove('light-mode-bg');
        }
    });

    // --- Event Listeners ---
    els.fileInput.addEventListener('change', handleFileSelect);
    els.removeBtn.addEventListener('click', resetUpload);
    els.padding.addEventListener('input', updateSettings);
    els.radius.addEventListener('input', updateSettings);
    els.bgColor.addEventListener('input', updateSettings);
    els.transparentBg.addEventListener('change', updateSettings);
    els.downloadBtn.addEventListener('click', generateZip);

    els.tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.tab;
            els.tabButtons.forEach(b => {
                b.classList.remove('border-blue-500', 'text-blue-500', 'bg-white/5');
                b.classList.add('border-transparent', 'text-slate-400');
            });
            btn.classList.remove('border-transparent', 'text-slate-400');
            btn.classList.add('border-blue-500', 'text-blue-500', 'bg-white/5');
            els.tabContents.forEach(c => c.classList.add('hidden'));
            document.getElementById(`code-${target}`).classList.remove('hidden');
        });
    });

    els.dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        els.dropZone.classList.add('border-blue-500');
    });
    els.dropZone.addEventListener('dragleave', () => {
        els.dropZone.classList.remove('border-blue-500');
    });
    els.dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        els.dropZone.classList.remove('border-blue-500');
        if(e.dataTransfer.files.length) {
            els.fileInput.files = e.dataTransfer.files;
            handleFileSelect({ target: els.fileInput });
        }
    });

    // --- Core Logic ---
    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.match('image.*')) { alert('Please upload a valid image file'); return; }
        if (file.size > 10 * 1024 * 1024) { alert('File is too large (Max 10MB)'); return; }

        state.fileType = file.type;
        state.filename = file.name.split('.')[0];

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                state.image = img;
                showPreview(event.target.result);
                renderPreviews();
                els.downloadBtn.disabled = false;
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }

    function showPreview(src) {
        els.uploadContent.classList.add('hidden');
        els.previewContainer.classList.remove('hidden');
        els.sourceImage.src = src;
    }

    function resetUpload() {
        state.image = null;
        state.fileType = null;
        els.fileInput.value = '';
        els.uploadContent.classList.remove('hidden');
        els.previewContainer.classList.add('hidden');
        els.previewGrid.innerHTML = `
            <div class="text-center col-span-full py-12 text-slate-500">
                <i class="fa-regular fa-image text-4xl mb-3 opacity-50"></i>
                <p>Upload an image to see generated icons</p>
            </div>
        `;
        els.downloadBtn.disabled = true;
    }

    function updateSettings(e) {
        if (!state.image) return;
        if (e.target === els.padding) {
            state.padding = parseInt(e.target.value);
            els.paddingVal.innerText = `${state.padding}%`;
        }
        if (e.target === els.radius) {
            state.radius = parseInt(e.target.value);
            els.radiusVal.innerText = `${state.radius}%`;
        }
        if (e.target === els.bgColor || e.target === els.transparentBg) {
            state.bgColor = els.bgColor.value;
            state.isTransparent = els.transparentBg.checked;
        }
        requestAnimationFrame(renderPreviews);
    }

    // Updated Render Logic for Responsiveness
    function renderPreviews() {
        els.previewGrid.innerHTML = '';
        
        // Select key sizes to preview (not all 30+)
        const displaySizes = [
            config.sizes.find(s => s.width === 16),
            config.sizes.find(s => s.width === 32),
            config.sizes.find(s => s.width === 64),
            config.sizes.find(s => s.width === 180),
            config.sizes.find(s => s.width === 192),
            config.sizes.find(s => s.width === 512)
        ];

        displaySizes.forEach(size => {
            if(!size) return;
            const canvas = generateCanvas(size.width, size.height);
            
            const wrapper = document.createElement('div');
            wrapper.className = 'flex flex-col items-center gap-2 mb-2 w-full';
            
            const visualWrapper = document.createElement('div');
            // Responsive width/aspect-ratio for mobile grid
            visualWrapper.className = 'checkboard p-2 rounded shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-center w-full aspect-square max-w-[80px] sm:max-w-[100px]';

            // Allow canvas to fit container
            canvas.style.maxWidth = '100%';
            canvas.style.maxHeight = '100%';
            canvas.style.objectFit = 'contain';
            
            visualWrapper.appendChild(canvas);
            
            const label = document.createElement('span');
            label.className = 'text-[10px] text-slate-400 font-mono';
            label.innerText = `${size.width}x${size.height}`;
            
            wrapper.appendChild(visualWrapper);
            wrapper.appendChild(label);
            els.previewGrid.appendChild(wrapper);
        });
    }

    function generateCanvas(width, height) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Background
        if (!state.isTransparent) {
            ctx.fillStyle = state.bgColor;
            if (state.radius > 0) {
                const shortestSide = Math.min(width, height);
                const r = (state.radius / 100) * (shortestSide / 2);
                roundRect(ctx, 0, 0, width, height, r);
                ctx.fill();
            } else {
                ctx.fillRect(0, 0, width, height);
            }
        }

        const shortestSide = Math.min(width, height);
        const paddingPx = (state.padding / 100) * (shortestSide / 2);
        const drawAreaW = width - (paddingPx * 2);
        const drawAreaH = height - (paddingPx * 2);
        const startX = paddingPx;
        const startY = paddingPx;

        // Image Drawing (with Clipping)
        ctx.save();
        if (state.radius > 0 && state.isTransparent) {
             const r = (state.radius / 100) * (Math.min(drawAreaW, drawAreaH) / 2);
             roundRect(ctx, startX, startY, drawAreaW, drawAreaH, r);
             ctx.clip();
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        const imgAspect = state.image.width / state.image.height;
        const canvasAspect = drawAreaW / drawAreaH;
        let renderW, renderH, renderX, renderY;

        if (imgAspect > canvasAspect) {
            renderW = drawAreaW;
            renderH = drawAreaW / imgAspect;
            renderX = startX;
            renderY = startY + (drawAreaH - renderH) / 2;
        } else {
            renderH = drawAreaH;
            renderW = drawAreaH * imgAspect;
            renderY = startY;
            renderX = startX + (drawAreaW - renderW) / 2;
        }

        ctx.drawImage(state.image, renderX, renderY, renderW, renderH);
        ctx.restore();
        return canvas;
    }

    function roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    async function generateZip() {
        const btnOriginalText = els.downloadBtn.innerHTML;
        els.downloadBtn.disabled = true;
        els.downloadBtn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Processing...`;

        const zip = new JSZip();
        
        // Add SVG if available
        if (state.fileType === 'image/svg+xml') {
            const resp = await fetch(els.sourceImage.src);
            const svgBlob = await resp.blob();
            zip.file('favicon.svg', svgBlob);
        }

        // Generate all PNGs
        const promises = config.sizes.map(async (size) => {
            const canvas = generateCanvas(size.width, size.height);
            return new Promise(resolve => {
                canvas.toBlob(blob => {
                    zip.file(size.name, blob);
                    // Standard favicon.ico (using 32x32)
                    if (size.width === 32) zip.file('favicon.ico', blob);
                    resolve();
                });
            });
        });

        await Promise.all(promises);

        // manifest.json
        const manifest = {
            name: "My App",
            short_name: "App",
            icons: [
                { src: "/favicon-192x192.png", sizes: "192x192", "type": "image/png" },
                { src: "/favicon-256x256.png", sizes: "256x256", "type": "image/png" },
                { src: "/favicon-384x384.png", sizes: "384x384", "type": "image/png" },
                { src: "/favicon-512x512.png", sizes: "512x512", "type": "image/png" }
            ],
            theme_color: state.bgColor,
            background_color: state.bgColor,
            display: "standalone"
        };

        // browserconfig.xml
        const browserConfig = `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
  <msapplication>
    <tile>
      <square70x70logo src="/favicon-70x70.png"/>
      <square150x150logo src="/favicon-150x150.png"/>
      <wide310x150logo src="/favicon-310x150.png"/>
      <square310x310logo src="/favicon-310x310.png"/>
      <TileColor>${state.bgColor}</TileColor>
    </tile>
  </msapplication>
</browserconfig>`;

        zip.file("site.webmanifest", JSON.stringify(manifest, null, 2));
        zip.file("browserconfig.xml", browserConfig);
        
        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, "favicon-pack.zip");

        els.downloadBtn.disabled = false;
        els.downloadBtn.innerHTML = btnOriginalText;
        showToast();
    }

    function showToast() {
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-xl animate-fade-in z-50 flex items-center';
        toast.innerHTML = '<i class="fa-solid fa-check mr-2"></i> <span>Download Started!</span>';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    window.copyCode = function() {
        const activeTab = document.querySelector('.tab-content:not(.hidden) code');
        if (activeTab) {
            navigator.clipboard.writeText(activeTab.innerText).then(() => {
                const btn = document.querySelector('button[title="Copy Code"]');
                const original = btn.innerHTML;
                btn.innerHTML = '<i class="fa-solid fa-check text-green-500"></i>';
                setTimeout(() => btn.innerHTML = original, 2000);
            });
        }
    };

    initTheme();
});
