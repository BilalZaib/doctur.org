'use strict';

var mode = 'signup';
var inputs = Array.from(document.querySelectorAll('input'));
var textsSwitcher = Array.from(document.querySelectorAll('.text__switcher'));
var flex = document.querySelector('.flex');
var passcheck = document.querySelector('.password-check');
var resetPassword = document.querySelector('#rpassword');
var inputFocus = document.querySelector('#fname');
var signinBtn = document.querySelector('#signin__btn');
inputFocus.focus();

signinBtn.addEventListener('click', function (){
  mode = 'signin';
  flex.style.height = '0';
  flex.style.opacity = '0';
  textsSwitcher.forEach(function (textSwitcher) {
    var textSwitcherContent = textSwitcher.dataset.switch;
        textSwitcher.textContent = textSwitcherContent;
        resetPassword.style.display = 'inline';
  });
});
inputs.forEach(function (input) {
  var id = input.id;
  input.addEventListener('focus', function () {
    if (id === 'password' && mode === 'signup') {
      passcheck.style.height = '58px';
      passcheck.style.opacity = '1';
    }
  });
  input.addEventListener('blur', function () {
    if (id === 'password') {
      passcheck.style.height = '0';
      passcheck.style.opacity = '0';
    }
  });
});
