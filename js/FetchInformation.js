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

    // Fetch IPv6 address using an alternative API
    fetch('https://ipwhois.app/json/')
        .then(response => response.json())
        .then(data => {
            if (data.ipv6) {
                document.getElementById('ipv6').textContent = data.ipv6;
            } else {
                document.getElementById('ipv6').textContent = 'IPv6 not available.';
            }
        })
        .catch(error => {
            console.error('Error fetching IPv6 address:', error);
            document.getElementById('ipv6').textContent = 'Unable to fetch IPv6 address.';
        });
}

// Call the function when the page loads
fetchAndDisplayIPs();