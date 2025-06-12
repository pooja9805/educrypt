document.addEventListener("DOMContentLoaded", () => {
  const attendanceDate = localStorage.getItem("lastAttendanceDate");
  const records = JSON.parse(localStorage.getItem("attendanceRecords")) || [];

  const studentList = document.getElementById("studentList");
  const summaryDate = document.getElementById("summaryDate");

  summaryDate.textContent = new Date(attendanceDate).toLocaleDateString();

  if (!records.length) {
    studentList.innerHTML = "<li>No attendance submitted.</li>";
    return;
  }

  studentList.innerHTML = "";
  records.forEach(record => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div>${record.name}</div>
      <div>
        <span style="font-weight: bold; color: ${record.status === "Present" ? "#0f0" : "#f00"};">
          ${record.status}
        </span>
      </div>
    `;
    studentList.appendChild(li);
  });
});
