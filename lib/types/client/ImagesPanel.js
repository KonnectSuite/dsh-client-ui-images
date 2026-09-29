import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useState } from 'react';
import { Button, IconDownloadOutlineRegular, IconRefreshOutlineRegular, IconSparkleRegular, IconTrashOutlineRegular, ImageLightbox, Modal, } from '@deepseek-ai/dsh-client-ui-primitives';
import css from './ImagesPanel.module.css';
const SIZES = [
    { label: 'Square · 1024', width: 1024, height: 1024 },
    { label: 'Landscape · 1216 × 832', width: 1216, height: 832 },
    { label: 'Portrait · 832 × 1216', width: 832, height: 1216 },
];
const EMPTY_DRAFT = {
    prompt: '', negativePrompt: '', model: '', workflow: '', width: 1024, height: 1024,
    steps: 24, cfg: 7, seed: '', batchSize: 1,
};
function errorMessage(error, fallback) {
    return error instanceof Error ? error.message : fallback;
}
function ImageCard({ generation, image, deleting, load, onDelete, onReuse, t }) {
    const [src, setSrc] = useState();
    const [failed, setFailed] = useState(false);
    const [open, setOpen] = useState(false);
    const [confirming, setConfirming] = useState(false);
    useEffect(() => {
        const controller = new AbortController();
        void load(image).then((value) => {
            if (!controller.signal.aborted)
                setSrc(value);
        }).catch(() => {
            if (!controller.signal.aborted)
                setFailed(true);
        });
        return () => { controller.abort(); };
    }, [image, load]);
    return (_jsxs("article", { className: css.card, children: [_jsx("button", { type: "button", className: css.preview, disabled: src === undefined, "aria-label": t('gallery.open', { name: image.filename }), onClick: () => { setOpen(true); }, children: src !== undefined
                    ? _jsx("img", { src: src, alt: generation.prompt })
                    : _jsx("span", { className: failed ? css.failed : css.loading, children: failed ? t('gallery.failed') : t('gallery.loading') }) }), _jsxs("div", { className: css.cardBody, children: [_jsx("p", { className: css.workflow, children: t('gallery.workflow', { workflow: generation.workflowLabel }) }), _jsx("p", { className: css.prompt, children: generation.prompt }), _jsxs("p", { className: css.meta, children: [generation.width, " \u00D7 ", generation.height, " \u00B7 ", generation.steps, " steps \u00B7 seed ", generation.seed] }), _jsxs("div", { className: css.cardActions, children: [_jsx(Button, { size: "sm", onClick: () => { onReuse(generation); }, children: t('action.reuse') }), src !== undefined && (_jsxs("a", { className: css.download, href: src, download: image.filename, children: [_jsx(IconDownloadOutlineRegular, { size: 14 }), t('action.download')] })), _jsxs(Button, { className: css.deleteButton, size: "sm", disabled: deleting, onClick: () => { setConfirming(true); }, children: [_jsx(IconTrashOutlineRegular, { size: 14 }), t(deleting ? 'delete.pending' : 'action.delete')] })] })] }), open && src !== undefined && (_jsx(ImageLightbox, { src: src, alt: generation.prompt, labels: { dialog: t('gallery.open', { name: image.filename }), close: t('gallery.close') }, onClose: () => { setOpen(false); } })), _jsx(Modal, { open: confirming, title: t('delete.title'), description: t('delete.description'), closeLabel: t('delete.close'), onClose: () => { if (!deleting)
                    setConfirming(false); }, footer: _jsxs("div", { className: css.confirmActions, children: [_jsx(Button, { variant: "outline", disabled: deleting, onClick: () => { setConfirming(false); }, children: t('delete.cancel') }), _jsxs(Button, { className: css.deleteButton, disabled: deleting, onClick: () => {
                                void onDelete(generation).then((deleted) => { if (deleted)
                                    setConfirming(false); });
                            }, children: [_jsx(IconTrashOutlineRegular, { size: 14 }), t(deleting ? 'delete.pending' : 'delete.confirm')] })] }) })] }));
}
/** Full-page local ComfyUI image generator. */
export function ImagesPanel({ status: readStatus, history: readHistory, generate: requestGeneration, cancel: cancelGeneration, remove: removeGeneration, image: readImage, t, }) {
    const [draft, setDraft] = useState(EMPTY_DRAFT);
    const [status, setStatus] = useState();
    const [history, setHistory] = useState([]);
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
                    model: nextStatus.models.some(item => item.id === current.model) ? current.model : model?.id ?? '',
                    workflow: workflow?.id ?? '',
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
    const selectedWorkflow = status?.workflows.find(workflow => workflow.id === draft.workflow);
    const canGenerate = status?.reachable === true && selectedWorkflow?.available === true && draft.prompt.trim() !== '' && !busy;
    const selectedModel = status?.models.find(model => model.id === draft.model);
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
        });
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
    return (_jsxs("main", { className: css.panel, children: [_jsxs("header", { className: css.header, children: [_jsxs("div", { children: [_jsx("h1", { children: t('page.title') }), _jsx("p", { className: status?.reachable === true ? css.connected : css.offline, children: status?.reachable === true ? t('status.connected') : t('status.offline') })] }), _jsxs("div", { className: css.headerActions, children: [status?.baseUrl !== undefined && _jsx("a", { className: css.openComfy, href: status.baseUrl, target: "_blank", rel: "noreferrer", children: t('action.openComfy') }), _jsxs(Button, { size: "sm", onClick: () => { void refresh(); }, children: [_jsx(IconRefreshOutlineRegular, { size: 14 }), t('action.refresh')] })] })] }), _jsxs("section", { className: css.composer, "data-images-composer": true, children: [_jsx("textarea", { className: css.promptInput, value: draft.prompt, "aria-label": t('composer.placeholder'), placeholder: t('composer.placeholder'), onChange: (event) => { set('prompt', event.target.value); } }), _jsx("input", { className: css.negativeInput, value: draft.negativePrompt, "aria-label": t('composer.negative'), placeholder: selectedWorkflow?.supportsNegativePrompt === false ? t('composer.negativeUnsupported') : t('composer.negative'), disabled: selectedWorkflow?.supportsNegativePrompt === false, onChange: (event) => { set('negativePrompt', event.target.value); } }), _jsxs("div", { className: css.controls, children: [_jsxs("label", { children: [t('composer.workflow'), _jsx("select", { value: draft.workflow, onChange: (event) => {
                                            const workflow = status?.workflows.find(item => item.id === event.target.value);
                                            if (workflow?.available === true) {
                                                setDraft(current => ({
                                                    ...current, workflow: workflow.id, steps: workflow.recommendedSteps, cfg: workflow.recommendedCfg,
                                                }));
                                            }
                                        }, children: status?.workflows.map(workflow => (_jsxs("option", { value: workflow.id, disabled: !workflow.available, children: [workflow.label, workflow.available ? '' : ` · ${workflow.unavailableReason ?? t('status.unavailable')}`] }, workflow.id))) })] }), status !== undefined && status.models.length > 1 && (_jsxs("label", { children: [t('composer.model'), _jsx("select", { value: draft.model, onChange: (event) => {
                                            const model = status.models.find(item => item.id === event.target.value);
                                            if (model !== undefined) {
                                                setDraft(current => ({ ...current, model: model.id, steps: model.recommendedSteps, cfg: model.recommendedCfg }));
                                            }
                                        }, children: status.models.map(model => _jsx("option", { value: model.id, children: model.label }, model.id)) })] })), _jsxs("label", { children: [t('composer.size'), _jsx("select", { value: selectedSize, onChange: (event) => {
                                            const size = SIZES.find(item => `${item.width}x${item.height}` === event.target.value);
                                            if (size !== undefined)
                                                setDraft(current => ({ ...current, width: size.width, height: size.height }));
                                        }, children: SIZES.map(size => _jsx("option", { value: `${size.width}x${size.height}`, children: size.label }, size.label)) })] }), _jsxs("label", { children: [t('composer.steps'), _jsx("input", { type: "number", min: 1, max: 150, value: draft.steps, onChange: (event) => { set('steps', Number(event.target.value)); } })] }), _jsxs("label", { children: [t('composer.cfg'), _jsx("input", { type: "number", min: 0, max: 30, step: 0.5, value: draft.cfg, onChange: (event) => { set('cfg', Number(event.target.value)); } })] }), _jsxs("label", { children: [t('composer.seed'), _jsx("input", { inputMode: "numeric", value: draft.seed, placeholder: t('composer.random'), onChange: (event) => { set('seed', event.target.value); } })] }), _jsxs("label", { children: [t('composer.batch'), _jsx("input", { type: "number", min: 1, max: 8, value: draft.batchSize, onChange: (event) => { set('batchSize', Number(event.target.value)); } })] }), _jsxs(Button, { disabled: !canGenerate, onClick: () => { void generate(); }, children: [_jsx(IconSparkleRegular, { size: 16 }), busy ? t('composer.generating') : t('composer.generate')] })] }), status?.reachable === true && status.models.length === 1 && selectedModel !== undefined && (_jsx("p", { className: css.modelSummary, children: t('composer.usingModel', { model: selectedModel.label }) })), status?.reachable === true && !status.workflows.some(workflow => workflow.available) && _jsx("p", { className: css.notice, children: t('status.noModels') }), error !== undefined && _jsx("p", { className: css.error, role: "alert", children: error })] }), pending.map(promptId => (_jsxs("section", { className: css.pending, children: [_jsx("span", { className: css.pendingArt, children: _jsx(IconSparkleRegular, { size: 24 }) }), _jsx("span", { children: t('pending.title') }), _jsx(Button, { size: "sm", onClick: () => {
                            void cancelGeneration(promptId).then(() => {
                                setPending(current => current.filter(id => id !== promptId));
                            }).catch((reason) => { setError(errorMessage(reason, t('notice.failed'))); });
                        }, children: t('action.cancel') })] }, promptId))), _jsxs("section", { className: css.gallery, children: [_jsx("h2", { children: t('gallery.title') }), history.length === 0 && pending.length === 0
                        ? _jsx("p", { className: css.empty, children: t('gallery.empty') })
                        : _jsx("div", { className: css.grid, children: history.flatMap(generation => generation.images.map(image => (_jsx(ImageCard, { generation: generation, image: image, deleting: deleting.includes(generation.promptId), load: readImage, onDelete: remove, onReuse: reuse, t: t }, `${generation.promptId}:${image.subfolder}:${image.filename}`)))) })] })] }));
}
//# sourceMappingURL=ImagesPanel.js.map