import * as puppeteer from "puppeteer";
import UserAgent from "user-agents";
import { writeJsonFile } from "write-json-file";
import proxyRecord from "./proxy-ips.json" assert { type: "json" };
const knownProxies = proxyRecord;
async function scrapeProxies() {
    const url = "https://sslproxies.org/";
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    const urls = await page.$eval(".fpl-list table", (table) => {
        return Array.from(table.querySelectorAll("tr td:nth-of-type(1)")).map((element) => `${element.innerHTML}:${element.nextSibling?.textContent}`);
    });
    await browser.close();
    return urls;
}
async function storeIPs() {
    const proxyUrls = await scrapeProxies();
    const newUrls = proxyUrls.filter((url) => !knownProxies[url]);
    const newUrlBook = Object.fromEntries(newUrls.map((url) => [url, { errors: [], successes: [] }]));
    await writeJsonFile("proxy-ips.json", {
        ...knownProxies,
        ...newUrlBook,
    });
}
function scrapingError(message) {
    return {
        message,
        time: new Date(),
    };
}
function scrapingSuccess(domain) {
    return {
        domain,
        time: new Date(),
    };
}
async function scrape(url) {
    const proxies = await scrapeProxies();
    const randomIp = proxies[Math.floor(Math.random() * proxies.length)];
    console.log(`📡] Trying Proxy ${randomIp}`);
    const browser = await puppeteer.launch({
        headless: false,
        args: [`--proxy-server=${randomIp}`],
    });
    const page = await browser.newPage();
    const userAgent = new UserAgent();
    console.log(userAgent.toString());
    await page.setUserAgent(userAgent.toString());
    try {
        await page.goto(url);
    }
    catch (error) {
        console.error(error);
    }
}
storeIPs();
scrape;
// scrape("https://www.github.com");
