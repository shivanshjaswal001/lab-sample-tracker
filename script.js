
const STORAGE_KEY = "labtrack_samples_v2";

let samples = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
let selectedId = null;

const $ = (id) => document.getElementById(id);

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(samples));
}

function makeId() {
  let next = Number(localStorage.getItem("labtrack_next_id") || "101");
  const used = new Set(samples.map(s => s.id));

  while (used.has("LAB-" + next)) {
    next++;
  }

  localStorage.setItem("labtrack_next_id", String(next + 1));
  return "LAB-" + next;
}

function showText(id, message) {
  $(id).textContent = message;
}

function makeBadge(status) {
  const span = document.createElement("span");
  span.className = "badge " + status.toLowerCase();
  span.textContent = status;
  return span;
}

function render() {
  const table = $("sampleTable");
  table.innerHTML = "";

  const search = $("searchInput").value.toLowerCase().trim();

  const filtered = samples.filter(s =>
    s.id.toLowerCase().includes(search) ||
    s.name.toLowerCase().includes(search) ||
    s.test.toLowerCase().includes(search)
  );

  filtered.forEach(s => {
    const row = document.createElement("tr");

    [s.id, s.name, s.test, s.technician || "Not assigned"]
      .forEach(value => {
        const td = document.createElement("td");
        td.textContent = value;
        row.appendChild(td);
      });

    const statusCell = document.createElement("td");
    statusCell.appendChild(makeBadge(s.status));
    row.appendChild(statusCell);

    const actionCell = document.createElement("td");
    const button = document.createElement("button");
    button.className = "small-btn";
    button.textContent = "Edit";
    button.addEventListener("click", () => editSample(s.id));
    actionCell.appendChild(button);
    row.appendChild(actionCell);

    table.appendChild(row);
  });

  $("emptyMessage").style.display = filtered.length ? "none" : "block";

  $("totalCount").textContent = samples.length;
  $("testingCount").textContent =
    samples.filter(s => s.status === "Testing").length;
  $("completedCount").textContent =
    samples.filter(s => s.status === "Completed").length;
}

$("patientForm").addEventListener("submit", function(event) {
  event.preventDefault();

  const name = $("patientName").value.trim();
  const age = Number($("patientAge").value);
  const test = $("testType").value;

  if (!name || !Number.isInteger(age) || age < 1 || age > 120 || !test) {
    showText("registerMessage", "Please enter valid patient details.");
    return;
  }

  const sample = {
    id: makeId(),
    name,
    age,
    test,
    technician: "",
    status: "Collected",
    result: "",
    verified: false
  };

  samples.push(sample);
  saveData();
  render();

  this.reset();
  showText("registerMessage",
    "Patient registered! Sample ID: " + sample.id);
});

function editSample(id) {
  const sample = samples.find(s => s.id === id);
  if (!sample) return;

  selectedId = id;
  $("editingId").textContent = "— " + id;
  $("technician").value = sample.technician;
  $("sampleStatus").value = sample.status;
  $("result").value = sample.result;
  $("verified").checked = sample.verified;

  $("editPanel").classList.remove("hidden");
  showText("updateMessage", "");
  $("editPanel").scrollIntoView({ behavior: "smooth", block: "center" });
}

$("updateForm").addEventListener("submit", function(event) {
  event.preventDefault();

  const sample = samples.find(s => s.id === selectedId);
  if (!sample) return;

  const status = $("sampleStatus").value;
  const result = $("result").value;
  const verified = $("verified").checked;

  if (result && status !== "Completed") {
    showText("updateMessage",
      "Complete the sample before entering a result.");
    return;
  }

  if (verified && (!result || status !== "Completed")) {
    showText("updateMessage",
      "A completed sample with a result is required for verification.");
    return;
  }

  sample.technician = $("technician").value.trim();
  sample.status = status;
  sample.result = result;
  sample.verified = verified;

  saveData();
  render();
  showText("updateMessage", "Sample updated successfully.");
});

$("searchInput").addEventListener("input", render);

$("trackForm").addEventListener("submit", function(event) {
  event.preventDefault();

  const id = $("trackId").value.trim().toUpperCase();
  const sample = samples.find(s => s.id === id);
  const output = $("trackResult");
  output.innerHTML = "";

  if (!sample) {
    const message = document.createElement("p");
    message.className = "error";
    message.textContent = "Sample not found. Please check your Sample ID.";
    output.appendChild(message);
    return;
  }

  const card = document.createElement("div");
  card.className = "result-card";

  const title = document.createElement("h3");
  title.textContent = "Sample " + sample.id;
  card.appendChild(title);

  function addRow(label, value) {
    const row = document.createElement("div");
    row.className = "result-row";

    const left = document.createElement("span");
    left.textContent = label;

    const right = document.createElement("strong");
    right.textContent = value;

    row.append(left, right);
    card.appendChild(row);
  }

  addRow("Test Type", sample.test);
  addRow("Sample Status", sample.status);

  const reportReady =
    sample.status === "Completed" &&
    sample.verified &&
    Boolean(sample.result);

  addRow("Report Status", reportReady ? "Ready" : "Pending");

  if (reportReady) {
    addRow("Verified Result", sample.result);
  } else {
    addRow("Result", "Available after verification");
  }

  output.appendChild(card);
});

render();
