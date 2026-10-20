import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/** Recent ComfyUI runs and the local media library beside community chat. */
import { useEffect, useRef, useState } from 'react';
import { Button, Modal } from '@deepseek-ai/dsh-client-ui-primitives';
import { ImageCard } from "./ImagesPanel.js";
import css from './ImagesPanel.module.css';
/** Render saved media without taking over plugin generation.
 * @param props - Existing media operations and a refresh revision.
 * @returns Recent runs, saved files, and an image-edit prompt.
 */
export function CommunityMedia({ revision, canCreate = true, ...props }) {
    const [runs, setRuns] = useState([]);
    const [library, setLibrary] = useState({ images: [], total: 0 });
    const [error, setError] = useState();
    const [source, setSource] = useState();
    const [prompt, setPrompt] = useState('');
    const [busy, setBusy] = useState(false);
    const [selecting, setSelecting] = useState(false);
    const [selected, setSelected] = useState([]);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const anchor = useRef(undefined);
    const [refresh, setRefresh] = useState(0);
    const [query, setQuery] = useState('');
    const [kind, setKind] = useState('all');
    const [collection, setCollection] = useState('library');
    useEffect(() => {
        let disposed = false;
        void Promise.allSettled([props.history(), props.library(0)]).then(([history, page]) => {
            if (disposed)
                return;
            if (history.status === 'fulfilled')
                setRuns(history.value);
            if (page.status === 'fulfilled')
                setLibrary(page.value);
            const cause = history.status === 'rejected' ? history.reason : page.status === 'rejected' ? page.reason : undefined;
            setError(cause === undefined ? undefined : cause instanceof Error ? cause.message : props.t('notice.failed'));
        });
        return () => { disposed = true; };
    }, [props.history, props.library, props.t, revision, refresh]);
    const key = (image) => JSON.stringify([image.type, image.subfolder, image.filename]);
    const media = [...new Map([...runs.flatMap(run => run.images), ...library.images.map(item => item.image)]
            .map(image => [key(image), image])).values()];
    const chosen = media.filter(image => selected.includes(key(image)));
    const matches = (image, prompt = '') => {
        const video = /\.(mp4|webm|mov|mkv)$/iu.test(image.filename);
        return (kind === 'all' || (kind === 'videos' ? video : !video))
            && `${image.filename} ${prompt}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());
    };
    const visibleMedia = collection === 'recent'
        ? runs.flatMap(run => run.images.filter(image => matches(image, run.prompt)))
        : library.images.filter(item => matches(item.image)).map(item => item.image);
    const toggle = (image, shift) => {
        const index = visibleMedia.findIndex(item => key(item) === key(image));
        const range = shift && anchor.current !== undefined
            ? visibleMedia.slice(Math.min(index, anchor.current), Math.max(index, anchor.current) + 1) : [image];
        setSelected((current) => {
            const next = new Set(current);
            if (!shift && next.has(key(image)))
                next.delete(key(image));
            else
                for (const item of range) {
                    if (next.size < 100)
                        next.add(key(item));
                }
            return [...next];
        });
        anchor.current = index;
    };
    const download = async () => {
        setBusy(true);
        setError(undefined);
        try {
            const url = 'api/comfyui-archive?' + new URLSearchParams({ files: JSON.stringify(chosen) }).toString();
            const response = await fetch(url, { method: 'HEAD' });
            if (!response.ok)
                throw new Error(await response.text());
            const link = document.createElement('a');
            link.href = url;
            link.download = 'aryaai-media.zip';
            link.click();
        }
        catch (cause) {
            setError(cause instanceof Error ? cause.message : props.t('notice.failed'));
        }
        finally {
            setBusy(false);
        }
    };
    const deleteSelection = async () => {
        setBusy(true);
        setError(undefined);
        try {
            const result = await props.removeImages(chosen);
            const deleted = new Set(result.deleted.map(key));
            setRuns(current => current.map(run => ({ ...run, images: run.images.filter(image => !deleted.has(key(image))) })));
            setLibrary(current => ({ images: current.images.filter(item => !deleted.has(key(item.image))),
                total: Math.max(0, current.total - result.deleted.length) }));
            setSelected(current => current.filter(value => !deleted.has(value)));
            setConfirmDelete(false);
            if (result.failed.length > 0)
                setError(props.t('selection.deleteFailed', { count: result.failed.length }));
        }
        catch (cause) {
            setError(cause instanceof Error ? cause.message : props.t('notice.failed'));
        }
        finally {
            setBusy(false);
        }
    };
    const selectionButton = _jsx(Button, { disabled: busy, onClick: () => {
            setSelecting(value => !value);
            setSelected([]);
            anchor.current = undefined;
        }, children: props.t(selecting ? 'selection.done' : 'selection.start') });
    const attach = (image) => {
        setError(undefined);
        void props.addMedia?.([image]).catch((cause) => { setError(cause instanceof Error ? cause.message : props.t('notice.attachFailed')); });
    };
    const edit = (image) => { setSource(image); setPrompt(''); };
    const remove = async (operation) => {
        try {
            await operation();
            setRefresh(value => value + 1);
            return true;
        }
        catch (cause) {
            setError(cause instanceof Error ? cause.message : props.t('notice.failed'));
            return false;
        }
    };
    return _jsxs("div", { className: css.communityMedia, children: [_jsxs("div", { className: css.mediaHeading, children: [_jsxs("div", { children: [_jsx("h2", { children: props.t('studio.library') }), _jsx("p", { children: props.t('studio.mediaHint') })] }), selectionButton] }), _jsxs("div", { className: css.mediaCollections, children: [_jsx(Button, { size: "sm", variant: "ghost", "aria-pressed": collection === 'library', onClick: () => { setCollection('library'); anchor.current = undefined; }, children: props.t('gallery.library') }), _jsx(Button, { size: "sm", variant: "ghost", "aria-pressed": collection === 'recent', onClick: () => { setCollection('recent'); anchor.current = undefined; }, children: props.t('gallery.recent') })] }), _jsx("input", { className: css.mediaSearch, type: "search", value: query, "aria-label": props.t('studio.search'), placeholder: props.t('studio.searchHint'), onChange: (event) => { setQuery(event.target.value); anchor.current = undefined; } }), _jsx("div", { className: css.mediaFilters, children: ['all', 'images', 'videos'].map(value => _jsx(Button, { size: "sm", variant: "ghost", "aria-pressed": kind === value, onClick: () => { setKind(value); anchor.current = undefined; }, children: props.t(`studio.${value}`) }, value)) }), error !== undefined && _jsx("p", { role: "alert", className: css.roomError, children: error }), selecting && _jsxs("div", { className: css.selectionBar, children: [_jsx("span", { children: props.t('selection.count', { count: chosen.length }) }), props.addMedia !== undefined && _jsx(Button, { disabled: !canCreate || busy || chosen.length === 0, onClick: () => {
                            setBusy(true);
                            void props.addMedia?.(chosen).catch((cause) => { setError(cause instanceof Error ? cause.message : props.t('notice.attachFailed')); }).finally(() => { setBusy(false); });
                        }, children: props.t('action.addToChat') }), _jsx(Button, { disabled: busy, onClick: () => { setSelected(visibleMedia.slice(0, 100).map(key)); }, children: props.t('selection.selectLoaded') }), _jsx(Button, { disabled: busy || chosen.length === 0, onClick: () => { setSelected([]); }, children: props.t('selection.clear') }), _jsx(Button, { disabled: busy || chosen.length === 0, onClick: () => { void download(); }, children: props.t('selection.download') }), _jsx(Button, { disabled: busy || chosen.length === 0, onClick: () => { setConfirmDelete(true); }, children: props.t('selection.delete') }), busy && _jsx("span", { role: "status", children: props.t('connection.pending') })] }), visibleMedia.length === 0 && (query !== '' || kind !== 'all') && _jsx("p", { className: css.empty, role: "status", children: props.t('studio.noMatches') }), _jsxs("section", { className: css.gallery, "aria-label": props.t('gallery.recent'), hidden: collection !== 'recent', children: [runs.length === 0 && _jsx("p", { className: css.empty, children: props.t('gallery.empty') }), _jsx("div", { className: css.grid, children: runs.flatMap(run => run.images.filter(image => matches(image, run.prompt)).map(image => _jsx(ImageCard, { generation: run, image: image, deleting: busy, load: props.image, onEdit: canCreate ? edit : undefined, onAttach: canCreate && props.addMedia !== undefined ? attach : undefined, onFrame: canCreate && props.addFiles !== undefined ? async (file) => { await props.addFiles?.([file]); } : undefined, t: props.t, selecting: selecting, selected: selected.includes(key(image)), onSelect: (shift) => { toggle(image, shift); }, onDelete: () => remove(() => props.remove(run.promptId)) }, `${run.promptId}:${image.subfolder}:${image.filename}`))) })] }), _jsxs("section", { className: css.gallery, "aria-label": props.t('gallery.library'), hidden: collection !== 'library', children: [library.images.length === 0 && _jsx("p", { className: css.empty, children: props.t('gallery.emptyLibrary') }), _jsx("div", { className: css.grid, children: library.images.filter(stored => matches(stored.image)).map(stored => _jsx(ImageCard, { image: stored.image, stored: stored, deleting: busy, load: props.image, onEdit: canCreate ? edit : undefined, onAttach: canCreate && props.addMedia !== undefined ? attach : undefined, onFrame: canCreate && props.addFiles !== undefined ? async (file) => { await props.addFiles?.([file]); } : undefined, t: props.t, selecting: selecting, selected: selected.includes(key(stored.image)), onSelect: (shift) => { toggle(stored.image, shift); }, onDelete: () => remove(() => props.removeImage(stored.image)) }, `${stored.image.subfolder}:${stored.image.filename}`)) }), library.images.length < library.total && _jsx(Button, { onClick: () => {
                            void props.library(library.images.length).then((page) => {
                                setLibrary(current => ({ ...page, images: [...current.images, ...page.images] }));
                            })
                                .catch((cause) => { setError(cause instanceof Error ? cause.message : props.t('notice.failed')); });
                        }, children: props.t('gallery.loadMore') })] }), _jsx(Modal, { open: confirmDelete, title: props.t('selection.confirmTitle', { count: chosen.length }), description: props.t('selection.confirmDescription', { count: chosen.length }), closeLabel: props.t('delete.close'), onClose: () => { if (!busy)
                    setConfirmDelete(false); }, footer: _jsxs(_Fragment, { children: [_jsx(Button, { disabled: busy, onClick: () => { setConfirmDelete(false); }, children: props.t('delete.cancel') }), _jsx(Button, { disabled: busy || chosen.length === 0, onClick: () => { void deleteSelection(); }, children: props.t('delete.confirm') })] }) }), _jsx(Modal, { open: source !== undefined, title: props.t('composer.editTitle'), closeLabel: props.t('delete.close'), onClose: () => { if (!busy)
                    setSource(undefined); }, footer: _jsx(Button, { disabled: !canCreate || busy || prompt.trim() === '', onClick: () => {
                        if (source === undefined)
                            return;
                        setBusy(true);
                        void props.status().then(status => props.askAgent(prompt, status, source))
                            .then(() => { setSource(undefined); setRefresh(value => value + 1); })
                            .catch((cause) => { setError(cause instanceof Error ? cause.message : props.t('notice.failed')); })
                            .finally(() => { setBusy(false); });
                    }, children: props.t('room.send') }), children: _jsx("textarea", { "aria-label": props.t('composer.editHint'), placeholder: props.t('composer.editHint'), value: prompt, onChange: (event) => { setPrompt(event.target.value); }, disabled: busy }) })] });
}
//# sourceMappingURL=CommunityMedia.js.map