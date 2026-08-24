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
        <!-- Header -->
        <div class="popup-header">
          <div class="header-title-group">
            <div class="header-icon">
              <Sparkles class="w-4 h-4 text-indigo-500" />
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
              <ExternalLink class="w-3 h-3 ml-1 inline opacity-70" />
            </button>

            <button class="modal-close-btn" @click="emit('close')" title="关闭">
              <X class="w-4 h-4" />
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
                <Check class="w-3 h-3 inline mr-0.5" /> 已选用
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
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  z-index: 999999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: modalFadeIn 0.16s ease-out;
}

@keyframes modalFadeIn {
  from { opacity: 0; transform: scale(0.97); }
  to { opacity: 1; transform: scale(1); }
}

.material-popup-modal {
  width: 820px;
  max-width: 94vw;
  max-height: 84vh;
  background: var(--bg-preview, #ffffff);
  border-radius: 12px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid var(--border-color, #e2e8f0);
  background: var(--bg-hover, #f8fafc);
  gap: 12px;
  flex-shrink: 0;
}

.header-title-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #eef2ff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.popup-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary, #0f172a);
  line-height: 1.2;
}

.popup-subtitle {
  font-size: 11.5px;
  color: var(--text-muted, #64748b);
  margin-top: 2px;
}

.header-right-tools {
  display: flex;
  align-items: center;
  gap: 10px;
}

.inline-prefix-box {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  padding: 3px 8px;
  border-radius: 6px;
}

.prefix-label {
  font-size: 11px;
  font-weight: 600;
  color: #475569;
}

.prefix-input {
  width: 70px;
  height: 22px;
  padding: 0 4px;
  font-size: 11.5px;
  font-weight: 700;
  border: 1px solid #94a3b8;
  border-radius: 4px;
  color: #1e293b;
  outline: none;
}

.prefix-input:focus {
  border-color: #2563eb;
}

.open-detail-btn {
  font-size: 11.5px;
  font-weight: 600;
  color: #475569;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  padding: 5px 10px;
  border-radius: 6px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  transition: all 0.15s ease;
}

.open-detail-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.modal-close-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s ease;
}

.modal-close-btn:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.popup-grid-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 14px;
  background: var(--bg-main, #f8fafc);
}

.visual-preview-card {
  background: var(--bg-preview, #ffffff);
  border: 1.5px solid var(--border-color, #e2e8f0);
  border-radius: 10px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.visual-preview-card:hover {
  border-color: var(--accent-color, #6366f1);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.12);
  transform: translateY(-1.5px);
}

.visual-preview-card.is-active {
  border-color: var(--accent-color, #6366f1);
  background: rgba(99, 102, 241, 0.06);
  box-shadow: 0 0 0 1px var(--accent-color, #6366f1), 0 4px 12px rgba(99, 102, 241, 0.12);
}

.card-meta-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.card-title {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--text-primary, #0f172a);
}

.card-tag {
  font-size: 10.5px;
  font-weight: 600;
  color: #64748b;
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 4px;
}

.active-badge {
  font-size: 10.5px;
  font-weight: 700;
  color: #ffffff;
  background: var(--accent-color, #6366f1);
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
}

.card-canvas {
  min-height: 60px;
  background: #ffffff;
  border: 1px solid var(--border-color, #f1f5f9);
  border-radius: 8px;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.02);
}
</style>
