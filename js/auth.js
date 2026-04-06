// ============================================================
// auth.js — Authentication Guard & UI sync
// ============================================================

(function () {
    'use strict';

    DB.init(); // ensure storage is seeded

    const PUBLIC_PAGES = ['login.html'];
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const isPublic = PUBLIC_PAGES.some(p => currentPage.includes(p));

    // Redirect to login if not authenticated on protected pages
    if (!isPublic && !DB.isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }

    // Redirect logged-in users away from login page
    if (isPublic && DB.isLoggedIn()) {
        window.location.href = 'index.html';
        return;
    }

    // ── Populate navbar with real user data ──────────────────────
    function populateNavbar() {
        const user = DB.getCurrentUser();
        if (!user) return;

        const avatarEl = document.getElementById('nav-avatar');
        const userNameEl = document.getElementById('nav-username');
        const channelEl = document.getElementById('nav-channel');

        if (avatarEl && user.avatar) avatarEl.src = user.avatar;
        if (userNameEl) userNameEl.textContent = user.name;
        if (channelEl) channelEl.textContent = user.channel;

        const badge = document.getElementById('notif-badge');
        const count = DB.getUnreadCount();
        if (badge) {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
    }

    // ── Theme Persistence ────────────────────────────────────────
    function applyTheme() {
        const settings = DB.getSettings();
        if (settings.theme === 'dark') {
            document.body.classList.add('dark-mode');
            const icon = document.querySelector('#theme-toggle i');
            if (icon) { icon.classList.remove('fa-moon'); icon.classList.add('fa-sun'); }
        }
    }

    // ── Sidebar Toggle ───────────────────────────────────────────
    function initSidebar() {
        const toggle = document.getElementById('sidebar-toggle');
        const sidebar = document.getElementById('sidebar');
        if (!toggle || !sidebar) return;

        const settings = DB.getSettings();
        if (settings.sidebarCollapsed && window.innerWidth > 900) {
            sidebar.classList.add('collapsed');
        }

        toggle.addEventListener('click', () => {
            if (window.innerWidth <= 900) {
                sidebar.classList.toggle('mobile-open');
            } else {
                sidebar.classList.toggle('collapsed');
                DB.saveSettings({ sidebarCollapsed: sidebar.classList.contains('collapsed') });
            }
        });

        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 900 && sidebar && toggle) {
                if (!sidebar.contains(e.target) && !toggle.contains(e.target)) {
                    sidebar.classList.remove('mobile-open');
                }
            }
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 900) sidebar.classList.remove('mobile-open');
        });
    }

    // ── Theme Toggle ─────────────────────────────────────────────
    function initThemeToggle() {
        const btn = document.getElementById('theme-toggle');
        if (!btn) return;
        btn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            DB.saveSettings({ theme: isDark ? 'dark' : 'light' });
            const icon = btn.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-moon', !isDark);
                icon.classList.toggle('fa-sun', isDark);
            }
            // Dispatch event so charts can update
            document.dispatchEvent(new CustomEvent('themeChanged', { detail: { isDark } }));
        });
    }

    // ── Logout button ────────────────────────────────────────────
    function initLogout() {
        const btns = document.querySelectorAll('.logout-btn');
        btns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                DB.logoutUser();
                window.location.href = 'login.html';
            });
        });
    }

    // ── Active nav link ──────────────────────────────────────────
    function highlightNav() {
        const page = window.location.pathname.split('/').pop() || 'index.html';
        const search = window.location.search;
        document.querySelectorAll('.nav-link').forEach(link => {
            const href = link.getAttribute('href');
            if (!href || href === '#') return;
            link.classList.remove('active');
            if (href.includes('?')) {
                if (page + search === href || (page + search).startsWith(href)) {
                    link.classList.add('active');
                }
            } else if (href === page) {
                link.classList.add('active');
            }
        });
    }

    // ── Notification Panel ───────────────────────────────────────
    function initNotifications() {
        const notifBtn = document.getElementById('notif-btn');
        const notifPanel = document.getElementById('notif-panel');
        if (!notifBtn || !notifPanel) return;

        notifBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = notifPanel.classList.toggle('open');
            if (isOpen) renderNotifications();
        });

        document.addEventListener('click', (e) => {
            if (!notifPanel.contains(e.target) && e.target !== notifBtn) {
                notifPanel.classList.remove('open');
            }
        });

        document.getElementById('mark-all-read')?.addEventListener('click', () => {
            DB.markAllNotificationsRead();
            renderNotifications();
            const badge = document.getElementById('notif-badge');
            if (badge) badge.style.display = 'none';
        });
    }

    function renderNotifications() {
        const list = document.getElementById('notif-list');
        if (!list) return;
        const notifs = DB.getNotifications();
        list.innerHTML = notifs.map(n => `
            <div class="notif-item ${n.read ? '' : 'unread'}" data-id="${n.id}">
                <div class="notif-icon-wrap"><i class="fa-solid ${n.icon}"></i></div>
                <div class="notif-body">
                    <p>${n.message}</p>
                    <span class="notif-time">${n.time}</span>
                </div>
                ${!n.read ? '<span class="notif-dot"></span>' : ''}
            </div>
        `).join('');

        list.querySelectorAll('.notif-item').forEach(el => {
            el.addEventListener('click', () => {
                DB.markNotificationRead(el.dataset.id);
                el.classList.remove('unread');
                el.querySelector('.notif-dot')?.remove();
                const badge = document.getElementById('notif-badge');
                const count = DB.getUnreadCount();
                if (badge) {
                    badge.textContent = count;
                    badge.style.display = count > 0 ? 'flex' : 'none';
                }
            });
        });
    }

    // ── Global Search Bar ────────────────────────────────────────
    function initGlobalSearch() {
        // Find any input inside a .search-bar. Note: on videos.html this exists too.
        // But on videos.html, we don't necessarily want to redirect if they are already on the page.
        // Actually, videos.html has its own listener that works instantly on input.
        const page = window.location.pathname.split('/').pop() || 'index.html';
        const searchInput = document.querySelector('.search-bar input');

        if (!searchInput) return;

        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const query = e.target.value.trim();
                // If we are NOT on videos.html, redirect
                if (!page.includes('videos.html')) {
                    if (query) {
                        window.location.href = `videos.html?search=${encodeURIComponent(query)}`;
                    } else {
                        window.location.href = 'videos.html';
                    }
                }
            }
        });
    }

    // ── Run on DOM ready ─────────────────────────────────────────
    document.addEventListener('DOMContentLoaded', () => {
        applyTheme();
        initSidebar();
        initThemeToggle();
        initLogout();
        populateNavbar();
        highlightNav();
        initNotifications();
        initGlobalSearch();
    });
})();
