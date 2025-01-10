![Hobbes Logo](assets/img/logo.svg?raw=true)

# Hobbes

Client collaboration hub for solo devs, based on [CalDAV](https://www.ietf.org/rfc/rfc4791.txt) VTODO.

Showcase task progress and collect client feedback, integrates with your existing CalDAV setup.

Built using [Nuxt 3](https://nuxt.com/), deploys to [Cloudflare Pages](https://pages.cloudflare.com/).

## Motivation

The use case is for a solo dev to share project and task status with clients, and to receive feedback and issues from them in one central platform.

I was happily using TickTick for tasks, and while it's got some really nice UI features, the API is pretty under-powered and wouldn't allow me to build the specific integrations I needed for e.g. issue submissions. I also generally prefer using Open Source software and open standards when I can - which led me down the CalDAV rabbit hole...

## Features

Hobbes is opinionated. The main goals and features are:

- to show a list of tasks and their current status. These are then filterable by status and category.
- to show a more detailed view of a task when you click on it.
- to support markdown in the task description.
- to implement a simple, markdown-compatible custom commenting system for tasks, which is still functional in external CalDAV clients which know nothing about markdown.
- to allow clients to add new issues for triage, and to encourage them to submit useful, actionable issues, leveraging LLMs for inline, subjective feedback.
- to be essentially free to host on Cloudflare pages/workers.

Actual task management and editing can happen via apps such as [Thunderbird](https://www.thunderbird.net/) on desktop, and [Tasks.org](https://tasks.org/) on phones. Hobbes is only tested against a [baikal](https://sabre.io/baikal/) server, but it may work with other compliant CalDAV servers, like Radicale, FastMail, Nextcloud or whatever.

You can think of Hobbes as offering an _extremely_ lightweight subset of monday.com or Github Issues features on top of CalDAV.

### Non-Goals

Some non-goals are:

- to be a full-featured CalDAV task client/editor. Editing tasks happens in Thunderbird, Tasks.org or whatever you prefer.
- to be a full-featured project management tool - this isn't trying to be a monday.com or Jira replacement. Try [plane](https://plane.so) if you want a full fat Open Source project management tool.
- to support non-compliant big tech CalDAV implementations like Yahoo, Apple or Google. Ain't nobody got time for that - CalDAV is complex enough as it is.
- to need any kind of local database - all task data should live on the remote CalDAV server.
- to support alternative task UI paradigms/views like Kanban boards or GANTT charts. Hobbes' view is a simple grid/list of tasks.
- to support other deployment targets. That could change in the future though.

## Setup

Before you get started, you'll need a working CalDAV server. [baikal](https://sabre.io/baikal/) is the recommended option for this. You'll also need a Cloudflare account as well as [bun](https://bun.sh/), [wrangler](https://developers.cloudflare.com/workers/wrangler/) and [@antfu/ni](https://github.com/antfu-collective/ni) installed locally.

```bash
cp .env.example .env
# fill in .env
ni
nr dev
```

## Build

```bash
nr build

# under the hood this runs
nlx nuxi build --dot-env .env.example && nr scripts/post-build.ts
```

This uses `.env.example` on purpose, so that private variables are not leaked into the production build. See below for how to set up the env vars in production.

The build process includes an automated post-build script that processes `dist/_worker.js/chunks/_/davClient.mjs` to find and replace `n.fetch` with `fetch`. This is because nitro overwrites all instances of  the `fetch` function in the `tsdav` library with a non-existent custom one during build. 🤷‍♂️

## Deploy to Cloudflare Pages

```bash
nlx wrangler pages deploy dist
```

Env vars will need to be set up manually in the cloudflare dashboard. The keys need to be prefixed with "NUXT_" for them to be picked up as runtime env vars. `NUXT_DAV_PASSWORD`, `NUXT_DAV_USER` and `NUXT_EMAIL_API_KEY` should be secrets.

The app also needs to be secured behind [Cloudflare Access](https://www.cloudflare.com/en-gb/zero-trust/products/access/) - it relies on cookie headers set by Cloudflare Access to get the email of the currently authenticated user. If you need more than 50 users you'll have to upgrade to a paid Cloudflare Access plan.

It also needs [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/) to provide subjective issue validation and feedback. The "Workers AI" binding needs to be enabled on the project and assigned to the `AI` name.

This could all be in a `wrangler.toml` file, but that's a job for another day.

## Transactional Email Service

I use [resend](https://resend.com/), which has a generous free tier. This is currently the only supported service, however it should be pretty straightforward to handle other services by implementing an appropriate `emailProvider` - have a look at `server/utils/emailProviders/resend.ts`.  PRs welcome.

## Project Prompt

The app uses an llm on Cloudflare Workers AI to validate the quality of client-submitted issues.

The project prompt configuration item tells the llm a bit about the client project when formulating the issue submission feedback. You can also use it to inject any other text into the prompt in case you need to nudge its response further.

You can check out a prompt used on a specific project in `.env.example` - I had to specifically tell it that the project didn't have any concept of plugins or it would consistently hallucinate irrelevant plugin-related feedback.

You can experiment with the [playground](https://playground.ai.cloudflare.com/) a bit to see what comes back. See `server/utils/validateFormWithLLM.ts` to check out the rest of the prompt.

It's currently hardcoded to use the `llama-3.3-70b-instruct-fp8-fast` model which seems to work well enough - we could make this configurable in the future. Cloudflare Workers AI free tier is pretty decent - as of writing, you get 10,000 free tokens per day.

## Comment Syntax

The comment system uses the following syntax:

1. Comments section starts with the title `## Updates`. There MUST be only one of these per task.
2. Comments section ends with another section title `## Foobar`, or the end of the task description.
3. First line of a comment is the user name/email in the format `@username@example.com` followed by optional timestamp in square brackets e.g. `[Wed, 11 Dec 2024 10:06:13 GMT]`.
4. Comment body follows.
5. Comment ends with another comment start, or another section title, or the end of the task description.

You can add comments in any CalDAV client by following the above syntax, and the web app will format them accordingly.

## Todo

- Support multiple projects
- Support multiple client user sets and project permissions
- UI/UX improvements
- Refactor, particularly CalDAV object parsing/handling
- Performance improvements
- Test all the things
- Additional documentation, examples, screenshots etc
- Contributing guidelines

## License

MIT
