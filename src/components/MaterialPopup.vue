<script setup>
import { computed } from 'vue';
import { Sparkles, X, Check, ExternalLink } from 'lucide-vue-next';
import { getMaterialTemplatesForKey } from '../utils/materialLibrary';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  elementKey: {
    type: String,
    default: 'h1'
  },
  currentMaterialId: {
    type: String,
    default: 'none'
  },
  currentPrefix: {
    type: String,
    default: ''
  },
  position: {
    type: Object,
    default: () => ({ x: 0, y: 0 })
  }
});

const emit = defineEmits(['select', 'close', 'open-customizer', 'update-prefix']);

const typeLabels = {
  body: '整体背景底纹',
  h1: 'H1 一级标题',
  h2: 'H2 二级标题',
  h3: 'H3 三级标题',
  h4: 'H4 四级标题',
  h5: 'H5 五级标题',
  h6: 'H6 六级标题',
  blockquote: '引用 / 金句卡片',
  hr: '分割线',
  ul: '无序列表 (UL)',
  ol: '有序列表 (OL)',
  li: '列表项 (LI)',
  header_widget: '文章头部导读卡',
  footer_widget: '文末三连/作者名片'
};

const titleText = computed(() => {
  return typeLabels[props.elementKey] || '素材样式';
});

const templateList = computed(() => {
  return getMaterialTemplatesForKey(props.elementKey);
});

function handleSelect(templateId) {
  emit('select', { key: props.elementKey, templateId });
}

function handlePrefixChange(e) {
  emit('update-prefix', { key: props.elementKey, prefix: e.target.value });
}

function hasPrefixOption(id) {
  return ['h-135-part01-leaf', 'h-135-part02-peach', 'h-135-part03-purple', 'h-135-morandi-block'].includes(id);
}
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="material-popup-mask" @click.self="emit('close')">
      <div class="material-popup-modal">
        <!-- Ambient subtle space light -->
        <div class="popup-glow popup-glow-a"></div>
        <div class="popup-glow popup-glow-b"></div>

        <!-- Header -->
        <div class="popup-header">
          <div class="header-title-group">
            <div class="header-icon">
              <Sparkles size="14" />
            </div>
            <div>
              <div class="popup-title">选择 {{ titleText }} 视觉样式</div>
              <div class="popup-subtitle">点击即刻替换全篇排版，实时同步微信公众号规范</div>
            </div>
          </div>

          <div class="header-right-tools">
            <!-- Inline prefix config if applicable -->
            <div v-if="hasPrefixOption(props.currentMaterialId)" class="inline-prefix-box">
              <span class="prefix-label">标牌文本:</span>
              <input
                type="text"
                :value="props.currentPrefix || (props.elementKey === 'h1' ? 'PART' : 'SECTION')"
                @input="handlePrefixChange"
                placeholder="PART"
                class="prefix-input"
              />
            </div>

            <button class="open-detail-btn" @click="emit('open-customizer', props.elementKey)" title="在侧边栏打开详细参数调节">
              <span>自定义微调</span>
              <ExternalLink size="12" />
            </button>

            <button class="modal-close-btn" @click="emit('close')" title="关闭">
              <X size="15" />
            </button>
          </div>
        </div>

        <!-- Pure Visual Grid (No descriptions, clean layout) -->
        <div class="popup-grid-container">
          <div
            v-for="item in templateList"
            :key="item.id"
            class="visual-preview-card"
            :class="{ 'is-active': (props.currentMaterialId || 'none') === item.id }"
            @click="handleSelect(item.id)"
          >
            <!-- Card Header -->
            <div class="card-meta-bar">
              <span class="card-title">{{ item.name }}</span>
              <span v-if="(props.currentMaterialId || 'none') === item.id" class="active-badge">
                <Check size="12" />
                <span>已选用</span>
              </span>
              <span v-else class="card-tag">{{ item.tag }}</span>
            </div>

            <!-- Visual Preview Window -->
            <div class="card-canvas" v-html="item.previewHtml"></div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.material-popup-mask {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 999999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
  animation: modalFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalFadeIn {
  from { opacity: 0; transform: scale(0.97); }
  to { opacity: 1; transform: scale(1); }
}

.material-popup-modal {
  position: relative;
  width: 820px;
  max-width: 94vw;
  max-height: 84vh;
  background: #f4f5f7;
  border-radius: 1rem;
  box-shadow: 
    0 1.5rem 3.5rem -0.75rem rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.8) inset;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Ambient glow blobs */
.popup-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(3.5rem);
  pointer-events: none;
  z-index: 0;
}

.popup-glow-a {
  width: 16rem;
  height: 16rem;
  top: -4rem;
  right: 10%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, rgba(243, 244, 246, 0) 70%);
}

.popup-glow-b {
  width: 18rem;
  height: 18rem;
  bottom: -4rem;
  left: 10%;
  background: radial-gradient(circle, rgba(226, 232, 240, 0.55) 0%, rgba(243, 244, 246, 0) 70%);
}

.popup-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1.25rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  gap: 0.75rem;
  flex-shrink: 0;
}

.header-title-group {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.header-icon {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 0.4375rem;
  background: radial-gradient(140% 120% at 50% 0%, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.02) 70%), #2a2a2c;
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.18);
}

