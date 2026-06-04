document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('a');
    
    links.forEach(link => {
        const href = link.href;
        
        // Only intercept github raw links
        if (!href || !href.includes('raw.githubusercontent.com')) return;

        link.addEventListener('click', async (e) => {
            e.preventDefault();

            // Toggle logic: if already open, close it.
            if (link.nextElementSibling && link.nextElementSibling.classList.contains('dynamic-view-container')) {
                link.nextElementSibling.remove();
                return;
            }

            // Create the container with MkDocs Material styling
            const viewContainer = document.createElement('div');
            viewContainer.className = 'dynamic-view-container';
            viewContainer.style.marginTop = '1rem';
            viewContainer.style.padding = '1.25rem';
            viewContainer.style.backgroundColor = 'var(--md-default-bg-color--light)';
            viewContainer.style.border = '1px solid var(--md-default-fg-color--lightest)';
            viewContainer.style.borderLeft = '4px solid var(--md-primary-fg-color)';
            viewContainer.style.borderRadius = '0.2rem';
            viewContainer.innerHTML = '<div style="color: var(--md-typeset-color);">Fetching data...</div>';
            
            // Insert after the button/link
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
                        if (parts.length > 1) {
                            version = parts[1];
                        }
                    }
                    version = version || "N/A";
                    
                    // Fallback URL if JSON doesn't provide one (like YAAP OTA JSONs)
                    const downloadUrl = build.url || `https://github.com/mayuresh-releases/YAAP_stone/releases/latest/download/${build.filename}`;
                    
                    viewContainer.innerHTML = `
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                            <strong style="font-size: 1.1em; color: var(--md-typeset-color);">Build Information</strong>
                            <button onclick="this.parentElement.parentElement.remove()" style="background:none; border:none; color:inherit; cursor:pointer; font-size:1.5em; padding: 0 0.5rem;">&times;</button>
                        </div>
                        <div style="margin-bottom: 0.5rem; color: var(--md-typeset-color);"><strong>File:</strong> ${build.filename || 'Unknown'}</div>
                        <div style="margin-bottom: 0.5rem; color: var(--md-typeset-color);"><strong>Size:</strong> ${sizeMB} MB</div>
                        <div style="margin-bottom: 1rem; color: var(--md-typeset-color);"><strong>Version:</strong> ${version}</div>
                        <a href="${downloadUrl}" target="_blank" class="md-button md-button--primary">Download ROM</a>
                    `;
                } else if (href.endsWith('.md') || href.endsWith('.txt')) {
                    const text = await response.text();
                    viewContainer.innerHTML = `
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; border-bottom: 1px solid var(--md-default-fg-color--lightest); padding-bottom: 0.5rem;">
                            <strong style="font-size: 1.1em; color: var(--md-typeset-color);">${link.textContent}</strong>
                            <button onclick="this.parentElement.parentElement.remove()" style="background:none; border:none; color:inherit; cursor:pointer; font-size:1.5em; padding: 0 0.5rem;">&times;</button>
                        </div>
                        <div class="md-typeset" style="font-size: 0.85em;">
                            ${marked.parse(text)}
                        </div>
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
});
