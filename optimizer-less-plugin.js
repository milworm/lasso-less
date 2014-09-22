var LessParser = null;
var lessPath = null;
try {
    lessPath = require.resolve('less');
} catch(e) {}

if (lessPath) {
    LessParser = require(lessPath).Parser;
}

var fs = require('fs');

var nodePath = require('path');
var logger = require('raptor-logging').logger(module);

module.exports = function(optimizer, config) {
    optimizer.dependencies.registerStyleSheetType(
        'less',
        {
            properties: {
                'path': 'string',
                'paths': 'string'
            },

            init: function(optimizerContext, callback) {
                if (!this.path) {
                    return callback(new Error('"path" is required for a less dependency'));
                }

                if (!LessParser) {
                    return callback(new Error('Unable to handle Less dependency for path "' + this.path + '". The "less" module was not found. This module should be installed as a top-level application module.'));
                }

                this.path = this.resolvePath(this.path);
                callback();
            },

            read: function(optimizerContext, callback) {
                var path = this.path;

                fs.readFile(path, {encoding: 'utf8'}, function(err, lessCode) {
                    if (err) {
                        return callback(err);
                    }

                    var paths = [nodePath.dirname(path)];
                    if (require.main && require.main.paths) {
                        paths = paths.concat(require.main.paths);
                    }
                    var parser = new LessParser({
                        filename: path,
                        paths: paths
                    });

                    logger.info('Parsing LESS file at path: ' + path);

                    parser.parse(lessCode, function(err, tree) {
                        if (err) {
                            logger.error('Error building LESS file ' + path, err);

                            if (err.hasOwnProperty('line')) {
                                callback(
                                    new Error('Error compiling LESS file (' +
                                        err.filename + ':' + err.line + ':' + err.column + ') - ' +
                                        err.message));
                            } else {
                                callback(err);
                            }
                            return;
                        }

                        logger.info('Finished parsing LESS file at path: ' + path);
                        callback(null, tree.toCSS(config));
                    });
                });
            },

            getSourceFile: function() {
                return this.path;
            },

            getLastModified: function(optimizerContext, callback) {
                return callback(null, -1);
            }
        });
};