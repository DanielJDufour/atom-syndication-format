const fs = require("fs");
const test = require("flug");
const atom = require("./index.js");

const musings = fs.readFileSync("./data/musings.xml", "utf-8");
const ongoing = fs.readFileSync("./data/ongoing.atom", "utf-8");
const wikipedia = fs.readFileSync("./data/wikipedia-example.xml", "utf-8");
const georss = fs.readFileSync("./data/wikipedia-georss.xml", "utf-8");

test("ongoing", ({ eq }) => {
  eq(atom.findFeedTitle(ongoing), "ongoing by Tim Bray");
  eq(atom.findFeedId(ongoing), "https://www.tbray.org/ongoing/");
  eq(atom.findFeedLogo(ongoing), "rsslogo.jpg");
  eq(atom.findFeedIcon(ongoing), "/favicon.ico");
  eq(atom.findFeedSubtitle(ongoing), "ongoing fragmented essay by Tim Bray");
  eq(
    atom.findFeedRights(ongoing),
    "All content written by Tim Bray and photos by Tim Bray Copyright Tim Bray, some rights reserved, see /ongoing/misc/Copyright"
  );
  eq(atom.findFeedUpdated(ongoing, { raw: true }), "2023-04-01T16:11:02-07:00");
  eq(atom.findFeedUpdated(ongoing), new Date("2023-04-01T16:11:02-07:00"));
  eq(atom.findFeedAuthor(ongoing), { name: "Tim Bray" });
  eq(atom.findFeedLinks(ongoing), [
    { href: "http://pubsubhubbub.appspot.com/", rel: "hub" },
    { href: "https://www.tbray.org/ongoing/" },
    { href: "https://www.tbray.org/ongoing/ongoing.atom", rel: "self" },
    {
      href: "https://www.tbray.org/ongoing/comments.atom",
      rel: "replies",
      "thr:count": "101"
    }
  ]);

  const entries = atom.findEntries(ongoing);
  eq(entries.length, 20);

  const entry = entries[0];
  eq(atom.findEntryTitle(entry), "Sober Carpenter");
  eq(atom.findEntryId(entry), "https://www.tbray.org/ongoing/When/202x/2023/03/28/Sober-Carpenter");
  eq(atom.findEntryUpdated(entry, { raw: true }), "2023-03-29T16:07:10-07:00");
  eq(atom.findEntryUpdated(entry), new Date("2023-03-29T16:07:10-07:00"));
  eq(atom.findEntryPublished(entry, { raw: true }), "2023-03-28T12:00:00-07:00");
  eq(atom.findEntryPublished(entry), new Date("2023-03-28T12:00:00-07:00"));
  eq(atom.findEntryLinks(entry), [
    {
      href: "https://www.tbray.org/ongoing/When/202x/2023/03/28/Sober-Carpenter"
    },
    {
      href: "/ongoing/When/202x/2023/03/28/Sober-Carpenter#comments",
      rel: "replies",
      "thr:count": "3",
      type: "application/xhtml+xml"
    }
  ]);
  eq(atom.findEntryCategories(entry), [
    {
      scheme: "https://www.tbray.org/ongoing/What/",
      term: "The World/Food and Drink"
    },
    {
      scheme: "https://www.tbray.org/ongoing/What/",
      term: "The World"
    },
    {
      scheme: "https://www.tbray.org/ongoing/What/",
      term: "Food and Drink"
    }
  ]);
  eq(atom.findEntrySummary(entry), {
    summary:
      "<div xmlns='http://www.w3.org/1999/xhtml'>I was drinking an glass of excellent     <a href='https://sobercarpenter.com'>Sober Carpenter</a> “West Coast IPA” at lunch when I ran across     <a href='https://www.washingtonpost.com/food/2023/03/28/alcohol-health-nonalcoholic-beer/'>Even moderate drinking is bad for     us. Enter nonalcoholic beer</a> in the <cite>Washington Post</cite>. Drinking less seems to be A Thing just now and I      suppose alt-beverages too, so here’s my experience</div>",
    type: "xhtml"
  });
  const content = atom.findEntryContent(entry);
  eq(content.type, "xhtml");
  eq(content.content.length, 3315);

  const feed = atom.parse(ongoing, { raw: true });
  const filepath = "./data/ongoing.atom.json";
  if (!fs.existsSync(filepath)) {
    fs.writeFileSync(filepath, JSON.stringify(feed, undefined, 2));
  }
  const expected = JSON.parse(fs.readFileSync(filepath, "utf-8"));
  eq(feed, expected);
});

