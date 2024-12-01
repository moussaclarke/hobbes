<template>
  <div class="box stack flow">
    <h1>Issue Form</h1>
    <p>
      You can send me your feedback, bug reports and feature requests here.
      These will be used to plan future development and priorities.
    </p>
    <form class="stack flow">
      <div class="form-group">
        <label for="issue-type">Issue Type</label>
        <select
          class="w-full"
          v-model="issueType"
          name="issue-type"
          id="issue-type"
        >
          <option value="bug">Bug</option>
          <option value="change">Change Request</option>
          <option value="feature">New Feature</option>
          <option value="performance">Performance Issue</option>
        </select>
        <small>{{ issueTypeHelpText }}</small>
      </div>
      <div class="form-group">
        <label for="priority">Priority</label>
        <select class="w-full" v-model="priority" name="priority" id="priority">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <small>
          How important is this issue? But remember the old adage - if
          everything is high priority, then nothing is high priority.
        </small>
      </div>
      <div class="form-group">
        <label for="summary">Title</label>
        <input
          class="w-full"
          type="text"
          v-model="summary"
          name="summary"
          id="summary"
        />
        <small>
          A concise summary of the issue. Tip: it's often better to try to
          describe the problem that needs solving, rather than stating a
          specific solution.
        </small>
      </div>
      <div class="form-group">
        <label for="description">Description</label>
        <textarea
          class="w-full"
          v-model="description"
          name="description"
          id="description"
        ></textarea>
        <small>Please describe the issue. {{ descriptionHelpText }}</small>
      </div>
      <div class="form-group">
        <label for="context">Context</label>
        <textarea
          class="w-full"
          v-model="context"
          name="context"
          id="context"
        ></textarea>
        <small>
          Please provide some additional context. {{ contextHelpText }}
        </small>
      </div>
      <button class="button" type="submit">Submit</button>
    </form>
  </div>
</template>
<script setup lang="ts">
const issueType = ref("bug");
const priority = ref("low");
const summary = ref("");
const description = ref("");
const context = ref("");

const issueTypeHelpTextMap = {
  bug: `"This isn't working correctly" (e.g. "Nothing happens when I click the submit button")`,
  change: `"It works, but needs to be different" (e.g. "The title text needs to be larger")`,
  feature: `"I need something new added" (e.g. "We need a new widget type, or we need another way to add existing widgets.")`,
  performance: `"Something is slow or unresponsive" (e.g. "The about page takes too long to load")`,
};
const issueTypeHelpText = computed(() => {
  return issueTypeHelpTextMap[issueType.value];
});

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

const descriptionHelpText = computed(() => {
  return descriptionHelpTextMap[issueType.value];
});

const contextHelpTextMap = {
  bug: `
    What device are you using? (e.g. iPhone 13, Windows laptop)
    Which browser? (e.g. Chrome, Safari, Firefox)
    When did you first notice this?
    Include a link to where this is happening, and links to screenshots/recordings if possible.
  `,
  change: `
    Include a link to a relevant page where you would expect this to be changed, as well as links to screenshots/recordings of the existing state if possible.
  `,
  feature: `
    Where would this feature fit within the current system?
    If there is a specific page where you see this feature appearing, please provide a link to it.
  `,
  performance: `
    What device and browser are you using?
    What kind of network are you on? (e.g. WiFi, Fibre, 4G)
    Include a link to where this is happening, and links to screenshots/recordings if applicable.
    Is this happening consistently or at specific times?
  `,
};

const contextHelpText = computed(() => {
  return contextHelpTextMap[issueType.value];
});

const formData = reactive({
  issueType,
  priority,
  summary,
  description,
  context,
});

const submitForm = () => {
  console.log(formData);
};
</script>
