const rp = require('request-promise');
const debug = require('debug')('ml-rating:api');
module.exports = function() {
    process.env.API_URL = 'https://rating.mrlooquer.com';

    async function createAsset(ip, tags, domains = []) {
        debug('Creating ip ' + ip + ' with tags ' + tags ? tags.join(','):'');
        debug('sending');
        const res = await rp({
            uri: process.env.API_URL+'/api/v1/asset',
            method: 'POST',
            json: true,
            headers: {
                'Authorization': 'Bearer ' + process.env.API_TOKEN
            },
            body: {
                ip,
                tags,
                domains
            }
        });
        debug('Created in ' + res.company.name + ' ' + res.company.id);
    }

    async function deleteAsset(ip) {
        debug('Deleting ip ' + ip);
        await rp({
            uri: process.env.API_URL+'/api/v1/asset/' + ip,
            method: 'DELETE',
            json: true,
            headers: {
                'Authorization': 'Bearer ' + process.env.API_TOKEN
            }
        });
    }


    return {
        createAsset,
        deleteAsset
    };
}();