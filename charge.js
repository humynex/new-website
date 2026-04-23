/* ── HUMYNEX Charging Intro ── */
(function () {
  const screen   = document.getElementById('charge-screen');
  const logoWrap = document.getElementById('charge-logo-wrap');
  const barWrap  = document.getElementById('energy-bar-wrap');
  const barInner = document.getElementById('energy-bar-inner');
  const barTip   = document.getElementById('energy-bar-tip');
  const barPct   = document.getElementById('energy-pct');
  const flash    = document.getElementById('charge-flash');

  // Disable scroll until done
  document.body.style.overflow = 'hidden';

  let pct = 0;
  let animId;
  let startTime;
  const DURATION = 2200; // ms for bar to fill

  // Step 1: logo fades in after 300ms
  setTimeout(() => {
    logoWrap.classList.add('show');
    barWrap.classList.add('show');
  }, 300);

  // Step 2: bar fills up
  setTimeout(() => {
    startTime = performance.now();
    function tick(now) {
      const elapsed = now - startTime;
      pct = Math.min(100, (elapsed / DURATION) * 100);

      // Flicker effect near end
      let displayPct = pct;
      if (pct > 88) {
        displayPct = pct + (Math.random() - 0.5) * 4;
        displayPct = Math.min(100, Math.max(pct - 2, displayPct));
      }

      barInner.style.height = displayPct + '%';
      barTip.style.bottom = displayPct + '%';
      barPct.textContent = Math.floor(displayPct) + '%';

      // Color shift as it fills
      if (pct < 50) {
        barInner.style.background = 'linear-gradient(to top, #7b2fff, #00b4d8)';
      } else if (pct < 85) {
        barInner.style.background = 'linear-gradient(to top, #7b2fff, #00b4d8, #00d4ff)';
      } else {
        barInner.style.background = 'linear-gradient(to top, #7b2fff, #00b4d8, #ffffff)';
        barInner.style.boxShadow = '0 0 20px #fff, 0 0 40px #00b4d8';
      }

      if (pct < 100) {
        animId = requestAnimationFrame(tick);
      } else {
        barPct.textContent = '100%';
        setTimeout(doFlash, 180);
      }
    }
    animId = requestAnimationFrame(tick);
  }, 700);

  function doFlash() {
    // Bright flash
    flash.style.opacity = '1';
    flash.style.transition = 'opacity 0.12s';

    setTimeout(() => {
      // Fade flash out
      flash.style.opacity = '0';
      flash.style.transition = 'opacity 0.9s';

      // Fade charge screen out
      screen.style.transition = 'opacity 0.7s';
      screen.style.opacity = '0';

      setTimeout(() => {
        screen.style.display = 'none';
        document.body.style.overflow = '';
        // Signal main.js that intro is done
        window._chargeComplete = true;
        window.dispatchEvent(new Event('chargeComplete'));
      }, 700);
    }, 140);
  }
})();
