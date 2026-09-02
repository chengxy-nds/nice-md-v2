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
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
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

/* Figma UI Kit Dialog Card */
.dialog-card {
  background: var(--bg-card, #FFFFFF);
  border: 1px solid var(--border-color, #E2E8F0);
  border-radius: 12px;
  box-shadow: 
    0 12px 36px rgba(19, 10, 46, 0.12),
    0 2px 8px rgba(19, 10, 46, 0.04);
  padding: 20px 22px;
  width: 360px;
  max-width: 92vw;
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-family: var(--font-sans);
  animation: scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  box-sizing: border-box;
}

@keyframes scaleIn {
  from { transform: scale(0.95) translateY(6px); opacity: 0; }
  to { transform: scale(1) translateY(0); opacity: 1; }
}

.dialog-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.danger-icon-box {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.dialog-title {
  font-family: var(--font-sans);
  font-size: 15px;
  font-weight: 600;
  color: var(--text-main, #1F2937);
  letter-spacing: -0.01em;
  margin: 0;
}

.dialog-message {
  font-size: 13px;
  color: var(--text-muted, #6B7280);
  line-height: 1.5;
  margin: 0;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

/* UI Kit Action Buttons */
.btn-cancel {
  padding: 7px 14px;
  border: 1px solid var(--border-color, #E2E8F0);
  border-radius: 8px;
  background: var(--bg-card, #FFFFFF);
  color: var(--text-main, #374151);
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-cancel:hover {
  background: var(--bg-capsule, #F3F4F6);
  border-color: var(--border-strong, #CBD5E1);
  color: var(--text-main, #1F2937);
}

.btn-confirm {
  padding: 7px 16px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: var(--brand-primary, #116ACC);
  color: #ffffff;
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 0 1px 2px rgba(17, 106, 204, 0.18);
}

.btn-confirm:hover {
  background: var(--brand-primary-hover, #0C4A8F);
  box-shadow: 0 4px 12px rgba(17, 106, 204, 0.28);
}

.btn-confirm.is-danger {
  background: #ef4444;
  box-shadow: 0 1px 2px rgba(239, 68, 68, 0.18);
}

.btn-confirm.is-danger:hover {
  background: #dc2626;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.28);
}

/* Dark Mode Adaptation */
html.dark .dialog-card {
  background: #1e293b;
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.45);
}

html.dark .dialog-title {
  color: #f8fafc;
}

html.dark .dialog-message {
  color: #94a3b8;
}

html.dark .btn-cancel {
  background: #334155;
  border-color: #475569;
  color: #f1f5f9;
}

html.dark .btn-cancel:hover {
  background: #475569;
}
</style>
