// boot sequence
(function(){
  var boot = document.getElementById('boot');
  var line = document.getElementById('boot-line');
  var steps = ['Loading scene', 'Compiling scripts', 'Importing assets', 'Ready'];
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduced){ boot.classList.add('hide'); }
  else {
    var i = 0;
    var iv = setInterval(function(){
      i++;
      if(i < steps.length){
        line.innerHTML = steps[i] + '<span class="cursor"></span>';
      } else {
        clearInterval(iv);
        boot.classList.add('hide');
      }
    }, 420);
  }
})();

// role rotator
(function(){
  var roles = ['Game Developer', 'Programmer', 'Unity Developer', 'Tools & Pipeline Engineer'];
  var el = document.getElementById('role-text');
  var idx = 0;
  setInterval(function(){
    idx = (idx + 1) % roles.length;
    el.textContent = roles[idx];
  }, 2600);
})();

// active tab on scroll (also sets aria-current for assistive tech)
(function(){
  var sections = ['scene','inspector','profiler','project','console','contact'].map(function(id){return document.getElementById(id);});
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.editor-tabs a'));
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        var id = entry.target.id;
        tabs.forEach(function(t){
          var isActive = t.getAttribute('href') === '#'+id;
          t.classList.toggle('active', isActive);
          if(isActive){ t.setAttribute('aria-current', 'true'); }
          else { t.removeAttribute('aria-current'); }
        });
      }
    });
  }, {rootMargin:'-45% 0px -50% 0px'});
  sections.forEach(function(s){ if(s) io.observe(s); });
})();

// skill bars: fill from 0 up to their real value when scrolled into view
// (bars already show the correct width via inline style if JS never runs)
(function(){
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduced) return;
  var skillIo = new IntersectionObserver(function(entries, obs){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        var fill = entry.target.querySelector('.skill-fill');
        var target = fill.style.width;
        fill.style.width = '0%';
        requestAnimationFrame(function(){
          requestAnimationFrame(function(){ fill.style.width = target; });
        });
        obs.unobserve(entry.target);
      }
    });
  }, {threshold:.4});
  document.querySelectorAll('.skill-row').forEach(function(el){ skillIo.observe(el); });
})();

// project lightbox: play trailers in-page, flip through with prev/next
(function(){
  var tiles = Array.prototype.slice.call(document.querySelectorAll('#project-grid .asset-tile'));
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

  function embedSrc(id){
    return 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0';
  }

  function show(i){
    current = (i + tiles.length) % tiles.length;
    var tile = tiles[current];
    var id = tile.getAttribute('data-video');
    var title = tile.getAttribute('data-title');
    iframe.src = embedSrc(id);
    titleEl.textContent = title;
    openLink.href = 'https://www.youtube.com/watch?v=' + id;
    indexEl.textContent = String(current + 1).padStart(2, '0') + ' / ' + String(tiles.length).padStart(2, '0');
  }

  function focusableEls(){
    return Array.prototype.slice.call(
      lightbox.querySelectorAll('button, a[href]')
    ).filter(function(el){ return el.offsetParent !== null; });
  }

  function open(i){
    lastFocused = document.activeElement;
    show(i);
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    var closeBtn = document.getElementById('lb-close');
    if(closeBtn) closeBtn.focus();
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
      var focusable = focusableEls();
      if(!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if(e.shiftKey && document.activeElement === first){
        e.preventDefault();
        last.focus();
      } else if(!e.shiftKey && document.activeElement === last){
        e.preventDefault();
        first.focus();
      }
    }
  });
})();

// sparkline bars
(function(){
  document.querySelectorAll('.spark').forEach(function(spark){
    var vals = spark.getAttribute('data-bars').split(',').map(Number);
    var max = Math.max.apply(null, vals);
    vals.forEach(function(v){
      var bar = document.createElement('i');
      bar.style.height = (v/max*100) + '%';
      spark.appendChild(bar);
    });
  });
})();