.popup-title {
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--text-main, #0f172a);
  line-height: 1.2;
  letter-spacing: -0.0125rem;
}

.popup-subtitle {
  font-size: 0.6875rem;
  color: var(--text-muted, #64748b);
  margin-top: 0.125rem;
}

.header-right-tools {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.inline-prefix-box {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
}

.prefix-label {
  font-size: 0.6875rem;
  font-weight: 600;
  color: #475569;
}

.prefix-input {
  width: 4rem;
  height: 1.375rem;
  padding: 0 0.375rem;
  font-size: 0.6875rem;
  font-weight: 700;
  border: 1px solid #cbd5e1;
  border-radius: 0.25rem;
  color: #1e293b;
  outline: none;
}

.prefix-input:focus {
  border-color: #3b82f6;
}

.open-detail-btn {
  font-size: 0.75rem;
  font-weight: 600;
  color: #1e293b;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.3125rem;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
}

.open-detail-btn:hover {
  background: #f1f5f9;
  color: #000000;
}

.modal-close-btn {
  width: 1.875rem;
  height: 1.875rem;
  border-radius: 50%;
  border: 1px solid var(--border-color, #e2e8f0);
  background: var(--bg-card, #ffffff);
  color: var(--text-muted, #64748b);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
}

.modal-close-btn:hover {
  background: #f1f5f9;
  color: #000000;
  transform: scale(1.06);
}

.popup-grid-container {
  position: relative;
  z-index: 1;
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.25rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 0.75rem;
  background: #f4f5f7;
}

.popup-grid-container::-webkit-scrollbar {
  width: 0.25rem;
}

.popup-grid-container::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.22);
  border-radius: 0.25rem;
}

.visual-preview-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.visual-preview-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.05);
  transform: translateY(-0.0625rem);
}

.visual-preview-card.is-active {
  border-color: #2a2a2c;
  background: #f8fbff;
  box-shadow: 0 0 0 1px #2a2a2c, 0 4px 12px rgba(42, 42, 44, 0.08);
}

.card-meta-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.card-title {
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--text-main, #0f172a);
}

.card-tag {
  font-size: 0.625rem;
  font-weight: 600;
  color: #64748b;
  background: #f1f5f9;
  padding: 0.0625rem 0.375rem;
  border-radius: 0.25rem;
}

.active-badge {
  font-size: 0.625rem;
  font-weight: 700;
  color: #16a34a;
  background: #edfdf2;
  padding: 0.0625rem 0.4375rem;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  gap: 0.1875rem;
}

.card-canvas {
  min-height: 3.75rem;
  background: #ffffff;
  border: 1px solid #f1f5f9;
  border-radius: 0.5rem;
  padding: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.02);
}

/* ── Dark Mode ── */
:global(html.dark) .material-popup-modal,
:global(html[data-color-mode="dark"]) .material-popup-modal {
  background: var(--bg-card, #1e1e1e);
  box-shadow: 0 1.5rem 3.5rem -0.75rem rgba(0, 0, 0, 0.6);
}

:global(html.dark) .popup-header,
:global(html[data-color-mode="dark"]) .popup-header {
  background: var(--bg-card, #1e1e1e);
  border-bottom-color: var(--border-color, #2d2d2d);
}

:global(html.dark) .header-icon,
:global(html[data-color-mode="dark"]) .header-icon {
  background: #ffffff;
  color: #0a0a0a;
}

:global(html.dark) .popup-title,
:global(html[data-color-mode="dark"]) .popup-title {
  color: var(--text-main, #cccccc);
}

:global(html.dark) .open-detail-btn,
:global(html[data-color-mode="dark"]) .open-detail-btn {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
  color: #e2e8f0;
}

:global(html.dark) .modal-close-btn,
:global(html[data-color-mode="dark"]) .modal-close-btn {
  background: var(--bg-toolbar, #2d2d2d);
  border-color: var(--border-color, #37373d);
  color: var(--text-muted, #969696);
}

:global(html.dark) .modal-close-btn:hover,
:global(html[data-color-mode="dark"]) .modal-close-btn:hover {
  background: var(--bg-capsule-btn-hover, #37373d);
  color: #ffffff;
}

:global(html.dark) .popup-grid-container,
:global(html[data-color-mode="dark"]) .popup-grid-container {
  background: var(--bg-app, #18181c);
}

:global(html.dark) .visual-preview-card,
:global(html[data-color-mode="dark"]) .visual-preview-card {
  background: var(--bg-card, #252526);
  border-color: var(--border-color, #2d2d2d);
}

:global(html.dark) .visual-preview-card.is-active,
:global(html[data-color-mode="dark"]) .visual-preview-card.is-active {
  border-color: #ffffff;
  box-shadow: 0 0 0 1px #ffffff, 0 4px 12px rgba(0, 0, 0, 0.4);
}

:global(html.dark) .card-title,
:global(html[data-color-mode="dark"]) .card-title {
  color: var(--text-main, #cccccc);
}

:global(html.dark) .card-canvas,
:global(html[data-color-mode="dark"]) .card-canvas {
  background: var(--bg-card, #1e1e1e);
  border-color: var(--border-color, #2d2d2d);
}
</style>
