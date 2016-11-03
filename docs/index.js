// assuming the app is served by express js
var express = require('express');
var YAML = require('yamljs');
var fs = require('fs');
var lodash = require('lodash');
var path = require('path');
var async = require('async');
var assert = require('assert');
var marked = require('marked');
var puml = require('node-plantuml');
var jade = require('jade');

/**
 * Recursively walk a plain JSON Object's properties, and invoke given iterator on each.
 * Optionally provide a filter, which decides(returns true/false) that iterator will be invoked or not.
 * @param {Object} json - json object to walk
 * @param {Function} [filter] - filter function.
 * @param {Function} iterator - iterator function.
 */
function jsonWalk(json,filter,iterator){

    if(!lodash.isPlainObject(json)){
        throw new Error('json must be a plain JSON Object');
    }

    if(!lodash.isFunction(iterator) && lodash.isFunction(filter)){
        iterator = filter;
        filter = null;
    }else if(!lodash.isFunction(iterator) && !lodash.isFunction(filter)) {
        throw new Error('iterator and filter(if provided) must be functions.');
    }

    // iterate own properties
    lodash.forOwn(json,function(value,key){
        // recurse into plain objects
        if(lodash.isPlainObject(value)){
            jsonWalk(value,filter,iterator);
        }else{
            // if no filter or filter accepts, invoke iterator.
            if(!filter || (filter && filter(key,value,json))) {
                iterator(key, value, json);
            }
        }
    });
}

/**
 * Generates JSON from provided YAML file. With a special feature that,
 * if any key in YAML refers to another YAML file via pattern 'file:<relative path>',
 * that YAML file is loaded and appended as value of the key, and so on, recursively.
 * Also, if referred file is a directory, .yaml/.md files in it are parsed into a JSON object
 * with file names as keys, and file JSON/Text contents as values.
 * @param {String} file - root YAML file.
 * @param {Function} callback - called with error and parsed JSON data.
 */
function jsonGen(file,callback) {

    if (!lodash.isString(file)) {
        throw new Error("file argument must be a String.");
    }

    if (!lodash.isFunction(callback)) {
        throw new Error("callback must be a Function.");
    }

    async.waterfall([

        function(cb){
            // stat the file
            fs.stat(file,cb);
        },

        function(stat,cb){
            if(stat.isFile()) {
                // read bytes
                fs.readFile(file, cb);
            }else{
                // list files in directory
                fs.readdir(file,cb);
            }
        },

        function(bytesOrFiles,cb){

            if(lodash.isArray(bytesOrFiles)){

                // file list, make a json object with file: refs.
                var files = bytesOrFiles.map(function(f){return path.join(file,f)});

                // for each file, stat it, and add file: refs.
                async.reduce(files,{},function(memo,item,cb){

                    fs.stat(item,function(err,stat){

                        if(err){
                            cb()
                        }else {

                            // add refs only for directories, .yaml and .md files.
                            if (stat.isDirectory() || path.extname(item) === '.yaml' || path.extname(item) === '.md') {
                                var key = stat.isDirectory() ? path.basename(item) : path.basename(item, path.extname(item));
                                memo[key] = 'file:/' + path.join(path.basename(file), path.basename(item));
                            }

                            cb(null, memo);
                        }
                    });

                },cb)

            }else{
                // single file bytes, parse and forward
                try{
                    cb(null,YAML.parse(bytesOrFiles.toString()));
                }catch(e){
                    cb(new Error("Failed to parse yaml: "+file+". "+e.message));
                }
            }
        },

        function(parsed,cb){
            // json key filter of file: pattern values
            var filter = function(key,value){
                return lodash.isString(value) && lodash.startsWith(value, 'file:');
            };

            // async series functions holder.
            var fns = [];

            // recursively process each file: reference
            var iterator = function(key,value,parent){

                // extract full file path from reference
                var nextFile = path.join(path.dirname(file), lodash.trimLeft(value, 'file:'));

                fns.push(function (cb1) {
                    // schedule recursive call for that file
                    if (path.extname(nextFile) === '.md'){
                        fs.readFile(nextFile,function(err,data){
                            parent[key] = data ?  data.toString() : null;
                            cb1(err);
                        });
                    }else{
                        jsonGen(nextFile, function (err, data) {
                            // append resolved reference as value of parent key
                            parent[key] = data;
                            cb1(err);
                        });
                    }
                });
            };

            // scan Parsed json
            jsonWalk(parsed,filter,iterator);

            // run recursive parsing
            async.series(fns,function(err){
                // return root object of root file.
                cb(err,parsed);
            })
        }

    ],callback);
}

