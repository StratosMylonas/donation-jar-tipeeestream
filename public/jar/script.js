const socket = io({ path: "/socket.io", timeout: 2000 });

let connected = false;

socket.on("connect", () => {
    connected = true;
});

setTimeout(() => {
    if (!connected) {
        document.getElementById("server-status").style.display = "block";
    }
}, 2500);

socket.on("donation-goal", (data) => {
    updateBar(data.currentDonations, data.goal, data.title);
});

socket.on("donation-update", (data) => {
    updateBar(data.totalDonations, data.goal, data.title);
});

function updateBar(amount, goal, title = "Donation Goal") {
    const bar = document.getElementById("donation-bar");
    const barAmount = document.getElementById("bar-amount");
    const barTitle = document.getElementById("bar-title");

    const percentage = Math.min(amount / goal, 1) * 100;

    bar.style.width = `${percentage}%`;
    barTitle.innerText = title;
    barAmount.innerText = `${amount.toFixed(2)} / ${Math.floor(goal)}€ (${percentage.toFixed(0)}%)`;
}
