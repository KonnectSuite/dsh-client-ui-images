/**
 * What each ComfyUI workflow is *for*, read from the workflow's own facts.
 *
 * The agent is the language model, so classifying a free-text request ("make it look
 * real", "in Ghibli style") is its job, not a keyword table's. What code owns is the
 * deterministic half: which family a workflow belongs to, and whether it takes a
 * reference, control input, or writes video. Labelling the options lets the model
 * choose; inferring intent from prose in code would only guess at what it knows.
 */
/** The image family a workflow's own model belongs to. */
export type WorkflowFamily = 'photoreal' | 'anime' | 'general';
/** The facts one workflow contributes to a routing decision. */
export interface WorkflowCapability {
    /** Model family, from the checkpoint or diffusion model the graph loads. */
    readonly family: WorkflowFamily;
    /** Accepts a supplied image as identity or style reference. */
    readonly reference: boolean;
    /** Exposes a pose/depth/edge control input. */
    readonly control: boolean;
    /** Writes a video rather than a still. */
    readonly video: boolean;
    /** Takes a source image through the workflow's own edit conditioning. */
    readonly edit: boolean;
    /** True for a graph that processes its input without encoding a prompt. */
    readonly postProcessing: boolean;
    /** True when the graph itself names a reference node pack, which is conditioning rather
     * than an instruction edit. */
    readonly conditioned: boolean;
}
/** The workflow facts this module reads; a subset of the catalogue entry. */
export interface WorkflowFacts {
    readonly id: string;
    readonly label: string;
    readonly modelId: string | null;
    readonly task?: 'create' | 'edit' | undefined;
    readonly output: 'image' | 'video';
    readonly takesPrompt?: boolean | undefined;
}
/**
 * Classify one workflow from the model it loads and the nodes it names.
 * @param workflow - Catalogue facts for the workflow.
 * @returns its family and the capabilities its graph exposes.
 */
export declare function classifyWorkflow(workflow: WorkflowFacts): WorkflowCapability;
/**
 * Name a capability in the words the model needs to route by.
 * @param capability - A classification from {@link classifyWorkflow}.
 * @returns comma-separated labels, most decisive first, or an empty string for a
 * plain text-to-image graph — the common case needs no label to stand out.
 */
export declare function describeCapability(capability: WorkflowCapability): string;
//# sourceMappingURL=routing.d.ts.map