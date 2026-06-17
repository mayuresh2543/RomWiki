document.addEventListener('DOMContentLoaded', () => {
    // 1. Intercept standard github raw links (Legacy behavior)
    const links = document.querySelectorAll('a');
    links.forEach(link => {
        const href = link.href;
        if (!href || !href.includes('raw.githubusercontent.com')) return;
        
        // Skip links that are inside our new live cards
        if (link.closest('.live-rom-card')) return;

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
                    const build = data.response[0];
                    const rawSize = build.size || (build.payload && build.payload[0] ? build.payload[0].FILE_SIZE : null);
                    const sizeMB = rawSize ? (rawSize / (1024 * 1024)).toFixed(2) : "Unknown";
                    let version = build.version;
                    if (!version && build.filename && build.filename.toUpperCase().includes('YAAP')) {
                        const parts = build.filename.split('-');
                        if (parts.length > 1) version = parts[1];
                    }
                    version = version || "N/A";
                    const downloadUrl = build.url || https://github.com/mayuresh-releases/YAAP_stone/releases/latest/download/ + build.filename;
                    viewContainer.innerHTML = 
                        <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                            <strong>Build Information</strong>
                            <button onclick="this.parentElement.parentElement.remove()">&times;</button>
                        </div>
                        <div><strong>File:</strong>  + (build.filename || 'Unknown') + </div>
                        <div><strong>Size:</strong>  + sizeMB +  MB</div>
                        <div><strong>Version:</strong>  + version + </div>
                        <a href=" + downloadUrl + " target="_blank" class="md-button md-button--primary" style="margin-top:1rem;">Download ROM</a>
                    ;
                } else if (href.endsWith('.md') || href.endsWith('.txt')) {
                    const text = await response.text();
                    viewContainer.innerHTML = 
                        <div style="display: flex; justify-content: space-between; margin-bottom: 1rem; border-bottom: 1px solid var(--md-default-fg-color--lightest); padding-bottom: 0.5rem;">
                            <strong> + link.textContent + </strong>
                            <button onclick="this.parentElement.parentElement.remove()" style="background:none; border:none; cursor:pointer; font-size:1.5em;">&times;</button>
                        </div>
                        <div class="md-typeset" style="font-size: 0.85em;"> + marked.parse(text) + </div>
                    ;
                } else {
                    window.open(href, '_blank');
                    viewContainer.remove();
                }
            } catch (error) {
                viewContainer.innerHTML = '<div style="color: #ef4444;">Failed to fetch content: ' + error.message + '</div>';
            }
        });
    });

    // 2. Initialize Live ROM Cards
    const liveCards = document.querySelectorAll('.live-rom-card');
    liveCards.forEach(async (card) => {
        const title = card.getAttribute('data-title');
        const subtitle = card.getAttribute('data-subtitle');
        const jsonUrl = card.getAttribute('data-json');
        const changelogUrl = card.getAttribute('data-changelog');
        const installUrl = card.getAttribute('data-install');
        const fallbackDlUrl = card.getAttribute('data-fallback-dl');

        // Initial skeleton state
        card.innerHTML = 
            <div class="live-rom-card-header">
                <div>
                    <h3 class="live-rom-card-title"> + title + </h3>
                    <div class="live-rom-card-subtitle"> + subtitle + </div>
                </div>
                <div class="live-rom-card-loader"></div>
            </div>
            <div class="live-rom-card-info-container shimmer">
                <div style="height: 48px;"></div>
            </div>
            <div class="live-rom-card-actions shimmer" style="height: 36px; border-radius: 0.1rem;"></div>
        ;

        try {
            const response = await fetch(jsonUrl);
            if (!response.ok) throw new Error('Failed to load JSON');
            const data = await response.json();
            const build = data.response[0];
            
            const rawSize = build.size || (build.payload && build.payload[0] ? build.payload[0].FILE_SIZE : null);
            const sizeMB = rawSize ? (rawSize / (1024 * 1024)).toFixed(2) : "Unknown";
            
            let version = build.version;
            if (!version && build.filename && build.filename.toUpperCase().includes('YAAP')) {
                const parts = build.filename.split('-');
                if (parts.length > 1) version = parts[1];
            }
            version = version || "N/A";
            const downloadUrl = build.url || fallbackDlUrl + build.filename;
            const filename = build.filename || "Unknown";

            // Render loaded state
            card.innerHTML = 
                <div class="live-rom-card-header">
                    <div>
                        <h3 class="live-rom-card-title"> + title + </h3>
                        <div class="live-rom-card-subtitle"> + subtitle + </div>
                    </div>
                </div>
                <div class="live-rom-card-info-container">
                    <div class="live-rom-card-label">LATEST BUILD</div>
                    <div class="live-rom-card-filename"> + filename + </div>
                    <div class="live-rom-card-info-row">
                        <div style="display:flex; flex-direction:column;">
                            <span class="live-rom-card-label">SIZE</span>
                            <span class="live-rom-card-value"> + sizeMB +  MB</span>
                        </div>
                        <div style="display:flex; flex-direction:column; text-align:right;">
                            <span class="live-rom-card-label">VERSION</span>
                            <span class="live-rom-card-value"> + version + </span>
                        </div>
                    </div>
                </div>
                <div class="live-rom-card-actions">
                    <a href=" + downloadUrl + " class="md-button md-button--primary">Download</a>
                    <button class="md-button changelog-btn">Changelog</button>
                    <a href=" + installUrl + " class="md-button">Install Guide</a>
                </div>
                <div class="dynamic-view-container" style="display:none; margin-top:1rem;"></div>
            ;

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
                    viewContainer.innerHTML = 
                        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--md-default-fg-color--lightest); padding-bottom: 0.5rem; margin-bottom: 1rem;">
                            <strong>Release Notes</strong>
                            <button onclick="this.parentElement.parentElement.style.display='none'" style="background:none; border:none; cursor:pointer; font-size:1.5em;">&times;</button>
                        </div>
                        <div class="md-typeset" style="font-size: 0.85em;"> + marked.parse(clText) + </div>
                    ;
                } catch (e) {
                    viewContainer.innerHTML = '<div style="color: #ef4444;">Failed to fetch changelog.</div>';
                }
            });

        } catch (error) {
            // Render error state
            card.innerHTML = 
                <div class="live-rom-card-header">
                    <div>
                        <h3 class="live-rom-card-title"> + title + </h3>
                        <div class="live-rom-card-subtitle"> + subtitle + </div>
                    </div>
                </div>
                <div class="live-rom-card-info-container" style="text-align: center; color: var(--md-typeset-color);">
                    <div style="color: #ef4444; font-weight: bold; margin-bottom: 0.5rem;">Failed to fetch latest build info</div>
                    <div style="font-size: 0.8em; opacity: 0.7;"> + error.message + </div>
                </div>
            ;
        }
    });
});
