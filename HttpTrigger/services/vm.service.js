const rp = require('request-promise');
const API = require('./api.service');
const debug = require('debug')('ml-rating:vm');

const tenantId = process.env['TENANT_ID'];
const clientId = process.env['CLIENT_ID'];
const clientSecret = process.env['CLIENT_SECRET'];
const resource = process.env['RESOURCE'];


const url = `https://login.microsoftonline.com/${tenantId}/oauth2/token`

module.exports = function () {


    async function getToken() {
        const res = await rp({
            uri: url,
            method: 'POST',
            form: {
                resource,
                grant_type: 'client_credentials',
                client_id: clientId,
                client_secret: clientSecret,
            },
            json: true
        });
        return res.access_token;
    }

    async function executeUrl(path, apiVersion, token) {
        const res = await rp({
            uri: `${resource}${path}?api-version=${apiVersion}`,
            headers: {
                Authorization: `Bearer ${token}`
            },
            method: 'GET',
            json: true
        });
        return res;
    }

    async function createVM(url){
        debug('Obtaining vm of url ' +  url);
        const token = await getToken();
        const vm = await executeUrl(url, '2019-03-01', token);
        if (vm && vm.properties && vm.properties.networkProfile && vm.properties.networkProfile.networkInterfaces) {
            for (let i = 0; i < vm.properties.networkProfile.networkInterfaces.length; i++) {
                debug('NetworkInt ' + i);
                const pathNetInt = vm.properties.networkProfile.networkInterfaces[i].id;
                const netInt = await executeUrl(pathNetInt, '2019-02-01', token);
                if (netInt && netInt.properties && netInt.properties.ipConfigurations && netInt.properties.ipConfigurations ) {
                    for (let j = 0; j < netInt.properties.ipConfigurations.length; j++) {
                        debug('IPConf ' + j);
                        const ipConf = netInt.properties.ipConfigurations[j];
                        if (ipConf.properties && ipConf.properties.publicIPAddress && ipConf.properties.publicIPAddress.id) {
                            const ipInfo = await executeUrl(ipConf.properties.publicIPAddress.id, '2019-02-01', token);
                            if (ipInfo && ipInfo.properties && ipInfo.properties.ipAddress) {
                                debug('Creating ip ' + ipInfo.properties.ipAddress);
                                const ip = ipInfo.properties.ipAddress;
                                const tags = [
                                    `vmId:${vm.properties.vmId}`,
                                    `Azure`,
                                    `location:${netInt.location}`
                                ];
                                if (ipInfo.tags){ 
                                    Object.keys(ipInfo.tags).forEach(key => {
                                        tags.push(`${key}:${ipInfo.tags[key]}`);
                                    });
                                }
                                await API.createAsset(ip, tags);
                            }
                        }
                    }
                }
            }
        }

    } 

    async function treatEvent(event) {
        debug('VM event ' + event.data.context.activityLog.operationName);
        debug(JSON.stringify(event));
        try {
            switch(event.data.context.activityLog.operationName) {
                case 'Microsoft.Compute/virtualMachines/write':
                    if (event.data.context.activityLog.status !== 'Succeeded') {
                        debug('Status not allowed');
                        return;
                    }
                    await createVM(event.data.context.activityLog.authorization.scope);
            }
        } catch (err) {
            debug('Error treating error', err);
        }
    }

    return {
        treatEvent
    };
}();