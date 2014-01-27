var requirejs, require, define;

!function(global) {
    function isFunction(it) {
        return "[object Function]" === ostring.call(it);
    }
    function isArray(it) {
        return "[object Array]" === ostring.call(it);
    }
    function each(ary, func) {
        if (ary) {
            var i;
            for (i = 0; i < ary.length && (!ary[i] || !func(ary[i], i, ary)); i += 1) ;
        }
    }
    function eachReverse(ary, func) {
        if (ary) {
            var i;
            for (i = ary.length - 1; i > -1 && (!ary[i] || !func(ary[i], i, ary)); i -= 1) ;
        }
    }
    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }
    function getOwn(obj, prop) {
        return hasProp(obj, prop) && obj[prop];
    }
    function eachProp(obj, func) {
        var prop;
        for (prop in obj) if (hasProp(obj, prop) && func(obj[prop], prop)) break;
    }
    function mixin(target, source, force, deepStringMixin) {
        return source && eachProp(source, function(value, prop) {
            (force || !hasProp(target, prop)) && (!deepStringMixin || "object" != typeof value || !value || isArray(value) || isFunction(value) || value instanceof RegExp ? target[prop] = value : (target[prop] || (target[prop] = {}), 
            mixin(target[prop], value, force, deepStringMixin)));
        }), target;
    }
    function bind(obj, fn) {
        return function() {
            return fn.apply(obj, arguments);
        };
    }
    function scripts() {
        return document.getElementsByTagName("script");
    }
    function defaultOnError(err) {
        throw err;
    }
    function getGlobal(value) {
        if (!value) return value;
        var g = global;
        return each(value.split("."), function(part) {
            g = g[part];
        }), g;
    }
    function makeError(id, msg, err, requireModules) {
        var e = new Error(msg + "\nhttp://requirejs.org/docs/errors.html#" + id);
        return e.requireType = id, e.requireModules = requireModules, err && (e.originalError = err), 
        e;
    }
    function newContext(contextName) {
        function trimDots(ary) {
            var i, part, length = ary.length;
            for (i = 0; length > i; i++) if (part = ary[i], "." === part) ary.splice(i, 1), 
            i -= 1; else if (".." === part) {
                if (1 === i && (".." === ary[2] || ".." === ary[0])) break;
                i > 0 && (ary.splice(i - 1, 2), i -= 2);
            }
        }
        function normalize(name, baseName, applyMap) {
            var pkgMain, mapValue, nameParts, i, j, nameSegment, lastIndex, foundMap, foundI, foundStarMap, starI, baseParts = baseName && baseName.split("/"), normalizedBaseParts = baseParts, map = config.map, starMap = map && map["*"];
            if (name && "." === name.charAt(0) && (baseName ? (normalizedBaseParts = baseParts.slice(0, baseParts.length - 1), 
            name = name.split("/"), lastIndex = name.length - 1, config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex]) && (name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, "")), 
            name = normalizedBaseParts.concat(name), trimDots(name), name = name.join("/")) : 0 === name.indexOf("./") && (name = name.substring(2))), 
            applyMap && map && (baseParts || starMap)) {
                nameParts = name.split("/");
                outerLoop: for (i = nameParts.length; i > 0; i -= 1) {
                    if (nameSegment = nameParts.slice(0, i).join("/"), baseParts) for (j = baseParts.length; j > 0; j -= 1) if (mapValue = getOwn(map, baseParts.slice(0, j).join("/")), 
                    mapValue && (mapValue = getOwn(mapValue, nameSegment))) {
                        foundMap = mapValue, foundI = i;
                        break outerLoop;
                    }
                    !foundStarMap && starMap && getOwn(starMap, nameSegment) && (foundStarMap = getOwn(starMap, nameSegment), 
                    starI = i);
                }
                !foundMap && foundStarMap && (foundMap = foundStarMap, foundI = starI), foundMap && (nameParts.splice(0, foundI, foundMap), 
                name = nameParts.join("/"));
            }
            return pkgMain = getOwn(config.pkgs, name), pkgMain ? pkgMain : name;
        }
        function removeScript(name) {
            isBrowser && each(scripts(), function(scriptNode) {
                return scriptNode.getAttribute("data-requiremodule") === name && scriptNode.getAttribute("data-requirecontext") === context.contextName ? (scriptNode.parentNode.removeChild(scriptNode), 
                !0) : void 0;
            });
        }
        function hasPathFallback(id) {
            var pathConfig = getOwn(config.paths, id);
            return pathConfig && isArray(pathConfig) && pathConfig.length > 1 ? (pathConfig.shift(), 
            context.require.undef(id), context.require([ id ]), !0) : void 0;
        }
        function splitPrefix(name) {
            var prefix, index = name ? name.indexOf("!") : -1;
            return index > -1 && (prefix = name.substring(0, index), name = name.substring(index + 1, name.length)), 
            [ prefix, name ];
        }
        function makeModuleMap(name, parentModuleMap, isNormalized, applyMap) {
            var url, pluginModule, suffix, nameParts, prefix = null, parentName = parentModuleMap ? parentModuleMap.name : null, originalName = name, isDefine = !0, normalizedName = "";
            return name || (isDefine = !1, name = "_@r" + (requireCounter += 1)), nameParts = splitPrefix(name), 
            prefix = nameParts[0], name = nameParts[1], prefix && (prefix = normalize(prefix, parentName, applyMap), 
            pluginModule = getOwn(defined, prefix)), name && (prefix ? normalizedName = pluginModule && pluginModule.normalize ? pluginModule.normalize(name, function(name) {
                return normalize(name, parentName, applyMap);
            }) : normalize(name, parentName, applyMap) : (normalizedName = normalize(name, parentName, applyMap), 
            nameParts = splitPrefix(normalizedName), prefix = nameParts[0], normalizedName = nameParts[1], 
            isNormalized = !0, url = context.nameToUrl(normalizedName))), suffix = !prefix || pluginModule || isNormalized ? "" : "_unnormalized" + (unnormalizedCounter += 1), 
            {
                prefix: prefix,
                name: normalizedName,
                parentMap: parentModuleMap,
                unnormalized: !!suffix,
                url: url,
                originalName: originalName,
                isDefine: isDefine,
                id: (prefix ? prefix + "!" + normalizedName : normalizedName) + suffix
            };
        }
        function getModule(depMap) {
            var id = depMap.id, mod = getOwn(registry, id);
            return mod || (mod = registry[id] = new context.Module(depMap)), mod;
        }
        function on(depMap, name, fn) {
            var id = depMap.id, mod = getOwn(registry, id);
            !hasProp(defined, id) || mod && !mod.defineEmitComplete ? (mod = getModule(depMap), 
            mod.error && "error" === name ? fn(mod.error) : mod.on(name, fn)) : "defined" === name && fn(defined[id]);
        }
        function onError(err, errback) {
            var ids = err.requireModules, notified = !1;
            errback ? errback(err) : (each(ids, function(id) {
                var mod = getOwn(registry, id);
                mod && (mod.error = err, mod.events.error && (notified = !0, mod.emit("error", err)));
            }), notified || req.onError(err));
        }
        function takeGlobalQueue() {
            globalDefQueue.length && (apsp.apply(defQueue, [ defQueue.length, 0 ].concat(globalDefQueue)), 
            globalDefQueue = []);
        }
        function cleanRegistry(id) {
            delete registry[id], delete enabledRegistry[id];
        }
        function breakCycle(mod, traced, processed) {
            var id = mod.map.id;
            mod.error ? mod.emit("error", mod.error) : (traced[id] = !0, each(mod.depMaps, function(depMap, i) {
                var depId = depMap.id, dep = getOwn(registry, depId);
                !dep || mod.depMatched[i] || processed[depId] || (getOwn(traced, depId) ? (mod.defineDep(i, defined[depId]), 
                mod.check()) : breakCycle(dep, traced, processed));
            }), processed[id] = !0);
        }
        function checkLoaded() {
            var err, usingPathFallback, waitInterval = 1e3 * config.waitSeconds, expired = waitInterval && context.startTime + waitInterval < new Date().getTime(), noLoads = [], reqCalls = [], stillLoading = !1, needCycleCheck = !0;
            if (!inCheckLoaded) {
                if (inCheckLoaded = !0, eachProp(enabledRegistry, function(mod) {
                    var map = mod.map, modId = map.id;
                    if (mod.enabled && (map.isDefine || reqCalls.push(mod), !mod.error)) if (!mod.inited && expired) hasPathFallback(modId) ? (usingPathFallback = !0, 
                    stillLoading = !0) : (noLoads.push(modId), removeScript(modId)); else if (!mod.inited && mod.fetched && map.isDefine && (stillLoading = !0, 
                    !map.prefix)) return needCycleCheck = !1;
                }), expired && noLoads.length) return err = makeError("timeout", "Load timeout for modules: " + noLoads, null, noLoads), 
                err.contextName = context.contextName, onError(err);
                needCycleCheck && each(reqCalls, function(mod) {
                    breakCycle(mod, {}, {});
                }), expired && !usingPathFallback || !stillLoading || !isBrowser && !isWebWorker || checkLoadedTimeoutId || (checkLoadedTimeoutId = setTimeout(function() {
                    checkLoadedTimeoutId = 0, checkLoaded();
                }, 50)), inCheckLoaded = !1;
            }
        }
        function callGetModule(args) {
            hasProp(defined, args[0]) || getModule(makeModuleMap(args[0], null, !0)).init(args[1], args[2]);
        }
        function removeListener(node, func, name, ieName) {
            node.detachEvent && !isOpera ? ieName && node.detachEvent(ieName, func) : node.removeEventListener(name, func, !1);
        }
        function getScriptData(evt) {
            var node = evt.currentTarget || evt.srcElement;
            return removeListener(node, context.onScriptLoad, "load", "onreadystatechange"), 
            removeListener(node, context.onScriptError, "error"), {
                node: node,
                id: node && node.getAttribute("data-requiremodule")
            };
        }
        function intakeDefines() {
            var args;
            for (takeGlobalQueue(); defQueue.length; ) {
                if (args = defQueue.shift(), null === args[0]) return onError(makeError("mismatch", "Mismatched anonymous define() module: " + args[args.length - 1]));
                callGetModule(args);
            }
        }
        var inCheckLoaded, Module, context, handlers, checkLoadedTimeoutId, config = {
            waitSeconds: 7,
            baseUrl: "./",
            paths: {},
            bundles: {},
            pkgs: {},
            shim: {},
            config: {}
        }, registry = {}, enabledRegistry = {}, undefEvents = {}, defQueue = [], defined = {}, urlFetched = {}, bundlesMap = {}, requireCounter = 1, unnormalizedCounter = 1;
        return handlers = {
            require: function(mod) {
                return mod.require ? mod.require : mod.require = context.makeRequire(mod.map);
            },
            exports: function(mod) {
                return mod.usingExports = !0, mod.map.isDefine ? mod.exports ? mod.exports : mod.exports = defined[mod.map.id] = {} : void 0;
            },
            module: function(mod) {
                return mod.module ? mod.module : mod.module = {
                    id: mod.map.id,
                    uri: mod.map.url,
                    config: function() {
                        return getOwn(config.config, mod.map.id) || {};
                    },
                    exports: handlers.exports(mod)
                };
            }
        }, Module = function(map) {
            this.events = getOwn(undefEvents, map.id) || {}, this.map = map, this.shim = getOwn(config.shim, map.id), 
            this.depExports = [], this.depMaps = [], this.depMatched = [], this.pluginMaps = {}, 
            this.depCount = 0;
        }, Module.prototype = {
            init: function(depMaps, factory, errback, options) {
                options = options || {}, this.inited || (this.factory = factory, errback ? this.on("error", errback) : this.events.error && (errback = bind(this, function(err) {
                    this.emit("error", err);
                })), this.depMaps = depMaps && depMaps.slice(0), this.errback = errback, this.inited = !0, 
                this.ignore = options.ignore, options.enabled || this.enabled ? this.enable() : this.check());
            },
            defineDep: function(i, depExports) {
                this.depMatched[i] || (this.depMatched[i] = !0, this.depCount -= 1, this.depExports[i] = depExports);
            },
            fetch: function() {
                if (!this.fetched) {
                    this.fetched = !0, context.startTime = new Date().getTime();
                    var map = this.map;
                    return this.shim ? void context.makeRequire(this.map, {
                        enableBuildCallback: !0
                    })(this.shim.deps || [], bind(this, function() {
                        return map.prefix ? this.callPlugin() : this.load();
                    })) : map.prefix ? this.callPlugin() : this.load();
                }
            },
            load: function() {
                var url = this.map.url;
                urlFetched[url] || (urlFetched[url] = !0, context.load(this.map.id, url));
            },
            check: function() {
                if (this.enabled && !this.enabling) {
                    var err, cjsModule, id = this.map.id, depExports = this.depExports, exports = this.exports, factory = this.factory;
                    if (this.inited) {
                        if (this.error) this.emit("error", this.error); else if (!this.defining) {
                            if (this.defining = !0, this.depCount < 1 && !this.defined) {
                                if (isFunction(factory)) {
                                    if (this.events.error && this.map.isDefine || req.onError !== defaultOnError) try {
                                        exports = context.execCb(id, factory, depExports, exports);
                                    } catch (e) {
                                        err = e;
                                    } else exports = context.execCb(id, factory, depExports, exports);
                                    if (this.map.isDefine && void 0 === exports && (cjsModule = this.module, cjsModule ? exports = cjsModule.exports : this.usingExports && (exports = this.exports)), 
                                    err) return err.requireMap = this.map, err.requireModules = this.map.isDefine ? [ this.map.id ] : null, 
                                    err.requireType = this.map.isDefine ? "define" : "require", onError(this.error = err);
                                } else exports = factory;
                                this.exports = exports, this.map.isDefine && !this.ignore && (defined[id] = exports, 
                                req.onResourceLoad && req.onResourceLoad(context, this.map, this.depMaps)), cleanRegistry(id), 
                                this.defined = !0;
                            }
                            this.defining = !1, this.defined && !this.defineEmitted && (this.defineEmitted = !0, 
                            this.emit("defined", this.exports), this.defineEmitComplete = !0);
                        }
                    } else this.fetch();
                }
            },
            callPlugin: function() {
                var map = this.map, id = map.id, pluginMap = makeModuleMap(map.prefix);
                this.depMaps.push(pluginMap), on(pluginMap, "defined", bind(this, function(plugin) {
                    var load, normalizedMap, normalizedMod, bundleId = getOwn(bundlesMap, this.map.id), name = this.map.name, parentName = this.map.parentMap ? this.map.parentMap.name : null, localRequire = context.makeRequire(map.parentMap, {
                        enableBuildCallback: !0
                    });
                    return this.map.unnormalized ? (plugin.normalize && (name = plugin.normalize(name, function(name) {
                        return normalize(name, parentName, !0);
                    }) || ""), normalizedMap = makeModuleMap(map.prefix + "!" + name, this.map.parentMap), 
                    on(normalizedMap, "defined", bind(this, function(value) {
                        this.init([], function() {
                            return value;
                        }, null, {
                            enabled: !0,
                            ignore: !0
                        });
                    })), normalizedMod = getOwn(registry, normalizedMap.id), void (normalizedMod && (this.depMaps.push(normalizedMap), 
                    this.events.error && normalizedMod.on("error", bind(this, function(err) {
                        this.emit("error", err);
                    })), normalizedMod.enable()))) : bundleId ? (this.map.url = context.nameToUrl(bundleId), 
                    void this.load()) : (load = bind(this, function(value) {
                        this.init([], function() {
                            return value;
                        }, null, {
                            enabled: !0
                        });
                    }), load.error = bind(this, function(err) {
                        this.inited = !0, this.error = err, err.requireModules = [ id ], eachProp(registry, function(mod) {
                            0 === mod.map.id.indexOf(id + "_unnormalized") && cleanRegistry(mod.map.id);
                        }), onError(err);
                    }), load.fromText = bind(this, function(text, textAlt) {
                        var moduleName = map.name, moduleMap = makeModuleMap(moduleName), hasInteractive = useInteractive;
                        textAlt && (text = textAlt), hasInteractive && (useInteractive = !1), getModule(moduleMap), 
                        hasProp(config.config, id) && (config.config[moduleName] = config.config[id]);
                        try {
                            req.exec(text);
                        } catch (e) {
                            return onError(makeError("fromtexteval", "fromText eval for " + id + " failed: " + e, e, [ id ]));
                        }
                        hasInteractive && (useInteractive = !0), this.depMaps.push(moduleMap), context.completeLoad(moduleName), 
                        localRequire([ moduleName ], load);
                    }), void plugin.load(map.name, localRequire, load, config));
                })), context.enable(pluginMap, this), this.pluginMaps[pluginMap.id] = pluginMap;
            },
            enable: function() {
                enabledRegistry[this.map.id] = this, this.enabled = !0, this.enabling = !0, each(this.depMaps, bind(this, function(depMap, i) {
                    var id, mod, handler;
                    if ("string" == typeof depMap) {
                        if (depMap = makeModuleMap(depMap, this.map.isDefine ? this.map : this.map.parentMap, !1, !this.skipMap), 
                        this.depMaps[i] = depMap, handler = getOwn(handlers, depMap.id)) return void (this.depExports[i] = handler(this));
                        this.depCount += 1, on(depMap, "defined", bind(this, function(depExports) {
                            this.defineDep(i, depExports), this.check();
                        })), this.errback && on(depMap, "error", bind(this, this.errback));
                    }
                    id = depMap.id, mod = registry[id], hasProp(handlers, id) || !mod || mod.enabled || context.enable(depMap, this);
                })), eachProp(this.pluginMaps, bind(this, function(pluginMap) {
                    var mod = getOwn(registry, pluginMap.id);
                    mod && !mod.enabled && context.enable(pluginMap, this);
                })), this.enabling = !1, this.check();
            },
            on: function(name, cb) {
                var cbs = this.events[name];
                cbs || (cbs = this.events[name] = []), cbs.push(cb);
            },
            emit: function(name, evt) {
                each(this.events[name], function(cb) {
                    cb(evt);
                }), "error" === name && delete this.events[name];
            }
        }, context = {
            config: config,
            contextName: contextName,
            registry: registry,
            defined: defined,
            urlFetched: urlFetched,
            defQueue: defQueue,
            Module: Module,
            makeModuleMap: makeModuleMap,
            nextTick: req.nextTick,
            onError: onError,
            configure: function(cfg) {
                cfg.baseUrl && "/" !== cfg.baseUrl.charAt(cfg.baseUrl.length - 1) && (cfg.baseUrl += "/");
                var shim = config.shim, objs = {
                    paths: !0,
                    bundles: !0,
                    config: !0,
                    map: !0
                };
                eachProp(cfg, function(value, prop) {
                    objs[prop] ? (config[prop] || (config[prop] = {}), mixin(config[prop], value, !0, !0)) : config[prop] = value;
                }), cfg.bundles && eachProp(cfg.bundles, function(value, prop) {
                    each(value, function(v) {
                        v !== prop && (bundlesMap[v] = prop);
                    });
                }), cfg.shim && (eachProp(cfg.shim, function(value, id) {
                    isArray(value) && (value = {
                        deps: value
                    }), !value.exports && !value.init || value.exportsFn || (value.exportsFn = context.makeShimExports(value)), 
                    shim[id] = value;
                }), config.shim = shim), cfg.packages && each(cfg.packages, function(pkgObj) {
                    var location, name;
                    pkgObj = "string" == typeof pkgObj ? {
                        name: pkgObj
                    } : pkgObj, name = pkgObj.name, location = pkgObj.location, location && (config.paths[name] = pkgObj.location), 
                    config.pkgs[name] = pkgObj.name + "/" + (pkgObj.main || "main").replace(currDirRegExp, "").replace(jsSuffixRegExp, "");
                }), eachProp(registry, function(mod, id) {
                    mod.inited || mod.map.unnormalized || (mod.map = makeModuleMap(id));
                }), (cfg.deps || cfg.callback) && context.require(cfg.deps || [], cfg.callback);
            },
            makeShimExports: function(value) {
                function fn() {
                    var ret;
                    return value.init && (ret = value.init.apply(global, arguments)), ret || value.exports && getGlobal(value.exports);
                }
                return fn;
            },
            makeRequire: function(relMap, options) {
                function localRequire(deps, callback, errback) {
                    var id, map, requireMod;
                    return options.enableBuildCallback && callback && isFunction(callback) && (callback.__requireJsBuild = !0), 
                    "string" == typeof deps ? isFunction(callback) ? onError(makeError("requireargs", "Invalid require call"), errback) : relMap && hasProp(handlers, deps) ? handlers[deps](registry[relMap.id]) : req.get ? req.get(context, deps, relMap, localRequire) : (map = makeModuleMap(deps, relMap, !1, !0), 
                    id = map.id, hasProp(defined, id) ? defined[id] : onError(makeError("notloaded", 'Module name "' + id + '" has not been loaded yet for context: ' + contextName + (relMap ? "" : ". Use require([])")))) : (intakeDefines(), 
                    context.nextTick(function() {
                        intakeDefines(), requireMod = getModule(makeModuleMap(null, relMap)), requireMod.skipMap = options.skipMap, 
                        requireMod.init(deps, callback, errback, {
                            enabled: !0
                        }), checkLoaded();
                    }), localRequire);
                }
                return options = options || {}, mixin(localRequire, {
                    isBrowser: isBrowser,
                    toUrl: function(moduleNamePlusExt) {
                        var ext, index = moduleNamePlusExt.lastIndexOf("."), segment = moduleNamePlusExt.split("/")[0], isRelative = "." === segment || ".." === segment;
                        return -1 !== index && (!isRelative || index > 1) && (ext = moduleNamePlusExt.substring(index, moduleNamePlusExt.length), 
                        moduleNamePlusExt = moduleNamePlusExt.substring(0, index)), context.nameToUrl(normalize(moduleNamePlusExt, relMap && relMap.id, !0), ext, !0);
                    },
                    defined: function(id) {
                        return hasProp(defined, makeModuleMap(id, relMap, !1, !0).id);
                    },
                    specified: function(id) {
                        return id = makeModuleMap(id, relMap, !1, !0).id, hasProp(defined, id) || hasProp(registry, id);
                    }
                }), relMap || (localRequire.undef = function(id) {
                    takeGlobalQueue();
                    var map = makeModuleMap(id, relMap, !0), mod = getOwn(registry, id);
                    removeScript(id), delete defined[id], delete urlFetched[map.url], delete undefEvents[id], 
                    eachReverse(defQueue, function(args, i) {
                        args[0] === id && defQueue.splice(i, 1);
                    }), mod && (mod.events.defined && (undefEvents[id] = mod.events), cleanRegistry(id));
                }), localRequire;
            },
            enable: function(depMap) {
                var mod = getOwn(registry, depMap.id);
                mod && getModule(depMap).enable();
            },
            completeLoad: function(moduleName) {
                var found, args, mod, shim = getOwn(config.shim, moduleName) || {}, shExports = shim.exports;
                for (takeGlobalQueue(); defQueue.length; ) {
                    if (args = defQueue.shift(), null === args[0]) {
                        if (args[0] = moduleName, found) break;
                        found = !0;
                    } else args[0] === moduleName && (found = !0);
                    callGetModule(args);
                }
                if (mod = getOwn(registry, moduleName), !found && !hasProp(defined, moduleName) && mod && !mod.inited) {
                    if (!(!config.enforceDefine || shExports && getGlobal(shExports))) return hasPathFallback(moduleName) ? void 0 : onError(makeError("nodefine", "No define call for " + moduleName, null, [ moduleName ]));
                    callGetModule([ moduleName, shim.deps || [], shim.exportsFn ]);
                }
                checkLoaded();
            },
            nameToUrl: function(moduleName, ext, skipExt) {
                var paths, syms, i, parentModule, url, parentPath, bundleId, pkgMain = getOwn(config.pkgs, moduleName);
                if (pkgMain && (moduleName = pkgMain), bundleId = getOwn(bundlesMap, moduleName)) return context.nameToUrl(bundleId, ext, skipExt);
                if (req.jsExtRegExp.test(moduleName)) url = moduleName + (ext || ""); else {
                    for (paths = config.paths, syms = moduleName.split("/"), i = syms.length; i > 0; i -= 1) if (parentModule = syms.slice(0, i).join("/"), 
                    parentPath = getOwn(paths, parentModule)) {
                        isArray(parentPath) && (parentPath = parentPath[0]), syms.splice(0, i, parentPath);
                        break;
                    }
                    url = syms.join("/"), url += ext || (/^data\:|\?/.test(url) || skipExt ? "" : ".js"), 
                    url = ("/" === url.charAt(0) || url.match(/^[\w\+\.\-]+:/) ? "" : config.baseUrl) + url;
                }
                return config.urlArgs ? url + ((-1 === url.indexOf("?") ? "?" : "&") + config.urlArgs) : url;
            },
            load: function(id, url) {
                req.load(context, id, url);
            },
            execCb: function(name, callback, args, exports) {
                return callback.apply(exports, args);
            },
            onScriptLoad: function(evt) {
                if ("load" === evt.type || readyRegExp.test((evt.currentTarget || evt.srcElement).readyState)) {
                    interactiveScript = null;
                    var data = getScriptData(evt);
                    context.completeLoad(data.id);
                }
            },
            onScriptError: function(evt) {
                var data = getScriptData(evt);
                return hasPathFallback(data.id) ? void 0 : onError(makeError("scripterror", "Script error for: " + data.id, evt, [ data.id ]));
            }
        }, context.require = context.makeRequire(), context;
    }
    function getInteractiveScript() {
        return interactiveScript && "interactive" === interactiveScript.readyState ? interactiveScript : (eachReverse(scripts(), function(script) {
            return "interactive" === script.readyState ? interactiveScript = script : void 0;
        }), interactiveScript);
    }
    var req, s, head, baseElement, dataMain, src, interactiveScript, currentlyAddingScript, mainScript, subPath, version = "2.1.10", commentRegExp = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/gm, cjsRequireRegExp = /[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g, jsSuffixRegExp = /\.js$/, currDirRegExp = /^\.\//, op = Object.prototype, ostring = op.toString, hasOwn = op.hasOwnProperty, ap = Array.prototype, apsp = ap.splice, isBrowser = !("undefined" == typeof window || "undefined" == typeof navigator || !window.document), isWebWorker = !isBrowser && "undefined" != typeof importScripts, readyRegExp = isBrowser && "PLAYSTATION 3" === navigator.platform ? /^complete$/ : /^(complete|loaded)$/, defContextName = "_", isOpera = "undefined" != typeof opera && "[object Opera]" === opera.toString(), contexts = {}, cfg = {}, globalDefQueue = [], useInteractive = !1;
    if ("undefined" == typeof define) {
        if ("undefined" != typeof requirejs) {
            if (isFunction(requirejs)) return;
            cfg = requirejs, requirejs = void 0;
        }
        "undefined" == typeof require || isFunction(require) || (cfg = require, require = void 0), 
        req = requirejs = function(deps, callback, errback, optional) {
            var context, config, contextName = defContextName;
            return isArray(deps) || "string" == typeof deps || (config = deps, isArray(callback) ? (deps = callback, 
            callback = errback, errback = optional) : deps = []), config && config.context && (contextName = config.context), 
            context = getOwn(contexts, contextName), context || (context = contexts[contextName] = req.s.newContext(contextName)), 
            config && context.configure(config), context.require(deps, callback, errback);
        }, req.config = function(config) {
            return req(config);
        }, req.nextTick = "undefined" != typeof setTimeout ? function(fn) {
            setTimeout(fn, 4);
        } : function(fn) {
            fn();
        }, require || (require = req), req.version = version, req.jsExtRegExp = /^\/|:|\?|\.js$/, 
        req.isBrowser = isBrowser, s = req.s = {
            contexts: contexts,
            newContext: newContext
        }, req({}), each([ "toUrl", "undef", "defined", "specified" ], function(prop) {
            req[prop] = function() {
                var ctx = contexts[defContextName];
                return ctx.require[prop].apply(ctx, arguments);
            };
        }), isBrowser && (head = s.head = document.getElementsByTagName("head")[0], baseElement = document.getElementsByTagName("base")[0], 
        baseElement && (head = s.head = baseElement.parentNode)), req.onError = defaultOnError, 
        req.createNode = function(config) {
            var node = config.xhtml ? document.createElementNS("http://www.w3.org/1999/xhtml", "html:script") : document.createElement("script");
            return node.type = config.scriptType || "text/javascript", node.charset = "utf-8", 
            node.async = !0, node;
        }, req.load = function(context, moduleName, url) {
            var node, config = context && context.config || {};
            if (isBrowser) return node = req.createNode(config, moduleName, url), node.setAttribute("data-requirecontext", context.contextName), 
            node.setAttribute("data-requiremodule", moduleName), !node.attachEvent || node.attachEvent.toString && node.attachEvent.toString().indexOf("[native code") < 0 || isOpera ? (node.addEventListener("load", context.onScriptLoad, !1), 
            node.addEventListener("error", context.onScriptError, !1)) : (useInteractive = !0, 
            node.attachEvent("onreadystatechange", context.onScriptLoad)), node.src = url, currentlyAddingScript = node, 
            baseElement ? head.insertBefore(node, baseElement) : head.appendChild(node), currentlyAddingScript = null, 
            node;
            if (isWebWorker) try {
                importScripts(url), context.completeLoad(moduleName);
            } catch (e) {
                context.onError(makeError("importscripts", "importScripts failed for " + moduleName + " at " + url, e, [ moduleName ]));
            }
        }, isBrowser && !cfg.skipDataMain && eachReverse(scripts(), function(script) {
            return head || (head = script.parentNode), dataMain = script.getAttribute("data-main"), 
            dataMain ? (mainScript = dataMain, cfg.baseUrl || (src = mainScript.split("/"), 
            mainScript = src.pop(), subPath = src.length ? src.join("/") + "/" : "./", cfg.baseUrl = subPath), 
            mainScript = mainScript.replace(jsSuffixRegExp, ""), req.jsExtRegExp.test(mainScript) && (mainScript = dataMain), 
            cfg.deps = cfg.deps ? cfg.deps.concat(mainScript) : [ mainScript ], !0) : void 0;
        }), define = function(name, deps, callback) {
            var node, context;
            "string" != typeof name && (callback = deps, deps = name, name = null), isArray(deps) || (callback = deps, 
            deps = null), !deps && isFunction(callback) && (deps = [], callback.length && (callback.toString().replace(commentRegExp, "").replace(cjsRequireRegExp, function(match, dep) {
                deps.push(dep);
            }), deps = (1 === callback.length ? [ "require" ] : [ "require", "exports", "module" ]).concat(deps))), 
            useInteractive && (node = currentlyAddingScript || getInteractiveScript(), node && (name || (name = node.getAttribute("data-requiremodule")), 
            context = contexts[node.getAttribute("data-requirecontext")])), (context ? context.defQueue : globalDefQueue).push([ name, deps, callback ]);
        }, define.amd = {
            jQuery: !0
        }, req.exec = function(text) {
            return eval(text);
        }, req(cfg);
    }
}(this);

