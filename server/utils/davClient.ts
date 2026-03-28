import { md5 } from "@noble/hashes/legacy.js";
import { bytesToHex } from "@noble/hashes/utils.js";
import { XMLParser } from "fast-xml-parser";
import { parseTask } from "~/server/utils/parseTask";

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

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  removeNSPrefix: true, // Simplifies access by removing 'd:' or 'c:' prefixes
});

const md5Hex = (str: string) => bytesToHex(md5(new TextEncoder().encode(str)));

function parseDigestChallenge(header: string): DigestChallenge {
  const getParam = (key: string) => {
    const match = header.match(new RegExp(`${key}=(?:"([^"]+)"|([^,\\s]+))`));
    return match ? match[1] || match[2] : "";
  };

  return {
    realm: getParam("realm") || "",
    nonce: getParam("nonce") || "",
    qop: getParam("qop"),
    opaque: getParam("opaque"),
  };
}

function buildDigestHeader(
  method: string,
  uri: string,
  user: string,
  pass: string,
  challenge: DigestChallenge,
): string {
  const cnonce = Math.random().toString(36).slice(2, 10);
  const nc = "00000001";
  const ha1 = md5Hex(`${user}:${challenge.realm}:${pass}`);
  const ha2 = md5Hex(`${method}:${uri}`);

  const qop = challenge.qop
    ?.split(",")
    .map((q) => q.trim())
    .includes("auth")
    ? "auth"
    : undefined;

  const response = qop
    ? md5Hex(`${ha1}:${challenge.nonce}:${nc}:${cnonce}:${qop}:${ha2}`)
    : md5Hex(`${ha1}:${challenge.nonce}:${ha2}`);

  let h = `Digest username="${user}", realm="${challenge.realm}", nonce="${challenge.nonce}", uri="${uri}", response="${response}"`;
  if (qop) h += `, qop=${qop}, nc=${nc}, cnonce="${cnonce}"`;
  if (challenge.opaque) h += `, opaque="${challenge.opaque}"`;
  return h;
}

let cachedDigest: DigestChallenge | undefined;
let cachedCalendarHref: string | undefined;

