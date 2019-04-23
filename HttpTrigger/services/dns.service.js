const dns = require('dns');

class DNSService {
    static async getCNAME(domain) {
        return new Promise((resolve, reject) => {
            dns.resolve(domain, 'CNAME', (err, result) => {
                if (err){
                    reject(err);
                    return;
                }
                resolve(result);
            })
        })
        
    }

    static async getIP(domain) {
        return new Promise((resolve, reject) => {
            dns.resolve(domain, (err, result) => {
                if (err){
                    reject(err);
                    return;
                }
                resolve(result);
            })
        })
    }
}

module.exports = DNSService;