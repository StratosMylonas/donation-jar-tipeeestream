const socket = io();

socket.on('donation-goal', (data) => {
    document.getElementById('donation-goal-title').innerText = data.title || 'Donation Goal';
    updateJar(data.currentDonations, data.goal);
});

socket.on('donation-update', (data) => {
    updateJar(data.totalDonations, data.goal, true); // New donation triggers animation
});

function updateJar(amount, goal, isNewDonation = false) {
    const liquid = document.getElementById('donation-liquid');
    const donationText = document.getElementById('donation-text');
    const jarHeight = 250;

    let percentage = Math.min(amount / goal, 1) * 100;
    let liquidHeight = (amount / goal) * jarHeight;

    // Update liquid height
    liquid.style.height = `${liquidHeight}px`;

    // Update text
    donationText.innerText = `${amount.toFixed(2)} / ${Math.floor(goal)} (${percentage.toFixed(0)}%)`;

    // Apply animation when new donation comes in
    if (isNewDonation) {
        liquid.classList.add('new-donation');
        setTimeout(() => liquid.classList.remove('new-donation'), 1000);
    }

    // Update colors dynamically (same logic as before)
    const colors = [
        { percent: 0, color: [216, 71, 89] },   // Red
        { percent: 20, color: [227, 93, 93] },  // Dark Orange
        { percent: 40, color: [248, 166, 60] }, // Orange-Yellow
        { percent: 60, color: [159, 218, 46] }, // Green-Yellow
        { percent: 85, color: [75, 201, 54] },  // Slight Green
        { percent: 95, color: [0, 255, 153] },  // Neon Green starts here
        { percent: 100, color: [0, 255, 0] }    // Fully Green
    ];

    let startColor, endColor;
    for (let i = 0; i < colors.length - 1; i++) {
        if (percentage >= colors[i].percent && percentage <= colors[i + 1].percent) {
            startColor = colors[i];
            endColor = colors[i + 1];
            break;
        }
    }

    if (startColor && endColor) {
        let ratio = (percentage - startColor.percent) / (endColor.percent - startColor.percent);
        let r = Math.round(startColor.color[0] + ratio * (endColor.color[0] - startColor.color[0]));
        let g = Math.round(startColor.color[1] + ratio * (endColor.color[1] - startColor.color[1]));
        let b = Math.round(startColor.color[2] + ratio * (endColor.color[2] - startColor.color[2]));

        let neonColor = `rgb(${r}, ${g}, ${b})`;
        let glowColor = `rgba(${r}, ${g}, ${b}, 0.8)`;

        liquid.style.background = `linear-gradient(135deg, ${neonColor} 10%, ${neonColor} 50%, white 90%)`;
        liquid.style.boxShadow = `0 0 30px ${glowColor}, 0 0 50px ${glowColor}`;
    }
}
