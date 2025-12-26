const socket = io({
    path: "/socket.io",
    timeout: 2000
});

const el = document.getElementById("latest-text");

// Function to update text with glow
function updateLatest(data) {
    if (!data || !data.name) return;
    const text = `${data.name} – €${data.amount}`;
    el.classList.remove("glow");
    void el.offsetWidth; // restart animation
    el.textContent = text;
    el.classList.add("glow");
}

// Load last donation from localStorage
const lastDonation = JSON.parse(localStorage.getItem("latestDonation"));
if(lastDonation) updateLatest(lastDonation);

// Update on new donation
socket.on("latest-donation", (data) => {
    updateLatest(data);
    localStorage.setItem("latestDonation", JSON.stringify(data)); // store locally
});
