
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

async function downloadAndSearchScripts(url, outputFolder, searchKeyword) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Navigate to the URL you want to inspect
    await page.goto(url);

    // Get all script elements with a source URL
    const scriptElements = await page.evaluate(() => {
        const scripts = document.querySelectorAll('script[src]');
        return Array.from(scripts).map(script => script.src);
    });

    // Download and search each script
    for (const scriptURL of scriptElements) {
        const scriptFileName = path.basename(scriptURL);
        const outputPath = path.join(outputFolder, scriptFileName);

        try {
            // Download the script content
            const response = await axios.get(scriptURL);

            // Save the script content to a file
            fs.writeFileSync(outputPath, response.data);

            // Search for the keyword in the script content
            if (searchKeyword && response.data.includes(searchKeyword)) {
                console.log(`Script downloaded and saved to ${outputPath}`);
                console.log(`Keyword "${searchKeyword}" found in ${scriptFileName}`);
            } else if (!searchKeyword) {
                console.log(`Script downloaded and saved to ${outputPath}`);
            }
        } catch (error) {
            console.error(`Failed to download ${scriptURL}: ${error.message}`);
        }
    }

    await browser.close();
}

// Example usage
const urlToScrape = 'https://dcms.dreamlive.co.in';
const outputFolder = 'downloadedScripts';
const searchKeyword = 'apiKey';

// Create the output folder if it doesn't exist
if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder);
}

downloadAndSearchScripts(urlToScrape, outputFolder, searchKeyword);
