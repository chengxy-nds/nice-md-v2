<script setup>
defineProps({
  size: {
    type: [Number, String],
    default: 32
  }
});
</script>

<template>
  <div 
    class="easymd-brand-logo-container" 
    :style="{ width: `${size}px`, height: `${size}px` }"
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
        <linearGradient id="brandLogoBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#27272A"/>
          <stop offset="100%" stop-color="#09090B"/>
        </linearGradient>
        <linearGradient id="brandLogoM" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFFFFF"/>
          <stop offset="100%" stop-color="#F4F4F5"/>
        </linearGradient>
        <linearGradient id="brandLogoDot" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FF7A59"/>
          <stop offset="100%" stop-color="#FF5E36"/>
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#brandLogoBg)"/>
      <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="15.25" stroke="rgba(255, 255, 255, 0.15)" stroke-width="1.5" fill="none"/>
      <path d="M16 46V18.5L25.5 33.5L32 24.5L38.5 33.5L48 18.5V46" 
            stroke="url(#brandLogoM)" 
            stroke-width="4.5" 
            stroke-linecap="round" 
            stroke-linejoin="round"/>
      <circle cx="32" cy="16" r="3" fill="url(#brandLogoDot)"/>
    </svg>
  </div>
</template>

<style scoped>
.easymd-brand-logo-container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  user-select: none;
  cursor: pointer;
  transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), filter 0.2s ease;
}

.logo-svg {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 25%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
  transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease;
}

.easymd-brand-logo-container:hover .logo-svg {
  transform: scale(1.06) rotate(-2deg);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.28);
}
</style>
