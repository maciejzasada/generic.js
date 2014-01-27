GenericJS [![Build Status](https://travis-ci.org/maciejzasada/generic.js.png?branch=master)](https://travis-ci.org/maciejzasada/generic.js)
=========

GenericJS is a universal front end framework inspired by AngularJS.  
The idea, however, has been simplified to absolute minimum, which has resulted in incredible extensibility and power.

Thanks to GenericJS it is possible to provide Angular's functionality with just a few simple extensions (gens)!  

Development has never been easier and more productive.


Installation
---------
```bower install generic.js```


The idea
---------
The idea behind GenericJS is very simple - it lets you run a *gen* (plain JavaScript function) on any object (DOM Element, or another JS object). That's it. Very simple, but just see how powerful that


Example
---------
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

####Output
GenericJS!


####More
To see the full power of the simple idea behind GenericJS see "More examples" below.


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


Creating *gen* libraries
---------
With GenericJS, it is very easy to define libraries. Simply, return an array of *gens*! GenericJS includes an "std" library by default.

####gens/mylib.js

```javascript
define([
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


More examples
---------


Building GenericJS
---------
Just run:

```grunt build```


[![Analytics](https://ga-beacon.appspot.com/UA-47509985-1/generic.js/README.md?pixel)](https://github.com/igrigorik/ga-beacon)

