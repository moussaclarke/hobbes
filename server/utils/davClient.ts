import { parseTask } from "~/server/utils/parseTask";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DAVObject {
  data: string;
  url: string;
  etag?: string;
}

interface DigestChallenge {
  realm: string;
  nonce: string;
  qop?: string;
  opaque?: string;
}

// ── Pure-JS MD5 (no Node crypto needed) ──────────────────────────────────────
// Required for Digest auth — crypto.subtle doesn't support MD5 in Workers.

function md5(str: string): string {
  function safeAdd(x: number, y: number): number {
    const lsw = (x & 0xffff) + (y & 0xffff);
    return ((x >> 16) + (y >> 16) + (lsw >> 16)) << 16 | (lsw & 0xffff);
  }
  function rol(n: number, b: number): number {
    return (n << b) | (n >>> (32 - b));
  }
  function cmn(q: number, a: number, b: number, x: number, s: number, t: number): number {
    return safeAdd(rol(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
  }
  function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cmn((b & c) | (~b & d), a, b, x, s, t); }
  function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cmn((b & d) | (c & ~d), a, b, x, s, t); }
  function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cmn(b ^ c ^ d, a, b, x, s, t); }
  function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cmn(c ^ (b | ~d), a, b, x, s, t); }

  const bytes = new TextEncoder().encode(str);
  const nBytes = bytes.length;
  const nWords = (((nBytes + 8) >>> 6) + 1) << 4;
  const M: number[] = new Array(nWords).fill(0);
  for (let i = 0; i < nBytes; i++) M[i >> 2] |= bytes[i] << ((i % 4) * 8);
  M[nBytes >> 2] |= 0x80 << ((nBytes % 4) * 8);
  M[nWords - 2] = nBytes * 8;

  let a = 1732584193, b = -271733879, c = -1732584194, d = 271733878;

  for (let i = 0; i < nWords; i += 16) {
    const [aa, bb, cc, dd] = [a, b, c, d];

    a=ff(a,b,c,d,M[i+0],7,-680876936);   d=ff(d,a,b,c,M[i+1],12,-389564586);
    c=ff(c,d,a,b,M[i+2],17,606105819);   b=ff(b,c,d,a,M[i+3],22,-1044525330);
    a=ff(a,b,c,d,M[i+4],7,-176418897);   d=ff(d,a,b,c,M[i+5],12,1200080426);
    c=ff(c,d,a,b,M[i+6],17,-1473231341); b=ff(b,c,d,a,M[i+7],22,-45705983);
    a=ff(a,b,c,d,M[i+8],7,1770035416);   d=ff(d,a,b,c,M[i+9],12,-1958414417);
    c=ff(c,d,a,b,M[i+10],17,-42063);     b=ff(b,c,d,a,M[i+11],22,-1990404162);
    a=ff(a,b,c,d,M[i+12],7,1804603682);  d=ff(d,a,b,c,M[i+13],12,-40341101);
    c=ff(c,d,a,b,M[i+14],17,-1502002290);b=ff(b,c,d,a,M[i+15],22,1236535329);

    a=gg(a,b,c,d,M[i+1],5,-165796510);   d=gg(d,a,b,c,M[i+6],9,-1069501632);
    c=gg(c,d,a,b,M[i+11],14,643717713);  b=gg(b,c,d,a,M[i+0],20,-373897302);
    a=gg(a,b,c,d,M[i+5],5,-701558691);   d=gg(d,a,b,c,M[i+10],9,38016083);
    c=gg(c,d,a,b,M[i+15],14,-660478335); b=gg(b,c,d,a,M[i+4],20,-405537848);
    a=gg(a,b,c,d,M[i+9],5,568446438);    d=gg(d,a,b,c,M[i+14],9,-1019803690);
    c=gg(c,d,a,b,M[i+3],14,-187363961);  b=gg(b,c,d,a,M[i+8],20,1163531501);
    a=gg(a,b,c,d,M[i+13],5,-1444681467); d=gg(d,a,b,c,M[i+2],9,-51403784);
    c=gg(c,d,a,b,M[i+7],14,1735328473);  b=gg(b,c,d,a,M[i+12],20,-1926607734);

    a=hh(a,b,c,d,M[i+5],4,-378558);      d=hh(d,a,b,c,M[i+8],11,-2022574463);
    c=hh(c,d,a,b,M[i+11],16,1839030562); b=hh(b,c,d,a,M[i+14],23,-35309556);
    a=hh(a,b,c,d,M[i+1],4,-1530992060);  d=hh(d,a,b,c,M[i+4],11,1272893353);
    c=hh(c,d,a,b,M[i+7],16,-155497632);  b=hh(b,c,d,a,M[i+10],23,-1094730640);
    a=hh(a,b,c,d,M[i+13],4,681279174);   d=hh(d,a,b,c,M[i+0],11,-358537222);
    c=hh(c,d,a,b,M[i+3],16,-722521979);  b=hh(b,c,d,a,M[i+6],23,76029189);
    a=hh(a,b,c,d,M[i+9],4,-640364487);   d=hh(d,a,b,c,M[i+12],11,-421815835);
    c=hh(c,d,a,b,M[i+15],16,530742520);  b=hh(b,c,d,a,M[i+2],23,-995338651);

    a=ii(a,b,c,d,M[i+0],6,-198630844);   d=ii(d,a,b,c,M[i+7],10,1126891415);
    c=ii(c,d,a,b,M[i+14],15,-1416354905);b=ii(b,c,d,a,M[i+5],21,-57434055);
    a=ii(a,b,c,d,M[i+12],6,1700485571);  d=ii(d,a,b,c,M[i+3],10,-1894986606);
    c=ii(c,d,a,b,M[i+10],15,-1051523);   b=ii(b,c,d,a,M[i+1],21,-2054922799);
    a=ii(a,b,c,d,M[i+8],6,1873313359);   d=ii(d,a,b,c,M[i+15],10,-30611744);
    c=ii(c,d,a,b,M[i+6],15,-1560198380); b=ii(b,c,d,a,M[i+13],21,1309151649);
    a=ii(a,b,c,d,M[i+4],6,-145523070);   d=ii(d,a,b,c,M[i+11],10,-1120210379);
    c=ii(c,d,a,b,M[i+2],15,718787259);   b=ii(b,c,d,a,M[i+9],21,-343485551);

    a=safeAdd(a,aa); b=safeAdd(b,bb); c=safeAdd(c,cc); d=safeAdd(d,dd);
  }

  const toHex = (n: number) =>
    [0, 1, 2, 3].map((j) => ("0" + ((n >>> (j * 8)) & 0xff).toString(16)).slice(-2)).join("");
  return toHex(a) + toHex(b) + toHex(c) + toHex(d);
}

