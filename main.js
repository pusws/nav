/* WebNav Hub — 交互脚本
 *
 * 卡片本身已经是 <a>，键盘 Tab / Enter 与平滑滚动都交给浏览器原生行为，
 * 这里只保留浏览器做不到（或还不能普遍做到）的三件事：
 *   1. 滚动时高亮当前分类
 *      - Chrome 140+ 用 CSS 的 scroll-target-group + :target-current 原生实现，
 *        脚本只负责把状态同步到 aria-current（见 scrollspy 指南）
 *      - 其余浏览器用 IntersectionObserver 兜底，不监听 scroll
 *   2. 版权年份
 *   3. 返回顶部按钮的显隐（观察页头是否离开视口，同样不监听 scroll）
 */
(() => {
  const navLinks = Array.from(
    document.querySelectorAll('nav[aria-label="分类导航"] a[href^="#"]'),
  );
  const headings = Array.from(document.querySelectorAll('main .category-title[id]'));

  const setCurrent = (id) => {
    for (const link of navLinks) {
      if (link.hash === `#${id}`) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    }
  };

  /* ---- 1. 当前分类高亮 ---------------------------------------------- */
  const nativeScrollspy = 'supports' in CSS && CSS.supports('scroll-target-group: auto');

  if (navLinks.length && nativeScrollspy) {
    // 视觉状态由 :target-current 提供，这里只补上辅助技术需要知道的语义状态
    const syncAriaCurrent = () => {
      const current = document.querySelector('nav[aria-label="分类导航"] a:target-current');
      for (const link of navLinks) {
        if (link === current) {
          link.setAttribute('aria-current', 'true');
        } else {
          link.removeAttribute('aria-current');
        }
      }
    };

    syncAriaCurrent();
    document.addEventListener('scrollend', syncAriaCurrent, { passive: true });
    window.addEventListener('hashchange', syncAriaCurrent);
  } else if (navLinks.length && headings.length && 'IntersectionObserver' in window) {
    const visible = new Set();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.add(entry.target.id);
          } else {
            visible.delete(entry.target.id);
          }
        }
        // 取当前处于视口顶部区域的第一个分类；都不在时保留上一次的高亮
        const current = headings.find((heading) => visible.has(heading.id));
        if (current) setCurrent(current.id);
      },
      // 只关注视口上半部分的一条窄带
      { rootMargin: '0px 0px -70% 0px' },
    );

    for (const heading of headings) observer.observe(heading);

    const initial = window.location.hash.slice(1);
    if (initial) setCurrent(initial);
  }

  /* ---- 2. 版权年份 --------------------------------------------------- */
  const year = document.getElementById('copyright-year');
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  /* ---- 3. 返回顶部 --------------------------------------------------- */
  const toTop = document.getElementById('back-to-top');
  const pageHeader = document.querySelector('body > header');

  if (toTop) {
    // 是否平滑滚动由 CSS 的 scroll-behavior（含 prefers-reduced-motion 判断）决定
    toTop.addEventListener('click', () => {
      window.scrollTo({ top: 0 });
    });

    if (pageHeader && 'IntersectionObserver' in window) {
      new IntersectionObserver(
        ([entry]) => {
          toTop.classList.toggle('show', !entry.isIntersecting);
        },
        { threshold: 0 },
      ).observe(pageHeader);
    }
  }
})();
