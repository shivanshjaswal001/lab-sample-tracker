
const $ = id => document.getElementById(id);
const KEY = "labtrack_simple_v1";
let samples = JSON.parse(localStorage.getItem(KEY) || "[]");
let editing = null;

function save() {
  localStorage.setItem(KEY, JSON.stringify(samples));
}

function openPage(role) {
  ["home", "doctor", "patient"].forEach(id =>
    $(id).classList.toggle("hidden", id !== role)
  );
  $("backBtn").classList.toggle("hidden", role === "home");
  window.scrollTo(0, 0);
}

function goHome() {
  openPage("home");
}

function render() {
  $("records").innerHTML = "";
  $("noRecords").classList.toggle("hidden", samples.length > 0);

  samples.forEach(s => {
    const row = document.createElement("tr");

    [s.id, s.name, s.test].forEach(value => {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.appendChild(cell);
    });

    const statusCell = document.createElement("td");
    const badge = document.createElement("span");
    badge.className = "badge " + s.status;
    badge.textContent = s.status;
    statusCell.appendChild(badge);
    row.appendChild(statusCell);

    const actionCell = document.createElement("td");
    const btn = document.createElement("button");
    btn.className = "edit-btn";
    btn.textContent = "Edit";
    btn.onclick = () => editSample(s.id);
    actionCell.appendChild(btn);
    row.appendChild(actionCell);

    $("records").appendChild(row);
  });

  $("total").textContent = samples.length;
  $("testing").textContent =
    samples.filter(s => s.status === "Testing").length;
  $("completed").textContent =
    samples.filter(s => s.status === "Completed").length;
}

$("registerForm").onsubmit = function(e) {
  e.preventDefault();

  const name = $("name").value.trim();
  const age = Number($("age").value);
  const test = $("test").value;

  if (!name || age < 1 || age > 120 || !test) return;

  let next = Number(localStorage.getItem("labtrack_next") || "101");
  while (samples.some(s => s.id === "LAB-" + next)) next++;
  localStorage.setItem("labtrack_next", next + 1);

  const id = "LAB-" + next;

  samples.push({
    id, name, age, test,
    technician: "",
    status: "Collected",
    result: "",
    verified: false
  });

  save();
  render();
  this.reset();
  $("registerMsg").textContent = "Registered successfully! Sample ID: " + id;
};

function editSample(id) {
  const s = samples.find(item => item.id === id);
  if (!s) return;

  editing = id;
  $("editId").textContent = id;
  $("technician").value = s.technician;
  $("status").value = s.status;
  $("result").value = s.result;
  $("verified").checked = s.verified;
  $("updateMsg").textContent = "";

  $("editBox").classList.remove("hidden");
  $("editBox").scrollIntoView({ behavior: "smooth" });
}

$("updateForm").onsubmit = function(e) {
  e.preventDefault();

  const s = samples.find(item => item.id === editing);
  if (!s) return;

  const status = $("status").value;
  const result = $("result").value;
  const verified = $("verified").checked;

  if (result && status !== "Completed") {
    $("updateMsg").textContent = "Complete the sample before adding results.";
    return;
  }

  if (verified && !result) {
    $("updateMsg").textContent = "Enter a result before verification.";
    return;
  }

  s.technician = $("technician").value.trim();
  s.status = status;
  s.result = result;
  s.verified = verified;

  save();
  render();
  $("updateMsg").textContent = "Sample updated successfully!";
};

$("trackForm").onsubmit = function(e) {
  e.preventDefault();

  const id = $("searchId").value.trim().toUpperCase();
  const s = samples.find(item => item.id === id);
  const output = $("trackOutput");
  output.innerHTML = "";

  if (!s) {
    output.textContent = "Sample not found. Check your Sample ID.";
    return;
  }

  const report = document.createElement("div");
  report.className = "report";

  function addLine(label, value) {
    const p = document.createElement("p");
    const strong = document.createElement("strong");
    strong.textContent = label + ": ";
    p.append(strong, document.createTextNode(value));
    report.appendChild(p);
  }

  addLine("Sample ID", s.id);
  addLine("Test", s.test);
  addLine("Status", s.status);

  const ready = s.status === "Completed" && s.verified && s.result;
  addLine("Report", ready ? "Verified" : "Pending");
  if (ready) addLine("Result", s.result);

  output.appendChild(report);
};

render();
