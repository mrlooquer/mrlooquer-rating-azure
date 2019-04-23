const VMService = require('./vm.service');
const debug = require('debug')('ml-rating:main');
module.exports = function(event) {
    debug('New event');
    if (event.data && event.data.context && event.data.context.activityLog) {
        switch(event.data.context.activityLog.resourceType) {
            case 'Microsoft.Compute/virtualMachines':
                return VMService;
        
            default:
                debug('Event not supported');
        }
    } else {
        debug('ERROR: Event not supported');
        debug(JSON.stringify(event));
    }
}