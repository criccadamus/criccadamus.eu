function copyToClipboard(string) {
    navigator.clipboard.writeText(string).then(function() {
      console.log('Copied to clipboard');
      // Get the button element with the discord class
      const button = document.querySelector('.discord');
      // Update the title attribute to display the message
      button.title = 'Copied to clipboard';
      // Update the content of the button
      button.innerHTML = '<img src="resources/icons/discord.png" width="50" height="50" class="button-icon" style="filter: invert(1);"> Copied user to clipboard!';
      // Toggle the clicked class
      button.classList.toggle('clicked');
      // Reset the title attribute, content, and remove the clicked class after 3 seconds
      setTimeout(function() {
        button.title = '';
        button.innerHTML = '<img src="resources/icons/discord.png" width="50" height="50" class="button-icon"> Discord';
        button.classList.toggle('clicked');
      }, 3000);
    }, function(err) {
      console.error('Could not copy to clipboard: ', err);
    });
  }