/**
 * Generates HTML from given markdown file path.
 * @param {String} file - file path.
 * @param {function(Error,String)} callback - callback function.
 */
function mdGen(file,callback){
    async.waterfall([
        function(cb){
            fs.exists(file,function(exists){
                cb(null,exists);
            });
        },
        function(exists,cb){
            if(!exists){
                callback(new Error('file not found.'),null);
            }else{
                fs.stat(file,cb);
            }
        },
        function(stat,cb){
            if(stat.isDirectory()){
                callback(new Error('file path is a directory.'),null);
            }else{
                fs.readFile(file,cb);
            }
        },
        function(data,cb){
            marked(data.toString(),cb);
        }
    ],callback);
}

/**
 * Generates svg diagram from uml file and pipes it to response.
 * @param {String}file - uml file
 * @param {Object} req - request.
 * @param {Object} res - response.
 */
function umlGenSend(file,req,res){
    fs.stat(file,function(err,stat){
        if(err){
            res.status(404);
            res.send('file not found.');
        }else{
            var eTag = ''+stat.mtime.getTime();
            if(eTag === req.get('If-None-Match')) {
                res.status(304); // not modified
                res.end();
            }else{
                var gen = puml.generate(file, {format: 'svg'});
                res.status(200);
                res.set('Content-Type', 'image/svg+xml');
                res.set('ETag',eTag);
                gen.out.pipe(res);
            }
        }
    });
}

/**
 * Serves Swagger UI for API docs under the /docs path.
 * Also serves combined yaml documentation as JSON under /docs/json path.
 * @param  {Object} router - An instance of ExpressJS Router, or the app itself.
 */
function serveDocs(router){

    // serves the swagger ui
    var uiStatic = express.static(path.resolve(__dirname)+'/ui',{index:'index.html'});

    // collates yaml docs and serves as json
    var jsonStatic = function(req,res,next){
        // generate combined JSON from yaml files
        jsonGen(path.resolve(__dirname)+'/yaml/main.yaml',function(err,data){
            if(err){
                console.log(err);
                next(err);

            }else{
                res.json(data);
                // don't invoke further middleware
            }
        })
    };

    // serves up markdown files as html, using md.jade template
    var templateMd = path.join(path.resolve(__dirname),'md.jade');
    var jadeGenMd = jade.compile(fs.readFileSync(templateMd).toString(),{filename:templateMd});
    var mdStatic = function(req,res,next){
        var filePath = path.join(path.resolve(__dirname),req.path.replace("/docs",""));
        mdGen(filePath,function(err,html){
            if(err){
                res.status(500);
                res.send(err.message ? err.message : err);
            }else{
                res.status(200);
                res.send(jadeGenMd({
                    html_content:html
                }));
            }
        });
    };

    // serves svg images for plant uml files
    var umlStatic = function(req,res,next){
        var filePath = path.join(path.resolve(__dirname),req.path.replace("/docs",""));
        umlGenSend(filePath,req,res);
    };

    // serves api_errors in jade template
    var templateErr = path.join(path.resolve(__dirname),'errors.jade');
    var jadeGenErr = jade.compile(fs.readFileSync(templateErr).toString(),{filename:templateErr});
    var errorsStatic = function(req,res,next){
        res.status(200);
        res.send(jadeGenErr({
            api_errors:require('../assets/api_errors')
        }));
    };

    // serves api_errors in jade template
    var templateEvt = path.join(path.resolve(__dirname),'events.jade');
    var jadeGenEvt = jade.compile(fs.readFileSync(templateEvt).toString(),{filename:templateErr});
    var eventsStatic = function(req,res,next){
        res.status(200);
        res.send(jadeGenEvt({
            api_events:require('../assets/api_events')
        }));
    };

    // add serving middleware to appropriate path, default to 404 for paths not served under /docs/
    router.get('/docs/*.md',mdStatic);
    router.get('/docs/*.puml',umlStatic);
    router.get('/docs/json',jsonStatic);
    router.get('/docs/api_errors',errorsStatic);
    router.get('/docs/api_events',eventsStatic);
    router.use('/docs/',uiStatic);
    router.use('/docs/*',function(req,res,next){
        res.status(404);
        res.send('file not found.');
    });

}

// export for external use
module.exports = {'serve':serveDocs};
