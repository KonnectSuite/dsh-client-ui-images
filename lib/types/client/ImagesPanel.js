import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, IconDownloadOutlineRegular, IconRefreshOutlineRegular, IconSparkleRegular, IconTrashOutlineRegular, ImageLightbox, Modal, } from '@deepseek-ai/dsh-client-ui-primitives';
import css from './ImagesPanel.module.css';
const SIZES = [
    { label: 'composer.sizeSquare', width: 1024, height: 1024 },
    { label: 'composer.sizeLandscape', width: 1216, height: 832 },
    { label: 'composer.sizePortrait', width: 832, height: 1216 },
];
const EMPTY_DRAFT = {
    prompt: '', negativePrompt: '', model: '', workflow: '', width: 1024, height: 1024,
    steps: 24, cfg: 7, seed: '', batchSize: 1,
    sourceImage: null, denoise: 0.55,
};
function errorMessage(error, fallback) {
    return error instanceof Error ? error.message : fallback;
}
function ImageCard({ generation, stored, image, deleting, load, onDelete, onReuse, onEdit, t }) {
    const [src, setSrc] = useState();
    const [failed, setFailed] = useState(false);
    const [open, setOpen] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [visible, setVisible] = useState(false);
    const cardRef = useRef(null);
    useEffect(() => {
        const card = cardRef.current;
        if (card === null)
            return undefined;
        if (!('IntersectionObserver' in window)) {
            setVisible(true);
            return undefined;
        }
        const observer = new IntersectionObserver((entries) => {
            if (entries.some(entry => entry.isIntersecting)) {
                setVisible(true);
                observer.disconnect();
            }
        }, { rootMargin: '400px' });
        observer.observe(card);
        return () => { observer.disconnect(); };
    }, []);
    useEffect(() => {
        if (!visible)
            return undefined;
        const controller = new AbortController();
        void load(image).then((value) => {
            if (!controller.signal.aborted)
                setSrc(value);
        }).catch(() => {
            if (!controller.signal.aborted)
                setFailed(true);
        });
        return () => { controller.abort(); };
    }, [image, load, visible]);
    return (_jsxs("article", { ref: cardRef, className: css.card, children: [_jsx("button", { type: "button", className: css.preview, disabled: src === undefined, "aria-label": t('gallery.open', { name: image.filename }), onClick: () => { setOpen(true); }, children: src !== undefined
                    ? _jsx("img", { src: src, alt: generation?.prompt ?? image.filename })
                    : _jsx("span", { className: failed ? css.failed : css.loading, children: failed ? t('gallery.failed') : t('gallery.loading') }) }), _jsxs("div", { className: css.cardBody, children: [_jsx("p", { className: css.workflow, children: generation === undefined ? t('gallery.localFile') : t('gallery.workflow', { workflow: generation.workflowLabel }) }), _jsx("p", { className: css.prompt, children: generation?.prompt ?? image.filename }), _jsx("p", { className: css.meta, children: generation === undefined
                            ? t('gallery.fileMeta', { date: new Date(stored?.modifiedAt ?? 0).toLocaleDateString(), size: Math.round((stored?.bytes ?? 0) / 1024) })
                            : t('gallery.runMeta', { width: generation.width, height: generation.height, steps: generation.steps, seed: generation.seed }) }), _jsxs("div", { className: css.cardActions, children: [generation !== undefined && onReuse !== undefined && _jsx(Button, { size: "sm", onClick: () => { onReuse(generation); }, children: t('action.reuse') }), src !== undefined && _jsx(Button, { size: "sm", onClick: () => { onEdit(image, generation, src); }, children: t('action.editImage') }), src !== undefined && (_jsxs("a", { className: css.download, href: src, download: image.filename, children: [_jsx(IconDownloadOutlineRegular, { size: 14 }), t('action.download')] })), _jsxs(Button, { className: css.deleteButton, size: "sm", disabled: deleting, onClick: () => { setConfirming(true); }, children: [_jsx(IconTrashOutlineRegular, { size: 14 }), t(deleting ? 'delete.pending' : 'action.delete')] })] })] }), open && src !== undefined && (_jsx(ImageLightbox, { src: src, alt: generation?.prompt ?? image.filename, labels: { dialog: t('gallery.open', { name: image.filename }), close: t('gallery.close') }, onClose: () => { setOpen(false); } })), _jsx(Modal, { open: confirming, title: t('delete.title'), description: t(generation === undefined ? 'delete.fileDescription' : 'delete.description'), closeLabel: t('delete.close'), onClose: () => { if (!deleting)
                    setConfirming(false); }, footer: _jsxs("div", { className: css.confirmActions, children: [_jsx(Button, { variant: "outline", disabled: deleting, onClick: () => { setConfirming(false); }, children: t('delete.cancel') }), _jsxs(Button, { className: css.deleteButton, disabled: deleting, onClick: () => {
                                void onDelete().then((deleted) => { if (deleted)
                                    setConfirming(false); });
                            }, children: [_jsx(IconTrashOutlineRegular, { size: 14 }), t(deleting ? 'delete.pending' : 'delete.confirm')] })] }) })] }));
}
/** Full-page local ComfyUI image generator. */
export function ImagesPanel({ status: readStatus, history: readHistory, library: readLibrary, generate: requestGeneration, cancel: cancelGeneration, remove: removeGeneration, removeImage, image: readImage, t, }) {
    const [draft, setDraft] = useState(EMPTY_DRAFT);
    const [status, setStatus] = useState();
    const [history, setHistory] = useState([]);
    const [library, setLibrary] = useState({ images: [], total: 0 });
    const [libraryLoading, setLibraryLoading] = useState(false);
    const [galleryView, setGalleryView] = useState('library');
    const [sourcePreview, setSourcePreview] = useState();
    const [pending, setPending] = useState([]);
    const [error, setError] = useState();
    const [busy, setBusy] = useState(false);
    const [deleting, setDeleting] = useState([]);
    const refresh = useCallback(async () => {
        try {
            const [nextStatus, nextHistory] = await Promise.all([readStatus(), readHistory()]);
            setStatus(nextStatus);
            setHistory(nextHistory);
            const settled = new Set(nextHistory.map(item => item.promptId));
            setPending(current => current.filter(id => !settled.has(id)));
            setDraft((current) => {
                const model = nextStatus.models[0];
                const currentWorkflow = nextStatus.workflows.find(workflow => workflow.id === current.workflow && workflow.available);
                const workflow = currentWorkflow ?? nextStatus.workflows.find(item => item.available);
                return {
                    ...current,
                    model: workflow?.source === 'saved' ? workflow.modelId ?? ''
                        : nextStatus.models.some(item => item.id === current.model) ? current.model : model?.id ?? '',
                    workflow: workflow?.id ?? '',
                    prompt: currentWorkflow === undefined ? workflow?.starterPrompt ?? current.prompt : current.prompt,
                    width: currentWorkflow === undefined ? workflow?.width ?? current.width : current.width,
                    height: currentWorkflow === undefined ? workflow?.height ?? current.height : current.height,
                    batchSize: currentWorkflow === undefined ? workflow?.batchSize ?? current.batchSize : current.batchSize,
                    steps: currentWorkflow === undefined ? workflow?.recommendedSteps ?? current.steps : current.steps,
                    cfg: currentWorkflow === undefined ? workflow?.recommendedCfg ?? current.cfg : current.cfg,
                };
            });
            setError(undefined);
        }
        catch (reason) {
            setError(errorMessage(reason, t('notice.failed')));
        }
    }, [readHistory, readStatus, t]);
    useEffect(() => { void refresh(); }, [refresh]);
    const refreshLibrary = useCallback(async () => {
        setLibraryLoading(true);
        try {
            setLibrary(await readLibrary(0));
        }
        catch (reason) {
            setError(errorMessage(reason, t('notice.failed')));
        }
        finally {
            setLibraryLoading(false);
        }
    }, [readLibrary, t]);
    useEffect(() => { if (status?.libraryAvailable === true)
        void refreshLibrary(); }, [status?.libraryAvailable, refreshLibrary]);
    useEffect(() => {
        if (pending.length === 0)
            return undefined;
        const timer = window.setInterval(() => { void refresh(); }, 1_500);
        return () => { window.clearInterval(timer); };
    }, [pending.length, refresh]);
    const set = (key, value) => {
        setDraft(current => ({ ...current, [key]: value }));
    };
    const selectedSize = `${draft.width}x${draft.height}`;
    const customSize = !SIZES.some(size => `${size.width}x${size.height}` === selectedSize);
    const selectedWorkflow = status?.workflows.find(workflow => workflow.id === draft.workflow);
    const canGenerate = status?.reachable === true && selectedWorkflow?.available === true && draft.prompt.trim() !== '' && !busy;
    const selectedModel = status?.models.find(model => model.id === (selectedWorkflow?.source === 'saved' ? selectedWorkflow.modelId : draft.model));
    const generate = async () => {
        setBusy(true);
        setError(undefined);
        try {
            const receipt = await requestGeneration({
                prompt: draft.prompt,
                negativePrompt: draft.negativePrompt,
                model: draft.model || null,
                workflow: draft.workflow || null,
                width: draft.width,
                height: draft.height,
                steps: draft.steps,
                cfg: draft.cfg,
                seed: draft.seed.trim() === '' ? null : Number(draft.seed),
                batchSize: draft.batchSize,
                sourceImage: draft.sourceImage,
                denoise: draft.denoise,
            });
            setPending(current => [...current, receipt.promptId]);
            setDraft(current => ({ ...current, seed: String(receipt.seed) }));
        }
        catch (reason) {
            setError(errorMessage(reason, t('notice.failed')));
        }
        finally {
            setBusy(false);
        }
    };
    const reuse = (generation) => {
        setDraft({
            prompt: generation.prompt,
            negativePrompt: generation.negativePrompt,
            model: generation.model,
            workflow: status?.workflows.some(workflow => workflow.id === generation.workflow && workflow.available)
                ? generation.workflow ?? draft.workflow
                : draft.workflow,
            width: generation.width,
            height: generation.height,
            steps: generation.steps,
            cfg: generation.cfg,
            seed: String(generation.seed),
            batchSize: 1,
            sourceImage: null,
            denoise: 0.55,
        });
        setSourcePreview(undefined);
        document.querySelector('[data-images-composer]')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    const editImage = (image, generation, src) => {
        if (generation !== undefined)
            reuse(generation);
        setDraft(current => ({ ...current, sourceImage: image, batchSize: 1, seed: '' }));
        setSourcePreview(src);
        document.querySelector('[data-images-composer]')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    const remove = async (generation) => {
        setDeleting(current => [...current, generation.promptId]);
        setError(undefined);
        try {
            await removeGeneration(generation.promptId);
            setHistory(current => current.filter(item => item.promptId !== generation.promptId));
            return true;
        }
        catch (reason) {
            setError(errorMessage(reason, t('notice.failed')));
            return false;
        }
        finally {
            setDeleting(current => current.filter(id => id !== generation.promptId));
        }
    };
    const deleteLocalImage = async (image) => {
        setDeleting(current => [...current, image.filename]);
        try {
            await removeImage(image);
            setLibrary(current => ({ images: current.images.filter(item => item.image.filename !== image.filename || item.image.subfolder !== image.subfolder), total: current.total - 1 }));
            return true;
        }
        catch (reason) {
            setError(errorMessage(reason, t('notice.failed')));
            return false;
        }
        finally {
            setDeleting(current => current.filter(id => id !== image.filename));
        }
    };
    const loadMore = async () => {
        setLibraryLoading(true);
        try {
            const page = await readLibrary(library.images.length);
            setLibrary(current => ({ images: [...current.images, ...page.images], total: page.total }));
        }
        catch (reason) {
            setError(errorMessage(reason, t('notice.failed')));
        }
        finally {
            setLibraryLoading(false);
        }
    };
    return (_jsxs("main", { className: css.panel, children: [_jsxs("header", { className: css.header, children: [_jsxs("div", { children: [_jsx("h1", { children: t('page.title') }), _jsx("p", { className: status?.reachable === true ? css.connected : css.offline, children: status?.reachable === true ? t('status.connected') : t('status.offline') })] }), _jsxs("div", { className: css.headerActions, children: [status?.baseUrl !== undefined && _jsx("a", { className: css.openComfy, href: status.baseUrl, target: "_blank", rel: "noreferrer", children: t('action.openComfy') }), _jsxs(Button, { size: "sm", onClick: () => { void refresh(); }, children: [_jsx(IconRefreshOutlineRegular, { size: 14 }), t('action.refresh')] })] })] }), _jsxs("section", { className: css.composer, "data-images-composer": true, children: [_jsxs("div", { className: css.composerHead, children: [_jsxs("div", { children: [_jsx("h2", { children: t('composer.title') }), _jsx("p", { children: t('composer.hint') })] }), selectedWorkflow !== undefined && _jsx("span", { children: selectedWorkflow.label })] }), _jsx("textarea", { className: css.promptInput, value: draft.prompt, "aria-label": t('composer.placeholder'), placeholder: t('composer.placeholder'), onChange: (event) => { set('prompt', event.target.value); } }), draft.sourceImage !== null && (_jsxs("div", { className: css.sourceImage, children: [sourcePreview !== undefined && _jsx("img", { src: sourcePreview, alt: draft.sourceImage.filename }), _jsxs("div", { children: [_jsx("strong", { children: t('composer.sourceImage') }), _jsx("span", { children: draft.sourceImage.filename })] }), _jsx(Button, { size: "sm", onClick: () => { set('sourceImage', null); setSourcePreview(undefined); }, children: t('action.clearSource') })] })), _jsx("input", { className: css.negativeInput, value: draft.negativePrompt, "aria-label": t('composer.negative'), placeholder: selectedWorkflow?.supportsNegativePrompt === false ? t('composer.negativeUnsupported') : t('composer.negative'), disabled: selectedWorkflow?.supportsNegativePrompt === false, onChange: (event) => { set('negativePrompt', event.target.value); } }), _jsxs("div", { className: css.controls, children: [_jsxs("label", { children: [t('composer.workflow'), _jsx("select", { value: draft.workflow, onChange: (event) => {
                                            const workflow = status?.workflows.find(item => item.id === event.target.value);
                                            if (workflow?.available === true) {
                                                setDraft(current => ({
                                                    ...current, workflow: workflow.id, prompt: workflow.starterPrompt,
                                                    model: workflow.source === 'saved' ? workflow.modelId ?? current.model : current.model,
                                                    width: workflow.width, height: workflow.height,
                                                    batchSize: current.sourceImage === null ? workflow.batchSize : 1,
                                                    steps: workflow.recommendedSteps, cfg: workflow.recommendedCfg,
                                                }));
                                            }
                                        }, children: status?.workflows.map(workflow => (_jsxs("option", { value: workflow.id, disabled: !workflow.available, children: [workflow.label, workflow.available ? '' : ` · ${workflow.unavailableReason ?? t('status.unavailable')}`] }, workflow.id))) })] }), status !== undefined && status.models.length > 1 && selectedWorkflow?.source === 'built-in' && (_jsxs("label", { children: [t('composer.model'), _jsx("select", { value: draft.model, onChange: (event) => {
                                            const model = status.models.find(item => item.id === event.target.value);
                                            if (model !== undefined) {
                                                setDraft(current => ({ ...current, model: model.id, steps: model.recommendedSteps, cfg: model.recommendedCfg }));
                                            }
                                        }, children: status.models.map(model => _jsx("option", { value: model.id, children: model.label }, model.id)) })] })), draft.sourceImage === null ? _jsxs("label", { children: [t('composer.size'), _jsxs("select", { value: selectedSize, onChange: (event) => {
                                            const size = SIZES.find(item => `${item.width}x${item.height}` === event.target.value);
                                            if (size !== undefined)
                                                setDraft(current => ({ ...current, width: size.width, height: size.height }));
                                        }, children: [customSize && _jsxs("option", { value: selectedSize, children: [draft.width, " \u00D7 ", draft.height] }), SIZES.map(size => _jsx("option", { value: `${size.width}x${size.height}`, children: t(size.label) }, size.label))] })] }) : _jsxs("label", { children: [t('composer.size'), _jsx("span", { className: css.readonlyValue, children: t('composer.sourceSize') })] }), _jsxs("label", { children: [t('composer.steps'), _jsx("input", { type: "number", min: 1, max: 150, value: draft.steps, onChange: (event) => { set('steps', Number(event.target.value)); } })] }), _jsxs("label", { children: [t('composer.cfg'), _jsx("input", { type: "number", min: 0, max: 30, step: 0.5, value: draft.cfg, onChange: (event) => { set('cfg', Number(event.target.value)); } })] }), _jsxs("label", { children: [t('composer.seed'), _jsx("input", { inputMode: "numeric", value: draft.seed, placeholder: t('composer.random'), onChange: (event) => { set('seed', event.target.value); } })] }), draft.sourceImage === null && _jsxs("label", { children: [t('composer.batch'), _jsx("input", { type: "number", min: 1, max: 8, value: draft.batchSize, onChange: (event) => { set('batchSize', Number(event.target.value)); } })] }), draft.sourceImage !== null && _jsxs("label", { children: [t('composer.denoise'), _jsx("input", { type: "number", min: 0.05, max: 1, step: 0.05, value: draft.denoise, onChange: (event) => { set('denoise', Number(event.target.value)); } })] }), _jsxs(Button, { variant: "primary", disabled: !canGenerate, onClick: () => { void generate(); }, children: [_jsx(IconSparkleRegular, { size: 16 }), busy ? t('composer.generating') : t('composer.generate')] })] }), status?.reachable === true && selectedWorkflow !== undefined && (_jsx("p", { className: css.modelSummary, children: t('composer.usingWorkflow', { workflow: selectedWorkflow.label, model: selectedModel?.label ?? '' }) })), status?.reachable === true && !status.workflows.some(workflow => workflow.available) && _jsx("p", { className: css.notice, children: t('status.noModels') }), error !== undefined && _jsx("p", { className: css.error, role: "alert", children: error })] }), pending.map(promptId => (_jsxs("section", { className: css.pending, children: [_jsx("span", { className: css.pendingArt, children: _jsx(IconSparkleRegular, { size: 24 }) }), _jsx("span", { children: t('pending.title') }), _jsx(Button, { size: "sm", onClick: () => {
                            void cancelGeneration(promptId).then(() => {
                                setPending(current => current.filter(id => id !== promptId));
                            }).catch((reason) => { setError(errorMessage(reason, t('notice.failed'))); });
                        }, children: t('action.cancel') })] }, promptId))), _jsxs("section", { className: css.gallery, children: [_jsxs("div", { className: css.galleryHeader, children: [_jsxs("div", { children: [_jsx("h2", { children: t('gallery.title') }), _jsx("p", { children: t('gallery.count', { count: library.total }) })] }), _jsxs("div", { className: css.galleryTabs, role: "tablist", "aria-label": t('gallery.title'), children: [_jsx(Button, { size: "sm", "aria-selected": galleryView === 'library', role: "tab", onClick: () => { setGalleryView('library'); }, children: t('gallery.library') }), _jsx(Button, { size: "sm", "aria-selected": galleryView === 'recent', role: "tab", onClick: () => { setGalleryView('recent'); }, children: t('gallery.recent') })] })] }), galleryView === 'library' ? (status?.libraryAvailable !== true
                        ? _jsx("p", { className: css.empty, children: t('gallery.unconfigured') })
                        : _jsxs(_Fragment, { children: [library.images.length === 0 && _jsx("p", { className: css.empty, children: libraryLoading ? t('gallery.loading') : t('gallery.emptyLibrary') }), _jsx("div", { className: css.grid, children: library.images.map(stored => (_jsx(ImageCard, { stored: stored, image: stored.image, deleting: deleting.includes(stored.image.filename), load: readImage, onDelete: () => deleteLocalImage(stored.image), onEdit: editImage, t: t }, `${stored.image.subfolder}:${stored.image.filename}`))) }), library.images.length < library.total && _jsx(Button, { size: "sm", disabled: libraryLoading, onClick: () => { void loadMore(); }, children: t('gallery.loadMore') })] })) : history.length === 0 && pending.length === 0
                        ? _jsx("p", { className: css.empty, children: t('gallery.empty') })
                        : _jsx("div", { className: css.grid, children: history.flatMap(generation => generation.images.map(image => (_jsx(ImageCard, { generation: generation, image: image, deleting: deleting.includes(generation.promptId), load: readImage, onDelete: () => remove(generation), onReuse: reuse, onEdit: editImage, t: t }, `${generation.promptId}:${image.subfolder}:${image.filename}`)))) })] })] }));
}
//# sourceMappingURL=ImagesPanel.js.map