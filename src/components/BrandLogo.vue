<script setup>
defineProps({
  size: {
    type: [Number, String],
    default: 32
  }
});
</script>

<template>
  <span
    class="easymd-brand-logo-container"
    :style="{ width: `${size}px`, height: `${size}px` }"
    aria-hidden="true"
  >
    <svg
      class="logo-svg"
      viewBox="0 0 64 64"
      width="100%"
      height="100%"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="64" height="64" rx="16" fill="#1769D2" />
      <path
        d="M20 10H38L50 22V51C50 53.7614 47.7614 56 45 56H20C17.2386 56 15 53.7614 15 51V15C15 12.2386 17.2386 10 20 10Z"
        fill="white"
      />
      <path d="M38 10V19C38 20.6569 39.3431 22 41 22H50L38 10Z" fill="#B8F2E8" />
      <path
        d="M21 41V28L32 37L43 28V41"
        stroke="#1769D2"
        stroke-width="4"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path d="M23 47H34" stroke="#9ABCEB" stroke-width="2.5" stroke-linecap="round" />
      <rect x="37" y="43.5" width="3" height="7" rx="1.5" fill="#22B8A5" />
    </svg>
  </span>
</template>

<style scoped>
.easymd-brand-logo-container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  user-select: none;
  vertical-align: middle;
}

.logo-svg {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 25%;
  transition: transform 0.16s ease;
}

.easymd-brand-logo-container:hover .logo-svg {
  transform: scale(1.04);
}

@media (prefers-reduced-motion: reduce) {
  .logo-svg {
    transition: none;
  }
}
</style>
