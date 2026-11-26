var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// header: transparent over the red hero, white once past it
(function(){
  var header = document.getElementById('site-header');
  var hero = document.getElementById('top');
  if(!header || !hero) return;
  function update(){
    header.classList.toggle('scrolled', hero.getBoundingClientRect().bottom <= header.offsetHeight);
  }
  window.addEventListener('scroll', update, {passive:true});
  window.addEventListener('resize', update);
  update();
})();

// active nav link on scroll (also sets aria-current)
(function(){
  var links = Array.prototype.slice.call(document.querySelectorAll('.site-nav a'));
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(!entry.isIntersecting) return;
      var id = entry.target.id;
      links.forEach(function(a){
        var on = a.getAttribute('href') === '#' + id;
        a.classList.toggle('active', on);
        if(on){ a.setAttribute('aria-current', 'true'); }
        else { a.removeAttribute('aria-current'); }
      });
    });
  }, {rootMargin:'-45% 0px -50% 0px'});
  ['top','project','career','toolbox','contact'].forEach(function(id){
    var s = document.getElementById(id); if(s) io.observe(s);
  });
})();

// screenshot reel: duplicate the set so the loop is seamless
(function(){
  var track = document.getElementById('reel-track');
  if(!track || REDUCED) return;
  Array.prototype.slice.call(track.children).forEach(function(img){
    track.appendChild(img.cloneNode(true));
  });
  track.classList.add('running');
})();

// trailer lightbox: play in-page, flip through with prev/next
(function(){
  var tiles = Array.prototype.slice.call(document.querySelectorAll('#project-grid .work-item'));
  if(!tiles.length) return;

  var lightbox = document.getElementById('lightbox');
  var iframe = document.getElementById('lightbox-iframe');
  var titleEl = document.getElementById('lightbox-title');
  var indexEl = document.getElementById('lightbox-index');
  var openLink = document.getElementById('lb-open');
  var prevBtn = document.getElementById('lb-prev');
  var nextBtn = document.getElementById('lb-next');
  var current = 0;
  var lastFocused = null;

  function show(i){
    current = (i + tiles.length) % tiles.length;
    var tile = tiles[current];
    var id = tile.getAttribute('data-video');
    iframe.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0';
    titleEl.textContent = tile.getAttribute('data-title');
    openLink.href = 'https://www.youtube.com/watch?v=' + id;
    indexEl.textContent = (current + 1) + ' of ' + tiles.length;
  }

  function focusableEls(){
    return Array.prototype.slice.call(
      lightbox.querySelectorAll('button:not(.lightbox-backdrop), a[href]')
    ).filter(function(el){ return el.offsetParent !== null; });
  }

  function open(i){
    lastFocused = document.activeElement;
    show(i);
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    document.getElementById('lb-close').focus();
  }

  function close(){
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    iframe.src = '';
    document.body.style.overflow = '';
    if(lastFocused && lastFocused.focus) lastFocused.focus();
  }

  tiles.forEach(function(tile, i){
    tile.addEventListener('click', function(){ open(i); });
  });
  document.querySelectorAll('[data-open]').forEach(function(btn){
    btn.addEventListener('click', function(){ open(Number(btn.getAttribute('data-open'))); });
  });
  document.querySelectorAll('[data-lb-close]').forEach(function(el){
    el.addEventListener('click', close);
  });
  prevBtn.addEventListener('click', function(){ show(current - 1); });
  nextBtn.addEventListener('click', function(){ show(current + 1); });

  document.addEventListener('keydown', function(e){
    if(!lightbox.classList.contains('open')) return;
    if(e.key === 'Escape'){ close(); return; }
    if(e.key === 'ArrowLeft'){ show(current - 1); return; }
    if(e.key === 'ArrowRight'){ show(current + 1); return; }
    if(e.key === 'Tab'){
      var f = focusableEls();
      if(!f.length) return;
      if(e.shiftKey && document.activeElement === f[0]){ e.preventDefault(); f[f.length - 1].focus(); }
      else if(!e.shiftKey && document.activeElement === f[f.length - 1]){ e.preventDefault(); f[0].focus(); }
    }
  });
})();
