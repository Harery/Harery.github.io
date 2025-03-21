fetch('https://api.ipify.org?format=json')
    .then(response => response.json())
    .then(data => {
        const ipAddress = data.ip;
        return fetch(`https://ipapi.co/${ipAddress}/json/`);
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('country').textContent = data.country_name || 'Unavailable';
        document.getElementById('ip').textContent = data.ip || 'Unavailable';
    })
    .catch(error => {
        console.error('Error fetching location data:', error);
        document.getElementById('country').textContent = 'Error';
        document.getElementById('ip').textContent = 'Error';
    });