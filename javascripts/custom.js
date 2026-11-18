// ROM.WIKI — Dynamic ROM Cards & Content Loader

function initRomWiki() {
    // 1. Intercept standard github raw links (Legacy behavior)
    const links = document.querySelectorAll('a');
    links.forEach(link => {
        const href = link.href;
        if (!href || !href.includes('raw.githubusercontent.com')) return;
        
        // Skip links that are inside our live cards
        if (link.closest('.live-rom-card')) return;

        // Prevent duplicate listeners
        if (link.dataset.hasRomListener) return;
        link.dataset.hasRomListener = 'true';

        link.addEventListener('click', async (e) => {
            e.preventDefault();
            if (link.nextElementSibling && link.nextElementSibling.classList.contains('dynamic-view-container')) {
                link.nextElementSibling.remove();
                return;
            }
            const viewContainer = document.createElement('div');
            viewContainer.className = 'dynamic-view-container';
            viewContainer.innerHTML = '<div>Fetching data...</div>';
            link.parentNode.insertBefore(viewContainer, link.nextSibling);

            try {
                const response = await fetch(href);
                if (!response.ok) throw new Error('Network response was not ok');
                if (href.endsWith('.json')) {
                    const data = await response.json();
                    const build = (data.response && Array.isArray(data.response)) ? data.response[0] : (Array.isArray(data) ? data[0] : data);
                    const fileInfo = (build.files && Array.isArray(build.files) && build.files[0]) ? build.files[0] : build;

                    const rawSize = fileInfo.size || (build.payload && build.payload[0] ? build.payload[0].FILE_SIZE : null);
                    const sizeMB = rawSize ? (Number(rawSize) / (1024 * 1024)).toFixed(2) : "Unknown";
                    
                    let version = build.version || fileInfo.version;
                    if (!version && fileInfo.filename) {
                        if (fileInfo.filename.toUpperCase().includes('YAAP')) {
                            const parts = fileInfo.filename.split('-');
                            if (parts.length > 1) version = parts[1];
                        } else if (fileInfo.filename.includes('lineage-')) {
                            const match = fileInfo.filename.match(/lineage-([0-9.]+)-/);
                            if (match) version = match[1];
                        }
                    }
                    version = version || "N/A";
                    const downloadUrl = fileInfo.url || `https://github.com/mayuresh-releases/YAAP_stone/releases/latest/download/${fileInfo.filename}`;
                    const isLineage = (fileInfo.filename && fileInfo.filename.includes('lineage-'));
                    const bootUrl = downloadUrl ? downloadUrl.substring(0, downloadUrl.lastIndexOf('/') + 1) + 'boot.img' : '';
                    const buttonsHtml = isLineage ? `
                        <a href="${downloadUrl}" target="_blank" class="md-button md-button--primary" style="margin-top:1rem; margin-right:0.5rem;">ROM</a>
                        <a href="${bootUrl}" target="_blank" class="md-button" style="margin-top:1rem;">Boot</a>
                    ` : `
                        <a href="${downloadUrl}" target="_blank" class="md-button md-button--primary" style="margin-top:1rem;">Download ROM</a>
                    `;
                    viewContainer.innerHTML = `
                        <div style="display: flex; justify-content: space-between; margin-bottom: 1rem; border-bottom: 1px solid var(--rom-border); padding-bottom: 0.5rem;">
                            <strong>Build Information</strong>
                            <button onclick="this.parentElement.parentElement.remove()" style="background:none; border:none; cursor:pointer; font-size:1.5em; color:var(--rom-muted);">&times;</button>
                        </div>
                        <div><strong>File:</strong> ${fileInfo.filename || 'Unknown'}</div>
                        <div><strong>Size:</strong> ${sizeMB} MB</div>
                        <div><strong>Version:</strong> ${version}</div>
                        ${buttonsHtml}
                    `;
                } else if (href.endsWith('.md') || href.endsWith('.txt')) {
                    const text = await response.text();
                    viewContainer.innerHTML = `
                        <div style="display: flex; justify-content: space-between; margin-bottom: 1rem; border-bottom: 1px solid var(--rom-border); padding-bottom: 0.5rem;">
                            <strong>${link.textContent}</strong>
                            <button onclick="this.parentElement.parentElement.remove()" style="background:none; border:none; cursor:pointer; font-size:1.5em; color:var(--rom-muted);">&times;</button>
                        </div>
                        <div class="md-typeset" style="font-size: 0.85em;">${marked.parse(text)}</div>
                    `;
                } else {
                    window.open(href, '_blank');
                    viewContainer.remove();
                }
            } catch (error) {
                viewContainer.innerHTML = `<div style="color: #ef4444;">Failed to fetch content: ${error.message}</div>`;
            }
        });
    });

    // 2. Initialize Live ROM Cards
    const liveCards = document.querySelectorAll('.live-rom-card');
    liveCards.forEach(async (card) => {
        // Prevent duplicate loads
        if (card.dataset.loaded === 'true') return;

        const title = card.getAttribute('data-title') || 'Custom ROM';
        const subtitle = card.getAttribute('data-subtitle') || '';
        const jsonUrl = card.getAttribute('data-json');
        const changelogUrl = card.getAttribute('data-changelog');
        const installUrl = card.getAttribute('data-install');
        const fallbackDlUrl = card.getAttribute('data-fallback-dl');

        // Initial skeleton state
        card.innerHTML = `
            <div class="live-rom-card-header">
                <span class="live-rom-card-title">${title}</span>
                <span class="live-rom-card-subtitle">${subtitle}</span>
                <div class="live-rom-card-loader" style="margin-left:auto;"></div>
            </div>
            <div class="live-rom-card-info-container shimmer" style="height: 38px;"></div>
            <div class="live-rom-card-actions shimmer" style="height: 32px; width: 220px; border-radius: 0.2rem;"></div>
        `;

        try {
            const response = await fetch(jsonUrl);
            if (!response.ok) throw new Error('Failed to load JSON');
            const data = await response.json();
            
            const build = (data.response && Array.isArray(data.response)) ? data.response[0] : (Array.isArray(data) ? data[0] : data);
            const fileInfo = (build.files && Array.isArray(build.files) && build.files[0]) ? build.files[0] : build;

            const rawSize = fileInfo.size || (build.payload && build.payload[0] ? build.payload[0].FILE_SIZE : null);
            const sizeMB = rawSize ? (Number(rawSize) / (1024 * 1024)).toFixed(2) : "Unknown";
            
            let version = build.version || fileInfo.version;
            if (!version && fileInfo.filename) {
                if (fileInfo.filename.toUpperCase().includes('YAAP')) {
                    const parts = fileInfo.filename.split('-');
                    if (parts.length > 1) version = parts[1];
                } else if (fileInfo.filename.includes('lineage-')) {
                    const match = fileInfo.filename.match(/lineage-([0-9.]+)-/);
                    if (match) version = match[1];
                }
            }
            version = version || "N/A";
            const downloadUrl = fileInfo.url || (fallbackDlUrl && fileInfo.filename ? fallbackDlUrl + fileInfo.filename : '');
            const filename = fileInfo.filename || "Unknown";

            const isLineage = title.toUpperCase().includes('LINEAGE') || card.getAttribute('data-has-boot') === 'true';
            const bootUrl = downloadUrl ? downloadUrl.substring(0, downloadUrl.lastIndexOf('/') + 1) + 'boot.img' : '';

            let downloadButtonsHtml = '';
            if (isLineage) {
                downloadButtonsHtml = `
                    <a href="${downloadUrl}" class="md-button md-button--primary" target="_blank" rel="noopener">ROM</a>
                    <a href="${bootUrl}" class="md-button" target="_blank" rel="noopener">Boot</a>
                `;
            } else {
                downloadButtonsHtml = `
                    <a href="${downloadUrl}" class="md-button md-button--primary" target="_blank" rel="noopener">Download</a>
                `;
            }

            card.dataset.loaded = 'true';

            // Render loaded state
            card.innerHTML = `
                <div class="live-rom-card-header">
                    <span class="live-rom-card-title">${title}</span>
                    <span class="live-rom-card-subtitle">${subtitle}</span>
                </div>
                <div class="live-rom-card-info-container">
                    <div class="live-rom-card-info-col" style="flex: 2; min-width: 200px;">
                        <span class="live-rom-card-label">Latest Build</span>
                        <span class="live-rom-card-filename">${filename}</span>
                    </div>
                    <div class="live-rom-card-info-col">
                        <span class="live-rom-card-label">Size</span>
                        <span class="live-rom-card-value">${sizeMB} MB</span>
                    </div>
                    <div class="live-rom-card-info-col">
                        <span class="live-rom-card-label">Version</span>
                        <span class="live-rom-card-value">${version}</span>
                    </div>
                </div>
                <div class="live-rom-card-actions">
                    ${downloadButtonsHtml}
                    <button class="md-button changelog-btn" type="button">Changelog</button>
                    <a href="${installUrl}" class="md-button">Install Guide</a>
                </div>
                <div class="dynamic-view-container" style="display:none; margin-top:0.75rem;"></div>
            `;

            // Attach changelog listener
            const clBtn = card.querySelector('.changelog-btn');
            const viewContainer = card.querySelector('.dynamic-view-container');
            clBtn.addEventListener('click', async () => {
                if (viewContainer.style.display === 'block') {
                    viewContainer.style.display = 'none';
                    return;
                }
                viewContainer.style.display = 'block';
                viewContainer.innerHTML = '<div>Fetching changelog...</div>';
                try {
                    const clRes = await fetch(changelogUrl);
                    const clText = await clRes.text();
                    viewContainer.innerHTML = `
                        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--rom-border); padding-bottom: 0.5rem; margin-bottom: 1rem;">
                            <strong>Release Notes</strong>
                            <button onclick="this.parentElement.parentElement.style.display='none'" style="background:none; border:none; cursor:pointer; font-size:1.5em; color:var(--rom-muted);">&times;</button>
                        </div>
                        <div class="md-typeset" style="font-size: 0.85em;">${marked.parse(clText)}</div>
                    `;
                } catch (e) {
                    viewContainer.innerHTML = '<div style="color: #ef4444;">Failed to fetch changelog.</div>';
                }
            });

        } catch (error) {
            // Render error state with fallback download button if available
            const fallbackLink = fallbackDlUrl ? `<a href="${fallbackDlUrl}" class="md-button md-button--primary" target="_blank" rel="noopener">Manual Download</a>` : '';
            card.innerHTML = `
                <div class="live-rom-card-header">
                    <span class="live-rom-card-title">${title}</span>
                    <span class="live-rom-card-subtitle">${subtitle}</span>
                </div>
                <div class="live-rom-card-info-container">
                    <div style="color: #ef4444; font-weight: 600; font-size: 0.85rem;">Failed to fetch latest build info</div>
                    <div style="font-size: 0.75rem; opacity: 0.7;">${error.message}</div>
                </div>
                <div class="live-rom-card-actions" style="margin-top: 0.5rem;">
                    ${fallbackLink}
                    <a href="${installUrl}" class="md-button">Install Guide</a>
                </div>
            `;
        }
    });
}

// Immediate execution on page load + subscribe to route changes
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRomWiki);
} else {
    initRomWiki();
}

if (typeof document$ !== 'undefined') {
    document$.subscribe(initRomWiki);
}
