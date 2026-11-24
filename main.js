/* WebNav Hub — 交互脚本
 *
 * 卡片本身已经是 <a>，键盘 Tab / Enter 与平滑滚动都交给浏览器原生行为，
 * 这里只保留两件浏览器做不到的事：
 *   1. 滚动时高亮当前分类（IntersectionObserver，无 scroll 监听）
 *   2. 返回顶部按钮的显隐（观察页头是否离开视口，同样不监听 scroll）
 */
(() => {
  const navLinks = Array.from(
    document.querySelectorAll('nav[aria-label="分类导航"] a[href^="#"]'),
  );
  const headings = Array.from(document.querySelectorAll('main .category-title[id]'));

  /* ---- 1. 当前分类高亮 ---------------------------------------------- */
  if (navLinks.length && headings.length && 'IntersectionObserver' in window) {
    const visible = new Set();

    const setCurrent = (id) => {
      for (const link of navLinks) {
        if (link.hash === `#${id}`) {
          link.setAttribute('aria-current', 'true');
        } else {
          link.removeAttribute('aria-current');
        }
      }
    };

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

  /* ---- 2. 返回顶部 --------------------------------------------------- */
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
