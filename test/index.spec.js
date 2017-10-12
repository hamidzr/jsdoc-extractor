const assert = require('assert'),
    jp = require('../index.js');

describe('fnFinder', () => {
    testText = `let doStuff = a => a*2;
var awsomeFN = a => a*2;
var doStuff = (s) => a*2;
var doStuff = (s) -> a*2;
function doStuff(){}
GoogleMap.doStuff = function
GoogleMap.doStuff = (asdf) =>
module.exports = { methodName: doStuff }`;

    testLines = testText.split('\n');

    it('should support multiline', () => {
        assert.deepEqual(jp.findFn(testLines[2]), 'doStuff');
    });

    it('should find let fn = ()', () => {
        let line = 'let reverseGeocode = (lat, lon, response, query)=>{';
        assert.deepEqual(jp.findFn(line), 'reverseGeocode');
    });

    it('should fiind obj.ojb = function', () => {
        let line = '    GeoLocationRPC.geolocate = function (address) {';
        assert.deepEqual(jp.findFn(line), 'geolocate');
    });
});
