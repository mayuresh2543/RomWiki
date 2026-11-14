function initRomWiki() {
    // 1. Intercept standard github raw links (Legacy behavior)
    const links = document.querySelectorAll('a');
    links.forEach(link => {
        const href = link.href;
        if (!href || !href.includes('raw.githubusercontent.com')) return;
        if (link.closest('.live-rom-card')) return;
        if (link.dataset.intercepted) return;
        link.dataset.intercepted = 'true';

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
                    const build = data.response ? data.response[0] : data;
                    const rawSize = build.size || (build.payload && build.payload[0] ? build.payload[0].FILE_SIZE : null);
                    const sizeMB = rawSize ? (rawSize / (1024 * 1024)).toFixed(2) : "Unknown";
                    let version = build.version;
                    if (!version && build.filename && build.filename.toUpperCase().includes('YAAP')) {
                        const parts = build.filename.split('-');
                        if (parts.length > 1) version = parts[1];
                    }
                    version = version || "N/A";
                    const downloadUrl = build.url || `https://github.com/mayuresh-releases/YAAP_stone/releases/latest/download/${build.filename}`;
                    viewContainer.innerHTML = `
                        <div style="display: flex; justify-content: space-between; align-items:center; margin-bottom: 0.75rem;">
                            <strong>Build Information</strong>
                            <button onclick="this.parentElement.parentElement.remove()" style="background:none; border:none; cursor:pointer; font-size:1.5em; color:var(--md-default-fg-color);">&times;</button>
                        </div>
                        <div style="margin-bottom:0.35rem;"><strong>File:</strong> <code>${build.filename || 'Unknown'}</code></div>
                        <div style="margin-bottom:0.35rem;"><strong>Size:</strong> ${sizeMB} MB</div>
                        <div style="margin-bottom:0.75rem;"><strong>Version:</strong> ${version}</div>
                        <a href="${downloadUrl}" target="_blank" class="md-button md-button--primary">Download ROM</a>
                    `;
                } else if (href.endsWith('.md') || href.endsWith('.txt')) {
                    const text = await response.text();
                    viewContainer.innerHTML = `
                        <div style="display: flex; justify-content: space-between; align-items:center; margin-bottom: 0.75rem; border-bottom: 1px solid var(--md-default-fg-color--lightest); padding-bottom: 0.5rem;">
                            <strong>${link.textContent}</strong>
                            <button onclick="this.parentElement.parentElement.remove()" style="background:none; border:none; cursor:pointer; font-size:1.5em; color:var(--md-default-fg-color);">&times;</button>
                        </div>
                        <div class="md-typeset" style="font-size: 0.88em; max-height: 400px; overflow-y: auto;">${marked.parse(text)}</div>
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
        if (card.dataset.initialized === 'true') return;
        card.dataset.initialized = 'true';

        const title = card.getAttribute('data-title') || 'Custom ROM';
        const subtitle = card.getAttribute('data-subtitle') || 'Unofficial';
        const jsonUrl = card.getAttribute('data-json');
        const changelogUrl = card.getAttribute('data-changelog');
        const installUrl = card.getAttribute('data-install');
        const fallbackDlUrl = card.getAttribute('data-fallback-dl') || '';

        // Initial skeleton state
        card.innerHTML = `
            <div class="live-rom-card-header">
                <div>
                    <h3 class="live-rom-card-title">${title}</h3>
                    <div class="live-rom-card-subtitle">${subtitle}</div>
                </div>
                <div class="live-rom-card-loader"></div>
            </div>
            <div class="live-rom-card-info-container shimmer">
                <div style="height: 58px;"></div>
            </div>
            <div class="live-rom-card-actions shimmer" style="height: 38px; border-radius: 0.45rem;"></div>
        `;

        try {
            const response = await fetch(jsonUrl);
            if (!response.ok) throw new Error('Failed to load build metadata');
            const data = await response.json();
            const build = (data.response && data.response[0]) ? data.response[0] : (Array.isArray(data) ? data[0] : data);
            
            const rawSize = build.size || (build.payload && build.payload[0] ? build.payload[0].FILE_SIZE : null);
            const sizeMB = rawSize ? (rawSize / (1024 * 1024)).toFixed(2) : "Unknown";
            
            let version = build.version;
            if (!version && build.filename && build.filename.toUpperCase().includes('YAAP')) {
                const parts = build.filename.split('-');
                if (parts.length > 1) version = parts[1];
            }
            version = version || "N/A";
            const downloadUrl = build.url || (fallbackDlUrl ? fallbackDlUrl + build.filename : `https://github.com/mayuresh-releases/YAAP_stone/releases/latest/download/${build.filename}`);
            const filename = build.filename || "Unknown";

            // Format build date if available
            let dateStr = "";
            if (build.datetime) {
                const dateObj = new Date(typeof build.datetime === 'number' ? build.datetime * 1000 : build.datetime);
                if (!isNaN(dateObj)) {
                    dateStr = dateObj.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
                }
            }

            // Render loaded state
            card.innerHTML = `
                <div class="live-rom-card-header">
                    <div>
                        <h3 class="live-rom-card-title">${title}</h3>
                        <div class="live-rom-card-subtitle">${subtitle}</div>
                    </div>
                    ${dateStr ? `<span class="device-badge" style="background:var(--md-default-bg-color--light);">${dateStr}</span>` : ''}
                </div>
                <div class="live-rom-card-info-container">
                    <div class="live-rom-card-label">LATEST BUILD FILE</div>
                    <div class="live-rom-card-filename">${filename}</div>
                    <div class="live-rom-card-info-row">
                        <div style="display:flex; flex-direction:column;">
                            <span class="live-rom-card-label">DOWNLOAD SIZE</span>
                            <span class="live-rom-card-value">${sizeMB} MB</span>
                        </div>
                        <div style="display:flex; flex-direction:column; text-align:right;">
                            <span class="live-rom-card-label">ROM VERSION</span>
                            <span class="live-rom-card-value">${version}</span>
                        </div>
                    </div>
                </div>
                <div class="live-rom-card-actions">
                    <a href="${downloadUrl}" class="md-button md-button--primary" target="_blank" rel="noopener">
                        <span style="display:inline-flex; align-items:center; gap:0.35rem;">⬇️ Download ROM</span>
                    </a>
                    ${changelogUrl ? `<button class="md-button changelog-btn" type="button"><span style="display:inline-flex; align-items:center; gap:0.35rem;">📋 Changelog</span></button>` : ''}
                    ${installUrl ? `<a href="${installUrl}" class="md-button"><span style="display:inline-flex; align-items:center; gap:0.35rem;">📖 Install Guide</span></a>` : ''}
                </div>
                <div class="dynamic-view-container" style="display:none; margin-top:1.25rem;"></div>
            `;

            // Attach changelog listener if available
            if (changelogUrl) {
                const clBtn = card.querySelector('.changelog-btn');
                const viewContainer = card.querySelector('.dynamic-view-container');
                clBtn.addEventListener('click', async () => {
                    if (viewContainer.style.display === 'block') {
                        viewContainer.style.display = 'none';
                        return;
                    }
                    viewContainer.style.display = 'block';
                    viewContainer.innerHTML = '<div style="display:flex; align-items:center; gap:0.5rem;"><div class="live-rom-card-loader"></div> Fetching changelog...</div>';
                    try {
                        const clRes = await fetch(changelogUrl);
                        if (!clRes.ok) throw new Error('HTTP ' + clRes.status);
                        const clText = await clRes.text();
                        viewContainer.innerHTML = `
                            <div style="display: flex; justify-content: space-between; align-items:center; border-bottom: 1px solid var(--md-default-fg-color--lightest); padding-bottom: 0.5rem; margin-bottom: 1rem;">
                                <strong>Release Notes & Changelog</strong>
                                <button onclick="this.parentElement.parentElement.style.display='none'" style="background:none; border:none; cursor:pointer; font-size:1.5em; color:var(--md-default-fg-color);">&times;</button>
                            </div>
                            <div class="md-typeset" style="font-size: 0.88em; max-height: 380px; overflow-y: auto; padding-right: 0.5rem;">${marked.parse(clText)}</div>
                        `;
                    } catch (e) {
                        viewContainer.innerHTML = '<div style="color: #ef4444;">Failed to fetch changelog.</div>';
                    }
                });
            }

        } catch (error) {
            // Render error state
            card.innerHTML = `
                <div class="live-rom-card-header">
                    <div>
                        <h3 class="live-rom-card-title">${title}</h3>
                        <div class="live-rom-card-subtitle">${subtitle}</div>
                    </div>
                </div>
                <div class="live-rom-card-info-container" style="text-align: center; color: var(--md-typeset-color);">
                    <div style="color: #ef4444; font-weight: bold; margin-bottom: 0.5rem;">Failed to fetch latest build info</div>
                    <div style="font-size: 0.8em; opacity: 0.7;">${error.message}</div>
                </div>
                <div class="live-rom-card-actions">
                    ${installUrl ? `<a href="${installUrl}" class="md-button">Install Guide</a>` : ''}
                </div>
            `;
        }
    });
}

// Hook into MkDocs Material observable or fallback
if (typeof document$ !== 'undefined') {
    document$.subscribe(function() {
        initRomWiki();
    });
} else {
    document.addEventListener('DOMContentLoaded', initRomWiki);
}
