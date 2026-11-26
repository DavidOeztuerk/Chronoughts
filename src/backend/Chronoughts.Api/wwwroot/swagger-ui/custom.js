// Chronoughts API - Custom Swagger UI JavaScript

// Wait for Swagger UI to load
window.addEventListener('load', function() {
    // Add custom title animation
    setTimeout(() => {
        const title = document.querySelector('.swagger-ui .info .title');
        if (title) {
            title.style.transition = 'all 0.3s ease';
            title.addEventListener('mouseenter', function() {
                this.style.transform = 'scale(1.05)';
            });
            title.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1)';
            });
        }

        // Add brain emoji to section headers
        const tags = document.querySelectorAll('.swagger-ui .opblock-tag');
        tags.forEach(tag => {
            if (!tag.textContent.includes('🧠')) {
                const text = tag.textContent;
                if (text.includes('Thought')) {
                    tag.innerHTML = '🧠 ' + tag.innerHTML;
                } else if (text.includes('Connection')) {
                    tag.innerHTML = '🔗 ' + tag.innerHTML;
                } else if (text.includes('Task')) {
                    tag.innerHTML = '📋 ' + tag.innerHTML;
                }
            }
        });

        // Add tooltips for better UX
        const methods = document.querySelectorAll('.swagger-ui .opblock-summary-method');
        methods.forEach(method => {
            method.title = {
                'GET': 'Retrieve data',
                'POST': 'Create new resource',
                'PUT': 'Update existing resource',
                'DELETE': 'Remove resource'
            }[method.textContent] || '';
        });

        // Custom console message
        console.log('%c🧠 Chronoughts API', 
            'color: #6B46C1; font-size: 24px; font-weight: bold;');
        console.log('%cDigitale Gedankenverwaltung der nächsten Generation', 
            'color: #9333EA; font-size: 14px;');
        console.log('%cVersion 1.0.0 | Ready to capture your thoughts!', 
            'color: #A855F7; font-size: 12px;');
    }, 500);

    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl+K to focus search
        if (e.ctrlKey && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.querySelector('.swagger-ui .filter input');
            if (searchInput) {
                searchInput.focus();
            }
        }
        
        // Ctrl+E to expand all operations
        if (e.ctrlKey && e.key === 'e') {
            e.preventDefault();
            const expandButtons = document.querySelectorAll('.swagger-ui .expand-operation');
            expandButtons.forEach(btn => btn.click());
        }
    });

    // Add timestamp to responses
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        const startTime = performance.now();
        return originalFetch.apply(this, args).then(response => {
            const endTime = performance.now();
            const duration = (endTime - startTime).toFixed(2);
            console.log(`%c⚡ API Response Time: ${duration}ms`, 'color: #10B981;');
            return response;
        });
    };
});