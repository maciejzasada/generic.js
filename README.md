GenericJS [![Build Status](https://travis-ci.org/maciejzasada/generic.js.png?branch=master)](https://travis-ci.org/maciejzasada/generic.js)
=========

GenericJS is a universal front end framework inspired by AngularJS. The idea, however, has been simplified to absolute minimum, which has resulted in incredible extensibility and power, while limiting the framework's code complexity and size.

Thanks to GenericJS it is possible to provide Angular's functionality (or any other) with just a few simple extensions (gens)!  

Development has never been easier and more productive.


Installation
---------
```bower install generic.js```


The idea
---------
The idea behind GenericJS is very simple - it lets you run a *gen* (plain JavaScript function) on any object (DOMElement, or another JS object). That's it. Very simple, but just see how powerful it can be!

####gens/mygen.js
```javascript
define(function () {
  return function () {
    this.innerHTML = 'GenericJS!';
  };
});
```

####index.html
```html
<div gen='mygen'></div>
```

####Renders
```html
<div gen='mygen'>GenericJS!</div>
```


Examples
---------

###Implemending Angular's ng-click
In this example, we'll see how easy it is to implement Angular's ng-click directive using GenericJS.
We'll define an 'actions' *gen* that will define the directive and a 'controller' *gen* that will handle that action.

####gens/actions.js
```javascript
define('gens/std/actions', [], function () {
  return function () {
    // Add a global gen.
    gen.addGlobal(function initActions(callback) {
      var i, item, match, action;
      // Loop through the element's attributes.
      for (i = 0; i < this.attributes.length; ++i) {
        item = this.attributes.item(i);
        // Search for an attribute matching the gen-action pattern.
        match = item.nodeName.match(/^gen-action-([a-zA-Z0-9_]*)$/);
        if (match) {
          action = match[1];
          if (action === 'click') {
            // If the action is 'click', add the click listener.
            this.onclick = function (event) {
              event.preventDefault();
              // Call the listener function on the current object.
              this[item.nodeValue](event);
            }.bind(this);
          }
        }
      }
      callback();
    });
  };
});

```


####gens/controller.js
```javascript
define(function () {
  return function () {
    this.onClick = function (event) {
      alert('I was clicked!');
    };
  };
});
```


####index.html
```html
<html gen='actions'>
  <head>
    <script src="build/generic.js"></script>
  </head>
  <body>
    <div gen='controller' gen-action-click='onClick'></div>
  </body>
</html>
```


####Result
Using this simple piece of code we've defined a global, Angular-like click directive for our application. Not using Angular at all, just using the GenericJS foundation.


Defining a *gen*
---------
GenericJS uses RequireJS pattern to define *gens*.

```javascript
define(function () {
  var MyGen = function () {
  };
  return MyGen;
});
```


Global *gens*
---------
Global *gens* are executed each time another gen is. They allow defining global functionality for other gens.
```javascript
define(function () {
  var MyGen = function () {
    gen.addGlobal(function (callback) {
      // Global gen
      callback();
    });
  };
  return MyGen;
});
```


Creating *gen* libraries
---------
With GenericJS, it is very easy to define libraries. Simply, return an array of *gens*! GenericJS includes an "std" library by default.

####gens/mylib.js

```javascript
define('gens/mylib', [
  'gens/mylib/gen1.js',
  'gens/mylib/gen2.js',
  'gens/mylib/gen3.js'
]function () {
  return arguments;
});
```


Running a *gen*
---------

### On an HTML element

```html
<div gen='mygen'></div>
```

### On an JS object

```javascript
var obj = {};
gen.run('mygen', obj);
```


Using the *std* library
---------
As part of the GenericJS project, the *std* library is being developed. The *std* library is a collection of global, commonly used *gens*.
You can include it in your project as follows:
```html
<html gen='std'>
```

You can also use its gens selectively, e.g.
```html
<html gen='std/actions, std/mvc'>
```


Building GenericJS
---------
Just run:

```grunt build```


[![Analytics](https://ga-beacon.appspot.com/UA-47509985-1/generic.js/README.md?pixel)](https://github.com/igrigorik/ga-beacon)

