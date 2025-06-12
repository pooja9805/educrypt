document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  

  const chartCanvas = document.getElementById("attendanceChart");
  const table = document.getElementById("attendanceTable");
  const tbody = table.querySelector("tbody");
  const viewType = document.getElementById("viewType");
  const attendanceView = document.getElementById("attendanceView");

  try {
    const [percentRes, detailRes] = await Promise.all([
      fetch("http://localhost:5000/api/students/attendance-summary", {
        headers: { Authorization: `Bearer ${token}` }
      }),
      fetch("http://localhost:5000/api/students/my-attendance", {
        headers: { Authorization: `Bearer ${token}` }
      })
    ]);

    if (!percentRes.ok || !detailRes.ok) {
      throw new Error("Failed to fetch one or both attendance endpoints.");
    }

    const percentData = await percentRes.json();
    const detailData = await detailRes.json();

    // Chart View: Summary
    if (!percentData.attendance || percentData.attendance.length === 0) {
      chartCanvas.style.display = "none";
      attendanceView.innerHTML = "<p>No attendance data available.</p>";
      return;
    }

    const labels = percentData.attendance.map(a => a.course);
    const percentages = percentData.attendance.map(a =>
      ((a.attended / a.total) * 100).toFixed(1)
    );

    const ctx = chartCanvas.getContext("2d");
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [{
          label: "Attendance %",
          data: percentages,
          backgroundColor: "rgba(0, 255, 255, 0.4)",
          borderColor: "rgba(0, 255, 255, 1)",
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 100
          }
        }
      }
    });

    // Table View: Detailed Attendance
    tbody.innerHTML = "";

    if (detailData.attendance && detailData.attendance.length > 0) {
      detailData.attendance.forEach(entry => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${entry.courseName} (${entry.courseId})</td>
          <td>${new Date(entry.date).toLocaleDateString()}</td>
          <td class="${entry.status === 'Present' ? 'status-present' : 'status-absent'}">${entry.status}</td>
        `;
        tbody.appendChild(tr);
      });
    } else {
      tbody.innerHTML = "<tr><td colspan='3'>No records found</td></tr>";
    }

    // Toggle View
    viewType.addEventListener("change", () => {
      if (viewType.value === "table") {
        chartCanvas.style.display = "none";
        table.style.display = "table";
      } else {
        chartCanvas.style.display = "block";
        table.style.display = "none";
      }
    });

  } catch (err) {
    console.error("❌ Failed to load attendance:", err);
    attendanceView.innerHTML = "<p>Error loading attendance data.</p>";
  }
});
