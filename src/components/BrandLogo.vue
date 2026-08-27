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
    :style="{ width: `${size}px`, height: `${size}px`, '--logo-size': `${size}px` }"
  >
    <div class="logo-m-badge">
      <span class="logo-m-letter">M</span>
    </div>
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
}

.logo-m-badge {
  width: 100%;
  height: 100%;
  background: #18181b;
  border-radius: 22%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.16);
  transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease, background-color 0.2s ease;
}

.logo-m-letter {
  font-family: 'Inter Tight', 'Outfit', -apple-system, sans-serif;
  font-weight: 800;
  font-size: calc(var(--logo-size, 32px) * 0.58);
  color: #ffffff;
  line-height: 1;
  letter-spacing: -0.04em;
  transform: translateY(-0.5px);
}

.easymd-brand-logo-container:hover .logo-m-badge {
  transform: scale(1.06) rotate(-2deg);
  background: #09090b;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.26);
}

:global(html.dark) .logo-m-badge {
  background: #000000;
  border-color: rgba(255, 255, 255, 0.22);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

:global(html.dark) .easymd-brand-logo-container:hover .logo-m-badge {
  background: #18181b;
  border-color: rgba(255, 255, 255, 0.4);
}
</style>
