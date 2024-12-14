<template>
  <div :class="focussed ? 'modal box' : ''">
    <div class="form-group">
      <input
        id="search"
        @keydown="handleKeydown"
        @blur="eventuallyUnfocus"
        @focus="focussed = true"
        :class="focussed ? 'w-full' : ''"
        type="text"
        v-model="query"
        placeholder="Search all tasks..."
      />
    </div>
    <ul class="stack flow list-none p-0" v-show="focussed">
      <li
        @click="openResult(result.item)"
        class="small pointer px-2 py-[0.5em] my-0 cluster justify-between"
        v-for="(result, index) in results"
        :key="result.item.id"
        :class="selectedIndex === index ? 'bg-muted-light inverse rounded' : ''"
      >
        <span>
          {{ result.item.summary }}
        </span>
        <div class="cluster">
          <CategoryTag
            v-for="category in result.item.categories"
            :key="category"
            :category="category"
          />
        </div>
      </li>
    </ul>
  </div>
</template>
<script setup lang="ts">
import { useFuse } from "@vueuse/integrations/useFuse";
const taskData = inject("taskData") as Ref<Task[]>;
const openFull = inject("openFull") as (task: Task) => void;
const query = ref("");
const focussed = ref(false);
const selectedIndex = ref(0);
const emit = defineEmits(["closePanel"]);

const options = {
  fuseOptions: {
    keys: ["summary", "description"],
    isCaseSensitive: false,
    threshold: 0.7,
  },
  resultLimit: 9,
  matchAllWhenSearchEmpty: false,
};
const { results } = useFuse(query, taskData, options);
const openResult = (task: Task) => {
  const taskWithDates = useTaskDates(task);
  openFull(taskWithDates);
  query.value = "";
};
const eventuallyUnfocus = () => {
  setTimeout(() => {
    focussed.value = false;
    document.querySelector<HTMLInputElement>("input#search")?.blur();
  }, 150);
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "ArrowUp") {
    event.preventDefault();
    selectedIndex.value = Math.max(0, selectedIndex.value - 1);
  } else if (event.key === "ArrowDown") {
    event.preventDefault();
    selectedIndex.value = Math.min(
      results.value.length - 1,
      selectedIndex.value + 1,
    );
  } else if (event.key === "Enter") {
    event.preventDefault();
    openResult(results.value[selectedIndex.value].item);
    eventuallyUnfocus();
  } else if (event.key === "Escape") {
    event.preventDefault();
    eventuallyUnfocus();
  }
};

const focusSearchBox = (e: KeyboardEvent) => {
  const isMac = navigator.userAgent.includes("Macintosh");
  const modifierKey = isMac ? e.metaKey : e.ctrlKey;
  if (modifierKey && e.key === "k") {
    e.preventDefault();
    document.querySelector<HTMLInputElement>("input#search")?.focus();
    // close the task panel if it's open
    emit("closePanel");
  }
};

onMounted(() => {
  document.addEventListener("keydown", focusSearchBox);
});

onUnmounted(() => {
  document.removeEventListener("keydown", focusSearchBox);
});
</script>
