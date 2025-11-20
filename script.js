// --- Sample data (real-time via JSON file or upload) ---
const sampleData = {
meta: {from: '2025-08-01', to: '2025-10-31'},
summary: {reach: 56000, new_followers: 1450},
months: [
{label:'Aug', reach:17000, followers:450, engagement_rate:3.1},
{label:'Sep', reach:19000, followers:520, engagement_rate:3.3},
{label:'Oct', reach:20000, followers:480, engagement_rate:3.9}
],
posts: [
{id:'P1', reach:1200, likes:150, comments:12},
{id:'P2', reach:2100, likes:300, comments:34},
{id:'P3', reach:900, likes:80, comments:8},
{id:'P4', reach:2500, likes:420, comments:45}
],
stories:[{id:'S1',views:800},{id:'S2',views:1200},{id:'S3',views:600}]
};

// global state
let currentData = JSON.parse(JSON.stringify(sampleData));

// helper: format number
function fmt(n){return n.toLocaleString()}

// render summary stats
function renderSummary(d){
document.getElementById('totalReach').textContent = fmt(d.summary.reach);
document.getElementById('totalFollowers').textContent = fmt(d.summary.new_followers);
const avg = (d.months.reduce((s,m)=>s+m.engagement_rate,0)/d.months.length).toFixed(2)+'%';
document.getElementById('avgEngagement').textContent = avg;
document.getElementById('lastSync').textContent = new Date().toLocaleString();
}

// charts
let reachChart, followerChart, engagementChart, postChart, storyChart;
function createCharts(d){
const months = d.months.map(m=>m.label);
const reachVals = d.months.map(m=>m.reach);
const followerVals = d.months.map(m=>m.followers);
const engagementVals = d.months.map(m=>m.engagement_rate);

const rCtx = document.getElementById('reachChart').getContext('2d');
if(reachChart) reachChart.destroy();
reachChart = new Chart(rCtx,{type:'line',data:{labels:months,datasets:[{label:'Monthly Reach',data:reachVals,fill:true,borderWidth:2,backgroundColor:'rgba(43,108,176,0.12)',borderColor:'#2b6cb0'}]},options:{responsive:true,scales:{y:{beginAtZero:true}}}});

const fCtx = document.getElementById('followerChart').getContext('2d');
if(followerChart) followerChart.destroy();
followerChart = new Chart(fCtx,{type:'bar',data:{labels:months,datasets:[{label:'New Followers',data:followerVals,borderWidth:1,backgroundColor:'rgba(56,161,105,0.15)',borderColor:'#38a169'}]},options:{responsive:true,scales:{y:{beginAtZero:true}}}});

const eCtx = document.getElementById('engagementChart').getContext('2d');
if(engagementChart) engagementChart.destroy();
engagementChart = new Chart(eCtx,{type:'line',data:{labels:months,datasets:[{label:'Engagement %',data:engagementVals,borderWidth:2,fill:false,borderColor:'#d946ef'}]},options:{responsive:true,scales:{y:{beginAtZero:true}}}});

const pCtx = document.getElementById('postReachChart').getContext('2d');
if(postChart) postChart.destroy();
postChart = new Chart(pCtx,{type:'bar',data:{labels:d.posts.map(p=>p.id),datasets:[{label:'Reach',data:d.posts.map(p=>p.reach)},{label:'Likes',data:d.posts.map(p=>p.likes)}]},options:{responsive:true,scales:{y:{beginAtZero:true}}}});

const sCtx = document.getElementById('storyChart').getContext('2d');
if(storyChart) storyChart.destroy();
storyChart = new Chart(sCtx,{type:'bar',data:{labels:d.stories.map(s=>s.id),datasets:[{label:'Views',data:d.stories.map(s=>s.views)}]},options:{responsive:true,scales:{y:{beginAtZero:true}}}});
}

// posts table
function renderPostsTable(d){
const tbody = document.getElementById('postsTable'); tbody.innerHTML='';
d.posts.forEach(p=>{
const eng = ((p.likes + p.comments) / p.reach * 100).toFixed(2);
const tr = document.createElement('tr');
tr.innerHTML = `<td style="padding:8px">${p.id}</td><td style="text-align:right">${fmt(p.reach)}</td><td style="text-align:right">${fmt(p.likes)}</td><td style="text-align:right">${fmt(p.comments)}</td><td style="text-align:right">${eng}%</td>`;
tbody.appendChild(tr);
})
}

// top stories
function renderTopStories(d){
const container = document.getElementById('topStories'); container.innerHTML='';
d.stories.slice().sort((a,b)=>b.views-a.views).forEach(s=>{
const el = document.createElement('div'); el.className='card'; el.innerHTML = `<strong>${s.id}</strong><div class="muted">${fmt(s.views)} views</div>`; container.appendChild(el);
})
}

