/** Locale keys of the offered examples, in display order. */
export declare const STARTER_KEYS: readonly ["starter.portrait", "starter.edit", "starter.video"];
/** One starter example's locale key. */
export type StarterKey = typeof STARTER_KEYS[number];
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
export declare function Starters({ t, onPick }: {
    readonly t: (key: StarterKey) => string;
    readonly onPick: (text: string) => void;
}): import("react").JSX.Element;
//# sourceMappingURL=Starters.d.ts.map