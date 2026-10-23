import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { isStillMediaType } from "./media.js";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Button, IconArchiveOutlineRegular, IconUnarchiveOutlineRegular, IconDownloadOutlineRegular, IconMicrophoneOutlineRegular, Tooltip, IconRefreshOutlineRegular, IconLinkOutlineRegular, IconSparkleRegular, IconPlusOutlineRegular, IconSendOutlineRegular, IconTrashOutlineRegular, ImageLightbox, Modal, } from '@deepseek-ai/dsh-client-ui-primitives';
import { Starters } from "./Starters.js";
import { classifyWorkflow, describeCapability } from "./routing.js";
import css from './ImagesPanel.module.css';
const SIZES = [
    { label: 'composer.sizeSquare', width: 1024, height: 1024 },
    { label: 'composer.sizeLandscape', width: 1216, height: 832 },
    { label: 'composer.sizePortrait', width: 832, height: 1216 },
];
const BATCH_LIMIT = 100;
const COMFY_MEDIA_ROUTE = 'api/comfyui-media';
const COMFY_ARCHIVE_ROUTE = 'api/comfyui-archive';
function mediaKey(image) {
    return `${image.subfolder}\0${image.filename}`;
}
function mediaUrl(image) {
    return `${COMFY_MEDIA_ROUTE}?${new URLSearchParams({ filename: image.filename, subfolder: image.subfolder })}`;
}
function archiveUrl(images) {
    return `${COMFY_ARCHIVE_ROUTE}?${new URLSearchParams({ files: JSON.stringify(images) })}`;
}
function isVideo(image) {
    return /\.(mp4|webm|mov|mkv)$/iu.test(image.filename);
}
const EMPTY_DRAFT = {
    prompt: '', negativePrompt: '', model: '', workflow: '', width: 1024, height: 1024,
    steps: 24, cfg: 7, seed: '', batchSize: 1,
    sourceImage: null, denoise: 0.55,
};
function errorMessage(error, fallback) {
    return error instanceof Error ? error.message : fallback;
}
/** Render saved or generated media with preview, download, edit, and delete actions.
 * @param props - Media metadata, loader, actions, and localized labels.
 * @returns A media card.
 */
