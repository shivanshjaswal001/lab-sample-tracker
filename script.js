
let samples = JSON.parse(localStorage.getItem("samples")) || [];

function get(id) {
    return document.getElementById(id);
}

function save() {
    localStorage.setItem("samples", JSON.stringify(samples));
}

function display() {
    get("sampleTable").innerHTML = "";
    get("reportTable").innerHTML = "";

    for (let s of samples) {
        let row = document.createElement("tr");

        for (let value of [s.id, s.name, s.test, s.tech, s.status]) {
            let cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        }

        get("sampleTable").appendChild(row);

        let reportRow = document.createElement("tr");

        for (let value of [
            s.id,
            s.result,
            s.verified ? "Verified" : "Pending",
            s.verified ? "Ready" : "Pending"
        ]) {
            let cell = document.createElement("td");
            cell.textContent = value;
            reportRow.appendChild(cell);
        }

        get("reportTable").appendChild(reportRow);
    }
}

get("patientForm").onsubmit = function(e) {
    e.preventDefault();

    let id = samples.length
        ? Math.max(...samples.map(s => s.id)) + 1
        : 101;

    let patient = {
        id: id,
        name: get("name").value,
        age: get("age").value,
        test: get("test").value,
        tech: "Not Assigned",
        status: "Collected",
        result: "Not Entered",
        verified: false
    };

    samples.push(patient);
    save();
    display();
    this.reset();

    alert("Patient Registered! Sample ID: " + id);
};

get("updateForm").onsubmit = function(e) {
    e.preventDefault();

    let id = Number(get("sampleId").value);
    let s = samples.find(x => x.id === id);

    if (s) {
        s.tech = get("technician").value;
        s.status = get("status").value;

        if (s.status !== "Completed") {
            s.verified = false;
        }

        save();
        display();
        this.reset();
        alert("Sample Updated!");
    } else {
        alert("Sample not found!");
    }
};

get("reportForm").onsubmit = function(e) {
    e.preventDefault();

    let id = Number(get("reportId").value);
    let s = samples.find(x => x.id === id);

    if (!s) {
        alert("Sample not found!");
    } else if (s.status !== "Completed") {
        alert("Complete testing first!");
    } else {
        s.result = get("result").value;
        s.verified = get("verified").checked;

        save();
        display();
        this.reset();
        alert("Report Saved!");
    }
};

display();
