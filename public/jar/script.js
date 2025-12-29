const socket = io({ path: "/socket.io", timeout: 2000 });

let connected = false;
let fixedTitle = "Donation Goal"; // will be set once

socket.on("connect", () => {
    connected = true;
});

setTimeout(() => {
    if (!connected) {
        document.getElementById("server-status").style.display = "block";
    }
}, 2500);

/* Initial load */
socket.on("donation-goal", (data) => {
    fixedTitle = data.title || fixedTitle;
    setTitle(fixedTitle);
    updateBar(data.currentDonations, data.goal);
});

/* Donation updates */
socket.on("donation-update", (data) => {
    updateBar(data.totalDonations, data.goal);
});

function setTitle(title) {
    document.getElementById("bar-title").innerText = title;
}

function updateBar(amount, goal) {
    const bar = document.getElementById("donation-bar");
    const barAmount = document.getElementById("bar-amount");

    const percentage = Math.min(amount / goal, 1) * 100;

    bar.style.width = `${percentage}%`;
    barAmount.innerText = `${amount.toFixed(2)} / ${Math.floor(goal)}€ (${percentage.toFixed(0)}%)`;
}