// full render
function renderAll(d){ renderSummary(d); createCharts(d); renderPostsTable(d); renderTopStories(d); }

// initial render
renderAll(currentData);

// nav handling
document.getElementById('nav').addEventListener('click',e=>{
if(e.target.matches('button')){
document.querySelectorAll('#nav button').forEach(b=>b.classList.remove('active'));
e.target.classList.add('active');
const page = e.target.dataset.page;
document.querySelectorAll('main section').forEach(s=>s.style.display='none');
document.getElementById(page).style.display='block';
}
});

// theme toggle
document.getElementById('themeToggle').addEventListener('change',e=>{
document.body.setAttribute('data-theme', e.target.checked ? 'dark' : 'light');
});

// login modal
document.getElementById('loginBtn').addEventListener('click',()=>document.getElementById('loginModal').style.display='flex');
document.getElementById('closeLogin').addEventListener('click',()=>document.getElementById('loginModal').style.display='none');
document.getElementById('doLogin').addEventListener('click',()=>{
// simple front-end mock login
const email = document.getElementById('email').value; if(!email){alert('Enter email');return}
document.getElementById('loginModal').style.display='none'; alert('Logged in as ' + email);
});

// upload JSON (real-time data)
document.getElementById('uploadJson').addEventListener('click',()=>document.getElementById('fileInput').click());
document.getElementById('fileInput').addEventListener('change',async(e)=>{
const file = e.target.files[0]; if(!file) return;
try{
const text = await file.text(); const parsed = JSON.parse(text);
currentData = parsed; renderAll(currentData); alert('JSON loaded');
}catch(err){alert('Invalid JSON file')}
});

