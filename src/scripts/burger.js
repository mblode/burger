(function() {
  'use strict';

  var body = document.body;
  var burgerContain = document.getElementsByClassName('b-container')[0];
  var burgerNav = document.getElementsByClassName('b-nav')[0];
  var burgerBrand = document.getElementsByClassName('b-brand')[0];

  burgerContain.addEventListener('click', function toggleClasses() {
    [body, burgerContain, burgerNav, burgerBrand].forEach(function (el) {
      el.classList.toggle('open');
    });
  }, false);
})();
