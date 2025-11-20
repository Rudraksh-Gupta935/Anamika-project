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
  const brandInput = document.getElementById("brandInput");

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
      if (dataSourceTag)
        dataSourceTag.textContent = "Connected: Facebook (demo)";
      setConnectionLabel("Facebook account connected (demo data)");
    });
  }

  // -------------------------
  // Brand field – open profile on Enter
  // -------------------------
  if (brandInput) {
    brandInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const raw = brandInput.value.trim();
        if (!raw) return;
        const handle = raw.startsWith("@") ? raw.slice(1) : raw;
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

  // Format 1: simple object (flat metrics)
  function applySimpleJson(data) {
    if (data.brand && brandInput) {
      brandInput.value = data.brand;
      setConnectionLabel(data.brand + " (JSON data connected)");
    } else {
      setConnectionLabel("JSON data connected");
    }

    // Summary metrics
    const totalReach =
      typeof data.totalReach === "number"
        ? data.totalReach
        : typeof data.reach === "number"
        ? data.reach
        : null;
    const totalFollowers =
      typeof data.totalFollowers === "number"
        ? data.totalFollowers
        : typeof data.newFollowers === "number"
        ? data.newFollowers
        : null;

    if (totalReach !== null) {
      const el = document.getElementById("totalReach");
      if (el) el.textContent = totalReach.toLocaleString();
    }
    if (totalFollowers !== null) {
      const el = document.getElementById("totalFollowers");
      if (el) el.textContent = totalFollowers.toLocaleString();
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

  // Format 2: sampleData style { summary, months }
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

  // Format 3: array of profiles (Instagram-style export)
  function applyProfileArrayJson(arr) {
    if (!Array.isArray(arr) || arr.length === 0) return;

    // Choose first profile
    let profile =
      arr.find((p) => p.isYourStory || p.isMainProfile) || arr[0];

    // Try to guess username and followers from different possible keys
    const username =
      profile.username ||
      profile.userName ||
      profile.handle ||
      profile.name ||
      "";

    const followers =
      profile.followers ??
      profile.followersCount ??
      profile.follower_count ??
      profile.followers_count ??
      0;

    const posts =
      profile.posts ||
      profile.feed ||
      profile.items ||
      profile.media ||
      [];

    if (brandInput && username) {
      brandInput.value = "@" + username;
      setConnectionLabel("@" + username + " (JSON file connected)");
    } else {
      setConnectionLabel("JSON file connected");
    }

    const totalFollowersEl = document.getElementById("totalFollowers");
    const totalReachEl = document.getElementById("totalReach");
    const avgEngagementEl = document.getElementById("avgEngagement");

    let totalLikes = 0;
    let totalComments = 0;

    posts.forEach((p) => {
      const likes =
        p.likes ??
        p.likeCount ??
        p.likesCount ??
        p.like_count ??
        0;

      const commentsArray =
        p.comments ||
        p.commentList ||
        p.comment_list ||
        [];

      const commentsCount =
        p.commentCount ??
        p.commentsCount ??
        p.comment_count ??
        (Array.isArray(commentsArray) ? commentsArray.length : 0);

      totalLikes += likes;
      totalComments += commentsCount;
    });

    const rawReach = totalLikes + totalComments;

    if (totalFollowersEl && typeof followers === "number") {
      totalFollowersEl.textContent = followers.toLocaleString();
    }
    if (totalReachEl) {
      totalReachEl.textContent = rawReach.toLocaleString();
    }

    let engagementRate = 0;
    if (followers && followers > 0) {
      engagementRate = (rawReach / followers) * 100;
    }
    if (avgEngagementEl) {
      avgEngagementEl.textContent = engagementRate.toFixed(1);
    }

    const reachTrend = document.getElementById("reachTrend");
    const followersTrend = document.getElementById("followersTrend");
    const engagementTrend = document.getElementById("engagementTrend");

    if (reachTrend) {
      reachTrend.textContent = "Based on likes + comments";
      reachTrend.className = "metric-trend trend-up";
    }
    if (followersTrend) {
      followersTrend.textContent = "Snapshot from JSON";
      followersTrend.className = "metric-trend";
    }
    if (engagementTrend) {
      engagementTrend.textContent = "Calculated from posts";
      engagementTrend.className = "metric-trend";
    }

    if (posts.length > 0) {
      reachData = {
        months: posts.map((p, i) =>
          p.id != null ? "Post " + p.id : "Post " + (i + 1)
        ),
        values: posts.map((p) => {
          return (
            p.likes ??
            p.likeCount ??
            p.likesCount ??
            p.like_count ??
            0
          );
        }),
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

          if (Array.isArray(data)) {
            // profile.json style
            applyProfileArrayJson(data);
          } else if (data && data.summary && data.months) {
            // sampleData style
            applySampleDataJson(data);
          } else {
            // flat metrics style
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
