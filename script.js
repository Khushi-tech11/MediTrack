
// ==========================================
// MEDICARE - MEDICATION REMINDER APPLICATION
// Frontend connected to MongoDB backend
// ==========================================

const API_URL = "http://localhost:5000/api/medicines";

let medicines = [];

// HTML ELEMENTS

const medicineList = document.getElementById("medicineList");
const allMedicines = document.getElementById("allMedicines");
const historyList = document.getElementById("historyList");


// ==========================================
// LOAD MEDICINES FROM BACKEND
// ==========================================

async function loadMedicines() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Could not load medicines");
        }

        medicines = await response.json();

        renderMedicines();

    } catch (error) {
        console.error(error);
        alert("Unable to connect to MediCare server. Please check your backend.");
    }
}


// ==========================================
// RENDER MEDICINES
// ==========================================

function renderMedicines() {

    medicineList.innerHTML = "";

    const sorted = [...medicines].sort(
        (a, b) => a.time.localeCompare(b.time)
    );

    if (sorted.length === 0) {
        medicineList.innerHTML =
            '<p class="empty">No medicines added yet.</p>';
    }

    sorted.forEach(medicine => {

        medicineList.innerHTML += `
            <div class="medicine-item">

                <div class="medicine-icon">💊</div>

                <div class="medicine-info">
                    <h4>${escapeHTML(medicine.name)}</h4>

                    <p>
                        ${escapeHTML(medicine.dosage)}
                        ·
                        ${escapeHTML(medicine.period)}
                    </p>

                    <small>◷ ${escapeHTML(medicine.time)}</small>
                </div>

                <span class="status ${medicine.status.toLowerCase()}">
                    ${escapeHTML(medicine.status)}
                </span>

                ${medicine.status === "Pending" ? `

                    <button class="take-btn"
                        onclick="updateStatus('${medicine._id}', 'Taken')">
                        Taken
                    </button>

                    <button class="skip-btn"
                        onclick="updateStatus('${medicine._id}', 'Skipped')">
                        Skip
                    </button>

                ` : ""}

                <button class="delete-btn"
                    onclick="deleteMedicine('${medicine._id}')">
                    ✕
                </button>

            </div>
        `;
    });

    updateStats();
    renderAllMedicines();
    renderHistory();
}


// ==========================================
// HTML SECURITY
// ==========================================

function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}


// ==========================================
// DASHBOARD STATISTICS
// ==========================================

function updateStats() {

    const total = medicines.length;

    const taken = medicines.filter(
        m => m.status === "Taken"
    ).length;

    const pending = medicines.filter(
        m => m.status === "Pending"
    ).length;

    const skipped = medicines.filter(
        m => m.status === "Skipped"
    ).length;

    const progress = total
        ? Math.round((taken / total) * 100)
        : 0;

    document.getElementById("totalCount").textContent = total;

    document.getElementById("takenCount").textContent = taken;

    document.getElementById("pendingCount").textContent = pending;

    document.getElementById("skippedCount").textContent = skipped;

    document.getElementById("progressValue").textContent =
        progress + "%";

    document.getElementById("progressCircle").style.background =
        `conic-gradient(#159b7a ${progress * 3.6}deg, #edf2f1 0deg)`;

    document.getElementById("progressTaken").textContent = taken;

    document.getElementById("progressPending").textContent = pending;

    document.getElementById("progressSkipped").textContent = skipped;
}


// ==========================================
// UPDATE MEDICINE STATUS
// ==========================================

async function updateStatus(id, status) {

    try {

        const response = await fetch(`${API_URL}/${id}`, {

            method: "PATCH",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({ status })

        });

        if (!response.ok) {
            throw new Error("Could not update status");
        }

        await loadMedicines();

    } catch (error) {

        console.error(error);

        alert("Unable to update medicine status.");

    }
}


// ==========================================
// DELETE MEDICINE
// ==========================================

async function deleteMedicine(id) {

    if (!confirm("Delete this medicine?")) return;

    try {

        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Could not delete medicine");
        }

        await loadMedicines();

    } catch (error) {

        console.error(error);

        alert("Unable to delete medicine.");

    }
}


// ==========================================
// ALL MEDICINES PAGE
// ==========================================