test("wikipedia", ({ eq }) => {
  eq(atom.findFeedTitle(wikipedia), "Example Feed");
  eq(atom.findFeedId(wikipedia), "urn:uuid:60a76c80-d399-11d9-b91C-0003939e0af6");
  eq(atom.findFeedLogo(wikipedia), undefined);
  eq(atom.findFeedIcon(wikipedia), undefined);
  eq(atom.findFeedSubtitle(wikipedia), "A subtitle.");
  eq(atom.findFeedRights(wikipedia), undefined);
  eq(atom.findFeedUpdated(wikipedia, { raw: true }), "2003-12-13T18:30:02Z");
  eq(atom.findFeedUpdated(wikipedia), new Date("2003-12-13T18:30:02Z"));
  eq(atom.findFeedAuthor(wikipedia), {
    name: "John Doe",
    email: "johndoe@example.com"
  });

  const entries = atom.findEntries(wikipedia);
  eq(entries.length, 1);

  const entry = entries[0];
  eq(atom.findEntryTitle(entry), "Atom-Powered Robots Run Amok");
  eq(atom.findEntryId(entry), "urn:uuid:1225c695-cfb8-4ebb-aaaa-80da344efa6a");
  eq(atom.findEntryUpdated(entry, { raw: true }), "2003-12-13T18:30:02Z");
  eq(atom.findEntryUpdated(entry), new Date("2003-12-13T18:30:02Z"));
  eq(atom.findEntryPublished(entry, { raw: true }), "2003-11-09T17:23:02Z");
  eq(atom.findEntryPublished(entry), new Date("2003-11-09T17:23:02Z"));
  eq(atom.findEntryLinks(entry), [
    { href: "http://example.org/2003/12/13/atom03" },
    {
      href: "http://example.org/2003/12/13/atom03.html",
      rel: "alternate",
      type: "text/html"
    },
    { href: "http://example.org/2003/12/13/atom03/edit", rel: "edit" }
  ]);
  eq(atom.findEntryCategories(entry), []);
  eq(atom.findEntrySummary(entry), { summary: "Some text." });
  const content = atom.findEntryContent(entry);
  eq(content.type, "xhtml");
  eq(content.content.length, 90);

  const feed = atom.parse(wikipedia, { raw: true });
  const filepath = "./data/wikipedia-example.xml.json";
  if (!fs.existsSync(filepath)) {
    fs.writeFileSync(filepath, JSON.stringify(feed, undefined, 2));
  }
  const expected = JSON.parse(fs.readFileSync(filepath, "utf-8"));
  eq(feed, expected);
});

test("georss", ({ eq }) => {
  eq(atom.findFeedTitle(georss), "Earthquakes");
  eq(atom.findFeedId(georss), "urn:uuid:60a76c80-d399-11d9-b93C-0003939e0af6");
  eq(atom.findFeedLogo(georss), undefined);
  eq(atom.findFeedIcon(georss), undefined);
  eq(atom.findFeedSubtitle(georss), "International earthquake observation labs");
  eq(atom.findFeedRights(georss), undefined);
  eq(atom.findFeedUpdated(georss, { raw: true }), "2005-12-13T18:30:02Z");
  eq(atom.findFeedUpdated(georss), new Date("2005-12-13T18:30:02Z"));
  eq(atom.findFeedAuthor(georss), {
    name: "Dr. Thaddeus Remor",
    email: "tremor@quakelab.edu"
  });

  const entries = atom.findEntries(georss);
  eq(entries.length, 1);

  const entry = entries[0];
  eq(atom.findEntryTitle(entry), "M 3.2, Mona Passage");
  eq(atom.findEntryId(entry), "urn:uuid:1225c695-cfb8-4ebb-aaaa-80da344efa6a");
  eq(atom.findEntryUpdated(entry, { raw: true }), "2005-08-17T07:02:32Z");
  eq(atom.findEntryUpdated(entry), new Date("2005-08-17T07:02:32Z"));
  eq(atom.findEntryPublished(entry, { raw: true }), undefined);
  eq(atom.findEntryPublished(entry), undefined);
  eq(atom.findEntryLinks(entry), [{ href: "http://example.org/2005/09/09/atom01" }]);
  eq(atom.findEntryCategories(entry), []);
  eq(atom.findEntrySummary(entry), { summary: "We just had a big one." });
  eq(atom.findEntryContent(entry), undefined);

  const feed = atom.parse(georss, { raw: true });
  const filepath = "./data/wikipedia-georss.xml.json";
  if (!fs.existsSync(filepath)) {
    fs.writeFileSync(filepath, JSON.stringify(feed, undefined, 2));
  }
  const expected = JSON.parse(fs.readFileSync(filepath, "utf-8"));
  eq(feed, expected);
});

test("musings", ({ eq }) => {
  eq(atom.findFeedIcon(musings), "https://golem.ph.utexas.edu/~distler/blog/images/favicon.ico");
  eq(atom.findFeedLinks(musings), [
    {
      href: "https://golem.ph.utexas.edu/~distler/blog/",
      rel: "alternate",
      type: "application/xhtml+xml"
    },
    {
      href: "https://golem.ph.utexas.edu/~distler/blog/atom10.xml",
      rel: "self"
    },
    {
      href: "https://golem.ph.utexas.edu/~distler/blog/comments.atom",
      rel: "replies",
      type: "application/atom+xml"
    }
  ]);
  eq(atom.findFeedRights(musings), "Copyright (c) 2023, Jacques Distler");
  eq(atom.findFeedGenerator(musings), { generator: "Movable Type", uri: "http://www.movabletype.org/", version: "3.36" });

  const entries = atom.findEntries(musings);
  eq(entries.length, 15);

  const entry = entries[0];
  eq(atom.findEntryCategories(entry), [{ term: "MathML" }]);
  eq(atom.findEntryUpdated(entry), new Date("2023-02-15T15:12:03Z"));
  eq(atom.findEntryPublished(entry), new Date("2023-02-12T23:02:26-06:00"));
  const content = atom.findEntryContent(entry);
  eq(content.type, "xhtml");
  eq(content["xml:base"], "https://golem.ph.utexas.edu/~distler/blog/archives/003452.html");

  const feed = atom.parse(musings, { raw: true });
  const filepath = "./data/musings.xml.json";
  if (!fs.existsSync(filepath)) {
    fs.writeFileSync(filepath, JSON.stringify(feed, undefined, 2));
  }
  const expected = JSON.parse(fs.readFileSync(filepath, "utf-8"));
  eq(feed, expected);
});
