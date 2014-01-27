(function () {
    'use strict';

    var gen = {
            full: '{{version.full}}',
            major: '{{version.major}}',
            minor: '{{version.minor}}',
            dot: '{{version.dot}}',
            codename: '{{version.codename}}'
        },
        globalGens = [],
        onReadyCallbacks = {},
        each = function (arr, f) {
            var i;
            for (i = 0; i < arr.length; ++i) {
                f(arr[i], i);
            }
        };

    /**
     * Initializes simple gen object.
     * @param $gen
     */
    gen.init = function ($gen, callback) {
        var wait = globalGens.length,
            onReady = function () {
                $gen.$ready = true;
                callback();

                if (onReadyCallbacks[$gen]) {
                    each(onReadyCallbacks[$gen], function (callback) {
                        callback();
                    });
                }
            },
            onInit = function () {
                if (--wait === 0) {
                    onReady();
                }
            };

        each(globalGens, function (initializer) {
            initializer.call($gen, onInit);
        });

        if (wait === 0) {
            onReady();
        }
    };

    gen.run = function (f, $gen) {
        if (typeof f === 'function') {
            f.call($gen);
        } else {
            gen.load($gen, f);
        }
    };

    gen.onReady = function ($gen, callback) {
        if ($gen.$ready) {
            callback();
        } else {
            onReadyCallbacks[$gen] = onReadyCallbacks[$gen] || [];
            onReadyCallbacks[$gen].push(callback);
        }
    };

    /**
     * Adds a global gen initializer.
     * @param f
     */
    gen.addGlobal = function (f) {
        if (globalGens.indexOf(f) === -1) {
            globalGens.push(f);
        }
    };

    /**
     * Parses DOM looking for nested Gens.
     * @param domElement
     */
    gen.parseDom = function (domElement) {
        each(domElement.getElementsByTagName('*'), function (node) {
            if (node.getAttribute && node.getAttribute('gen')) {
                each(node.getAttribute('gen').replace(/\s/g, '').split(','), function (name) {
                    gen.load(node, name);
                });
            }
        });
    };

    /**
     * Easy prototype extension.
     * @param target
     * @param extension
     */
    gen.proto = function (target, extension) {
        var prototype = target.prototype || Object.getPrototypeOf(target),
            key;

        if (typeof extension === 'function') {
            extension(prototype);
        } else {
            for (key in extension) {
                if (extension.hasOwnProperty(key)) {
                    prototype[key] = extension[key];
                }
            }
        }
    };

    gen.load = function ($gen, name) {
        require(['gens/' + name], function (f) {
            gen.init($gen, function () {
                if (typeof f === 'function') {
                    f.call($gen);
                } else {
                    each(f, function (f) {
                        gen.run(f, $gen);
                    });
                }
            });
        });
    };

    function onLoad() {
        gen.parseDom(document);
    }

    window.gen = gen;
    window.onload = onLoad;

}());
