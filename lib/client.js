window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-images",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		//#region src/client/ImagesIcon.tsx
		/** Decorative photo glyph used by the Images navigation row. */
		function ImagesIcon({ size }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.LinkIconRegular, {
				kind: "image",
				size
			});
		}
		//#endregion
		//#region \0dsh-css:C:\Users\KNPhu\.arya\github\KonnectSuite\AryaAI\packages\client\ui-images\src\client\ImagesPanel.module.css.mjs
		const css = ".VMOGPa_panel{height:100%;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-base);padding:28px clamp(20px,4vw,64px) 48px;overflow-y:auto}html[data-platform=darwin] .VMOGPa_panel{padding-top:calc(28px + var(--dsh-frame-top-clearance))}.VMOGPa_header,.VMOGPa_headerActions,.VMOGPa_controls,.VMOGPa_cardActions,.VMOGPa_pending{align-items:center;display:flex}.VMOGPa_header{justify-content:space-between;gap:16px;max-width:1200px;margin:0 auto 22px}.VMOGPa_header h1{margin:0;font-size:24px;font-weight:500;line-height:32px}.VMOGPa_header p{margin:3px 0 0;font-size:13px;line-height:20px}.VMOGPa_connected{color:var(--dsw-alias-state-success-primary)}.VMOGPa_offline{color:var(--dsw-alias-state-warning-primary)}.VMOGPa_headerActions{gap:8px}.VMOGPa_openComfy,.VMOGPa_download{color:var(--dsw-alias-label-secondary);align-items:center;gap:5px;font-size:13px;text-decoration:none;display:inline-flex}.VMOGPa_openComfy:hover,.VMOGPa_download:hover{color:var(--dsw-alias-label-primary)}.VMOGPa_composer{border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-xl);background:var(--dsw-alias-bg-layer-1);max-width:1200px;box-shadow:var(--dsw-shadow-sm);grid-template-columns:minmax(0,1fr) minmax(300px,350px);gap:14px 22px;margin:0 auto 32px;padding:22px;display:grid}.VMOGPa_composerHead{border-bottom:.5px solid var(--dsw-alias-border-l2);grid-column:1/-1;justify-content:space-between;align-items:flex-start;gap:16px;padding-bottom:14px;display:flex}.VMOGPa_composerHead h2{margin:0;font-size:18px;font-weight:500;line-height:26px}.VMOGPa_composerHead p{color:var(--dsw-alias-label-secondary);margin:3px 0 0;font-size:13px;line-height:20px}.VMOGPa_composerHead>span{border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-layer-3);max-width:40%;color:var(--dsw-alias-label-secondary);text-overflow:ellipsis;white-space:nowrap;padding:6px 10px;font-size:12px;overflow:hidden}.VMOGPa_promptInput,.VMOGPa_negativeInput,.VMOGPa_controls input,.VMOGPa_controls select{box-sizing:border-box;border:.5px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-2);font:inherit}.VMOGPa_promptInput{resize:vertical;background:0 0;border:0;outline:none;width:100%;min-height:190px;padding:12px;font-size:16px;line-height:24px;display:block}.VMOGPa_composer>.VMOGPa_promptInput{grid-area:2/1}.VMOGPa_composer>.VMOGPa_sourceImage,.VMOGPa_composer>.VMOGPa_negativeInput{grid-column:1}.VMOGPa_composer>.VMOGPa_controls{grid-area:2/2/span 3;align-self:start}.VMOGPa_composer>.VMOGPa_notice,.VMOGPa_composer>.VMOGPa_error,.VMOGPa_composer>.VMOGPa_modelSummary{grid-column:1/-1}.VMOGPa_negativeInput{border-radius:var(--dsw-radius-md);width:100%;height:36px;padding:0 10px}.VMOGPa_sourceImage{border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-bg-layer-2);align-items:center;gap:12px;margin:10px 0;padding:8px;display:flex}.VMOGPa_sourceImage img{border-radius:var(--dsw-radius-md);object-fit:cover;width:56px;height:56px}.VMOGPa_sourceImage div{flex-direction:column;flex:1;gap:3px;min-width:0;font-size:13px;display:flex}.VMOGPa_sourceImage strong{font-weight:500}.VMOGPa_sourceImage span{color:var(--dsw-alias-label-secondary);text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.VMOGPa_controls{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:0;display:grid}.VMOGPa_controls label{color:var(--dsw-alias-label-secondary);flex-direction:column;gap:4px;font-size:11px;line-height:16px;display:flex}.VMOGPa_controls label:first-child,.VMOGPa_controls button{grid-column:1/-1}.VMOGPa_controls select,.VMOGPa_controls input{border-radius:var(--dsw-radius-md);width:100%;min-width:0;height:34px;padding:0 8px;font-size:12px}.VMOGPa_controls label:first-child select{width:100%}.VMOGPa_readonlyValue{border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-md);min-height:34px;color:var(--dsw-alias-label-secondary);align-items:center;padding:0 8px;font-size:12px;display:flex}.VMOGPa_controls button{justify-content:center}.VMOGPa_notice,.VMOGPa_error,.VMOGPa_modelSummary{margin:10px 0 0;font-size:13px;line-height:20px}.VMOGPa_notice{color:var(--dsw-alias-state-warning-primary)}.VMOGPa_error{color:var(--dsw-alias-state-error-primary)}.VMOGPa_modelSummary{color:var(--dsw-alias-label-tertiary)}.VMOGPa_pending{border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-bg-layer-1);max-width:960px;color:var(--dsw-alias-label-secondary);gap:12px;margin:0 auto 20px;padding:14px 16px;font-size:13px}.VMOGPa_pending button{margin-left:auto}.VMOGPa_pendingArt{border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-bg-layer-3);width:42px;height:42px;color:var(--dsw-alias-state-business-primary);place-items:center;animation:1.6s ease-in-out infinite VMOGPa_pulse;display:grid}@keyframes VMOGPa_pulse{50%{opacity:.45;transform:scale(.96)}}.VMOGPa_gallery{max-width:1200px;margin:0 auto}.VMOGPa_gallery h2{margin:0 0 14px;font-size:16px;font-weight:500;line-height:24px}.VMOGPa_galleryHeader{justify-content:space-between;align-items:flex-end;gap:16px;margin-bottom:14px;display:flex}.VMOGPa_galleryHeader h2{margin-bottom:2px}.VMOGPa_galleryHeader p{color:var(--dsw-alias-label-secondary);margin:0;font-size:13px}.VMOGPa_galleryTabs{border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-bg-layer-1);gap:4px;padding:3px;display:flex}.VMOGPa_galleryTabs [aria-selected=true]{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-3)}.VMOGPa_gallery>button{margin:18px auto 0;display:block}.VMOGPa_empty{color:var(--dsw-alias-label-tertiary);margin:0;font-size:13px}.VMOGPa_grid{grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px;display:grid}.VMOGPa_card{content-visibility:auto;contain-intrinsic-size:320px 420px;border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-xl);background:var(--dsw-alias-bg-layer-1);overflow:hidden}.VMOGPa_preview{aspect-ratio:1;background:var(--dsw-alias-bg-layer-2);cursor:zoom-in;border:0;place-items:center;width:100%;padding:0;display:grid}.VMOGPa_preview:disabled{cursor:default}.VMOGPa_preview img{object-fit:cover;width:100%;height:100%;display:block}.VMOGPa_loading,.VMOGPa_failed{color:var(--dsw-alias-label-tertiary);padding:20px;font-size:12px}.VMOGPa_failed{color:var(--dsw-alias-state-error-primary)}.VMOGPa_cardBody{padding:12px}.VMOGPa_workflow{color:var(--dsw-alias-state-business-primary);text-overflow:ellipsis;white-space:nowrap;margin:0 0 6px;font-size:11px;font-weight:500;line-height:16px;overflow:hidden}.VMOGPa_prompt{-webkit-line-clamp:2;-webkit-box-orient:vertical;margin:0;font-size:13px;line-height:19px;display:-webkit-box;overflow:hidden}.VMOGPa_meta{color:var(--dsw-alias-label-tertiary);text-overflow:ellipsis;white-space:nowrap;margin:6px 0 10px;font-size:11px;line-height:16px;overflow:hidden}.VMOGPa_cardActions{flex-wrap:wrap;gap:8px}.VMOGPa_download{margin-left:auto}.VMOGPa_deleteButton{color:var(--dsw-alias-state-error-primary)}.VMOGPa_confirmActions{justify-content:flex-end;gap:8px;display:flex}@media (width<=720px){.VMOGPa_panel{padding:20px 14px 36px}.VMOGPa_header{align-items:flex-start}.VMOGPa_headerActions{flex-direction:column;align-items:flex-end}.VMOGPa_composer{flex-direction:column;padding:14px;display:flex}.VMOGPa_composerHead{padding-bottom:12px}.VMOGPa_composerHead>span{display:none}.VMOGPa_controls,.VMOGPa_controls button{width:100%}.VMOGPa_grid{grid-template-columns:repeat(auto-fill,minmax(180px,1fr))}.VMOGPa_galleryHeader{flex-direction:column;align-items:flex-start}}";
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
			"composerHead": "VMOGPa_composerHead",
			"confirmActions": "VMOGPa_confirmActions",
			"connected": "VMOGPa_connected",
			"controls": "VMOGPa_controls",
			"deleteButton": "VMOGPa_deleteButton",
			"download": "VMOGPa_download",
			"empty": "VMOGPa_empty",
			"error": "VMOGPa_error",
			"failed": "VMOGPa_failed",
			"gallery": "VMOGPa_gallery",
			"galleryHeader": "VMOGPa_galleryHeader",
			"galleryTabs": "VMOGPa_galleryTabs",
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
			"readonlyValue": "VMOGPa_readonlyValue",
			"sourceImage": "VMOGPa_sourceImage",
			"workflow": "VMOGPa_workflow"
		};
		//#endregion
		//#region src/client/ImagesPanel.tsx
		const SIZES = [
			{
				label: "composer.sizeSquare",
				width: 1024,
				height: 1024
			},
			{
				label: "composer.sizeLandscape",
				width: 1216,
				height: 832
			},
			{
				label: "composer.sizePortrait",
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
			batchSize: 1,
			sourceImage: null,
			denoise: .55
		};
		function errorMessage(error, fallback) {
			return error instanceof Error ? error.message : fallback;
		}
		function ImageCard({ generation, stored, image, deleting, load, onDelete, onReuse, onEdit, t }) {
			const [src, setSrc] = (0, react.useState)();
			const [failed, setFailed] = (0, react.useState)(false);
			const [open, setOpen] = (0, react.useState)(false);
			const [confirming, setConfirming] = (0, react.useState)(false);
			const [visible, setVisible] = (0, react.useState)(false);
			const cardRef = (0, react.useRef)(null);
			(0, react.useEffect)(() => {
				const card = cardRef.current;
				if (card === null) return void 0;
				if (!("IntersectionObserver" in window)) {
					setVisible(true);
					return;
				}
				const observer = new IntersectionObserver((entries) => {
					if (entries.some((entry) => entry.isIntersecting)) {
						setVisible(true);
						observer.disconnect();
					}
				}, { rootMargin: "400px" });
				observer.observe(card);
				return () => {
					observer.disconnect();
				};
			}, []);
			(0, react.useEffect)(() => {
				if (!visible) return void 0;
				const controller = new AbortController();
				load(image).then((value) => {
					if (!controller.signal.aborted) setSrc(value);
				}).catch(() => {
					if (!controller.signal.aborted) setFailed(true);
				});
				return () => {
					controller.abort();
				};
			}, [
				image,
				load,
				visible
			]);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("article", {
				ref: cardRef,
				className: ImagesPanel_module_css_default.card,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: ImagesPanel_module_css_default.preview,
						disabled: src === void 0,
						"aria-label": t("gallery.open", { name: image.filename }),
						onClick: () => {
							setOpen(true);
						},
						children: src !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
							src,
							alt: generation?.prompt ?? image.filename
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: failed ? ImagesPanel_module_css_default.failed : ImagesPanel_module_css_default.loading,
							children: failed ? t("gallery.failed") : t("gallery.loading")
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: ImagesPanel_module_css_default.cardBody,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: ImagesPanel_module_css_default.workflow,
								children: generation === void 0 ? t("gallery.localFile") : t("gallery.workflow", { workflow: generation.workflowLabel })
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: ImagesPanel_module_css_default.prompt,
								children: generation?.prompt ?? image.filename
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: ImagesPanel_module_css_default.meta,
								children: generation === void 0 ? t("gallery.fileMeta", {
									date: new Date(stored?.modifiedAt ?? 0).toLocaleDateString(),
									size: Math.round((stored?.bytes ?? 0) / 1024)
								}) : t("gallery.runMeta", {
									width: generation.width,
									height: generation.height,
									steps: generation.steps,
									seed: generation.seed
								})
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: ImagesPanel_module_css_default.cardActions,
								children: [
									generation !== void 0 && onReuse !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
										size: "sm",
										onClick: () => {
											onReuse(generation);
										},
										children: t("action.reuse")
									}),
									src !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
										size: "sm",
										onClick: () => {
											onEdit(image, generation, src);
										},
										children: t("action.editImage")
									}),
									src !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("a", {
										className: ImagesPanel_module_css_default.download,
										href: src,
										download: image.filename,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconDownloadOutlineRegular, { size: 14 }), t("action.download")]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.Button, {
										className: ImagesPanel_module_css_default.deleteButton,
										size: "sm",
										disabled: deleting,
										onClick: () => {
											setConfirming(true);
										},
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconTrashOutlineRegular, { size: 14 }), t(deleting ? "delete.pending" : "action.delete")]
									})
								]
							})
						]
					}),
					open && src !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.ImageLightbox, {
						src,
						alt: generation?.prompt ?? image.filename,
						labels: {
							dialog: t("gallery.open", { name: image.filename }),
							close: t("gallery.close")
						},
						onClose: () => {
							setOpen(false);
						}
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
						open: confirming,
						title: t("delete.title"),
						description: t(generation === void 0 ? "delete.fileDescription" : "delete.description"),
						closeLabel: t("delete.close"),
						onClose: () => {
							if (!deleting) setConfirming(false);
						},
						footer: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: ImagesPanel_module_css_default.confirmActions,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								variant: "outline",
								disabled: deleting,
								onClick: () => {
									setConfirming(false);
								},
								children: t("delete.cancel")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								className: ImagesPanel_module_css_default.deleteButton,
								disabled: deleting,
								onClick: () => {
									onDelete().then((deleted) => {
										if (deleted) setConfirming(false);
									});
								},
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconTrashOutlineRegular, { size: 14 }), t(deleting ? "delete.pending" : "delete.confirm")]
							})]
						})
					})
				]
			});
		}
		/** Full-page local ComfyUI image generator. */
		function ImagesPanel({ status: readStatus, history: readHistory, library: readLibrary, generate: requestGeneration, cancel: cancelGeneration, remove: removeGeneration, removeImage, image: readImage, t }) {
			const [draft, setDraft] = (0, react.useState)(EMPTY_DRAFT);
			const [status, setStatus] = (0, react.useState)();
			const [history, setHistory] = (0, react.useState)([]);
			const [library, setLibrary] = (0, react.useState)({
				images: [],
				total: 0
			});
			const [libraryLoading, setLibraryLoading] = (0, react.useState)(false);
			const [galleryView, setGalleryView] = (0, react.useState)("library");
			const [sourcePreview, setSourcePreview] = (0, react.useState)();
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
							model: workflow?.source === "saved" ? workflow.modelId ?? "" : nextStatus.models.some((item) => item.id === current.model) ? current.model : model?.id ?? "",
							workflow: workflow?.id ?? "",
							prompt: currentWorkflow === void 0 ? workflow?.starterPrompt ?? current.prompt : current.prompt,
							width: currentWorkflow === void 0 ? workflow?.width ?? current.width : current.width,
							height: currentWorkflow === void 0 ? workflow?.height ?? current.height : current.height,
							batchSize: currentWorkflow === void 0 ? workflow?.batchSize ?? current.batchSize : current.batchSize,
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
			const refreshLibrary = (0, react.useCallback)(async () => {
				setLibraryLoading(true);
				try {
					setLibrary(await readLibrary(0));
				} catch (reason) {
					setError(errorMessage(reason, t("notice.failed")));
				} finally {
					setLibraryLoading(false);
				}
			}, [readLibrary, t]);
			(0, react.useEffect)(() => {
				if (status?.libraryAvailable === true) refreshLibrary();
			}, [status?.libraryAvailable, refreshLibrary]);
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
			const customSize = !SIZES.some((size) => `${size.width}x${size.height}` === selectedSize);
			const selectedWorkflow = status?.workflows.find((workflow) => workflow.id === draft.workflow);
			const canGenerate = status?.reachable === true && selectedWorkflow?.available === true && draft.prompt.trim() !== "" && !busy;
			const selectedModel = status?.models.find((model) => model.id === (selectedWorkflow?.source === "saved" ? selectedWorkflow.modelId : draft.model));
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
						batchSize: draft.batchSize,
						sourceImage: draft.sourceImage,
						denoise: draft.denoise
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
					batchSize: 1,
					sourceImage: null,
					denoise: .55
				});
				setSourcePreview(void 0);
				document.querySelector("[data-images-composer]")?.scrollIntoView({
					behavior: "smooth",
					block: "start"
				});
			};
			const editImage = (image, generation, src) => {
				if (generation !== void 0) reuse(generation);
				setDraft((current) => ({
					...current,
					sourceImage: image,
					batchSize: 1,
					seed: ""
				}));
				setSourcePreview(src);
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
			const deleteLocalImage = async (image) => {
				setDeleting((current) => [...current, image.filename]);
				try {
					await removeImage(image);
					setLibrary((current) => ({
						images: current.images.filter((item) => item.image.filename !== image.filename || item.image.subfolder !== image.subfolder),
						total: current.total - 1
					}));
					return true;
				} catch (reason) {
					setError(errorMessage(reason, t("notice.failed")));
					return false;
				} finally {
					setDeleting((current) => current.filter((id) => id !== image.filename));
				}
			};
			const loadMore = async () => {
				setLibraryLoading(true);
				try {
					const page = await readLibrary(library.images.length);
					setLibrary((current) => ({
						images: [...current.images, ...page.images],
						total: page.total
					}));
				} catch (reason) {
					setError(errorMessage(reason, t("notice.failed")));
				} finally {
					setLibraryLoading(false);
				}
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("main", {
				className: ImagesPanel_module_css_default.panel,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
						className: ImagesPanel_module_css_default.header,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h1", { children: t("page.title") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: status?.reachable === true ? ImagesPanel_module_css_default.connected : ImagesPanel_module_css_default.offline,
							children: status?.reachable === true ? t("status.connected") : t("status.offline")
						})] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: ImagesPanel_module_css_default.headerActions,
							children: [status?.baseUrl !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("a", {
								className: ImagesPanel_module_css_default.openComfy,
								href: status.baseUrl,
								target: "_blank",
								rel: "noreferrer",
								children: t("action.openComfy")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								size: "sm",
								onClick: () => {
									refresh();
								},
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconRefreshOutlineRegular, { size: 14 }), t("action.refresh")]
							})]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
						className: ImagesPanel_module_css_default.composer,
						"data-images-composer": true,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: ImagesPanel_module_css_default.composerHead,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: t("composer.title") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("composer.hint") })] }), selectedWorkflow !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: selectedWorkflow.label })]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
								className: ImagesPanel_module_css_default.promptInput,
								value: draft.prompt,
								"aria-label": t("composer.placeholder"),
								placeholder: t("composer.placeholder"),
								onChange: (event) => {
									set("prompt", event.target.value);
								}
							}),
							draft.sourceImage !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: ImagesPanel_module_css_default.sourceImage,
								children: [
									sourcePreview !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("img", {
										src: sourcePreview,
										alt: draft.sourceImage.filename
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: t("composer.sourceImage") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: draft.sourceImage.filename })] }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
										size: "sm",
										onClick: () => {
											set("sourceImage", null);
											setSourcePreview(void 0);
										},
										children: t("action.clearSource")
									})
								]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								className: ImagesPanel_module_css_default.negativeInput,
								value: draft.negativePrompt,
								"aria-label": t("composer.negative"),
								placeholder: selectedWorkflow?.supportsNegativePrompt === false ? t("composer.negativeUnsupported") : t("composer.negative"),
								disabled: selectedWorkflow?.supportsNegativePrompt === false,
								onChange: (event) => {
									set("negativePrompt", event.target.value);
								}
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: ImagesPanel_module_css_default.controls,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [t("composer.workflow"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("select", {
										value: draft.workflow,
										onChange: (event) => {
											const workflow = status?.workflows.find((item) => item.id === event.target.value);
											if (workflow?.available === true) setDraft((current) => ({
												...current,
												workflow: workflow.id,
												prompt: workflow.starterPrompt,
												model: workflow.source === "saved" ? workflow.modelId ?? current.model : current.model,
												width: workflow.width,
												height: workflow.height,
												batchSize: current.sourceImage === null ? workflow.batchSize : 1,
												steps: workflow.recommendedSteps,
												cfg: workflow.recommendedCfg
											}));
										},
										children: status?.workflows.map((workflow) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("option", {
											value: workflow.id,
											disabled: !workflow.available,
											children: [workflow.label, workflow.available ? "" : ` · ${workflow.unavailableReason ?? t("status.unavailable")}`]
										}, workflow.id))
									})] }),
									status !== void 0 && status.models.length > 1 && selectedWorkflow?.source === "built-in" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [t("composer.model"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("select", {
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
										children: status.models.map((model) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
											value: model.id,
											children: model.label
										}, model.id))
									})] }),
									draft.sourceImage === null ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [t("composer.size"), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
										value: selectedSize,
										onChange: (event) => {
											const size = SIZES.find((item) => `${item.width}x${item.height}` === event.target.value);
											if (size !== void 0) setDraft((current) => ({
												...current,
												width: size.width,
												height: size.height
											}));
										},
										children: [customSize && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("option", {
											value: selectedSize,
											children: [
												draft.width,
												" × ",
												draft.height
											]
										}), SIZES.map((size) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
											value: `${size.width}x${size.height}`,
											children: t(size.label)
										}, size.label))]
									})] }) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [t("composer.size"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: ImagesPanel_module_css_default.readonlyValue,
										children: t("composer.sourceSize")
									})] }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [t("composer.steps"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										type: "number",
										min: 1,
										max: 150,
										value: draft.steps,
										onChange: (event) => {
											set("steps", Number(event.target.value));
										}
									})] }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [t("composer.cfg"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										type: "number",
										min: 0,
										max: 30,
										step: .5,
										value: draft.cfg,
										onChange: (event) => {
											set("cfg", Number(event.target.value));
										}
									})] }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [t("composer.seed"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										inputMode: "numeric",
										value: draft.seed,
										placeholder: t("composer.random"),
										onChange: (event) => {
											set("seed", event.target.value);
										}
									})] }),
									draft.sourceImage === null && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [t("composer.batch"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										type: "number",
										min: 1,
										max: 8,
										value: draft.batchSize,
										onChange: (event) => {
											set("batchSize", Number(event.target.value));
										}
									})] }),
									draft.sourceImage !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [t("composer.denoise"), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										type: "number",
										min: .05,
										max: 1,
										step: .05,
										value: draft.denoise,
										onChange: (event) => {
											set("denoise", Number(event.target.value));
										}
									})] }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.Button, {
										variant: "primary",
										disabled: !canGenerate,
										onClick: () => {
											generate();
										},
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSparkleRegular, { size: 16 }), busy ? t("composer.generating") : t("composer.generate")]
									})
								]
							}),
							status?.reachable === true && selectedWorkflow !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: ImagesPanel_module_css_default.modelSummary,
								children: t("composer.usingWorkflow", {
									workflow: selectedWorkflow.label,
									model: selectedModel?.label ?? ""
								})
							}),
							status?.reachable === true && !status.workflows.some((workflow) => workflow.available) && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: ImagesPanel_module_css_default.notice,
								children: t("status.noModels")
							}),
							error !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: ImagesPanel_module_css_default.error,
								role: "alert",
								children: error
							})
						]
					}),
					pending.map((promptId) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
						className: ImagesPanel_module_css_default.pending,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: ImagesPanel_module_css_default.pendingArt,
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSparkleRegular, { size: 24 })
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("pending.title") }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
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
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
						className: ImagesPanel_module_css_default.gallery,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: ImagesPanel_module_css_default.galleryHeader,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: t("gallery.title") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: t("gallery.count", { count: library.total }) })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: ImagesPanel_module_css_default.galleryTabs,
								role: "tablist",
								"aria-label": t("gallery.title"),
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									size: "sm",
									"aria-selected": galleryView === "library",
									role: "tab",
									onClick: () => {
										setGalleryView("library");
									},
									children: t("gallery.library")
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									size: "sm",
									"aria-selected": galleryView === "recent",
									role: "tab",
									onClick: () => {
										setGalleryView("recent");
									},
									children: t("gallery.recent")
								})]
							})]
						}), galleryView === "library" ? status?.libraryAvailable !== true ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: ImagesPanel_module_css_default.empty,
							children: t("gallery.unconfigured")
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
							library.images.length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: ImagesPanel_module_css_default.empty,
								children: libraryLoading ? t("gallery.loading") : t("gallery.emptyLibrary")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: ImagesPanel_module_css_default.grid,
								children: library.images.map((stored) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ImageCard, {
									stored,
									image: stored.image,
									deleting: deleting.includes(stored.image.filename),
									load: readImage,
									onDelete: () => deleteLocalImage(stored.image),
									onEdit: editImage,
									t
								}, `${stored.image.subfolder}:${stored.image.filename}`))
							}),
							library.images.length < library.total && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								size: "sm",
								disabled: libraryLoading,
								onClick: () => {
									loadMore();
								},
								children: t("gallery.loadMore")
							})
						] }) : history.length === 0 && pending.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: ImagesPanel_module_css_default.empty,
							children: t("gallery.empty")
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: ImagesPanel_module_css_default.grid,
							children: history.flatMap((generation) => generation.images.map((image) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ImageCard, {
								generation,
								image,
								deleting: deleting.includes(generation.promptId),
								load: readImage,
								onDelete: () => remove(generation),
								onReuse: reuse,
								onEdit: editImage,
								t
							}, `${generation.promptId}:${image.subfolder}:${image.filename}`)))
						})]
					})
				]
			});
		}
		//#endregion
		//#region src/client/locales.ts
		/** Dictionary namespace owned by the Images page. */
		const NS = "images";
		/** Simplified Chinese dictionary (the key-set source of truth). */
		const zh = {
			"panel.label": "图像",
			"page.title": "图像",
			"composer.placeholder": "描述要创建的图像",
			"composer.title": "创建图像",
			"composer.hint": "选择工作流可加载其起始提示词与画布设置，然后按需修改。",
			"composer.negative": "不希望图像中出现的内容",
			"composer.negativeUnsupported": "此工作流在提示词强度 1 时不使用负面提示词",
			"composer.generate": "生成",
			"composer.generating": "正在生成…",
			"composer.model": "模型",
			"composer.workflow": "工作流",
			"composer.usingModel": "使用 {model}",
			"composer.usingWorkflow": "工作流：{workflow} · 模型：{model}",
			"composer.sourceImage": "参考图像",
			"composer.denoise": "变化强度",
			"composer.size": "尺寸",
			"composer.sizeSquare": "正方形 · 1024",
			"composer.sizeLandscape": "横向 · 1216 × 832",
			"composer.sizePortrait": "纵向 · 832 × 1216",
			"composer.sourceSize": "使用原图尺寸",
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
			"action.editImage": "编辑图像",
			"action.clearSource": "移除图像",
			"action.delete": "删除",
			"delete.title": "删除图像？",
			"delete.description": "这将从最近生成中删除此图像以及同一次生成的其他图像。",
			"delete.fileDescription": "这将永久删除 ComfyUI 输出文件夹中的图像。",
			"delete.cancel": "取消",
			"delete.confirm": "删除图像",
			"delete.close": "关闭删除确认",
			"delete.pending": "正在删除…",
			"gallery.title": "图像图库",
			"gallery.library": "本地图像",
			"gallery.recent": "最近生成",
			"gallery.count": "本地保存 {count} 张图像",
			"gallery.localFile": "本地文件",
			"gallery.fileMeta": "{date} · {size} KB",
			"gallery.runMeta": "{width} × {height} · {steps} 步 · 种子 {seed}",
			"gallery.unconfigured": "设置 ComfyUI 输出目录以浏览已保存的图像。",
			"gallery.emptyLibrary": "输出目录中还没有图像。",
			"gallery.loadMore": "加载更多",
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
			"composer.title": "Create an image",
			"composer.hint": "Choose a workflow to load its starter prompt and canvas, then make it your own.",
			"composer.negative": "What should not appear in the image",
			"composer.negativeUnsupported": "This workflow does not use negative prompts at strength 1",
			"composer.generate": "Generate",
			"composer.generating": "Generating…",
			"composer.model": "Model",
			"composer.workflow": "Workflow",
			"composer.usingModel": "Using {model}",
			"composer.usingWorkflow": "Workflow: {workflow} · Model: {model}",
			"composer.sourceImage": "Source image",
			"composer.denoise": "Change strength",
			"composer.size": "Size",
			"composer.sizeSquare": "Square · 1024",
			"composer.sizeLandscape": "Landscape · 1216 × 832",
			"composer.sizePortrait": "Portrait · 832 × 1216",
			"composer.sourceSize": "Source image size",
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
			"action.editImage": "Edit image",
			"action.clearSource": "Remove image",
			"action.delete": "Delete",
			"delete.title": "Delete image?",
			"delete.description": "This removes this image and any others from the same generation from Recent generations.",
			"delete.fileDescription": "This permanently deletes the image from ComfyUI’s output folder.",
			"delete.cancel": "Cancel",
			"delete.confirm": "Delete image",
			"delete.close": "Close delete confirmation",
			"delete.pending": "Deleting…",
			"gallery.title": "Image library",
			"gallery.library": "Local images",
			"gallery.recent": "Recent runs",
			"gallery.count": "{count} images saved locally",
			"gallery.localFile": "Local file",
			"gallery.fileMeta": "{date} · {size} KB",
			"gallery.runMeta": "{width} × {height} · {steps} steps · seed {seed}",
			"gallery.unconfigured": "Set the ComfyUI output directory to browse saved images.",
			"gallery.emptyLibrary": "No images are saved in the output folder yet.",
			"gallery.loadMore": "Load more",
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
		//#region src/client/index.ts
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
				library: (offset) => unwrap(ctx.remote.comfyImages.library({
					offset,
					limit: 40
				})),
				generate: (request) => unwrap(ctx.remote.comfyImages.generate(request)),
				cancel: async (promptId) => {
					await unwrap(ctx.remote.comfyImages.cancel({ promptId }));
				},
				remove: async (promptId) => {
					await unwrap(ctx.remote.comfyImages.deleteGeneration({ promptId }));
				},
				removeImage: async (image) => {
					await unwrap(ctx.remote.comfyImages.deleteImage(image));
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