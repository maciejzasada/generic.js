var express = require('express');

var app = express();
app.configure(function(){
    app.use('/', express.static(__dirname + '/demo'));
    app.use('/build', express.static(__dirname + '/tmp/build'));
    app.use(express.errorHandler());
});

console.log('server running on port ' + (process.env.PORT || 3000));
app.listen(process.env.PORT || 3000, process.env.IP || '0.0.0.0');
