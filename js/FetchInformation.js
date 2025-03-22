/**
 * Comprehensive Proxy & VPN Detection System
 * 
 * This system combines multiple detection methods:
 * 1. Direct security flags (from IP data providers)
 * 2. IP reputation database check
 * 3. ASN and ISP analysis
 * 4. Behavioral patterns & fingerprinting
 * 5. Geographic consistency check
 */

class ProxyVPNDetector {
    constructor(options = {}) {
      this.options = {
        ipstackApiKey: options.ipstackApiKey || 'YOUR_IPSTACK_API_KEY',
        ipQualityScoreApiKey: options.ipQualityScoreApiKey || 'YOUR_IPQUALITYSCORE_API_KEY',
        knownProxyASNs: options.knownProxyASNs || [
          14061, // DigitalOcean
          16509, // Amazon AWS
          14618, // Amazon AWS
          15169, // Google Cloud
          3356,  // Level3
          9009,  // M247
          4766,  // Korea Telecom
          9299,  // Philippine Long Distance Telephone Company
          6939,  // Hurricane Electric
        ],
        vpnKeywords: options.vpnKeywords || [
          'vpn', 'proxy', 'hosting', 'cloud', 'data center', 'server', 
          'anonymous', 'nord', 'express', 'hide', 'tor', 'exit'
        ],
        // Threshold for considering an IP suspicious (0-100)
        suspicionThreshold: options.suspicionThreshold || 65
      };
    }
  
    /**
     * Main method to analyze IP data and determine if it's a proxy/VPN
     * @param {Object} ipData - IP data from any provider (ipstack format)
     * @returns {Object} Analysis result
     */
    async analyzeIp(ipData) {
      // Collect all detection signals
      const signals = await Promise.all([
        this.checkDirectSecurityFlags(ipData),
        this.checkIPReputationDatabase(ipData.ip),
        this.analyzeAsnAndIsp(ipData),
        this.checkGeographicConsistency(ipData),
        this.fingerprint(ipData)
      ]);
  
      // Calculate overall suspicion score (0-100)
      const suspicionScore = this.calculateSuspicionScore(signals);
      
      // Make final determination
      const isProxy = suspicionScore >= this.options.suspicionThreshold;
      
      // Build detailed result
      return {
        ip: ipData.ip,
        isProxy,
        suspicionScore,
        signals,
        details: {
          directFlags: signals[0],
          reputationScore: signals[1],
          asnAnalysis: signals[2],
          geoConsistency: signals[3],
          fingerprintAnalysis: signals[4]
        },
        confidence: this.calculateConfidence(signals),
        recommendedAction: this.getRecommendedAction(suspicionScore)
      };
    }
  
    /**
     * Check direct security flags from IP data
     * @param {Object} ipData - IP data in ipstack format
     * @returns {Object} Security flags
     */
    checkDirectSecurityFlags(ipData) {
      // Extract security information if available
      const security = ipData.security || {};
      
      return {
        isExplicitProxy: security.is_proxy === true,
        proxyType: security.proxy_type,
        isTor: security.is_tor === true,
        isCrawler: security.is_crawler === true,
        threatLevel: security.threat_level,
        threatTypes: security.threat_types,
        suspicious: security.is_proxy === true || security.is_tor === true || security.threat_level !== "low"
      };
    }
  
    /**
     * Check IP against reputation databases
     * @param {String} ip - IP address to check
     * @returns {Object} Reputation data
     */
    async checkIPReputationDatabase(ip) {
      try {
        // Using IPQualityScore as an example reputation service
        const response = await fetch(`https://ipqualityscore.com/api/json/ip/${this.options.ipQualityScoreApiKey}/${ip}`);
        const data = await response.json();
        
        return {
          fraudScore: data.fraud_score,
          isProxy: data.proxy,
          isVpn: data.vpn,
          isTor: data.tor,
          isBot: data.bot_status,
          isDatacenter: data.connection_type === 'data_center',
          isCloudProvider: data.connection_type === 'cloud_provider',
          suspicious: data.proxy === true || data.vpn === true || data.tor === true || data.fraud_score > 75
        };
      } catch (error) {
        // Fallback if API call fails
        console.warn('IP reputation check failed:', error);
        return {
          fraudScore: 0,
          isProxy: false,
          isVpn: false,
          isTor: false,
          isBot: false,
          suspicious: false,
          error: error.message
        };
      }
    }
  
