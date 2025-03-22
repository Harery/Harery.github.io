// Function to fetch and display IP and geolocation information
function fetchAndDisplayInfo() {
    // Fetch IP and geolocation information
    fetch('http://ip-api.com/json/')
        .then(response => response.json())
        .then(data => {
            // Display IP addresses
            document.getElementById('ipv4').textContent = data.query || 'IP not available';
            document.getElementById('ipv6').textContent = 'IPv6 not available'; // ip-api doesn't provide IPv6

            // Display geolocation and ISP details
            document.getElementById('region').textContent = data.regionName || 'Region not available';
            document.getElementById('city').textContent = data.city || 'City not available';
            document.getElementById('zip').textContent = data.zip || 'ZIP not available';
            document.getElementById('timezone').textContent = data.timezone || 'Timezone not available';
            document.getElementById('isp').textContent = data.isp || 'ISP not available';
            document.getElementById('organization').textContent = data.org || 'Organization not available';
            document.getElementById('asn').textContent = `${data.as} (${data.asname || 'AS name not available'})`;

            // Display user agent
            document.getElementById('user-agent').textContent = navigator.userAgent || 'User agent not available';
        })
        .catch(error => {
            console.error('Error fetching IP and geolocation information:', error);

            // Fallback messages for errors
            document.getElementById('ipv4').textContent = 'Unable to fetch IP address.';
            document.getElementById('ipv6').textContent = 'Unable to fetch IPv6 address.';
            document.getElementById('region').textContent = 'Unable to fetch region.';
            document.getElementById('city').textContent = 'Unable to fetch city.';
            document.getElementById('zip').textContent = 'Unable to fetch ZIP.';
            document.getElementById('timezone').textContent = 'Unable to fetch timezone.';
            document.getElementById('isp').textContent = 'Unable to fetch ISP.';
            document.getElementById('organization').textContent = 'Unable to fetch organization.';
            document.getElementById('asn').textContent = 'Unable to fetch AS number and name.';
            document.getElementById('user-agent').textContent = 'Unable to fetch user agent.';
        });
}

// Call the function when the page loads
fetchAndDisplayInfo();