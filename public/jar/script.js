const socket = io({
    path: "/socket.io",
    timeout: 2000
});

// Detect connection failure
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
    document.getElementById("donation-goal-title").innerText =
        data.title || "Donation Goal";
    updateJar(data.currentDonations, data.goal);
});

socket.on("donation-update", (data) => {
    updateJar(data.totalDonations, data.goal, true);
});

function updateJar(amount, goal, isNewDonation = false) {
    const liquid = document.getElementById("donation-liquid");
    const donationText = document.getElementById("donation-text");
    const jarHeight = 215;

    const percentage = Math.min(amount / goal, 1) * 100;
    const liquidHeight = (amount / goal) * jarHeight;

    liquid.style.height = `${liquidHeight}px`;
    donationText.innerText = `${amount.toFixed(2)} / ${Math.floor(goal)}€ (${percentage.toFixed(0)}%)`;

    if (isNewDonation) {
        liquid.classList.add("new-donation");
        setTimeout(() => liquid.classList.remove("new-donation"), 1000);
    }

    if (percentage < 100) {
        liquid.style.background =
            "linear-gradient(135deg, rgb(255, 0, 255) 10%, rgb(255, 0, 255) 50%, white 90%)";
        liquid.style.boxShadow =
            "0 0 30px rgba(255, 0, 255, 0.8), 0 0 50px rgba(255, 0, 255, 0.8)";
    } else {
        liquid.style.background =
            "linear-gradient(135deg, rgb(0, 255, 0) 10%, rgb(0, 255, 0) 50%, white 90%)";
        liquid.style.boxShadow =
            "0 0 30px rgba(0, 255, 0, 0.8), 0 0 50px rgba(0, 255, 0, 0.8)";
    }
}