// ── Digest auth helpers ───────────────────────────────────────────────────────

function parseDigestChallenge(header: string): DigestChallenge {
  const q = (key: string) => header.match(new RegExp(`${key}="([^"]+)"`))?.[1];
  const uq = (key: string) => header.match(new RegExp(`\\b${key}=([^,\\s"]+)`))?.[1];
  return {
    realm: q("realm") ?? "",
    nonce: q("nonce") ?? "",
    qop: q("qop") ?? uq("qop"),
    opaque: q("opaque"),
  };
}

function buildDigestHeader(
  method: string,
  uri: string,
  user: string,
  pass: string,
  challenge: DigestChallenge
): string {
  const cnonce = Math.random().toString(36).slice(2, 10);
  const nc = "00000001";
  const ha1 = md5(`${user}:${challenge.realm}:${pass}`);
  const ha2 = md5(`${method}:${uri}`);
  // Normalise qop — servers sometimes send "auth,auth-int"; we only support auth
  const qop = challenge.qop?.split(",").map((q) => q.trim()).includes("auth")
    ? "auth"
    : undefined;
  const response = qop
    ? md5(`${ha1}:${challenge.nonce}:${nc}:${cnonce}:${qop}:${ha2}`)
    : md5(`${ha1}:${challenge.nonce}:${ha2}`);

  let h = `Digest username="${user}", realm="${challenge.realm}", nonce="${challenge.nonce}", uri="${uri}", response="${response}"`;
  if (qop) h += `, qop=${qop}, nc=${nc}, cnonce="${cnonce}"`;
  if (challenge.opaque) h += `, opaque="${challenge.opaque}"`;
  return h;
}

