// External module script test
window.__externalModuleTest = 'EXTERNAL_MODULE_EXECUTED';

// Try to update status after DOM is ready
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    const status = document.getElementById('status');
    if (status) status.textContent = 'External module script ran!';
} else {
    document.addEventListener('DOMContentLoaded', () => {
        const status = document.getElementById('status');
        if (status) status.textContent = 'External module script ran!';
    });
}

console.log('EXTERNAL MODULE TEST LOG');