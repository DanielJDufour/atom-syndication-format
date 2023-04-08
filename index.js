const getAttribute = require("xml-utils/get-attribute.js");
const findTagByName = require("xml-utils/find-tag-by-name.js");
const findTagsByName = require("xml-utils/find-tags-by-name.js");
const findTagByPath = require("xml-utils/find-tag-by-path.js");
const findTagsByPath = require("xml-utils/find-tags-by-path.js");

const FEED_TEXT_TAGS = ["icon", "id", "logo", "title", "subtitle", "rights"];
const FEED_DATE_TAGS = ["updated"];
const FEED_PERSON_TAGS = ["author", "contributor"];

const FEED_TAGS = FEED_TEXT_TAGS.concat(FEED_DATE_TAGS).concat(FEED_PERSON_TAGS).concat(["generator", "links"]);

function titlecase(str) {
  return str[0].toUpperCase() + str.substring(1);
}

const getAttributes = function (xml, attributes) {
  const result = {};
  for (let i = 0; i < attributes.length; i++) {
    const key = attributes[i];
    const value = getAttribute(xml, key);
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result;
};

const atom = {};

function findTagText(xml, path, options) {
  const trim = options && options.trim === false ? false : true;
  const tag = findTagByPath(xml, path, { debug: options && options.debug });
  if (tag) {
    let inner = tag.inner;
    if (typeof inner === "string" && trim) inner = inner.trim();
    return inner;
  }
}

function findTagDate(xml, path, options) {
  const trim = options && options.trim === false ? false : true;
  const tag = findTagByPath(xml, path, { debug: options && options.debug });
  if (tag) {
    let inner = tag.inner;
    if (typeof inner === "string" && trim) inner = inner.trim();
    if (options && options.raw === true) {
      return inner;
    } else {
      return new Date(tag.inner);
    }
  }
}

FEED_TEXT_TAGS.forEach(function (tagName) {
  const funcname = "findFeed" + titlecase(tagName);
  atom[funcname] = function (xml, options) {
    return findTagText(xml, ["feed", tagName], options);
  };
});

FEED_DATE_TAGS.forEach(function (tagName) {
  const funcname = "findFeed" + titlecase(tagName);
  atom[funcname] = function (xml, options) {
    return findTagDate(xml, ["feed", tagName], options);
  };
});

// Person: https://validator.w3.org/feed/docs/atom.html#person
FEED_PERSON_TAGS.forEach(function (tagName) {
  atom["findFeed" + titlecase(tagName)] = function (xml) {
    const text = findTagText(xml, ["feed", tagName]);
    if (!text) return;

    const name = findTagText(text, ["name"]);
    if (!name) return;

    const result = { name };

    const email = findTagText(text, ["email"]);
    if (email) result.email = email;

    const uri = findTagText(text, ["uri"]);
    if (uri) result.uri = uri;

    return result;
  };
});

atom.findFeedGenerator = function (entry) {
  const tag = findTagByPath(entry, ["feed", "generator"]);
  if (!tag) return;

  const generator = tag.inner;
  if (!generator) return;

  const result = {
    generator
  };

  Object.assign(result, getAttributes(tag.outer, ["uri", "version"]));

  return result;
};

atom.findFeedLinks = function (xml) {
  const feed = findTagByName(xml, "feed");
  if (!feed) return;
  const top = feed.inner.substring(0, feed.inner.indexOf("entry"));
  const links = findTagsByName(top, "link");
  const results = [];
  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    const href = getAttribute(link.outer, "href", { debug: false });
    if (href) {
      results.push(getAttributes(link.outer, ["href", "rel", "thr:count", "type"]));
    }
  }
  return results;
};

atom.findEntries = function (xml) {
  return findTagsByPath(xml, ["feed", "entry"]).map(function (tag) {
    return tag.outer;
  });
};

["id", "title"].forEach(function (tagName) {
  const funcname = "findEntry" + titlecase(tagName);
  atom[funcname] = function (xml, options) {
    return findTagText(xml, ["entry", tagName], options);
  };
});

["published", "updated"].forEach(function (tagName) {
  const funcname = "findEntry" + titlecase(tagName);
  atom[funcname] = function (xml, options) {
    return findTagDate(xml, ["entry", tagName], options);
  };
});

atom.findEntryCategories = function (entry) {
  const links = findTagsByPath(entry, ["entry", "category"]);
  const results = [];
  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    const href = getAttribute(link.outer, "term", { debug: false });
    if (href) {
      results.push(getAttributes(link.outer, ["scheme", "term"]));
    }
  }
  return results;
};

atom.findEntryLinks = function (entry) {
  const links = findTagsByPath(entry, ["entry", "link"]);
  const results = [];
  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    const href = getAttribute(link.outer, "href", { debug: false });
    if (href) {
      results.push(getAttributes(link.outer, ["href", "rel", "thr:count", "type"]));
    }
  }
  return results;
};

["content", "summary"].forEach(function (tagName) {
  atom["findEntry" + titlecase(tagName)] = function (entry) {
    const tag = findTagByPath(entry, ["entry", tagName]);
    if (!tag) return;
    if (typeof tag.inner !== "string") return;

    const result = {};
    result[tagName] = tag.inner.trim();

    Object.assign(result, getAttributes(tag.outer, ["type", "xml:base"]));

    return result;
  };
});

atom.parse = function parse(xml, options) {
  const result = {};
  FEED_TAGS.forEach(tagName => {
    const value = atom["findFeed" + titlecase(tagName)](xml, options);
    if (value !== undefined) {
      result[tagName] = value;
    }
  });

  result.entries = atom.findEntries(xml).map(entry => {
    const result = {
      xml: entry
    };
    ["id", "title", "published", "updated", "categories", "content", "summary", "links"].forEach(key => {
      const value = atom["findEntry" + titlecase(key)](entry, options);
      if (Array.isArray(value) ? value.length !== 0 : value !== undefined) {
        result[key] = value;
      }
    });
    return result;
  });

  return result;
};

module.exports = atom;
