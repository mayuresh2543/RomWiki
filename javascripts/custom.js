// ROM.WIKI — Terminal TUI Dynamic ROM Cards & Content Loader

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
            viewContainer.innerHTML = '<div><span class="term-prompt">$</span> fetching data...</div>';
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
                        <a href="${downloadUrl}" target="_blank" class="term-btn term-btn--primary" style="margin-top:0.75rem; margin-right:0.4rem;">[ $ wget rom.zip ]</a>
                        <a href="${bootUrl}" target="_blank" class="term-btn" style="margin-top:0.75rem;">[ $ wget boot.img ]</a>
                    ` : `
                        <a href="${downloadUrl}" target="_blank" class="term-btn term-btn--primary" style="margin-top:0.75rem;">[ $ wget download ]</a>
                    `;
                    viewContainer.innerHTML = `
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; border-bottom: 1px solid var(--rom-border); padding-bottom: 0.5rem;">
                            <strong style="color: var(--rom-accent); font-size: 0.78rem;">[ PAGER: build.json ]</strong>
                            <button onclick="this.parentElement.parentElement.remove()" style="background:none; border:none; cursor:pointer; color:var(--rom-muted); font-size:0.9rem;">[q: close]</button>
                        </div>
                        <div class="term-line"><span class="term-prompt">$</span> package : <span class="term-file">${fileInfo.filename || 'Unknown'}</span></div>
                        <div class="term-line"><span class="term-prompt">$</span> size    : <span class="term-val">${sizeMB} MB</span></div>
                        <div class="term-line"><span class="term-prompt">$</span> version : <span class="term-val">${version}</span></div>
                        ${buttonsHtml}
                    `;
                } else if (href.endsWith('.md') || href.endsWith('.txt')) {
                    const text = await response.text();
                    viewContainer.innerHTML = `
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; border-bottom: 1px solid var(--rom-border); padding-bottom: 0.5rem;">
                            <strong style="color: var(--rom-accent); font-size: 0.78rem;">[ PAGER: ${link.textContent} ]</strong>
                            <button onclick="this.parentElement.parentElement.remove()" style="background:none; border:none; cursor:pointer; color:var(--rom-muted); font-size:0.9rem;">[q: close]</button>
                        </div>
                        <div class="md-typeset" style="font-size: 0.82em;">${marked.parse(text)}</div>
                    `;
                } else {
                    window.open(href, '_blank');
                    viewContainer.remove();
                }
            } catch (error) {
                viewContainer.innerHTML = `<div style="color: var(--rom-red); font-size: 0.8rem;">[ERR] fetch failed: ${error.message}</div>`;
            }
        });
    });

    // 2. Initialize Terminal ASCII Live ROM Cards
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
        const manifestName = jsonUrl ? jsonUrl.split('/').pop() : 'ota.json';

        // Initial CLI loading state with spinner
        card.innerHTML = `
            <div class="live-rom-card-header">
                <span class="live-rom-card-title">[ BUILD: ${title} ]</span>
                <span class="live-rom-card-subtitle">[ ${subtitle} ]</span>
            </div>
            <div class="term-line"><span class="term-prompt">$</span> fetching manifest: <span class="term-spinner">[ / ]</span> <span style="opacity:0.7;">${manifestName}</span></div>
            <div class="shimmer" style="height: 14px; width: 60%; margin: 0.4rem 0;"></div>
            <div class="shimmer" style="height: 14px; width: 40%; margin-bottom: 0.6rem;"></div>
            <div class="live-rom-card-actions shimmer" style="height: 28px; width: 220px;"></div>
        `;

        // Spinner animation loop
        const spinnerChars = ['[ / ]', '[ - ]', '[ \\ ]', '[ | ]'];
        let spinIdx = 0;
        const spinnerElem = card.querySelector('.term-spinner');
        const spinInterval = setInterval(() => {
            if (spinnerElem && !card.dataset.loaded) {
                spinIdx = (spinIdx + 1) % spinnerChars.length;
                spinnerElem.textContent = spinnerChars[spinIdx];
            } else {
                clearInterval(spinInterval);
            }
        }, 120);

        try {
            const response = await fetch(jsonUrl);
            if (!response.ok) throw new Error('HTTP ' + response.status);
            const data = await response.json();
            
            clearInterval(spinInterval);

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
                    <a href="${downloadUrl}" class="term-btn term-btn--primary" target="_blank" rel="noopener">[ $ wget rom.zip ]</a>
                    <a href="${bootUrl}" class="term-btn" target="_blank" rel="noopener">[ $ wget boot.img ]</a>
                `;
            } else {
                downloadButtonsHtml = `
                    <a href="${downloadUrl}" class="term-btn term-btn--primary" target="_blank" rel="noopener">[ $ wget download ]</a>
                `;
            }

            card.dataset.loaded = 'true';

            // Render loaded TUI state
            card.innerHTML = `
                <div class="live-rom-card-header">
                    <span class="live-rom-card-title">[ BUILD: ${title} ]</span>
                    <span class="live-rom-card-subtitle">[ ${subtitle} ]</span>
                </div>
                <div class="term-line"><span class="term-prompt">$</span> manifest : <span class="term-val" style="color:var(--rom-green)">verified (200 OK)</span></div>
                <div class="term-line"><span class="term-prompt">$</span> package  : <span class="term-file">${filename}</span></div>
                <div class="term-line"><span class="term-prompt">$</span> size     : <span class="term-val">${sizeMB} MB</span></div>
                <div class="term-line"><span class="term-prompt">$</span> version  : <span class="term-val">${version}</span></div>
                <div class="live-rom-card-actions">
                    ${downloadButtonsHtml}
                    <button class="term-btn changelog-btn" type="button">[ $ less notes ]</button>
                    <a href="${installUrl}" class="term-btn">[ $ ./install.sh ]</a>
                </div>
                <div class="dynamic-view-container" style="display:none;"></div>
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
                viewContainer.innerHTML = '<div class="term-line"><span class="term-prompt">$</span> cat changelog.txt | less...</div>';
                try {
                    const clRes = await fetch(changelogUrl);
                    const clText = await clRes.text();
                    viewContainer.innerHTML = `
                        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--rom-border); padding-bottom: 0.5rem; margin-bottom: 0.75rem;">
                            <strong style="color: var(--rom-accent); font-size: 0.78rem;">[ PAGER: ${title} Changelog.txt ]</strong>
                            <button onclick="this.parentElement.parentElement.style.display='none'" style="background:none; border:none; cursor:pointer; color:var(--rom-muted); font-size:0.9rem;">[q: exit]</button>
                        </div>
                        <div class="md-typeset" style="font-size: 0.82em; line-height: 1.6;">${marked.parse(clText)}</div>
                    `;
                } catch (e) {
                    viewContainer.innerHTML = '<div style="color: var(--rom-red); font-size: 0.8rem;">[ERR] failed to fetch changelog.</div>';
                }
            });

        } catch (error) {
            clearInterval(spinInterval);
            const fallbackLink = fallbackDlUrl ? `<a href="${fallbackDlUrl}" class="term-btn term-btn--primary" target="_blank" rel="noopener">[ $ manual dl ]</a>` : '';
            card.innerHTML = `
                <div class="live-rom-card-header">
                    <span class="live-rom-card-title">[ BUILD: ${title} ]</span>
                    <span class="live-rom-card-subtitle">[ ${subtitle} ]</span>
                </div>
                <div class="term-line" style="color: var(--rom-red);">
                    <span class="term-prompt">[!]</span> ERR: failed to fetch manifest (${error.message})
                </div>
                <div class="live-rom-card-actions">
                    ${fallbackLink}
                    <a href="${installUrl}" class="term-btn">[ $ ./install.sh ]</a>
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
