const { chromium } = require('playwright');
const fs = require('fs').promises;

async function captureScreenshot(iteration) {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Set viewport to standard desktop size
  await page.setViewportSize({ width: 1280, height: 800 });
  
  // Navigate to the local preview
  await page.goto('http://localhost:8000');
  
  // Wait for content to load
  await page.waitForLoadState('networkidle');
  
  // Take screenshot
  await page.screenshot({ 
    path: `screenshot-${iteration}.png`,
    fullPage: true 
  });
  
  // Also capture mobile view
  await page.setViewportSize({ width: 375, height: 812 });
  await page.screenshot({ 
    path: `screenshot-mobile-${iteration}.png`,
    fullPage: true 
  });
  
  await browser.close();
  console.log(`Screenshots saved: screenshot-${iteration}.png and screenshot-mobile-${iteration}.png`);
}

async function improveDesign() {
  // Read current HTML
  let html = await fs.readFile('index.html', 'utf8');
  
  // Design improvements to try
  const improvements = [
    {
      name: 'Clean minimal layout',
      changes: [
        { find: 'gap: 0.5ch;', replace: 'gap: 0.75ch;' },
        { find: 'font-size: 0.9rem;', replace: 'font-size: 0.85rem;' },
        { find: 'padding: 0.3lh 0.8ch;', replace: 'padding: 0.2lh 0.6ch;' }
      ]
    },
    {
      name: 'Better badge styling',
      changes: [
        { find: 'cap-="round"', replace: 'cap-="square"' },
        { find: 'cap-="ribbon"', replace: 'cap-="round"' },
        { find: 'cap-="triangle"', replace: 'cap-="round"' },
        { find: 'cap-="slant-top"', replace: 'cap-="round"' }
      ]
    },
    {
      name: 'Simplified color scheme',
      changes: [
        { find: 'variant-="foreground0"', replace: 'variant-="background2"' },
        { find: 'variant-="foreground1"', replace: 'variant-="background2"' },
        { find: 'variant-="foreground2"', replace: 'variant-="background2"' },
        { find: 'variant-="background3"', replace: 'variant-="background2"' }
      ]
    },
    {
      name: 'Grid layout optimization',
      changes: [
        { find: 'grid-template-columns: repeat(2, 1fr);', replace: 'grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));' },
        { find: 'gap: 2ch;', replace: 'gap: 3ch;' }
      ]
    }
  ];
  
  // Take initial screenshot
  await captureScreenshot('initial');
  
  // Try each improvement
  for (let i = 0; i < improvements.length; i++) {
    const improvement = improvements[i];
    console.log(`\nTrying improvement ${i + 1}: ${improvement.name}`);
    
    // Apply changes
    let improvedHtml = html;
    for (const change of improvement.changes) {
      improvedHtml = improvedHtml.replace(new RegExp(change.find, 'g'), change.replace);
    }
    
    // Write temporary file
    await fs.writeFile('index.html', improvedHtml);
    
    // Take screenshot
    await captureScreenshot(`improvement-${i + 1}`);
    
    // Ask for feedback (in real scenario, we'd analyze or get user input)
    console.log(`Improvement ${i + 1} applied. Check screenshot-improvement-${i + 1}.png`);
    
    // For now, let's keep the last improvement
    if (i === improvements.length - 1) {
      html = improvedHtml;
    }
  }
  
  console.log('\nDesign improvement process complete!');
}

// Run if executed directly
if (require.main === module) {
  improveDesign().catch(console.error);
}

module.exports = { captureScreenshot, improveDesign };