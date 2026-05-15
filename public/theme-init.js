(function(){
  try {
    var t = localStorage.getItem('theme');
    var d = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (t ? t === 'dark' : d) document.documentElement.classList.add('dark');
  } catch (e) { /* ignore */ }
})();
