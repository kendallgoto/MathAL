function save_options() {
  var email = document.getElementById('email').value;
  var password = document.getElementById('password').value;
  var uid = document.getElementById('uid').value;
  chrome.storage.local.set({
    user: email,
    pass: password,
	uid: uid
  }, function() {
		chrome.extension.getBackgroundPage().window.location.reload()
	  	window.close();
  });
}
function restore_options() {
  chrome.storage.local.get({
    user: '',
    pass: '',
	uid: '',
  }, function(items) {
	  document.getElementById('email').value = items.user;
	  document.getElementById('password').value = items.pass;
 		document.getElementById('uid').value = items.uid;
		//https://stackoverflow.com/questions/30541436/focus-on-the-first-empty-input
		var input = document.getElementsByTagName('input');
		for (var i = 0, n = input.length; i < n; i = i + 1) {
		  if (!input[i].value) {
		    input[i].focus();
		    break;
		  }
		}		
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
