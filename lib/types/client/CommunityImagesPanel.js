import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** Dedicated Images navigation around the standard session conversation. */
import { useEffect, useState, useSyncExternalStore } from 'react';
import { Button, StateDot } from '@deepseek-ai/dsh-client-ui-primitives';
import css from './ImagesPanel.module.css';
import { CommunityMedia } from "./CommunityMedia.js";
/** Render profile-installed image generation with ordinary chat tools and cards.
 * @param props - Durable Images sessions, plugin availability, and resident chat slots.
 * @returns The plugin setup state or full session conversation.
 */
export function CommunityImagesPanel(props) {
    const { rooms, currentAgent, settleAgent, openRoom, resetAgent, roomTitle, exportRoom, archiveRoom, renderSlot, SessionProvider, imagePlugin, openImagePlugin, t } = props;
    const navigation = useSyncExternalStore(listener => rooms.subscribe(listener), () => rooms.getSnapshot());
    const [reference, setReference] = useState(currentAgent);
    const [serverPhase, setServerPhase] = useState('checking');
    const [ready, setReady] = useState();
    const [error, setError] = useState();
    const [busy, setBusy] = useState(false);
    const [revision, setRevision] = useState(0);
    const [archived, setArchived] = useState(false);
    const [view, setView] = useState('studio');
    useEffect(() => {
        let disposed = false;
        setReady(undefined);
        setError(undefined);
        void imagePlugin().then((value) => { if (!disposed)
            setReady(value); })
            .catch((cause) => { if (!disposed)
            setError(cause instanceof Error ? cause.message : t('notice.failed')); });
        return () => { disposed = true; };
    }, [imagePlugin, revision, t]);
    useEffect(() => { settleAgent?.(reference); }, [reference, settleAgent]);
    useEffect(() => {
        if (ready !== true || reference !== undefined)
            return undefined;
        let disposed = false;
        void resetAgent().then((value) => { if (!disposed)
            setReference(value); })
            .catch((cause) => { if (!disposed)
            setError(cause instanceof Error ? cause.message : t('notice.failed')); });
        return () => { disposed = true; };
    }, [ready, reference, resetAgent, t]);
    const visibleIds = navigation.ids.filter(id => (navigation.archivedIds ?? []).includes(id) === archived);
    const select = (operation) => {
        setBusy(true);
        setError(undefined);
        void operation().then(setReference)
            .catch((cause) => { setError(cause instanceof Error ? cause.message : t('notice.failed')); })
            .finally(() => { setBusy(false); });
    };
    return _jsxs("main", { className: `${css.panel} ${css.communityPanel}`, "data-studio-view": view, children: [_jsxs("header", { className: `${css.header} ${css.communityHeader}`, children: [_jsxs("div", { children: [_jsx("h1", { children: t('page.title') }), _jsx("p", { children: t('community.description') })] }), _jsxs("div", { className: css.headerActions, children: [_jsx(Button, { variant: "outline", onClick: openImagePlugin, children: t('community.settings') }), _jsx(Button, { variant: "outline", onClick: () => { setRevision(value => value + 1); }, children: t('action.refresh') }), reference !== undefined && _jsx(Button, { variant: "outline", onClick: () => {
                                    void exportRoom(reference.sessionId).then((exported) => { if (!exported)
                                        setError(t('notice.exportUnavailable')); })
                                        .catch((cause) => { setError(cause instanceof Error ? cause.message : t('notice.failed')); });
                                }, children: t('action.export') }), ready === true && _jsx(Button, { variant: "primary", disabled: busy, onClick: () => { select(resetAgent); }, children: t('composer.newConversation') })] })] }), _jsxs("div", { className: css.studioToolbar, children: [_jsxs("div", { className: css.studioTabs, "aria-label": t('studio.views'), children: [_jsx(Button, { variant: "ghost", "aria-pressed": view === 'studio', onClick: () => { setView('studio'); }, children: t('studio.workspace') }), _jsx(Button, { variant: "ghost", "aria-pressed": view === 'library', onClick: () => { setView('library'); }, children: t('studio.library') })] }), _jsxs("details", { className: css.studioConnection, children: [_jsxs("summary", { children: [_jsx(StateDot, { state: serverPhase === 'running' ? 'done' : serverPhase === 'checking' ? 'ongoing' : 'error' }), t(serverPhase === 'running' ? 'studio.connected' : serverPhase === 'checking' ? 'server.checking' : 'studio.offline')] }), _jsx("div", { className: css.serverSection, children: renderSlot('images.connection', { presentation: 'panel', onServerState: setServerPhase,
                                    onSaved: () => { setRevision(value => value + 1); } }) })] })] }), error !== undefined && _jsx("p", { className: css.roomError, role: "alert", children: error }), ready === undefined && error === undefined && _jsx("div", { className: css.welcome, children: _jsx(StateDot, { state: "ongoing", size: 28 }) }), ready === false && _jsxs("section", { className: css.welcome, children: [_jsx("h2", { children: t('community.installTitle') }), _jsx("p", { children: t('community.installHint') }), _jsx(Button, { onClick: openImagePlugin, children: t('community.installAction') }), _jsx("a", { href: "https://github.com/KonnectSuite/dsh-image-gen", target: "_blank", rel: "noreferrer", children: t('community.about') })] }), _jsxs("div", { className: css.studioWorkspace, children: [_jsxs("div", { className: `${css.roomLayout} ${css.communityLayout}`, hidden: view !== 'studio', children: [_jsxs("details", { className: css.studioConversations, children: [_jsxs("summary", { children: [t('room.conversations'), _jsx("span", { className: css.studioConversationTitle, children: reference === undefined ? t('composer.newConversation') : roomTitle(reference.sessionId) })] }), _jsxs("nav", { className: css.conversationList, "aria-label": t('room.conversations'), children: [_jsx(Button, { variant: "ghost", onClick: () => { setArchived(value => !value); }, children: t(archived ? 'room.active' : 'room.archived') }), visibleIds.map(id => _jsxs("div", { className: css.conversationEntry, children: [_jsx("button", { type: "button", className: css.conversationRow, disabled: busy, "aria-current": reference?.sessionId === id ? 'page' : undefined, onClick: () => { select(() => openRoom(id)); }, children: roomTitle(id) }), archiveRoom !== undefined && _jsx(Button, { variant: "ghost", disabled: busy, onClick: () => {
                                                            void archiveRoom(id, !archived).then(() => { if (reference?.sessionId === id && !archived)
                                                                setReference(undefined); })
                                                                .catch((cause) => { setError(cause instanceof Error ? cause.message : t('notice.failed')); });
                                                        }, children: t(archived ? 'room.restore' : 'room.archive') })] }, id))] })] }), _jsxs("section", { className: `${css.creationArea} ${css.chatStage} ${css.communityStage}`, onDragOver: (event) => { if (serverPhase === 'running' && ready === true) {
                                    event.preventDefault();
                                    event.dataTransfer.dropEffect = 'copy';
                                } }, onDrop: (event) => {
                                    if (event.defaultPrevented)
                                        return;
                                    const encoded = event.dataTransfer.getData('application/x-arya-media');
                                    if (encoded === '' && event.dataTransfer.files.length === 0)
                                        return;
                                    event.preventDefault();
                                    if (serverPhase !== 'running' || ready !== true)
                                        return;
                                    try {
                                        let operation;
                                        if (encoded !== '') {
                                            const item = JSON.parse(encoded);
                                            if (typeof item !== 'object' || item === null || !('filename' in item) || typeof item.filename !== 'string'
                                                || !('subfolder' in item) || typeof item.subfolder !== 'string' || !('type' in item) || typeof item.type !== 'string')
                                                throw new Error(t('notice.attachFailed'));
                                            operation = props.addMedia?.([{ filename: item.filename, subfolder: item.subfolder, type: item.type }]);
                                        }
                                        else
                                            operation = props.addFiles?.([...event.dataTransfer.files]);
                                        void operation?.catch((cause) => { setError(cause instanceof Error ? cause.message : t('notice.attachFailed')); });
                                    }
                                    catch (cause) {
                                        setError(cause instanceof Error ? cause.message : t('notice.attachFailed'));
                                    }
                                }, children: [_jsx("p", { className: css.dropHint, children: t('room.mediaDrop') }), ready === true && serverPhase !== 'running' && _jsx("p", { className: css.chatUnavailable, role: "status", children: t('server.chatUnavailable') }), reference !== undefined && _jsx(SessionProvider, { session: reference, children: renderSlot('images.agent', { onSettled: () => { setRevision(value => value + 1); }, onUseStarter: (text) => {
                                                void props.fillDraft?.(text).catch((cause) => { setError(cause instanceof Error ? cause.message : t('notice.failed')); });
                                            }, readOnly: serverPhase !== 'running' || ready !== true || (navigation.archivedIds ?? []).includes(reference.sessionId) }) })] })] }), _jsx(CommunityMedia, { ...props, revision: revision, canCreate: ready === true && serverPhase === 'running' })] })] });
}
//# sourceMappingURL=CommunityImagesPanel.js.map