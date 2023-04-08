# atom-syndication-format
Parse Atom Syndication Format Feeds in XML

## install
```bash
npm install -S atom-syndication-format
```

## basic usage
```js
import { parse } from "atom-syndication-format";

// example from https://en.wikipedia.org/wiki/Atom_(web_standard)
const xml = `
<?xml version="1.0" encoding="utf-8"?>

<feed xmlns="http://www.w3.org/2005/Atom">

	<title>Example Feed</title>
	<subtitle>A subtitle.</subtitle>
	<link href="http://example.org/feed/" rel="self" />
	<link href="http://example.org/" />
	<id>urn:uuid:60a76c80-d399-11d9-b91C-0003939e0af6</id>
	<updated>2003-12-13T18:30:02Z</updated>
	
	
	<entry>
		<title>Atom-Powered Robots Run Amok</title>
		<link href="http://example.org/2003/12/13/atom03" />
		<link rel="alternate" type="text/html" href="http://example.org/2003/12/13/atom03.html"/>
		<link rel="edit" href="http://example.org/2003/12/13/atom03/edit"/>
		<id>urn:uuid:1225c695-cfb8-4ebb-aaaa-80da344efa6a</id>
        <published>2003-11-09T17:23:02Z</published>
		<updated>2003-12-13T18:30:02Z</updated>
		<summary>Some text.</summary>
		<content type="xhtml">
			<div xmlns="http://www.w3.org/1999/xhtml">
				<p>This is the entry content.</p>
			</div>
		</content>
		<author>
			<name>John Doe</name>
			<email>johndoe@example.com</email>
		</author>
	</entry>

</feed>	
`;

parse(xml);
{
  "id": "urn:uuid:60a76c80-d399-11d9-b91C-0003939e0af6",
  "title": "Example Feed",
  "subtitle": "A subtitle.",
  "updated": 2003-12-13T18:30:02Z,  // JavaScript Date Object
  "author": {
    "name": "John Doe",
    "email": "johndoe@example.com"
  },
  "links": [
    {
      "href": "http://example.org/feed/",
      "rel": "self"
    },
    {
      "href": "http://example.org/"
    }
  ],
  "entries": [
    {
      "xml": "<entry>\n\t\t<title>Atom-Powered Robots Run Amok</title>\n\t\t...", // the raw un-parsed xml for the entry
      "id": "urn:uuid:1225c695-cfb8-4ebb-aaaa-80da344efa6a",
      "title": "Atom-Powered Robots Run Amok",
      "published": 2003-11-09T17:23:02Z, // JavaScript Date Object
      "updated": 2003-12-13T18:30:02Z, // JavaScript Date Object
      "content": {
        "content": "<div xmlns=\"http://www.w3.org/1999/xhtml\">\n\t\t\t\t<p>This is the entry content.</p>\n\t\t\t</div>",
        "type": "xhtml"
      },
      "summary": {
        "summary": "Some text."
      },
      "links": [
        {
          "href": "http://example.org/2003/12/13/atom03"
        },
        {
          "href": "http://example.org/2003/12/13/atom03.html",
          "rel": "alternate",
          "type": "text/html"
        },
        {
          "href": "http://example.org/2003/12/13/atom03/edit",
          "rel": "edit"
        }
      ]
    }
  ]
}
```

### advanced usage
To turn off conversation of dates into JavaScript date objects, pass in `raw: true`.
```js
parse(xml, { raw: true });
```

## references
- https://www.tbray.org/ongoing/ongoing.atom
- https://en.wikipedia.org/wiki/Atom_(web_standard)
- https://en.wikipedia.org/wiki/GeoRSS
- https://validator.w3.org/feed/docs/atom.html