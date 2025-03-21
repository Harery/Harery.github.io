const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
const apiUrl = 'https://ipapi.co/json/';

fetch(proxyUrl + apiUrl)
    .then(response => response.json())
    .then(data => {
        document.getElementById('country').textContent = data.country_name || 'Unavailable';
        document.getElementById('ip').textContent = data.ip || 'Unavailable';

        // Extract operating system details
        const userAgent = navigator.userAgent;
        let osName = 'Unknown OS';
        let osVersion = 'Unknown Version';

        if (userAgent.includes('Windows')) {
            osName = 'Windows';
            osVersion = /Windows NT (\d+\.\d+)/.exec(userAgent)?.[1] || 'Unknown';
        } else if (userAgent.includes('Mac OS')) {
            osName = 'Mac OS';
            osVersion = /Mac OS X (\d+_\d+)/.exec(userAgent)?.[1]?.replace('_', '.') || 'Unknown';
        } else if (userAgent.includes('Linux')) {
            osName = 'Linux';
        } else if (userAgent.includes('Android')) {
            osName = 'Android';
            osVersion = /Android (\d+\.\d+)/.exec(userAgent)?.[1] || 'Unknown';
        } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
            osName = 'iOS';
            osVersion = /OS (\d+_\d+)/.exec(userAgent)?.[1]?.replace('_', '.') || 'Unknown';
        }

        // Display OS details
        document.getElementById('os-name').textContent = osName;
        document.getElementById('os-version').textContent = osVersion;
    })
    .catch(error => {
        console.error('Error fetching location data:', error);
        document.getElementById('country').textContent = 'Error';
        document.getElementById('ip').textContent = 'Error';
        document.getElementById('os-name').textContent = 'Error';
        document.getElementById('os-version').textContent = 'Error';
    });