<template>
  <div :class="focussed ? 'modal box' : ''">
    <div class="form-group">
      <input
        @blur="eventuallyUnfocus"
        @focus="focussed = true"
        :class="focussed ? 'w-full' : ''"
        type="text"
        v-model="query"
        placeholder="Search all tasks..."
      />
    </div>
    <ul class="stack flow list-none" v-show="focussed">
      <li
        @click="openResult(result.item)"
        class="small pointer px-2 py-[0.5em] my-0 cluster justify-between"
        v-for="result in results"
        :key="result.item.id"
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
  }, 150);
};
</script>