// ── Regex-based XML helpers ───────────────────────────────────────────────────
// DOMParser XML support is inconsistent across Workers versions; regex is safer
// for the predictable CalDAV multistatus shapes we need to parse here.

/** Returns the text content of the first matching element (any namespace prefix). */
function xmlText(xml: string, localName: string): string | null {
  const re = new RegExp(
    `<(?:[a-zA-Z]+:)?${localName}(?:\\s[^>]*)?>([\\s\\S]*?)</(?:[a-zA-Z]+:)?${localName}>`,
    "i"
  );
  return xml.match(re)?.[1]?.trim() ?? null;
}

/** True if the XML contains a self-closing or open/close tag with this local name. */
function xmlHasTag(xml: string, localName: string): boolean {
  return new RegExp(
    `<(?:[a-zA-Z]+:)?${localName}(?:\\s[^>]*)?(?:/>|>)`,
    "i"
  ).test(xml);
}

/** Splits a multistatus body into individual <response> blocks. */
function xmlResponses(xml: string): string[] {
  const results: string[] = [];
  const re = /<(?:[a-zA-Z]+:)?response(?:\s[^>]*)?>[\s\S]*?<\/(?:[a-zA-Z]+:)?response>/gi;
  for (const m of xml.matchAll(re)) results.push(m[0]);
  return results;
}

// ── Module-level cache ────────────────────────────────────────────────────────
// Workers can reuse isolates across requests — caching avoids redundant round-trips.

let cachedDigest: DigestChallenge | undefined;
let cachedCalendarHref: string | undefined;

// ── davClient ─────────────────────────────────────────────────────────────────

