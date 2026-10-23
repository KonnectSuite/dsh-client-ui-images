import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/** Profile connection form shared by Images direct generation and MCP execution. */
import { useEffect, useRef, useState } from 'react';
import { Button, Modal, StateDot, Tooltip, IconSlidersTwoOutlineRegular } from '@deepseek-ai/dsh-client-ui-primitives';
import { openFolder, pickOutputFolder, readOutputFolders } from "./folders.js";
import css from './ImagesPanel.module.css';
/** Open, test and save the profile's ComfyUI connection without losing the image draft.
 * @param props Localized form and persistent connection operations.
 * @returns Header action and dismissable connection modal.
 */
export function ComfyConnection({ t, readConnection, testConnection, saveConnection, onSaved, startServer, stopServer, restartServer, readStatus, pollIntervalMs, onServerState, presentation }) {
    const [open, setOpen] = useState(false);
    const [settings, setSettings] = useState();
    const [pending, setPending] = useState(false);
    const [error, setError] = useState();
    const [tested, setTested] = useState(false);
    const [serverBusy, setServerBusy] = useState(false);
    const [phase, setPhase] = useState('checking');
    const operation = useRef(false);
    const epoch = useRef(0);
    const [statusRevision, setStatusRevision] = useState(0);
    const [serverState, setServerState] = useState();
    const [serverError, setServerError] = useState();
    const [suggestion, setSuggestion] = useState();
    useEffect(() => {
        if (!open)
            return undefined;
        let disposed = false;
        void readOutputFolders().then((choices) => {
            if (!disposed)
                setSuggestion(choices.candidates[0]);
        }).catch(() => { if (!disposed)
            setSuggestion(undefined); });
        return () => { disposed = true; };
    }, [open]);
    useEffect(() => { onServerState?.(phase); }, [onServerState, phase]);
    useEffect(() => {
        if (readStatus === undefined)
            return undefined;
        let disposed = false;
        let timer;
        const check = async () => {
            const version = epoch.current;
            try {
                if (!operation.current) {
                    const status = await readStatus();
                    if (!disposed && version === epoch.current) {
                        setPhase(status.reachable ? 'running' : 'stopped');
                        setServerError(undefined);
                    }
                }
            }
            catch (cause) {
                if (!disposed && version === epoch.current && !operation.current) {
                    setPhase('failed');
                    setServerError(cause instanceof Error ? cause.message : String(cause));
                }
            }
            finally {
                if (!disposed && pollIntervalMs !== undefined)
                    timer = setTimeout(() => { void check(); }, pollIntervalMs());
            }
        };
        void check();
        return () => { disposed = true; if (timer !== undefined)
            clearTimeout(timer); };
    }, [readStatus, pollIntervalMs, statusRevision]);
    const fail = (reason) => { setError(reason instanceof Error ? reason.message : String(reason)); };
    const control = async (action, transition) => {
        epoch.current++;
        operation.current = true;
        setPhase(transition);
        setServerBusy(true);
        setServerError(undefined);
        try {
            const result = await action();
            setServerState(result.detail);
            setPhase(result.running ? 'running' : 'stopped');
            onSaved();
        }
        catch (reason) {
            setPhase('failed');
            setServerError(reason instanceof Error ? reason.message : String(reason));
        }
        finally {
            operation.current = false;
            setServerBusy(false);
        }
    };
    const show = async () => {
        setOpen(true);
        setPending(true);
        setSettings(undefined);
        setError(undefined);
        setTested(false);
        try {
            setSettings(await readConnection());
        }
        catch (reason) {
            fail(reason);
        }
        finally {
            setPending(false);
        }
    };
    const test = async () => {
        /* v8 ignore next -- the footer disables Test and Save until the profile's connection loads. */
        if (!settings)
            return;
        setPending(true);
        setError(undefined);
        setTested(false);
        try {
            await testConnection(settings.baseUrl);
            setTested(true);
        }
        catch (reason) {
            fail(reason);
        }
        finally {
            setPending(false);
        }
    };
    const save = async () => {
        /* v8 ignore next -- the footer disables Test and Save until the profile's connection loads. */
        if (!settings)
            return;
        setPending(true);
        setError(undefined);
        try {
            await saveConnection(settings);
            epoch.current++;
            setPhase('checking');
            setStatusRevision(value => value + 1);
            onSaved();
            setOpen(false);
        }
        catch (reason) {
            fail(reason);
        }
        finally {
            setPending(false);
        }
    };
    const browse = async () => {
        setPending(true);
        setError(undefined);
        try {
            const result = await pickOutputFolder();
            if (result.kind === 'picked')
                setSettings(current => current === undefined ? current : { ...current, outputDirectory: result.path });
            else if (result.kind === 'unsupported')
                setError(t('gallery.folderPickerUnavailable'));
        }
        catch (reason) {
            fail(reason);
        }
        finally {
            setPending(false);
        }
    };
    const revealCurrent = async () => {
        /* v8 ignore next -- the button is disabled until the profile's connection loads. */
        if (!settings)
            return;
        setError(undefined);
        try {
            await openFolder(settings.outputDirectory.trim());
        }
        catch (reason) {
            fail(reason);
        }
    };
    /* v8 ignore next -- the stylesheet always declares the class; the empty fallback only satisfies exactOptionalPropertyTypes. */
    const dialogClass = css.connectionDialog ?? '';
    const controls = _jsxs("div", { className: css.serverActions, children: [_jsx(Button, { disabled: serverBusy || phase === 'running' || phase === 'checking', onClick: () => { void control(startServer, 'starting'); }, children: t('connection.serverStart') }), _jsx(Button, { variant: "outline", disabled: serverBusy || phase !== 'running', onClick: () => { void control(stopServer, 'stopping'); }, children: t('connection.serverStop') }), _jsx(Button, { variant: "outline", disabled: serverBusy || phase !== 'running', onClick: () => { void control(restartServer, 'restarting'); }, children: t('connection.serverRestart') })] });
    const transitioning = phase === 'checking' || phase === 'starting' || phase === 'stopping' || phase === 'restarting';
    return _jsxs(_Fragment, { children: [presentation === 'panel' && _jsxs("section", { className: css.serverPanel, "data-server-state": phase, "aria-busy": transitioning, children: [_jsxs("div", { className: css.serverSummary, children: [_jsx(StateDot, { state: transitioning ? 'ongoing' : phase === 'running' ? 'done' : phase === 'failed' ? 'error' : 'idle', size: 24 }), _jsxs("div", { children: [_jsx("h2", { children: t('server.title') }), _jsx("p", { role: "status", "aria-live": "polite", children: t(`server.${phase}`) })] })] }), controls, transitioning && _jsx("div", { className: css.serverProgress, role: "progressbar", "aria-label": t(`server.${phase}`) }), serverError !== undefined && _jsx("p", { className: css.roomError, role: "alert", children: serverError })] }), _jsx(Tooltip, { label: t('connection.open'), side: "bottom", delayMs: 500, portal: true, children: _jsxs(Button, { size: "sm", onClick: () => { void show(); }, "aria-label": t('connection.open'), children: [_jsx(IconSlidersTwoOutlineRegular, { size: 14 }), _jsx("span", { className: css.actionLabel, children: t('connection.open') })] }) }), _jsx(Modal, { open: open, title: t('connection.title'), closeLabel: t('delete.close'), className: dialogClass, onClose: () => { if (!pending)
                    setOpen(false); }, footer: _jsxs("div", { className: css.confirmActions, children: [_jsx(Button, { variant: "outline", disabled: pending, onClick: () => { setOpen(false); }, children: t('delete.cancel') }), _jsx(Button, { variant: "outline", disabled: pending || !settings?.baseUrl.trim(), onClick: () => { void test(); }, children: t('connection.test') }), _jsx(Button, { disabled: pending || !settings?.baseUrl.trim(), onClick: () => { void save(); }, children: t(pending ? 'connection.pending' : 'connection.save') })] }), children: _jsxs("div", { className: css.connectionForm, children: [_jsx("p", { children: t('connection.description') }), settings && _jsxs(_Fragment, { children: [_jsxs("label", { children: [t('connection.location'), _jsxs("select", { disabled: pending, value: settings.remote ? 'remote' : 'local', onChange: (event) => { setSettings({ ...settings, remote: event.target.value === 'remote' }); setTested(false); }, children: [_jsx("option", { value: "local", children: t('connection.local') }), _jsx("option", { value: "remote", children: t('connection.remote') })] })] }), _jsxs("label", { children: [t('connection.address'), _jsx("input", { type: "url", disabled: pending, value: settings.baseUrl, onChange: (event) => { setSettings({ ...settings, baseUrl: event.target.value }); setTested(false); } })] }), _jsxs("label", { children: [t('connection.folder'), _jsx("input", { disabled: pending, value: settings.outputDirectory, onChange: (event) => { setSettings({ ...settings, outputDirectory: event.target.value }); } })] }), _jsxs("div", { className: css.folderRow, children: [_jsx(Button, { variant: "outline", disabled: pending, onClick: () => { void browse(); }, children: t('connection.folderBrowse') }), _jsx(Button, { variant: "outline", disabled: pending || settings.outputDirectory.trim() === '', onClick: () => { void revealCurrent(); }, children: t('connection.folderOpen') })] }), _jsx("p", { children: t('connection.folderHint') }), suggestion !== undefined && settings.outputDirectory.trim() === '' && _jsxs("p", { className: css.folderSuggestion, children: [_jsx("span", { children: t('connection.folderDetected', { path: suggestion.path, count: suggestion.files }) }), _jsx(Button, { size: "sm", disabled: pending, onClick: () => { setSettings({ ...settings, outputDirectory: suggestion.path }); }, children: t('connection.folderUseDetected') })] })] }), _jsx("div", { role: "status", "aria-live": "polite", children: pending ? t('connection.pending') : tested ? t('connection.connected') : null }), error && _jsx("p", { role: "alert", className: css.error, children: error }), _jsxs("section", { children: [_jsx("p", { children: t('connection.serverDescription') }), _jsx("p", { role: "status", children: t(`server.${phase}`) }), _jsxs("div", { className: css.confirmActions, children: [_jsx(Button, { variant: "outline", disabled: serverBusy, onClick: () => { void control(startServer, 'starting'); }, children: t('connection.serverStart') }), _jsx(Button, { variant: "outline", disabled: serverBusy, onClick: () => { void control(stopServer, 'stopping'); }, children: t('connection.serverStop') }), _jsx(Button, { variant: "outline", disabled: serverBusy, onClick: () => { void control(restartServer, 'restarting'); }, children: t('connection.serverRestart') })] }), _jsx("div", { role: "status", "aria-live": "polite", children: serverBusy ? t('connection.serverPending') : serverState ?? null }), serverError && _jsx("p", { role: "alert", className: css.error, children: serverError })] })] }) })] });
}
//# sourceMappingURL=ComfyConnection.js.map