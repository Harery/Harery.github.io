// Function to fetch and display IP and geolocation information using Axios
function fetchAndDisplayInfo() {
    console.log('Fetching IP and geolocation information using Axios...');

    // Fetch IP and geolocation information
    axios.get('http://ip-api.com/json/')
        .then(response => {
            const data = response.data;

            // Display geolocation and ISP details
            document.getElementById('region').textContent = data.regionName || 'Region not available';
            document.getElementById('city').textContent = data.city || 'City not available';
            document.getElementById('zip').textContent = data.zip || 'ZIP not available';
            document.getElementById('timezone').textContent = data.timezone || 'Timezone not available';
            document.getElementById('isp').textContent = data.isp || 'ISP not available';
            document.getElementById('organization').textContent = data.org || 'Organization not available';
            document.getElementById('asn').textContent = `${data.as || 'AS number not available'}`;

            // Display user agent
            document.getElementById('user-agent').textContent = navigator.userAgent || 'User agent not available';
        })
        .catch(error => {
            console.error('Error fetching data using Axios:', error);

            // Fallback messages for errors
            document.getElementById('region').textContent = 'Unable to fetch region.';
            document.getElementById('city').textContent = 'Unable to fetch city.';
            document.getElementById('zip').textContent = 'Unable to fetch ZIP.';
            document.getElementById('timezone').textContent = 'Unable to fetch timezone.';
            document.getElementById('isp').textContent = 'Unable to fetch ISP.';
            document.getElementById('organization').textContent = 'Unable to fetch organization.';
            document.getElementById('asn').textContent = 'Unable to fetch AS number.';
            document.getElementById('user-agent').textContent = 'Unable to fetch user agent.';
        });
}

// Call the function when the page loads
fetchAndDisplayInfo();