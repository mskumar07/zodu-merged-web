const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:5183/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.evaluate(() => {
    const boxes = document.querySelectorAll('*');
    for (const el of boxes) {
      if (el.scrollHeight > el.clientHeight && el.clientHeight > 400) { el.scrollTop = 900; break; }
    }
  });
  await page.waitForTimeout(500);

  const info = await page.evaluate(() => {
    const heading = [...document.querySelectorAll('*')].find(el => el.textContent.trim() === 'Inventory Management' && el.children.length === 0);
    if (!heading) return { error: 'not found' };
    const card = heading.closest('.MuiPaper-root');
    const results = [];
    function dump(el, label) {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      results.push({ label, tag: el.tagName, text: el.textContent.slice(0,40), w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top), left: Math.round(r.left), right: Math.round(r.right), whiteSpace: cs.whiteSpace, overflow: cs.overflow, flex: cs.flex, minWidth: cs.minWidth, display: cs.display });
    }
    dump(card, 'card');
    // iterate children recursively up to depth 4
    function walk(el, depth, label) {
      if (depth > 4) return;
      dump(el, label);
      [...el.children].forEach((c, i) => walk(c, depth+1, label + '>' + i));
    }
    walk(card, 0, 'card');
    return results;
  });
  console.log(JSON.stringify(info, null, 2));
  await browser.close();
})();
