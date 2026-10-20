import { jsx as _jsx } from "react/jsx-runtime";
/** Starter examples offered while an Images conversation is empty. */
import { Button } from '@deepseek-ai/dsh-client-ui-primitives';
import css from './ImagesPanel.module.css';
/** Locale keys of the offered examples, in display order. */
export const STARTER_KEYS = ['starter.portrait', 'starter.edit', 'starter.video'];
/**
 * Render the empty conversation's examples.
 *
 * A tap fills the composer rather than sending: one click must not spend a
 * generation, and the example is a starting point the user edits rather than the
 * whole of their intent.
 *
 * Both empty states use this — the panel's, and the blank-room one inside
 * `ImagesAgent` — so the two cannot drift apart.
 *
 * @param props - Localized labels and the composer fill.
 * @returns the example buttons.
 */
export function Starters({ t, onPick }) {
    return _jsx("div", { className: css.starters, children: STARTER_KEYS.map(key => _jsx(Button, { size: "sm", variant: "outline", onClick: () => { onPick(t(key)); }, children: t(key) }, key)) });
}
//# sourceMappingURL=Starters.js.map