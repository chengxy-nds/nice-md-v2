<script setup>
import { useId } from 'vue';

defineProps({
  size: {
    type: [Number, String],
    default: 32
  }
});

const uid = useId();
const bgGradId = `easymd-bg-${uid}`;
const shadowId = `easymd-paper-${uid}`;
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
      <defs>
        <linearGradient :id="bgGradId" x1="6" y1="4" x2="58" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#00C8D7" />
          <stop offset="100%" stop-color="#0093A3" />
        </linearGradient>
        <filter :id="shadowId" x="11" y="8" width="43" height="54" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" flood-color="#005560" flood-opacity="0.18" />
        </filter>
      </defs>

      <!-- Studio Cyan-Teal Squircle -->
      <rect width="64" height="64" rx="16" :fill="`url(#${bgGradId})`" />
      <rect
        x="0.75"
        y="0.75"
        width="62.5"
        height="62.5"
        rx="15.25"
        stroke="rgba(255, 255, 255, 0.22)"
        stroke-width="1.5"
      />

      <!-- Crisp Paper Sheet -->
      <g :filter="`url(#${shadowId})`">
        <path
          d="M20 10.5H37.5L49.5 22.5V50.5C49.5 53.2614 47.2614 55.5 44.5 55.5H20C17.2386 55.5 15 53.2614 15 50.5V15.5C15 12.7386 17.2386 10.5 20 10.5Z"
          fill="#FFFFFF"
        />
      </g>

      <!-- Folded Corner -->
      <path d="M37.5 10.5V19.5C37.5 21.1569 38.8431 22.5 40.5 22.5H49.5L37.5 10.5Z" fill="#BAEBF0" />

      <!-- Crisp Markdown 'M' -->
      <path
        d="M21 40.5V27.5L32 36.5L43 27.5V40.5"
        stroke="#008999"
        stroke-width="4.2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />

      <!-- Editorial Rule + Live Cursor -->
      <path d="M22.5 47H33.5" stroke="#B7E4EA" stroke-width="2.6" stroke-linecap="round" />
      <rect x="36.5" y="43.5" width="3.2" height="7" rx="1.6" fill="#00C8D7" />
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
