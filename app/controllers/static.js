// ======================================================
/* configure routes for every static request in our API
*/
// ======================================================
var path = require('path');
var router = require('express').Router();

//router.use(require('express').static(__dirname + '../../public/view'));

// application -------------------------------------------------------------
router.get('/', function(req, res) {
	console.log('passando no static.js' + __dirname);
    // load the single view file (angular will handle the page changes on the front-end)
    res.sendFile(path.join(__dirname, '../../public', 'app.html'));
});

// rewrite virtual urls to angular app to enable refreshing of internal pages
router.get('*', function (req, res, next) {
    //res.sendFile(path.resolve('app/index.html'));
    res.sendFile(path.join(__dirname, '../../public', 'app.html'));
});

router.get('/home', function(req, res) {
	console.log('passando no static.js' + __dirname);
    // load the single view file (angular will handle the page changes on the front-end)
    res.sendFile(path.join(__dirname, '../../public', 'home.html'));
});

module.exports = router;