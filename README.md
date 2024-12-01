# Project Tooling Web App

This is very simple project management web app to present a list of CalDAV tasks and their current status. These are then filterable by status and category. The use case is for a solo dev (me) to share project status with clients. I manage the actual tasks via Thunderbird on my desktop, and Tasks.org on my phone. I run a baikal server which is what this is tested against, but it might work with other CalDAV servers.

## Build

```bash
nlx nuxi build
```

You then have to open `dist/_worker.js/routes/api.backlog.mjs` and manually find and replace `n.fetch` with `fetch`. This is because nitro overwrites all instances of  the `fetch` function in the `tsdav` library with a non-existent custom one during build for some unknown reason 🤷‍♂️

## Deploy to Cloudflare Pages

```bash
nlx wrangler pages deploy dist
```

Env vars  currently need to be set up manually in the cloudflare dashboard. I've secured the app behind cloudflare access.

## Todo

- Client ticket submission form - for inbox/triage
- Pagination (don't load everything at once, will be better for performance)
- Animations/transitions
- Client-friendly UX/shortcuts (e.g view current sprint, view current backlog - while this is all achievable with existing filters, we could probably make it slightly more straightforward)
- Support multiple project calendars
- Support multiple clients - check the authenticated user via [this plugin](https://developers.cloudflare.com/pages/functions/plugins/cloudflare-access/) and implement project level permissions.
