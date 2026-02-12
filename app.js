const CONFIG = {
    refreshInterval: 60000,
    statusFile: "status.json",
    updatesFile: "updates.json"
};

/* =========================
   UTILITIES
========================= */

async function fetchJSON(path) {
    const response = await fetch(path + "?t=" + Date.now());
    if (!response.ok) {
        throw new Error("Failed to fetch " + path);
    }
    return await response.json();
}

function formatTime() {
    return new Date().toLocaleTimeString();
}

/* =========================
   STATUS SYSTEM
========================= */

function applyStatusStyle(status) {
    const el = document.getElementById("statusText");
    el.className = "";

    if (status === "ONLINE") {
        el.classList.add("status-online");
    } else if (status === "OFFLINE") {
        el.classList.add("status-offline");
    } else {
        el.style.color = "#f0ad4e"; // maintenance
    }
}

async function loadStatus() {
    try {
        const data = await fetchJSON(CONFIG.statusFile);

        document.getElementById("statusText").innerText = data.status;
        document.getElementById("onlineBox").innerText =
            "Online: " + data.onlinePlayers;

        document.getElementById("serverInfo").innerText =
            data.server + " | v" + data.version;

        document.getElementById("lastCheck").innerText =
            "Last check: " + formatTime();

        applyStatusStyle(data.status);

    } catch (error) {
        document.getElementById("statusText").innerText = "ERROR";
        console.error(error);
    }
}

/* =========================
   VERSION SORTING (SEMVER)
========================= */

function parseVersion(version) {
    return version.split(".").map(num => parseInt(num, 10));
}

function compareVersions(a, b) {
    const vA = parseVersion(a.version);
    const vB = parseVersion(b.version);

    for (let i = 0; i < Math.max(vA.length, vB.length); i++) {
        const numA = vA[i] || 0;
        const numB = vB[i] || 0;

        if (numA > numB) return -1;
        if (numA < numB) return 1;
    }
    return 0;
}

/* =========================
   UPDATE TYPE COLORS
========================= */

function getTypeColor(type) {
    switch (type) {
        case "BIG": return "#d73a49";
        case "MINOR": return "#1f6feb";
        case "PATCH": return "#2ea043";
        case "HOTFIX": return "#f85149";
        default: return "#8b949e";
    }
}

/* =========================
   UPDATES SYSTEM
========================= */

async function loadUpdates() {
    try {
        const updates = await fetchJSON(CONFIG.updatesFile);

        updates.sort(compareVersions);

        const container = document.getElementById("updatesList");
        container.innerHTML = "";

        updates.forEach(update => {
            const div = document.createElement("div");
            div.style.marginBottom = "20px";

            div.innerHTML = `
                <h3 style="color:${getTypeColor(update.type)}">
                    v${update.version} - ${update.type}
                </h3>
                <small>${update.date}</small>
                <p><b>${update.title}</b></p>
                <p>${update.description}</p>
                <hr>
            `;

            container.appendChild(div);
        });

    } catch (error) {
        document.getElementById("updatesList").innerText =
            "Failed to load updates.";
        console.error(error);
    }
}

/* =========================
   INIT
========================= */

function init() {
    loadStatus();
    loadUpdates();
    setInterval(loadStatus, CONFIG.refreshInterval);
}

init();
