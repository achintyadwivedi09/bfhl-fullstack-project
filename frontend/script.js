function sendData() {
    const raw = document.getElementById("input").value;

    const arr = raw.split(",").map(x => x.trim());

    fetch("http://localhost:3000/bfhl", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ data: arr })
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById("output").innerText = JSON.stringify(data, null, 2);
    })
    .catch(err => {
        document.getElementById("output").innerText = "Error";
    });
}