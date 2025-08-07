// 性能优化和简化节流函数
const simpleThrottle = (func, delay) => {
  let lastCall = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCall > delay) {
      lastCall = now;
      func.apply(this, args);
    }
  };
};

// 简化的防抖函数
const simpleDebounce = (func, delay) => {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};

// 简化的DOM加载完成检测
const isDOMReady = () => {
  return document.readyState === 'loading' ? 
    new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve)) : 
    Promise.resolve();
};

// 简化的性能检测
const isLowEndDevice = () => {
  return navigator.hardwareConcurrency <= 2 || 
         /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

document.addEventListener("DOMContentLoaded", function () {
  // 缓存DOM元素引用
  const navLinks = document.querySelectorAll("nav a");
  const linkCards = document.querySelectorAll(".link-card");
  const body = document.body;
  
  // 检测是否为低性能设备
  const lowEndDevice = isLowEndDevice();
  
  // 如果是低性能设备，禁用动画
  if (lowEndDevice) {
    body.classList.add('performance-mode');
    // 立即显示所有卡片，不使用动画
    linkCards.forEach(card => {
      card.style.animation = 'none';
      card.style.opacity = '1';
    });
  }

  // 优化导航链接功能
  const handleNavClick = function (e) {
    e.preventDefault();

    // 批量DOM操作
    const targetId = this.getAttribute("href").substring(1);
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
      // 使用DocumentFragment避免多次重绘
      navLinks.forEach(link => link.classList.remove("active"));
      this.classList.add("active");

      // 优化滚动性能
      targetElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      // 延迟更新URL，避免阻塞滚动
      setTimeout(() => {
        history.replaceState(null, null, "#" + targetId);
      }, 100);
    }
  };

  // 使用事件委托减少事件监听器数量
  const nav = document.querySelector('nav ul');
  if (nav) {
    nav.addEventListener('click', function(e) {
      const link = e.target.closest('a');
      if (link) {
        handleNavClick.call(link, e);
      }
    });
  }

  // 简化页面加载时的哈希处理
  if (window.location.hash) {
    const targetId = window.location.hash.substring(1);
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      setTimeout(() => {
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });

        navLinks.forEach((link) => {
          if (link.getAttribute("href") === "#" + targetId) {
            link.classList.add("active");
          } else {
            link.classList.remove("active");
          }
        });
      }, 100);
    }
  }

  // 简化键盘导航
  body.addEventListener("keydown", function(e) {
    if (e.key === " " || e.key === "Enter") {
      const activeElement = document.activeElement;
      if (activeElement && activeElement.classList.contains("link-card")) {
        e.preventDefault();
        const link = activeElement.querySelector("a");
        if (link) {
          link.click();
        }
      }
    }
    
    if (e.key === "Tab") {
      body.classList.add("user-is-tabbing");
    }
  }, { passive: true });
  
  // 返回顶部功能
  const backToTopButton = document.getElementById('back-to-top');
  
  if (backToTopButton) {
    // 使用节流优化滚动检测
    const handleScroll = simpleThrottle(() => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      if (scrollTop > 300) {
        backToTopButton.classList.add('show');
      } else {
        backToTopButton.classList.remove('show');
      }
    }, 100);
    
    // 滚动到顶部
    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    };
    
    // 添加事件监听器
    window.addEventListener('scroll', handleScroll, { passive: true });
    backToTopButton.addEventListener('click', scrollToTop);
    
    // 键盘支持
    backToTopButton.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        scrollToTop();
      }
    });
  }
  
  // 添加页面加载完成标记
  body.classList.add('loaded');
});