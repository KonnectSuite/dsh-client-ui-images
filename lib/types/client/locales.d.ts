/** Dictionary namespace owned by the Images page. */
export declare const NS = "images";
/** Simplified Chinese dictionary (the key-set source of truth). */
export declare const zh: {
    readonly 'panel.label': "图像";
    readonly 'page.title': "图像";
    readonly 'composer.placeholder': "描述要创建的图像";
    readonly 'composer.negative': "不希望图像中出现的内容";
    readonly 'composer.negativeUnsupported': "此工作流在提示词强度 1 时不使用负面提示词";
    readonly 'composer.generate': "生成";
    readonly 'composer.generating': "正在生成…";
    readonly 'composer.model': "模型";
    readonly 'composer.workflow': "工作流";
    readonly 'composer.usingModel': "使用 {model}";
    readonly 'composer.size': "尺寸";
    readonly 'composer.steps': "步数";
    readonly 'composer.cfg': "提示词强度";
    readonly 'composer.seed': "种子";
    readonly 'composer.random': "随机";
    readonly 'composer.batch': "数量";
    readonly 'status.connected': "ComfyUI 已连接";
    readonly 'status.offline': "无法连接 ComfyUI。请启动 ComfyUI 后重试。";
    readonly 'status.noModels': "ComfyUI 中没有兼容的图像模型。";
    readonly 'status.unavailable': "不可用";
    readonly 'action.refresh': "刷新";
    readonly 'action.openComfy': "打开 ComfyUI";
    readonly 'action.cancel': "取消";
    readonly 'action.download': "下载";
    readonly 'action.reuse': "复用设置";
    readonly 'action.delete': "删除";
    readonly 'delete.title': "删除图像？";
    readonly 'delete.description': "这将从最近生成中删除此图像以及同一次生成的其他图像。";
    readonly 'delete.cancel': "取消";
    readonly 'delete.confirm': "删除图像";
    readonly 'delete.close': "关闭删除确认";
    readonly 'delete.pending': "正在删除…";
    readonly 'gallery.title': "最近生成";
    readonly 'gallery.workflow': "工作流：{workflow}";
    readonly 'gallery.empty': "生成的图像会显示在这里。";
    readonly 'gallery.loading': "正在加载图像…";
    readonly 'gallery.failed': "无法加载此图像。";
    readonly 'gallery.open': "查看图像：{name}";
    readonly 'gallery.close': "关闭图像";
    readonly 'gallery.previous': "上一张图像";
    readonly 'gallery.next': "下一张图像";
    readonly 'notice.failed': "无法完成图像操作。";
    readonly 'pending.title': "ComfyUI 正在生成图像";
};
/** English dictionary, key-identical to the Chinese source of truth. */
export declare const en: Record<ImagesKey, string>;
export type ImagesKey = keyof typeof zh;
//# sourceMappingURL=locales.d.ts.map