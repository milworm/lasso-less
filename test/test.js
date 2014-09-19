'use strict';
var chai = require('chai');
chai.config.includeStack = true;
require('chai').should();
var expect = require('chai').expect;
var nodePath = require('path');
var fs = require('fs');

var lessPlugin = require('../'); // Load this module just to make sure it works
var optimizer = require('optimizer');

describe('optimizer-less' , function() {

    beforeEach(function(done) {
        for (var k in require.cache) {
            if (require.cache.hasOwnProperty(k)) {
                delete require.cache[k];
            }
        }
        done();
    });

    it('should render a simple less dependency', function(done) {

        var pageOptimizer = optimizer.create({
                fileWriter: {
                    fingerprintsEnabled: false,
                    outputDir: nodePath.join(__dirname, 'static')
                },
                bundlingEnabled: true,
                plugins: [
                    {
                        plugin: lessPlugin,
                        config: {

                        }
                    }
                ]
            });

        pageOptimizer.optimizePage({
                name: 'testPage',
                dependencies: [
                    nodePath.join(__dirname, 'fixtures/simple.less')
                ]
            },
            function(err, optimizedPage) {
                if (err) {
                    return done(err);
                }

                var output = fs.readFileSync(nodePath.join(__dirname, 'static/testPage.css'), 'utf8');
                expect(output).to.equal("#header {\n  color: #5b83ad;\n}\n");
                done();
            });
    });

});
