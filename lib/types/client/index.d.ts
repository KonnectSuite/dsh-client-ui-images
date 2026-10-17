/** Cordis registration for AryaAI's global Images page. */
import type { Context as ClientContext } from '@deepseek-ai/cordis';
import { type ComfyServerPhase } from './ComfyConnection.tsx';
import { type ImagesKey } from './locales.ts';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface SlotMap {
        /** Shared profile connection editor for direct and MCP ComfyUI execution. */
        'images.connection': {
            kind: 'single';
            scope: 'root';
            owner: {
                onSaved: () => void;
                presentation?: 'panel';
                onServerState?: (phase: ComfyServerPhase) => void;
            };
        };
        /** Dedicated agent conversation, independent of the selected main chat. */
        'images.agent': {
            kind: 'single';
            scope: 'session';
            owner: {
                onSettled: () => void;
                onUseStarter: (text: string) => void;
                readOnly?: boolean;
            };
        };
        /** Resident model, permission and stop controls for the Images composer. */
        'images.agent.controls': {
            kind: 'single';
            scope: 'session';
            owner: {
                locked: boolean;
            };
        };
        /** Optional dictation control; inserting text never submits a generation. */
        'images.prompt.activity': {
            kind: 'single';
            scope: 'root';
            owner: ImagePromptActivityProps;
        };
    }
    interface LocaleNamespaceMap {
        /** Local ComfyUI generation page copy. */
        images: ImagesKey;
    }
}
/** Selection and revision actions supplied by the image prompt to dictation. */
export interface ImagePromptActivityProps {
    /** Capture the selection and reject insertion after subsequent prompt edits. */
    inputActions: {
        captureInsertion(): {
            start: number;
            end: number;
            draftRev: number;
        };
        insertText(text: string, span: {
            start: number;
            end: number;
            draftRev: number;
        }): boolean;
    };
    /** Prevent capture and insertion during generation submission. */
    locked: boolean;
    /** Report capture, transcription and feedback activity to the page. */
    onActiveChange(active: boolean): void;
}
declare module '@deepseek-ai/dsh-api-session-controller/client' {
    interface SessionReferenceSourceMap {
        /** Images panel conversation lifetime. */
        imagesConversation: unknown;
    }
}
export declare const inject: string[];
/** Register the global page and its left-sidebar navigation entry. */
export declare function apply(ctx: ClientContext): void;
//# sourceMappingURL=index.d.ts.map