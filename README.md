# Hobbes

A solo dev project management web app, based on CalDAV VTODO.

## Motivation

The use case is for a solo dev to share project status with clients and to receive feedback and issues from them in one place.

I was happily using TickTick, and while it's got some really nice UI features, the API is under-powered and wouldn't allow me to build the specific integration I needed. I also generally prefer using Open Source software and open standards when I can - which led me down the CalDAV rabbit hole...

## Features

The main goals and features are:

- to show a list of tasks and their current status. These are then filterable by status and category.
- to show a more detailed view of a task when you click on it.
- to implement a simple custom commenting system for tasks, which can still be used in external CalDAV clients.
- to allow clients to add new issues for triage.
- to be essentially free to host on Cloudflare pages/workers.

I do the actual task management and editing via [Thunderbird](https://www.thunderbird.net/) on my desktop, and [Tasks.org](https://tasks.org/) on my phone. I run a [baikal](https://sabre.io/baikal/) server, which is what Hobbes is currently deployed against in my setup, but it should work with other compliant CalDAV servers, like FastMail, Nextcloud or whatever.

You can think of Hobbes as offering an _extremely_ lightweight subset of monday.com or Github Issues features on top of CalDAV.

### Non-Goals

Some non-goals are:

- to be a full-featured CalDAV task client/editor. Editing tasks happens in Thunderbird, Tasks.org or whatever you prefer.
- to be a full-featured project management tool - this isn't trying to be a monday.com or Jira replacement. Try [plane](https://plane.so) if you want a full fat Open Source project management tool.
- to support non-compliant big tech CalDAV implementations like Yahoo, Apple or Google. Ain't nobody got time for that - CalDAV is complex enough as it is.
- to need any kind of local database - all task data should live on the remote CalDAV server.
- to support alternative task UI paradigms/views like Kanban boards or GANTT charts. Just a simple grid/list of tasks.

## Setup

Before you get started, you'll need a working CalDAV server. I use [baikal](https://sabre.io/baikal/) for this.

```bash
cp .env.example .env
# fill in .env
ni install
nr dev
```

## Build

```bash
nr build

# under the hood this runs
nlx nuxi build --dot-env .env.example && nr scripts/post-build.ts
```

This uses `.env.example` on purpose, so that private variables are not leaked into the production build. See below for how to set up the env vars.

The build process includes an automated post-build script that processes `dist/_worker.js/chunks/_/davClient.mjs` to find and replace `n.fetch` with `fetch`. This is because nitro overwrites all instances of  the `fetch` function in the `tsdav` library with a non-existent custom one during build for some unknown reason 🤷‍♂️

## Deploy to Cloudflare Pages

```bash
nlx wrangler pages deploy dist
```

The env vars will need to be set up manually in the cloudflare dashboard. They keys need to be prefixed with "NUXT_" for them to be picked up as runtime env vars.

The app also needs to be secured behind Cloudflare Access - it relies on cookie headers set by Cloudflare Access to get the email of the currently authenticated user.

## Todo

- Support multiple projects
- Support multiple client user sets and project permissions
- UI/UX improvements
- Refactor, particularly CalDAV object parsing/handling
- Performance improvements
- Test all the things
- Additional documentation, particularly the comment syntax

## License

MIT
