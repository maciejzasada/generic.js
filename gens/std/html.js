define('gens/std/html', [], function () {
    'use strict';

    var StdHtmlGen = function () {

        gen.proto(window.HTMLElement, function (proto) {

            proto.setText = function (text) {
                this.innerHTML = text;
            };

            proto.addChild = function (child) {
                this.appendChild(child);
            };

        });

    };

    return StdHtmlGen;

});
