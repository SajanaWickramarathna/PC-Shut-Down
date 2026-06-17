document.addEventListener('DOMContentLoaded', async () => {
    const ipElement = document.getElementById('ip-address');
    const portElement = document.getElementById('port-number');
    const keyElement = document.getElementById('api-key');
    const resetBtn = document.getElementById('reset-btn');

    // Fetch initial info
    const info = await window.api.getInfo();
    ipElement.textContent = info.ip;
    portElement.textContent = info.port;
    keyElement.textContent = info.apiKey;

    // Handle reset
    resetBtn.addEventListener('click', async () => {
        resetBtn.disabled = true;
        resetBtn.textContent = 'Generating...';
        
        const newKey = await window.api.resetApiKey();
        
        // Add a tiny delay for visual effect
        setTimeout(() => {
            keyElement.textContent = newKey;
            
            // Add a brief highlight animation
            keyElement.style.color = '#fff';
            setTimeout(() => {
                keyElement.style.color = '#eab308';
            }, 300);

            resetBtn.textContent = 'Generate New Key';
            resetBtn.disabled = false;
        }, 400);
    });
});
