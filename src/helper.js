var exports = module.exports = {};
var Q = require('q');
var needle = require('needle');

function sendGetRequest(data) {
    console.log('sendGetRequest', data.request_url);
    var deferred = Q.defer();
    try {
        needle.get(data.request_url, function(error, response) {
            if (error) {
                data.error_message = error.toString();
                deferred.reject(data);
            }
            if (response) {
                data.post_response = response.body;
                deferred.resolve(data);
            }
        });
    } catch (error) {
        data.error_message = 'malformed post body';
        deferred.reject(data);
    }

    return deferred.promise;
}

exports.sendGetRequest = sendGetRequest;