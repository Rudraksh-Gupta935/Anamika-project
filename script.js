window.addEventListener("DOMContentLoaded", () => {
// -------------------------
// Theme toggle
// -------------------------
const bodyEl = document.body;
const themeToggle = document.getElementById("themeToggle");

if (themeToggle) {
themeToggle.addEventListener("click", () => {
bodyEl.classList.toggle("dark");
});
}

// -------------------------
// Tabs
// -------------------------
const tabButtons = document.querySelectorAll(".tab");
const tabSections = document.querySelectorAll(".tab-section");

tabButtons.forEach((btn) => {
btn.addEventListener("click", () => {
const target = btn.dataset.tab;

tabButtons.forEach((b) => b.classList.remove("active"));
tabSections.forEach((s) => s.classList.remove("active"));

btn.classList.add("active");
const targetSection = document.getElementById(target);
if (targetSection) targetSection.classList.add("active");
});
});

// -------------------------
// Chart – Reach last 3 months
// -------------------------
const reachCanvas = document.getElementById("reachChart");
let reachChart;
let reachData = {
months: ["August", "September", "October"],
values: [7200, 8100, 8800],
};

function initChart() {
if (!reachCanvas || !window.Chart) return;
const ctx = reachCanvas.getContext("2d");

reachChart = new Chart(ctx, {
type: "line",
data: {
labels: reachData.months,
datasets: [
{
label: "Reach",
data: reachData.values,
borderWidth: 2,
fill: true,
tension: 0.35,
},
],
},
options: {
responsive: true,
maintainAspectRatio: false,
plugins: {
legend: { display: false },
},
scales: {
x: {
grid: { display: false },
},
y: {
beginAtZero: true,
ticks: {
callback: function (value) {
return value.toLocaleString();
},
},
},
},
},
});

updateChartFromData();
}

function updateChartFromData() {
if (!reachChart) return;

reachChart.data.labels = reachData.months;
reachChart.data.datasets[0].data = reachData.values;
reachChart.update();

const maxVal = Math.max.apply(null, reachData.values);
const maxIndex = reachData.values.indexOf(maxVal);

const bestMonthEl = document.getElementById("bestMonth");
const peakReachEl = document.getElementById("peakReach");

if (bestMonthEl && maxIndex >= 0) {
bestMonthEl.textContent = reachData.months[maxIndex];
}
if (peakReachEl && maxIndex >= 0) {
peakReachEl.textContent = reachData.values[maxIndex].toLocaleString();
}
}

initChart();

// -------------------------
// Login modal & sync
// -------------------------
const loginBtn = document.getElementById("loginBtn");
const loginModal = document.getElementById("loginModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const modalOkBtn = document.getElementById("modalOkBtn");
const syncStatus = document.getElementById("syncStatus");
const lastSyncEl = document.getElementById("lastSync");

function setSynced() {
const now = new Date();
const prettyTime = now.toLocaleTimeString([], {
hour: "2-digit",
minute: "2-digit",
});

if (lastSyncEl) {
lastSyncEl.textContent = "Last synced: " + prettyTime;
}
if (syncStatus) {
syncStatus.innerHTML =
'<span class="status-dot"></span>Synced (demo)';
}
}

function openModal() {
if (loginModal) loginModal.style.display = "flex";
}

function closeModal() {
if (loginModal) loginModal.style.display = "none";
}

if (loginBtn) {
loginBtn.addEventListener("click", () => {
setSynced();
openModal();
});
}
if (closeModalBtn) {
closeModalBtn.addEventListener("click", closeModal);
}
if (modalOkBtn) {
modalOkBtn.addEventListener("click", closeModal);
}
if (loginModal) {
loginModal.addEventListener("click", (e) => {
if (e.target === loginModal) {
closeModal();
}
});
}

// -------------------------
// Upload JSON – update metrics + chart
// -------------------------
const uploadBtn = document.getElementById("uploadBtn");
const jsonFileInput = document.getElementById("jsonFileInput");
const brandInput = document.getElementById("brandInput");

if (uploadBtn && jsonFileInput) {
uploadBtn.addEventListener("click", () => {
jsonFileInput.click();
});

jsonFileInput.addEventListener("change", (event) => {
const file = event.target.files[0];
if (!file) return;

const reader = new FileReader();
reader.onload = function (e) {
try {
const data = JSON.parse(e.target.result);

// Brand
if (data.brand && brandInput) {
brandInput.value = data.brand;
}

// Summary metrics
if (typeof data.totalReach === "number") {
const el = document.getElementById("totalReach");
if (el) el.textContent = data.totalReach.toLocaleString();
}
if (typeof data.totalFollowers === "number") {
const el = document.getElementById("totalFollowers");
if (el) el.textContent = data.totalFollowers.toLocaleString();
}
if (typeof data.avgEngagement === "number") {
const el = document.getElementById("avgEngagement");
if (el) el.textContent = data.avgEngagement.toFixed(1);
}

// Trends
if (typeof data.reachChange === "number") {
const reachTrend = document.getElementById("reachTrend");
const value = data.reachChange;
if (reachTrend) {
reachTrend.textContent =
(value >= 0 ? "▲ +" : "▼ ") +
Math.abs(value).toFixed(1) +
"% vs prev";
reachTrend.className =
"metric-trend " + (value >= 0 ? "trend-up" : "trend-down");
}
}

if (typeof data.followersChange === "number") {
const followersTrend = document.getElementById("followersTrend");
const value = data.followersChange;
if (followersTrend) {
followersTrend.textContent =
(value >= 0 ? "▲ +" : "▼ ") +
Math.abs(value).toFixed(1) +
"% vs prev";
followersTrend.className =
"metric-trend " + (value >= 0 ? "trend-up" : "trend-down");
}
}

if (typeof data.engagementChange === "number") {
const engagementTrend = document.getElementById("engagementTrend");
const value = data.engagementChange;
if (engagementTrend) {
engagementTrend.textContent =
(value >= 0 ? "▲ +" : "▼ ") +
Math.abs(value).toFixed(1) +
"% vs prev";
engagementTrend.className =
"metric-trend " + (value >= 0 ? "trend-up" : "trend-down");
}
}

// Chart data
if (
Array.isArray(data.months) &&
Array.isArray(data.reachByMonth) &&
data.months.length === data.reachByMonth.length &&
data.months.length > 0
) {
reachData = {
months: data.months,
values: data.reachByMonth,
};
updateChartFromData();
}

setSynced();
alert("Dashboard updated from JSON file.");
} catch (err) {
console.error(err);
alert("Could not parse JSON. Please check the file format.");
}
};

reader.readAsText(file);
});
}

// -------------------------
// Export CSV
// -------------------------
const exportCsvBtn = document.getElementById("exportCsvBtn");

if (exportCsvBtn) {
exportCsvBtn.addEventListener("click", () => {
const totalReachEl = document.getElementById("totalReach");
const totalFollowersEl = document.getElementById("totalFollowers");
const avgEngagementEl = document.getElementById("avgEngagement");

const rows = [
["Metric", "Value"],
["Brand", (brandInput && brandInput.value) || "@demo_profile"],
[
"Total Reach (3 months)",
totalReachEl ? totalReachEl.textContent : "",
],
[
"New Followers (3 months)",
totalFollowersEl ? totalFollowersEl.textContent : "",
],
[
"Avg Engagement Rate (%)",
avgEngagementEl ? avgEngagementEl.textContent : "",
],
];

const csvContent = rows
.map((r) =>
r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
)
.join("\n");

const blob = new Blob([csvContent], {
type: "text/csv;charset=utf-8;",
});
const url = URL.createObjectURL(blob);
const link = document.createElement("a");
link.href = url;
link.download = "social-dashboard-summary.csv";
document.body.appendChild(link);
link.click();
document.body.removeChild(link);
URL.revokeObjectURL(url);
});
}

// -------------------------
// Export "PDF" – browser print dialog
// -------------------------
const exportPdfBtn = document.getElementById("exportPdfBtn");

if (exportPdfBtn) {
exportPdfBtn.addEventListener("click", () => {
alert(
"Your browser print dialog will open. Choose “Save as PDF” to export."
);
window.print();
});
}

// -------------------------
// Range selector – update title only
// -------------------------
const dateRangeSelect = document.getElementById("dateRange");
if (dateRangeSelect) {
dateRangeSelect.addEventListener("change", (e) => {
const months = e.target.value;
const summaryTitle = document.getElementById("summaryTitle");
if (summaryTitle) {
summaryTitle.textContent = "Summary (Last " + months + " Months)";
}
});
}
});