export default function davClient() {
  const authHeaders = async (
    method: string,
    url: string,
  ): Promise<Record<string, string>> => {
    const config = useRuntimeConfig();

    if (config.davAuthMethod === "basic") {
      return {
        Authorization:
          "Basic " + btoa(`${config.davUser}:${config.davPassword}`),
      };
    }

    if (!cachedDigest) {
      const probe = await fetch(config.davBase + config.davURI, {
        method: "PROPFIND",
      });
      const wwwAuth = probe.headers.get("www-authenticate");
      if (!wwwAuth)
        throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
      cachedDigest = parseDigestChallenge(wwwAuth);
    }

    return {
      Authorization: buildDigestHeader(
        method,
        new URL(url).pathname,
        config.davUser,
        config.davPassword,
        cachedDigest,
      ),
    };
  };

  const davFetch = async (
    url: string,
    method: string,
    body?: string,
    extra?: Record<string, string>,
  ) => {
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

  const getCalendarHref = async (): Promise<string> => {
    if (cachedCalendarHref) return cachedCalendarHref;

    const config = useRuntimeConfig();
    const base = config.davBase;

    // Step 1: Principal Discovery
    const pRes = await davFetch(
      base + config.davURI,
      "PROPFIND",
      `<d:propfind xmlns:d="DAV:"><d:prop><d:current-user-principal/></d:prop></d:propfind>`,
      { Depth: "0" },
    );
    const pJson = parser.parse(await pRes.text());
    const principalHref =
      pJson.multistatus.response.propstat.prop["current-user-principal"].href;

    // Step 2: Home Set Discovery
    const hRes = await davFetch(
      base + principalHref,
      "PROPFIND",
      `<d:propfind xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav"><d:prop><c:calendar-home-set/></d:prop></d:propfind>`,
      { Depth: "0" },
    );
    const hJson = parser.parse(await hRes.text());
    const homeHref =
      hJson.multistatus.response.propstat.prop["calendar-home-set"].href;

    // Step 3: Calendar Selection
    const cRes = await davFetch(
      base + homeHref,
      "PROPFIND",
      `<d:propfind xmlns:d="DAV:"><d:prop><d:displayname/><d:resourcetype/></d:prop></d:propfind>`,
      { Depth: "1" },
    );
    const cJson = parser.parse(await cRes.text());

    const responses = Array.isArray(cJson.multistatus.response)
      ? cJson.multistatus.response
      : [cJson.multistatus.response];

    for (const r of responses) {
      // Normalise propstat to an array to handle multiple status entries
      const propstats = Array.isArray(r.propstat) ? r.propstat : [r.propstat];

      for (const ps of propstats) {
        const props = ps?.prop;
        if (!props) continue;

        // Check if the property status is 200 OK
        const status = ps.status || "";
        if (status && !status.includes("200")) continue;

        // Ensure resourcetype and displayname match the target calendar
        const isCalendar = props.resourcetype?.calendar !== undefined;
        const isMatch = props.displayname === config.davCalName;

        if (isCalendar && isMatch) {
          cachedCalendarHref = r.href;
          return r.href;
        }
      }
    }
    throw createError({ statusCode: 404, message: "Calendar not found" });
  };

  const report = async (
    calendarHref: string,
    filterXml: string,
  ): Promise<DAVObject[]> => {
    const config = useRuntimeConfig();
    const res = await davFetch(
      config.davBase + calendarHref,
      "REPORT",
      `<c:calendar-query xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav">
      <d:prop><d:getetag/><c:calendar-data/></d:prop>
      <c:filter>${filterXml}</c:filter>
    </c:calendar-query>`,
      { Depth: "1" },
    );

    const json = parser.parse(await res.text());
    const responses = Array.isArray(json.multistatus?.response)
      ? json.multistatus.response
      : json.multistatus?.response
        ? [json.multistatus.response]
        : [];

    const objects: DAVObject[] = [];

    for (const r of responses) {
      const propstats = Array.isArray(r.propstat) ? r.propstat : [r.propstat];
      for (const ps of propstats) {
        const props = ps?.prop;
        if (props?.["calendar-data"]) {
          objects.push({
            url: config.davBase + r.href,
            data: props["calendar-data"],
            etag: props.getetag?.replace(/"/g, ""),
          });
          break; // Found the data for this response
        }
      }
    }

    return objects;
  };
  return {
    getTasks: async () => {
      const href = await getCalendarHref();
      const tasks = await report(
        href,
        `<c:comp-filter name="VCALENDAR"><c:comp-filter name="VTODO"/></c:comp-filter>`,
      );
      return tasks.filter((t) => !parseTask(t).categories?.includes("private"));
    },
    getTask: async (uid: string) => {
      const href = await getCalendarHref();
      const tasks = await report(
        href,
        `<c:comp-filter name="VCALENDAR"><c:comp-filter name="VTODO">
          <c:prop-filter name="UID"><c:text-match>${uid}</c:text-match></c:prop-filter>
        </c:comp-filter></c:comp-filter>`,
      );
      if (!tasks.length)
        throw createError({ statusCode: 404, message: "Not found" });
      return tasks[0];
    },
    createTask: async (vtodo: string, filename: string) => {
      const config = useRuntimeConfig();
      const url = config.davBase + (await getCalendarHref()) + filename;
      const auth = await authHeaders("PUT", url);
      return fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "text/calendar; charset=utf-8", ...auth },
        body: vtodo,
      });
    },
    updateTask: async (task: DAVObject) => {
      const auth = await authHeaders("PUT", task.url);
      const headers: Record<string, string> = {
        "Content-Type": "text/calendar; charset=utf-8",
        ...auth,
      };
      if (task.etag) headers["If-Match"] = `"${task.etag}"`;
      return fetch(task.url, { method: "PUT", headers, body: task.data });
    },
  };
}
