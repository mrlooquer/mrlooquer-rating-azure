const debug = require('debug')('ml-rating:main');
const factory = require('./services/event.factory');

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');
    const event = req.body;
    const service = factory(event)
    if (!service) {
        return;
    }
    await service.treatEvent(event);    
    context.res = {
        // status: 200, /* Defaults to 200 */
        body: 'Done'
    };
};