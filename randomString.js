'use strict';

module.exports.generate = function(textLength) {
  textLength = textLength || 10;
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for(var i = 0; i < textLength; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
};