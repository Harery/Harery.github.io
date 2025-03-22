// Function to fetch and display IP addresses and country
function fetchAndDisplayInfo() {
    // Fetch IP and geolocation information
    fetch('http://ip-api.com/json/')
        .then(response => response.json())
        .then(data => {
            // Display IPv4 or IPv6
            document.getElementById('ipv4').textContent = data.query || 'IP not available';
            document.getElementById('ipv6').textContent = 'IPv6 not available'; // ip-api doesn't provide IPv6

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