    /**
     * Analyze ASN and ISP information
     * @param {Object} ipData - IP data in ipstack format
     * @returns {Object} ASN analysis
     */
    analyzeAsnAndIsp(ipData) {
      const connection = ipData.connection || {};
      const asn = connection.asn;
      const isp = connection.isp || '';
      
      // Check if ASN is in known proxy/VPN provider list
      const isKnownProxyAsn = this.options.knownProxyASNs.includes(asn);
      
      // Check if ISP name contains VPN/proxy keywords
      const ispLower = isp.toLowerCase();
      const containsVpnKeyword = this.options.vpnKeywords.some(keyword => 
        ispLower.includes(keyword.toLowerCase())
      );
      
      return {
        asn,
        isp,
        isKnownProxyAsn,
        containsVpnKeyword,
        suspicious: isKnownProxyAsn || containsVpnKeyword
      };
    }
  
    /**
     * Check geographic data for consistency
     * @param {Object} ipData - IP data in ipstack format
     * @returns {Object} Geographic consistency analysis
     */
    checkGeographicConsistency(ipData) {
      // Timezone should match the region (unless near borders)
      const location = ipData.location || {};
      const timeZone = location.time_zone || {};
      const timeZoneId = timeZone.id || '';
      
      // Parse timezone to get region
      const tzRegion = timeZoneId.split('/')[0];
      const continentCode = ipData.continent_code;
      
      // Check if timezone matches continent (rough check)
      const timeZoneMatchesRegion = 
        (tzRegion === 'America' && continentCode === 'NA') ||
        (tzRegion === 'Europe' && continentCode === 'EU') ||
        (tzRegion === 'Asia' && continentCode === 'AS') ||
        (tzRegion === 'Africa' && continentCode === 'AF') ||
        (tzRegion === 'Australia' && (continentCode === 'OC' || continentCode === 'AU')) ||
        (tzRegion === 'Pacific' && continentCode === 'OC');
      
      // Check if location has appropriate precision 
      // (VPNs often have generic city-level data)
      const hasDetailedLocation = 
        ipData.latitude && 
        ipData.longitude && 
        ipData.city && 
        ipData.zip;
      
      return {
        timeZoneMatchesRegion,
        hasDetailedLocation,
        suspicious: !timeZoneMatchesRegion || !hasDetailedLocation
      };
    }
  
    /**
     * Browser/device fingerprinting analysis
     * @param {Object} ipData - IP data in ipstack format
     * @returns {Object} Fingerprint analysis
     */
    fingerprint(ipData) {
      // This is where you would implement browser/device fingerprinting
      // For demonstration, we'll return a placeholder
      
      return {
        // Placeholder for browser fingerprinting data
        userAgentConsistent: true,
        webRTCLeaks: false,
        canvasFingerprint: true,
        timeZoneOffset: true,
        suspicious: false,
        notes: "Fingerprinting would require client-side JS implementation"
      };
    }
  
    /**
     * Calculate overall suspicion score from all signals
     * @param {Array} signals - Collection of detection signals
     * @returns {Number} Suspicion score (0-100)
     */
    calculateSuspicionScore(signals) {
      // Weights for different detection methods
      const weights = {
        directFlags: 35,
        reputationScore: 25,
        asnAnalysis: 20,
        geoConsistency: 15,
        fingerprint: 5
      };
      
      // Calculate weighted score
      let score = 0;
      
      // Direct security flags
      if (signals[0].suspicious) {
        score += weights.directFlags;
      }
      
      // IP reputation score
      if (signals[1].suspicious) {
        score += weights.reputationScore;
      }
      
      // ASN and ISP analysis
      if (signals[2].suspicious) {
        score += weights.asnAnalysis;
      }
      
      // Geographic consistency
      if (signals[3].suspicious) {
        score += weights.geoConsistency;
      }
      
      // Fingerprinting
      if (signals[4].suspicious) {
        score += weights.fingerprint;
      }
      
      return score;
    }
  
