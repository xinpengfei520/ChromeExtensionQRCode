(function() {
  // 创建悬浮图标
  const floatingIcon = document.createElement('div');
  floatingIcon.id = 'qr-floating-icon';
  
  // 获取当前网站的favicon
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${window.location.hostname}&sz=24`;
  
  floatingIcon.style.backgroundImage = `url(${faviconUrl})`;
  
  document.body.appendChild(floatingIcon);

  // 添加点击事件
  floatingIcon.addEventListener('click', function() {
    chrome.runtime.sendMessage({action: "openPopup"});
  });
})();