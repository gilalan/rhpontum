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

module.exports = router;