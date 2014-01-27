define('gens/std/actions', [], function () {
    'use strict';

    var actions = {

            'click': function (value) {
                this.onclick = function (event) {
                    event.preventDefault();
                    this[value](event);
                }.bind(this);
            }

        },

        StdActionsGen = function () {
            gen.addGlobal(function initActions(callback) {
                var i,
                    item,
                    match,
                    action;

                for (i = 0; i < this.attributes.length; ++i) {
                    item = this.attributes.item(i);
                    match = item.nodeName.match(/^gen-action-([a-zA-Z0-9_]*)$/);
                    if (match) {
                        action = match[1];
                        if (actions[action]) {
                            actions[action].call(this, item.nodeValue);
                        } else {
                            throw new Error('Undefined gen-action ' + action);
                        }
                    }
                }

                callback();
            });

        };

    return StdActionsGen;

});
