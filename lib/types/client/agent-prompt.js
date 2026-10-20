import { classifyWorkflow, describeCapability } from "./routing.js";
/** Opening lines an assembled Images prompt can carry. Sessions logged before the generation
 * tool existed open with the older wording, and their messages are still in the transcript. */
const IMAGES_TASK_PREFIXES = [
    'Images task: use the enabled ComfyUI MCP tools',
    'Images task: choose and execute a suitable installed workflow',
];
/** Display the user's instruction from a logged Images request.
 * @param text - Logged user-message text.
 * @returns the instruction, or unchanged text for other messages.
 */
export function imageUserText(text) {
    const marker = '\n\nUser request:\n';
    const position = text.indexOf(marker);
    return IMAGES_TASK_PREFIXES.some(prefix => text.startsWith(prefix)) && position !== -1
        ? text.slice(position + marker.length) : text;
}
/**
 * Give the agent an explicit image task and installed workflow discovery starting point.
 * @param prompt - User's unchanged instruction.
 * @param status - Current connected ComfyUI catalog.
 * @param source - User-selected reference, if any.
 * @returns text recorded as the agent's user message.
 */
export function imageAgentPrompt(prompt, status, source) {
    const workflows = status.workflows.filter(workflow => workflow.available).map(workflow => ({
        id: workflow.id,
        label: workflow.label,
        task: workflow.task ?? 'create',
        // What the graph is for. Choosing between workflows should be a choice among
        // labelled options, not an inference from a filename.
        capability: describeCapability(classifyWorkflow(workflow)),
        model: workflow.modelId,
        // The panel already holds the settings it would submit with. Passing them here
        // is what lets the agent submit on its first call instead of reading each
        // workflow back over MCP to learn defaults this side already knows.
        size: `${String(workflow.width)}x${String(workflow.height)}`,
        steps: workflow.recommendedSteps,
        cfg: workflow.recommendedCfg,
        supportsNegativePrompt: workflow.supportsNegativePrompt,
        batch: workflow.batchSize,
        // A saved graph's saved prompt is where a workflow's required words live: a style LoRA's
        // trigger terms, for instance, reach the model only through the text the graph ships with.
        // Without it a request naming that style finds a workflow labelled for something else.
        starterPrompt: workflow.starterPrompt,
    }));
    return [
        'Images task: choose and execute a suitable installed workflow, and submit it with the images_generate tool when that tool is available — it takes a catalog id and returns the files — falling back to the enabled ComfyUI MCP tools when it is not. Keep this conversation focused on creating and editing media.',
        'Inspect available workflows/models when needed. Select by the requested subject, style and operation; do not reuse an unrelated preset. For edits, inspect the reference and use reference-image conditioning where available, preserving details the user did not request changing. Resolve short follow-ups against the previous result.',
        'Prefer the panel catalog below when it covers the request: submit that workflow directly instead of enumerating tools, nodes, models and workflows first. Query the MCP server only when the catalog cannot serve the request, and then only for the part you need; the catalog is a direct-generation subset, not the full capability list. Do not call a server-environment tool to confirm the server: its address is given below and the catalog above is what it can run. Choose text-to-image, reference editing, inpainting, pose guidance, upscaling or image-to-video from the request and installed capabilities. For video, confirm only missing essential details; do not silently substitute a still image. The same applies to a named output format: these graphs write still images and video, so a request for a container they do not write — a GIF, an APNG — is answered by naming the formats that are available and what the closest one will be, never by returning a different file as though it were the requested format.',
        'Each catalog entry carries a capability naming what that workflow is for: its model family (photoreal, anime or general) and whether it takes a reference, exposes pose or depth control, or writes video. Match the family to the request — an anime or manhwa subject belongs on an anime model, a photograph on a photoreal one — and prefer a workflow whose capability covers the request over one that merely has the right size. When no workflow matches the requested family, say which family is missing and what the closest installed model will actually produce, and let the user choose: never present a stylised render as a photograph, or a general model as an anime one. An entry also carries the prompt its graph ships with, which is where a workflow keeps the words it needs: a style workflow whose saved prompt names trigger terms is the one to submit for that style, with those terms kept in the prompt, because a style that depends on them shows only faintly without them.',
        'Never claim a canonical likeness that text alone cannot produce. A general or anime model renders a subject matching the description, not the licensed character, so reporting a named character or person as depicted would be false. When a request names one: use a reference-capable workflow when the user supplied an image, and otherwise say plainly that the result is inspired by the description rather than being that character, and that an exact likeness needs a reference image or a model trained on it. Produce a deliberate knockoff only when the request asks for one, and say when it is one.',
        'Resolve models, workflows and outputs through the connected ComfyUI server, never by searching this computer: a directory you happen to list is not the install this server uses, and an absence there proves nothing. A model is missing only when the server itself reports that it is. The same applies to what a model can depict: an anime or character checkpoint the catalog lists may produce a subject a general text-to-image model cannot, so try the listed model for the subject before concluding the request is impossible.',
        'For an attached image, stage it into the connected ComfyUI input directory using the available upload or file tools before supplying a LoadImage filename. For an existing output reference, resolve that exact file and stage it when required. Submit an edit through a catalog workflow whose task is edit: those take the reference as their start or conditioning input, so choosing one is the wiring check. Keep the last successful output as the working reference for iterative edits. A selected reference overrides it. Never invent filenames, tool availability, successful runs or identity consistency.',
        'Execute the workflow, wait for completion, fetch the actual outputs and show the resulting images or playable video in this conversation. Use the same connected server for discovery, execution and output retrieval. Submit a catalog workflow without reading its graph into this conversation: a saved graph is large, and every later turn then carries it. Briefly describe what changed; keep sampler and model configuration out of the user conversation unless it affects a decision or execution fails.',
        'For a technical graphic — an HMI panel, schematic, wiring diagram, flowchart, icon set, or anything whose meaning lives in its labels and geometry — do not use a diffusion model, which cannot place accurate text. Author SVG or HTML instead, rasterise it with the available browser tooling when a raster file is wanted, and hand over the source as well. Say that it is code rather than a generated picture, and never claim a rendered raster is working HTML. Never install models or nodes without asking. If tools or a suitable workflow are unavailable, explain what is missing. If a ComfyUI MCP call times out, retry it once; if it times out again, say so and tell the user that Advanced mode submits the same workflow directly instead of rebuilding the workflow, writing one by hand, or searching this machine for workflow files. Show actual outputs after execution and keep the reply concise.',
        `ComfyUI: ${status.baseUrl}`,
        `Available panel workflows (these are the settings to submit with; adjust only when the request needs it): ${JSON.stringify(workflows)}`,
        source === null ? 'Reference: use the previous result for follow-up edits, or create a new image for a new request.' : `Selected reference: ${JSON.stringify(source)}. Read it through ComfyUI before editing.`,
        `User request:\n${prompt}`,
    ].join('\n\n');
}
//# sourceMappingURL=agent-prompt.js.map