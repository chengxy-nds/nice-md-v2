/** Shared footer builders for the material library.
 * Used by both the material catalog (footer materials) and the
 * header/footer widget templates — kept in one place so the two
 * data modules below do not depend on each other. */

export const buildTripleLikeFooter = (tip = '如果这篇内容对你有帮助') => `<section style="margin: 28px 0 16px; padding: 18px 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; text-align: center; box-sizing: border-box;" data-material="true">
  <p style="margin: 0 0 12px; color: #1e293b; font-size: 15px; font-weight: 600; line-height: 1.5;">${tip}</p>
  <table style="width: 100%; border-collapse: collapse; table-layout: fixed;">
    <tbody><tr>
      <td style="width: 33.33%; padding: 8px 4px; border-right: 1px solid #dbe3ec; color: #334155; font-size: 13px; font-weight: 600;">点赞支持</td>
      <td style="width: 33.33%; padding: 8px 4px; border-right: 1px solid #dbe3ec; color: #334155; font-size: 13px; font-weight: 600;">点亮在看</td>
      <td style="width: 33.33%; padding: 8px 4px; color: #334155; font-size: 13px; font-weight: 600;">转发分享</td>
    </tr></tbody>
  </table>
</section>`;

export const buildQrFollowFooter = (
  title = '扫码关注公众号',
  subTitle = '每周更新实用内容与深度复盘'
) => `<section style="margin: 28px 0 16px; padding: 16px 18px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; box-sizing: border-box;" data-material="true">
  <table style="width: 100%; border-collapse: collapse;">
    <tbody><tr>
      <td style="padding-right: 14px; vertical-align: middle;">
        <div style="margin-bottom: 5px; color: #2563eb; font-size: 11px; font-weight: 600; letter-spacing: 0.06em;">公众号 · 持续更新</div>
        <div style="color: #1e293b; font-size: 16px; font-weight: 600; line-height: 1.45;">${title}</div>
        <p style="margin: 5px 0 0; color: #64748b; font-size: 12px; line-height: 1.55;">${subTitle}</p>
      </td>
      <td style="width: 104px; text-align: right; vertical-align: middle;">
        <div style="display: inline-table; width: 88px; height: 88px; border: 1px solid #d5dee9; background: #ffffff; color: #64748b; text-align: center; box-sizing: border-box;">
          <div style="display: table-cell; vertical-align: middle; font-size: 12px; line-height: 1.5;">二维码<br><span style="color: #94a3b8; font-size: 10px;">替换图片</span></div>
        </div>
      </td>
    </tr></tbody>
  </table>
</section>`;

export const buildAuthorFooter = (
  author = '程序员小富',
  desc = '专注分享后端架构、实用工具与创作经验。'
) => `<section style="margin: 28px 0 16px; padding: 16px 18px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; box-sizing: border-box;" data-material="true">
  <table style="width: 100%; border-collapse: collapse;">
    <tbody><tr>
      <td style="vertical-align: middle;">
        <div style="margin-bottom: 4px; color: #64748b; font-size: 11px; letter-spacing: 0.04em;">作者专栏</div>
        <div style="color: #1e293b; font-size: 16px; font-weight: 600; line-height: 1.4;">${author}</div>
      </td>
      <td style="padding-left: 10px; text-align: right; vertical-align: middle; white-space: nowrap;">
        <span style="color: #2563eb; font-size: 12px; font-weight: 600;">关注公众号&nbsp;→</span>
      </td>
    </tr><tr>
      <td colspan="2" style="padding-top: 8px; color: #64748b; font-size: 12px; line-height: 1.6;">${desc}</td>
    </tr></tbody>
  </table>
</section>`;

export const buildSocialMatrixFooter = () => `<section style="margin: 28px 0 16px; padding: 16px 12px; border-top: 1px solid #dbe3ec; border-bottom: 1px solid #dbe3ec; text-align: center; box-sizing: border-box;" data-material="true">
  <div style="color: #1e293b; font-size: 15px; font-weight: 600; line-height: 1.5;">也欢迎在其他平台找到我</div>
  <p style="margin: 4px 0 10px; color: #64748b; font-size: 12px; line-height: 1.5;">技术文章与创作动态持续更新</p>
  <div style="margin-top: 8px; color: #334155; font-size: 12px; line-height: 1.9;">
    微信公众号<span style="color: #a0aec0;">&nbsp; · &nbsp;</span>知乎专栏<span style="color: #a0aec0;">&nbsp; · &nbsp;</span>稀土掘金<span style="color: #a0aec0;">&nbsp; · &nbsp;</span>GitHub
  </div>
</section>`;
