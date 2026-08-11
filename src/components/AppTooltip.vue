<script setup>
import { ref } from 'vue';

defineProps({
  text: { type: String, required: true }
});

const wrapper = ref(null);
const show = ref(false);
const pos = ref({ top: 0, left: 0 });

function onEnter() {
  if (!wrapper.value) return;
  const rect = wrapper.value.getBoundingClientRect();
  pos.value = {
    top: rect.top - 6,
    left: rect.left + rect.width / 2
  };
  show.value = true;
}
function onLeave() {
  show.value = false;
}
</script>

<template>
  <span class="tooltip-wrapper" ref="wrapper" @mouseenter="onEnter" @mouseleave="onLeave">
    <slot />
  </span>
  <Teleport to="body">
    <span
      v-if="show"
      class="tooltip-text"
      :style="{ top: pos.top + 'px', left: pos.left + 'px' }"
    >{{ text }}</span>
  </Teleport>
</template>

<style>
.tooltip-wrapper {
  display: inline-flex;
}

.tooltip-text {
  position: fixed;
  transform: translate(-50%, -100%);
  background: #1a1a1a;
  color: #ffffff;
  font-family: 'Outfit', sans-serif;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 6px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 9999;
  line-height: 1.4;
}

.tooltip-text::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 4px solid transparent;
  border-top-color: #1a1a1a;
}
</style>
