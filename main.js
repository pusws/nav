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

// 简化版RAF优化
const simpleRAF = (func) => {
  let ticking = false;
  return function (...args) {
    if (!ticking) {
      requestAnimationFrame(() => {
        func.apply(this, args);
        ticking = false;
      });
      ticking = true;
    }
  };
};

document.addEventListener("DOMContentLoaded", function () {
  // 缓存DOM元素引用
  const navLinks = document.querySelectorAll("nav a");
  const linkCards = document.querySelectorAll(".link-card");
  const body = document.body;
  
  // 预创建音频上下文
  let audioContext;
  let isAudioInitialized = false;

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

  // 简化触感反馈
  const handleMouseEnter = simpleThrottle(function () {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  }, 200);

  // 简化卡片事件处理
  linkCards.forEach((card) => {
    card.addEventListener("mouseenter", handleMouseEnter, { passive: true });
  });

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

  // 简化观察器
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  linkCards.forEach((card) => {
    observer.observe(card);
  });
  
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
  
  // 简化音频系统
  const playKeyPressSound = simpleThrottle(() => {
    if (!audioContext) {
      try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        return;
      }
    }
    
    if (audioContext.state === "suspended") {
      audioContext.resume();
    }
    
    try {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(900, audioContext.currentTime);
      
      const now = audioContext.currentTime;
      gainNode.gain.setValueAtTime(0.1, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      
      oscillator.start(now);
      oscillator.stop(now + 0.03);
      
    } catch (e) {
      // 静默失败
    }
  }, 100);
  
  // 简化事件绑定
  const clickables = document.querySelectorAll('.link-card, nav a');
  clickables.forEach(el => {
    el.addEventListener('click', playKeyPressSound, { passive: true });
  });
  
  // 性能模式检测和切换
  const detectPerformance = () => {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const isLowEndDevice = navigator.hardwareConcurrency <= 2;
    const isSlowNetwork = connection && (connection.effectiveType === '2g' || connection.effectiveType === '3g');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (isLowEndDevice || isSlowNetwork || prefersReducedMotion) {
      body.classList.add('performance-mode');
      // 禁用音频
      audioContext = null;
      // 简化观察器
      if (observer) observer.disconnect();
    }
  };
  
  // 运行性能检测
  detectPerformance();
  
  // 添加页面加载完成标记
  body.classList.add('loaded');
  
  // 返回顶部功能
  const backToTopButton = document.getElementById('back-to-top');
  
  if (backToTopButton) {
    // 简化滚动检测
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
      
      // 播放音效
      if (audioContext && !body.classList.contains('performance-mode')) {
        playKeyPressSound();
      }
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
  
});