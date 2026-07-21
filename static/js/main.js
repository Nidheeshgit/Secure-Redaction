/* =========================================================
   FileRedactor – Client-Side Interactivity (Redesigned)
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
    // --- Mobile Sidebar Toggle ---
    const mobileToggle = document.getElementById('mobileToggle');
    const sidebar = document.getElementById('sidebar');
    if (mobileToggle && sidebar) {
        mobileToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            const icon = mobileToggle.querySelector('i');
            if (sidebar.classList.contains('open')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-xmark');
            } else {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
        });
    }

    // --- Dashboard Tabs ---
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    if (tabBtns.length > 0) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.getAttribute('data-target');
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById(targetId).classList.add('active');
                
                // If analytics tab is clicked, trigger chart render if not already done
                if (targetId === 'tab-analytics' && !window.chartsRendered) {
                    renderCharts();
                    window.chartsRendered = true;
                }
            });
        });
    }

    // --- Chart.js Analytics ---
    function renderCharts() {
        const catCanvas = document.getElementById('categoryChart');
        const trendCanvas = document.getElementById('trendChart');
        if (!catCanvas || !trendCanvas) return;

        fetch('/api/analytics')
            .then(res => res.json())
            .then(data => {
                // Category Doughnut Chart
                new Chart(catCanvas, {
                    type: 'doughnut',
                    data: {
                        labels: data.categories.labels,
                        datasets: [{
                            data: data.categories.data,
                            backgroundColor: [
                                '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#f43f5e', '#6366f1'
                            ],
                            borderWidth: 0
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { position: 'right', labels: { color: '#94a3b8' } }
                        }
                    }
                });

                // Trend Bar Chart
                new Chart(trendCanvas, {
                    type: 'bar',
                    data: {
                        labels: data.trends.labels,
                        datasets: [
                            {
                                label: 'Files Uploaded',
                                data: data.trends.uploads,
                                backgroundColor: '#10b981',
                                borderRadius: 4
                            },
                            {
                                label: 'Items Redacted',
                                data: data.trends.redactions,
                                backgroundColor: '#8b5cf6',
                                borderRadius: 4
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                            x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
                        },
                        plugins: {
                            legend: { labels: { color: '#94a3b8' } }
                        }
                    }
                });
            })
            .catch(err => console.error("Error fetching analytics:", err));
    }

    // --- Toast Notifications ---
    const toastContainer = document.getElementById('toastContainer');
    function createToast(category, message) {
        if (!toastContainer) return;
        const toast = document.createElement('div');
        toast.className = `toast toast-${category}`;
        
        let iconClass = 'fa-circle-info';
        if (category === 'success') iconClass = 'fa-circle-check';
        if (category === 'danger') iconClass = 'fa-circle-xmark';
        if (category === 'warning') iconClass = 'fa-triangle-exclamation';

        toast.innerHTML = `
            <div class="toast-icon"><i class="fa-solid ${iconClass}"></i></div>
            <div class="toast-content">
                <div class="toast-title">${category.charAt(0).toUpperCase() + category.slice(1)}</div>
                <div class="toast-msg">${message}</div>
            </div>
            <button class="toast-close"><i class="fa-solid fa-xmark"></i></button>
        `;
        
        toastContainer.appendChild(toast);
        
        // trigger animation
        setTimeout(() => toast.classList.add('show'), 10);
        
        // handle close
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        });

        // auto remove
        setTimeout(() => {
            if (toast.parentElement) {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 400);
            }
        }, 6000);
    }

    // Convert server flashes to toasts
    const serverFlashes = document.querySelectorAll('.server-flash');
    serverFlashes.forEach((flash, index) => {
        const cat = flash.getAttribute('data-category') || 'info';
        const msg = flash.getAttribute('data-message');
        setTimeout(() => {
            createToast(cat, msg);
            flash.remove();
        }, index * 200);
    });

    // --- File Drop Zone & Preview ---
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const fileNameEl = document.getElementById('fileName');
    const uploadForm = document.getElementById('uploadForm');
    const submitBtn = document.getElementById('submitBtn');
    
    // Preview Elements
    const previewPane = document.getElementById('previewPane');
    const previewPlaceholder = document.getElementById('previewPlaceholder');

    function handleFileSelection(file) {
        if (!file) return;
        fileNameEl.style.display = 'flex';
        fileNameEl.innerHTML = `<i class="fa-regular fa-file"></i> ${file.name}`;
        
        // Hide placeholder, show loading in preview
        if (previewPlaceholder && previewPane) {
            previewPlaceholder.style.display = 'none';
            previewPane.classList.add('active');
            previewPane.innerHTML = `<div style="text-align:center; padding: 2rem; color: var(--text-muted);"><i class="fa-solid fa-spinner fa-spin fa-2x"></i><p style="margin-top:1rem;">Loading preview...</p></div>`;
            
            const ext = file.name.split('.').pop().toLowerCase();
            const reader = new FileReader();

            if (ext === 'docx') {
                reader.onload = function(e) {
                    const arrayBuffer = e.target.result;
                    if (window.mammoth) {
                        mammoth.convertToHtml({arrayBuffer: arrayBuffer})
                            .then(function(result) {
                                previewPane.innerHTML = `<div style="font-family: var(--font);">${result.value}</div>`;
                            })
                            .catch(function(err) {
                                previewPane.innerHTML = `<div style="color: var(--danger);">Error loading Word document preview.</div>`;
                            });
                    } else {
                        previewPane.innerHTML = `<div>Word document selected. Preview library not loaded.</div>`;
                    }
                };
                reader.readAsArrayBuffer(file);
            } else if (ext === 'xlsx' || ext === 'csv') {
                reader.onload = function(e) {
                    const data = e.target.result;
                    if (window.XLSX) {
                        try {
                            const workbook = XLSX.read(data, {type: 'array'});
                            const firstSheet = workbook.SheetNames[0];
                            const htmlString = XLSX.utils.sheet_to_html(workbook.Sheets[firstSheet], { id: "excelTable" });
                            previewPane.innerHTML = `<div style="overflow-x: auto; width: 100%;">${htmlString}</div>`;
                            
                            // styling the generated table
                            const table = previewPane.querySelector('table');
                            if(table) {
                                table.className = "excel-preview-table";
                                table.removeAttribute('border');
                            }
                        } catch(err) {
                            previewPane.innerHTML = `<div style="color: var(--danger);">Error parsing Excel file.</div>`;
                        }
                    } else {
                        previewPane.innerHTML = `<div>Excel file selected. Preview library not loaded.</div>`;
                    }
                };
                reader.readAsArrayBuffer(file);
            } else if (ext === 'txt' || ext === 'json' || ext === 'xml') {
                reader.onload = function(e) {
                    const text = e.target.result;
                    const display = text.length > 50000 ? text.substring(0, 50000) + '\n... [Preview Truncated]' : text;
                    previewPane.innerHTML = `<pre style="white-space: pre-wrap; word-break: break-all;">${display.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`;
                };
                reader.readAsText(file);
            } else {
                previewPane.innerHTML = `<div style="text-align:center; padding: 2rem; color: var(--text-muted);"><i class="fa-regular fa-eye-slash fa-2x"></i><p style="margin-top:1rem;">Preview not available for .${ext} files.</p></div>`;
            }

            // Show actions when preview is loaded
            const previewActions = document.getElementById('previewActions');
            if (previewActions) previewActions.style.display = 'block';
        }
    }

    if (dropZone && fileInput) {
        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) {
                handleFileSelection(fileInput.files[0]);
            }
        });

        // Drag-and-drop visual feedback
        ['dragenter', 'dragover'].forEach(evt => {
            dropZone.addEventListener(evt, (e) => {
                e.preventDefault();
                dropZone.classList.add('drag-over');
            });
        });
        ['dragleave', 'drop'].forEach(evt => {
            dropZone.addEventListener(evt, (e) => {
                e.preventDefault();
                dropZone.classList.remove('drag-over');
            });
        });
        dropZone.addEventListener('drop', (e) => {
            if (e.dataTransfer.files.length > 0) {
                fileInput.files = e.dataTransfer.files;
                handleFileSelection(e.dataTransfer.files[0]);
            }
        });
    }

    // Loading State on Form Submit
    if (uploadForm && submitBtn) {
        uploadForm.addEventListener('submit', (e) => {
            if (fileInput && fileInput.files.length === 0) return;
            submitBtn.classList.add('loading');
            submitBtn.innerHTML = ''; 
        });
    }

    // --- Password Visibility Toggle ---
    const passwordToggles = document.querySelectorAll('.password-toggle');
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const input = toggle.previousElementSibling;
            const icon = toggle.querySelector('i');
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            }
        });
    });

    // --- Redaction Mode Toggle ---
    const modeRadios = document.querySelectorAll('input[name="redaction_mode"]');
    const piiSection = document.getElementById('piiCategoriesSection');
    const piiCheckboxes = document.querySelectorAll('.pattern-chip input[type="checkbox"]');

    if (modeRadios.length > 0 && piiSection) {
        modeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.value === 'manual') {
                    piiSection.style.display = 'none';
                    piiCheckboxes.forEach(cb => cb.checked = false);
                } else {
                    piiSection.style.display = 'block';
                    piiCheckboxes.forEach(cb => cb.checked = true);
                }
            });
        });
    }

    // --- Persistent Highlight and Selection Button ---
    const customTermsHidden = document.getElementById('custom_terms_hidden');
    const customTermsContainer = document.getElementById('custom_terms_container');
    const markSelectionBtn = document.getElementById('markSelectionBtn');
    
    // Maintain terms as an array
    let customTermsArray = [];
    
    // Store original HTML of the preview pane to apply highlights cleanly
    let originalPreviewHTML = '';

    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function renderTermChips() {
        if (!customTermsContainer || !customTermsHidden) return;
        customTermsHidden.value = JSON.stringify(customTermsArray);
        
        customTermsContainer.innerHTML = '';
        if (customTermsArray.length === 0) {
            customTermsContainer.innerHTML = '<span style="color: var(--text-muted); font-size: 0.85rem;">No manual terms added yet.</span>';
            return;
        }
        
        customTermsArray.forEach((term, index) => {
            const chip = document.createElement('div');
            chip.className = 'pattern-chip';
            chip.style.display = 'inline-flex';
            chip.style.alignItems = 'center';
            chip.style.background = 'var(--danger)';
            chip.style.color = 'white';
            chip.style.padding = '4px 10px';
            chip.style.margin = '4px';
            
            const textSpan = document.createElement('span');
            textSpan.textContent = term.length > 20 ? term.substring(0, 20) + '...' : term;
            
            const closeBtn = document.createElement('i');
            closeBtn.className = 'fa-solid fa-xmark';
            closeBtn.style.marginLeft = '8px';
            closeBtn.style.cursor = 'pointer';
            closeBtn.onclick = () => {
                customTermsArray.splice(index, 1);
                renderTermChips();
                highlightTerms();
            };
            
            chip.appendChild(textSpan);
            chip.appendChild(closeBtn);
            customTermsContainer.appendChild(chip);
        });
    }

    function highlightTerms() {
        if (!previewPane || !originalPreviewHTML) return;
        
        // Disconnect observer to prevent infinite loop while modifying DOM
        if (window.previewObserver) window.previewObserver.disconnect();
        
        let html = originalPreviewHTML;
        
        if (customTermsArray.length > 0) {
            customTermsArray.forEach(term => {
                const regex = new RegExp(`(${escapeRegExp(term)})(?![^<]*>|[^<>]*</)`, 'gi');
                html = html.replace(regex, '<span style="background-color: var(--danger); color: white; padding: 0 2px; border-radius: 2px;">$1</span>');
            });
        }
        
        previewPane.innerHTML = html;
        
        // Reconnect observer
        if (window.previewObserver) window.previewObserver.observe(previewPane, { childList: true });
    }

    // Initialize empty state
    renderTermChips();

    if (markSelectionBtn && previewPane) {
        markSelectionBtn.addEventListener('mousedown', (e) => {
            e.preventDefault(); 
            
            const selection = window.getSelection();
            const text = selection.toString().trim();

            if (text.length > 0) {
                if (!customTermsArray.includes(text)) {
                    customTermsArray.push(text);
                    renderTermChips();
                }

                // Animate container
                customTermsContainer.style.transition = 'box-shadow 0.3s ease';
                customTermsContainer.style.boxShadow = '0 0 15px var(--danger)';
                setTimeout(() => customTermsContainer.style.boxShadow = 'none', 500);

                highlightTerms();
                selection.removeAllRanges();
                
                createToast('success', `Marked "${text.length > 15 ? text.substring(0, 15) + '...' : text}" for redaction.`);
            } else {
                createToast('warning', 'Please highlight some text in the preview first.');
            }
        });
    }

    window.previewObserver = new MutationObserver((mutationsList) => {
        for(let mutation of mutationsList) {
            if (mutation.type === 'childList') {
                originalPreviewHTML = previewPane.innerHTML;
                if (customTermsArray.length > 0) {
                    highlightTerms();
                }
            }
        }
    });
    
    if (previewPane) {
        window.previewObserver.observe(previewPane, { childList: true });
    }
});
