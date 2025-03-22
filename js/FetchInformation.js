// Function to fetch and display IP addresses
function fetchAndDisplayIPs() {
    // Fetch IPv4 address
    fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
            document.getElementById('ipv4').textContent = data.ip;
        })
        .catch(error => {
            console.error('Error fetching IPv4 address:', error);
            document.getElementById('ipv4').textContent = 'Unable to fetch IPv4 address.';
        });

    // Fetch IPv6 address
    fetch('https://api64.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
            document.getElementById('ipv6').textContent = data.ip;
        })
        .catch(error => {
            console.error('Error fetching IPv6 address:', error);
            document.getElementById('ipv6').textContent = 'Unable to fetch IPv6 address.';
        });
}

// Call the function when the page loads
fetchAndDisplayIPs();