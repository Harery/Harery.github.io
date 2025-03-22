class ProxyVPNDetector {
    constructor(options = {}) {
      this.options = {
        workerUrl: options.workerUrl || 'https://proxy-vpn-api.yourusername.workers.dev',
        suspicionThreshold: options.suspicionThreshold || 65
      };
    }
  
    async fetchIpData(ip) {
      const url = `${this.options.workerUrl}?ip=${ip}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch data');
      return await response.json();
    }
  
    async analyzeIp(ip) {
      const { ipData, reputationData } = await this.fetchIpData(ip);
      const suspicionScore = reputationData.fraud_score + (reputationData.proxy ? 25 : 0) +
                            (reputationData.vpn ? 25 : 0) + (reputationData.tor ? 50 : 0);
      const recommendedAction = suspicionScore >= this.options.suspicionThreshold ? 'block' : 'allow';
      return { ip, suspicionScore, recommendedAction, ...reputationData, ipData };
    }
  }
  
  if (typeof window !== 'undefined') {
    window.ProxyVPNDetector = ProxyVPNDetector;
  }