var Handlebars = function() {
    var __module4__ = function() {
        "use strict";
        function SafeString(string) {
            this.string = string;
        }
        var __exports__;
        return SafeString.prototype.toString = function() {
            return "" + this.string;
        }, __exports__ = SafeString;
    }(), __module3__ = function(__dependency1__) {
        "use strict";
        function escapeChar(chr) {
            return escape[chr] || "&amp;";
        }
        function extend(obj, value) {
            for (var key in value) Object.prototype.hasOwnProperty.call(value, key) && (obj[key] = value[key]);
        }
        function escapeExpression(string) {
            return string instanceof SafeString ? string.toString() : string || 0 === string ? (string = "" + string, 
            possible.test(string) ? string.replace(badChars, escapeChar) : string) : "";
        }
        function isEmpty(value) {
            return value || 0 === value ? isArray(value) && 0 === value.length ? !0 : !1 : !0;
        }
        var __exports__ = {}, SafeString = __dependency1__, escape = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#x27;",
            "`": "&#x60;"
        }, badChars = /[&<>"'`]/g, possible = /[&<>"'`]/;
        __exports__.extend = extend;
        var toString = Object.prototype.toString;
        __exports__.toString = toString;
        var isFunction = function(value) {
            return "function" == typeof value;
        };
        isFunction(/x/) && (isFunction = function(value) {
            return "function" == typeof value && "[object Function]" === toString.call(value);
        });
        var isFunction;
        __exports__.isFunction = isFunction;
        var isArray = Array.isArray || function(value) {
            return value && "object" == typeof value ? "[object Array]" === toString.call(value) : !1;
        };
        return __exports__.isArray = isArray, __exports__.escapeExpression = escapeExpression, 
        __exports__.isEmpty = isEmpty, __exports__;
    }(__module4__), __module5__ = function() {
        "use strict";
        function Exception(message, node) {
            var line;
            node && node.firstLine && (line = node.firstLine, message += " - " + line + ":" + node.firstColumn);
            for (var tmp = Error.prototype.constructor.call(this, message), idx = 0; idx < errorProps.length; idx++) this[errorProps[idx]] = tmp[errorProps[idx]];
            line && (this.lineNumber = line, this.column = node.firstColumn);
        }
        var __exports__, errorProps = [ "description", "fileName", "lineNumber", "message", "name", "number", "stack" ];
        return Exception.prototype = new Error(), __exports__ = Exception;
    }(), __module2__ = function(__dependency1__, __dependency2__) {
        "use strict";
        function HandlebarsEnvironment(helpers, partials) {
            this.helpers = helpers || {}, this.partials = partials || {}, registerDefaultHelpers(this);
        }
        function registerDefaultHelpers(instance) {
            instance.registerHelper("helperMissing", function(arg) {
                if (2 === arguments.length) return void 0;
                throw new Exception("Missing helper: '" + arg + "'");
            }), instance.registerHelper("blockHelperMissing", function(context, options) {
                var inverse = options.inverse || function() {}, fn = options.fn;
                return isFunction(context) && (context = context.call(this)), context === !0 ? fn(this) : context === !1 || null == context ? inverse(this) : isArray(context) ? context.length > 0 ? instance.helpers.each(context, options) : inverse(this) : fn(context);
            }), instance.registerHelper("each", function(context, options) {
                var data, fn = options.fn, inverse = options.inverse, i = 0, ret = "";
                if (isFunction(context) && (context = context.call(this)), options.data && (data = createFrame(options.data)), 
                context && "object" == typeof context) if (isArray(context)) for (var j = context.length; j > i; i++) data && (data.index = i, 
                data.first = 0 === i, data.last = i === context.length - 1), ret += fn(context[i], {
                    data: data
                }); else for (var key in context) context.hasOwnProperty(key) && (data && (data.key = key, 
                data.index = i, data.first = 0 === i), ret += fn(context[key], {
                    data: data
                }), i++);
                return 0 === i && (ret = inverse(this)), ret;
            }), instance.registerHelper("if", function(conditional, options) {
                return isFunction(conditional) && (conditional = conditional.call(this)), !options.hash.includeZero && !conditional || Utils.isEmpty(conditional) ? options.inverse(this) : options.fn(this);
            }), instance.registerHelper("unless", function(conditional, options) {
                return instance.helpers["if"].call(this, conditional, {
                    fn: options.inverse,
                    inverse: options.fn,
                    hash: options.hash
                });
            }), instance.registerHelper("with", function(context, options) {
                return isFunction(context) && (context = context.call(this)), Utils.isEmpty(context) ? void 0 : options.fn(context);
            }), instance.registerHelper("log", function(context, options) {
                var level = options.data && null != options.data.level ? parseInt(options.data.level, 10) : 1;
                instance.log(level, context);
            });
        }
        function log(level, obj) {
            logger.log(level, obj);
        }
        var __exports__ = {}, Utils = __dependency1__, Exception = __dependency2__, VERSION = "1.3.0";
        __exports__.VERSION = VERSION;
        var COMPILER_REVISION = 4;
        __exports__.COMPILER_REVISION = COMPILER_REVISION;
        var REVISION_CHANGES = {
            1: "<= 1.0.rc.2",
            2: "== 1.0.0-rc.3",
            3: "== 1.0.0-rc.4",
            4: ">= 1.0.0"
        };
        __exports__.REVISION_CHANGES = REVISION_CHANGES;
        var isArray = Utils.isArray, isFunction = Utils.isFunction, toString = Utils.toString, objectType = "[object Object]";
        __exports__.HandlebarsEnvironment = HandlebarsEnvironment, HandlebarsEnvironment.prototype = {
            constructor: HandlebarsEnvironment,
            logger: logger,
            log: log,
            registerHelper: function(name, fn, inverse) {
                if (toString.call(name) === objectType) {
                    if (inverse || fn) throw new Exception("Arg not supported with multiple helpers");
                    Utils.extend(this.helpers, name);
                } else inverse && (fn.not = inverse), this.helpers[name] = fn;
            },
            registerPartial: function(name, str) {
                toString.call(name) === objectType ? Utils.extend(this.partials, name) : this.partials[name] = str;
            }
        };
        var logger = {
            methodMap: {
                0: "debug",
                1: "info",
                2: "warn",
                3: "error"
            },
            DEBUG: 0,
            INFO: 1,
            WARN: 2,
            ERROR: 3,
            level: 3,
            log: function(level, obj) {
                if (logger.level <= level) {
                    var method = logger.methodMap[level];
                    "undefined" != typeof console && console[method] && console[method].call(console, obj);
                }
            }
        };
        __exports__.logger = logger, __exports__.log = log;
        var createFrame = function(object) {
            var obj = {};
            return Utils.extend(obj, object), obj;
        };
        return __exports__.createFrame = createFrame, __exports__;
    }(__module3__, __module5__), __module6__ = function(__dependency1__, __dependency2__, __dependency3__) {
        "use strict";
        function checkRevision(compilerInfo) {
            var compilerRevision = compilerInfo && compilerInfo[0] || 1, currentRevision = COMPILER_REVISION;
            if (compilerRevision !== currentRevision) {
                if (currentRevision > compilerRevision) {
                    var runtimeVersions = REVISION_CHANGES[currentRevision], compilerVersions = REVISION_CHANGES[compilerRevision];
                    throw new Exception("Template was precompiled with an older version of Handlebars than the current runtime. Please update your precompiler to a newer version (" + runtimeVersions + ") or downgrade your runtime to an older version (" + compilerVersions + ").");
                }
                throw new Exception("Template was precompiled with a newer version of Handlebars than the current runtime. Please update your runtime to a newer version (" + compilerInfo[1] + ").");
            }
        }
        function template(templateSpec, env) {
            if (!env) throw new Exception("No environment passed to template");
            var invokePartialWrapper = function(partial, name, context, helpers, partials, data) {
                var result = env.VM.invokePartial.apply(this, arguments);
                if (null != result) return result;
                if (env.compile) {
                    var options = {
                        helpers: helpers,
                        partials: partials,
                        data: data
                    };
                    return partials[name] = env.compile(partial, {
                        data: void 0 !== data
                    }, env), partials[name](context, options);
                }
                throw new Exception("The partial " + name + " could not be compiled when running in runtime-only mode");
            }, container = {
                escapeExpression: Utils.escapeExpression,
                invokePartial: invokePartialWrapper,
                programs: [],
                program: function(i, fn, data) {
                    var programWrapper = this.programs[i];
                    return data ? programWrapper = program(i, fn, data) : programWrapper || (programWrapper = this.programs[i] = program(i, fn)), 
                    programWrapper;
                },
                merge: function(param, common) {
                    var ret = param || common;
                    return param && common && param !== common && (ret = {}, Utils.extend(ret, common), 
                    Utils.extend(ret, param)), ret;
                },
                programWithDepth: env.VM.programWithDepth,
                noop: env.VM.noop,
                compilerInfo: null
            };
            return function(context, options) {
                options = options || {};
                var helpers, partials, namespace = options.partial ? options : env;
                options.partial || (helpers = options.helpers, partials = options.partials);
                var result = templateSpec.call(container, namespace, context, helpers, partials, options.data);
                return options.partial || env.VM.checkRevision(container.compilerInfo), result;
            };
        }
        function programWithDepth(i, fn, data) {
            var args = Array.prototype.slice.call(arguments, 3), prog = function(context, options) {
                return options = options || {}, fn.apply(this, [ context, options.data || data ].concat(args));
            };
            return prog.program = i, prog.depth = args.length, prog;
        }
        function program(i, fn, data) {
            var prog = function(context, options) {
                return options = options || {}, fn(context, options.data || data);
            };
            return prog.program = i, prog.depth = 0, prog;
        }
        function invokePartial(partial, name, context, helpers, partials, data) {
            var options = {
                partial: !0,
                helpers: helpers,
                partials: partials,
                data: data
            };
            if (void 0 === partial) throw new Exception("The partial " + name + " could not be found");
            return partial instanceof Function ? partial(context, options) : void 0;
        }
        function noop() {
            return "";
        }
        var __exports__ = {}, Utils = __dependency1__, Exception = __dependency2__, COMPILER_REVISION = __dependency3__.COMPILER_REVISION, REVISION_CHANGES = __dependency3__.REVISION_CHANGES;
        return __exports__.checkRevision = checkRevision, __exports__.template = template, 
        __exports__.programWithDepth = programWithDepth, __exports__.program = program, 
        __exports__.invokePartial = invokePartial, __exports__.noop = noop, __exports__;
    }(__module3__, __module5__, __module2__), __module1__ = function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__) {
        "use strict";
        var __exports__, base = __dependency1__, SafeString = __dependency2__, Exception = __dependency3__, Utils = __dependency4__, runtime = __dependency5__, create = function() {
            var hb = new base.HandlebarsEnvironment();
            return Utils.extend(hb, base), hb.SafeString = SafeString, hb.Exception = Exception, 
            hb.Utils = Utils, hb.VM = runtime, hb.template = function(spec) {
                return runtime.template(spec, hb);
            }, hb;
        }, Handlebars = create();
        return Handlebars.create = create, __exports__ = Handlebars;
    }(__module2__, __module4__, __module5__, __module3__, __module6__), __module7__ = function(__dependency1__) {
        "use strict";
        function LocationInfo(locInfo) {
            locInfo = locInfo || {}, this.firstLine = locInfo.first_line, this.firstColumn = locInfo.first_column, 
            this.lastColumn = locInfo.last_column, this.lastLine = locInfo.last_line;
        }
        var __exports__, Exception = __dependency1__, AST = {
            ProgramNode: function(statements, inverseStrip, inverse, locInfo) {
                var inverseLocationInfo, firstInverseNode;
                3 === arguments.length ? (locInfo = inverse, inverse = null) : 2 === arguments.length && (locInfo = inverseStrip, 
                inverseStrip = null), LocationInfo.call(this, locInfo), this.type = "program", this.statements = statements, 
                this.strip = {}, inverse ? (firstInverseNode = inverse[0], firstInverseNode ? (inverseLocationInfo = {
                    first_line: firstInverseNode.firstLine,
                    last_line: firstInverseNode.lastLine,
                    last_column: firstInverseNode.lastColumn,
                    first_column: firstInverseNode.firstColumn
                }, this.inverse = new AST.ProgramNode(inverse, inverseStrip, inverseLocationInfo)) : this.inverse = new AST.ProgramNode(inverse, inverseStrip), 
                this.strip.right = inverseStrip.left) : inverseStrip && (this.strip.left = inverseStrip.right);
            },
            MustacheNode: function(rawParams, hash, open, strip, locInfo) {
                if (LocationInfo.call(this, locInfo), this.type = "mustache", this.strip = strip, 
                null != open && open.charAt) {
                    var escapeFlag = open.charAt(3) || open.charAt(2);
                    this.escaped = "{" !== escapeFlag && "&" !== escapeFlag;
                } else this.escaped = !!open;
                this.sexpr = rawParams instanceof AST.SexprNode ? rawParams : new AST.SexprNode(rawParams, hash), 
                this.sexpr.isRoot = !0, this.id = this.sexpr.id, this.params = this.sexpr.params, 
                this.hash = this.sexpr.hash, this.eligibleHelper = this.sexpr.eligibleHelper, this.isHelper = this.sexpr.isHelper;
            },
            SexprNode: function(rawParams, hash, locInfo) {
                LocationInfo.call(this, locInfo), this.type = "sexpr", this.hash = hash;
                var id = this.id = rawParams[0], params = this.params = rawParams.slice(1), eligibleHelper = this.eligibleHelper = id.isSimple;
                this.isHelper = eligibleHelper && (params.length || hash);
            },
            PartialNode: function(partialName, context, strip, locInfo) {
                LocationInfo.call(this, locInfo), this.type = "partial", this.partialName = partialName, 
                this.context = context, this.strip = strip;
            },
            BlockNode: function(mustache, program, inverse, close, locInfo) {
                if (LocationInfo.call(this, locInfo), mustache.sexpr.id.original !== close.path.original) throw new Exception(mustache.sexpr.id.original + " doesn't match " + close.path.original, this);
                this.type = "block", this.mustache = mustache, this.program = program, this.inverse = inverse, 
                this.strip = {
                    left: mustache.strip.left,
                    right: close.strip.right
                }, (program || inverse).strip.left = mustache.strip.right, (inverse || program).strip.right = close.strip.left, 
                inverse && !program && (this.isInverse = !0);
            },
            ContentNode: function(string, locInfo) {
                LocationInfo.call(this, locInfo), this.type = "content", this.string = string;
            },
            HashNode: function(pairs, locInfo) {
                LocationInfo.call(this, locInfo), this.type = "hash", this.pairs = pairs;
            },
            IdNode: function(parts, locInfo) {
                LocationInfo.call(this, locInfo), this.type = "ID";
                for (var original = "", dig = [], depth = 0, i = 0, l = parts.length; l > i; i++) {
                    var part = parts[i].part;
                    if (original += (parts[i].separator || "") + part, ".." === part || "." === part || "this" === part) {
                        if (dig.length > 0) throw new Exception("Invalid path: " + original, this);
                        ".." === part ? depth++ : this.isScoped = !0;
                    } else dig.push(part);
                }
                this.original = original, this.parts = dig, this.string = dig.join("."), this.depth = depth, 
                this.isSimple = 1 === parts.length && !this.isScoped && 0 === depth, this.stringModeValue = this.string;
            },
            PartialNameNode: function(name, locInfo) {
                LocationInfo.call(this, locInfo), this.type = "PARTIAL_NAME", this.name = name.original;
            },
            DataNode: function(id, locInfo) {
                LocationInfo.call(this, locInfo), this.type = "DATA", this.id = id;
            },
            StringNode: function(string, locInfo) {
                LocationInfo.call(this, locInfo), this.type = "STRING", this.original = this.string = this.stringModeValue = string;
            },
            IntegerNode: function(integer, locInfo) {
                LocationInfo.call(this, locInfo), this.type = "INTEGER", this.original = this.integer = integer, 
                this.stringModeValue = Number(integer);
            },
            BooleanNode: function(bool, locInfo) {
                LocationInfo.call(this, locInfo), this.type = "BOOLEAN", this.bool = bool, this.stringModeValue = "true" === bool;
            },
            CommentNode: function(comment, locInfo) {
                LocationInfo.call(this, locInfo), this.type = "comment", this.comment = comment;
            }
        };
        return __exports__ = AST;
    }(__module5__), __module9__ = function() {
        "use strict";
        var __exports__, handlebars = function() {
            function stripFlags(open, close) {
                return {
                    left: "~" === open.charAt(2),
                    right: "~" === close.charAt(0) || "~" === close.charAt(1)
                };
            }
            function Parser() {
                this.yy = {};
            }
            var parser = {
                trace: function() {},
                yy: {},
                symbols_: {
                    error: 2,
                    root: 3,
                    statements: 4,
                    EOF: 5,
                    program: 6,
                    simpleInverse: 7,
                    statement: 8,
                    openInverse: 9,
                    closeBlock: 10,
                    openBlock: 11,
                    mustache: 12,
                    partial: 13,
                    CONTENT: 14,
                    COMMENT: 15,
                    OPEN_BLOCK: 16,
                    sexpr: 17,
                    CLOSE: 18,
                    OPEN_INVERSE: 19,
                    OPEN_ENDBLOCK: 20,
                    path: 21,
                    OPEN: 22,
                    OPEN_UNESCAPED: 23,
                    CLOSE_UNESCAPED: 24,
                    OPEN_PARTIAL: 25,
                    partialName: 26,
                    partial_option0: 27,
                    sexpr_repetition0: 28,
                    sexpr_option0: 29,
                    dataName: 30,
                    param: 31,
                    STRING: 32,
                    INTEGER: 33,
                    BOOLEAN: 34,
                    OPEN_SEXPR: 35,
                    CLOSE_SEXPR: 36,
                    hash: 37,
                    hash_repetition_plus0: 38,
                    hashSegment: 39,
                    ID: 40,
                    EQUALS: 41,
                    DATA: 42,
                    pathSegments: 43,
                    SEP: 44,
                    $accept: 0,
                    $end: 1
                },
                terminals_: {
                    2: "error",
                    5: "EOF",
                    14: "CONTENT",
                    15: "COMMENT",
                    16: "OPEN_BLOCK",
                    18: "CLOSE",
                    19: "OPEN_INVERSE",
                    20: "OPEN_ENDBLOCK",
                    22: "OPEN",
                    23: "OPEN_UNESCAPED",
                    24: "CLOSE_UNESCAPED",
                    25: "OPEN_PARTIAL",
                    32: "STRING",
                    33: "INTEGER",
                    34: "BOOLEAN",
                    35: "OPEN_SEXPR",
                    36: "CLOSE_SEXPR",
                    40: "ID",
                    41: "EQUALS",
                    42: "DATA",
                    44: "SEP"
                },
                productions_: [ 0, [ 3, 2 ], [ 3, 1 ], [ 6, 2 ], [ 6, 3 ], [ 6, 2 ], [ 6, 1 ], [ 6, 1 ], [ 6, 0 ], [ 4, 1 ], [ 4, 2 ], [ 8, 3 ], [ 8, 3 ], [ 8, 1 ], [ 8, 1 ], [ 8, 1 ], [ 8, 1 ], [ 11, 3 ], [ 9, 3 ], [ 10, 3 ], [ 12, 3 ], [ 12, 3 ], [ 13, 4 ], [ 7, 2 ], [ 17, 3 ], [ 17, 1 ], [ 31, 1 ], [ 31, 1 ], [ 31, 1 ], [ 31, 1 ], [ 31, 1 ], [ 31, 3 ], [ 37, 1 ], [ 39, 3 ], [ 26, 1 ], [ 26, 1 ], [ 26, 1 ], [ 30, 2 ], [ 21, 1 ], [ 43, 3 ], [ 43, 1 ], [ 27, 0 ], [ 27, 1 ], [ 28, 0 ], [ 28, 2 ], [ 29, 0 ], [ 29, 1 ], [ 38, 1 ], [ 38, 2 ] ],
                performAction: function(yytext, yyleng, yylineno, yy, yystate, $$) {
                    var $0 = $$.length - 1;
                    switch (yystate) {
                      case 1:
                        return new yy.ProgramNode($$[$0 - 1], this._$);

                      case 2:
                        return new yy.ProgramNode([], this._$);

                      case 3:
                        this.$ = new yy.ProgramNode([], $$[$0 - 1], $$[$0], this._$);
                        break;

                      case 4:
                        this.$ = new yy.ProgramNode($$[$0 - 2], $$[$0 - 1], $$[$0], this._$);
                        break;

                      case 5:
                        this.$ = new yy.ProgramNode($$[$0 - 1], $$[$0], [], this._$);
                        break;

                      case 6:
                        this.$ = new yy.ProgramNode($$[$0], this._$);
                        break;

                      case 7:
                        this.$ = new yy.ProgramNode([], this._$);
                        break;

                      case 8:
                        this.$ = new yy.ProgramNode([], this._$);
                        break;

                      case 9:
                        this.$ = [ $$[$0] ];
                        break;

                      case 10:
                        $$[$0 - 1].push($$[$0]), this.$ = $$[$0 - 1];
                        break;

                      case 11:
                        this.$ = new yy.BlockNode($$[$0 - 2], $$[$0 - 1].inverse, $$[$0 - 1], $$[$0], this._$);
                        break;

                      case 12:
                        this.$ = new yy.BlockNode($$[$0 - 2], $$[$0 - 1], $$[$0 - 1].inverse, $$[$0], this._$);
                        break;

                      case 13:
                        this.$ = $$[$0];
                        break;

                      case 14:
                        this.$ = $$[$0];
                        break;

                      case 15:
                        this.$ = new yy.ContentNode($$[$0], this._$);
                        break;

                      case 16:
                        this.$ = new yy.CommentNode($$[$0], this._$);
                        break;

                      case 17:
                        this.$ = new yy.MustacheNode($$[$0 - 1], null, $$[$0 - 2], stripFlags($$[$0 - 2], $$[$0]), this._$);
                        break;

                      case 18:
                        this.$ = new yy.MustacheNode($$[$0 - 1], null, $$[$0 - 2], stripFlags($$[$0 - 2], $$[$0]), this._$);
                        break;

                      case 19:
                        this.$ = {
                            path: $$[$0 - 1],
                            strip: stripFlags($$[$0 - 2], $$[$0])
                        };
                        break;

                      case 20:
                        this.$ = new yy.MustacheNode($$[$0 - 1], null, $$[$0 - 2], stripFlags($$[$0 - 2], $$[$0]), this._$);
                        break;

                      case 21:
                        this.$ = new yy.MustacheNode($$[$0 - 1], null, $$[$0 - 2], stripFlags($$[$0 - 2], $$[$0]), this._$);
                        break;

                      case 22:
                        this.$ = new yy.PartialNode($$[$0 - 2], $$[$0 - 1], stripFlags($$[$0 - 3], $$[$0]), this._$);
                        break;

                      case 23:
                        this.$ = stripFlags($$[$0 - 1], $$[$0]);
                        break;

                      case 24:
                        this.$ = new yy.SexprNode([ $$[$0 - 2] ].concat($$[$0 - 1]), $$[$0], this._$);
                        break;

                      case 25:
                        this.$ = new yy.SexprNode([ $$[$0] ], null, this._$);
                        break;

                      case 26:
                        this.$ = $$[$0];
                        break;

                      case 27:
                        this.$ = new yy.StringNode($$[$0], this._$);
                        break;

                      case 28:
                        this.$ = new yy.IntegerNode($$[$0], this._$);
                        break;

                      case 29:
                        this.$ = new yy.BooleanNode($$[$0], this._$);
                        break;

                      case 30:
                        this.$ = $$[$0];
                        break;

                      case 31:
                        $$[$0 - 1].isHelper = !0, this.$ = $$[$0 - 1];
                        break;

                      case 32:
                        this.$ = new yy.HashNode($$[$0], this._$);
                        break;

                      case 33:
                        this.$ = [ $$[$0 - 2], $$[$0] ];
                        break;

                      case 34:
                        this.$ = new yy.PartialNameNode($$[$0], this._$);
                        break;

                      case 35:
                        this.$ = new yy.PartialNameNode(new yy.StringNode($$[$0], this._$), this._$);
                        break;

                      case 36:
                        this.$ = new yy.PartialNameNode(new yy.IntegerNode($$[$0], this._$));
                        break;

                      case 37:
                        this.$ = new yy.DataNode($$[$0], this._$);
                        break;

                      case 38:
                        this.$ = new yy.IdNode($$[$0], this._$);
                        break;

                      case 39:
                        $$[$0 - 2].push({
                            part: $$[$0],
                            separator: $$[$0 - 1]
                        }), this.$ = $$[$0 - 2];
                        break;

                      case 40:
                        this.$ = [ {
                            part: $$[$0]
                        } ];
                        break;

                      case 43:
                        this.$ = [];
                        break;

                      case 44:
                        $$[$0 - 1].push($$[$0]);
                        break;

                      case 47:
                        this.$ = [ $$[$0] ];
                        break;

                      case 48:
                        $$[$0 - 1].push($$[$0]);
                    }
                },
                table: [ {
                    3: 1,
                    4: 2,
                    5: [ 1, 3 ],
                    8: 4,
                    9: 5,
                    11: 6,
                    12: 7,
                    13: 8,
                    14: [ 1, 9 ],
                    15: [ 1, 10 ],
                    16: [ 1, 12 ],
                    19: [ 1, 11 ],
                    22: [ 1, 13 ],
                    23: [ 1, 14 ],
                    25: [ 1, 15 ]
                }, {
                    1: [ 3 ]
                }, {
                    5: [ 1, 16 ],
                    8: 17,
                    9: 5,
                    11: 6,
                    12: 7,
                    13: 8,
                    14: [ 1, 9 ],
                    15: [ 1, 10 ],
                    16: [ 1, 12 ],
                    19: [ 1, 11 ],
                    22: [ 1, 13 ],
                    23: [ 1, 14 ],
                    25: [ 1, 15 ]
                }, {
                    1: [ 2, 2 ]
                }, {
                    5: [ 2, 9 ],
                    14: [ 2, 9 ],
                    15: [ 2, 9 ],
                    16: [ 2, 9 ],
                    19: [ 2, 9 ],
                    20: [ 2, 9 ],
                    22: [ 2, 9 ],
                    23: [ 2, 9 ],
                    25: [ 2, 9 ]
                }, {
                    4: 20,
                    6: 18,
                    7: 19,
                    8: 4,
                    9: 5,
                    11: 6,
                    12: 7,
                    13: 8,
                    14: [ 1, 9 ],
                    15: [ 1, 10 ],
                    16: [ 1, 12 ],
                    19: [ 1, 21 ],
                    20: [ 2, 8 ],
                    22: [ 1, 13 ],
                    23: [ 1, 14 ],
                    25: [ 1, 15 ]
                }, {
                    4: 20,
                    6: 22,
                    7: 19,
                    8: 4,
                    9: 5,
                    11: 6,
                    12: 7,
                    13: 8,
                    14: [ 1, 9 ],
                    15: [ 1, 10 ],
                    16: [ 1, 12 ],
                    19: [ 1, 21 ],
                    20: [ 2, 8 ],
                    22: [ 1, 13 ],
                    23: [ 1, 14 ],
                    25: [ 1, 15 ]
                }, {
                    5: [ 2, 13 ],
                    14: [ 2, 13 ],
                    15: [ 2, 13 ],
                    16: [ 2, 13 ],
                    19: [ 2, 13 ],
                    20: [ 2, 13 ],
                    22: [ 2, 13 ],
                    23: [ 2, 13 ],
                    25: [ 2, 13 ]
                }, {
                    5: [ 2, 14 ],
                    14: [ 2, 14 ],
                    15: [ 2, 14 ],
                    16: [ 2, 14 ],
                    19: [ 2, 14 ],
                    20: [ 2, 14 ],
                    22: [ 2, 14 ],
                    23: [ 2, 14 ],
                    25: [ 2, 14 ]
                }, {
                    5: [ 2, 15 ],
                    14: [ 2, 15 ],
                    15: [ 2, 15 ],
                    16: [ 2, 15 ],
                    19: [ 2, 15 ],
                    20: [ 2, 15 ],
                    22: [ 2, 15 ],
                    23: [ 2, 15 ],
                    25: [ 2, 15 ]
                }, {
                    5: [ 2, 16 ],
                    14: [ 2, 16 ],
                    15: [ 2, 16 ],
                    16: [ 2, 16 ],
                    19: [ 2, 16 ],
                    20: [ 2, 16 ],
                    22: [ 2, 16 ],
                    23: [ 2, 16 ],
                    25: [ 2, 16 ]
                }, {
                    17: 23,
                    21: 24,
                    30: 25,
                    40: [ 1, 28 ],
                    42: [ 1, 27 ],
                    43: 26
                }, {
                    17: 29,
                    21: 24,
                    30: 25,
                    40: [ 1, 28 ],
                    42: [ 1, 27 ],
                    43: 26
                }, {
                    17: 30,
                    21: 24,
                    30: 25,
                    40: [ 1, 28 ],
                    42: [ 1, 27 ],
                    43: 26
                }, {
                    17: 31,
                    21: 24,
                    30: 25,
                    40: [ 1, 28 ],
                    42: [ 1, 27 ],
                    43: 26
                }, {
                    21: 33,
                    26: 32,
                    32: [ 1, 34 ],
                    33: [ 1, 35 ],
                    40: [ 1, 28 ],
                    43: 26
                }, {
                    1: [ 2, 1 ]
                }, {
                    5: [ 2, 10 ],
                    14: [ 2, 10 ],
                    15: [ 2, 10 ],
                    16: [ 2, 10 ],
                    19: [ 2, 10 ],
                    20: [ 2, 10 ],
                    22: [ 2, 10 ],
                    23: [ 2, 10 ],
                    25: [ 2, 10 ]
                }, {
                    10: 36,
                    20: [ 1, 37 ]
                }, {
                    4: 38,
                    8: 4,
                    9: 5,
                    11: 6,
                    12: 7,
                    13: 8,
                    14: [ 1, 9 ],
                    15: [ 1, 10 ],
                    16: [ 1, 12 ],
                    19: [ 1, 11 ],
                    20: [ 2, 7 ],
                    22: [ 1, 13 ],
                    23: [ 1, 14 ],
                    25: [ 1, 15 ]
                }, {
                    7: 39,
                    8: 17,
                    9: 5,
                    11: 6,
                    12: 7,
                    13: 8,
                    14: [ 1, 9 ],
                    15: [ 1, 10 ],
                    16: [ 1, 12 ],
                    19: [ 1, 21 ],
                    20: [ 2, 6 ],
                    22: [ 1, 13 ],
                    23: [ 1, 14 ],
                    25: [ 1, 15 ]
                }, {
                    17: 23,
                    18: [ 1, 40 ],
                    21: 24,
                    30: 25,
                    40: [ 1, 28 ],
                    42: [ 1, 27 ],
                    43: 26
                }, {
                    10: 41,
                    20: [ 1, 37 ]
                }, {
                    18: [ 1, 42 ]
                }, {
                    18: [ 2, 43 ],
                    24: [ 2, 43 ],
                    28: 43,
                    32: [ 2, 43 ],
                    33: [ 2, 43 ],
                    34: [ 2, 43 ],
                    35: [ 2, 43 ],
                    36: [ 2, 43 ],
                    40: [ 2, 43 ],
                    42: [ 2, 43 ]
                }, {
                    18: [ 2, 25 ],
                    24: [ 2, 25 ],
                    36: [ 2, 25 ]
                }, {
                    18: [ 2, 38 ],
                    24: [ 2, 38 ],
                    32: [ 2, 38 ],
                    33: [ 2, 38 ],
                    34: [ 2, 38 ],
                    35: [ 2, 38 ],
                    36: [ 2, 38 ],
                    40: [ 2, 38 ],
                    42: [ 2, 38 ],
                    44: [ 1, 44 ]
                }, {
                    21: 45,
                    40: [ 1, 28 ],
                    43: 26
                }, {
                    18: [ 2, 40 ],
                    24: [ 2, 40 ],
                    32: [ 2, 40 ],
                    33: [ 2, 40 ],
                    34: [ 2, 40 ],
                    35: [ 2, 40 ],
                    36: [ 2, 40 ],
                    40: [ 2, 40 ],
                    42: [ 2, 40 ],
                    44: [ 2, 40 ]
                }, {
                    18: [ 1, 46 ]
                }, {
                    18: [ 1, 47 ]
                }, {
                    24: [ 1, 48 ]
                }, {
                    18: [ 2, 41 ],
                    21: 50,
                    27: 49,
                    40: [ 1, 28 ],
                    43: 26
                }, {
                    18: [ 2, 34 ],
                    40: [ 2, 34 ]
                }, {
                    18: [ 2, 35 ],
                    40: [ 2, 35 ]
                }, {
                    18: [ 2, 36 ],
                    40: [ 2, 36 ]
                }, {
                    5: [ 2, 11 ],
                    14: [ 2, 11 ],
                    15: [ 2, 11 ],
                    16: [ 2, 11 ],
                    19: [ 2, 11 ],
                    20: [ 2, 11 ],
                    22: [ 2, 11 ],
                    23: [ 2, 11 ],
                    25: [ 2, 11 ]
                }, {
                    21: 51,
                    40: [ 1, 28 ],
                    43: 26
                }, {
                    8: 17,
                    9: 5,
                    11: 6,
                    12: 7,
                    13: 8,
                    14: [ 1, 9 ],
                    15: [ 1, 10 ],
                    16: [ 1, 12 ],
                    19: [ 1, 11 ],
                    20: [ 2, 3 ],
                    22: [ 1, 13 ],
                    23: [ 1, 14 ],
                    25: [ 1, 15 ]
                }, {
                    4: 52,
                    8: 4,
                    9: 5,
                    11: 6,
                    12: 7,
                    13: 8,
                    14: [ 1, 9 ],
                    15: [ 1, 10 ],
                    16: [ 1, 12 ],
                    19: [ 1, 11 ],
                    20: [ 2, 5 ],
                    22: [ 1, 13 ],
                    23: [ 1, 14 ],
                    25: [ 1, 15 ]
                }, {
                    14: [ 2, 23 ],
                    15: [ 2, 23 ],
                    16: [ 2, 23 ],
                    19: [ 2, 23 ],
                    20: [ 2, 23 ],
                    22: [ 2, 23 ],
                    23: [ 2, 23 ],
                    25: [ 2, 23 ]
                }, {
                    5: [ 2, 12 ],
                    14: [ 2, 12 ],
                    15: [ 2, 12 ],
                    16: [ 2, 12 ],
                    19: [ 2, 12 ],
                    20: [ 2, 12 ],
                    22: [ 2, 12 ],
                    23: [ 2, 12 ],
                    25: [ 2, 12 ]
                }, {
                    14: [ 2, 18 ],
                    15: [ 2, 18 ],
                    16: [ 2, 18 ],
                    19: [ 2, 18 ],
                    20: [ 2, 18 ],
                    22: [ 2, 18 ],
                    23: [ 2, 18 ],
                    25: [ 2, 18 ]
                }, {
                    18: [ 2, 45 ],
                    21: 56,
                    24: [ 2, 45 ],
                    29: 53,
                    30: 60,
                    31: 54,
                    32: [ 1, 57 ],
                    33: [ 1, 58 ],
                    34: [ 1, 59 ],
                    35: [ 1, 61 ],
                    36: [ 2, 45 ],
                    37: 55,
                    38: 62,
                    39: 63,
                    40: [ 1, 64 ],
                    42: [ 1, 27 ],
                    43: 26
                }, {
                    40: [ 1, 65 ]
                }, {
                    18: [ 2, 37 ],
                    24: [ 2, 37 ],
                    32: [ 2, 37 ],
                    33: [ 2, 37 ],
                    34: [ 2, 37 ],
                    35: [ 2, 37 ],
                    36: [ 2, 37 ],
                    40: [ 2, 37 ],
                    42: [ 2, 37 ]
                }, {
                    14: [ 2, 17 ],
                    15: [ 2, 17 ],
                    16: [ 2, 17 ],
                    19: [ 2, 17 ],
                    20: [ 2, 17 ],
                    22: [ 2, 17 ],
                    23: [ 2, 17 ],
                    25: [ 2, 17 ]
                }, {
                    5: [ 2, 20 ],
                    14: [ 2, 20 ],
                    15: [ 2, 20 ],
                    16: [ 2, 20 ],
                    19: [ 2, 20 ],
                    20: [ 2, 20 ],
                    22: [ 2, 20 ],
                    23: [ 2, 20 ],
                    25: [ 2, 20 ]
                }, {
                    5: [ 2, 21 ],
                    14: [ 2, 21 ],
                    15: [ 2, 21 ],
                    16: [ 2, 21 ],
                    19: [ 2, 21 ],
                    20: [ 2, 21 ],
                    22: [ 2, 21 ],
                    23: [ 2, 21 ],
                    25: [ 2, 21 ]
                }, {
                    18: [ 1, 66 ]
                }, {
                    18: [ 2, 42 ]
                }, {
                    18: [ 1, 67 ]
                }, {
                    8: 17,
                    9: 5,
                    11: 6,
                    12: 7,
                    13: 8,
                    14: [ 1, 9 ],
                    15: [ 1, 10 ],
                    16: [ 1, 12 ],
                    19: [ 1, 11 ],
                    20: [ 2, 4 ],
                    22: [ 1, 13 ],
                    23: [ 1, 14 ],
                    25: [ 1, 15 ]
                }, {
                    18: [ 2, 24 ],
                    24: [ 2, 24 ],
                    36: [ 2, 24 ]
                }, {
                    18: [ 2, 44 ],
                    24: [ 2, 44 ],
                    32: [ 2, 44 ],
                    33: [ 2, 44 ],
                    34: [ 2, 44 ],
                    35: [ 2, 44 ],
                    36: [ 2, 44 ],
                    40: [ 2, 44 ],
                    42: [ 2, 44 ]
                }, {
                    18: [ 2, 46 ],
                    24: [ 2, 46 ],
                    36: [ 2, 46 ]
                }, {
                    18: [ 2, 26 ],
                    24: [ 2, 26 ],
                    32: [ 2, 26 ],
                    33: [ 2, 26 ],
                    34: [ 2, 26 ],
                    35: [ 2, 26 ],
                    36: [ 2, 26 ],
                    40: [ 2, 26 ],
                    42: [ 2, 26 ]
                }, {
                    18: [ 2, 27 ],
                    24: [ 2, 27 ],
                    32: [ 2, 27 ],
                    33: [ 2, 27 ],
                    34: [ 2, 27 ],
                    35: [ 2, 27 ],
                    36: [ 2, 27 ],
                    40: [ 2, 27 ],
                    42: [ 2, 27 ]
                }, {
                    18: [ 2, 28 ],
                    24: [ 2, 28 ],
                    32: [ 2, 28 ],
                    33: [ 2, 28 ],
                    34: [ 2, 28 ],
                    35: [ 2, 28 ],
                    36: [ 2, 28 ],
                    40: [ 2, 28 ],
                    42: [ 2, 28 ]
                }, {
                    18: [ 2, 29 ],
                    24: [ 2, 29 ],
                    32: [ 2, 29 ],
                    33: [ 2, 29 ],
                    34: [ 2, 29 ],
                    35: [ 2, 29 ],
                    36: [ 2, 29 ],
                    40: [ 2, 29 ],
                    42: [ 2, 29 ]
                }, {
                    18: [ 2, 30 ],
                    24: [ 2, 30 ],
                    32: [ 2, 30 ],
                    33: [ 2, 30 ],
                    34: [ 2, 30 ],
                    35: [ 2, 30 ],
                    36: [ 2, 30 ],
                    40: [ 2, 30 ],
                    42: [ 2, 30 ]
                }, {
                    17: 68,
                    21: 24,
                    30: 25,
                    40: [ 1, 28 ],
                    42: [ 1, 27 ],
                    43: 26
                }, {
                    18: [ 2, 32 ],
                    24: [ 2, 32 ],
                    36: [ 2, 32 ],
                    39: 69,
                    40: [ 1, 70 ]
                }, {
                    18: [ 2, 47 ],
                    24: [ 2, 47 ],
                    36: [ 2, 47 ],
                    40: [ 2, 47 ]
                }, {
                    18: [ 2, 40 ],
                    24: [ 2, 40 ],
                    32: [ 2, 40 ],
                    33: [ 2, 40 ],
                    34: [ 2, 40 ],
                    35: [ 2, 40 ],
                    36: [ 2, 40 ],
                    40: [ 2, 40 ],
                    41: [ 1, 71 ],
                    42: [ 2, 40 ],
                    44: [ 2, 40 ]
                }, {
                    18: [ 2, 39 ],
                    24: [ 2, 39 ],
                    32: [ 2, 39 ],
                    33: [ 2, 39 ],
                    34: [ 2, 39 ],
                    35: [ 2, 39 ],
                    36: [ 2, 39 ],
                    40: [ 2, 39 ],
                    42: [ 2, 39 ],
                    44: [ 2, 39 ]
                }, {
                    5: [ 2, 22 ],
                    14: [ 2, 22 ],
                    15: [ 2, 22 ],
                    16: [ 2, 22 ],
                    19: [ 2, 22 ],
                    20: [ 2, 22 ],
                    22: [ 2, 22 ],
                    23: [ 2, 22 ],
                    25: [ 2, 22 ]
                }, {
                    5: [ 2, 19 ],
                    14: [ 2, 19 ],
                    15: [ 2, 19 ],
                    16: [ 2, 19 ],
                    19: [ 2, 19 ],
                    20: [ 2, 19 ],
                    22: [ 2, 19 ],
                    23: [ 2, 19 ],
                    25: [ 2, 19 ]
                }, {
                    36: [ 1, 72 ]
                }, {
                    18: [ 2, 48 ],
                    24: [ 2, 48 ],
                    36: [ 2, 48 ],
                    40: [ 2, 48 ]
                }, {
                    41: [ 1, 71 ]
                }, {
                    21: 56,
                    30: 60,
                    31: 73,
                    32: [ 1, 57 ],
                    33: [ 1, 58 ],
                    34: [ 1, 59 ],
                    35: [ 1, 61 ],
                    40: [ 1, 28 ],
                    42: [ 1, 27 ],
                    43: 26
                }, {
                    18: [ 2, 31 ],
                    24: [ 2, 31 ],
                    32: [ 2, 31 ],
                    33: [ 2, 31 ],
                    34: [ 2, 31 ],
                    35: [ 2, 31 ],
                    36: [ 2, 31 ],
                    40: [ 2, 31 ],
                    42: [ 2, 31 ]
                }, {
                    18: [ 2, 33 ],
                    24: [ 2, 33 ],
                    36: [ 2, 33 ],
                    40: [ 2, 33 ]
                } ],
                defaultActions: {
                    3: [ 2, 2 ],
                    16: [ 2, 1 ],
                    50: [ 2, 42 ]
                },
                parseError: function(str) {
                    throw new Error(str);
                },
                parse: function(input) {
                    function lex() {
                        var token;
                        return token = self.lexer.lex() || 1, "number" != typeof token && (token = self.symbols_[token] || token), 
                        token;
                    }
                    var self = this, stack = [ 0 ], vstack = [ null ], lstack = [], table = this.table, yytext = "", yylineno = 0, yyleng = 0, recovering = 0;
                    this.lexer.setInput(input), this.lexer.yy = this.yy, this.yy.lexer = this.lexer, 
                    this.yy.parser = this, "undefined" == typeof this.lexer.yylloc && (this.lexer.yylloc = {});
                    var yyloc = this.lexer.yylloc;
                    lstack.push(yyloc);
                    var ranges = this.lexer.options && this.lexer.options.ranges;
                    "function" == typeof this.yy.parseError && (this.parseError = this.yy.parseError);
                    for (var symbol, preErrorSymbol, state, action, r, p, len, newState, expected, yyval = {}; ;) {
                        if (state = stack[stack.length - 1], this.defaultActions[state] ? action = this.defaultActions[state] : ((null === symbol || "undefined" == typeof symbol) && (symbol = lex()), 
                        action = table[state] && table[state][symbol]), "undefined" == typeof action || !action.length || !action[0]) {
                            var errStr = "";
                            if (!recovering) {
                                expected = [];
                                for (p in table[state]) this.terminals_[p] && p > 2 && expected.push("'" + this.terminals_[p] + "'");
                                errStr = this.lexer.showPosition ? "Parse error on line " + (yylineno + 1) + ":\n" + this.lexer.showPosition() + "\nExpecting " + expected.join(", ") + ", got '" + (this.terminals_[symbol] || symbol) + "'" : "Parse error on line " + (yylineno + 1) + ": Unexpected " + (1 == symbol ? "end of input" : "'" + (this.terminals_[symbol] || symbol) + "'"), 
                                this.parseError(errStr, {
                                    text: this.lexer.match,
                                    token: this.terminals_[symbol] || symbol,
                                    line: this.lexer.yylineno,
                                    loc: yyloc,
                                    expected: expected
                                });
                            }
                        }
                        if (action[0] instanceof Array && action.length > 1) throw new Error("Parse Error: multiple actions possible at state: " + state + ", token: " + symbol);
                        switch (action[0]) {
                          case 1:
                            stack.push(symbol), vstack.push(this.lexer.yytext), lstack.push(this.lexer.yylloc), 
                            stack.push(action[1]), symbol = null, preErrorSymbol ? (symbol = preErrorSymbol, 
                            preErrorSymbol = null) : (yyleng = this.lexer.yyleng, yytext = this.lexer.yytext, 
                            yylineno = this.lexer.yylineno, yyloc = this.lexer.yylloc, recovering > 0 && recovering--);
                            break;

                          case 2:
                            if (len = this.productions_[action[1]][1], yyval.$ = vstack[vstack.length - len], 
                            yyval._$ = {
                                first_line: lstack[lstack.length - (len || 1)].first_line,
                                last_line: lstack[lstack.length - 1].last_line,
                                first_column: lstack[lstack.length - (len || 1)].first_column,
                                last_column: lstack[lstack.length - 1].last_column
                            }, ranges && (yyval._$.range = [ lstack[lstack.length - (len || 1)].range[0], lstack[lstack.length - 1].range[1] ]), 
                            r = this.performAction.call(yyval, yytext, yyleng, yylineno, this.yy, action[1], vstack, lstack), 
                            "undefined" != typeof r) return r;
                            len && (stack = stack.slice(0, -1 * len * 2), vstack = vstack.slice(0, -1 * len), 
                            lstack = lstack.slice(0, -1 * len)), stack.push(this.productions_[action[1]][0]), 
                            vstack.push(yyval.$), lstack.push(yyval._$), newState = table[stack[stack.length - 2]][stack[stack.length - 1]], 
                            stack.push(newState);
                            break;

                          case 3:
                            return !0;
                        }
                    }
                    return !0;
                }
            }, lexer = function() {
                var lexer = {
                    EOF: 1,
                    parseError: function(str, hash) {
                        if (!this.yy.parser) throw new Error(str);
                        this.yy.parser.parseError(str, hash);
                    },
                    setInput: function(input) {
                        return this._input = input, this._more = this._less = this.done = !1, this.yylineno = this.yyleng = 0, 
                        this.yytext = this.matched = this.match = "", this.conditionStack = [ "INITIAL" ], 
                        this.yylloc = {
                            first_line: 1,
                            first_column: 0,
                            last_line: 1,
                            last_column: 0
                        }, this.options.ranges && (this.yylloc.range = [ 0, 0 ]), this.offset = 0, this;
                    },
                    input: function() {
                        var ch = this._input[0];
                        this.yytext += ch, this.yyleng++, this.offset++, this.match += ch, this.matched += ch;
                        var lines = ch.match(/(?:\r\n?|\n).*/g);
                        return lines ? (this.yylineno++, this.yylloc.last_line++) : this.yylloc.last_column++, 
                        this.options.ranges && this.yylloc.range[1]++, this._input = this._input.slice(1), 
                        ch;
                    },
                    unput: function(ch) {
                        var len = ch.length, lines = ch.split(/(?:\r\n?|\n)/g);
                        this._input = ch + this._input, this.yytext = this.yytext.substr(0, this.yytext.length - len - 1), 
                        this.offset -= len;
                        var oldLines = this.match.split(/(?:\r\n?|\n)/g);
                        this.match = this.match.substr(0, this.match.length - 1), this.matched = this.matched.substr(0, this.matched.length - 1), 
                        lines.length - 1 && (this.yylineno -= lines.length - 1);
                        var r = this.yylloc.range;
                        return this.yylloc = {
                            first_line: this.yylloc.first_line,
                            last_line: this.yylineno + 1,
                            first_column: this.yylloc.first_column,
                            last_column: lines ? (lines.length === oldLines.length ? this.yylloc.first_column : 0) + oldLines[oldLines.length - lines.length].length - lines[0].length : this.yylloc.first_column - len
                        }, this.options.ranges && (this.yylloc.range = [ r[0], r[0] + this.yyleng - len ]), 
                        this;
                    },
                    more: function() {
                        return this._more = !0, this;
                    },
                    less: function(n) {
                        this.unput(this.match.slice(n));
                    },
                    pastInput: function() {
                        var past = this.matched.substr(0, this.matched.length - this.match.length);
                        return (past.length > 20 ? "..." : "") + past.substr(-20).replace(/\n/g, "");
                    },
                    upcomingInput: function() {
                        var next = this.match;
                        return next.length < 20 && (next += this._input.substr(0, 20 - next.length)), (next.substr(0, 20) + (next.length > 20 ? "..." : "")).replace(/\n/g, "");
                    },
                    showPosition: function() {
                        var pre = this.pastInput(), c = new Array(pre.length + 1).join("-");
                        return pre + this.upcomingInput() + "\n" + c + "^";
                    },
                    next: function() {
                        if (this.done) return this.EOF;
                        this._input || (this.done = !0);
                        var token, match, tempMatch, index, lines;
                        this._more || (this.yytext = "", this.match = "");
                        for (var rules = this._currentRules(), i = 0; i < rules.length && (tempMatch = this._input.match(this.rules[rules[i]]), 
                        !tempMatch || match && !(tempMatch[0].length > match[0].length) || (match = tempMatch, 
                        index = i, this.options.flex)); i++) ;
                        return match ? (lines = match[0].match(/(?:\r\n?|\n).*/g), lines && (this.yylineno += lines.length), 
                        this.yylloc = {
                            first_line: this.yylloc.last_line,
                            last_line: this.yylineno + 1,
                            first_column: this.yylloc.last_column,
                            last_column: lines ? lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length : this.yylloc.last_column + match[0].length
                        }, this.yytext += match[0], this.match += match[0], this.matches = match, this.yyleng = this.yytext.length, 
                        this.options.ranges && (this.yylloc.range = [ this.offset, this.offset += this.yyleng ]), 
                        this._more = !1, this._input = this._input.slice(match[0].length), this.matched += match[0], 
                        token = this.performAction.call(this, this.yy, this, rules[index], this.conditionStack[this.conditionStack.length - 1]), 
                        this.done && this._input && (this.done = !1), token ? token : void 0) : "" === this._input ? this.EOF : this.parseError("Lexical error on line " + (this.yylineno + 1) + ". Unrecognized text.\n" + this.showPosition(), {
                            text: "",
                            token: null,
                            line: this.yylineno
                        });
                    },
                    lex: function() {
                        var r = this.next();
                        return "undefined" != typeof r ? r : this.lex();
                    },
                    begin: function(condition) {
                        this.conditionStack.push(condition);
                    },
                    popState: function() {
                        return this.conditionStack.pop();
                    },
                    _currentRules: function() {
                        return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
                    },
                    topState: function() {
                        return this.conditionStack[this.conditionStack.length - 2];
                    },
                    pushState: function(condition) {
                        this.begin(condition);
                    }
                };
                return lexer.options = {}, lexer.performAction = function(yy, yy_, $avoiding_name_collisions, YY_START) {
                    function strip(start, end) {
                        return yy_.yytext = yy_.yytext.substr(start, yy_.yyleng - end);
                    }
                    switch ($avoiding_name_collisions) {
                      case 0:
                        if ("\\\\" === yy_.yytext.slice(-2) ? (strip(0, 1), this.begin("mu")) : "\\" === yy_.yytext.slice(-1) ? (strip(0, 1), 
                        this.begin("emu")) : this.begin("mu"), yy_.yytext) return 14;
                        break;

                      case 1:
                        return 14;

                      case 2:
                        return this.popState(), 14;

                      case 3:
                        return strip(0, 4), this.popState(), 15;

                      case 4:
                        return 35;

                      case 5:
                        return 36;

                      case 6:
                        return 25;

                      case 7:
                        return 16;

                      case 8:
                        return 20;

                      case 9:
                        return 19;

                      case 10:
                        return 19;

                      case 11:
                        return 23;

                      case 12:
                        return 22;

                      case 13:
                        this.popState(), this.begin("com");
                        break;

                      case 14:
                        return strip(3, 5), this.popState(), 15;

                      case 15:
                        return 22;

                      case 16:
                        return 41;

                      case 17:
                        return 40;

                      case 18:
                        return 40;

                      case 19:
                        return 44;

                      case 20:
                        break;

                      case 21:
                        return this.popState(), 24;

                      case 22:
                        return this.popState(), 18;

                      case 23:
                        return yy_.yytext = strip(1, 2).replace(/\\"/g, '"'), 32;

                      case 24:
                        return yy_.yytext = strip(1, 2).replace(/\\'/g, "'"), 32;

                      case 25:
                        return 42;

                      case 26:
                        return 34;

                      case 27:
                        return 34;

                      case 28:
                        return 33;

                      case 29:
                        return 40;

                      case 30:
                        return yy_.yytext = strip(1, 2), 40;

                      case 31:
                        return "INVALID";

                      case 32:
                        return 5;
                    }
                }, lexer.rules = [ /^(?:[^\x00]*?(?=(\{\{)))/, /^(?:[^\x00]+)/, /^(?:[^\x00]{2,}?(?=(\{\{|\\\{\{|\\\\\{\{|$)))/, /^(?:[\s\S]*?--\}\})/, /^(?:\()/, /^(?:\))/, /^(?:\{\{(~)?>)/, /^(?:\{\{(~)?#)/, /^(?:\{\{(~)?\/)/, /^(?:\{\{(~)?\^)/, /^(?:\{\{(~)?\s*else\b)/, /^(?:\{\{(~)?\{)/, /^(?:\{\{(~)?&)/, /^(?:\{\{!--)/, /^(?:\{\{![\s\S]*?\}\})/, /^(?:\{\{(~)?)/, /^(?:=)/, /^(?:\.\.)/, /^(?:\.(?=([=~}\s\/.)])))/, /^(?:[\/.])/, /^(?:\s+)/, /^(?:\}(~)?\}\})/, /^(?:(~)?\}\})/, /^(?:"(\\["]|[^"])*")/, /^(?:'(\\[']|[^'])*')/, /^(?:@)/, /^(?:true(?=([~}\s)])))/, /^(?:false(?=([~}\s)])))/, /^(?:-?[0-9]+(?=([~}\s)])))/, /^(?:([^\s!"#%-,\.\/;->@\[-\^`\{-~]+(?=([=~}\s\/.)]))))/, /^(?:\[[^\]]*\])/, /^(?:.)/, /^(?:$)/ ], 
                lexer.conditions = {
                    mu: {
                        rules: [ 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32 ],
                        inclusive: !1
                    },
                    emu: {
                        rules: [ 2 ],
                        inclusive: !1
                    },
                    com: {
                        rules: [ 3 ],
                        inclusive: !1
                    },
                    INITIAL: {
                        rules: [ 0, 1, 32 ],
                        inclusive: !0
                    }
                }, lexer;
            }();
            return parser.lexer = lexer, Parser.prototype = parser, parser.Parser = Parser, 
            new Parser();
        }();
        return __exports__ = handlebars;
    }(), __module8__ = function(__dependency1__, __dependency2__) {
        "use strict";
        function parse(input) {
            return input.constructor === AST.ProgramNode ? input : (parser.yy = AST, parser.parse(input));
        }
        var __exports__ = {}, parser = __dependency1__, AST = __dependency2__;
        return __exports__.parser = parser, __exports__.parse = parse, __exports__;
    }(__module9__, __module7__), __module10__ = function(__dependency1__) {
        "use strict";
        function Compiler() {}
        function precompile(input, options, env) {
            if (null == input || "string" != typeof input && input.constructor !== env.AST.ProgramNode) throw new Exception("You must pass a string or Handlebars AST to Handlebars.precompile. You passed " + input);
            options = options || {}, "data" in options || (options.data = !0);
            var ast = env.parse(input), environment = new env.Compiler().compile(ast, options);
            return new env.JavaScriptCompiler().compile(environment, options);
        }
        function compile(input, options, env) {
            function compileInput() {
                var ast = env.parse(input), environment = new env.Compiler().compile(ast, options), templateSpec = new env.JavaScriptCompiler().compile(environment, options, void 0, !0);
                return env.template(templateSpec);
            }
            if (null == input || "string" != typeof input && input.constructor !== env.AST.ProgramNode) throw new Exception("You must pass a string or Handlebars AST to Handlebars.compile. You passed " + input);
            options = options || {}, "data" in options || (options.data = !0);
            var compiled;
            return function(context, options) {
                return compiled || (compiled = compileInput()), compiled.call(this, context, options);
            };
        }
        var __exports__ = {}, Exception = __dependency1__;
        return __exports__.Compiler = Compiler, Compiler.prototype = {
            compiler: Compiler,
            disassemble: function() {
                for (var opcode, params, param, opcodes = this.opcodes, out = [], i = 0, l = opcodes.length; l > i; i++) if (opcode = opcodes[i], 
                "DECLARE" === opcode.opcode) out.push("DECLARE " + opcode.name + "=" + opcode.value); else {
                    params = [];
                    for (var j = 0; j < opcode.args.length; j++) param = opcode.args[j], "string" == typeof param && (param = '"' + param.replace("\n", "\\n") + '"'), 
                    params.push(param);
                    out.push(opcode.opcode + " " + params.join(" "));
                }
                return out.join("\n");
            },
            equals: function(other) {
                var len = this.opcodes.length;
                if (other.opcodes.length !== len) return !1;
                for (var i = 0; len > i; i++) {
                    var opcode = this.opcodes[i], otherOpcode = other.opcodes[i];
                    if (opcode.opcode !== otherOpcode.opcode || opcode.args.length !== otherOpcode.args.length) return !1;
                    for (var j = 0; j < opcode.args.length; j++) if (opcode.args[j] !== otherOpcode.args[j]) return !1;
                }
                if (len = this.children.length, other.children.length !== len) return !1;
                for (i = 0; len > i; i++) if (!this.children[i].equals(other.children[i])) return !1;
                return !0;
            },
            guid: 0,
            compile: function(program, options) {
                this.opcodes = [], this.children = [], this.depths = {
                    list: []
                }, this.options = options;
                var knownHelpers = this.options.knownHelpers;
                if (this.options.knownHelpers = {
                    helperMissing: !0,
                    blockHelperMissing: !0,
                    each: !0,
                    "if": !0,
                    unless: !0,
                    "with": !0,
                    log: !0
                }, knownHelpers) for (var name in knownHelpers) this.options.knownHelpers[name] = knownHelpers[name];
                return this.accept(program);
            },
            accept: function(node) {
                var ret, strip = node.strip || {};
                return strip.left && this.opcode("strip"), ret = this[node.type](node), strip.right && this.opcode("strip"), 
                ret;
            },
            program: function(program) {
                for (var statements = program.statements, i = 0, l = statements.length; l > i; i++) this.accept(statements[i]);
                return this.isSimple = 1 === l, this.depths.list = this.depths.list.sort(function(a, b) {
                    return a - b;
                }), this;
            },
            compileProgram: function(program) {
                var depth, result = new this.compiler().compile(program, this.options), guid = this.guid++;
                this.usePartial = this.usePartial || result.usePartial, this.children[guid] = result;
                for (var i = 0, l = result.depths.list.length; l > i; i++) depth = result.depths.list[i], 
                2 > depth || this.addDepth(depth - 1);
                return guid;
            },
            block: function(block) {
                var mustache = block.mustache, program = block.program, inverse = block.inverse;
                program && (program = this.compileProgram(program)), inverse && (inverse = this.compileProgram(inverse));
                var sexpr = mustache.sexpr, type = this.classifySexpr(sexpr);
                "helper" === type ? this.helperSexpr(sexpr, program, inverse) : "simple" === type ? (this.simpleSexpr(sexpr), 
                this.opcode("pushProgram", program), this.opcode("pushProgram", inverse), this.opcode("emptyHash"), 
                this.opcode("blockValue")) : (this.ambiguousSexpr(sexpr, program, inverse), this.opcode("pushProgram", program), 
                this.opcode("pushProgram", inverse), this.opcode("emptyHash"), this.opcode("ambiguousBlockValue")), 
                this.opcode("append");
            },
            hash: function(hash) {
                var pair, val, pairs = hash.pairs;
                this.opcode("pushHash");
                for (var i = 0, l = pairs.length; l > i; i++) pair = pairs[i], val = pair[1], this.options.stringParams ? (val.depth && this.addDepth(val.depth), 
                this.opcode("getContext", val.depth || 0), this.opcode("pushStringParam", val.stringModeValue, val.type), 
                "sexpr" === val.type && this.sexpr(val)) : this.accept(val), this.opcode("assignToHash", pair[0]);
                this.opcode("popHash");
            },
            partial: function(partial) {
                var partialName = partial.partialName;
                this.usePartial = !0, partial.context ? this.ID(partial.context) : this.opcode("push", "depth0"), 
                this.opcode("invokePartial", partialName.name), this.opcode("append");
            },
            content: function(content) {
                this.opcode("appendContent", content.string);
            },
            mustache: function(mustache) {
                this.sexpr(mustache.sexpr), this.opcode(mustache.escaped && !this.options.noEscape ? "appendEscaped" : "append");
            },
            ambiguousSexpr: function(sexpr, program, inverse) {
                var id = sexpr.id, name = id.parts[0], isBlock = null != program || null != inverse;
                this.opcode("getContext", id.depth), this.opcode("pushProgram", program), this.opcode("pushProgram", inverse), 
                this.opcode("invokeAmbiguous", name, isBlock);
            },
            simpleSexpr: function(sexpr) {
                var id = sexpr.id;
                "DATA" === id.type ? this.DATA(id) : id.parts.length ? this.ID(id) : (this.addDepth(id.depth), 
                this.opcode("getContext", id.depth), this.opcode("pushContext")), this.opcode("resolvePossibleLambda");
            },
            helperSexpr: function(sexpr, program, inverse) {
                var params = this.setupFullMustacheParams(sexpr, program, inverse), name = sexpr.id.parts[0];
                if (this.options.knownHelpers[name]) this.opcode("invokeKnownHelper", params.length, name); else {
                    if (this.options.knownHelpersOnly) throw new Exception("You specified knownHelpersOnly, but used the unknown helper " + name, sexpr);
                    this.opcode("invokeHelper", params.length, name, sexpr.isRoot);
                }
            },
            sexpr: function(sexpr) {
                var type = this.classifySexpr(sexpr);
                "simple" === type ? this.simpleSexpr(sexpr) : "helper" === type ? this.helperSexpr(sexpr) : this.ambiguousSexpr(sexpr);
            },
            ID: function(id) {
                this.addDepth(id.depth), this.opcode("getContext", id.depth);
                var name = id.parts[0];
                name ? this.opcode("lookupOnContext", id.parts[0]) : this.opcode("pushContext");
                for (var i = 1, l = id.parts.length; l > i; i++) this.opcode("lookup", id.parts[i]);
            },
            DATA: function(data) {
                if (this.options.data = !0, data.id.isScoped || data.id.depth) throw new Exception("Scoped data references are not supported: " + data.original, data);
                this.opcode("lookupData");
                for (var parts = data.id.parts, i = 0, l = parts.length; l > i; i++) this.opcode("lookup", parts[i]);
            },
            STRING: function(string) {
                this.opcode("pushString", string.string);
            },
            INTEGER: function(integer) {
                this.opcode("pushLiteral", integer.integer);
            },
            BOOLEAN: function(bool) {
                this.opcode("pushLiteral", bool.bool);
            },
            comment: function() {},
            opcode: function(name) {
                this.opcodes.push({
                    opcode: name,
                    args: [].slice.call(arguments, 1)
                });
            },
            declare: function(name, value) {
                this.opcodes.push({
                    opcode: "DECLARE",
                    name: name,
                    value: value
                });
            },
            addDepth: function(depth) {
                0 !== depth && (this.depths[depth] || (this.depths[depth] = !0, this.depths.list.push(depth)));
            },
            classifySexpr: function(sexpr) {
                var isHelper = sexpr.isHelper, isEligible = sexpr.eligibleHelper, options = this.options;
                if (isEligible && !isHelper) {
                    var name = sexpr.id.parts[0];
                    options.knownHelpers[name] ? isHelper = !0 : options.knownHelpersOnly && (isEligible = !1);
                }
                return isHelper ? "helper" : isEligible ? "ambiguous" : "simple";
            },
            pushParams: function(params) {
                for (var param, i = params.length; i--; ) param = params[i], this.options.stringParams ? (param.depth && this.addDepth(param.depth), 
                this.opcode("getContext", param.depth || 0), this.opcode("pushStringParam", param.stringModeValue, param.type), 
                "sexpr" === param.type && this.sexpr(param)) : this[param.type](param);
            },
            setupFullMustacheParams: function(sexpr, program, inverse) {
                var params = sexpr.params;
                return this.pushParams(params), this.opcode("pushProgram", program), this.opcode("pushProgram", inverse), 
                sexpr.hash ? this.hash(sexpr.hash) : this.opcode("emptyHash"), params;
            }
        }, __exports__.precompile = precompile, __exports__.compile = compile, __exports__;
    }(__module5__), __module11__ = function(__dependency1__, __dependency2__) {
        "use strict";
        function Literal(value) {
            this.value = value;
        }
        function JavaScriptCompiler() {}
        var __exports__, COMPILER_REVISION = __dependency1__.COMPILER_REVISION, REVISION_CHANGES = __dependency1__.REVISION_CHANGES, log = __dependency1__.log, Exception = __dependency2__;
        JavaScriptCompiler.prototype = {
            nameLookup: function(parent, name) {
                var wrap, ret;
                return 0 === parent.indexOf("depth") && (wrap = !0), ret = /^[0-9]+$/.test(name) ? parent + "[" + name + "]" : JavaScriptCompiler.isValidJavaScriptVariableName(name) ? parent + "." + name : parent + "['" + name + "']", 
                wrap ? "(" + parent + " && " + ret + ")" : ret;
            },
            compilerInfo: function() {
                var revision = COMPILER_REVISION, versions = REVISION_CHANGES[revision];
                return "this.compilerInfo = [" + revision + ",'" + versions + "'];\n";
            },
            appendToBuffer: function(string) {
                return this.environment.isSimple ? "return " + string + ";" : {
                    appendToBuffer: !0,
                    content: string,
                    toString: function() {
                        return "buffer += " + string + ";";
                    }
                };
            },
            initializeBuffer: function() {
                return this.quotedString("");
            },
            namespace: "Handlebars",
            compile: function(environment, options, context, asObject) {
                this.environment = environment, this.options = options || {}, log("debug", this.environment.disassemble() + "\n\n"), 
                this.name = this.environment.name, this.isChild = !!context, this.context = context || {
                    programs: [],
                    environments: [],
                    aliases: {}
                }, this.preamble(), this.stackSlot = 0, this.stackVars = [], this.registers = {
                    list: []
                }, this.hashes = [], this.compileStack = [], this.inlineStack = [], this.compileChildren(environment, options);
                var opcode, opcodes = environment.opcodes;
                this.i = 0;
                for (var l = opcodes.length; this.i < l; this.i++) opcode = opcodes[this.i], "DECLARE" === opcode.opcode ? this[opcode.name] = opcode.value : this[opcode.opcode].apply(this, opcode.args), 
                opcode.opcode !== this.stripNext && (this.stripNext = !1);
                if (this.pushSource(""), this.stackSlot || this.inlineStack.length || this.compileStack.length) throw new Exception("Compile completed with content left on stack");
                return this.createFunctionContext(asObject);
            },
            preamble: function() {
                var out = [];
                if (this.isChild) out.push(""); else {
                    var namespace = this.namespace, copies = "helpers = this.merge(helpers, " + namespace + ".helpers);";
                    this.environment.usePartial && (copies = copies + " partials = this.merge(partials, " + namespace + ".partials);"), 
                    this.options.data && (copies += " data = data || {};"), out.push(copies);
                }
                out.push(this.environment.isSimple ? "" : ", buffer = " + this.initializeBuffer()), 
                this.lastContext = 0, this.source = out;
            },
            createFunctionContext: function(asObject) {
                var locals = this.stackVars.concat(this.registers.list);
                if (locals.length > 0 && (this.source[1] = this.source[1] + ", " + locals.join(", ")), 
                !this.isChild) for (var alias in this.context.aliases) this.context.aliases.hasOwnProperty(alias) && (this.source[1] = this.source[1] + ", " + alias + "=" + this.context.aliases[alias]);
                this.source[1] && (this.source[1] = "var " + this.source[1].substring(2) + ";"), 
                this.isChild || (this.source[1] += "\n" + this.context.programs.join("\n") + "\n"), 
                this.environment.isSimple || this.pushSource("return buffer;");
                for (var params = this.isChild ? [ "depth0", "data" ] : [ "Handlebars", "depth0", "helpers", "partials", "data" ], i = 0, l = this.environment.depths.list.length; l > i; i++) params.push("depth" + this.environment.depths.list[i]);
                var source = this.mergeSource();
                if (this.isChild || (source = this.compilerInfo() + source), asObject) return params.push(source), 
                Function.apply(this, params);
                var functionSource = "function " + (this.name || "") + "(" + params.join(",") + ") {\n  " + source + "}";
                return log("debug", functionSource + "\n\n"), functionSource;
            },
            mergeSource: function() {
                for (var buffer, source = "", i = 0, len = this.source.length; len > i; i++) {
                    var line = this.source[i];
                    line.appendToBuffer ? buffer = buffer ? buffer + "\n    + " + line.content : line.content : (buffer && (source += "buffer += " + buffer + ";\n  ", 
                    buffer = void 0), source += line + "\n  ");
                }
                return source;
            },
            blockValue: function() {
                this.context.aliases.blockHelperMissing = "helpers.blockHelperMissing";
                var params = [ "depth0" ];
                this.setupParams(0, params), this.replaceStack(function(current) {
                    return params.splice(1, 0, current), "blockHelperMissing.call(" + params.join(", ") + ")";
                });
            },
            ambiguousBlockValue: function() {
                this.context.aliases.blockHelperMissing = "helpers.blockHelperMissing";
                var params = [ "depth0" ];
                this.setupParams(0, params);
                var current = this.topStack();
                params.splice(1, 0, current), this.pushSource("if (!" + this.lastHelper + ") { " + current + " = blockHelperMissing.call(" + params.join(", ") + "); }");
            },
            appendContent: function(content) {
                this.pendingContent && (content = this.pendingContent + content), this.stripNext && (content = content.replace(/^\s+/, "")), 
                this.pendingContent = content;
            },
            strip: function() {
                this.pendingContent && (this.pendingContent = this.pendingContent.replace(/\s+$/, "")), 
                this.stripNext = "strip";
            },
            append: function() {
                this.flushInline();
                var local = this.popStack();
                this.pushSource("if(" + local + " || " + local + " === 0) { " + this.appendToBuffer(local) + " }"), 
                this.environment.isSimple && this.pushSource("else { " + this.appendToBuffer("''") + " }");
            },
            appendEscaped: function() {
                this.context.aliases.escapeExpression = "this.escapeExpression", this.pushSource(this.appendToBuffer("escapeExpression(" + this.popStack() + ")"));
            },
            getContext: function(depth) {
                this.lastContext !== depth && (this.lastContext = depth);
            },
            lookupOnContext: function(name) {
                this.push(this.nameLookup("depth" + this.lastContext, name, "context"));
            },
            pushContext: function() {
                this.pushStackLiteral("depth" + this.lastContext);
            },
            resolvePossibleLambda: function() {
                this.context.aliases.functionType = '"function"', this.replaceStack(function(current) {
                    return "typeof " + current + " === functionType ? " + current + ".apply(depth0) : " + current;
                });
            },
            lookup: function(name) {
                this.replaceStack(function(current) {
                    return current + " == null || " + current + " === false ? " + current + " : " + this.nameLookup(current, name, "context");
                });
            },
            lookupData: function() {
                this.pushStackLiteral("data");
            },
            pushStringParam: function(string, type) {
                this.pushStackLiteral("depth" + this.lastContext), this.pushString(type), "sexpr" !== type && ("string" == typeof string ? this.pushString(string) : this.pushStackLiteral(string));
            },
            emptyHash: function() {
                this.pushStackLiteral("{}"), this.options.stringParams && (this.push("{}"), this.push("{}"));
            },
            pushHash: function() {
                this.hash && this.hashes.push(this.hash), this.hash = {
                    values: [],
                    types: [],
                    contexts: []
                };
            },
            popHash: function() {
                var hash = this.hash;
                this.hash = this.hashes.pop(), this.options.stringParams && (this.push("{" + hash.contexts.join(",") + "}"), 
                this.push("{" + hash.types.join(",") + "}")), this.push("{\n    " + hash.values.join(",\n    ") + "\n  }");
            },
            pushString: function(string) {
                this.pushStackLiteral(this.quotedString(string));
            },
            push: function(expr) {
                return this.inlineStack.push(expr), expr;
            },
            pushLiteral: function(value) {
                this.pushStackLiteral(value);
            },
            pushProgram: function(guid) {
                this.pushStackLiteral(null != guid ? this.programExpression(guid) : null);
            },
            invokeHelper: function(paramSize, name, isRoot) {
                this.context.aliases.helperMissing = "helpers.helperMissing", this.useRegister("helper");
                var helper = this.lastHelper = this.setupHelper(paramSize, name, !0), nonHelper = this.nameLookup("depth" + this.lastContext, name, "context"), lookup = "helper = " + helper.name + " || " + nonHelper;
                helper.paramsInit && (lookup += "," + helper.paramsInit), this.push("(" + lookup + ",helper ? helper.call(" + helper.callParams + ") : helperMissing.call(" + helper.helperMissingParams + "))"), 
                isRoot || this.flushInline();
            },
            invokeKnownHelper: function(paramSize, name) {
                var helper = this.setupHelper(paramSize, name);
                this.push(helper.name + ".call(" + helper.callParams + ")");
            },
            invokeAmbiguous: function(name, helperCall) {
                this.context.aliases.functionType = '"function"', this.useRegister("helper"), this.emptyHash();
                var helper = this.setupHelper(0, name, helperCall), helperName = this.lastHelper = this.nameLookup("helpers", name, "helper"), nonHelper = this.nameLookup("depth" + this.lastContext, name, "context"), nextStack = this.nextStack();
                helper.paramsInit && this.pushSource(helper.paramsInit), this.pushSource("if (helper = " + helperName + ") { " + nextStack + " = helper.call(" + helper.callParams + "); }"), 
                this.pushSource("else { helper = " + nonHelper + "; " + nextStack + " = typeof helper === functionType ? helper.call(" + helper.callParams + ") : helper; }");
            },
            invokePartial: function(name) {
                var params = [ this.nameLookup("partials", name, "partial"), "'" + name + "'", this.popStack(), "helpers", "partials" ];
                this.options.data && params.push("data"), this.context.aliases.self = "this", this.push("self.invokePartial(" + params.join(", ") + ")");
            },
            assignToHash: function(key) {
                var context, type, value = this.popStack();
                this.options.stringParams && (type = this.popStack(), context = this.popStack());
                var hash = this.hash;
                context && hash.contexts.push("'" + key + "': " + context), type && hash.types.push("'" + key + "': " + type), 
                hash.values.push("'" + key + "': (" + value + ")");
            },
            compiler: JavaScriptCompiler,
            compileChildren: function(environment, options) {
                for (var child, compiler, children = environment.children, i = 0, l = children.length; l > i; i++) {
                    child = children[i], compiler = new this.compiler();
                    var index = this.matchExistingProgram(child);
                    null == index ? (this.context.programs.push(""), index = this.context.programs.length, 
                    child.index = index, child.name = "program" + index, this.context.programs[index] = compiler.compile(child, options, this.context), 
                    this.context.environments[index] = child) : (child.index = index, child.name = "program" + index);
                }
            },
            matchExistingProgram: function(child) {
                for (var i = 0, len = this.context.environments.length; len > i; i++) {
                    var environment = this.context.environments[i];
                    if (environment && environment.equals(child)) return i;
                }
            },
            programExpression: function(guid) {
                if (this.context.aliases.self = "this", null == guid) return "self.noop";
                for (var depth, child = this.environment.children[guid], depths = child.depths.list, programParams = [ child.index, child.name, "data" ], i = 0, l = depths.length; l > i; i++) depth = depths[i], 
                programParams.push(1 === depth ? "depth0" : "depth" + (depth - 1));
                return (0 === depths.length ? "self.program(" : "self.programWithDepth(") + programParams.join(", ") + ")";
            },
            register: function(name, val) {
                this.useRegister(name), this.pushSource(name + " = " + val + ";");
            },
            useRegister: function(name) {
                this.registers[name] || (this.registers[name] = !0, this.registers.list.push(name));
            },
            pushStackLiteral: function(item) {
                return this.push(new Literal(item));
            },
            pushSource: function(source) {
                this.pendingContent && (this.source.push(this.appendToBuffer(this.quotedString(this.pendingContent))), 
                this.pendingContent = void 0), source && this.source.push(source);
            },
            pushStack: function(item) {
                this.flushInline();
                var stack = this.incrStack();
                return item && this.pushSource(stack + " = " + item + ";"), this.compileStack.push(stack), 
                stack;
            },
            replaceStack: function(callback) {
                var stack, createdStack, usedLiteral, prefix = "", inline = this.isInline();
                if (inline) {
                    var top = this.popStack(!0);
                    if (top instanceof Literal) stack = top.value, usedLiteral = !0; else {
                        createdStack = !this.stackSlot;
                        var name = createdStack ? this.incrStack() : this.topStackName();
                        prefix = "(" + this.push(name) + " = " + top + "),", stack = this.topStack();
                    }
                } else stack = this.topStack();
                var item = callback.call(this, stack);
                return inline ? (usedLiteral || this.popStack(), createdStack && this.stackSlot--, 
                this.push("(" + prefix + item + ")")) : (/^stack/.test(stack) || (stack = this.nextStack()), 
                this.pushSource(stack + " = (" + prefix + item + ");")), stack;
            },
            nextStack: function() {
                return this.pushStack();
            },
            incrStack: function() {
                return this.stackSlot++, this.stackSlot > this.stackVars.length && this.stackVars.push("stack" + this.stackSlot), 
                this.topStackName();
            },
            topStackName: function() {
                return "stack" + this.stackSlot;
            },
            flushInline: function() {
                var inlineStack = this.inlineStack;
                if (inlineStack.length) {
                    this.inlineStack = [];
                    for (var i = 0, len = inlineStack.length; len > i; i++) {
                        var entry = inlineStack[i];
                        entry instanceof Literal ? this.compileStack.push(entry) : this.pushStack(entry);
                    }
                }
            },
            isInline: function() {
                return this.inlineStack.length;
            },
            popStack: function(wrapped) {
                var inline = this.isInline(), item = (inline ? this.inlineStack : this.compileStack).pop();
                if (!wrapped && item instanceof Literal) return item.value;
                if (!inline) {
                    if (!this.stackSlot) throw new Exception("Invalid stack pop");
                    this.stackSlot--;
                }
                return item;
            },
            topStack: function(wrapped) {
                var stack = this.isInline() ? this.inlineStack : this.compileStack, item = stack[stack.length - 1];
                return !wrapped && item instanceof Literal ? item.value : item;
            },
            quotedString: function(str) {
                return '"' + str.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029") + '"';
            },
            setupHelper: function(paramSize, name, missingParams) {
                var params = [], paramsInit = this.setupParams(paramSize, params, missingParams), foundHelper = this.nameLookup("helpers", name, "helper");
                return {
                    params: params,
                    paramsInit: paramsInit,
                    name: foundHelper,
                    callParams: [ "depth0" ].concat(params).join(", "),
                    helperMissingParams: missingParams && [ "depth0", this.quotedString(name) ].concat(params).join(", ")
                };
            },
            setupOptions: function(paramSize, params) {
                var param, inverse, program, options = [], contexts = [], types = [];
                options.push("hash:" + this.popStack()), this.options.stringParams && (options.push("hashTypes:" + this.popStack()), 
                options.push("hashContexts:" + this.popStack())), inverse = this.popStack(), program = this.popStack(), 
                (program || inverse) && (program || (this.context.aliases.self = "this", program = "self.noop"), 
                inverse || (this.context.aliases.self = "this", inverse = "self.noop"), options.push("inverse:" + inverse), 
                options.push("fn:" + program));
                for (var i = 0; paramSize > i; i++) param = this.popStack(), params.push(param), 
                this.options.stringParams && (types.push(this.popStack()), contexts.push(this.popStack()));
                return this.options.stringParams && (options.push("contexts:[" + contexts.join(",") + "]"), 
                options.push("types:[" + types.join(",") + "]")), this.options.data && options.push("data:data"), 
                options;
            },
            setupParams: function(paramSize, params, useRegister) {
                var options = "{" + this.setupOptions(paramSize, params).join(",") + "}";
                return useRegister ? (this.useRegister("options"), params.push("options"), "options=" + options) : (params.push(options), 
                "");
            }
        };
        for (var reservedWords = "break else new var case finally return void catch for switch while continue function this with default if throw delete in try do instanceof typeof abstract enum int short boolean export interface static byte extends long super char final native synchronized class float package throws const goto private transient debugger implements protected volatile double import public let yield".split(" "), compilerWords = JavaScriptCompiler.RESERVED_WORDS = {}, i = 0, l = reservedWords.length; l > i; i++) compilerWords[reservedWords[i]] = !0;
        return JavaScriptCompiler.isValidJavaScriptVariableName = function(name) {
            return !JavaScriptCompiler.RESERVED_WORDS[name] && /^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(name) ? !0 : !1;
        }, __exports__ = JavaScriptCompiler;
    }(__module2__, __module5__), __module0__ = function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__) {
        "use strict";
        var __exports__, Handlebars = __dependency1__, AST = __dependency2__, Parser = __dependency3__.parser, parse = __dependency3__.parse, Compiler = __dependency4__.Compiler, compile = __dependency4__.compile, precompile = __dependency4__.precompile, JavaScriptCompiler = __dependency5__, _create = Handlebars.create, create = function() {
            var hb = _create();
            return hb.compile = function(input, options) {
                return compile(input, options, hb);
            }, hb.precompile = function(input, options) {
                return precompile(input, options, hb);
            }, hb.AST = AST, hb.Compiler = Compiler, hb.JavaScriptCompiler = JavaScriptCompiler, 
            hb.Parser = Parser, hb.parse = parse, hb;
        };
        return Handlebars = create(), Handlebars.create = create, __exports__ = Handlebars;
    }(__module1__, __module7__, __module8__, __module10__, __module11__);
    return __module0__;
}();

define("gens/std/plugins/requirejs-text/text", [ "module" ], function(module) {
    "use strict";
    var text, fs, Cc, Ci, xpcIsWindows, progIds = [ "Msxml2.XMLHTTP", "Microsoft.XMLHTTP", "Msxml2.XMLHTTP.4.0" ], xmlRegExp = /^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im, bodyRegExp = /<body[^>]*>\s*([\s\S]+)\s*<\/body>/im, hasLocation = "undefined" != typeof location && location.href, defaultProtocol = hasLocation && location.protocol && location.protocol.replace(/\:/, ""), defaultHostName = hasLocation && location.hostname, defaultPort = hasLocation && (location.port || void 0), buildMap = {}, masterConfig = module.config && module.config() || {};
    return text = {
        version: "2.0.10",
        strip: function(content) {
            if (content) {
                content = content.replace(xmlRegExp, "");
                var matches = content.match(bodyRegExp);
                matches && (content = matches[1]);
            } else content = "";
            return content;
        },
        jsEscape: function(content) {
            return content.replace(/(['\\])/g, "\\$1").replace(/[\f]/g, "\\f").replace(/[\b]/g, "\\b").replace(/[\n]/g, "\\n").replace(/[\t]/g, "\\t").replace(/[\r]/g, "\\r").replace(/[\u2028]/g, "\\u2028").replace(/[\u2029]/g, "\\u2029");
        },
        createXhr: masterConfig.createXhr || function() {
            var xhr, i, progId;
            if ("undefined" != typeof XMLHttpRequest) return new XMLHttpRequest();
            if ("undefined" != typeof ActiveXObject) for (i = 0; 3 > i; i += 1) {
                progId = progIds[i];
                try {
                    xhr = new ActiveXObject(progId);
                } catch (e) {}
                if (xhr) {
                    progIds = [ progId ];
                    break;
                }
            }
            return xhr;
        },
        parseName: function(name) {
            var modName, ext, temp, strip = !1, index = name.indexOf("."), isRelative = 0 === name.indexOf("./") || 0 === name.indexOf("../");
            return -1 !== index && (!isRelative || index > 1) ? (modName = name.substring(0, index), 
            ext = name.substring(index + 1, name.length)) : modName = name, temp = ext || modName, 
            index = temp.indexOf("!"), -1 !== index && (strip = "strip" === temp.substring(index + 1), 
            temp = temp.substring(0, index), ext ? ext = temp : modName = temp), {
                moduleName: modName,
                ext: ext,
                strip: strip
            };
        },
        xdRegExp: /^((\w+)\:)?\/\/([^\/\\]+)/,
        useXhr: function(url, protocol, hostname, port) {
            var uProtocol, uHostName, uPort, match = text.xdRegExp.exec(url);
            return match ? (uProtocol = match[2], uHostName = match[3], uHostName = uHostName.split(":"), 
            uPort = uHostName[1], uHostName = uHostName[0], !(uProtocol && uProtocol !== protocol || uHostName && uHostName.toLowerCase() !== hostname.toLowerCase() || (uPort || uHostName) && uPort !== port)) : !0;
        },
        finishLoad: function(name, strip, content, onLoad) {
            content = strip ? text.strip(content) : content, masterConfig.isBuild && (buildMap[name] = content), 
            onLoad(content);
        },
        load: function(name, req, onLoad, config) {
            if (config.isBuild && !config.inlineText) return void onLoad();
            masterConfig.isBuild = config.isBuild;
            var parsed = text.parseName(name), nonStripName = parsed.moduleName + (parsed.ext ? "." + parsed.ext : ""), url = req.toUrl(nonStripName), useXhr = masterConfig.useXhr || text.useXhr;
            return 0 === url.indexOf("empty:") ? void onLoad() : void (!hasLocation || useXhr(url, defaultProtocol, defaultHostName, defaultPort) ? text.get(url, function(content) {
                text.finishLoad(name, parsed.strip, content, onLoad);
            }, function(err) {
                onLoad.error && onLoad.error(err);
            }) : req([ nonStripName ], function(content) {
                text.finishLoad(parsed.moduleName + "." + parsed.ext, parsed.strip, content, onLoad);
            }));
        },
        write: function(pluginName, moduleName, write) {
            if (buildMap.hasOwnProperty(moduleName)) {
                var content = text.jsEscape(buildMap[moduleName]);
                write.asModule(pluginName + "!" + moduleName, "define(function () { return '" + content + "';});\n");
            }
        },
        writeFile: function(pluginName, moduleName, req, write, config) {
            var parsed = text.parseName(moduleName), extPart = parsed.ext ? "." + parsed.ext : "", nonStripName = parsed.moduleName + extPart, fileName = req.toUrl(parsed.moduleName + extPart) + ".js";
            text.load(nonStripName, req, function() {
                var textWrite = function(contents) {
                    return write(fileName, contents);
                };
                textWrite.asModule = function(moduleName, contents) {
                    return write.asModule(moduleName, fileName, contents);
                }, text.write(pluginName, nonStripName, textWrite, config);
            }, config);
        }
    }, "node" === masterConfig.env || !masterConfig.env && "undefined" != typeof process && process.versions && process.versions.node && !process.versions["node-webkit"] ? (fs = require.nodeRequire("fs"), 
    text.get = function(url, callback, errback) {
        try {
            var file = fs.readFileSync(url, "utf8");
            0 === file.indexOf("﻿") && (file = file.substring(1)), callback(file);
        } catch (e) {
            errback(e);
        }
    }) : "xhr" === masterConfig.env || !masterConfig.env && text.createXhr() ? text.get = function(url, callback, errback, headers) {
        var header, xhr = text.createXhr();
        if (xhr.open("GET", url, !0), headers) for (header in headers) headers.hasOwnProperty(header) && xhr.setRequestHeader(header.toLowerCase(), headers[header]);
        masterConfig.onXhr && masterConfig.onXhr(xhr, url), xhr.onreadystatechange = function() {
            var status, err;
            4 === xhr.readyState && (status = xhr.status, status > 399 && 600 > status ? (err = new Error(url + " HTTP status: " + status), 
            err.xhr = xhr, errback(err)) : callback(xhr.responseText), masterConfig.onXhrComplete && masterConfig.onXhrComplete(xhr, url));
        }, xhr.send(null);
    } : "rhino" === masterConfig.env || !masterConfig.env && "undefined" != typeof Packages && "undefined" != typeof java ? text.get = function(url, callback) {
        var stringBuffer, line, encoding = "utf-8", file = new java.io.File(url), lineSeparator = java.lang.System.getProperty("line.separator"), input = new java.io.BufferedReader(new java.io.InputStreamReader(new java.io.FileInputStream(file), encoding)), content = "";
        try {
            for (stringBuffer = new java.lang.StringBuffer(), line = input.readLine(), line && line.length() && 65279 === line.charAt(0) && (line = line.substring(1)), 
            null !== line && stringBuffer.append(line); null !== (line = input.readLine()); ) stringBuffer.append(lineSeparator), 
            stringBuffer.append(line);
            content = String(stringBuffer.toString());
        } finally {
            input.close();
        }
        callback(content);
    } : ("xpconnect" === masterConfig.env || !masterConfig.env && "undefined" != typeof Components && Components.classes && Components.interfaces) && (Cc = Components.classes, 
    Ci = Components.interfaces, Components.utils["import"]("resource://gre/modules/FileUtils.jsm"), 
    xpcIsWindows = "@mozilla.org/windows-registry-key;1" in Cc, text.get = function(url, callback) {
        var inStream, convertStream, fileObj, readData = {};
        xpcIsWindows && (url = url.replace(/\//g, "\\")), fileObj = new FileUtils.File(url);
        try {
            inStream = Cc["@mozilla.org/network/file-input-stream;1"].createInstance(Ci.nsIFileInputStream), 
            inStream.init(fileObj, 1, 0, !1), convertStream = Cc["@mozilla.org/intl/converter-input-stream;1"].createInstance(Ci.nsIConverterInputStream), 
            convertStream.init(inStream, "utf-8", inStream.available(), Ci.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER), 
            convertStream.readString(inStream.available(), readData), convertStream.close(), 
            inStream.close(), callback(readData.value);
        } catch (e) {
            throw new Error((fileObj && fileObj.path || "") + ": " + e);
        }
    }), text;
}), define("gens/std/actions", [], function() {
    "use strict";
    var actions = {
        click: function(value) {
            this.onclick = function(event) {
                event.preventDefault(), this[value](event);
            }.bind(this);
        }
    }, StdActionsGen = function() {
        gen.addGlobal(function(callback) {
            var i, item, match, action;
            for (i = 0; i < this.attributes.length; ++i) if (item = this.attributes.item(i), 
            match = item.nodeName.match(/^gen-action-([a-zA-Z0-9_]*)$/)) {
                if (action = match[1], !actions[action]) throw new Error("Undefined gen-action " + action);
                actions[action].call(this, item.nodeValue);
            }
            callback();
        });
    };
    return StdActionsGen;
}), define("gens/std/html", [], function() {
    "use strict";
    var StdHtmlGen = function() {
        gen.proto(window.HTMLElement, function(proto) {
            proto.setText = function(text) {
                this.innerHTML = text;
            }, proto.addChild = function(child) {
                this.appendChild(child);
            };
        });
    };
    return StdHtmlGen;
}), define("gens/std/mvc", [], function() {
    "use strict";
    var StdMvcGen = function() {
        require.config({
            paths: {
                txt: "gens/std/plugins/requirejs-text/text"
            }
        }), gen.addGlobal(function(callback) {
            var i, item, match, findDataAttributes = function() {
                for (this.model = this.model || {}, i = 0; i < this.attributes.length; ++i) item = this.attributes.item(i), 
                match = item.nodeName.match(/^gen-data-([a-zA-Z0-9_]*)$/), match && (this.model[match[1]] = item.nodeValue);
                callback();
            }.bind(this);
            this.getAttribute("model") ? require([ this.getAttribute("model") + ".js" ], function(model) {
                this.model = model, findDataAttributes();
            }.bind(this)) : findDataAttributes();
        }), gen.addGlobal(function(callback) {
            var view = this.getAttribute("gen-view");
            view && require([ "gens/std/plugins/requirejs-text/text!" + view ], function(viewContent) {
                this.innerHTML = view.indexOf(".hbs") === view.length - ".hbs".length ? window.Handlebars.compile(viewContent)(this.model || {}) : viewContent, 
                gen.parseDom(this), callback();
            }.bind(this));
        }), gen.addGlobal(function(callback) {
            callback();
        });
    };
    return StdMvcGen;
}), define("gens/std", [ "gens/std/html", "gens/std/mvc", "gens/std/actions" ], function() {
    "use strict";
    return arguments;
}), function() {
    "use strict";
    function onLoad() {
        gen.parseDom(document);
    }
    var gen = {
        full: "{{version.full}}",
        major: "{{version.major}}",
        minor: "{{version.minor}}",
        dot: "{{version.dot}}",
        codename: "{{version.codename}}"
    }, globalGens = [], onReadyCallbacks = {}, each = function(arr, f) {
        var i;
        for (i = 0; i < arr.length; ++i) f(arr[i], i);
    };
    gen.init = function($gen, callback) {
        var wait = globalGens.length, onReady = function() {
            $gen.$ready = !0, callback(), onReadyCallbacks[$gen] && each(onReadyCallbacks[$gen], function(callback) {
                callback();
            });
        }, onInit = function() {
            0 === --wait && onReady();
        };
        each(globalGens, function(initializer) {
            initializer.call($gen, onInit);
        }), 0 === wait && onReady();
    }, gen.run = function(f, $gen) {
        "function" == typeof f ? f.call($gen) : gen.load($gen, f);
    }, gen.onReady = function($gen, callback) {
        $gen.$ready ? callback() : (onReadyCallbacks[$gen] = onReadyCallbacks[$gen] || [], 
        onReadyCallbacks[$gen].push(callback));
    }, gen.addGlobal = function(f) {
        -1 === globalGens.indexOf(f) && globalGens.push(f);
    }, gen.parseDom = function(domElement) {
        each(domElement.getElementsByTagName("*"), function(node) {
            node.getAttribute && node.getAttribute("gen") && each(node.getAttribute("gen").replace(/\s/g, "").split(","), function(name) {
                gen.load(node, name);
            });
        });
    }, gen.proto = function(target, extension) {
        var key, prototype = target.prototype || Object.getPrototypeOf(target);
        if ("function" == typeof extension) extension(prototype); else for (key in extension) extension.hasOwnProperty(key) && (prototype[key] = extension[key]);
    }, gen.load = function($gen, name) {
        require([ "gens/" + name ], function(f) {
            gen.init($gen, function() {
                "function" == typeof f ? f.call($gen) : each(f, function(f) {
                    gen.run(f, $gen);
                });
            });
        });
    }, window.gen = gen, window.onload = onLoad;
}();