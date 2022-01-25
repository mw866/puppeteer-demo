const startURL = 'https://docs.readme.com/docs';
const waitSelector = '#hub-sidebar > section';
const linkSelector = '#hub-sidebar > section a';
const outputDir = './output';

const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(startURL, {
    waitUntil: 'networkidle2',
  });

  await page.waitForSelector(waitSelector);

  const hrefs = await page.$$eval(linkSelector, links => {
    links = links.map(el => el.href)
    return links;
  });

  console.log('Extracted total links:', hrefs.length, hrefs)
  if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true, force: true });
    console.log("Emptied ./output directory")
  }
  fs.mkdirSync(outputDir);


  for (const href of hrefs) {
    await page.goto(href);

    const url = new URL(href);
    const outputPath = outputDir + url.pathname.replace(/(?<!^)\//g, "_") + '.pdf';
    await page.pdf({
      path: outputPath,
      format: 'a4'
    });

    console.log("Successfully saved: ", outputPath);
  }

  await browser.close();
})();

