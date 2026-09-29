window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-images",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let react = require("react");
		//#region lib/types/client/ImagesIcon.js
		/** Decorative sparkle used by the Images navigation row. */
		function ImagesIcon({ size }) {
			return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSparkleRegular, { size });
		}
		//#endregion
		//#region \0dsh-css:C:\Users\KNPhu\.arya\github\KonnectSuite\AryaAI\packages\client\ui-images\src\client\ImagesPanel.module.css.mjs
		const css = ".VMOGPa_panel{height:100%;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-base);padding:28px clamp(20px,4vw,64px) 48px;overflow-y:auto}html[data-platform=darwin] .VMOGPa_panel{padding-top:calc(28px + var(--dsh-frame-top-clearance))}.VMOGPa_header,.VMOGPa_headerActions,.VMOGPa_controls,.VMOGPa_cardActions,.VMOGPa_pending{align-items:center;display:flex}.VMOGPa_header{justify-content:space-between;gap:16px;max-width:1200px;margin:0 auto 22px}.VMOGPa_header h1{margin:0;font-size:24px;font-weight:500;line-height:32px}.VMOGPa_header p{margin:3px 0 0;font-size:13px;line-height:20px}.VMOGPa_connected{color:var(--dsw-alias-state-success-primary)}.VMOGPa_offline{color:var(--dsw-alias-state-warning-primary)}.VMOGPa_headerActions{gap:8px}.VMOGPa_openComfy,.VMOGPa_download{color:var(--dsw-alias-label-secondary);align-items:center;gap:5px;font-size:13px;text-decoration:none;display:inline-flex}.VMOGPa_openComfy:hover,.VMOGPa_download:hover{color:var(--dsw-alias-label-primary)}.VMOGPa_composer{border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-xl);background:var(--dsw-alias-bg-layer-1);max-width:960px;box-shadow:var(--dsw-shadow-sm);margin:0 auto 30px;padding:16px}.VMOGPa_promptInput,.VMOGPa_negativeInput,.VMOGPa_controls input,.VMOGPa_controls select{box-sizing:border-box;border:.5px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-2);font:inherit}.VMOGPa_promptInput{resize:vertical;background:0 0;border:0;outline:none;width:100%;min-height:108px;padding:12px;font-size:16px;line-height:24px;display:block}.VMOGPa_negativeInput{border-radius:var(--dsw-radius-md);width:100%;height:36px;padding:0 10px}.VMOGPa_controls{flex-wrap:wrap;gap:10px;margin-top:12px}.VMOGPa_controls label{color:var(--dsw-alias-label-secondary);flex-direction:column;gap:4px;font-size:11px;line-height:16px;display:flex}.VMOGPa_controls label:first-child{flex:230px}.VMOGPa_controls select,.VMOGPa_controls input{border-radius:var(--dsw-radius-md);min-width:76px;height:34px;padding:0 8px;font-size:12px}.VMOGPa_controls label:first-child select{width:100%}.VMOGPa_controls button{align-self:flex-end;margin-left:auto}.VMOGPa_notice,.VMOGPa_error,.VMOGPa_modelSummary{margin:10px 0 0;font-size:13px;line-height:20px}.VMOGPa_notice{color:var(--dsw-alias-state-warning-primary)}.VMOGPa_error{color:var(--dsw-alias-state-error-primary)}.VMOGPa_modelSummary{color:var(--dsw-alias-label-tertiary)}.VMOGPa_pending{border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-bg-layer-1);max-width:960px;color:var(--dsw-alias-label-secondary);gap:12px;margin:0 auto 20px;padding:14px 16px;font-size:13px}.VMOGPa_pending button{margin-left:auto}.VMOGPa_pendingArt{border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-bg-layer-3);width:42px;height:42px;color:var(--dsw-alias-state-business-primary);place-items:center;animation:1.6s ease-in-out infinite VMOGPa_pulse;display:grid}@keyframes VMOGPa_pulse{50%{opacity:.45;transform:scale(.96)}}.VMOGPa_gallery{max-width:1200px;margin:0 auto}.VMOGPa_gallery h2{margin:0 0 14px;font-size:16px;font-weight:500;line-height:24px}.VMOGPa_empty{color:var(--dsw-alias-label-tertiary);margin:0;font-size:13px}.VMOGPa_grid{grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px;display:grid}.VMOGPa_card{content-visibility:auto;contain-intrinsic-size:320px 420px;border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-xl);background:var(--dsw-alias-bg-layer-1);overflow:hidden}.VMOGPa_preview{aspect-ratio:1;background:var(--dsw-alias-bg-layer-2);cursor:zoom-in;border:0;place-items:center;width:100%;padding:0;display:grid}.VMOGPa_preview:disabled{cursor:default}.VMOGPa_preview img{object-fit:cover;width:100%;height:100%;display:block}.VMOGPa_loading,.VMOGPa_failed{color:var(--dsw-alias-label-tertiary);padding:20px;font-size:12px}.VMOGPa_failed{color:var(--dsw-alias-state-error-primary)}.VMOGPa_cardBody{padding:12px}.VMOGPa_workflow{color:var(--dsw-alias-state-business-primary);text-overflow:ellipsis;white-space:nowrap;margin:0 0 6px;font-size:11px;font-weight:500;line-height:16px;overflow:hidden}.VMOGPa_prompt{-webkit-line-clamp:2;-webkit-box-orient:vertical;margin:0;font-size:13px;line-height:19px;display:-webkit-box;overflow:hidden}.VMOGPa_meta{color:var(--dsw-alias-label-tertiary);text-overflow:ellipsis;white-space:nowrap;margin:6px 0 10px;font-size:11px;line-height:16px;overflow:hidden}.VMOGPa_cardActions{flex-wrap:wrap;gap:8px}.VMOGPa_download{margin-left:auto}.VMOGPa_deleteButton{color:var(--dsw-alias-state-error-primary)}.VMOGPa_confirmActions{justify-content:flex-end;gap:8px;display:flex}@media (width<=720px){.VMOGPa_panel{padding:20px 14px 36px}.VMOGPa_header{align-items:flex-start}.VMOGPa_headerActions{flex-direction:column;align-items:flex-end}.VMOGPa_controls label,.VMOGPa_controls label:first-child{flex:140px}.VMOGPa_controls button{width:100%;margin-left:0}.VMOGPa_grid{grid-template-columns:repeat(auto-fill,minmax(180px,1fr))}}";
		const tagId = "@deepseek-ai/dsh-client-ui-images/ImagesPanel.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-images";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var ImagesPanel_module_css_default = {
			"card": "VMOGPa_card",
			"cardActions": "VMOGPa_cardActions",
			"cardBody": "VMOGPa_cardBody",
			"composer": "VMOGPa_composer",
			"confirmActions": "VMOGPa_confirmActions",
			"connected": "VMOGPa_connected",
			"controls": "VMOGPa_controls",
			"deleteButton": "VMOGPa_deleteButton",
			"download": "VMOGPa_download",
			"empty": "VMOGPa_empty",
			"error": "VMOGPa_error",
			"failed": "VMOGPa_failed",
			"gallery": "VMOGPa_gallery",
			"grid": "VMOGPa_grid",
			"header": "VMOGPa_header",
			"headerActions": "VMOGPa_headerActions",
			"loading": "VMOGPa_loading",
			"meta": "VMOGPa_meta",
			"modelSummary": "VMOGPa_modelSummary",
			"negativeInput": "VMOGPa_negativeInput",
			"notice": "VMOGPa_notice",
			"offline": "VMOGPa_offline",
			"openComfy": "VMOGPa_openComfy",
			"panel": "VMOGPa_panel",
			"pending": "VMOGPa_pending",
			"pendingArt": "VMOGPa_pendingArt",
			"preview": "VMOGPa_preview",
			"prompt": "VMOGPa_prompt",
			"promptInput": "VMOGPa_promptInput",
			"pulse": "VMOGPa_pulse",
			"workflow": "VMOGPa_workflow"
		};
		//#endregion
		//#region lib/types/client/ImagesPanel.js
		const SIZES = [
			{
				label: "Square · 1024",
				width: 1024,
				height: 1024
			},
			{
				label: "Landscape · 1216 × 832",
				width: 1216,
				height: 832
			},
			{
				label: "Portrait · 832 × 1216",
				width: 832,
				height: 1216
			}
		];
		const EMPTY_DRAFT = {
			prompt: "",
			negativePrompt: "",
			model: "",
			workflow: "",
			width: 1024,
			height: 1024,
			steps: 24,
			cfg: 7,
			seed: "",
			batchSize: 1
		};
		function errorMessage(error, fallback) {
			return error instanceof Error ? error.message : fallback;
		}
		function ImageCard({ generation, image, deleting, load, onDelete, onReuse, t }) {
			const [src, setSrc] = (0, react.useState)();
			const [failed, setFailed] = (0, react.useState)(false);
			const [open, setOpen] = (0, react.useState)(false);
			const [confirming, setConfirming] = (0, react.useState)(false);
			(0, react.useEffect)(() => {
				const controller = new AbortController();
				load(image).then((value) => {
					if (!controller.signal.aborted) setSrc(value);
				}).catch(() => {
					if (!controller.signal.aborted) setFailed(true);
				});
				return () => {
					controller.abort();
				};
			}, [image, load]);
			return (0, react_jsx_runtime.jsxs)("article", {
				className: ImagesPanel_module_css_default.card,
				children: [
					(0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: ImagesPanel_module_css_default.preview,
						disabled: src === void 0,
						"aria-label": t("gallery.open", { name: image.filename }),
						onClick: () => {
							setOpen(true);
						},
						children: src !== void 0 ? (0, react_jsx_runtime.jsx)("img", {
							src,
							alt: generation.prompt
						}) : (0, react_jsx_runtime.jsx)("span", {
							className: failed ? ImagesPanel_module_css_default.failed : ImagesPanel_module_css_default.loading,
							children: failed ? t("gallery.failed") : t("gallery.loading")
						})
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: ImagesPanel_module_css_default.cardBody,
						children: [
							(0, react_jsx_runtime.jsx)("p", {
								className: ImagesPanel_module_css_default.workflow,
								children: t("gallery.workflow", { workflow: generation.workflowLabel })
							}),
							(0, react_jsx_runtime.jsx)("p", {
								className: ImagesPanel_module_css_default.prompt,
								children: generation.prompt
							}),
							(0, react_jsx_runtime.jsxs)("p", {
								className: ImagesPanel_module_css_default.meta,
								children: [
									generation.width,
									" × ",
									generation.height,
									" · ",
									generation.steps,
									" steps · seed ",
									generation.seed
								]
							}),
							(0, react_jsx_runtime.jsxs)("div", {
								className: ImagesPanel_module_css_default.cardActions,
								children: [
									(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
										size: "sm",
										onClick: () => {
											onReuse(generation);
										},
										children: t("action.reuse")
									}),
									src !== void 0 && (0, react_jsx_runtime.jsxs)("a", {
										className: ImagesPanel_module_css_default.download,
										href: src,
										download: image.filename,
										children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconDownloadOutlineRegular, { size: 14 }), t("action.download")]
									}),
									(0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.Button, {
										className: ImagesPanel_module_css_default.deleteButton,
										size: "sm",
										disabled: deleting,
										onClick: () => {
											setConfirming(true);
										},
										children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconTrashOutlineRegular, { size: 14 }), t(deleting ? "delete.pending" : "action.delete")]
									})
								]
							})
						]
					}),
					open && src !== void 0 && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.ImageLightbox, {
						src,
						alt: generation.prompt,
						labels: {
							dialog: t("gallery.open", { name: image.filename }),
							close: t("gallery.close")
						},
						onClose: () => {
							setOpen(false);
						}
					}),
					(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
						open: confirming,
						title: t("delete.title"),
						description: t("delete.description"),
						closeLabel: t("delete.close"),
						onClose: () => {
							if (!deleting) setConfirming(false);
						},
						footer: (0, react_jsx_runtime.jsxs)("div", {
							className: ImagesPanel_module_css_default.confirmActions,
							children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								variant: "outline",
								disabled: deleting,
								onClick: () => {
									setConfirming(false);
								},
								children: t("delete.cancel")
							}), (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								className: ImagesPanel_module_css_default.deleteButton,
								disabled: deleting,
								onClick: () => {
									onDelete(generation).then((deleted) => {
										if (deleted) setConfirming(false);
									});
								},
								children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconTrashOutlineRegular, { size: 14 }), t(deleting ? "delete.pending" : "delete.confirm")]
							})]
						})
					})
				]
			});
		}
		/** Full-page local ComfyUI image generator. */
		function ImagesPanel({ status: readStatus, history: readHistory, generate: requestGeneration, cancel: cancelGeneration, remove: removeGeneration, image: readImage, t }) {
			const [draft, setDraft] = (0, react.useState)(EMPTY_DRAFT);
			const [status, setStatus] = (0, react.useState)();
			const [history, setHistory] = (0, react.useState)([]);
			const [pending, setPending] = (0, react.useState)([]);
			const [error, setError] = (0, react.useState)();
			const [busy, setBusy] = (0, react.useState)(false);
			const [deleting, setDeleting] = (0, react.useState)([]);
			const refresh = (0, react.useCallback)(async () => {
				try {
					const [nextStatus, nextHistory] = await Promise.all([readStatus(), readHistory()]);
					setStatus(nextStatus);
					setHistory(nextHistory);
					const settled = new Set(nextHistory.map((item) => item.promptId));
					setPending((current) => current.filter((id) => !settled.has(id)));
					setDraft((current) => {
						const model = nextStatus.models[0];
						const currentWorkflow = nextStatus.workflows.find((workflow) => workflow.id === current.workflow && workflow.available);
						const workflow = currentWorkflow ?? nextStatus.workflows.find((item) => item.available);
						return {
							...current,
							model: nextStatus.models.some((item) => item.id === current.model) ? current.model : model?.id ?? "",
							workflow: workflow?.id ?? "",
							steps: currentWorkflow === void 0 ? workflow?.recommendedSteps ?? current.steps : current.steps,
							cfg: currentWorkflow === void 0 ? workflow?.recommendedCfg ?? current.cfg : current.cfg
						};
					});
					setError(void 0);
				} catch (reason) {
					setError(errorMessage(reason, t("notice.failed")));
				}
			}, [
				readHistory,
				readStatus,
				t
			]);
			(0, react.useEffect)(() => {
				refresh();
			}, [refresh]);
			(0, react.useEffect)(() => {
				if (pending.length === 0) return void 0;
				const timer = window.setInterval(() => {
					refresh();
				}, 1500);
				return () => {
					window.clearInterval(timer);
				};
			}, [pending.length, refresh]);
			const set = (key, value) => {
				setDraft((current) => ({
					...current,
					[key]: value
				}));
			};
			const selectedSize = `${draft.width}x${draft.height}`;
			const selectedWorkflow = status?.workflows.find((workflow) => workflow.id === draft.workflow);
			const canGenerate = status?.reachable === true && selectedWorkflow?.available === true && draft.prompt.trim() !== "" && !busy;
			const selectedModel = status?.models.find((model) => model.id === draft.model);
			const generate = async () => {
				setBusy(true);
				setError(void 0);
				try {
					const receipt = await requestGeneration({
						prompt: draft.prompt,
						negativePrompt: draft.negativePrompt,
						model: draft.model || null,
						workflow: draft.workflow || null,
						width: draft.width,
						height: draft.height,
						steps: draft.steps,
						cfg: draft.cfg,
						seed: draft.seed.trim() === "" ? null : Number(draft.seed),
						batchSize: draft.batchSize
					});
					setPending((current) => [...current, receipt.promptId]);
					setDraft((current) => ({
						...current,
						seed: String(receipt.seed)
					}));
				} catch (reason) {
					setError(errorMessage(reason, t("notice.failed")));
				} finally {
					setBusy(false);
				}
			};
			const reuse = (generation) => {
				setDraft({
					prompt: generation.prompt,
					negativePrompt: generation.negativePrompt,
					model: generation.model,
					workflow: status?.workflows.some((workflow) => workflow.id === generation.workflow && workflow.available) ? generation.workflow ?? draft.workflow : draft.workflow,
					width: generation.width,
					height: generation.height,
					steps: generation.steps,
					cfg: generation.cfg,
					seed: String(generation.seed),
					batchSize: 1
				});
				document.querySelector("[data-images-composer]")?.scrollIntoView({
					behavior: "smooth",
					block: "start"
				});
			};
			const remove = async (generation) => {
				setDeleting((current) => [...current, generation.promptId]);
				setError(void 0);
				try {
					await removeGeneration(generation.promptId);
					setHistory((current) => current.filter((item) => item.promptId !== generation.promptId));
					return true;
				} catch (reason) {
					setError(errorMessage(reason, t("notice.failed")));
					return false;
				} finally {
					setDeleting((current) => current.filter((id) => id !== generation.promptId));
				}
			};
			return (0, react_jsx_runtime.jsxs)("main", {
				className: ImagesPanel_module_css_default.panel,
				children: [
					(0, react_jsx_runtime.jsxs)("header", {
						className: ImagesPanel_module_css_default.header,
						children: [(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("h1", { children: t("page.title") }), (0, react_jsx_runtime.jsx)("p", {
							className: status?.reachable === true ? ImagesPanel_module_css_default.connected : ImagesPanel_module_css_default.offline,
							children: status?.reachable === true ? t("status.connected") : t("status.offline")
						})] }), (0, react_jsx_runtime.jsxs)("div", {
							className: ImagesPanel_module_css_default.headerActions,
							children: [status?.baseUrl !== void 0 && (0, react_jsx_runtime.jsx)("a", {
								className: ImagesPanel_module_css_default.openComfy,
								href: status.baseUrl,
								target: "_blank",
								rel: "noreferrer",
								children: t("action.openComfy")
							}), (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								size: "sm",
								onClick: () => {
									refresh();
								},
								children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconRefreshOutlineRegular, { size: 14 }), t("action.refresh")]
							})]
						})]
					}),
					(0, react_jsx_runtime.jsxs)("section", {
						className: ImagesPanel_module_css_default.composer,
						"data-images-composer": true,
						children: [
							(0, react_jsx_runtime.jsx)("textarea", {
								className: ImagesPanel_module_css_default.promptInput,
								value: draft.prompt,
								"aria-label": t("composer.placeholder"),
								placeholder: t("composer.placeholder"),
								onChange: (event) => {
									set("prompt", event.target.value);
								}
							}),
							(0, react_jsx_runtime.jsx)("input", {
								className: ImagesPanel_module_css_default.negativeInput,
								value: draft.negativePrompt,
								"aria-label": t("composer.negative"),
								placeholder: selectedWorkflow?.supportsNegativePrompt === false ? t("composer.negativeUnsupported") : t("composer.negative"),
								disabled: selectedWorkflow?.supportsNegativePrompt === false,
								onChange: (event) => {
									set("negativePrompt", event.target.value);
								}
							}),
							(0, react_jsx_runtime.jsxs)("div", {
								className: ImagesPanel_module_css_default.controls,
								children: [
									(0, react_jsx_runtime.jsxs)("label", { children: [t("composer.workflow"), (0, react_jsx_runtime.jsx)("select", {
										value: draft.workflow,
										onChange: (event) => {
											const workflow = status?.workflows.find((item) => item.id === event.target.value);
											if (workflow?.available === true) setDraft((current) => ({
												...current,
												workflow: workflow.id,
												steps: workflow.recommendedSteps,
												cfg: workflow.recommendedCfg
											}));
										},
										children: status?.workflows.map((workflow) => (0, react_jsx_runtime.jsxs)("option", {
											value: workflow.id,
											disabled: !workflow.available,
											children: [workflow.label, workflow.available ? "" : ` · ${workflow.unavailableReason ?? t("status.unavailable")}`]
										}, workflow.id))
									})] }),
									status !== void 0 && status.models.length > 1 && (0, react_jsx_runtime.jsxs)("label", { children: [t("composer.model"), (0, react_jsx_runtime.jsx)("select", {
										value: draft.model,
										onChange: (event) => {
											const model = status.models.find((item) => item.id === event.target.value);
											if (model !== void 0) setDraft((current) => ({
												...current,
												model: model.id,
												steps: model.recommendedSteps,
												cfg: model.recommendedCfg
											}));
										},
										children: status.models.map((model) => (0, react_jsx_runtime.jsx)("option", {
											value: model.id,
											children: model.label
										}, model.id))
									})] }),
									(0, react_jsx_runtime.jsxs)("label", { children: [t("composer.size"), (0, react_jsx_runtime.jsx)("select", {
										value: selectedSize,
										onChange: (event) => {
											const size = SIZES.find((item) => `${item.width}x${item.height}` === event.target.value);
											if (size !== void 0) setDraft((current) => ({
												...current,
												width: size.width,
												height: size.height
											}));
										},
										children: SIZES.map((size) => (0, react_jsx_runtime.jsx)("option", {
											value: `${size.width}x${size.height}`,
											children: size.label
										}, size.label))
									})] }),
									(0, react_jsx_runtime.jsxs)("label", { children: [t("composer.steps"), (0, react_jsx_runtime.jsx)("input", {
										type: "number",
										min: 1,
										max: 150,
										value: draft.steps,
										onChange: (event) => {
											set("steps", Number(event.target.value));
										}
									})] }),
									(0, react_jsx_runtime.jsxs)("label", { children: [t("composer.cfg"), (0, react_jsx_runtime.jsx)("input", {
										type: "number",
										min: 0,
										max: 30,
										step: .5,
										value: draft.cfg,
										onChange: (event) => {
											set("cfg", Number(event.target.value));
										}
									})] }),
									(0, react_jsx_runtime.jsxs)("label", { children: [t("composer.seed"), (0, react_jsx_runtime.jsx)("input", {
										inputMode: "numeric",
										value: draft.seed,
										placeholder: t("composer.random"),
										onChange: (event) => {
											set("seed", event.target.value);
										}
									})] }),
									(0, react_jsx_runtime.jsxs)("label", { children: [t("composer.batch"), (0, react_jsx_runtime.jsx)("input", {
										type: "number",
										min: 1,
										max: 8,
										value: draft.batchSize,
										onChange: (event) => {
											set("batchSize", Number(event.target.value));
										}
									})] }),
									(0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.Button, {
										disabled: !canGenerate,
										onClick: () => {
											generate();
										},
										children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSparkleRegular, { size: 16 }), busy ? t("composer.generating") : t("composer.generate")]
									})
								]
							}),
							status?.reachable === true && status.models.length === 1 && selectedModel !== void 0 && (0, react_jsx_runtime.jsx)("p", {
								className: ImagesPanel_module_css_default.modelSummary,
								children: t("composer.usingModel", { model: selectedModel.label })
							}),
							status?.reachable === true && !status.workflows.some((workflow) => workflow.available) && (0, react_jsx_runtime.jsx)("p", {
								className: ImagesPanel_module_css_default.notice,
								children: t("status.noModels")
							}),
							error !== void 0 && (0, react_jsx_runtime.jsx)("p", {
								className: ImagesPanel_module_css_default.error,
								role: "alert",
								children: error
							})
						]
					}),
					pending.map((promptId) => (0, react_jsx_runtime.jsxs)("section", {
						className: ImagesPanel_module_css_default.pending,
						children: [
							(0, react_jsx_runtime.jsx)("span", {
								className: ImagesPanel_module_css_default.pendingArt,
								children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSparkleRegular, { size: 24 })
							}),
							(0, react_jsx_runtime.jsx)("span", { children: t("pending.title") }),
							(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								size: "sm",
								onClick: () => {
									cancelGeneration(promptId).then(() => {
										setPending((current) => current.filter((id) => id !== promptId));
									}).catch((reason) => {
										setError(errorMessage(reason, t("notice.failed")));
									});
								},
								children: t("action.cancel")
							})
						]
					}, promptId)),
					(0, react_jsx_runtime.jsxs)("section", {
						className: ImagesPanel_module_css_default.gallery,
						children: [(0, react_jsx_runtime.jsx)("h2", { children: t("gallery.title") }), history.length === 0 && pending.length === 0 ? (0, react_jsx_runtime.jsx)("p", {
							className: ImagesPanel_module_css_default.empty,
							children: t("gallery.empty")
						}) : (0, react_jsx_runtime.jsx)("div", {
							className: ImagesPanel_module_css_default.grid,
							children: history.flatMap((generation) => generation.images.map((image) => (0, react_jsx_runtime.jsx)(ImageCard, {
								generation,
								image,
								deleting: deleting.includes(generation.promptId),
								load: readImage,
								onDelete: remove,
								onReuse: reuse,
								t
							}, `${generation.promptId}:${image.subfolder}:${image.filename}`)))
						})]
					})
				]
			});
		}
		//#endregion
		//#region lib/types/client/locales.js
		/** Dictionary namespace owned by the Images page. */
		const NS = "images";
		/** Simplified Chinese dictionary (the key-set source of truth). */
		const zh = {
			"panel.label": "图像",
			"page.title": "图像",
			"composer.placeholder": "描述要创建的图像",
			"composer.negative": "不希望图像中出现的内容",
			"composer.negativeUnsupported": "此工作流在提示词强度 1 时不使用负面提示词",
			"composer.generate": "生成",
			"composer.generating": "正在生成…",
			"composer.model": "模型",
			"composer.workflow": "工作流",
			"composer.usingModel": "使用 {model}",
			"composer.size": "尺寸",
			"composer.steps": "步数",
			"composer.cfg": "提示词强度",
			"composer.seed": "种子",
			"composer.random": "随机",
			"composer.batch": "数量",
			"status.connected": "ComfyUI 已连接",
			"status.offline": "无法连接 ComfyUI。请启动 ComfyUI 后重试。",
			"status.noModels": "ComfyUI 中没有兼容的图像模型。",
			"status.unavailable": "不可用",
			"action.refresh": "刷新",
			"action.openComfy": "打开 ComfyUI",
			"action.cancel": "取消",
			"action.download": "下载",
			"action.reuse": "复用设置",
			"action.delete": "删除",
			"delete.title": "删除图像？",
			"delete.description": "这将从最近生成中删除此图像以及同一次生成的其他图像。",
			"delete.cancel": "取消",
			"delete.confirm": "删除图像",
			"delete.close": "关闭删除确认",
			"delete.pending": "正在删除…",
			"gallery.title": "最近生成",
			"gallery.workflow": "工作流：{workflow}",
			"gallery.empty": "生成的图像会显示在这里。",
			"gallery.loading": "正在加载图像…",
			"gallery.failed": "无法加载此图像。",
			"gallery.open": "查看图像：{name}",
			"gallery.close": "关闭图像",
			"gallery.previous": "上一张图像",
			"gallery.next": "下一张图像",
			"notice.failed": "无法完成图像操作。",
			"pending.title": "ComfyUI 正在生成图像"
		};
		/** English dictionary, key-identical to the Chinese source of truth. */
		const en = {
			"panel.label": "Images",
			"page.title": "Images",
			"composer.placeholder": "Describe an image",
			"composer.negative": "What should not appear in the image",
			"composer.negativeUnsupported": "This workflow does not use negative prompts at strength 1",
			"composer.generate": "Generate",
			"composer.generating": "Generating…",
			"composer.model": "Model",
			"composer.workflow": "Workflow",
			"composer.usingModel": "Using {model}",
			"composer.size": "Size",
			"composer.steps": "Steps",
			"composer.cfg": "Prompt strength",
			"composer.seed": "Seed",
			"composer.random": "Random",
			"composer.batch": "Images",
			"status.connected": "ComfyUI connected",
			"status.offline": "Could not reach ComfyUI. Start ComfyUI, then try again.",
			"status.noModels": "No compatible image models are available in ComfyUI.",
			"status.unavailable": "Unavailable",
			"action.refresh": "Refresh",
			"action.openComfy": "Open ComfyUI",
			"action.cancel": "Cancel",
			"action.download": "Download",
			"action.reuse": "Reuse settings",
			"action.delete": "Delete",
			"delete.title": "Delete image?",
			"delete.description": "This removes this image and any others from the same generation from Recent generations.",
			"delete.cancel": "Cancel",
			"delete.confirm": "Delete image",
			"delete.close": "Close delete confirmation",
			"delete.pending": "Deleting…",
			"gallery.title": "Recent generations",
			"gallery.workflow": "Workflow: {workflow}",
			"gallery.empty": "Generated images will appear here.",
			"gallery.loading": "Loading image…",
			"gallery.failed": "Could not load this image.",
			"gallery.open": "View image: {name}",
			"gallery.close": "Close image",
			"gallery.previous": "Previous image",
			"gallery.next": "Next image",
			"notice.failed": "Could not complete the image operation.",
			"pending.title": "ComfyUI is generating your image"
		};
		//#endregion
		//#region lib/types/client/index.js
		const inject = [
			"locale",
			"remote",
			"remote.comfyImages",
			"slots"
		];
		const PANEL_ID = "images";
		/** Register the global page and its left-sidebar navigation entry. */
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "ui-images: dictionaries");
			const t = ctx.locale.bind(NS);
			const unwrap = async (operation) => {
				const result = await operation;
				if (!result.ok) throw new Error(result.error.message);
				return result.value;
			};
			const face = {
				status: () => unwrap(ctx.remote.comfyImages.status()),
				history: () => unwrap(ctx.remote.comfyImages.history({ limit: 40 })),
				generate: (request) => unwrap(ctx.remote.comfyImages.generate(request)),
				cancel: async (promptId) => {
					await unwrap(ctx.remote.comfyImages.cancel({ promptId }));
				},
				remove: async (promptId) => {
					await unwrap(ctx.remote.comfyImages.deleteGeneration({ promptId }));
				},
				image: async (image) => {
					const value = await unwrap(ctx.remote.comfyImages.image(image));
					return `data:${value.contentType};base64,${value.base64}`;
				}
			};
			ctx.slots.inject("main", () => ctx.slots.register({
				name: "main",
				key: PANEL_ID,
				locale: NS,
				inject: () => face
			}, ImagesPanel));
			ctx.slots.inject("sidebar.panellist", () => ctx.slots.register({
				name: "sidebar.panellist",
				id: PANEL_ID,
				order: -10,
				locale: NS,
				label: () => t("panel.label")
			}, ImagesIcon));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map