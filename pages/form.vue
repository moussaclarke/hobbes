<template>
  <div class="box stack flow">
    <h1>Open an issue</h1>
    <p>
      You can send me your feedback, bug reports and feature requests here.
      These will show up under the "Triage" category in tasks and will be used
      to populate the backlog and to plan future development and priorities.
      Before opening an issue, please search through the task list and make sure
      it doesn't already exist.
    </p>
    <form class="stack flow">
      <div class="grid">
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
          <small>
            {{ issueTypeHelpText }} <br />If you're not sure about the issue
            type, pick the nearest fit and we can amend it later.
          </small>
        </div>
        <div class="form-group">
          <label for="priority">Priority</label>
          <select
            class="w-full"
            v-model="priority"
            name="priority"
            id="priority"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <small>
            How important do you feel this issue is? But remember the old adage
            - if everything is high priority, then nothing is high priority.<br />
            If there is something really critical that needs addressing
            immediately (for example the site is completely down) it's better to
            email me directly.
          </small>
        </div>
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
          A concise summary of the issue. It's often more useful to try to
          describe the problem that needs solving here, rather than stating a
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
        <small
          v-html="
            'Please describe the issue, considering the following points: ' +
            descriptionHelpText
          "
        ></small>
      </div>
      <div class="form-group">
        <label for="context">Context</label>
        <textarea
          class="w-full"
          v-model="context"
          name="context"
          id="context"
        ></textarea>
        <small
          v-html="'Please provide some additional context: ' + contextHelpText"
        ></small>
      </div>
      <button class="button" type="submit">Submit</button>
    </form>
    <small>
      Tip: If you need to include screenshots, try
      <a href="https://snipboard.io">snipboard</a>. For screen recordings, you
      can upload them to dropbox, google drive or similar.
    </small>
  </div>
</template>
<script setup lang="ts">
import { useFormHelp } from "../composables/useFormHelp";

const { issueTypeHelpTextMap, descriptionHelpTextMap, contextHelpTextMap } =
  useFormHelp();

const issueType = ref("bug");
const priority = ref("low");
const summary = ref("");
const description = ref("");
const context = ref("");

const formatHelpText = (text: string) => {
  const points = text
    .trim()
    .split("\n")
    .filter((line) => line.length > 0)
    .map((line) => `<li>${line.trim()}</li>`)
    .join("");
  return points;
};

const issueTypeHelpText = computed(() => {
  return issueTypeHelpTextMap[issueType.value];
});

const descriptionHelpText = computed(() => {
  return formatHelpText(descriptionHelpTextMap[issueType.value]);
});

const contextHelpText = computed(() => {
  return formatHelpText(contextHelpTextMap[issueType.value]);
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
