const button = document.querySelector('.button');

button.addEventListener('touchstart', function() {
  button.classList.add('is-touched');
});
