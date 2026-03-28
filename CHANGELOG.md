## [0.3.1] - 2026-03-28

### 📚 Documentation

- Update changelog

### ⚙️ Miscellaneous Tasks

- Ai binding
## [0.3.0] - 2026-03-28

### 🐛 Bug Fixes

- Do caldav service discovery

### 🚜 Refactor

- Reimplement davclient without all the boilerplate

### 📚 Documentation

- Add changelog
- Update readme
- Update readme
- Update readme and add wrangler.toml.example

### ⚙️ Miscellaneous Tasks

- Update versions and setting
- Try rewriting davclient
- Make data a bit more resilient to errors
- Update build and dev cmds
- Remove the redundant post build step and update readme accordingly
## [0.2.0] - 2026-03-25

### 📚 Documentation

- Update readme
- Update readme with capitalisation spec
- Update readme
- Update readme

### ⚙️ Miscellaneous Tasks

- Change to gpl
- Upgrade all the things
## [0.1.6] - 2025-03-12

### 🚀 Features

- Handle "private" category

### 📚 Documentation

- Documentation tweaks

### ⚙️ Miscellaneous Tasks

- Additional server side filter for private
## [0.1.5] - 2025-03-12

### 🚀 Features

- Filter out tasks without a category

### 📚 Documentation

- Document private/no category tasks
## [0.1.4] - 2025-02-02

### 🚜 Refactor

- Remove more unused styles

### ⚙️ Miscellaneous Tasks

- Update deps
## [0.1.3] - 2025-02-01

### 🚀 Features

- Show priority
- Friendlier priority display

### 🚜 Refactor

- Tidy up unused scss

### 📚 Documentation

- Add screenshots
## [0.1.2] - 2025-01-10

### 🐛 Bug Fixes

- Notification email in frontend

### 📚 Documentation

- Readme tweaks
- Update readme
- Update readme
- Update readme
- Update readme

### ⚙️ Miscellaneous Tasks

- Add logo to readme
- Disable all the fields not just button
## [0.1.1] - 2025-01-04

### ⚙️ Miscellaneous Tasks

- Use configured email in form
## [0.1.0] - 2025-01-04

### 🚀 Features

- Fetch backlog tasks poc
- Implement digest
- Parse todo objects
- Task list poc
- Category badges
- Filter by status poc
- Filter by categories
- Better status labels
- Issue form poc
- Submit issue to dav poc
- Submit button
- Required fields
- Success and error messages
- First pass at email notification
- Add organizer/email to tasks
- Show the organizer in the card
- Automate post build step
- Basic markdown
- Side panel
- Add comment ui
- Submit comments
- Disable submit during submission
- Update parent tasks
- Update up the chain
- Page titles
- Search
- Search box keyboard controls
- Ctrl k behaviour
- Keyboard controls for panel
- Comment counter
- Add a showing count
- Llm validation

### 🐛 Bug Fixes

- Handle multi line categories
- Handle ALTREP edge case
- UserEmail value
- Move auth to middleware
- Try getting the cookie server side instead
- Reactive task meta
- Comment messing up order

### 🚜 Refactor

- Move auth/client into util module
- Extract out getTodos
- Rename tasks
- Move server utils
- Extract out the form help consts
- Rename tasks endpoint
- Get user on the server without exposing to client
- Rename description renderer
- Task comment component
- Lets call it a panel
- Extract task meta
- Proper comment form ele
- Extract event to task
- Rename forme event to task
- Sort out sass deprecations
- Simplify formhelpmaps
- Utils not composables
- Remove unused v padding style
- Remove pointless indirection

### 📚 Documentation

- How to build and deploy
- Update readme
- Update readme
- Fix comment
- Update readme
- Update readme
- Additional non goal
- Update readme
- Readme
- Comment syntax
- Update readme
- Update readme and example env
- Update readme

### 🎨 Styling

- Basic styling
- Page calss
- Better buttons
- Metadata block
- Fix mobile width
- Nav footer container
- Label colours
- Update favicon
- Render line breaks
- Add explicit new line between desc and cont
- Smaller heading sizes
- Users and comment bg
- Disallow big headings in other path
- Gap for scrollbar
- Mobile search tweaks
- More search tweaks
- Selected buttons and badges
- Selected style tweak
- Tweak selected
- Blockquote
- Blockquote

### ⚙️ Miscellaneous Tasks

- Add testing framework
- Add commit lint
- Set up styling tools
- Add tsdav dependency
- Remove redundant code
- Type taskstatus
- Wrap long words
- Needs action label
- Cloudflare rendering presets
- Update the form
- Update help text
- Update form help text
- Default to todo tasks not all
- Update wording
- Email configuration
- Access initauth in form
- Add organizer to task object
- Add project name to form
- Try less escaping
- Stop leaking secrets into build!
- Disallow h1
- Implement comment parser
- Format description and context submission
- Null handling in task meta
- Explicit post endpoints
- Empty comment on submit
- Meta wording
- Hobbes logo
- Logo to footer
- Dont set default status
- Type logos in form
- Whole email as username for clarity
- Make project name the calendar name
- Update title with hobbes
- Add type emojis to tasks
- Add maintenance emoji
- Search box closes panel if open
- Listen for close panel on searchbox
- Remove comments from truncated content
- Update deps
- Subtle prompt change
- Submitting animation
- Extract out the project description
- Update deps
- Update happy dom
- Add license