export default function davClient() {
  /** Returns auth headers for the given method + full URL. */
  const authHeaders = async (
    method: string,
    url: string
  ): Promise<Record<string, string>> => {
    const config = useRuntimeConfig();

    if (config.davAuthMethod === "basic") {
      return {
        Authorization: "Basic " + btoa(`${config.davUser}:${config.davPassword}`),
      };
    }

    // Digest: probe for challenge once, then cache it.
    if (!cachedDigest) {
      const probe = await fetch(config.davBase + config.davURI, {
        method: "PROPFIND",
      });
      const wwwAuth = probe.headers.get("www-authenticate");
      if (!wwwAuth) {
        throw createError({ statusCode: 401, statusMessage: "Unauthorized — no WWW-Authenticate header" });
      }
      cachedDigest = parseDigestChallenge(wwwAuth);
    }

    const uri = new URL(url).pathname;
    return {
      Authorization: buildDigestHeader(
        method,
        uri,
        config.davUser,
        config.davPassword,
        cachedDigest
      ),
    };
  };

  /** Thin fetch wrapper that injects auth + XML content-type. */
  const davFetch = async (
    url: string,
    method: string,
    body?: string,
    extra?: Record<string, string>
  ): Promise<Response> => {
    const auth = await authHeaders(method, url);
    return fetch(url, {
      method,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        ...auth,
        ...extra,
      },
      body,
    });
  };

  /**
   * PROPFIND the principal URL and return the href of the calendar whose
   * displayName matches config.davCalName.
   */
  const getCalendarHref = async (): Promise<string> => {
    if (cachedCalendarHref) return cachedCalendarHref;

    const config = useRuntimeConfig();
    const url = config.davBase + config.davURI;

    const res = await davFetch(
      url,
      "PROPFIND",
      `<?xml version="1.0" encoding="UTF-8"?>
<d:propfind xmlns:d="DAV:" xmlns:cal="urn:ietf:params:xml:ns:caldav">
  <d:prop>
    <d:displayname/>
    <d:resourcetype/>
  </d:prop>
</d:propfind>`,
      { Depth: "1" }
    );

    const text = await res.text();

    for (const block of xmlResponses(text)) {
      // resourcetype must contain a <cal:calendar> element
      const resourceType = xmlText(block, "resourcetype") ?? "";
      if (!xmlHasTag(resourceType, "calendar")) continue;

      const displayName = xmlText(block, "displayname");
      if (displayName === config.davCalName) {
        const href = xmlText(block, "href");
        if (href) {
          cachedCalendarHref = href;
          return href;
        }
      }
    }

    throw createError({ statusCode: 404, message: "Calendar not found" });
  };

  /**
   * REPORT against a calendar href with the given CalDAV filter XML.
   * Returns parsed DAVObjects.
   */
  const report = async (
    calendarHref: string,
    filterXml: string
  ): Promise<DAVObject[]> => {
    const config = useRuntimeConfig();
    const url = config.davBase + calendarHref;

    const res = await davFetch(
      url,
      "REPORT",
      `<?xml version="1.0" encoding="UTF-8"?>
<c:calendar-query xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav">
  <d:prop>
    <d:getetag/>
    <c:calendar-data/>
  </d:prop>
  <c:filter>
    ${filterXml}
  </c:filter>
</c:calendar-query>`,
      { Depth: "1" }
    );

    const text = await res.text();
    const objects: DAVObject[] = [];

    for (const block of xmlResponses(text)) {
      const href = xmlText(block, "href") ?? "";
      const data = xmlText(block, "calendar-data") ?? "";
      const etag = xmlText(block, "getetag")?.replace(/"/g, "");
      if (data) objects.push({ url: config.davBase + href, data, etag });
    }

    return objects;
  };

  // ── Public API (same shape as the original tsdav-backed client) ─────────────

  const getTasks = async (): Promise<DAVObject[]> => {
    const calendarHref = await getCalendarHref();
    const tasks = await report(
      calendarHref,
      `<c:comp-filter name="VCALENDAR">
  <c:comp-filter name="VTODO">
    <c:prop-filter name="CATEGORIES">
      <c:text-match negate-condition="yes">private</c:text-match>
    </c:prop-filter>
  </c:comp-filter>
</c:comp-filter>`
    );
    // Secondary JS-side filter in case the server ignores the prop-filter
    return tasks.filter((t) => !parseTask(t).categories?.includes("private"));
  };

  const getTask = async (uid: string): Promise<DAVObject> => {
    const calendarHref = await getCalendarHref();
    const tasks = await report(
      calendarHref,
      `<c:comp-filter name="VCALENDAR">
  <c:comp-filter name="VTODO">
    <c:prop-filter name="UID">
      <c:text-match>${uid}</c:text-match>
    </c:prop-filter>
  </c:comp-filter>
</c:comp-filter>`
    );
    if (tasks.length === 0) {
      throw createError({ statusCode: 404, message: "Task not found" });
    }
    return tasks[0];
  };

  const createTask = async (vtodo: string, filename: string): Promise<Response> => {
    const config = useRuntimeConfig();
    const calendarHref = await getCalendarHref();
    const url = config.davBase + calendarHref + filename;
    const auth = await authHeaders("PUT", url);
    return fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "text/calendar; charset=utf-8", ...auth },
      body: vtodo,
    });
  };

  const updateTask = async (task: DAVObject): Promise<Response> => {
    const auth = await authHeaders("PUT", task.url);
    const headers: Record<string, string> = {
      "Content-Type": "text/calendar; charset=utf-8",
      ...auth,
    };
    if (task.etag) headers["If-Match"] = `"${task.etag}"`;
    return fetch(task.url, { method: "PUT", headers, body: task.data });
  };

  return { getTasks, getTask, createTask, updateTask };
}
