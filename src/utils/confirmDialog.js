/**
 * Reactive confirm dialog singleton.
 * Call showConfirm(options) from anywhere — returns a Promise<boolean>.
 */
import { ref } from 'vue';

const state = ref({
  open: false,
  title: '',
  message: '',
  confirmText: '确定',
  cancelText: '取消',
  danger: false,
  resolve: null
});

export function showConfirm({
  title = '确认操作',
  message = '确定要执行此操作吗？',
  confirmText = '确定',
  cancelText = '取消',
  danger = false
} = {}) {
  return new Promise((resolve) => {
    state.value = {
      open: true,
      title,
      message,
      confirmText,
      cancelText,
      danger,
      resolve
    };
  });
}

export function useConfirmState() {
  return state;
}
