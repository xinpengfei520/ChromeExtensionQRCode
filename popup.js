document.addEventListener('DOMContentLoaded', function() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const url = tabs[0].url;
    const domain = new URL(url).hostname.split('.').slice(-2).join('.');

    // 尝试多个favicon源,优先使用高清图标
    const faviconSources = [
      // 优先尝试网站自己的高清图标
      `https://${domain}/apple-touch-icon.png`,
      `https://${domain}/apple-touch-icon-precomposed.png`,
      // 然后是favicon.ico
      `https://${domain}/favicon.ico`,
      // 最后使用第三方服务
      `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
      `https://favicon.yandex.net/favicon/${domain}?size=128`
    ];

    tryLoadFavicon(url, domain, faviconSources);
  });

  function tryLoadFavicon(url, domain, sources, index = 0) {
    if (index >= sources.length) {
      console.warn('All favicon sources failed, generating QR code without logo');
      generateQRCode(url, domain, null);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    
    img.onload = function() {
      // 检查加载的图片是否太小
      if (img.width < 32 || img.height < 32) {
        console.warn('Favicon too small, trying next source');
        tryLoadFavicon(url, domain, sources, index + 1);
        return;
      }
      
      console.log(`Favicon loaded successfully from: ${sources[index]}, size: ${img.width}x${img.height}`);
      generateQRCode(url, domain, img); // 直接传递Image对象而不是URL
    };

    img.onerror = function() {
      console.warn('Failed to load favicon from:', sources[index]);
      tryLoadFavicon(url, domain, sources, index + 1);
    };

    img.src = sources[index];
  }

  function generateQRCode(url, domain, logoImg) {
    console.log('Generating QR code for:', url);
    
    const qrcode = new QRCode(document.getElementById("qrcode"), {
      text: url,
      width: 200,
      height: 200,
      colorDark : "#000000",
      colorLight : "#ffffff",
      correctLevel : QRCode.CorrectLevel.H
    });

    document.getElementById("domain").textContent = domain;

    if (!logoImg) return;

    // 等待二维码生成完成
    setTimeout(() => {
      const qr = document.querySelector('#qrcode img');
      if (!qr) {
        console.error('QR code image not found');
        return;
      }

      // 确保二维码图片加载完成
      if (!qr.complete) {
        qr.onload = () => processQRCode(qr, logoImg);
      } else {
        processQRCode(qr, logoImg);
      }
    }, 100); // 给QRCode库一点时间生成图片
  }

  function processQRCode(qr, logo) {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = qr.width;
      canvas.height = qr.height;
      const ctx = canvas.getContext('2d');

      // 创建临时canvas用于圆形裁剪logo
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      tempCanvas.width = logo.width;
      tempCanvas.height = logo.height;

      // 在临时canvas上将logo裁剪成圆形
      tempCtx.beginPath();
      tempCtx.arc(logo.width/2, logo.height/2, logo.width/2, 0, Math.PI * 2);
      tempCtx.closePath();
      tempCtx.clip();
      tempCtx.drawImage(logo, 0, 0);

      // 先在主canvas上绘制二维码
      ctx.drawImage(qr, 0, 0, canvas.width, canvas.height);

      // 计算logo尺寸和位置
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const logoSize = Math.min(canvas.width, canvas.height) * 0.25; // 25%的大小
      const bgSize = logoSize * 1.1; // 背景略大于logo

      // 绘制白色背景圆
      ctx.beginPath();
      ctx.arc(centerX, centerY, bgSize/2, 0, Math.PI * 2);
      ctx.fillStyle = 'white';
      ctx.fill();

      // 绘制边框
      ctx.beginPath();
      ctx.arc(centerX, centerY, bgSize/2, 0, Math.PI * 2);
      ctx.strokeStyle = '#e5e5e5';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 绘制圆形logo
      const logoX = centerX - logoSize/2;
      const logoY = centerY - logoSize/2;
      ctx.drawImage(tempCanvas, logoX, logoY, logoSize, logoSize);

      // 替换原始二维码图片
      qr.src = canvas.toDataURL('image/png');
      
      console.log('Logo added successfully');
    } catch (err) {
      console.error('Error processing QR code:', err);
      console.error(err.stack); // 输出完整错误堆栈
    }
  }
});