// TelePaisa Analytics Dashboard Script

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const phoneInput = document.getElementById('phoneInput');
  const fetchBtn = document.getElementById('fetchBtn');
  const retryBtn = document.getElementById('retryBtn');
  const errorBanner = document.getElementById('errorBanner');
  const loadingOverlay = document.getElementById('loadingOverlay');

  const totalAmountEl = document.getElementById('totalAmount');
  const budgetListEl = document.getElementById('budgetList');
  const budgetEmptyEl = document.getElementById('budgetEmpty');
  const recentTbodyEl = document.getElementById('recentTbody');
  const recentEmptyEl = document.getElementById('recentEmpty');

  const categoryEmptyEl = document.getElementById('categoryEmpty');
  const trendEmptyEl = document.getElementById('trendEmpty');

  // Chart instances
  let categoryChartInstance = null;
  let trendChartInstance = null;

  // Category Color Palette (All 11 Categories)
  const categoryColors = {
    education: '#8b5cf6',
    food: '#f59e0b',
    travel: '#3b82f6',
    shopping: '#ec4899',
    bills: '#ef4444',
    entertainment: '#06b6d4',
    health: '#10b981',
    subscriptions: '#6366f1',
    personal_care: '#f43f5e',
    recharge: '#84cc16',
    general: '#64748b'
  };

  // Extract phone/chatId parameter from URL query string
  const urlParams = new URLSearchParams(window.location.search);
  const initialPhone = urlParams.get('phone') || urlParams.get('userId') || urlParams.get('chatId') || '';
  phoneInput.value = initialPhone;

  // Currency formatter
  function formatRupees(amount) {
    const num = Number(amount) || 0;
    return num.toLocaleString('en-IN');
  }

  // Show/Hide Loading
  function setLoading(isLoading) {
    if (isLoading) {
      loadingOverlay.classList.remove('hidden');
      loadingOverlay.style.opacity = '1';
    } else {
      loadingOverlay.style.opacity = '0';
      setTimeout(() => {
        loadingOverlay.classList.add('hidden');
      }, 300);
    }
  }

  // Show Error Banner
  function showError(msg) {
    errorBanner.classList.remove('hidden');
  }

  function hideError() {
    errorBanner.classList.add('hidden');
  }

  // Load all dashboard data
  async function loadDashboardData() {
    const phone = phoneInput.value.trim();
    hideError();
    setLoading(true);

    try {
      const [summaryRes, trendRes, budgetsRes, recentRes] = await Promise.all([
        fetch(`/api/summary?phone=${encodeURIComponent(phone)}`).then(r => r.json()),
        fetch(`/api/trend?phone=${encodeURIComponent(phone)}`).then(r => r.json()),
        fetch(`/api/budgets?phone=${encodeURIComponent(phone)}`).then(r => r.json()),
        fetch(`/api/recent?phone=${encodeURIComponent(phone)}`).then(r => r.json())
      ]);

      renderSummary(summaryRes);
      renderTrend(trendRes);
      renderBudgets(budgetsRes);
      renderRecent(recentRes);

    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      showError('Failed to fetch data from TelePaisa backend.');
    } finally {
      setLoading(false);
    }
  }

  // Render Total & Category Breakdown Chart
  function renderSummary(data) {
    const total = data.total || 0;
    totalAmountEl.textContent = formatRupees(total);

    const categories = data.category || [];

    if (!categories.length) {
      if (categoryChartInstance) categoryChartInstance.destroy();
      categoryEmptyEl.classList.remove('hidden');
      document.getElementById('categoryChart').classList.add('hidden');
      return;
    }

    categoryEmptyEl.classList.add('hidden');
    const canvas = document.getElementById('categoryChart');
    canvas.classList.remove('hidden');

    const labels = categories.map(c => (c._id || 'general').toLowerCase());
    const values = categories.map(c => c.total);
    const colors = labels.map(label => categoryColors[label] || '#64748b');

    if (categoryChartInstance) {
      categoryChartInstance.destroy();
    }

    categoryChartInstance = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: labels.map(l => l.replace('_', ' ').toUpperCase()),
        datasets: [{
          data: values,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: '#1e293b'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#f8fafc',
              font: { family: 'Outfit', size: 12 },
              padding: 15
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => ` ₹${formatRupees(context.raw)}`
            }
          }
        }
      }
    });
  }

  // Render Monthly Spending Trend Chart
  function renderTrend(trendData) {
    if (!Array.isArray(trendData) || !trendData.length) {
      if (trendChartInstance) trendChartInstance.destroy();
      trendEmptyEl.classList.remove('hidden');
      document.getElementById('trendChart').classList.add('hidden');
      return;
    }

    trendEmptyEl.classList.add('hidden');
    const canvas = document.getElementById('trendChart');
    canvas.classList.remove('hidden');

    const labels = trendData.map(item => `${item._id.month}/${item._id.year}`);
    const values = trendData.map(item => item.total);

    if (trendChartInstance) {
      trendChartInstance.destroy();
    }

    trendChartInstance = new Chart(canvas, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Monthly Spend (₹)',
          data: values,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#10b981',
          pointRadius: 5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            ticks: { color: '#94a3b8', font: { family: 'Outfit' } },
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
          },
          y: {
            ticks: { color: '#94a3b8', font: { family: 'Outfit' } },
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => ` ₹${formatRupees(context.raw)}`
            }
          }
        }
      }
    });
  }

  // Render Budget Progress Cards
  function renderBudgets(budgets) {
    budgetListEl.innerHTML = '';

    if (!Array.isArray(budgets) || !budgets.length) {
      budgetEmptyEl.classList.remove('hidden');
      return;
    }

    budgetEmptyEl.classList.add('hidden');

    budgets.forEach(b => {
      const percent = Number(b.percent) || 0;
      const isExceeded = percent >= 100;
      const statusClass = isExceeded ? 'exceeded' : 'safe';
      const fillPercent = Math.min(percent, 100);

      const item = document.createElement('div');
      item.className = 'budget-item';
      item.innerHTML = `
        <div class="budget-item-header">
          <span class="budget-cat-name">${b.category}</span>
          <span class="budget-percent ${statusClass}">${percent}% ${isExceeded ? '🚨' : ''}</span>
        </div>
        <div class="budget-details">
          ₹${formatRupees(b.spent)} / ₹${formatRupees(b.limit)}
        </div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill ${statusClass}" style="width: ${fillPercent}%;"></div>
        </div>
      `;
      budgetListEl.appendChild(item);
    });
  }

  // Render Recent Transactions Table
  function renderRecent(recentList) {
    recentTbodyEl.innerHTML = '';

    if (!Array.isArray(recentList) || !recentList.length) {
      recentEmptyEl.classList.remove('hidden');
      return;
    }

    recentEmptyEl.classList.add('hidden');

    recentList.forEach(t => {
      const tr = document.createElement('tr');
      const d = new Date(t.createdAt);
      const dateStr = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
      const merchantStr = t.merchant && t.merchant !== 'unknown' ? ` (${t.merchant})` : '';

      tr.innerHTML = `
        <td><span class="cat-badge">${t.category}</span></td>
        <td>${t.type || 'expense'}${merchantStr}</td>
        <td style="color: #94a3b8; font-size: 0.85rem;">${dateStr}</td>
        <td class="text-right amount-text">₹${formatRupees(t.amount)}</td>
      `;
      recentTbodyEl.appendChild(tr);
    });
  }

  // Event Listeners
  fetchBtn.addEventListener('click', loadDashboardData);
  retryBtn.addEventListener('click', loadDashboardData);
  phoneInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') loadDashboardData();
  });

  // Initial load
  loadDashboardData();
});
