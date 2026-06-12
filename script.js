// =========================
// SAVE ATTENDANCE
// =========================
document.addEventListener("DOMContentLoaded", function () {
    let form = document.getElementById("attendanceForm");
    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();

            let data = JSON.parse(localStorage.getItem("attendance")) || [];

            let name = document.getElementById("name").value;
            let shift = document.getElementById("shift").value;
            let status = document.getElementById("status").value;
            let today = new Date().toLocaleDateString();

            if (!name) {
                alert("Please select a firefighter");
                return;
            }

            // Avoid duplicates for the same day
            let exists = data.find(x => x.name === name && x.date === today);
            if (exists) {
                alert("This firefighter is already registered today!");
                return;
            }

            data.push({
                name: name,
                shift: shift,
                status: status,
                date: today
            });

            localStorage.setItem("attendance", JSON.stringify(data));

            // Save daily summary
            saveDailySummary();

            alert("Saved successfully!");
            form.reset();
        });
    }
});


// =========================
// DASHBOARD COUNTERS
// =========================
function loadDashboard() {
    let data = JSON.parse(localStorage.getItem("attendance")) || [];

    document.getElementById("total").innerText = data.length;
    document.getElementById("present").innerText = data.filter(x => x.status === "Present").length;
    document.getElementById("absent").innerText = data.filter(x => x.status === "Absent").length;
    document.getElementById("late").innerText = data.filter(x => x.status === "Late").length;
}


// =========================
// DAILY SUMMARY WITH NAMES
// =========================
function saveDailySummary() {
    let data = JSON.parse(localStorage.getItem("attendance")) || [];
    let today = new Date().toLocaleDateString();

    let summary = JSON.parse(localStorage.getItem("dailySummary")) || [];

    let present = data.filter(x => x.date === today && x.status === "Present");
    let absent = data.filter(x => x.date === today && x.status === "Absent");
    let late = data.filter(x => x.date === today && x.status === "Late");

    // Remove existing summary for today
    summary = summary.filter(x => x.date !== today);

    summary.push({
        date: today,
        presentCount: present.length,
        absentCount: absent.length,
        lateCount: late.length,
        presentNames: present.map(x => x.name),
        absentNames: absent.map(x => x.name),
        lateNames: late.map(x => x.name)
    });

    localStorage.setItem("dailySummary", JSON.stringify(summary));
}


// =========================
// SHOW NAMES FOR TODAY
// =========================
function loadNamesForToday() {
    let summary = JSON.parse(localStorage.getItem("dailySummary")) || [];
    let today = new Date().toLocaleDateString();

    let todayData = summary.find(x => x.date === today);

    if (!todayData) {
        document.getElementById("namesList").innerHTML = "<p>No records for today.</p>";
        return;
    }

    let html = `
        <h3>Present (${todayData.presentCount})</h3>
        <p>${todayData.presentNames.join(", ")}</p>

        <h3>Absent (${todayData.absentCount})</h3>
        <p>${todayData.absentNames.join(", ")}</p>

        <h3>Late (${todayData.lateCount})</h3>
        <p>${todayData.lateNames.join(", ")}</p>
    `;

    document.getElementById("namesList").innerHTML = html;
}


// =========================
// DAILY CHART
// =========================
function loadDailyChart() {
    let summary = JSON.parse(localStorage.getItem("dailySummary")) || [];

    let labels = summary.map(x => x.date);
    let present = summary.map(x => x.presentCount);
    let absent = summary.map(x => x.absentCount);
    let late = summary.map(x => x.lateCount);

    new Chart(document.getElementById("dailyChart"), {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                { label: "Present", data: present, borderColor: "green", fill: false },
                { label: "Absent", data: absent, borderColor: "red", fill: false },
                { label: "Late", data: late, borderColor: "orange", fill: false }
            ]
        }
    });
}


// =========================
// CLEAR TODAY
// =========================
function clearToday() {
    let data = JSON.parse(localStorage.getItem("attendance")) || [];
    let today = new Date().toLocaleDateString();

    let filtered = data.filter(x => x.date !== today);

    localStorage.setItem("attendance", JSON.stringify(filtered));

    alert("Attendance for today has been cleared");

    loadDashboard();
    loadDailyChart();
    loadNamesForToday();
}


// =========================
// SUMMARY PAGE
// =========================
function loadSummary() {
    let data = JSON.parse(localStorage.getItem("attendance")) || [];

    let html = `
        <h3>Total Records: ${data.length}</h3>
        <h3>Present: ${data.filter(x => x.status === "Present").length}</h3>
        <h3>Absent: ${data.filter(x => x.status === "Absent").length}</h3>
        <h3>Late: ${data.filter(x => x.status === "Late").length}</h3>
    `;

    document.getElementById("summary").innerHTML = html;
}
