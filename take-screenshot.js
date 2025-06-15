const { chromium } = require('playwright');

async function takeScreenshots() {
  console.log('Starting preview server...');
  console.log('Make sure to run: ./preview.sh in another terminal');
  console.log('Waiting 3 seconds for server to start...');
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Desktop view
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('http://localhost:8000');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'desktop-view.png', fullPage: true });
    console.log('✓ Desktop screenshot saved: desktop-view.png');
    
    // Mobile view
    await page.setViewportSize({ width: 375, height: 812 });
    await page.screenshot({ path: 'mobile-view.png', fullPage: true });
    console.log('✓ Mobile screenshot saved: mobile-view.png');
    
    // Tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.screenshot({ path: 'tablet-view.png', fullPage: true });
    console.log('✓ Tablet screenshot saved: tablet-view.png');
    
  } catch (error) {
    console.error('Error:', error);
    console.log('\nMake sure the preview server is running:');
    console.log('Run: ./preview.sh');
  } finally {
    await browser.close();
  }
}

takeScreenshots();