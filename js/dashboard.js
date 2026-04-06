// dashboard.js — Main dashboard logic
'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const user = DB.getCurrentUser();
    if (!user) return;

    let videos = DB.getVideos(user.id);
    let filteredVideos = videos;
    let viewsChart, trafficChart;

    // ── Greeting & date ──────────────────────────────────────────
    const hour = new Date().getHours();
    const greet = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
    document.getElementById('dashboard-greeting').textContent = `${greet}, ${user.name.split(' ')[0]} 👋`;
    document.getElementById('dashboard-date').textContent = new Date('2026-02-26').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // ── Time filter ──────────────────────────────────────────────
    const timeFilter = document.getElementById('time-filter');
    timeFilter?.addEventListener('change', () => {
        filteredVideos = DB.filterVideosByRange(videos, timeFilter.value);
        renderKPIs();
        updateCharts();
        renderInsights();
        renderRecentVideos();
    });

    // ── Skeleton → Real cards ────────────────────────────────────
    function renderKPIs() {
        const kpis = DB.calcKPIs(filteredVideos);
        const grid = document.getElementById('kpi-grid');
        if (!grid) return;

        const cards = [
            { icon: 'fa-eye', cls: 'views-icon', label: 'Total Views', value: DB.formatNum(kpis.totalViews), growth: '+12%', pos: true },
            { icon: 'fa-clock', cls: 'time-icon', label: 'Watch Time', value: DB.formatNum(Math.floor(kpis.totalWatchTime / 60)) + ' hrs', growth: '+8%', pos: true },
            { icon: 'fa-thumbs-up', cls: 'likes-icon', label: 'Total Likes', value: DB.formatNum(kpis.totalLikes), growth: '+5%', pos: true },
            { icon: 'fa-users', cls: 'subs-icon', label: 'Subscribers', value: DB.formatNum(user.subscribers), growth: '+15%', pos: true },
            { icon: 'fa-dollar-sign', cls: 'rev-icon', label: 'Est. Revenue', value: DB.formatCurrency(Math.floor(kpis.totalRevenue)), growth: '+10%', pos: true },
        ];

        grid.innerHTML = cards.map(c => `
            <div class="stat-card glass-glow animate-in">
                <div class="stat-icon ${c.cls}"><i class="fa-solid ${c.icon}"></i></div>
                <div class="stat-details">
                    <h3>${c.label}</h3>
                    <h2>${c.value}</h2>
                    <div class="growth ${c.pos ? 'positive' : 'negative'}">
                        <i class="fa-solid ${c.pos ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'}"></i>
                        ${c.growth} this period
                    </div>
                </div>
            </div>
        `).join('');
    }

    // ── Charts ───────────────────────────────────────────────────
    function initCharts() {
        // Views growth line chart
        const ctxV = document.getElementById('viewsChart')?.getContext('2d');
        if (!ctxV) return;
        const days = parseInt(timeFilter?.value) || 28;
        const { labels, data } = DB.getViewsOverTime(filteredVideos, Math.min(days, 30));

        const grad = ctxV.createLinearGradient(0, 0, 0, 280);
        grad.addColorStop(0, 'rgba(37,99,235,0.4)');
        grad.addColorStop(1, 'rgba(37,99,235,0.0)');

        viewsChart = new Chart(ctxV, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Views',
                    data,
                    borderColor: '#2563eb',
                    backgroundColor: grad,
                    borderWidth: 2.5,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 3,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#2563eb',
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#1e293b', padding: 12, displayColors: false,
                        callbacks: { label: ctx => DB.formatNum(ctx.parsed.y) + ' views' }
                    }
                },
                scales: {
                    x: { grid: { display: false }, ticks: { maxTicksLimit: 8, font: { family: 'Poppins', size: 11 } } },
                    y: {
                        beginAtZero: true, grid: { color: 'rgba(100,116,139,0.1)' },
                        ticks: { callback: v => DB.formatNum(v), font: { family: 'Poppins', size: 11 } }
                    }
                }
            }
        });

        // Traffic sources doughnut
        const ctxT = document.getElementById('trafficChart')?.getContext('2d');
        if (!ctxT) return;
        const traffic = DB.getTrafficAggregates(filteredVideos);
        trafficChart = new Chart(ctxT, {
            type: 'doughnut',
            data: {
                labels: ['Search', 'Suggested', 'Direct', 'External'],
                datasets: [{
                    data: [traffic.search, traffic.suggested, traffic.direct, traffic.external],
                    backgroundColor: ['#2563eb', '#7c3aed', '#10b981', '#f59e0b'],
                    borderWidth: 0,
                    hoverOffset: 8,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '68%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { padding: 16, font: { family: 'Poppins', size: 12 }, usePointStyle: true }
                    },
                    tooltip: {
                        backgroundColor: '#1e293b', padding: 12,
                        callbacks: { label: ctx => `${ctx.label}: ${ctx.parsed}%` }
                    }
                }
            }
        });
    }

    function updateCharts() {
        if (!viewsChart || !trafficChart) return;
        const days = parseInt(timeFilter?.value) || 28;
        const { labels, data } = DB.getViewsOverTime(filteredVideos, Math.min(days, 30));
        viewsChart.data.labels = labels;
        viewsChart.data.datasets[0].data = data;
        viewsChart.update();

        const traffic = DB.getTrafficAggregates(filteredVideos);
        trafficChart.data.datasets[0].data = [traffic.search, traffic.suggested, traffic.direct, traffic.external];
        trafficChart.update();
    }

    // ── Insights ─────────────────────────────────────────────────
    function renderInsights() {
        const row = document.getElementById('insights-row');
        if (!row || !filteredVideos.length) return;
        const top = DB.getTopVideo(filteredVideos);
        const low = DB.getLeastVideo(filteredVideos);
        const kpis = DB.calcKPIs(filteredVideos);

        row.innerHTML = `
            <div class="insight-card glass-glow">
                <div class="insight-header">
                    <i class="fa-solid fa-trophy highlight-gold"></i>
                    <h3>Top Performing Video</h3>
                </div>
                <div class="insight-content">
                    <div class="insight-video-info">
                        <img src="${top.thumbnail}" class="insight-thumb" alt="thumb" onerror="this.src='https://via.placeholder.com/120x68'">
                        <div>
                            <h4>${top.title}</h4>
                            <p class="text-muted" style="font-size:0.82rem">Published ${top.uploadDate}</p>
                        </div>
                    </div>
                    <div class="insight-metrics">
                        <div class="metric"><span class="label">Views</span><span class="value">${DB.formatNum(top.views)}</span></div>
                        <div class="metric"><span class="label">Likes</span><span class="value">${DB.formatNum(top.likes)}</span></div>
                        <div class="metric"><span class="label">Revenue</span><span class="value">${DB.formatCurrency(Math.floor(top.revenue))}</span></div>
                    </div>
                </div>
            </div>
            <div class="insight-card glass-glow">
                <div class="insight-header">
                    <i class="fa-solid fa-fire" style="color:#ef4444"></i>
                    <h3>Channel Snapshot</h3>
                </div>
                <div class="insight-content">
                    <div class="snapshot-grid">
                        <div class="snap-item"><span class="snap-val">${kpis.engagementRate}%</span><span class="snap-label">Engagement Rate</span></div>
                        <div class="snap-item"><span class="snap-val">${kpis.avgCTR}%</span><span class="snap-label">Avg CTR</span></div>
                        <div class="snap-item"><span class="snap-val">${kpis.avgDuration} min</span><span class="snap-label">Avg Duration</span></div>
                        <div class="snap-item"><span class="snap-val">${kpis.videoCount}</span><span class="snap-label">Total Videos</span></div>
                    </div>
                </div>
            </div>
        `;
    }

    // ── Recent Videos ────────────────────────────────────────────
    function renderRecentVideos() {
        const container = document.getElementById('recent-videos');
        if (!container) return;
        const recent = [...filteredVideos].slice(0, 5);
        if (!recent.length) {
            container.innerHTML = '<div class="empty-state"><i class="fa-solid fa-video-slash"></i><p>No videos yet. <a href="videos.html">Upload your first video!</a></p></div>';
            return;
        }
        container.innerHTML = recent.map(v => `
            <div class="recent-video-card glass-glow">
                <div class="rv-thumb">
                    <img src="${v.thumbnail}" alt="${v.title}" onerror="this.src='https://via.placeholder.com/160x90'">
                    <span class="type-badge ${v.type}">${v.type === 'short' ? '#Short' : '▶ Video'}</span>
                </div>
                <div class="rv-info">
                    <h4>${v.title}</h4>
                    <p class="text-muted rv-date">${v.uploadDate}</p>
                    <div class="rv-stats">
                        <span><i class="fa-solid fa-eye"></i> ${DB.formatNum(v.views)}</span>
                        <span><i class="fa-solid fa-thumbs-up"></i> ${DB.formatNum(v.likes)}</span>
                        <span><i class="fa-solid fa-comment"></i> ${DB.formatNum(v.comments)}</span>
                        <span class="revenue-chip"><i class="fa-solid fa-dollar-sign"></i> ${DB.formatCurrency(Math.floor(v.revenue))}</span>
                    </div>
                </div>
                <div class="rv-actions">
                    <a href="analytics.html" class="btn-sm-outline">Analytics</a>
                    <a href="videos.html" class="btn-sm-outline">Edit</a>
                </div>
            </div>
        `).join('');
    }

    // ── Activity log ─────────────────────────────────────────────
    function renderActivity() {
        const list = document.getElementById('activity-list');
        if (!list) return;
        const log = DB.getActivityLog();
        if (!log.length) { list.innerHTML = '<p class="text-muted" style="padding:20px">No activity yet.</p>'; return; }
        list.innerHTML = `<div class="activity-inner">${log.map(a => `
            <div class="activity-item">
                <div class="activity-dot"></div>
                <div class="activity-body">
                    <strong>${a.action}</strong> — ${a.detail}
                    <span class="activity-time">${a.time}</span>
                </div>
            </div>
        `).join('')}</div>`;
    }

    // ── Export ───────────────────────────────────────────────────
    document.getElementById('export-btn')?.addEventListener('click', () => {
        const kpis = DB.calcKPIs(filteredVideos);
        const exportData = {
            exportedAt: new Date().toISOString(),
            user: user.name,
            period: timeFilter?.value || 'all',
            kpis,
            videos: filteredVideos,
        };
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics_export_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    });

    // ── Theme sync for charts ────────────────────────────────────
    document.addEventListener('themeChanged', ({ detail: { isDark } }) => {
        const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(100,116,139,0.1)';
        const tickColor = isDark ? '#94a3b8' : '#64748b';
        if (viewsChart) {
            viewsChart.options.scales.x.ticks.color = tickColor;
            viewsChart.options.scales.y.ticks.color = tickColor;
            viewsChart.options.scales.y.grid.color = gridColor;
            viewsChart.update();
        }
        if (trafficChart) {
            trafficChart.options.plugins.legend.labels.color = tickColor;
            trafficChart.update();
        }
    });

    // ── Init ─────────────────────────────────────────────────────
    (function init() {
        filteredVideos = DB.filterVideosByRange(videos, '28');
        renderKPIs();
        initCharts();
        renderInsights();
        renderRecentVideos();
        renderActivity();
    })();
});
