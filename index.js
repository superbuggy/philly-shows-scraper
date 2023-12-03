import * as puppeteer from "puppeteer";
// import { writeJsonFile } from "write-json-file";
import { siteScrapingSchemas } from "./site-schemas.js";
import { writeJsonFileSync } from "write-json-file";
//  Run operation 4 times a day
//   Scrape sites
//    Parse into Structured data
//    Output into json
//    Store in firebase?
const options = {
    //
    headless: false,
};
async function scrape() {
    const browser = await puppeteer.launch(options);
    const page = await browser.newPage();
    for (const siteSchema of siteScrapingSchemas) {
        await page.goto(siteSchema.url);
        const selectors = Object.fromEntries(Object.entries(siteSchema.selectors).filter(([field, value]) => typeof value === "string" && field !== "block" && field !== "parser"));
        await page.waitForSelector(siteSchema.selectors.block);
        const data = await page.$$eval(siteSchema.selectors.block, async (blocks, selectors, url) => {
            const parser = {
                "https://www.phillymetal.net/": {
                    source: "a",
                    handler: (element) => {
                        const html = element.innerHTML;
                        return {
                            performers: html.split("@")[0],
                            venue: html.split("@")[1],
                            date: element.parentElement?.parentElement?.querySelector("h4")
                                ?.innerHTML,
                        };
                    },
                },
                "http://playinpossum.org/": {
                    handler: (element) => {
                        const monthDate = element.querySelector('b')?.innerHTML;
                        const probablyDate = monthDate?.match(/.+\d+/)?.[0];
                        if (!probablyDate) {
                            throw new Error('Playing Possum date parsing error');
                        }
                        const cleanedDate = probablyDate.split('-')[0];
                        const currentYear = new Date().getFullYear();
                        const currentMonth = new Date().getMonth();
                        const showMonth = new Date(monthDate).getMonth();
                        const year = currentMonth > showMonth ? currentYear + 1 : currentYear;
                        const date = `${cleanedDate} ${year}`;
                        const html = element.innerHTML;
                        const [performers, venue, time] = html
                            .split("\n")[1]
                            .trim()
                            .split("–");
                        return { performers, venue, time, date };
                    },
                },
                "https://www.bowerbird.org/events/": {
                    source: "div.list_event_title_bbrd",
                    handler: (element) => {
                        const sibling = element.parentElement?.querySelector("div.list_event_subtitle_bbrd");
                        return {
                            performers: element.innerHTML + sibling?.innerHTML || "",
                        };
                    },
                },
            }[url];
            return blocks.map((block, index) => Object.entries(selectors).reduce((scrapeData, [field, selector]) => {
                const el = block.querySelector(selector);
                if (el !== null) {
                    scrapeData[field] =
                        field === "url" ? el.href : el.innerHTML.trim();
                }
                else {
                    scrapeData[field] = null;
                }
                if (parser) {
                    const source = parser?.source;
                    const el = source ? block.querySelector(source) : block;
                    return el
                        ? {
                            ...scrapeData,
                            ...parser.handler(el),
                        }
                        : {
                            ...scrapeData,
                            parseEffor: `${parser.source} block:${index} on ${window.location}`,
                        };
                }
                return scrapeData;
            }, {}));
        }, selectors, siteSchema.url);
        const cleanedData = data
            .map((show) => {
            const date = new Date(show.date);
            // if (date.getFullYear() === 2001) {
            //   return {
            //     ...show,
            //     date: new Date(show.date + new Date().getFullYear()),
            //   };
            // }
            return {
                ...show,
                date,
            };
        })
            .sort();
        console.log(cleanedData);
        writeJsonFileSync('dates.json', cleanedData);
    }
}
scrape();
