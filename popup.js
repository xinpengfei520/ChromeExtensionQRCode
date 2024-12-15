document.addEventListener('DOMContentLoaded', function() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const url = tabs[0].url;
    const domain = new URL(url).hostname.split('.').slice(-2).join('.');

    // 获取网站favicon
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

    generateQRCode(url, domain, faviconUrl);
  });

  function generateQRCode(url, domain, faviconUrl) {
    // 创建二维码
    const qrcode = new QRCode(document.getElementById("qrcode"), {
      text: url,
      width: 200,
      height: 200,
      colorDark : "#000000",
      colorLight : "#ffffff",
      correctLevel : QRCode.CorrectLevel.H
    });

    // 设置域名
    document.getElementById("domain").textContent = domain;

    // 在二维码中心添加网站logo
    const img = new Image();
    img.onload = function() {
      const qr = document.querySelector('#qrcode img');
      const canvas = document.createElement('canvas');
      canvas.width = qr.width;
      canvas.height = qr.height;
      const ctx = canvas.getContext('2d');
      
      ctx.drawImage(qr, 0, 0);
      
      const logoSize = 52;
      const logoX = (qr.width - logoSize) / 2;
      const logoY = (qr.height - logoSize) / 2;
      
      ctx.drawImage(img, logoX, logoY, logoSize, logoSize);
      
      qr.src = canvas.toDataURL();
    };
    img.src = faviconUrl;
  }
});