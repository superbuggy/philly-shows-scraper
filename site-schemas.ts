// https://www.philly-shows.com/
// webflow
// Strategy: Select & Parse markup
// div.showblock p.showdescription
export const siteScrapingSchemas = [
  {
    url: "https://www.philly-shows.com/",
    selectors: {
      block: "div.showblock",
      performers: "p.showdescription",
      date: "p.showdatevenue:nth-of-type(1)",
      venue: "p.showdatevenue:nth-of-type(3)",
      url: "a",
    },
  },
  {
    url: "https://www.phillymetal.net/",
    selectors: {
      block: ".App main div",
      // date: "h4",
      url: "a",
    },
    // parser: {
    //   source: "a",
    //   handler: (element: Element) => {
    //     const html = element.innerHTML;
    //     return {
    //       performers: html.split("@")[0],
    //       venue: html.split("@")[1],
    //     };
    //   },
    // },
  },
  {
    url: "http://playinpossum.org/",
    selectors: {
      block: "p.show",
      // date: "b",
      url: "a",
    },
    // parser: {
    //   handler: (element: Element) => {
    //     const html = element.innerHTML;
    //     const dateHTML = element.querySelector('b')?.innerHTML
    //     const date = dateHTML ? new Date(dateHTML + new Date().getFullYear()) : dateHTML
    //     const [performers, venue, time] = html.split("\n")[1].trim().split("–");
    //     return { performers, venue, time, date };
    //   },
    // },
    // performers: /\/\//g,
    // venue: /@/g,
  },
  {
    url: "https://www.bowerbird.org/events/",
    selectors: {
      block: "article.status-publish",
      date: "div.list_event_date_bbrd",
      venue: "div.list_venue_name",
      url: "a",
      // parser: {
      //   source: "div.list_event_title_bbrd",
      //   handler: (element: Element) => {
      //     const sibling = element.parentElement?.querySelector(
      //       "div.list_event_subtitle_bbrd"
      //     );
      //     return { performers: element.innerHTML + sibling?.innerHTML || "" };
      //   },
      // },
    },
  },
];

// https://phillymetal.net/
// react app
// Strategy: Select and separate
// main > h4: date
// .App > main > div > a: show info for separation
/* separators: {
  band: '//',
  venue: '@'
}
*/

// http://playinpossum.org/
// p.show > b: date
// p.show [text]: info
// p.show a: link
/* separators: {
  band: ',',
  venue: '–',
  time?: '–',
  link: '♣'
}
*/

// https://www.bowerbird.org/events/
// article.status-publish
//    div.list_event_title_bbrd, div.list_event_subtitle_bbrd
//    div.list_event_date_bbrd
//    div.list_venue_name
