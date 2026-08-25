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
    <!-- Light Mode Vector Icon -->
    <svg 
      class="brand-svg svg-light" 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- Subtle squircle background container -->
      <rect width="48" height="48" rx="12" fill="#FFFFFF" />
      <rect width="48" height="48" rx="12" stroke="rgba(0,0,0,0.06)" stroke-width="1.5" />
      
      <!-- Trajectory Speed Arc -->
      <path 
        d="M 10 38 C 9 22, 22 10, 38 12" 
        stroke="url(#arc-grad-light)" 
        stroke-width="2.5" 
        stroke-linecap="round" 
        stroke-dasharray="0.5 0"
      />
      
      <!-- Platform Orbit Dots -->
      <circle cx="39" cy="13" r="3.2" fill="#10B981" /> <!-- WeChat Green -->
      <circle cx="41" cy="24" r="2.8" fill="#0284C7" /> <!-- Zhihu Blue -->
      <circle cx="37" cy="34" r="2.8" fill="#F97316" /> <!-- Juejin Orange -->

      <!-- Main Origami Paper Airplane (Flying North-East) -->
      <g transform="translate(13, 11) scale(0.95)">
        <!-- Airplane Wings & Body -->
        <path 
          d="M 1.5 13 L 26 2 L 15 25 L 11 16 Z" 
          fill="url(#plane-grad-light)" 
          stroke="#1D4ED8" 
          stroke-width="1.2" 
          stroke-linejoin="round"
        />
        <!-- Inner Wing Fold Shadow -->
        <path 
          d="M 26 2 L 11 16 L 15 25 Z" 
          fill="#1E40AF" 
          opacity="0.25"
        />
        <path 
          d="M 26 2 L 11 16 L 1.5 13 Z" 
          fill="#3B82F6" 
        />
        <!-- Center Crease Line -->
        <line 
          x1="26" y1="2" 
          x2="11" y2="16" 
          stroke="#FFFFFF" 
          stroke-width="1.5" 
          stroke-linecap="round"
        />
        <!-- Markdown 'M↓' Symbol on Wing -->
        <!-- M letter -->
        <path 
          d="M 5.5 10.5 L 5.5 7 L 7.5 9 L 9.5 7 L 9.5 10.5" 
          stroke="#FFFFFF" 
          stroke-width="1.1" 
          stroke-linecap="round" 
          stroke-linejoin="round"
        />
        <!-- Down Arrow -->
        <path 
          d="M 12.5 7.5 L 12.5 11 M 11 9.5 L 12.5 11 L 14 9.5" 
          stroke="#FFFFFF" 
          stroke-width="1.1" 
          stroke-linecap="round" 
          stroke-linejoin="round"
        />
      </g>

      <!-- Gradients -->
      <defs>
        <linearGradient id="plane-grad-light" x1="1.5" y1="2" x2="26" y2="25" gradientUnits="userSpaceOnUse">
          <stop stop-color="#3B82F6" />
          <stop offset="1" stop-color="#1D4ED8" />
        </linearGradient>
        <linearGradient id="arc-grad-light" x1="10" y1="38" x2="38" y2="12" gradientUnits="userSpaceOnUse">
          <stop stop-color="#60A5FA" stop-opacity="0.1" />
          <stop offset="0.6" stop-color="#3B82F6" />
          <stop offset="1" stop-color="#10B981" />
        </linearGradient>
      </defs>
    </svg>

    <!-- Dark Mode Vector Icon (Deep Dark Squircle + Neon Glows) -->
    <svg 
      class="brand-svg svg-dark" 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- Deep dark squircle background container -->
      <rect width="48" height="48" rx="12" fill="#121318" />
      <rect width="48" height="48" rx="12" stroke="rgba(255,255,255,0.12)" stroke-width="1.5" />

      <!-- Glowing Trajectory Speed Arc -->
      <path 
        d="M 10 38 C 9 22, 22 10, 38 12" 
        stroke="url(#arc-grad-dark)" 
        stroke-width="2.5" 
        stroke-linecap="round" 
      />

      <!-- Neon Orbit Platform Dots -->
      <circle cx="39" cy="13" r="3.2" fill="#34D399" filter="drop-shadow(0 0 4px #10B981)" />
      <circle cx="41" cy="24" r="2.8" fill="#38BDF8" filter="drop-shadow(0 0 4px #0284C7)" />
      <circle cx="37" cy="34" r="2.8" fill="#FB923C" filter="drop-shadow(0 0 4px #EA580C)" />

      <!-- Neon Origami Paper Airplane -->
      <g transform="translate(13, 11) scale(0.95)">
        <path 
          d="M 1.5 13 L 26 2 L 15 25 L 11 16 Z" 
          fill="url(#plane-grad-dark)" 
          stroke="#60A5FA" 
          stroke-width="1.2" 
          stroke-linejoin="round"
        />
        <path 
          d="M 26 2 L 11 16 L 15 25 Z" 
          fill="#1E3A8A" 
          opacity="0.4"
        />
        <path 
          d="M 26 2 L 11 16 L 1.5 13 Z" 
          fill="#3B82F6" 
        />
        <line 
          x1="26" y1="2" 
          x2="11" y2="16" 
          stroke="#FFFFFF" 
          stroke-width="1.5" 
          stroke-linecap="round"
        />
        <!-- Markdown 'M↓' Symbol -->
        <path 
          d="M 5.5 10.5 L 5.5 7 L 7.5 9 L 9.5 7 L 9.5 10.5" 
          stroke="#FFFFFF" 
          stroke-width="1.1" 
          stroke-linecap="round" 
          stroke-linejoin="round"
        />
        <path 
          d="M 12.5 7.5 L 12.5 11 M 11 9.5 L 12.5 11 L 14 9.5" 
          stroke="#FFFFFF" 
          stroke-width="1.1" 
          stroke-linecap="round" 
          stroke-linejoin="round"
        />
      </g>

      <defs>
        <linearGradient id="plane-grad-dark" x1="1.5" y1="2" x2="26" y2="25" gradientUnits="userSpaceOnUse">
          <stop stop-color="#60A5FA" />
          <stop offset="1" stop-color="#2563EB" />
        </linearGradient>
        <linearGradient id="arc-grad-dark" x1="10" y1="38" x2="38" y2="12" gradientUnits="userSpaceOnUse">
          <stop stop-color="#3B82F6" stop-opacity="0.1" />
          <stop offset="0.5" stop-color="#38BDF8" />
          <stop offset="1" stop-color="#34D399" />
        </linearGradient>
      </defs>
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
}

.brand-svg {
  width: 100%;
  height: 100%;
  border-radius: 25%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
  transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease;
}

.easymd-brand-logo-container:hover .brand-svg {
  transform: scale(1.08) rotate(-2deg);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

/* Light / Dark Mode Toggle */
.svg-light {
  display: block;
}
.svg-dark {
  display: none;
}

:global(html[data-color-mode="dark"]) .svg-light,
:global(html.dark) .svg-light {
  display: none !important;
}

:global(html[data-color-mode="dark"]) .svg-dark,
:global(html.dark) .svg-dark {
  display: block !important;
}
</style>
