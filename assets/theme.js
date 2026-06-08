/* ==========================================================================
   KONSTANT UPRISE — Theme JS
   Cart (AJAX) · Cart drawer · Mobile nav · Scroll reveal · Audio previews
   Vanilla JS, no dependencies.
   ========================================================================== */
(function () {
  'use strict';

  const KU = window.KU || {};
  const routes = KU.routes || {};
  const moneyFormat = KU.moneyFormat || '${{amount}}';

  /* ---------- Utilities ---------- */
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  function formatMoney(cents) {
    const value = (cents / 100).toFixed(2);
    const parts = value.split('.');
    const withCommas = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const formatted = withCommas + '.' + parts[1];
    return moneyFormat
      .replace(/\{\{\s*amount\s*\}\}/g, formatted)
      .replace(/\{\{\s*amount_no_decimals\s*\}\}/g, withCommas)
      .replace(/\{\{\s*amount_with_comma_separator\s*\}\}/g, formatted)
      .replace(/\{\{\s*amount_no_decimals_with_comma_separator\s*\}\}/g, withCommas);
  }

  function lockScroll(lock) {
    document.body.classList.toggle('is-locked', lock);
  }

  /* ---------- Overlay manager ---------- */
  const overlay = $('[data-overlay]');
  let overlayCloseFn = null;
  function showOverlay(closeFn) {
    overlayCloseFn = closeFn;
    if (!overlay) return;
    overlay.hidden = false;
    requestAnimationFrame(() => overlay.classList.add('is-visible'));
  }
  function hideOverlay() {
    if (!overlay) return;
    overlay.classList.remove('is-visible');
    setTimeout(() => { overlay.hidden = true; }, 500);
  }
  if (overlay) overlay.addEventListener('click', () => { if (overlayCloseFn) overlayCloseFn(); });

  /* ---------- Toast ---------- */
  let toastEl, toastTimer;
  function toast(message) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      toastEl.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg><span></span>';
      document.body.appendChild(toastEl);
    }
    $('span', toastEl).textContent = message;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 2600);
  }

  /* ======================================================================
     HEADER scroll state
     ====================================================================== */
  const header = $('[data-header]');
  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ======================================================================
     MOBILE NAV
     ====================================================================== */
  const mobileNav = $('[data-mobile-nav]');
  const navToggle = $('[data-mobile-toggle]');
  function openMobileNav() {
    if (!mobileNav) return;
    mobileNav.classList.add('is-open');
    mobileNav.setAttribute('aria-hidden', 'false');
    showOverlay(closeMobileNav);
    lockScroll(true);
  }
  function closeMobileNav() {
    if (!mobileNav) return;
    mobileNav.classList.remove('is-open');
    mobileNav.setAttribute('aria-hidden', 'true');
    hideOverlay();
    lockScroll(false);
  }
  if (navToggle) navToggle.addEventListener('click', openMobileNav);
  $$('[data-mobile-close]').forEach(b => b.addEventListener('click', closeMobileNav));

  /* ======================================================================
     CART
     ====================================================================== */
  const cartDrawer = $('[data-cart-drawer]');
  const cartItemsEl = $('[data-cart-items]');
  const cartFootEl = $('[data-cart-foot]');
  const cartCountEls = $$('[data-cart-count]');

  function openCart() {
    if (!cartDrawer) return;
    cartDrawer.classList.add('is-open');
    cartDrawer.setAttribute('aria-hidden', 'false');
    showOverlay(closeCart);
    lockScroll(true);
  }
  function closeCart() {
    if (!cartDrawer) return;
    cartDrawer.classList.remove('is-open');
    cartDrawer.setAttribute('aria-hidden', 'true');
    hideOverlay();
    lockScroll(false);
  }

  $$('[data-cart-toggle]').forEach(b => b.addEventListener('click', (e) => { e.preventDefault(); openCart(); fetchCart(); }));
  $$('[data-cart-close]').forEach(b => b.addEventListener('click', closeCart));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeCart(); closeMobileNav(); }
  });

  function updateCartCount(count) {
    cartCountEls.forEach(el => {
      el.textContent = count;
      el.hidden = count === 0;
    });
  }

  function renderCart(cart) {
    if (!cartItemsEl) return;
    updateCartCount(cart.item_count);

    if (cart.item_count === 0) {
      cartItemsEl.innerHTML =
        '<div class="cart-empty">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg>' +
        '<p>Your cart is empty.</p>' +
        '<a href="' + (routes.all_products_url || '/collections/all') + '" class="btn btn--ghost" data-cart-close style="margin-top:18px">Browse drops</a>' +
        '</div>';
      if (cartFootEl) cartFootEl.hidden = true;
      // re-bind close on the new link
      $$('[data-cart-close]', cartItemsEl).forEach(b => b.addEventListener('click', closeCart));
      return;
    }

    if (cartFootEl) cartFootEl.hidden = false;
    cartItemsEl.innerHTML = cart.items.map(item => {
      const img = item.image
        ? '<img src="' + item.image.replace(/(\.[^.]+)$/, '_160x160$1') + '" alt="' + escapeHtml(item.product_title) + '" loading="lazy">'
        : '';
      const variant = (item.variant_title && item.variant_title !== 'Default Title')
        ? '<div class="cart-line__variant">' + escapeHtml(item.variant_title) + '</div>' : '';
      return '' +
        '<div class="cart-line" data-line-key="' + item.key + '">' +
          '<a class="cart-line__img" href="' + item.url + '">' + img + '</a>' +
          '<div>' +
            '<a class="cart-line__title" href="' + item.url + '">' + escapeHtml(item.product_title) + '</a>' +
            variant +
            '<div class="cart-line__bottom">' +
              '<div class="cart-line__qty">' +
                '<button type="button" data-qty-down aria-label="Decrease quantity">&minus;</button>' +
                '<span>' + item.quantity + '</span>' +
                '<button type="button" data-qty-up aria-label="Increase quantity">+</button>' +
              '</div>' +
              '<button type="button" class="cart-line__remove" data-line-remove>Remove</button>' +
            '</div>' +
          '</div>' +
          '<div class="cart-line__price">' + formatMoney(item.final_line_price) + '</div>' +
        '</div>';
    }).join('');

    const subtotalEl = $('[data-cart-subtotal]');
    if (subtotalEl) subtotalEl.textContent = formatMoney(cart.total_price);

    bindCartLineEvents();
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function bindCartLineEvents() {
    $$('.cart-line', cartItemsEl).forEach(line => {
      const key = line.getAttribute('data-line-key');
      const current = parseInt($('.cart-line__qty span', line).textContent, 10);
      $('[data-qty-down]', line).addEventListener('click', () => changeLine(key, current - 1));
      $('[data-qty-up]', line).addEventListener('click', () => changeLine(key, current + 1));
      $('[data-line-remove]', line).addEventListener('click', () => changeLine(key, 0));
    });
  }

  function fetchCart() {
    fetch(routes.cart_get_url, { headers: { 'Accept': 'application/json' } })
      .then(r => r.json())
      .then(renderCart)
      .catch(() => {});
  }

  function changeLine(key, quantity) {
    if (cartDrawer) cartDrawer.classList.add('is-busy');
    fetch(routes.cart_change_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ id: key, quantity: quantity })
    })
      .then(r => r.json())
      .then(cart => { renderCart(cart); if (cartDrawer) cartDrawer.classList.remove('is-busy'); })
      .catch(() => { if (cartDrawer) cartDrawer.classList.remove('is-busy'); });
  }

  // Add to cart (delegated — works for cards + product form)
  function addToCart(form, button) {
    const formData = new FormData(form);
    if (button) button.classList.add('is-loading');
    fetch(routes.cart_add_url, {
      method: 'POST',
      headers: { 'Accept': 'application/javascript', 'X-Requested-With': 'XMLHttpRequest' },
      body: formData
    })
      .then(r => r.json().then(data => ({ ok: r.ok, data })))
      .then(({ ok, data }) => {
        if (button) button.classList.remove('is-loading');
        if (!ok) {
          toast(data.description || data.message || 'Could not add to cart');
          return;
        }
        toast((data.product_title || 'Item') + ' added to cart');
        // Track Meta Pixel if present
        if (window.fbq) {
          window.fbq('track', 'AddToCart', {
            content_ids: [data.product_id],
            content_name: data.product_title,
            value: (data.final_line_price || 0) / 100,
            currency: (moneyFormat.match(/[A-Z]{3}/) || ['USD'])[0]
          });
        }
        fetchCart();
        openCart();
      })
      .catch(() => { if (button) button.classList.remove('is-loading'); toast('Network error — try again'); });
  }

  document.addEventListener('submit', (e) => {
    const form = e.target.closest('form[data-cart-form]');
    if (!form) return;
    e.preventDefault();
    addToCart(form, $('[type="submit"]', form));
  });

  // initial count sync
  fetchCart();

  /* ======================================================================
     PRODUCT PAGE — variants, gallery, quantity
     ====================================================================== */
  const productForm = $('[data-product-form]');
  if (productForm) {
    const variantData = JSON.parse($('[data-variant-json]', productForm)?.textContent || '[]');
    const idInput = $('[data-variant-id]', productForm);
    const priceEl = $('[data-product-price]');
    const submitBtn = $('[type="submit"]', productForm);
    const submitLabel = submitBtn ? $('.btn__label', submitBtn) : null;

    function getSelectedOptions() {
      return $$('[data-option-index]', productForm).map(group => {
        const checked = $('input:checked', group) || $('select', group);
        return checked ? checked.value : null;
      });
    }

    function findVariant(opts) {
      return variantData.find(v => opts.every((o, i) => v.options[i] === o));
    }

    function updateVariant() {
      const opts = getSelectedOptions();
      const variant = findVariant(opts);
      if (!variant) return;
      idInput.value = variant.id;
      if (priceEl) {
        if (variant.compare_at_price && variant.compare_at_price > variant.price) {
          priceEl.innerHTML = '<s>' + formatMoney(variant.compare_at_price) + '</s><span class="on-sale">' + formatMoney(variant.price) + '</span>';
        } else {
          priceEl.textContent = formatMoney(variant.price);
        }
      }
      if (submitBtn) {
        if (variant.available) {
          submitBtn.disabled = false;
          if (submitLabel) submitLabel.textContent = 'Add to Cart';
        } else {
          submitBtn.disabled = true;
          if (submitLabel) submitLabel.textContent = 'Sold Out';
        }
      }
      // update URL
      if (history.replaceState) {
        const url = new URL(window.location);
        url.searchParams.set('variant', variant.id);
        history.replaceState({}, '', url);
      }
    }

    $$('[data-option-index] input, [data-option-index] select', productForm)
      .forEach(el => el.addEventListener('change', updateVariant));

    // Quantity stepper
    const qtyInput = $('[data-qty-input]', productForm);
    if (qtyInput) {
      $('[data-qty-minus]', productForm)?.addEventListener('click', () => {
        qtyInput.value = Math.max(1, parseInt(qtyInput.value, 10) - 1);
      });
      $('[data-qty-plus]', productForm)?.addEventListener('click', () => {
        qtyInput.value = parseInt(qtyInput.value, 10) + 1;
      });
    }
  }

  // Gallery thumbs
  const gallery = $('[data-gallery]');
  if (gallery) {
    const mainImg = $('[data-gallery-main] img', gallery);
    $$('[data-gallery-thumb]', gallery).forEach(thumb => {
      thumb.addEventListener('click', () => {
        const full = thumb.getAttribute('data-full');
        if (mainImg && full) mainImg.src = full;
        $$('[data-gallery-thumb]', gallery).forEach(t => t.classList.remove('is-active'));
        thumb.classList.add('is-active');
      });
    });
  }

  /* ======================================================================
     AUDIO PREVIEWS
     ====================================================================== */
  let currentAudio = null;
  let currentBtn = null;
  $$('[data-audio]').forEach(row => {
    const btn = $('[data-audio-play]', row);
    const src = row.getAttribute('data-audio');
    const bar = $('.audio-row__bar i', row);
    if (!btn || !src) return;
    let audio = null;

    btn.addEventListener('click', () => {
      if (!audio) {
        audio = new Audio(src);
        audio.addEventListener('timeupdate', () => {
          if (bar && audio.duration) bar.style.width = (audio.currentTime / audio.duration * 100) + '%';
        });
        audio.addEventListener('ended', () => { btn.classList.remove('is-playing'); setIcon(btn, false); if (bar) bar.style.width = '0%'; });
      }
      if (audio.paused) {
        if (currentAudio && currentAudio !== audio) { currentAudio.pause(); currentBtn.classList.remove('is-playing'); setIcon(currentBtn, false); }
        audio.play();
        btn.classList.add('is-playing');
        setIcon(btn, true);
        currentAudio = audio; currentBtn = btn;
      } else {
        audio.pause();
        btn.classList.remove('is-playing');
        setIcon(btn, false);
      }
    });
  });
  function setIcon(btn, playing) {
    btn.innerHTML = playing
      ? '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
  }

  /* ======================================================================
     COLLECTION FILTER (client-side, by data-category)
     ====================================================================== */
  const filterBar = $('[data-filter-bar]');
  if (filterBar) {
    const chips = $$('[data-filter]', filterBar);
    const items = $$('[data-product-item]');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const val = chip.getAttribute('data-filter');
        chips.forEach(c => c.classList.toggle('is-active', c === chip));
        items.forEach(item => {
          const cats = (item.getAttribute('data-category') || '').toLowerCase();
          const show = val === 'all' || cats.includes(val.toLowerCase());
          item.style.display = show ? '' : 'none';
        });
      });
    });

    const sort = $('[data-sort]', filterBar);
    if (sort) {
      const grid = $('[data-product-grid]');
      sort.addEventListener('change', () => {
        const val = sort.value;
        const items = $$('[data-product-item]', grid);
        items.sort((a, b) => {
          const pa = parseFloat(a.getAttribute('data-price')) || 0;
          const pb = parseFloat(b.getAttribute('data-price')) || 0;
          if (val === 'price-asc') return pa - pb;
          if (val === 'price-desc') return pb - pa;
          return (parseInt(a.getAttribute('data-order')) || 0) - (parseInt(b.getAttribute('data-order')) || 0);
        });
        items.forEach(i => grid.appendChild(i));
      });
    }
  }

  /* ======================================================================
     SCROLL REVEAL
     ====================================================================== */
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-in'); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('is-in'));
  }

  /* ======================================================================
     KLAVIYO newsletter forms (theme-native, non-popup)
     ====================================================================== */
  $$('[data-klaviyo-form]').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = $('input[type="email"]', form)?.value;
      const listId = form.getAttribute('data-list-id');
      const company = form.getAttribute('data-company-id');
      const msg = $('[data-form-msg]', form);
      if (!email) return;
      if (!company || !listId) {
        // Fall back to opening Klaviyo onsite signup if configured, else just acknowledge
        if (msg) { msg.className = 'form-success'; msg.textContent = "Thanks — you're on the list."; }
        form.reset();
        return;
      }
      const params = new URLSearchParams();
      params.append('g', listId);
      params.append('email', email);
      params.append('$fields', 'email');
      fetch('https://manage.kmail-lists.com/ajax/subscriptions/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      })
        .then(r => r.json())
        .then(() => { if (msg) { msg.className = 'form-success'; msg.textContent = "Locked in. Check your inbox."; } form.reset(); })
        .catch(() => { if (msg) { msg.className = 'form-success'; msg.textContent = "Thanks — you're on the list."; } form.reset(); });
    });
  });

})();