    /**
     * Calculate confidence in the detection (0-100)
     * @param {Array} signals - Collection of detection signals
     * @returns {Number} Confidence score
     */
    calculateConfidence(signals) {
      // Count how many signals were successfully analyzed
      const totalSignals = signals.length;
      const validSignals = signals.filter(signal => !signal.error).length;
      
      // Base confidence on proportion of valid signals
      const baseConfidence = (validSignals / totalSignals) * 100;
      
      // Adjust confidence based on agreement among signals
      const suspiciousCount = signals.filter(signal => signal.suspicious).length;
      const agreement = Math.abs((suspiciousCount / validSignals) - 0.5) * 2;
      
      return Math.round(baseConfidence * (0.7 + (agreement * 0.3)));
    }
  
    /**
     * Get recommended action based on suspicion score
     * @param {Number} suspicionScore - Overall suspicion score
     * @returns {String} Recommended action
     */
    getRecommendedAction(suspicionScore) {
      if (suspicionScore >= 85) {
        return "block";
      } else if (suspicionScore >= 65) {
        return "challenge";
      } else if (suspicionScore >= 40) {
        return "monitor";
      } else {
        return "allow";
      }
    }
  }
  
  // Example usage:
  async function detectProxy(ipAddress) {
    // First, fetch IP data from ipstack
    try {
      const apiKey = 'YOUR_IPSTACK_API_KEY';
      const response = await fetch(`https://api.ipstack.com/${ipAddress}?access_key=${apiKey}&security=1`);
      const ipData = await response.json();
      
      // Create detector instance
      const detector = new ProxyVPNDetector({
        ipstackApiKey: apiKey,
        ipQualityScoreApiKey: 'YOUR_IPQUALITYSCORE_API_KEY'
      });
      
      // Analyze the IP
      const result = await detector.analyzeIp(ipData);
      
      return result;
    } catch (error) {
      console.error('Proxy detection failed:', error);
      return {
        error: 'Failed to analyze IP address',
        details: error.message
      };
    }
  }
  
  // For HTTP/HTTPS websites, you would integrate this with your server
  // Example for Express.js:
  /*
  const express = require('express');
  const app = express();
  
  app.use(async (req, res, next) => {
    const clientIp = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
    // Clean the IP (remove IPv6 prefix if present)
    const cleanIp = clientIp.replace(/^::ffff:/, '');
    
    // Detect if proxy/VPN
    const result = await detectProxy(cleanIp);
    
    if (result.isProxy && result.recommendedAction === 'block') {
      return res.status(403).send('Access denied: Proxy or VPN detected');
    }
    
    // For challenge action, you might implement additional verification
    if (result.recommendedAction === 'challenge') {
      // Store detection result for this session
      req.session.proxyDetection = result;
      
      // For suspicious but not confirmed proxies, you might:
      // 1. Add extra CAPTCHA
      // 2. Limit functionality
      // 3. Apply stricter rate limits
    }
    
    next();
  });
  */
  
  // For browser-based detection (client-side):
  /*
  // This would be additional JavaScript to run in the browser
  // to enhance server-side detection
  function detectBrowserVPN() {
    const checks = [];
    
    // Check for WebRTC leaks
    checks.push(new Promise(resolve => {
      const pc = new RTCPeerConnection({iceServers: [{urls: "stun:stun.l.google.com:19302"}]});
      pc.createDataChannel("");
      pc.onicecandidate = (e) => {
        if (!e.candidate) return;
        // Look for non-local IP addresses
        const ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/;
        const ipMatch = ipRegex.exec(e.candidate.candidate);
        if (ipMatch) {
          const ip = ipMatch[1];
          if (ip.substr(0,3) !== "10." && 
              ip.substr(0,4) !== "172." && 
              ip.substr(0,4) !== "192.") {
            resolve({
              webRTCLeaks: true,
              foundIp: ip
            });
          }
        }
        setTimeout(() => resolve({webRTCLeaks: false}), 1000);
      };
      pc.createOffer().then(offer => pc.setLocalDescription(offer));
    }));
    
    // Check time zone consistency
    checks.push(new Promise(resolve => {
      const browserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      // Send to server to compare with IP-based timezone
      fetch('/api/check-timezone', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({timezone: browserTimeZone})
      })
      .then(response => response.json())
      .then(data => resolve(data))
      .catch(() => resolve({timeZoneMatch: null}));
    }));
    
    return Promise.all(checks).then(results => {
      return {
        clientChecks: results,
        isSuspicious: results.some(r => r.webRTCLeaks || r.timeZoneMatch === false)
      };
    });
  }
  */
  
  // Export for Node.js environments
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ProxyVPNDetector, detectProxy };
  }