// export CSV
function objToCSV(data){
const rows = [['Post ID','Reach','Likes','Comments','Engagement %']];
data.posts.forEach(p=>rows.push([p.id,p.reach,p.likes,p.comments,((p.likes+p.comments)/p.reach*100).toFixed(2)]));
return rows.map(r=>r.map(cell=>`"${cell}"`).join(',')).join('
');
}
document.getElementById('exportCSV').addEventListener('click',()=>{
const csv = objToCSV(currentData); const blob = new Blob([csv],{type:'text/csv'}); const url=URL.createObjectURL(blob);
const a=document.createElement('a'); a.href=url; a.download='social_report.csv'; a.click(); URL.revokeObjectURL(url);
});

// export PDF (using jsPDF)
document.getElementById('exportPDF').addEventListener('click',async()=>{
const { jsPDF } = window.jspdf;
const doc = new jsPDF();
doc.setFontSize(14); doc.text('Social Media Report',14,18);
doc.setFontSize(10); doc.text(`Range: ${currentData.meta?.from || ''} — ${currentData.meta?.to || ''}`,14,26);
// add summary
doc.text(`Total Reach: ${currentData.summary.reach}`,14,36);
doc.text(`New Followers: ${currentData.summary.new_followers}`,14,42);
// add a simple table of posts
let y=52; doc.setFontSize(9);
doc.text('Post | Reach | Likes | Comments | Eng% ',14,y); y+=6;
currentData.posts.forEach(p=>{ doc.text(`${p.id} | ${p.reach} | ${p.likes} | ${p.comments} | ${((p.likes+p.comments)/p.reach*100).toFixed(2)}`,14,y); y+=6; if(y>270){doc.addPage(); y=20}});
doc.save('social_report.pdf');
});

// quick ability to fetch from remote endpoint (example) - mocked as function
async function fetchRemote(url){
try{
const res = await fetch(url); if(!res.ok) throw new Error('Network');
const json = await res.json(); currentData=json; renderAll(currentData);
}catch(e){console.warn('Could not fetch remote data',e)}
}

// expose for dev console
window._dashboard = {currentData,renderAll,fetchRemote};// -------------------------
    // Theme toggle
    // -------------------------
    const bodyEl = document.body;
    const themeToggle = document.getElementById("themeToggle");

    themeToggle.addEventListener("click", () => {
      bodyEl.classList.toggle("dark");
    });

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
        document.getElementById(target).classList.add("active");
      });
    });

    // -------------------------
    // Chart – Reach last 3 months
    // -------------------------
    const ctx = document.getElementById("reachChart").getContext("2d");

    let reachData = {
      months: ["August", "September", "October"],
      values: [7200, 8100, 8800],
    };

    let reachChart = new Chart(ctx, {
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
              callback: (value) => value.toLocaleString(),
            },
          },
        },
      },
    });

    function updateChartFromData() {
      reachChart.data.labels = reachData.months;
      reachChart.data.datasets[0].data = reachData.values;
      reachChart.update();

      // Update best month & peak reach text
      const maxIndex = reachData.values.indexOf(
        Math.max(...reachData.values)
      );
      document.getElementById("bestMonth").textContent =
        reachData.months[maxIndex];
      document.getElementById("peakReach").textContent =
        reachData.values[maxIndex].toLocaleString();
    }

    updateChartFromData();

    // -------------------------
    // Login modal
    // -------------------------
    const loginBtn = document.getElementById("loginBtn");
    const loginModal = document.getElementById("loginModal");
    const closeModalBtn = document.getElementById("closeModalBtn");
    const modalOkBtn = document.getElementById("modalOkBtn");
    const syncStatus = document.getElementById("syncStatus");
    const lastSyncedText = document.getElementById("lastSyncedText");

    function setSynced() {
      const now = new Date();
      const prettyTime = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      lastSyncedText.textContent = `Last synced: ${prettyTime}`;
      syncStatus.innerHTML =
        '<span class="status-dot"></span>Synced (demo)';
    }

    loginBtn.addEventListener("click", () => {
      loginModal.style.display = "flex";
      setSynced();
    });

    function closeModal() {
      loginModal.style.display = "none";
    }

    closeModalBtn.addEventListener("click", closeModal);
    modalOkBtn.addEventListener("click", closeModal);
    loginModal.addEventListener("click", (e) => {
      if (e.target === loginModal) closeModal();
    });

    // -------------------------
    // Upload JSON – update metrics + chart
    // -------------------------
    const uploadBtn = document.getElementById("uploadBtn");
    const jsonFileInput = document.getElementById("jsonFileInput");
    const brandInput = document.getElementById("brandInput");

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

          // Update brand
          if (data.brand) {
            brandInput.value = data.brand;
          }

          // Update summary metrics
          if (typeof data.totalReach === "number") {
            document.getElementById("totalReach").textContent =
              data.totalReach.toLocaleString();
          }
          if (typeof data.newFollowers === "number") {
            document.getElementById("newFollowers").textContent =
              data.newFollowers.toLocaleString();
          }
          if (typeof data.avgEngagement === "number") {
            document.getElementById("avgEngagement").textContent =
              data.avgEngagement.toFixed(1);
          }

          // Optionally update trends if provided
          if (typeof data.reachChange === "number") {
            const reachTrend = document.getElementById("reachTrend");
            const value = data.reachChange;
            reachTrend.textContent =
              (value >= 0 ? "▲ +" : "▼ ") + Math.abs(value).toFixed(1) + "% vs prev";
            reachTrend.className =
              "metric-trend " + (value >= 0 ? "trend-up" : "trend-down");
          }

          if (typeof data.followersChange === "number") {
            const followersTrend = document.getElementById("followersTrend");
            const value = data.followersChange;
            followersTrend.textContent =
              (value >= 0 ? "▲ +" : "▼ ") + Math.abs(value).toFixed(1) + "% vs prev";
            followersTrend.className =
              "metric-trend " + (value >= 0 ? "trend-up" : "trend-down");
          }

          if (typeof data.engagementChange === "number") {
            const engagementTrend = document.getElementById("engagementTrend");
            const value = data.engagementChange;
            engagementTrend.textContent =
              (value >= 0 ? "▲ +" : "▼ ") + Math.abs(value).toFixed(1) + "% vs prev";
            engagementTrend.className =
              "metric-trend " + (value >= 0 ? "trend-up" : "trend-down");
          }

          // Update chart data
          if (Array.isArray(data.months) && Array.isArray(data.reachByMonth)) {
            if (data.months.length === data.reachByMonth.length) {
              reachData = {
                months: data.months,
                values: data.reachByMonth,
              };
              updateChartFromData();
            }
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

    // -------------------------
    // Export CSV
    // -------------------------
    const exportCsvBtn = document.getElementById("exportCsvBtn");

    exportCsvBtn.addEventListener("click", () => {
      const rows = [
        ["Metric", "Value"],
        ["Brand", brandInput.value || "@demo_profile"],
        ["Total Reach (3 months)", document.getElementById("totalReach").textContent],
        ["New Followers (3 months)", document.getElementById("newFollowers").textContent],
        ["Avg Engagement Rate (%)", document.getElementById("avgEngagement").textContent],
      ];

      const csvContent = rows
        .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "social-dashboard-summary.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });

    // -------------------------
    // Export "PDF" – uses browser print dialog
    // -------------------------
    const exportPdfBtn = document.getElementById("exportPdfBtn");

    exportPdfBtn.addEventListener("click", () => {
      alert(
        "To export as PDF, your browser's print dialog will open. Choose “Save as PDF”."
      );
      window.print();
    });

    // -------------------------
    // Range selector – just a UI demo
    // -------------------------
    const dateRangeSelect = document.getElementById("dateRange");
    dateRangeSelect.addEventListener("change", (e) => {
      const months = e.target.value;
      document.querySelector(".card-title").textContent =
        `Summary (Last ${months} Months)`;
    });
