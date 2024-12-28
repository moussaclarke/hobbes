<template>
  <div class="box stack flow">
    <div v-if="successMessage" class="alert bg-success">
      {{ successMessage }}
    </div>
    <div v-if="errorMessage" class="alert bg-error">
      {{ errorMessage }}
    </div>
    <h1>Open an issue</h1>
    <h2 class="large primary">{{ projectName }}</h2>
    <div class="stack flow">
      <p class="medium wide">
        You can send me your feedback, bug reports and feature requests here.
        These will show up under the "Triage" category in the task list, and
        will be used to populate the backlog and to plan future development and
        priorities.
      </p>
      <p class="medium">
        Before opening an issue, please search through the task list and make
        sure it doesn't already exist.
      </p>
      <p class="medium">
        If there is something really critical that needs addressing immediately
        (for example the site is completely down) it's probably better to
        <a href="mailto:moussaclarke@gmail.com">email me</a>
        directly.
      </p>
    </div>
    <form class="stack flow" @submit.prevent="submitForm">
      <div class="grid">
        <div class="form-group">
          <label for="issue-type">Issue Type</label>
          <select
            class="w-full"
            v-model="issueType"
            name="issue-type"
            id="issue-type"
            required
          >
            <option value="bug">
              {{ getTaskTypeEmoji("bug") }} Bug - Something isn't working as
              expected
            </option>
            <option value="change">
              {{ getTaskTypeEmoji("change") }} Change - Something could look,
              feel or work differently
            </option>
            <option value="feature">
              {{ getTaskTypeEmoji("feature") }} Feature - I have an idea for
              something new
            </option>
            <option value="performance">
              {{ getTaskTypeEmoji("performance") }} Performance - The system
              feels slow or unresponsive
            </option>
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
            required
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <small>
            How important do you feel this issue is? But remember the old adage
            - if everything is high priority, then nothing is high priority.
          </small>
        </div>
      </div>
      <div class="form-group">
        <label for="summary">Title *</label>
        <input
          class="w-full"
          type="text"
          v-model="summary"
          name="summary"
          id="summary"
          required
        />
        <small>
          A concise summary of the issue. It's often more useful to try to
          describe the problem that needs solving here, rather than stating a
          specific solution.
        </small>
      </div>
      <div class="form-group">
        <label for="description">Description *</label>
        <textarea
          class="w-full"
          v-model="description"
          name="description"
          id="description"
          required
        ></textarea>
        <small
          v-html="
            'Please describe the issue, considering the following points: ' +
            descriptionHelpText
          "
        ></small>
      </div>
      <div class="form-group">
        <label for="context">Context *</label>
        <textarea
          class="w-full"
          v-model="context"
          name="context"
          id="context"
          required
        ></textarea>
        <small
          v-html="'Please provide some additional context: ' + contextHelpText"
        ></small>
      </div>
      <button :disabled="disabled" class="button" type="submit">
        <span v-if="submitting" class="animate-spin inline-block">↻</span>
        {{ submitting ? "Submitting..." : "Submit" }}
      </button>
    </form>
    <div v-if="successMessage" class="alert bg-success">
      {{ successMessage }}
    </div>
    <div v-if="errorMessage" class="alert bg-error">
      {{ errorMessage }}
    </div>
    <div v-if="warningMessage" class="alert bg-warning">
      <div>
        <p>
          Your issue was not submitted yet. Our AI system detected some
          potential issues:
        </p>
        <blockquote
          class="pl-4 my-2 border-l-4 border-l-solid"
          v-html="formattedWarningMessage"
        ></blockquote>
        <p>
          If you'd like to submit the issue anyway, you can click the "Submit"
          button again.
        </p>
      </div>
    </div>
    <small>
      Tip: If you need to include any screenshots, try
      <a target="_blank" href="https://snipboard.io">snipboard.io</a>. For
      screen recordings, you can upload them to dropbox, google drive or similar
      then paste the link.
    </small>
  </div>
</template>
<script setup lang="ts">
import { micromark } from "micromark";
import { formHelpMaps } from "../utils/formHelpMaps";
import { getTaskTypeEmoji } from "../utils/taskTypes";

const { issueTypeHelpTextMap, descriptionHelpTextMap, contextHelpTextMap } =
  formHelpMaps;

useHead({
  title: "Hobbes | Submit an issue",
});

const issueType = ref("bug");
const priority = ref("low");
const summary = ref("");
const description = ref("");
const context = ref("");
const successMessage = ref("");
const errorMessage = ref("");
const aiResponse = ref(null);

const formattedWarningMessage = computed(() => {
  return micromark(warningMessage.value);
});
const warningMessage = ref("");
const disabled = ref(false);
const submitting = ref(false);
const projectName = useRuntimeConfig().public.davCalName;

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
  aiResponse,
});

const submitForm = async () => {
  disabled.value = true;
  submitting.value = true;
  try {
    successMessage.value = "";
    errorMessage.value = "";
    warningMessage.value = "";

    const response = await $fetch("/api/form", {
      method: "POST",
      body: formData,
    });

    submitting.value = false;

    if (!response.success) {
      warningMessage.value = response.message;
      aiResponse.value = response.aiResponse;
      disabled.value = false;

      return;
    }

    summary.value = "";
    description.value = "";
    context.value = "";
    successMessage.value =
      "Issue submitted successfully! You can now submit another if you like.";

    setTimeout(() => {
      successMessage.value = "";
      disabled.value = false;
    }, 6000);
  } catch (error) {
    submitting.value = false;
    errorMessage.value = "Failed to submit the issue. Please try again.";
    console.error("Failed to submit form:", error);

    setTimeout(() => {
      errorMessage.value = "";
      disabled.value = false;
    }, 6000);
  }
};
</script>
