/* ============================================
   AR TEK — Main JavaScript
   Version: 1.0.0
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // ─── CUSTOM CURSOR ───────────────────────────
  const cursorDot = document.querySelector('.cursor-dot');
  const cursorOutline = document.querySelector('.cursor-outline');

  if (cursorDot && cursorOutline) {
    let outX = 0,
      outY = 0;
    let mouseX = 0,
      mouseY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.left = mouseX + 'px';
      cursorDot.style.top = mouseY + 'px';
    });

    function animateCursor() {
      outX += (mouseX - outX) * 0.12;
      outY += (mouseY - outY) * 0.12;
      cursorOutline.style.left = outX + 'px';
      cursorOutline.style.top = outY + 'px';
      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    const hoverEls = document.querySelectorAll(
      'a, button, .card, .btn, [role="button"]'
    );
    hoverEls.forEach((el) => {
      el.addEventListener('mouseenter', () =>
        cursorOutline.classList.add('hovering')
      );
      el.addEventListener('mouseleave', () =>
        cursorOutline.classList.remove('hovering')
      );
    });

    document.addEventListener('mouseleave', () => {
      cursorDot.style.opacity = '0';
      cursorOutline.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      cursorDot.style.opacity = '1';
      cursorOutline.style.opacity = '1';
    });
  }

  // ─── HEADER SCROLL ───────────────────────────
  const header = document.querySelector('.header');
  if (header) {
    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 30);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ─── MOBILE MENU ─────────────────────────────
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';

      const spans = toggle.querySelectorAll('span');
      if (isOpen) {
        spans[0].style.cssText = 'transform: translateY(6.5px) rotate(45deg)';
        spans[1].style.cssText = 'opacity: 0; transform: scaleX(0)';
        spans[2].style.cssText = 'transform: translateY(-6.5px) rotate(-45deg)';
      } else {
        spans.forEach((s) => (s.style.cssText = ''));
      }
    });

    nav.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        toggle.querySelectorAll('span').forEach((s) => (s.style.cssText = ''));
      });
    });
  }

  // ─── CART COUNT ──────────────────────────────
  function updateCartCount() {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const total = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
      const countEls = document.querySelectorAll('.cart-count');
      countEls.forEach((el) => {
        el.textContent = total;
        el.classList.toggle('has-items', total > 0);
      });
    } catch (e) {
      console.warn('Cart read error', e);
    }
  }
  updateCartCount();
  window.addEventListener('storage', updateCartCount);

  // ─── SCROLL REVEAL ───────────────────────────
  const revealEls = document.querySelectorAll('[data-reveal]');
  if (revealEls.length && 'IntersectionObserver' in window) {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const delay = el.dataset.delay || 0;
            setTimeout(() => el.classList.add('revealed'), Number(delay));
            obs.unobserve(el);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    );
    revealEls.forEach((el) => obs.observe(el));
  }

  // ─── PARALLAX GLOW ───────────────────────────
  document.addEventListener('mousemove', (e) => {
    const glows = document.querySelectorAll('.parallax-glow');
    const rx = (e.clientX / window.innerWidth - 0.5) * 30;
    const ry = (e.clientY / window.innerHeight - 0.5) * 30;
    glows.forEach((g) => {
      g.style.transform = `translate(${rx}px, ${ry}px)`;
    });
  });

  // ─── GLOBAL: Add to Cart ─────────────────────
  window.ARTek = window.ARTek || {};

  window.ARTek.addToCart = function (product) {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const idx = cart.findIndex((i) => i.id === product.id);
      if (idx > -1) {
        cart[idx].qty = (cart[idx].qty || 1) + 1;
      } else {
        cart.push({ ...product, qty: 1 });
      }
      localStorage.setItem('cart', JSON.stringify(cart));
      updateCartCount();
      window.ARTek.showToast('تمت الإضافة إلى السلة', 'success');
    } catch (e) {
      console.error('Add to cart error', e);
    }
  };

  // ─── TOAST NOTIFICATION ──────────────────────
  window.ARTek.showToast = function (msg, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 10001;
        display: flex;
        flex-direction: column;
        gap: 8px;
        pointer-events: none;
      `;
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const colorMap = { success: '#49E0D3', error: '#ff4444', info: '#32BFDD' };
    const color = colorMap[type] || colorMap.info;

    toast.style.cssText = `
      background: rgba(5, 10, 12, 0.95);
      border: 1px solid ${color}44;
      border-right: 3px solid ${color};
      color: #F0FFFE;
      font-family: 'Cairo', sans-serif;
      font-size: 0.85rem;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.5), 0 0 20px ${color}22;
      backdrop-filter: blur(10px);
      animation: slideInToast 0.3s ease forwards;
      pointer-events: all;
      min-width: 240px;
      direction: rtl;
    `;
    toast.textContent = msg;

    if (!document.getElementById('toast-styles')) {
      const style = document.createElement('style');
      style.id = 'toast-styles';
      style.textContent = `
        @keyframes slideInToast {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideOutToast {
          from { opacity: 1; transform: translateX(0); }
          to   { opacity: 0; transform: translateX(20px); }
        }
      `;
      document.head.appendChild(style);
    }

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = 'slideOutToast 0.3s ease forwards';
      toast.addEventListener('animationend', () => toast.remove(), {
        once: true,
      });
    }, 3000);
  };
});

/* ============================================
   AR TEK — Home Page JavaScript
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
  // ─── COUNTDOWN TIMER ─────────────────────────
  const elH = document.getElementById('h');
  const elM = document.getElementById('m');
  const elS = document.getElementById('s');

  if (elH && elM && elS) {
    const now = new Date();
    const target = new Date(now);
    target.setHours(23, 59, 59, 0);
    const pad = (n) => String(n).padStart(2, '0');
    function tick() {
      const diff = Math.max(0, target - new Date());
      elH.textContent = pad(Math.floor(diff / 3600000));
      elM.textContent = pad(Math.floor((diff % 3600000) / 60000));
      elS.textContent = pad(Math.floor((diff % 60000) / 1000));
    }
    tick();
    setInterval(tick, 1000);
  }

  // ─── ADD TO CART (الصفحة الرئيسية فقط) ──────────────────────────────────
  // ✅ لو في .products-hero يبقى صفحة المنتجات — الـ inline script في products.pug هو المسؤول
  // ✅ لو في .all-offers-section يبقى صفحة العروض — الـ inline script في offers.pug هو المسؤول
  const isProductsPage = !!document.querySelector('.products-hero');
  const isOffersPage = !!document.querySelector('.all-offers-section');

  if (!isProductsPage && !isOffersPage) {
    document
      .querySelectorAll('.product-card .btn-primary')
      .forEach((btn, i) => {
        btn.addEventListener('click', () => {
          const card = btn.closest('.product-card');
          const name =
            card.querySelector('.product-name')?.textContent?.trim() || 'منتج';
          const priceEl =
            card.querySelector('.product-price')?.textContent?.trim() || '0';
          const cat =
            card.querySelector('.product-cat')?.textContent?.trim() || '';
          window.ARTek?.addToCart({
            id: `product-${i}`,
            name,
            price: priceEl,
            category: cat,
          });
          const original = btn.textContent;
          btn.textContent = '✓ تمت الإضافة';
          btn.style.background = 'linear-gradient(135deg,#49E0D3,#32BFDD)';
          setTimeout(() => {
            btn.textContent = original;
            btn.style.background = '';
          }, 2000);
        });
      });
  }

  // ─── HCARD ADD TO CART ────────────────────────
  document.querySelectorAll('.hcard-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.ARTek?.addToCart({
        id: 'hero-product',
        name: 'سماعة AR Pro X1',
        price: '1,299 جنيه',
        category: 'سماعات',
      });
    });
  });

  // ─── NEWSLETTER FORM ──────────────────────────
  const form = document.querySelector('.newsletter-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = form.querySelector('input[type=email]')?.value?.trim();
      if (!email || !email.includes('@')) {
        window.ARTek?.showToast('برجاء إدخال بريد إلكتروني صحيح', 'error');
        return;
      }
      window.ARTek?.showToast('شكراً! تم الاشتراك بنجاح ✓', 'success');
      form.reset();
    });
  }

  // ─── PARALLAX HERO CHIPS ──────────────────────
  const chips = document.querySelectorAll('.chip');
  if (chips.length) {
    document.addEventListener('mousemove', (e) => {
      const rx = (e.clientX / window.innerWidth - 0.5) * 16;
      const ry = (e.clientY / window.innerHeight - 0.5) * 10;
      chips.forEach((chip, i) => {
        const factor = (i + 1) * 0.4;
        chip.style.transform = `translate(${rx * factor}px, ${ry * factor}px)`;
      });
    });
  }
});

/* ============================================
   AR TEK — View Controller (Filter)
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const productCards = document.querySelectorAll('.product-card');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();

      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.dataset.filter;

      productCards.forEach((card) => {
        if (filterValue === 'all') {
          card.style.display = 'block';
        } else {
          card.style.display =
            card.dataset.category === filterValue ? 'block' : 'none';
        }
      });
    });
  });
});

/* ============================================
   AR TEK — Offers Page JavaScript
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
  // ─── COUNTDOWN TIMER ─────────────────────────
  const oh = document.getElementById('oh');
  const om = document.getElementById('om');
  const os = document.getElementById('os');
  if (oh && om && os) {
    const now = new Date();
    const target = new Date(now);
    target.setHours(23, 59, 59, 0);
    const pad = (n) => String(n).padStart(2, '0');
    const tick = () => {
      const d = Math.max(0, target - new Date());
      oh.textContent = pad(Math.floor(d / 3600000));
      om.textContent = pad(Math.floor((d % 3600000) / 60000));
      os.textContent = pad(Math.floor((d % 60000) / 1000));
    };
    tick();
    setInterval(tick, 1000);
  }

  // ─── FILTER TABS ─────────────────────────────
  const tabs = document.querySelectorAll('.filter-tab');
  const sortSel = document.getElementById('sort-select');
  let activeFilter = 'all';

  function applyFilters() {
    const cards = document.querySelectorAll('.offer-card');
    cards.forEach((card) => {
      const match =
        activeFilter === 'all' || card.dataset.filter === activeFilter;
      card.dataset.hidden = match ? 'false' : 'true';
      card.style.display = match ? '' : 'none';
    });

    const flash = document.querySelectorAll('.flash-card');
    flash.forEach((card) => {
      const match =
        activeFilter === 'all' || card.dataset.filter === activeFilter;
      card.style.display = match ? '' : 'none';
    });

    if (sortSel) {
      const grid = document.getElementById('offers-grid');
      const items = [
        ...grid.querySelectorAll('.offer-card:not([style*="display: none"])'),
      ];
      const getP = (el) =>
        parseFloat(
          el
            .querySelector('.offer-price')
            ?.textContent?.replace(/[^0-9.]/g, '') || '0'
        );
      const getD = (el) =>
        parseFloat(
          el
            .querySelector('.offer-disc')
            ?.textContent?.replace(/[^0-9]/g, '') || '0'
        );

      items.sort((a, b) => {
        switch (sortSel.value) {
          case 'discount':
            return getD(b) - getD(a);
          case 'price-asc':
            return getP(a) - getP(b);
          case 'price-desc':
            return getP(b) - getP(a);
          default:
            return 0;
        }
      });
      items.forEach((el) => grid.appendChild(el));
    }
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      activeFilter = tab.dataset.filter;
      applyFilters();
    });
  });

  if (sortSel) sortSel.addEventListener('change', applyFilters);

  // ─── ADD TO CART ──────────────────────────────
  // ✅ .offer-add بيتعامل معاه الـ inline script في offers.pug — مش هنا
  // ✅ هنا بس .flash-add-btn و .bundle-btn

  document.querySelectorAll('.flash-add-btn').forEach((btn, i) => {
    btn.addEventListener('click', () => {
      const card = btn.closest('[class*="card"]');
      const name = (
        card?.querySelector('.flash-name')?.textContent || `منتج ${i + 1}`
      ).trim();
      const price =
        card?.querySelector('.flash-price')?.textContent?.trim() || '';
      window.ARTek?.addToCart({ id: `flash-${i}-${Date.now()}`, name, price });
      const orig = btn.textContent;
      btn.textContent = '✓ تمت الإضافة';
      setTimeout(() => {
        btn.textContent = orig;
      }, 2000);
    });
  });

  document.querySelectorAll('.bundle-btn').forEach((btn, i) => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.bundle-card');
      const name =
        card?.querySelector('.bundle-name')?.textContent?.trim() ||
        `باقة ${i + 1}`;
      const price =
        card?.querySelector('.bundle-price')?.textContent?.trim() || '';
      window.ARTek?.addToCart({ id: `bundle-${i}`, name, price });
      const orig = btn.textContent;
      btn.textContent = '✓ تمت إضافة الباقة';
      setTimeout(() => {
        btn.textContent = orig;
      }, 2000);
    });
  });

  // ─── PROMO CODE COPY ─────────────────────────
  const copyBtn = document.querySelector('.promo-copy-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const code =
        document.querySelector('.promo-code')?.textContent?.trim() || 'ARTEK10';
      navigator.clipboard?.writeText(code).catch(() => {});
      copyBtn.textContent = '✓ تم النسخ!';
      copyBtn.classList.add('copied');
      setTimeout(() => {
        copyBtn.textContent = 'نسخ الكود';
        copyBtn.classList.remove('copied');
      }, 3000);
    });
  }

  // ─── STOCK BAR ANIMATION ──────────────────────
  if ('IntersectionObserver' in window) {
    const bars = document.querySelectorAll('.flash-stock-fill');
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const el = e.target;
            const target = el.style.width;
            el.style.width = '0%';
            requestAnimationFrame(() => {
              el.style.transition = 'width 1s cubic-bezier(.4,0,.2,1)';
              el.style.width = target;
            });
            obs.unobserve(el);
          }
        });
      },
      { threshold: 0.3 }
    );
    bars.forEach((b) => obs.observe(b));
  }
});

/* ============================================
   AR TEK — Slider
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
  const slider = document.querySelector('.slider-track');
  if (!slider) return;

  const prevBtn = document.querySelector('.slider-arrow.prev');
  const nextBtn = document.querySelector('.slider-arrow.next');
  const cards = slider.querySelectorAll('.product-card');

  const dotsContainer = document.querySelector('.slider-dots');
  if (dotsContainer && cards.length > 1) {
    cards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `الشريحة ${i + 1}`);
      dot.addEventListener('click', () => scrollToCard(i));
      dotsContainer.appendChild(dot);
    });
  }

  function getCardWidth() {
    return cards[0]?.offsetWidth + 22 || 302;
  }

  function scrollToCard(index) {
    slider.scrollTo({ left: index * getCardWidth(), behavior: 'smooth' });
  }

  function updateDots() {
    const index = Math.round(slider.scrollLeft / getCardWidth());
    dotsContainer?.querySelectorAll('.slider-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  }

  let scrollTimeout;
  slider.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(updateDots, 50);
  });

  prevBtn?.addEventListener('click', () =>
    slider.scrollBy({ left: -getCardWidth(), behavior: 'smooth' })
  );
  nextBtn?.addEventListener('click', () =>
    slider.scrollBy({ left: getCardWidth(), behavior: 'smooth' })
  );

  let isDown = false,
    startX,
    scrollLeft;

  slider.addEventListener('mousedown', (e) => {
    isDown = true;
    slider.style.cursor = 'grabbing';
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
  });
  slider.addEventListener('mouseleave', () => {
    isDown = false;
    slider.style.cursor = 'grab';
  });
  slider.addEventListener('mouseup', () => {
    isDown = false;
    slider.style.cursor = 'grab';
    const target =
      Math.round(slider.scrollLeft / getCardWidth()) * getCardWidth();
    slider.scrollTo({ left: target, behavior: 'smooth' });
  });
  slider.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    slider.scrollLeft =
      scrollLeft - (e.pageX - slider.offsetLeft - startX) * 1.5;
  });

  slider.style.cursor = 'grab';
});
