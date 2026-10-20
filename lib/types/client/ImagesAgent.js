import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/** Embedded Images conversation using the resident Conversation factory. */
import { useEffect, useLayoutEffect, useRef } from 'react';
import { UserTextPresentationContext } from '@deepseek-ai/dsh-client-ui-primitives';
import { imageUserText } from "./agent-prompt.js";
import css from './ImagesPanel.module.css';
import { Button } from '@deepseek-ai/dsh-client-ui-primitives';
import { StudioIdeas } from "./StudioIdeas.js";
function ImagesChatView({ renderSlot }) {
    return renderSlot('conversation.session', { view: 'chat' });
}
/**
 * Refresh media when the Images agent settles; render standard tool and approval UI.
 * @param props - Session-scoped renderer seats and gallery refresh callback.
 * @returns the embedded conversation.
 */
export function ImagesAgent({ useSession, renderFactorySlot, onSettled, onUseStarter, attachPreview, t, readOnly = false }) {
    useLayoutEffect(attachPreview, [attachPreview]);
    const blank = useSession(state => state.blank);
    const running = useSession(state => state.running);
    const error = useSession(state => state.promptError?.error.message ?? state.lastAgentError);
    const wasRunning = useRef(false);
    const refresh = useRef(onSettled);
    refresh.current = onSettled;
    useEffect(() => {
        if (wasRunning.current && !running)
            refresh.current();
        wasRunning.current = running;
    }, [running]);
    return _jsx(UserTextPresentationContext.Provider, { value: imageUserText, children: _jsxs("div", { className: `${css.communityConversation} ${blank && !running ? css.communityBlank : ''}`, children: [blank && !running && _jsxs("div", { className: css.communityGreeting, children: [_jsx("span", { className: css.studioEyebrow, children: t('studio.eyebrow') }), _jsx("h2", { children: t('studio.welcome') }), _jsx("p", { children: t('studio.welcomeHint') }), _jsx(StudioIdeas, { t: t, onPick: onUseStarter, disabled: readOnly })] }), error != null && _jsx("p", { className: css.roomError, role: "alert", children: error }), renderFactorySlot('conversation.content', {
                    variant: 'embedded', phase: 'active', hero: false, transcriptOnly: readOnly,
                }, { slots: { views: ImagesChatView } })] }) });
}
/** Render the resident model and permission controls beside the Images composer.
 * @param props Session controls, stop operation and localized labels.
 * @returns Model selection, permission selection and a stop action while running.
 */
export function ImagesAgentControls({ useSession, renderFactorySlot, stop, locked, t }) {
    const running = useSession(state => state.running);
    return _jsxs(_Fragment, { children: [renderFactorySlot('permission.selection', { locked }), renderFactorySlot('model.selection', { locked }), running && _jsx(Button, { size: "sm", onClick: () => {
                    void stop().catch((_error) => {
                        // Session cancellation publishes its failure through the conversation's prompt error.
                    });
                }, children: t('room.stop') })] });
}
//# sourceMappingURL=ImagesAgent.js.map