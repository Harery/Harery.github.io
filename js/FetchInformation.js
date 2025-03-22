// Function to fetch and display IP addresses and country
function fetchAndDisplayInfo() {
    // Fetch IP and geolocation information
    fetch('https://ipwhois.app/json/')
        .then(response => response.json())
        .then(data => {
            // Display IPv4 or IPv6
            document.getElementById('ipv4').textContent = data.ip;
            document.getElementById('ipv6').textContent = data.ipv6 || 'IPv6 not available';

            // Display country
            document.getElementById('country').textContent = data.country || 'Country not available';
        })
        .catch(error => {
            console.error('Error fetching IP and country information:', error);
            document.getElementById('ipv4').textContent = 'Unable to fetch IP address.';
            document.getElementById('ipv6').textContent = 'Unable to fetch IPv6 address.';
            document.getElementById('country').textContent = 'Unable to fetch country.';
        });
}

// Call the function when the page loads
fetchAndDisplayInfo();