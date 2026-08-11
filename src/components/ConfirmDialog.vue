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
  background: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.12s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.dialog-card {
  background: var(--bg-app, #FAFAF8);
  border: 1px solid var(--border-color, #E6E6E2);
  border-radius: 12px;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.08);
  padding: 18px 20px 16px;
  width: 310px;
  max-width: 90vw;
  display: flex;
  flex-direction: column;
  gap: 10px;
  animation: scaleIn 0.15s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes scaleIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.dialog-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.danger-icon-box {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: #FEE2E2;
  color: #DC2626;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.dialog-title {
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 600;
  color: var(--text-main, #1C1C1C);
  margin: 0;
}

.dialog-message {
  font-size: 13px;
  color: var(--text-muted, #666666);
  line-height: 1.45;
  margin: 0;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 6px;
}

.btn-cancel {
  padding: 6px 14px;
  border: 1px solid var(--border-color, #E6E6E2);
  border-radius: 6px;
  background: transparent;
  color: var(--text-main, #333333);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-cancel:hover {
  background: var(--accent-bg, #F2F2EE);
}

.btn-confirm {
  padding: 6px 14px;
  border: none;
  border-radius: 6px;
  background: var(--accent-color, #333);
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-confirm.is-danger {
  background: #DC2626;
}

.btn-confirm.is-danger:hover {
  background: #B91C1C;
}
</style>
