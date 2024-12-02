const issueTypeHelpTextMap = {
  bug: `"This isn't working correctly" (e.g. "Nothing happens when I click the submit button")`,
  change: `"It works, but needs to be different" (e.g. "The title text needs to be larger")`,
  feature: `"I need something new added" (e.g. "We need a new widget type", or "we need a new way to edit widgets.")`,
  performance: `"Something is slow or unresponsive" (e.g. "The about page takes too long to load")`,
};

const descriptionHelpTextMap = {
  bug: `
    What's happening?
    What did you expect to happen?
    Include steps to reproduce.
  `,
  change: `
    What currently exists?
    Why isn't this working for you?
    What do you think would work better?
  `,
  feature: `
    What problem are you trying to solve?
    How do you handle this currently?
    Who would use this feature and why?
    Any examples from other sites/apps?
  `,
  performance: `
    What feels slow or unresponsive?
    When does this happen?
    How long does it typically take?
  `,
};

const contextHelpTextMap = {
  bug: `
    What device are you using? (e.g. iPhone 13, Windows laptop)
    Which browser? (e.g. Chrome, Safari, Firefox)
    When did you first notice this?
    Include a link to where this is happening, and links to screenshots/recordings if possible.
  `,
  change: `
    Include a link to a relevant page where you would expect this to be changed
    As well as links to screenshots/recordings of the existing state if possible.
  `,
  feature: `
    Where would this feature fit within the current system?
    If there is a specific page where you see this feature appearing, please provide a link to it.
  `,
  performance: `
    What device and browser are you using?
    What kind of network are you on? (e.g. WiFi, Fibre, 4G)
    Is this happening consistently or at specific times?
    Include a link to where this is happening, and links to screenshots/recordings if applicable.
  `,
};

export function useFormHelp() {
  return {
  issueTypeHelpTextMap,
  descriptionHelpTextMap,
  contextHelpTextMap,
  };
};
