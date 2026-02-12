const CONFIG = {
    refreshInterval: 60000,
    statusFile: "status.json",
    updatesFile: "updates.json"
};

async function fetchJSON(path) {
    const res = await fetch(path + "?t=" + Date.now());
    if (!res.ok) throw new Error("Failed to fetch " + path);
    return await res.json();
}

function formatTime() {
    return new Date().toLocaleTimeString();
}

/* ================= STATUS ================= */

function applyStatusStyle(status) {
    const el = document.getElementById("statusText");
    el.className = "status-text";

    if (status === "ONLINE") el.classList.add("status-online");
    else if (status === "OFFLINE") el.classList.add("status-offline");
    else el.classList.add("status-maintenance");
}

async function loadStatus() {
    try {
        const data = await fetchJSON(CONFIG.statusFile);

        document.getElementById("statusText").innerText = data.status;
        document.getElementById("onlineBadge").innerText =
            "Online: " + data.onlinePlayers;

        document.getElementById("serverInfo").innerText =
            data.server;

        document.getElementById("versionText").innerText =
            "Version: " + data.version;

        document.getElementById("lastCheck").innerText =
            "Last check: " + formatTime();

        applyStatusStyle(data.status);

    } catch (e) {
        document.getElementById("statusText").innerText = "ERROR";
        console.error(e);
    }
}

/* ================= VERSION SORT ================= */

function compareVersions(a, b) {
    const vA = a.version.split(".").map(Number);
    const vB = b.version.split(".").map(Number);

    for (let i = 0; i < Math.max(vA.length, vB.length); i++) {
        const numA = vA[i] || 0;
        const numB = vB[i] || 0;
        if (numA > numB) return -1;
        if (numA < numB) return 1;
    }
    return 0;
}

/* ================= UPDATES ================= */

async function loadUpdates() {
    try {
        const updates = await fetchJSON(CONFIG.updatesFile);
        updates.sort(compareVersions);

        const container = document.getElementById("updatesList");
        container.innerHTML = "";

        updates.forEach(update => {
            const div = document.createElement("div");
            div.classList.add("update-item");

            div.innerHTML = `
                <div class="update-title type-${update.type}">
                    v${update.version} - ${update.type}
                </div>
                <div class="update-meta">
                    ${update.date}
                </div>
                <div>${update.title}</div>
                <div>${update.description}</div>
            `;

            container.appendChild(div);
        });

    } catch (e) {
        document.getElementById("updatesList").innerText =
            "Failed to load updates.";
        console.error(e);
    }
}

function init() {
    loadStatus();
    loadUpdates();
    setInterval(loadStatus, CONFIG.refreshInterval);
}

init();
