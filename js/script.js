// script.js

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    // --- Sidebar Toggle Logic ---
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            // Check if mobile view
            if (window.innerWidth <= 900) {
                sidebar.classList.toggle('mobile-open');
                sidebar.classList.remove('collapsed');
            } else {
                sidebar.classList.toggle('collapsed');
                sidebar.classList.remove('mobile-open');
            }
        });
    }

    // Close sidebar on mobile when clicking outside
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 900 && sidebar && sidebarToggle) {
            if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
                sidebar.classList.remove('mobile-open');
            }
        }
    });

    // Handle window resize for sidebar
    window.addEventListener('resize', () => {
        if (window.innerWidth > 900 && sidebar) {
            sidebar.classList.remove('mobile-open');
        } else if (sidebar && sidebar.classList.contains('collapsed')) {
            sidebar.classList.remove('collapsed');
        }
    });


    // --- Dark Mode Toggle Logic ---
    // Check local storage for theme preference
    const savedTheme = localStorage.getItem('theme');
    const themeIcon = themeToggle ? themeToggle.querySelector('i') : null;

    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
        if (themeIcon) {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        }
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            const isDark = body.classList.contains('dark-mode');
            
            // Save preference
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            
            // Toggle icon
            if (themeIcon) {
                if (isDark) {
                    themeIcon.classList.remove('fa-moon');
                    themeIcon.classList.add('fa-sun');
                } else {
                    themeIcon.classList.remove('fa-sun');
                    themeIcon.classList.add('fa-moon');
                }
            }
        });
    }

    // --- Highlight Active Nav Link ---
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Simple logic to set active class based on URL
    if (navLinks.length > 0) {
        navLinks.forEach(link => {
            // Remove active from all first
            link.classList.remove('active');
            
            const href = link.getAttribute('href');
            // Check if current path includes the href (simplistic router)
            if (href && href !== '#' && currentPath.includes(href)) {
                link.classList.add('active');
            } else if (currentPath === '/' && href === 'index.html') {
                // Handle root url
                link.classList.add('active');
            }
        });
        
        // Handle URL parameters for tabs (like ?tab=shorts)
        const urlParams = new URLSearchParams(window.location.search);
        const tabList = urlParams.get('tab');
        
        if (tabList === 'shorts') {
             navLinks.forEach(link => {
                 link.classList.remove('active');
                 if(link.getAttribute('href') === 'videos.html?tab=shorts') {
                     link.classList.add('active');
                 }
             });
        }
    }
});
