/** Embedded Images conversation using the resident Conversation factory. */
import { type ReactNode } from 'react';
import type { PropsRuntime, PropsRenderFactories, PropsLocale } from '@deepseek-ai/dsh-client-ui-slots';
import { NS } from './locales.ts';
/**
 * Refresh media when the Images agent settles; render standard tool and approval UI.
 * @param props - Session-scoped renderer seats and gallery refresh callback.
 * @returns the embedded conversation.
 */
export declare function ImagesAgent({ useSession, renderFactorySlot, onSettled, onUseStarter, attachPreview, t, readOnly }: PropsRuntime<'images.agent'> & PropsRenderFactories & PropsLocale<typeof NS> & {
    onSettled: () => void;
    onUseStarter: (text: string) => void;
    attachPreview: () => () => void;
    readOnly?: boolean;
}): ReactNode;
/** Render the resident model and permission controls beside the Images composer.
 * @param props Session controls, stop operation and localized labels.
 * @returns Model selection, permission selection and a stop action while running.
 */
export declare function ImagesAgentControls({ useSession, renderFactorySlot, stop, locked, t }: PropsRuntime<'images.agent.controls'> & PropsRenderFactories & PropsLocale<typeof NS> & {
    stop: () => Promise<void>;
    locked: boolean;
}): ReactNode;
//# sourceMappingURL=ImagesAgent.d.ts.map