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
export type WorkflowFamily = 'photoreal' | 'anime' | 'general'

/** The facts one workflow contributes to a routing decision. */
export interface WorkflowCapability {
  /** Model family, from the checkpoint or diffusion model the graph loads. */
  readonly family: WorkflowFamily
  /** Accepts a supplied image as identity or style reference. */
  readonly reference: boolean
  /** Exposes a pose/depth/edge control input. */
  readonly control: boolean
  /** Writes a video rather than a still. */
  readonly video: boolean
  /** Takes a source image through the workflow's own edit conditioning. */
  readonly edit: boolean
  /** True for a graph that processes its input without encoding a prompt. */
  readonly postProcessing: boolean
  /** True when the graph itself names a reference node pack, which is conditioning rather
   * than an instruction edit. */
  readonly conditioned: boolean
}

/** The workflow facts this module reads; a subset of the catalogue entry. */
export interface WorkflowFacts {
  readonly id: string
  readonly label: string
  readonly modelId: string | null
  readonly task?: 'create' | 'edit' | undefined
  readonly output: 'image' | 'video'
  readonly takesPrompt?: boolean | undefined
}

/** Families in match order: a photoreal finetune also says "sdxl", so it comes first. */
const FAMILY_PATTERNS: readonly (readonly [WorkflowFamily, RegExp])[] = [
  ['photoreal', /photo|realvis|realistic|realism|juggernaut|epicreal/i],
  ['anime', /anime|animagine|cartoon|manhwa|manga|illustrious|pony/i],
]

/** Reference conditioning, named by the node pack or by the graph's own title. */
const REFERENCE_PATTERN = /ipadapter|ip-adapter|reference|kontext|redux/i
/** A control input the graph exposes. */
const CONTROL_PATTERN = /controlnet|control-net/i

/**
 * Classify one workflow from the model it loads and the nodes it names.
 * @param workflow - Catalogue facts for the workflow.
 * @returns its family and the capabilities its graph exposes.
 */
export function classifyWorkflow(workflow: WorkflowFacts): WorkflowCapability {
  const haystack = `${workflow.modelId ?? ''} ${workflow.id} ${workflow.label}`
  const family = FAMILY_PATTERNS.find(([, pattern]) => pattern.test(haystack))?.[0] ?? 'general'
  // A graph with no text encoder processes whatever it is given rather than following an
  // instruction. That is a different capability from an edit, even though both need a source.
  const postProcessing = workflow.takesPrompt === false
  const edit = !postProcessing && workflow.task === 'edit'
  const conditioned = REFERENCE_PATTERN.test(haystack)
  return {
    family,
    reference: edit || conditioned,
    control: CONTROL_PATTERN.test(haystack),
    video: workflow.output === 'video',
    edit,
    postProcessing,
    conditioned,
  }
}

/**
 * Name a capability in the words the model needs to route by.
 * @param capability - A classification from {@link classifyWorkflow}.
 * @returns comma-separated labels, most decisive first, or an empty string for a
 * plain text-to-image graph — the common case needs no label to stand out.
 */
export function describeCapability(capability: WorkflowCapability): string {
  const labels: string[] = []
  if (capability.video) labels.push('video')
  else if (capability.postProcessing) labels.push('post-processing')
  else if (capability.conditioned) labels.push('reference conditioning')
  else if (capability.edit) labels.push('reference edit')
  else labels.push('text to image')
  if (capability.control) labels.push('pose/depth control')
  labels.push(capability.family)
  return labels.join(', ')
}
