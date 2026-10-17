/** Logged context for an Images-owned agent conversation. */
import type { ComfyImagesStatus, ComfyImageReference } from '@deepseek-ai/dsh-api-comfyui-controller/types';
/** Display the user's instruction from a logged Images request.
 * @param text - Logged user-message text.
 * @returns the instruction, or unchanged text for other messages.
 */
export declare function imageUserText(text: string): string;
/**
 * Give the agent an explicit image task and installed workflow discovery starting point.
 * @param prompt - User's unchanged instruction.
 * @param status - Current connected ComfyUI catalog.
 * @param source - User-selected reference, if any.
 * @returns text recorded as the agent's user message.
 */
export declare function imageAgentPrompt(prompt: string, status: ComfyImagesStatus, source: ComfyImageReference | null): string;
//# sourceMappingURL=agent-prompt.d.ts.map