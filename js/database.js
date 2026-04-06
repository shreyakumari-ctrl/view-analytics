// ============================================================
// database.js — LocalStorage-Powered SaaS Database Engine
// ============================================================

const DB = (() => {
    const KEYS = {
        USERS: 'usersDatabase',
        CURRENT_USER: 'currentUser',
        SETTINGS: 'settings',
        NOTIFICATIONS: 'notifications',
        ACTIVITY_LOG: 'activityLog',
    };

    // ── Seed data for a fresh install ──────────────────────────
    const SEED_USERS = [
        {
            id: 'user001',
            name: 'Shreya Sharma',
            email: 'shreya@mytube.com',
            password: 'password123',
            avatar: 'https://i.pravatar.cc/150?img=47',
            joinDate: '2024-01-15',
            channel: 'Shreya Codes',
            subscribers: 45200,
            videos: _generateSeedVideos('user001'),
        },
    ];

    function _generateSeedVideos(userId) {
        const now = new Date('2026-02-26');
        const titles = [
            'Complete React Course for Beginners 2025',
            'CSS Grid & Flexbox Mastery',
            'JavaScript Array Methods Deep Dive',
            'Build a Full Stack App with Node.js',
            'TypeScript Crash Course',
            'Vue.js 3 Composition API',
            'Python for Web Developers',
            'Docker & Kubernetes Essentials',
        ];
        const thumbs = [
            'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=400&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1544256718-3bcf237f3974?w=400&auto=format&fit=crop',
        ];
        const types = ['video', 'video', 'short', 'video', 'short', 'video', 'video', 'short'];

        return titles.map((title, i) => {
            const daysAgo = (i + 1) * 18;
            const date = new Date(now);
            date.setDate(date.getDate() - daysAgo);
            const views = Math.floor(Math.random() * 200000) + 8000;
            const likes = Math.floor(views * (0.06 + Math.random() * 0.04));
            const comments = Math.floor(likes * (0.1 + Math.random() * 0.08));
            const shares = Math.floor(likes * 0.05);
            const impressions = Math.floor(views * (2 + Math.random()));
            const watchTime = Math.floor(views * (3 + Math.random() * 5));
            const cpm = 2.5 + Math.random() * 3;
            return {
                id: `vid_${userId}_${i + 1}`,
                title,
                thumbnail: thumbs[i],
                type: types[i],
                visibility: 'public',
                monetized: i % 3 !== 0,
                uploadDate: date.toISOString().split('T')[0],
                views,
                likes,
                comments,
                shares,
                impressions,
                watchTime,
                avgViewDuration: parseFloat((2 + Math.random() * 6).toFixed(1)),
                ctr: parseFloat((3 + Math.random() * 6).toFixed(1)),
                revenue: parseFloat(((views / 1000) * cpm).toFixed(2)),
                cpm: parseFloat(cpm.toFixed(2)),
                trafficSources: {
                    search: Math.floor(Math.random() * 40) + 20,
                    suggested: Math.floor(Math.random() * 30) + 15,
                    direct: Math.floor(Math.random() * 20) + 5,
                    external: Math.floor(Math.random() * 15) + 5,
                },
                audience: {
                    age13_17: Math.floor(Math.random() * 10) + 5,
                    age18_24: Math.floor(Math.random() * 20) + 25,
                    age25_34: Math.floor(Math.random() * 15) + 25,
                    age35_44: Math.floor(Math.random() * 10) + 12,
                    age45_plus: Math.floor(Math.random() * 8) + 5,
                },
                topCountries: ['India', 'USA', 'UK', 'Canada', 'Australia'],
                devices: {
                    mobile: Math.floor(Math.random() * 20) + 45,
                    desktop: Math.floor(Math.random() * 15) + 30,
                    tablet: Math.floor(Math.random() * 10) + 5,
                    tv: Math.floor(Math.random() * 5) + 2,
                },
            };
        });
    }

    // ── Initialization ──────────────────────────────────────────
    function init() {
        if (!localStorage.getItem(KEYS.USERS)) {
            localStorage.setItem(KEYS.USERS, JSON.stringify(SEED_USERS));
        }
        if (!localStorage.getItem(KEYS.SETTINGS)) {
            localStorage.setItem(KEYS.SETTINGS, JSON.stringify({ theme: 'light', sidebarCollapsed: false }));
        }
        if (!localStorage.getItem(KEYS.NOTIFICATIONS)) {
            localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(_defaultNotifications()));
        }
        if (!localStorage.getItem(KEYS.ACTIVITY_LOG)) {
            localStorage.setItem(KEYS.ACTIVITY_LOG, JSON.stringify(_defaultActivityLog()));
        }
    }

    function _defaultNotifications() {
        return [
            { id: 'n1', type: 'milestone', message: 'Congratulations! You hit 45K subscribers!', time: '2 hours ago', read: false, icon: 'fa-trophy' },
            { id: 'n2', type: 'comment', message: 'New comment on "Complete React Course"', time: '5 hours ago', read: false, icon: 'fa-comment' },
            { id: 'n3', type: 'revenue', message: 'Your monthly revenue report is ready', time: '1 day ago', read: false, icon: 'fa-dollar-sign' },
            { id: 'n4', type: 'upload', message: 'Video "TypeScript Crash Course" uploaded successfully', time: '2 days ago', read: true, icon: 'fa-video' },
            { id: 'n5', type: 'alert', message: 'Your engagement rate dropped 3% this week', time: '3 days ago', read: true, icon: 'fa-triangle-exclamation' },
        ];
    }

    function _defaultActivityLog() {
        return [
            { id: 'a1', action: 'Uploaded video', detail: 'Docker & Kubernetes Essentials', time: '18 days ago' },
            { id: 'a2', action: 'Edited video', detail: 'Python for Web Developers', time: '36 days ago' },
            { id: 'a3', action: 'Deleted video', detail: 'Old Tutorial Draft', time: '54 days ago' },
        ];
    }

    // ── CRUD Helpers ────────────────────────────────────────────
    function _getUsers() {
        return JSON.parse(localStorage.getItem(KEYS.USERS)) || [];
    }

    function _saveUsers(users) {
        localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    }

    // ── User / Auth ─────────────────────────────────────────────
    function createUser(name, email, password) {
        const users = _getUsers();
        if (users.find(u => u.email === email)) {
            return { success: false, error: 'Email already registered.' };
        }
        const newUser = {
            id: 'user_' + Date.now(),
            name,
            email,
            password,
            avatar: `https://i.pravatar.cc/150?u=${email}`,
            joinDate: new Date().toISOString().split('T')[0],
            channel: name + '\'s Channel',
            subscribers: 0,
            videos: [],
        };
        users.push(newUser);
        _saveUsers(users);
        return { success: true, user: newUser };
    }

    function loginUser(email, password) {
        const users = _getUsers();
        const user = users.find(u => u.email === email && u.password === password);
        if (!user) return { success: false, error: 'Invalid email or password.' };
        const sessionUser = { ...user };
        delete sessionUser.password;
        localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(sessionUser));
        return { success: true, user: sessionUser };
    }

    function logoutUser() {
        localStorage.removeItem(KEYS.CURRENT_USER);
    }

    function getCurrentUser() {
        const sessionUser = JSON.parse(localStorage.getItem(KEYS.CURRENT_USER));
        if (!sessionUser) return null;
        // Always fetch freshest data from the main users table
        const users = _getUsers();
        const user = users.find(u => u.id === sessionUser.id);
        if (user) {
            const freshSession = { ...user };
            delete freshSession.password;
            return freshSession;
        }
        return sessionUser;
    }

    function updateUser(userId, updates) {
        const users = _getUsers();
        const idx = users.findIndex(u => u.id === userId);
        if (idx === -1) return { success: false, error: 'User not found.' };

        users[idx] = { ...users[idx], ...updates };
        _saveUsers(users);

        // Also update session if it's the current user
        const currentUser = getCurrentUser();
        if (currentUser && currentUser.id === userId) {
            const sessionUser = { ...users[idx] };
            delete sessionUser.password;
            localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(sessionUser));
        }

        return { success: true, user: users[idx] };
    }

    function isLoggedIn() {
        return !!getCurrentUser();
    }

    // ── Video CRUD ──────────────────────────────────────────────
    function _getUserFromDB(userId) {
        const users = _getUsers();
        return users.find(u => u.id === userId);
    }

    function getVideos(userId) {
        const user = _getUserFromDB(userId);
        return user ? user.videos : [];
    }

    function addVideo(userId, videoData) {
        const users = _getUsers();
        const idx = users.findIndex(u => u.id === userId);
        if (idx === -1) return null;
        const video = {
            id: 'vid_' + Date.now(),
            uploadDate: new Date().toISOString().split('T')[0],
            visibility: 'public',
            monetized: true,
            views: Math.floor(Math.random() * 5000),
            likes: 0,
            comments: 0,
            shares: 0,
            impressions: 0,
            watchTime: 0,
            avgViewDuration: 0,
            ctr: 0,
            cpm: 3.5,
            revenue: 0,
            trafficSources: { search: 40, suggested: 30, direct: 20, external: 10 },
            audience: { age13_17: 8, age18_24: 40, age25_34: 30, age35_44: 14, age45_plus: 8 },
            topCountries: ['India', 'USA', 'UK', 'Canada', 'Australia'],
            devices: { mobile: 55, desktop: 35, tablet: 7, tv: 3 },
            ...videoData,
        };
        users[idx].videos.unshift(video);
        _saveUsers(users);
        _logActivity(userId, 'Uploaded video', video.title);
        return video;
    }

    function updateVideo(userId, videoId, updates) {
        const users = _getUsers();
        const uIdx = users.findIndex(u => u.id === userId);
        if (uIdx === -1) return null;
        const vIdx = users[uIdx].videos.findIndex(v => v.id === videoId);
        if (vIdx === -1) return null;
        users[uIdx].videos[vIdx] = { ...users[uIdx].videos[vIdx], ...updates };
        _saveUsers(users);
        _logActivity(userId, 'Edited video', users[uIdx].videos[vIdx].title);
        return users[uIdx].videos[vIdx];
    }

    function deleteVideo(userId, videoId) {
        const users = _getUsers();
        const uIdx = users.findIndex(u => u.id === userId);
        if (uIdx === -1) return false;
        const video = users[uIdx].videos.find(v => v.id === videoId);
        users[uIdx].videos = users[uIdx].videos.filter(v => v.id !== videoId);
        _saveUsers(users);
        if (video) _logActivity(userId, 'Deleted video', video.title);
        return true;
    }

    // ── Settings ────────────────────────────────────────────────
    function getSettings() {
        return JSON.parse(localStorage.getItem(KEYS.SETTINGS)) || {};
    }

    function saveSettings(settings) {
        localStorage.setItem(KEYS.SETTINGS, JSON.stringify({ ...getSettings(), ...settings }));
    }

    // ── Notifications ───────────────────────────────────────────
    function getNotifications() {
        return JSON.parse(localStorage.getItem(KEYS.NOTIFICATIONS)) || [];
    }

    function markNotificationRead(id) {
        const notifs = getNotifications();
        const n = notifs.find(n => n.id === id);
        if (n) n.read = true;
        localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(notifs));
    }

    function markAllNotificationsRead() {
        const notifs = getNotifications().map(n => ({ ...n, read: true }));
        localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(notifs));
    }

    function getUnreadCount() {
        return getNotifications().filter(n => !n.read).length;
    }

    // ── Activity Log ────────────────────────────────────────────
    function _logActivity(userId, action, detail) {
        const log = JSON.parse(localStorage.getItem(KEYS.ACTIVITY_LOG)) || [];
        log.unshift({ id: 'a_' + Date.now(), action, detail, time: 'just now' });
        if (log.length > 50) log.splice(50);
        localStorage.setItem(KEYS.ACTIVITY_LOG, JSON.stringify(log));
    }

    function getActivityLog() {
        return JSON.parse(localStorage.getItem(KEYS.ACTIVITY_LOG)) || [];
    }

    // ── Analytics Engine ────────────────────────────────────────
    function filterVideosByRange(videos, range) {
        const now = new Date('2026-02-26');
        let cutoff;
        if (range === '7') cutoff = 7;
        else if (range === '28') cutoff = 28;
        else if (range === '90') cutoff = 90;
        else if (range === '365') cutoff = 365;
        else return videos; // lifetime

        const cutoffDate = new Date(now);
        cutoffDate.setDate(cutoffDate.getDate() - cutoff);
        return videos.filter(v => new Date(v.uploadDate) >= cutoffDate);
    }

    function calcKPIs(videos) {
        const totalViews = videos.reduce((s, v) => s + v.views, 0);
        const totalLikes = videos.reduce((s, v) => s + v.likes, 0);
        const totalComments = videos.reduce((s, v) => s + v.comments, 0);
        const totalShares = videos.reduce((s, v) => s + v.shares, 0);
        const totalWatchTime = videos.reduce((s, v) => s + v.watchTime, 0);
        const totalRevenue = videos.reduce((s, v) => s + (v.monetized ? v.revenue : 0), 0);
        const totalImpressions = videos.reduce((s, v) => s + v.impressions, 0);
        const engagementRate = totalViews > 0
            ? (((totalLikes + totalComments + totalShares) / totalViews) * 100).toFixed(2)
            : 0;
        const avgCTR = totalImpressions > 0
            ? ((totalViews / totalImpressions) * 100).toFixed(1)
            : 0;
        const avgDuration = videos.length > 0
            ? (videos.reduce((s, v) => s + v.avgViewDuration, 0) / videos.length).toFixed(1)
            : 0;
        return {
            totalViews, totalLikes, totalComments, totalShares,
            totalWatchTime, totalRevenue, totalImpressions,
            engagementRate, avgCTR, avgDuration,
            videoCount: videos.length,
        };
    }

    function getTopVideo(videos) {
        if (!videos.length) return null;
        return videos.reduce((top, v) => v.views > top.views ? v : top, videos[0]);
    }

    function getLeastVideo(videos) {
        if (!videos.length) return null;
        return videos.reduce((bot, v) => v.views < bot.views ? v : bot, videos[0]);
    }

    function getAudienceAggregates(videos) {
        if (!videos.length) return {};
        const agg = { age13_17: 0, age18_24: 0, age25_34: 0, age35_44: 0, age45_plus: 0 };
        videos.forEach(v => {
            Object.keys(agg).forEach(k => { agg[k] += (v.audience[k] || 0); });
        });
        const total = Object.values(agg).reduce((s, x) => s + x, 0);
        Object.keys(agg).forEach(k => { agg[k] = total > 0 ? Math.round((agg[k] / total) * 100) : 0; });
        return agg;
    }

    function getTrafficAggregates(videos) {
        if (!videos.length) return {};
        const agg = { search: 0, suggested: 0, direct: 0, external: 0 };
        videos.forEach(v => {
            Object.keys(agg).forEach(k => { agg[k] += (v.trafficSources[k] || 0); });
        });
        const total = Object.values(agg).reduce((s, x) => s + x, 0);
        Object.keys(agg).forEach(k => { agg[k] = total > 0 ? Math.round((agg[k] / total) * 100) : 0; });
        return agg;
    }

    function getDeviceAggregates(videos) {
        if (!videos.length) return {};
        const agg = { mobile: 0, desktop: 0, tablet: 0, tv: 0 };
        videos.forEach(v => {
            Object.keys(agg).forEach(k => { agg[k] += (v.devices[k] || 0); });
        });
        const total = Object.values(agg).reduce((s, x) => s + x, 0);
        Object.keys(agg).forEach(k => { agg[k] = total > 0 ? Math.round((agg[k] / total) * 100) : 0; });
        return agg;
    }

    function getMonthlyRevenue(videos) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const data = Array(12).fill(0);
        videos.forEach(v => {
            const m = new Date(v.uploadDate).getMonth();
            if (v.monetized) data[m] += v.revenue;
        });
        return { labels: months, data: data.map(d => parseFloat(d.toFixed(2))) };
    }

    function getViewsOverTime(videos, days) {
        const labels = [];
        const data = [];
        const now = new Date('2026-02-26');
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const label = `${d.getDate()}/${d.getMonth() + 1}`;
            labels.push(label);
            // Simulate daily views based on videos
            const baseViews = videos.reduce((s, v) => s + Math.floor(v.views / days), 0);
            data.push(baseViews + Math.floor(Math.random() * baseViews * 0.3));
        }
        return { labels, data };
    }

    // ── Formatters ───────────────────────────────────────────────
    function formatNum(n) {
        if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
        if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
        return n.toString();
    }

    function formatCurrency(n) {
        return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }

    function formatTime(mins) {
        if (mins >= 60) return (mins / 60).toFixed(1) + ' hrs';
        return mins + ' min';
    }

    return {
        init,
        KEYS,
        // Auth
        createUser, loginUser, logoutUser, getCurrentUser, isLoggedIn, updateUser,
        // Videos
        getVideos, addVideo, updateVideo, deleteVideo,
        // Settings
        getSettings, saveSettings,
        // Notifications
        getNotifications, markNotificationRead, markAllNotificationsRead, getUnreadCount,
        // Activity
        getActivityLog,
        // Analytics
        filterVideosByRange, calcKPIs, getTopVideo, getLeastVideo,
        getAudienceAggregates, getTrafficAggregates, getDeviceAggregates,
        getMonthlyRevenue, getViewsOverTime,
        // Formatters
        formatNum, formatCurrency, formatTime,
    };
})();
