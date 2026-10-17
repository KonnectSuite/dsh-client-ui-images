import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots';
import { NS } from './locales.ts';
/** Offer creative starting points without sending a request or spending a render.
 * @param props - Localized idea briefs, availability and draft insertion.
 * @returns Keyboard-accessible idea cards.
 */
export declare function StudioIdeas({ t, onPick, disabled }: PropsLocale<typeof NS> & {
    onPick: (text: string) => void;
    disabled: boolean;
}): import("react").JSX.Element;
//# sourceMappingURL=StudioIdeas.d.ts.map