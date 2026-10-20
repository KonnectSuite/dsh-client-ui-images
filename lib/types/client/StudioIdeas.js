import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/** Editable creative briefs offered before a Content conversation begins. */
import { IconSparkleRegular, IconEditOutlineRegular, IconEnhanceOutlineRegular, IconMicrophoneOutlineRegular, IconPlanOutlineRegular } from '@deepseek-ai/dsh-client-ui-primitives';
import css from './ImagesPanel.module.css';
const IDEAS = ['photo', 'edit', 'design', 'animate', 'film', 'storyboard'];
/** Offer creative starting points without sending a request or spending a render.
 * @param props - Localized idea briefs, availability and draft insertion.
 * @returns Keyboard-accessible idea cards.
 */
export function StudioIdeas({ t, onPick, disabled }) {
    return _jsx("div", { className: css.ideaGrid, children: IDEAS.map((idea, index) => {
            const Icon = index === 1 ? IconEditOutlineRegular : index === 2 ? IconEnhanceOutlineRegular
                : index === 4 ? IconMicrophoneOutlineRegular : index === 5 ? IconPlanOutlineRegular : IconSparkleRegular;
            return _jsxs("button", { type: "button", className: css.ideaCard, disabled: disabled, onClick: () => { onPick(t(`studio.${idea}.prompt`)); }, children: [_jsx("span", { className: css.ideaArtwork, "data-kind": idea, "aria-hidden": "true", children: _jsx(Icon, {}) }), _jsxs("span", { className: css.ideaCopy, children: [_jsx("span", { className: css.ideaTitle, children: t(`studio.${idea}.title`) }), _jsx("span", { className: css.ideaHint, children: t(`studio.${idea}.hint`) })] })] }, idea);
        }) });
}
//# sourceMappingURL=StudioIdeas.js.map