export function ImageCard({ generation, stored, image, deleting, selecting, selected, onSelect, load, onDelete, onReuse, onEdit, onAttach, onFrame, onReveal, t, }) {
    const [remoteSrc, setRemoteSrc] = useState();
    const [failed, setFailed] = useState(false);
    const [open, setOpen] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [visible, setVisible] = useState(false);
    const cardRef = useRef(null);
    const videoRef = useRef(null);
    const [frameError, setFrameError] = useState(false);
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
        if (!visible || stored !== undefined)
            return undefined;
        const controller = new AbortController();
        void load(image).then((value) => {
            if (!controller.signal.aborted)
                setRemoteSrc(value);
        }).catch(() => {
            if (!controller.signal.aborted)
                setFailed(true);
        });
        return () => { controller.abort(); };
    }, [image, load, stored, visible]);
    const src = stored === undefined ? remoteSrc : visible ? mediaUrl(image) : undefined;
    const video = isVideo(image);
    return (_jsxs("article", { ref: cardRef, draggable: !selecting, onDragStart: (event) => {
            event.dataTransfer.setData('application/x-arya-media', JSON.stringify(image));
            event.dataTransfer.effectAllowed = 'copy';
        }, className: `${css.card} ${selected ? css.cardSelected : ''}`, children: [_jsxs("div", { className: css.previewFrame, children: [video
                        ? src !== undefined && !failed
                            ? _jsx("video", { ref: videoRef, className: css.video, src: src, controls: !selecting, preload: "metadata", playsInline: true, onError: () => { setFailed(true); } })
                            : _jsx("div", { className: css.preview, children: _jsx("span", { className: failed ? css.failed : css.loading, children: failed ? t('gallery.failed') : t('gallery.loading') }) })
                        : _jsx("button", { type: "button", className: css.preview, disabled: src === undefined && !selecting, "aria-label": selecting ? t('selection.toggle', { name: image.filename }) : t('gallery.open', { name: image.filename }), onClick: (event) => { if (selecting)
                                onSelect?.(event.shiftKey);
                            else
                                setOpen(true); }, children: src !== undefined
                                ? _jsx("img", { src: src, alt: generation?.prompt ?? image.filename, loading: "lazy", onError: () => { setFailed(true); } })
                                : _jsx("span", { className: failed ? css.failed : css.loading, children: failed ? t('gallery.failed') : t('gallery.loading') }) }), selecting && _jsx("button", { type: "button", className: `${css.selectionControl} ${video ? css.videoSelection : ''}`, "aria-pressed": selected, "aria-label": t('selection.toggle', { name: image.filename }), onClick: (event) => { onSelect?.(event.shiftKey); }, children: _jsx("span", { className: css.selectionCheck, "aria-hidden": "true", children: selected ? '✓' : '' }) })] }), _jsxs("div", { className: css.cardBody, children: [frameError && _jsx("p", { role: "alert", children: t('notice.frameFailed') }), _jsx("p", { className: css.workflow, children: generation === undefined ? t(video ? 'gallery.localVideo' : 'gallery.localFile') : t('gallery.workflow', { workflow: generation.workflowLabel }) }), _jsx("p", { className: css.prompt, children: generation?.prompt ?? image.filename }), _jsx("p", { className: css.meta, children: generation === undefined
                            ? t('gallery.fileMeta', { date: new Date(stored?.modifiedAt ?? 0).toLocaleDateString(), size: Math.round((stored?.bytes ?? 0) / 1024) })
                            : t('gallery.runMeta', { width: generation.width, height: generation.height, steps: generation.steps, seed: generation.seed }) }), !selecting && _jsxs("div", { className: css.cardActions, children: [video && onFrame !== undefined && _jsx(Button, { size: "sm", onClick: () => {
                                    const player = videoRef.current;
                                    if (player === null || player.videoWidth === 0) {
                                        setFrameError(true);
                                        return;
                                    }
                                    const canvas = document.createElement('canvas');
                                    canvas.width = player.videoWidth;
                                    canvas.height = player.videoHeight;
                                    try {
                                        const context = canvas.getContext('2d');
                                        if (context === null)
                                            throw new Error('Canvas unavailable');
                                        context.drawImage(player, 0, 0);
                                        canvas.toBlob((blob) => {
                                            if (blob === null) {
                                                setFrameError(true);
                                                return;
                                            }
                                            void onFrame(new File([blob], image.filename + '-frame.png', { type: 'image/png' }))
                                                .then(() => { setFrameError(false); }).catch(() => { setFrameError(true); });
                                        }, 'image/png');
                                    }
                                    catch (_error) {
                                        setFrameError(true);
                                    }
                                }, children: t('action.useFrame') }), onAttach !== undefined && _jsx(Button, { size: "sm", onClick: () => { onAttach(image); }, children: t('action.addToChat') }), generation !== undefined && !video && onReuse !== undefined && _jsx(Button, { size: "sm", onClick: () => { onReuse(generation); }, children: t('action.reuse') }), src !== undefined && !video && onEdit !== undefined && _jsx(Button, { size: "sm", onClick: () => { onEdit(image, generation, src); }, children: t('action.editImage') }), onReveal !== undefined && _jsx(Button, { size: "sm", variant: "outline", onClick: () => { onReveal(); }, children: t('action.showInExplorer') }), src !== undefined && (_jsxs("a", { className: css.download, href: stored === undefined ? src : mediaUrl(image), download: image.filename, children: [_jsx(IconDownloadOutlineRegular, { size: 14 }), t('action.download')] })), _jsxs(Button, { className: css.deleteButton, size: "sm", disabled: deleting, onClick: () => { setConfirming(true); }, children: [_jsx(IconTrashOutlineRegular, { size: 14 }), t(deleting ? 'delete.pending' : 'action.delete')] })] })] }), open && src !== undefined && !video && (_jsx(ImageLightbox, { src: src, alt: generation?.prompt ?? image.filename, labels: { dialog: t('gallery.open', { name: image.filename }), close: t('gallery.close') }, onClose: () => { setOpen(false); } })), _jsx(Modal, { open: confirming, title: t('delete.title'), description: t(generation === undefined ? 'delete.fileDescription' : 'delete.description'), closeLabel: t('delete.close'), onClose: () => { if (!deleting)
                    setConfirming(false); }, footer: _jsxs("div", { className: css.confirmActions, children: [_jsx(Button, { variant: "outline", disabled: deleting, onClick: () => { setConfirming(false); }, children: t('delete.cancel') }), _jsxs(Button, { className: css.deleteButton, disabled: deleting, onClick: () => {
                                void onDelete().then((deleted) => { if (deleted)
                                    setConfirming(false); });
                            }, children: [_jsx(IconTrashOutlineRegular, { size: 14 }), t(deleting ? 'delete.pending' : 'delete.confirm')] })] }) })] }));
}
/** Full-page local ComfyUI image generator. */
export function ImagesPanel({ autoPreview, renderSlot, SessionProvider, currentAgent, settleAgent, rooms, openRoom, roomTitle, archiveRoom, resetAgent, exportRoom, askAgent, openVoiceSettings, status: readStatus, history: readHistory, library: readLibrary, generate: requestGeneration, cancel: cancelGeneration, remove: removeGeneration, removeImage, removeImages, image: readImage, t, }) {
    const subscribePreview = useCallback((listener) => autoPreview.subscribe(listener), [autoPreview]);
    const getPreview = useCallback(() => autoPreview.getSnapshot(), [autoPreview]);
    const preview = useSyncExternalStore(subscribePreview, getPreview);
    const [requestedAuto, setAuto] = useState(true);
    const auto = preview && requestedAuto;
    const [agent, setAgent] = useState(currentAgent);
    useEffect(() => { settleAgent?.(agent); }, [agent, settleAgent]);
    const [newRoom, setNewRoom] = useState(false);
    const subscribeRooms = useCallback((listener) => rooms.subscribe(listener), [rooms]);
    const getRooms = useCallback(() => rooms.getSnapshot(), [rooms]);
    const roomState = useSyncExternalStore(subscribeRooms, getRooms);
    const [uploads, setUploads] = useState([]);
    const [draft, updateDraft] = useState(EMPTY_DRAFT);
    const draftRef = useRef(draft), promptRevision = useRef(0);
    const promptRef = useRef(null);
    const uploadRef = useRef(null);
    const attachmentEpoch = useRef(0);
    const [uploadReads, setUploadReads] = useState(0);
    useEffect(() => () => { attachmentEpoch.current++; }, []);
    const [dragging, setDragging] = useState(false);
    const [voiceActive, setVoiceActive] = useState(false);
    const setDraft = useCallback((update) => {
        const next = typeof update === 'function' ? update(draftRef.current) : update;
        if (next.prompt !== draftRef.current.prompt)
            promptRevision.current++;
        draftRef.current = next;
        updateDraft(next);
    }, []);
    // One tap puts an example in the composer and focuses it. The example is a
    // starting point the user edits, and a suggestion must never send by itself.
    const useStarter = useCallback((text) => {
        setDraft(current => ({ ...current, prompt: text }));
        document.querySelector('[data-images-composer] textarea')?.focus();
    }, [setDraft]);
    const [status, setStatus] = useState();
    const [history, setHistory] = useState([]);
    const [library, setLibrary] = useState({ images: [], total: 0 });
    const [libraryLoading, setLibraryLoading] = useState(false);
    const [sourcePreview, setSourcePreview] = useState();
    const [pending, setPending] = useState([]);
    const [error, setError] = useState();
    const [busy, setBusy] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [showArchived, setShowArchived] = useState(false);
    const busyRef = useRef(busy);
    busyRef.current = busy;
    const [deleting, setDeleting] = useState([]);
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedKeys, setSelectedKeys] = useState([]);
    const [selectionError, setSelectionError] = useState();
    const [bulkBusy, setBulkBusy] = useState(false);
    const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
    const selectionAnchor = useRef(null);
    useEffect(() => {
        if (!auto || agent !== undefined)
            return undefined;
        let disposed = false;
        // A blank room is what makes the composer's own controls exist: the model and
        // permission seats are session-scoped, so a panel with no session has no model
        // control to offer — which reads as "you cannot choose a model here". Opening
        // the recorded room when there is one, and starting a blank room when there is
        // not, gives every visit a session to bind them to. `resetAgent` reuses an
        // existing blank room instead of creating another, so this is one session per
        // user rather than one per visit.
        const opening = roomState.active === null ? resetAgent() : openRoom(roomState.active);
        void opening.then((reference) => { if (!disposed)
            setAgent(reference); })
            .catch((reason) => { if (!disposed && !(reason instanceof DOMException && reason.name === 'AbortError'))
            setError(errorMessage(reason, t('notice.failed'))); });
        return () => { disposed = true; };
    }, [auto, agent, roomState.active, openRoom, resetAgent, t]);
    const loadUploads = async (files) => {
        if (files.length === 0)
            return;
        setError(undefined);
        if (files.some(file => !isStillMediaType(file.type))) {
            setError(t('composer.uploadType'));
            return;
        }
        const epoch = attachmentEpoch.current;
        setUploadReads(current => current + 1);
        try {
            const images = await Promise.all(files.map(async (file) => {
                const mediaType = file.type;
                /* v8 ignore next -- the batch was refused above for any file this check would reject. */
                if (!isStillMediaType(mediaType))
                    throw new Error(t('composer.uploadType'));
                const dataUrl = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => { if (typeof reader.result === 'string')
                        resolve(reader.result);
                    else
                        reject(new Error(t('notice.failed'))); };
                    reader.onerror = () => { reject(reader.error ?? new Error(t('notice.failed'))); };
                    reader.readAsDataURL(file);
                });
                return { type: 'image', mediaType, data: dataUrl.slice(dataUrl.indexOf(',') + 1), name: file.name };
            }));
            if (epoch !== attachmentEpoch.current)
                return;
            setUploads(current => [...current, ...images]);
            set('sourceImage', null);
            setSourcePreview(undefined);
        }
        catch (reason) {
            if (epoch === attachmentEpoch.current)
                setError(errorMessage(reason, t('notice.failed')));
        }
        finally {
            setUploadReads(current => current - 1);
        }
    };
    const refresh = useCallback(async () => {
        try {
            const nextStatus = await readStatus();
            setStatus(nextStatus);
            const nextHistory = nextStatus.reachable ? await readHistory() : [];
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
                    prompt: current.prompt,
                    width: currentWorkflow === undefined ? workflow?.width ?? current.width : current.width,
                    height: currentWorkflow === undefined ? workflow?.height ?? current.height : current.height,
                    batchSize: currentWorkflow === undefined ? workflow?.batchSize ?? current.batchSize : current.batchSize,
                    steps: currentWorkflow === undefined ? workflow?.recommendedSteps ?? current.steps : current.steps,
                    cfg: currentWorkflow === undefined ? workflow?.recommendedCfg ?? current.cfg : current.cfg,
                };
            });
            setError(nextStatus.error ?? undefined);
        }
        catch (reason) {
            setError(errorMessage(reason, t('notice.failed')));
        }
    }, [readHistory, readStatus, setDraft, t]);
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
    const inputActions = {
        captureInsertion: () => ({ start: promptRef.current?.selectionStart ?? draftRef.current.prompt.length,
            end: promptRef.current?.selectionEnd ?? draftRef.current.prompt.length, draftRev: promptRevision.current }),
        insertText: (text, span) => {
            if (busyRef.current || span.draftRev !== promptRevision.current)
                return false;
            const current = draftRef.current.prompt;
            setDraft({ ...draftRef.current, prompt: current.slice(0, span.start) + text + current.slice(span.end) });
            requestAnimationFrame(() => {
                promptRef.current?.focus();
                promptRef.current?.setSelectionRange(span.start + text.length, span.start + text.length);
            });
            return true;
        },
    };
    const selectedSize = `${draft.width}x${draft.height}`;
    const customSize = !SIZES.some(size => `${size.width}x${size.height}` === selectedSize);
    const selectedWorkflow = status?.workflows.find(workflow => workflow.id === draft.workflow);
    // A post-processing graph encodes no prompt, so demanding one would require input it discards.
    const promptGiven = selectedWorkflow?.takesPrompt === false || draft.prompt.trim() !== '';
    const canGenerate = (auto ? status !== undefined : status?.reachable === true && selectedWorkflow?.available === true) && promptGiven && (auto || selectedWorkflow?.task !== 'edit' || draft.sourceImage !== null) && !busy && !voiceActive && uploadReads === 0;
    // The disabled Generate button is otherwise silent about the one requirement a reference
    // workflow has, so name it while that is what is missing.
    const needsReference = !auto && selectedWorkflow?.task === 'edit' && draft.sourceImage === null;
    const selectedModel = status?.models.find(model => model.id === (selectedWorkflow?.source === 'saved' ? selectedWorkflow.modelId : draft.model));
    const selectedSet = new Set(selectedKeys);
    const media = [...new Map([
            ...history.flatMap(run => run.images), ...library.images.map(item => item.image),
        ].map(image => [mediaKey(image), image])).values()];
    const selectedMedia = media.filter(image => selectedSet.has(mediaKey(image)));
    const toggleSelection = (index, shift) => {
        const item = media[index];
        if (item === undefined)
            return;
        const key = mediaKey(item);
        if (selectedKeys.length >= BATCH_LIMIT && !selectedSet.has(key) && !shift) {
            setSelectionError(t('selection.limit'));
            return;
        }
        setSelectionError(undefined);
        setSelectedKeys((current) => {
            const next = new Set(current);
            if (shift && selectionAnchor.current !== null) {
                const first = Math.min(index, selectionAnchor.current);
                const last = Math.max(index, selectionAnchor.current);
                for (const item of media.slice(first, last + 1)) {
                    if (next.size >= BATCH_LIMIT)
                        break;
                    next.add(mediaKey(item));
                }
            }
            else if (next.has(key))
                next.delete(key);
            else if (next.size < BATCH_LIMIT)
                next.add(key);
            return [...next];
        });
        selectionAnchor.current = index;
    };
    const downloadSelected = async () => {
        /* v8 ignore next -- the controls that call this are disabled while the selection is empty. */
        if (selectedMedia.length === 0)
            return;
        setBulkBusy(true);
        setSelectionError(undefined);
        try {
            const url = archiveUrl(selectedMedia);
            const response = await fetch(url, { method: 'HEAD' });
            if (!response.ok)
                throw new Error(await response.text());
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = 'aryaai-media.zip';
            anchor.click();
        }
        catch (reason) {
            setSelectionError(errorMessage(reason, t('notice.failed')));
        }
        finally {
            setBulkBusy(false);
        }
    };
    const deleteSelected = async () => {
        /* v8 ignore next -- the controls that call this are disabled while the selection is empty. */
        if (selectedMedia.length === 0)
            return;
        setBulkBusy(true);
        setSelectionError(undefined);
        try {
            if (status?.libraryAvailable !== true) {
                const runs = history.filter(run => run.images.some(image => selectedSet.has(mediaKey(image))));
                if (runs.some(run => run.images.some(image => !selectedSet.has(mediaKey(image))))) {
                    setSelectionError(t('selection.wholeRuns'));
                    setBulkDeleteOpen(false);
                    return;
                }
                for (const run of runs) {
                    await removeGeneration(run.promptId);
                    const removedKeys = new Set(run.images.map(mediaKey));
                    setHistory(current => current.filter(item => item.promptId !== run.promptId));
                    setSelectedKeys(current => current.filter(key => !removedKeys.has(key)));
                }
                setBulkDeleteOpen(false);
                return;
            }
            const result = await removeImages(selectedMedia);
            const deletedKeys = new Set(result.deleted.map(mediaKey));
            setLibrary(current => ({
                images: current.images.filter(item => !deletedKeys.has(mediaKey(item.image))),
                total: Math.max(0, current.total - current.images.filter(item => deletedKeys.has(mediaKey(item.image))).length),
            }));
            setHistory(current => current.map(run => ({ ...run, images: run.images.filter(image => !deletedKeys.has(mediaKey(image))) })));
            setSelectedKeys(current => current.filter(key => !deletedKeys.has(key)));
            setBulkDeleteOpen(false);
            if (result.failed.length > 0)
                setSelectionError(t('selection.deleteFailed', { count: result.failed.length }));
        }
        catch (reason) {
            setSelectionError(errorMessage(reason, t('notice.failed')));
        }
        finally {
            setBulkBusy(false);
        }
    };
    const generate = async () => {
        setBusy(true);
        setError(undefined);
        try {
            if (auto && status !== undefined) {
                setAgent(await askAgent(draft.prompt, status, draft.sourceImage, uploads.length > 0 ? uploads : undefined));
                setNewRoom(false);
                setDraft(current => ({ ...current, prompt: '', sourceImage: null }));
                attachmentEpoch.current++;
                setUploads([]);
                setSourcePreview(undefined);
                return;
            }
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
        attachmentEpoch.current++;
        setAuto(false);
        setUploads([]);
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
            sourceImage: generation.sourceImage ?? null,
            denoise: generation.denoise && generation.denoise > 0 ? generation.denoise : 0.55,
        });
        setSourcePreview(undefined);
        document.querySelector('[data-images-composer]')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    const editImage = (image, generation, src) => {
        attachmentEpoch.current++;
        if (generation !== undefined)
            reuse(generation);
        if (preview)
            setAuto(true);
        setUploads([]);
        // The deployment's own reference edit is the designed target. Saved graphs that need a source
        // also report the edit task, and they sort ahead of it, so matching on the task alone would
        // aim this action at whichever one the server lists first.
        const editWorkflow = status?.workflows.find(workflow => workflow.task === 'edit' && workflow.source === 'built-in' && workflow.available)
            ?? status?.workflows.find(workflow => workflow.task === 'edit' && workflow.available);
        setDraft(current => ({ ...current, sourceImage: image, batchSize: 1, seed: '', prompt: '',
            workflow: editWorkflow?.id ?? current.workflow, model: editWorkflow?.modelId ?? current.model,
            steps: editWorkflow?.recommendedSteps ?? current.steps, cfg: editWorkflow?.recommendedCfg ?? current.cfg }));
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
            const key = mediaKey(image);
            setLibrary(current => ({ images: current.images.filter(item => mediaKey(item.image) !== key), total: current.total - 1 }));
            setSelectedKeys(current => current.filter(item => item !== key));
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
    return (_jsxs("main", { className: css.panel, children: [_jsxs("header", { className: css.header, children: [_jsxs("div", { children: [_jsx("h1", { children: t('page.title') }), _jsx("p", { className: status?.reachable === true ? css.connected : css.offline, children: status?.reachable === true ? t('status.connected') : t('status.offline') })] }), _jsxs("div", { className: css.headerActions, children: [renderSlot('images.connection', { onSaved: () => { void refresh(); } }), _jsx(Tooltip, { label: t('action.export'), side: "bottom", delayMs: 500, portal: true, children: _jsxs(Button, { size: "sm", disabled: agent === undefined || exporting, "aria-label": t('action.export'), onClick: () => {
                                        const reference = agent;
                                        /* v8 ignore next -- the button is disabled without a room, so this cannot run. */
                                        if (reference === undefined)
                                            return;
                                        setExporting(true);
                                        setError(undefined);
                                        void exportRoom(reference.sessionId).then((started) => {
                                            if (!started)
                                                setError(t('notice.exportUnavailable'));
                                        }).catch((reason) => { setError(errorMessage(reason, t('notice.failed'))); })
                                            .finally(() => { setExporting(false); });
                                    }, children: [_jsx(IconDownloadOutlineRegular, { size: 14 }), _jsx("span", { className: css.actionLabel, children: t('action.export') })] }) }), status?.baseUrl !== undefined && _jsx(Tooltip, { label: t('action.openComfy'), side: "bottom", delayMs: 500, portal: true, children: _jsxs("a", { className: css.openComfy, href: status.baseUrl, target: "_blank", rel: "noreferrer", "aria-label": t('action.openComfy'), children: [_jsx(IconLinkOutlineRegular, { size: 14 }), _jsx("span", { className: css.actionLabel, children: t('action.openComfy') })] }) }), _jsx(Tooltip, { label: t('action.refresh'), side: "bottom", delayMs: 500, portal: true, children: _jsxs(Button, { size: "sm", onClick: () => { void refresh(); }, "aria-label": t('action.refresh'), children: [_jsx(IconRefreshOutlineRegular, { size: 14 }), _jsx("span", { className: css.actionLabel, children: t('action.refresh') })] }) })] })] }), preview && _jsxs("div", { className: css.modeBar, children: [_jsx(Button, { variant: auto ? 'primary' : 'outline', onClick: () => { setAuto(true); }, children: t('composer.auto') }), _jsx(Button, { variant: !auto ? 'primary' : 'outline', onClick: () => { setAuto(false); }, children: t('composer.advanced') }), auto && _jsxs(Button, { variant: "outline", disabled: busy, "aria-label": t('composer.newConversation'), onClick: () => {
                            attachmentEpoch.current++;
                            setBusy(true);
                            setError(undefined);
                            void resetAgent().then((reference) => {
                                setAgent(reference);
                                setNewRoom(true);
                                setDraft(EMPTY_DRAFT);
                                setSourcePreview(undefined);
                                setUploads([]);
                            }).catch((reason) => { setError(errorMessage(reason, t('notice.failed'))); }).finally(() => { setBusy(false); });
                        }, children: [_jsx(IconPlusOutlineRegular, { size: 16 }), _jsx("span", { className: css.actionLabel, children: t('composer.newConversation') })] })] }), error !== undefined && _jsx("p", { className: css.roomError, role: "alert", children: error }), _jsxs("div", { className: `${css.roomLayout} ${auto ? css.withRooms : ''}`, children: [auto && _jsxs("nav", { className: css.conversationList, "aria-label": t('room.conversations'), children: [_jsx("h2", { children: t('room.conversations') }), _jsx(Button, { size: "sm", variant: "ghost", onClick: () => { setShowArchived(value => !value); }, children: t(showArchived ? 'room.active' : 'room.archived') }), roomState.ids.filter(id => (roomState.archivedIds ?? []).includes(id) === showArchived).map(id => _jsxs("div", { className: css.conversationEntry, children: [_jsx(Tooltip, { label: roomTitle(id), side: "right", delayMs: 500, children: _jsxs("button", { type: "button", disabled: busy, className: css.conversationRow, "aria-current": roomState.active === id ? 'page' : undefined, onClick: () => {
                                                attachmentEpoch.current++;
                                                setBusy(true);
                                                setError(undefined);
                                                void openRoom(id).then((reference) => {
                                                    setAgent(reference);
                                                    setNewRoom(false);
                                                    setDraft(EMPTY_DRAFT);
                                                    setUploads([]);
                                                    setSourcePreview(undefined);
                                                })
                                                    .catch((reason) => { setError(errorMessage(reason, t('notice.failed'))); }).finally(() => { setBusy(false); });
                                            }, children: [_jsx(IconSparkleRegular, { size: 16 }), _jsx("span", { children: roomTitle(id) })] }) }), archiveRoom !== undefined && _jsx(Tooltip, { label: t(showArchived ? 'room.restore' : 'room.archive'), side: "bottom", delayMs: 500, children: _jsx(Button, { size: "sm", variant: "ghost", className: css.conversationAction, disabled: busy, "aria-label": t(showArchived ? 'room.restore' : 'room.archive'), onClick: () => {
                                                setBusy(true);
                                                setError(undefined);
                                                void archiveRoom(id, !showArchived).then(() => {
                                                    if (roomState.active === id && !showArchived) {
                                                        setAgent(undefined);
                                                        setNewRoom(true);
                                                        setDraft(EMPTY_DRAFT);
                                                    }
                                                }).catch((reason) => { setError(errorMessage(reason, t('notice.failed'))); }).finally(() => { setBusy(false); });
                                            }, children: showArchived ? _jsx(IconUnarchiveOutlineRegular, { size: 14 }) : _jsx(IconArchiveOutlineRegular, { size: 14 }) }) })] }, id))] }), _jsxs("div", { className: `${css.creationArea} ${auto ? css.chatStage : ''}`, onDragOver: (event) => { if (auto && !busy && event.dataTransfer.types.includes('Files')) {
                            event.preventDefault();
                            event.dataTransfer.dropEffect = 'copy';
                            setDragging(true);
                        } }, onDragLeave: (event) => {
                            if (!event.currentTarget.contains(event.relatedTarget instanceof Node ? event.relatedTarget : null))
                                setDragging(false);
                        }, onDrop: (event) => {
                            if (!auto)
                                return;
                            event.preventDefault();
                            setDragging(false);
                            if (!busy)
                                void loadUploads(Array.from(event.dataTransfer.files));
                        }, children: [auto && _jsx("section", { className: css.agentConversation, "data-conversation-scroll": "", "aria-label": t('room.conversation'), children: agent !== undefined && !newRoom
                                    ? _jsx(SessionProvider, { session: agent, children: renderSlot('images.agent', { onSettled: () => { void refresh(); void refreshLibrary(); }, onUseStarter: useStarter }) })
                                    : _jsxs("div", { className: css.welcome, children: [_jsx(IconSparkleRegular, { size: 28 }), _jsx("h2", { children: t('room.welcome') }), _jsx("p", { children: t('composer.autoHint') }), _jsx(Starters, { t: t, onPick: useStarter })] }) }), _jsxs("section", { className: `${css.composer} ${auto ? css.autoComposer : ''} ${dragging ? css.dropActive : ''}`, "data-images-composer": true, children: [!auto && _jsxs("div", { className: css.composerHead, children: [_jsxs("div", { children: [_jsx("h2", { children: t(draft.sourceImage === null ? 'composer.title' : 'composer.editTitle') }), _jsx("p", { children: t(draft.sourceImage === null ? 'composer.hint' : 'composer.editHint') })] }), selectedWorkflow !== undefined && _jsx("span", { children: selectedWorkflow.label })] }), _jsxs("div", { className: css.promptArea, children: [_jsx("textarea", { ref: promptRef, className: css.promptInput, value: draft.prompt, "aria-label": t('composer.placeholder'), placeholder: t('composer.placeholder'), onChange: (event) => { set('prompt', event.target.value); }, onPaste: (event) => {
                                                    if (!auto || busy)
                                                        return;
                                                    const files = Array.from(event.clipboardData.files).filter(item => item.type.startsWith('image/'));
                                                    if (files.length > 0) {
                                                        event.preventDefault();
                                                        void loadUploads(files);
                                                    }
                                                }, onKeyDown: (event) => { if (auto && event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing && canGenerate) {
                                                    event.preventDefault();
                                                    void generate();
                                                } } }), !auto && _jsx("div", { className: css.promptVoice, children: renderSlot('images.prompt.activity', { inputActions, locked: busy, onActiveChange: setVoiceActive }, {
                                                    fallback: _jsx(Tooltip, { label: t('composer.voiceSetup'), side: "top", portal: true, children: _jsx(Button, { size: "sm", type: "button", "aria-label": t('composer.voiceSetup'), onClick: openVoiceSettings, children: _jsx(IconMicrophoneOutlineRegular, { size: 18 }) }) }),
                                                }) })] }), auto && _jsx("input", { ref: uploadRef, className: css.fileInput, "aria-label": t('composer.upload'), type: "file", multiple: true, accept: "image/png,image/jpeg,image/webp,image/gif", disabled: busy, onChange: (event) => {
                                            void loadUploads(Array.from(event.target.files ?? []));
                                            event.target.value = '';
                                        } }), draft.sourceImage !== null && (_jsxs("div", { className: css.sourceImage, children: [sourcePreview !== undefined && _jsx("img", { src: sourcePreview, alt: draft.sourceImage.filename }), _jsxs("div", { children: [_jsx("strong", { children: t('composer.sourceImage') }), _jsx("span", { children: draft.sourceImage.filename })] }), _jsx(Button, { size: "sm", onClick: () => { set('sourceImage', null); setSourcePreview(undefined); }, children: t('action.clearSource') })] })), uploads.length > 0 && _jsx("div", { className: css.attachments, children: uploads.map((upload, index) => _jsxs("div", { className: css.sourceImage, children: [_jsx("img", { src: `data:${upload.mediaType};base64,${upload.data}`, alt: upload.name ?? '' }), _jsxs("div", { children: [_jsx("strong", { children: t('composer.sourceImage') }), _jsx("span", { children: upload.name })] }), _jsx(Button, { size: "sm", onClick: () => { setUploads(current => current.filter((_, position) => position !== index)); }, children: t('action.clearSource') })] }, index)) }), !auto && _jsx("input", { className: css.negativeInput, value: draft.negativePrompt, "aria-label": t('composer.negative'), placeholder: selectedWorkflow?.supportsNegativePrompt === false ? t('composer.negativeUnsupported') : t('composer.negative'), disabled: selectedWorkflow?.supportsNegativePrompt === false, onChange: (event) => { set('negativePrompt', event.target.value); } }), !auto && _jsxs("div", { className: css.controls, children: [_jsxs("label", { children: [t('composer.workflow'), _jsx("select", { value: draft.workflow, onChange: (event) => {
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
                                                        }, children: status?.workflows.map(workflow => (_jsxs("option", { value: workflow.id, disabled: !workflow.available, children: [workflow.label, " \u00B7 ", describeCapability(classifyWorkflow(workflow)), workflow.available ? '' : ` · ${workflow.unavailableReason ?? t('status.unavailable')}`] }, workflow.id))) })] }), status !== undefined && status.models.filter(model => model.kind !== 'flux2-klein').length > 1 && selectedWorkflow?.task !== 'edit' && selectedWorkflow?.source === 'built-in' && (_jsxs("label", { children: [t('composer.model'), _jsx("select", { value: draft.model, onChange: (event) => {
                                                            const model = status.models.find(item => item.id === event.target.value);
                                                            if (model !== undefined) {
                                                                setDraft(current => ({ ...current, model: model.id, steps: model.recommendedSteps, cfg: model.recommendedCfg }));
                                                            }
                                                        }, children: status.models.filter(model => model.kind !== 'flux2-klein').map(model => _jsx("option", { value: model.id, children: model.label }, model.id)) })] })), draft.sourceImage === null ? _jsxs("label", { children: [t('composer.size'), _jsxs("select", { value: selectedSize, onChange: (event) => {
                                                            const size = SIZES.find(item => `${item.width}x${item.height}` === event.target.value);
                                                            if (size !== undefined)
                                                                setDraft(current => ({ ...current, width: size.width, height: size.height }));
                                                        }, children: [customSize && _jsxs("option", { value: selectedSize, children: [draft.width, " \u00D7 ", draft.height] }), SIZES.map(size => _jsx("option", { value: `${size.width}x${size.height}`, children: t(size.label) }, size.label))] })] }) : _jsxs("label", { children: [t('composer.size'), _jsx("span", { className: css.readonlyValue, children: t('composer.sourceSize') })] }), _jsxs("label", { children: [t('composer.steps'), _jsx("input", { type: "number", min: 1, max: 150, value: draft.steps, onChange: (event) => { set('steps', Number(event.target.value)); } })] }), _jsxs("label", { children: [t('composer.cfg'), _jsx("input", { type: "number", min: 0, max: 30, step: 0.5, value: draft.cfg, onChange: (event) => { set('cfg', Number(event.target.value)); } })] }), _jsxs("label", { children: [t('composer.seed'), _jsx("input", { inputMode: "numeric", value: draft.seed, placeholder: t('composer.random'), onChange: (event) => { set('seed', event.target.value); } })] }), draft.sourceImage === null && _jsxs("label", { children: [t('composer.batch'), _jsx("input", { type: "number", min: 1, max: 8, value: draft.batchSize, onChange: (event) => { set('batchSize', Number(event.target.value)); } })] }), draft.sourceImage !== null && selectedWorkflow?.task !== 'edit' && _jsxs("label", { children: [t('composer.denoise'), _jsx("input", { type: "number", min: 0.05, max: 1, step: 0.05, value: draft.denoise, onChange: (event) => { set('denoise', Number(event.target.value)); } })] }), _jsx(Tooltip, { label: t(needsReference ? 'room.attachHint' : 'composer.generate'), side: "top", portal: true, children: _jsxs(Button, { variant: "primary", disabled: !canGenerate, onClick: () => { void generate(); }, children: [_jsx(IconSparkleRegular, { size: 16 }), busy ? t('composer.generating') : t('composer.generate')] }) })] }), auto && _jsxs("div", { className: css.composerToolbar, children: [_jsx(Tooltip, { label: t('composer.upload'), side: "top", portal: true, children: _jsx(Button, { size: "sm", "aria-label": t('composer.upload'), disabled: busy, onClick: () => { uploadRef.current?.click(); }, children: _jsx(IconPlusOutlineRegular, { size: 18 }) }) }), _jsx("span", { className: css.dropHint, children: t(dragging ? 'room.drop' : 'room.attachHint') }), agent !== undefined && _jsx(SessionProvider, { session: agent, children: renderSlot('images.agent.controls', { locked: busy }) }), _jsxs("div", { className: css.composerActions, children: [renderSlot('images.prompt.activity', { inputActions, locked: busy, onActiveChange: setVoiceActive }, {
                                                        fallback: _jsx(Tooltip, { label: t('composer.voiceSetup'), side: "top", portal: true, children: _jsx(Button, { size: "sm", "aria-label": t('composer.voiceSetup'), onClick: openVoiceSettings, children: _jsx(IconMicrophoneOutlineRegular, { size: 18 }) }) }),
                                                    }), _jsx(Tooltip, { label: t('room.send'), side: "top", portal: true, children: _jsx(Button, { variant: "primary", className: css.sendButton, "aria-label": t('room.send'), disabled: !canGenerate, onClick: () => { void generate(); }, children: _jsx(IconSendOutlineRegular, { size: 18 }) }) })] })] }), !auto && status?.reachable === true && selectedWorkflow !== undefined && (_jsx("p", { className: css.modelSummary, children: t('composer.usingWorkflow', { workflow: selectedWorkflow.label, model: selectedModel?.label ?? '' }) })), !auto && status?.reachable === true && !status.workflows.some(workflow => workflow.available) && _jsx("p", { className: css.notice, children: t('status.noModels') })] }), pending.map(promptId => (_jsxs("section", { className: css.pending, children: [_jsx("span", { className: css.pendingArt, children: _jsx(IconSparkleRegular, { size: 24 }) }), _jsx("span", { children: t('pending.title') }), _jsx(Button, { size: "sm", onClick: () => {
                                            void cancelGeneration(promptId).then(() => {
                                                setPending(current => current.filter(id => id !== promptId));
                                            }).catch((reason) => { setError(errorMessage(reason, t('notice.failed'))); });
                                        }, children: t('action.cancel') })] }, promptId)))] }), _jsxs("section", { className: css.gallery, "aria-label": t('gallery.recent'), children: [_jsxs("div", { className: css.galleryHeader, children: [_jsxs("div", { children: [_jsx("h2", { children: t('gallery.recent') }), _jsx("p", { children: t('gallery.recentHint') })] }), media.length > 0 && _jsx(Button, { size: "sm", onClick: () => { setSelectionMode(current => !current); setSelectedKeys([]); selectionAnchor.current = null; }, children: t(selectionMode ? 'selection.done' : 'selection.start') })] }), selectionMode && _jsxs("div", { className: css.selectionBar, children: [_jsx("strong", { children: t('selection.count', { count: selectedMedia.length }) }), _jsx("span", { children: t('selection.hint') }), _jsx(Button, { size: "sm", disabled: bulkBusy, onClick: () => {
                                            setSelectedKeys(media.slice(0, BATCH_LIMIT).map(mediaKey));
                                            setSelectionError(media.length > BATCH_LIMIT ? t('selection.limit') : undefined);
                                        }, children: t('selection.selectLoaded') }), _jsx(Button, { size: "sm", disabled: bulkBusy || selectedMedia.length === 0, onClick: () => { setSelectedKeys([]); selectionAnchor.current = null; }, children: t('selection.clear') }), _jsxs(Button, { size: "sm", disabled: bulkBusy || selectedMedia.length === 0, onClick: () => { void downloadSelected(); }, children: [_jsx(IconDownloadOutlineRegular, { size: 14 }), t('selection.download')] }), _jsxs(Button, { size: "sm", className: css.deleteButton, disabled: bulkBusy || selectedMedia.length === 0, onClick: () => { setBulkDeleteOpen(true); }, children: [_jsx(IconTrashOutlineRegular, { size: 14 }), t(status?.libraryAvailable === true ? 'selection.delete' : 'selection.removeRuns')] })] }), selectionError !== undefined && _jsx("p", { className: css.selectionError, role: "alert", children: selectionError }), history.length === 0 && pending.length === 0
                                ? _jsx("p", { className: css.empty, children: t('gallery.empty') })
                                : _jsx("div", { className: css.grid, children: history.flatMap(generation => generation.images.map(image => (_jsx(ImageCard, { generation: generation, image: image, deleting: deleting.includes(generation.promptId), load: readImage, onDelete: () => remove(generation), selecting: selectionMode, selected: selectedSet.has(mediaKey(image)), onSelect: (shift) => { toggleSelection(media.findIndex(item => mediaKey(item) === mediaKey(image)), shift); }, onReuse: reuse, onEdit: editImage, t: t }, `${generation.promptId}:${image.subfolder}:${image.filename}`)))) })] }), _jsxs("section", { className: css.gallery, "aria-label": t('gallery.library'), children: [_jsxs("div", { className: css.galleryHeader, children: [_jsxs("div", { children: [_jsx("h2", { children: t('gallery.library') }), _jsx("p", { children: t('gallery.count', { count: library.total }) })] }), _jsx("div", { className: css.galleryHeaderActions, children: library.images.length > 0 && _jsx(Button, { size: "sm", onClick: () => {
                                                setSelectionMode(current => !current);
                                                setSelectedKeys([]);
                                                setSelectionError(undefined);
                                                selectionAnchor.current = null;
                                            }, children: t(selectionMode ? 'selection.done' : 'selection.start') }) })] }), status?.libraryAvailable !== true
                                ? _jsx("p", { className: css.empty, children: t('gallery.unconfigured') })
                                : _jsxs(_Fragment, { children: [library.images.length === 0 && _jsx("p", { className: css.empty, children: libraryLoading ? t('gallery.loading') : t('gallery.emptyLibrary') }), _jsx("div", { className: css.grid, children: library.images.map(stored => (_jsx(ImageCard, { stored: stored, image: stored.image, deleting: deleting.includes(stored.image.filename), load: readImage, selecting: selectionMode, selected: selectedSet.has(mediaKey(stored.image)), onSelect: (shift) => { toggleSelection(media.findIndex(item => mediaKey(item) === mediaKey(stored.image)), shift); }, onDelete: () => deleteLocalImage(stored.image), onEdit: editImage, t: t }, `${stored.image.subfolder}:${stored.image.filename}`))) }), library.images.length < library.total && _jsx(Button, { size: "sm", disabled: libraryLoading, onClick: () => { void loadMore(); }, children: t('gallery.loadMore') })] })] })] }), _jsx(Modal, { open: bulkDeleteOpen, title: t(status?.libraryAvailable === true ? 'selection.confirmTitle' : 'selection.removeRunsTitle', { count: selectedMedia.length }), description: t(status?.libraryAvailable === true ? 'selection.confirmDescription' : 'selection.removeRunsDescription', { count: selectedMedia.length }), closeLabel: t('delete.close'), onClose: () => { if (!bulkBusy)
                    setBulkDeleteOpen(false); }, footer: _jsxs("div", { className: css.confirmActions, children: [_jsx(Button, { variant: "outline", disabled: bulkBusy, onClick: () => { setBulkDeleteOpen(false); }, children: t('delete.cancel') }), _jsxs(Button, { className: css.deleteButton, disabled: bulkBusy, onClick: () => { void deleteSelected(); }, children: [_jsx(IconTrashOutlineRegular, { size: 14 }), t(bulkBusy ? 'delete.pending' : status?.libraryAvailable === true ? 'selection.confirmDelete' : 'selection.removeRuns')] })] }) })] }));
}
//# sourceMappingURL=ImagesPanel.js.map