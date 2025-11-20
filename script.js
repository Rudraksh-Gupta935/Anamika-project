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
// Tabs (top tabs)
// -------------------------
const tabButtons = document.querySelectorAll(".tab");
const tabSections = document.querySelectorAll(".tab-section");

function activateTab(tabId) {
tabButtons.forEach((b) => {
if (b.dataset.tab === tabId) b.classList.add("active");
else b.classList.remove("active");
});
tabSections.forEach((s) => {
if (s.id === tabId) s.classList.add("active");
else s.classList.remove("active");
});
}

tabButtons.forEach((btn) => {
btn.addEventListener("click", () => {
activateTab(btn.dataset.tab);
});
});

// -------------------------
// Sidebar nav -> tabs
// -------------------------
const sideItems = document.querySelectorAll(".nav-item");

sideItems.forEach((item) => {
item.addEventListener("click", () => {
sideItems.forEach((i) => i.classList.remove("active"));
item.classList.add("active");

const target = item.dataset.tabTarget;
if (target) activateTab(target);
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

initChart();

// -------------------------
// Common labels (sync + footer connection)
// -------------------------
const loginBtn = document.getElementById("loginBtn");
const loginModal = document.getElementById("loginModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const modalOkBtn = document.getElementById("modalOkBtn");
const syncStatus = document.getElementById("syncStatus");
const lastSyncEl = document.getElementById("lastSync");
const dataSourceTag = document.getElementById("dataSourceTag");
const connectionLabel = document.getElementById("connectionLabel");
const connectionDot = document.getElementById("connectionDot");

function setConnectionLabel(text) {
if (connectionLabel) connectionLabel.textContent = text;
if (connectionDot) connectionDot.classList.remove("red");
}

function setSynced(label) {
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
'<span class="status-dot"></span>Synced (' +
(label || "demo") +
")";
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

// Social login buttons – open official login pages in new tab
const loginX = document.getElementById("loginX");
const loginInstagram = document.getElementById("loginInstagram");
const loginFacebook = document.getElementById("loginFacebook");

if (loginX) {
loginX.addEventListener("click", () => {
window.open("https://x.com/i/flow/login", "_blank");
setSynced("X");
if (dataSourceTag) dataSourceTag.textContent = "Connected: X (demo)";
setConnectionLabel("X account connected (demo data)");
});
}
if (loginInstagram) {
loginInstagram.addEventListener("click", () => {
window.open(
"https://www.instagram.com/accounts/login/",
"_blank"
);
setSynced("Instagram");
if (dataSourceTag)
dataSourceTag.textContent = "Connected: Instagram (demo)";
setConnectionLabel("Instagram account connected (demo data)");
});
}
if (loginFacebook) {
loginFacebook.addEventListener("click", () => {
window.open("https://www.facebook.com/login", "_blank");
setSynced("Facebook");
if (dataSourceTag) dataSourceTag.textContent = "Connected: Facebook (demo)";
setConnectionLabel("Facebook account connected (demo data)");
});
}

// -------------------------
// Brand field – open profile on Enter
// -------------------------
const brandInput = document.getElementById("brandInput");
if (brandInput) {
brandInput.addEventListener("keydown", (e) => {
if (e.key === "Enter") {
const raw = brandInput.value.trim();
if (!raw) return;
const handle = raw.startsWith("@") ? raw.slice(1) : raw;

// default: Instagram profile
window.open(
"https://www.instagram.com/" + encodeURIComponent(handle),
"_blank"
);
}
});
}

// -------------------------
// JSON APPLY HELPERS
// -------------------------

// Format 1: simple object (your "simple JSON" format)
function applySimpleJson(data) {
if (data.brand && brandInput) {
brandInput.value = data.brand;
setConnectionLabel(data.brand + " (JSON data connected)");
} else {
setConnectionLabel("JSON data connected");
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
}

// Format 2: your original sampleData: { meta, summary, months, ... }
function applySampleDataJson(data) {
if (data.brand && brandInput) {
brandInput.value = data.brand;
setConnectionLabel(data.brand + " (JSON data connected)");
} else {
setConnectionLabel("JSON data connected");
}

if (data.summary) {
const totalReachEl = document.getElementById("totalReach");
const totalFollowersEl = document.getElementById("totalFollowers");
if (totalReachEl && typeof data.summary.reach === "number") {
totalReachEl.textContent = data.summary.reach.toLocaleString();
}
if (
totalFollowersEl &&
typeof data.summary.new_followers === "number"
) {
totalFollowersEl.textContent =
data.summary.new_followers.toLocaleString();
}
}
if (data.months && Array.isArray(data.months) && data.months.length > 0) {
reachData = {
months: data.months.map((m) => m.label),
values: data.months.map((m) => m.reach),
};
// average engagement
const avg =
data.months.reduce(
(s, m) => s + (m.engagement_rate || 0),
0
) / data.months.length;
const avgEl = document.getElementById("avgEngagement");
if (avgEl) avgEl.textContent = avg.toFixed(1);

updateChartFromData();
}
}

// Format 3: your current profile.json (ARRAY of profiles)
function applyProfileArrayJson(arr) {
if (!Array.isArray(arr) || arr.length === 0) return;

// Pick profile: prefer "isYourStory", else first
let profile = arr.find((p) => p.isYourStory) || arr[0];

// Brand / footer
if (brandInput && profile.username) {
brandInput.value = "@" + profile.username;
setConnectionLabel("@" + profile.username + " (JSON file connected)");
} else {
setConnectionLabel("JSON data connected");
}

const totalFollowersEl = document.getElementById("totalFollowers");
const totalReachEl = document.getElementById("totalReach");
const avgEngagementEl = document.getElementById("avgEngagement");

const posts = Array.isArray(profile.posts) ? profile.posts : [];

let totalLikes = 0;
let totalComments = 0;
posts.forEach((p) => {
totalLikes += p.likes || 0;
if (Array.isArray(p.comments)) {
totalComments += p.comments.length;
}
});

const rawReach = totalLikes + totalComments;

if (totalFollowersEl && typeof profile.followers === "number") {
totalFollowersEl.textContent = profile.followers.toLocaleString();
}
if (totalReachEl) {
totalReachEl.textContent = rawReach.toLocaleString();
}

// Approx engagement rate = (likes+comments per follower)
let engagementRate = 0;
if (profile.followers && profile.followers > 0) {
engagementRate = (rawReach / profile.followers) * 100;
}
if (avgEngagementEl) {
avgEngagementEl.textContent = engagementRate.toFixed(1);
}

// Neutral trends
const reachTrend = document.getElementById("reachTrend");
const followersTrend = document.getElementById("followersTrend");
const engagementTrend = document.getElementById("engagementTrend");

if (reachTrend) {
reachTrend.textContent = "Based on likes + comments";
reachTrend.className = "metric-trend trend-up";
}
if (followersTrend) {
followersTrend.textContent = "Static (JSON snapshot)";
followersTrend.className = "metric-trend";
}
if (engagementTrend) {
engagementTrend.textContent = "Calculated from posts";
engagementTrend.className = "metric-trend";
}

// Chart: use post likes as "reach"
if (posts.length > 0) {
reachData = {
months: posts.map((p, i) =>
p.id != null ? "Post " + p.id : "Post " + (i + 1)
),
values: posts.map((p) => p.likes || 0),
};
updateChartFromData();
}
}

// -------------------------
// Upload JSON – update metrics + chart
// -------------------------
const uploadBtn = document.getElementById("uploadBtn");
const jsonFileInput = document.getElementById("jsonFileInput");

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

// Detect which format it is
if (Array.isArray(data)) {
// your profile.json format
applyProfileArrayJson(data);
} else if (data && data.summary && data.months) {
// sampleData style
applySampleDataJson(data);
} else {
// simple flat JSON
applySimpleJson(data);
}

if (dataSourceTag) {
dataSourceTag.textContent = "From JSON file";
}
setSynced("JSON");

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
"Total Reach (period)",
totalReachEl ? totalReachEl.textContent : "",
],
[
"New Followers (period)",
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
