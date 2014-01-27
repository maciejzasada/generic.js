define('gens/std/mvc', [], function () {
    'use strict';

    var StdMvcGen = function () {

        require.config({
            paths: {
                txt: 'gens/std/plugins/requirejs-text/text'
            }
        });

        gen.addInitializer(function loadModel(callback) {
            var i,
                item,
                match,
                findDataAttributes = function () {
                    this.model = this.model || {};
                    for (i = 0; i < this.attributes.length; ++i) {
                        item = this.attributes.item(i);
                        match = item.nodeName.match(/^gen-data-([a-zA-Z0-9_]*)$/);
                        if (match) {
                            this.model[match[1]] = item.nodeValue;
                        }
                    }
                    callback();
                }.bind(this);

            if (this.getAttribute('model')) {
                require([this.getAttribute('model') + '.js'], function (model) {
                    this.model = model;
                    findDataAttributes();
                }.bind(this));
            } else {
                findDataAttributes();
            }
        });

        gen.addInitializer(function loadView(callback) {
            var view = this.getAttribute('gen-view');
            if (view) {
                require(['gens/std/plugins/requirejs-text/text!' + view], function (viewContent) {
                    if (view.indexOf('.hbs') === view.length - '.hbs'.length) {
                        this.innerHTML = window.Handlebars.compile(viewContent)(this.model || {});
                    } else {
                        this.innerHTML = viewContent;
                    }
                    gen.parseDom(this);
                    callback();
                }.bind(this));
            }
        });

        gen.addInitializer(function loadController(callback) {
            callback();
        });

    };

    return StdMvcGen;

});
