<script setup>
import { useConfirmState } from '../utils/confirmDialog';
import { AlertCircle } from '@lucide/vue';

const state = useConfirmState();

function confirm() {
  state.value.resolve?.(true);
  state.value.open = false;
}

function cancel() {
  state.value.resolve?.(false);
  state.value.open = false;
}
</script>

<template>
  <div v-if="state.open" class="dialog-overlay" @click.self="cancel">
    <div class="dialog-card">
      <div class="dialog-header">
        <div v-if="state.danger" class="danger-icon-box">
          <AlertCircle size="14" stroke-width="2.2" />
        </div>
        <h3 class="dialog-title">{{ state.title }}</h3>
      </div>
      <p class="dialog-message">{{ state.message }}</p>
      <div class="dialog-actions">
        <button class="btn-cancel" @click="cancel">{{ state.cancelText }}</button>
        <button
          class="btn-confirm"
          :class="{ 'is-danger': state.danger }"
          @click="confirm"
        >{{ state.confirmText }}</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.36);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.18s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Liquid Glass Prompt Dialog Card */
.dialog-card {
  background: var(--glass-bg, rgba(255, 255, 255, 0.85));
  backdrop-filter: var(--glass-blur, blur(24px) saturate(180%));
  -webkit-backdrop-filter: var(--glass-blur, blur(24px) saturate(180%));
  border: 1.5px solid var(--glass-border, rgba(255, 255, 255, 0.8));
  border-radius: 1.5rem;
  box-shadow: 
    0 1.25rem 3.125rem rgba(0, 0, 0, 0.12),
    0 0.125rem 0.5rem rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  padding: 1.375rem 1.5rem 1.25rem;
  width: 21rem;
  max-width: 90vw;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  font-family: var(--font-sans);
  animation: scaleIn 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  box-sizing: border-box;
}

@keyframes scaleIn {
  from { transform: scale(0.93) translateY(8px); opacity: 0; }
  to { transform: scale(1) translateY(0); opacity: 1; }
}

.dialog-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.danger-icon-box {
  width: 1.625rem;
  height: 1.625rem;
  border-radius: 9999px;
  background: rgba(220, 38, 38, 0.12);
  color: #dc2626;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.dialog-title {
  font-family: var(--font-sans);
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--wandor-text, #1a1a1a);
  letter-spacing: -0.01em;
  margin: 0;
}

.dialog-message {
  font-size: 0.8125rem;
  color: var(--wandor-muted, #767676);
  line-height: 1.5;
  margin: 0;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

/* Tactile Pill Buttons */
.btn-cancel {
  padding: 0.4375rem 1rem;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(10px);
  color: var(--wandor-text, #1a1a1a);
  font-family: var(--font-sans);
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
}

.btn-cancel:hover {
  background: rgba(0, 0, 0, 0.05);
  transform: translateY(-1px);
}

.btn-cancel:active {
  transform: scale(0.95);
}

.btn-confirm {
  padding: 0.4375rem 1.125rem;
  border: none;
  border-radius: 9999px;
  background: var(--wandor-dark, #0a0a0a);
  color: #fafafa;
  font-family: var(--font-sans);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  user-select: none;
}

.btn-confirm:hover {
  background: #333333;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.btn-confirm:active {
  transform: scale(0.95);
}

.btn-confirm.is-danger {
  background: #dc2626;
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.35);
}

.btn-confirm.is-danger:hover {
  background: #b91c1c;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.45);
}
</style>