function renderAllMedicines(query = "") {

    const filtered = medicines.filter(m =>
        m.name.toLowerCase().includes(query.toLowerCase())
    );

    allMedicines.innerHTML = filtered.map(m => `

        <div class="medicine-item">

            <div class="medicine-icon">💊</div>

            <div class="medicine-info">

                <h4>${escapeHTML(m.name)}</h4>

                <p>
                    ${escapeHTML(m.dosage)}
                    ·
                    ${escapeHTML(m.period)}
                    ·
                    ${escapeHTML(m.time)}
                </p>

            </div>

            <span class="status ${m.status.toLowerCase()}">
                ${escapeHTML(m.status)}
            </span>

            <button class="delete-btn"
                onclick="deleteMedicine('${m._id}')">
                ✕
            </button>

        </div>

    `).join("");

    if (!filtered.length) {

        allMedicines.innerHTML =
            '<p class="empty">No medicines found.</p>';

    }
}


// ==========================================
// MEDICINE HISTORY
// ==========================================

function renderHistory() {

    historyList.innerHTML = medicines.map(m => `

        <div class="medicine-item">

            <div class="medicine-icon">◷</div>

            <div class="medicine-info">

                <h4>${escapeHTML(m.name)}</h4>

                <p>
                    ${escapeHTML(m.dosage)}
                    ·
                    ${escapeHTML(m.time)}
                </p>

            </div>

            <span class="status ${m.status.toLowerCase()}">
                ${escapeHTML(m.status)}
            </span>

        </div>

    `).join("") || '<p class="empty">No history available.</p>';

}


// ==========================================
// ADD MEDICINE MODAL
// ==========================================

const modal = document.getElementById("modal");

function openModal() {
    modal.classList.remove("hidden");
}

function closeModal() {
    modal.classList.add("hidden");
}

document.getElementById("addBtn").onclick = openModal;

document.getElementById("addBtn2").onclick = openModal;

document.getElementById("closeModal").onclick = closeModal;

modal.addEventListener("click", e => {

    if (e.target === modal) {
        closeModal();
    }

});


// ==========================================
// ADD MEDICINE - CONNECTED TO BACKEND
// ==========================================

document.getElementById("medicineForm").addEventListener(
    "submit",
    async function(e) {

        e.preventDefault();

        const name = document.getElementById("medicineName").value.trim();

        const dosage = document.getElementById("dosage").value.trim();

        const time = document.getElementById("medicineTime").value;

        const period = document.getElementById("period").value;

        try {

            const response = await fetch(API_URL, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name,
                    dosage,
                    time,
                    period
                })

            });

            if (!response.ok) {
                throw new Error("Could not add medicine");
            }

            await loadMedicines();

            this.reset();

            closeModal();

        } catch (error) {

            console.error(error);

            alert("Unable to add medicine. Please try again.");

        }

    }
);


// ==========================================
// NAVIGATION
// ==========================================

document.querySelectorAll(".nav-btn").forEach(button => {

    button.addEventListener("click", () => {

        document.querySelectorAll(".nav-btn").forEach(btn =>
            btn.classList.remove("active")
        );

        button.classList.add("active");

        const page = button.dataset.page;

        document.getElementById("pageTitle").textContent =
            page.charAt(0).toUpperCase() + page.slice(1);

        document.getElementById("dashboardPage").classList.toggle(
            "hidden", page !== "dashboard"
        );

        document.getElementById("medicationsPage").classList.toggle(
            "hidden", page !== "medications"
        );

        document.getElementById("historyPage").classList.toggle(
            "hidden", page !== "history"
        );

    });

});


// ==========================================
// SEARCH MEDICINES
// ==========================================

document.getElementById("searchInput").addEventListener(
    "input",
    e => renderAllMedicines(e.target.value)
);


// ==========================================
// BROWSER NOTIFICATIONS
// ==========================================

async function enableNotifications() {

    if (!("Notification" in window)) {

        alert("Notifications are not supported in this browser.");

        return;

    }

    const permission = await Notification.requestPermission();

    if (permission === "granted") {

        new Notification("MediCare", {

            body: "Browser notifications have been enabled!"

        });

    } else {

        alert("Please allow notifications in your browser settings.");

    }

}

document.getElementById("enableBtn").onclick = enableNotifications;

document.getElementById("notificationBtn").onclick = enableNotifications;


// ==========================================
// INITIAL DISPLAY
// ==========================================

loadMedicines();