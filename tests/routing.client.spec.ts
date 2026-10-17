/**
 * Workflow classification: the deterministic half of routing. These tests pin the
 * facts the catalogue publishes — family from the model, and the flags a graph's own
 * nodes establish — because the agent routes on exactly this text.
 */
import { describe, expect, it } from 'vitest'
import { classifyWorkflow, describeCapability, type WorkflowFacts } from '../src/client/routing.ts'

const facts = (overrides: Partial<WorkflowFacts> = {}): WorkflowFacts => ({
  id: 'saved:01-TXT2IMG-portrait.json',
  label: '01-TXT2IMG-portrait',
  modelId: 'z-image-turbo:z_image_turbo_bf16.safetensors',
  output: 'image',
  ...overrides,
})

describe('classifyWorkflow', () => {
  it('reads a photoreal finetune as photoreal even when it also says sdxl', () => {
    expect(classifyWorkflow(facts({ modelId: 'checkpoint:realvisxl-v4.safetensors', label: 'RealVis SDXL' })).family).toBe('photoreal')
  })

  it('reads an anime checkpoint, including one named only in the workflow title', () => {
    expect(classifyWorkflow(facts({ modelId: 'checkpoint:animagine-xl-4.0.safetensors' })).family).toBe('anime')
    expect(classifyWorkflow(facts({ label: 'Illustrious manhwa portrait' })).family).toBe('anime')
  })

  it('leaves a current general model general', () => {
    expect(classifyWorkflow(facts()).family).toBe('general')
    expect(classifyWorkflow(facts({ modelId: 'flux2-klein:flux-2-klein-4b-fp8.safetensors', label: 'FLUX.2 Klein' })).family).toBe('general')
  })

  it('does not guess a family for a workflow with no model installed', () => {
    expect(classifyWorkflow(facts({ modelId: null, label: 'Arya Workflow', id: 'saved:Arya Workflow.json' })).family).toBe('general')
  })

  it('takes reference capability from the edit task or from the graph name', () => {
    expect(classifyWorkflow(facts({ task: 'edit' })).reference).toBe(true)
    expect(classifyWorkflow(facts({ id: 'saved:10-IPADAPTER-sdxl-reference.json' })).reference).toBe(true)
    expect(classifyWorkflow(facts({ modelId: 'flux2-klein:flux-2-klein-4b-fp8.safetensors', label: 'Kontext edit' })).reference).toBe(true)
    expect(classifyWorkflow(facts()).reference).toBe(false)
  })

  it('treats a graph that encodes no prompt as post-processing, not as an edit', () => {
    // Upscaling and interpolation need a source but follow no instruction, so they are a
    // different capability from a reference edit.
    expect(classifyWorkflow(facts({ takesPrompt: false })).postProcessing).toBe(true)
    expect(classifyWorkflow(facts({ takesPrompt: false, task: 'edit' })).edit).toBe(false)
    expect(classifyWorkflow(facts({ takesPrompt: false, task: 'edit' })).reference).toBe(false)
    expect(classifyWorkflow(facts()).postProcessing).toBe(false)
  })

  it('takes control and video from the graph, not from its name', () => {
    expect(classifyWorkflow(facts({ label: 'Z-Image ControlNet Union' })).control).toBe(true)
    expect(classifyWorkflow(facts()).control).toBe(false)
    expect(classifyWorkflow(facts({ id: 'saved:Wan_2_2_14B_Image_to_Video.json', output: 'video' })).video).toBe(true)
    expect(classifyWorkflow(facts()).video).toBe(false)
  })
})

describe('describeCapability', () => {
  it('names the most decisive purpose first', () => {
    expect(describeCapability(classifyWorkflow(facts()))).toBe('text to image, general')
    expect(describeCapability(classifyWorkflow(facts({ task: 'edit' })))).toBe('reference edit, general')
    expect(describeCapability(classifyWorkflow(facts({ id: 'saved:ipadapter.json', modelId: 'checkpoint:animagine-xl-4.0.safetensors' }))))
      .toBe('reference conditioning, anime')
    expect(describeCapability(classifyWorkflow(facts({ output: 'video' })))).toBe('video, general')
    expect(describeCapability(classifyWorkflow(facts({ takesPrompt: false })))).toBe('post-processing, general')
    // Video stays the primary label for a video post-processor.
    expect(describeCapability(classifyWorkflow(facts({ takesPrompt: false, output: 'video' })))).toBe('video, general')
  })

  it('adds control guidance alongside the purpose', () => {
    expect(describeCapability(classifyWorkflow(facts({ label: 'controlnet depth', modelId: 'z-image-turbo:z_image_turbo_bf16.safetensors' }))))
      .toBe('text to image, pose/depth control, general')
  })
})
