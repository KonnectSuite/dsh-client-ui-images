window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-images",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let _deepseek_ai_dsh_client_store = require("@deepseek-ai/dsh-client-store");
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		//#region lib/types/client/media.js
		/**
		* The still formats this panel accepts, in one place.
		*
		* A reference image, an upload, and a pasted file all pass the same gate, so the list lives here
		* rather than beside each caller: three copies drift, and a format accepted by one path and
		* refused by another is a failure the user sees as "upload failed" with no reason.
		*
		* These are the Host's still content types. Video types are served for playback and are not
		* accepted as a reference or an upload.
		*/
		const STILL_MEDIA_TYPES = [
			"image/png",
			"image/jpeg",
			"image/webp",
			"image/gif"
		];
		/**
		* Whether a media type is one this panel accepts for a reference or an upload.
		* @param mediaType - The content type to test.
		* @returns true when the type is one of the accepted still formats, narrowing it for the caller.
		*/
		function isStillMediaType(mediaType) {
			return STILL_MEDIA_TYPES.includes(mediaType);
		}
		//#endregion
		//#region lib/types/client/room-state.js
		/** Validate persisted navigation before using it to open Host sessions.
		* @param value - JSON loaded from browser storage.
		* @returns deduplicated navigation, or an empty registry for invalid data.
		*/
		function readImageRooms(value) {
			if (typeof value !== "object" || value === null || !("ids" in value) || !Array.isArray(value.ids) || !value.ids.every((id) => typeof id === "string" && id.length > 0)) return {
				ids: [],
				active: null
			};
			const ids = [...new Set(value.ids)];
			const active = "active" in value && typeof value.active === "string" && ids.includes(value.active) ? value.active : null;
			const savedArchived = "archivedIds" in value ? value.archivedIds : void 0;
			const archivedIds = Array.isArray(savedArchived) ? ids.filter((id) => savedArchived.includes(id)) : void 0;
			return archivedIds === void 0 ? {
				ids,
				active
			} : {
				ids,
				active,
				archivedIds
			};
		}
		//#endregion
		//#region lib/types/client/agent-prompt.js
		/** Opening lines an assembled Images prompt can carry. Sessions logged before the generation
		* tool existed open with the older wording, and their messages are still in the transcript. */
		const IMAGES_TASK_PREFIXES = ["Images task: use the enabled ComfyUI MCP tools", "Images task: choose and execute a suitable installed workflow"];
		/** Display the user's instruction from a logged Images request.
		* @param text - Logged user-message text.
		* @returns the instruction, or unchanged text for other messages.
		*/
		function imageUserText(text) {
			const position = text.indexOf("\n\nUser request:\n");
			return IMAGES_TASK_PREFIXES.some((prefix) => text.startsWith(prefix)) && position !== -1 ? text.slice(position + 16) : text;
		}
		//#endregion
		//#region \0dsh-css:C:\Users\KNPhu\.arya\github\KonnectSuite\AryaAI\packages\client\ui-images\src\client\ImagesPanel.module.css.mjs
		const css = ".VMOGPa_panel{box-sizing:border-box;height:100%;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-base);padding:28px clamp(14px,4%,64px) 48px;overflow-y:auto;container:VMOGPa_images/inline-size}html[data-platform=darwin] .VMOGPa_panel{padding-top:calc(28px + var(--dsh-frame-top-clearance))}.VMOGPa_header,.VMOGPa_headerActions,.VMOGPa_controls,.VMOGPa_cardActions,.VMOGPa_pending{align-items:center;display:flex}.VMOGPa_header{justify-content:space-between;gap:16px;max-width:1200px;margin:0 auto 22px}.VMOGPa_header h1{margin:0;font-size:24px;font-weight:500;line-height:32px}.VMOGPa_header p{margin:3px 0 0;font-size:13px;line-height:20px}.VMOGPa_connected{color:var(--dsw-alias-state-success-primary)}.VMOGPa_offline{color:var(--dsw-alias-state-warn-primary)}.VMOGPa_headerActions{gap:8px}.VMOGPa_openComfy,.VMOGPa_download{color:var(--dsw-alias-label-secondary);align-items:center;gap:5px;font-size:13px;text-decoration:none;display:inline-flex}.VMOGPa_openComfy:hover,.VMOGPa_download:hover{color:var(--dsw-alias-label-primary)}.VMOGPa_composer{border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-xl);background:var(--dsw-alias-bg-layer-1);grid-template-columns:minmax(0,1fr) minmax(300px,350px);gap:14px 22px;max-width:1200px;margin:0 auto 32px;padding:22px;display:grid}.VMOGPa_modeBar{flex-wrap:wrap;align-items:center;gap:8px;max-width:1200px;margin:0 auto 16px;display:flex}.VMOGPa_roomLayout{flex-direction:column;gap:32px;max-width:1200px;margin:auto;display:flex}.VMOGPa_creationArea{min-width:0}.VMOGPa_roomLayout .VMOGPa_gallery{border-top:.5px solid var(--dsw-alias-border-l2);width:100%;min-width:0;margin:0;padding-top:24px}.VMOGPa_roomLayout .VMOGPa_grid{grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:16px}.VMOGPa_roomLayout .VMOGPa_galleryHeader{flex-wrap:wrap;gap:10px}.VMOGPa_roomLayout .VMOGPa_galleryHeaderActions{flex-wrap:wrap}.VMOGPa_roomLayout .VMOGPa_autoComposer{margin:12px auto 0}.VMOGPa_roomPicker{color:var(--dsw-alias-label-secondary);align-items:center;gap:8px;margin-left:auto;font-size:13px;display:flex}.VMOGPa_roomPicker select{border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-layer-1);max-width:240px;color:var(--dsw-alias-label-primary);font:inherit;padding:7px}.VMOGPa_roomError{max-width:1600px;color:var(--dsw-alias-state-error-primary);margin:0 auto 16px}.VMOGPa_uploadButton{color:var(--dsw-alias-label-secondary);flex-wrap:wrap;align-items:center;gap:8px;font-size:13px;display:flex}.VMOGPa_uploadButton input{max-width:100%;font:inherit}@media (width<=1100px){.VMOGPa_roomPicker{margin-left:0}}.VMOGPa_chatStage{--dsh-chat-content-width:760px;--dsh-composer-side-clearance:12px;flex-direction:column;height:clamp(400px,100dvh - 220px,800px);min-height:0;display:flex}.VMOGPa_agentConversation{flex-direction:column;flex:1;min-height:0;padding:12px 0;display:flex;overflow:hidden;container-type:inline-size}.VMOGPa_welcome{text-align:center;box-sizing:border-box;flex-direction:column;justify-content:center;align-items:center;gap:14px;max-width:560px;min-height:100%;margin:auto;padding:0 20px;display:flex}.VMOGPa_welcome h2{margin:0;font-size:24px;font-weight:500;line-height:32px}.VMOGPa_welcome p{color:var(--dsw-alias-label-secondary);margin:0;font-size:14px;line-height:22px}.VMOGPa_starters{flex-wrap:wrap;justify-content:center;gap:8px;display:flex}.VMOGPa_autoComposer{box-sizing:border-box;border-radius:var(--dsw-radius-xl);flex-direction:column;flex-shrink:0;gap:8px;width:min(100%,792px);padding:12px;display:flex}.VMOGPa_autoComposer .VMOGPa_promptInput{resize:none;height:72px;min-height:64px;max-height:140px;padding:6px 8px;font-size:14px;line-height:22px;overflow-y:auto}.VMOGPa_autoComposer .VMOGPa_sourceImage{margin:0}.VMOGPa_composerToolbar{flex-wrap:wrap;align-items:center;gap:8px;min-width:0;display:flex}.VMOGPa_composerActions{align-items:center;gap:8px;margin-left:auto;display:flex}.VMOGPa_dropHint{min-width:0;color:var(--dsw-alias-label-secondary);flex:1;font-size:12px}.VMOGPa_sendButton{corner-shape:round;border-radius:50%;flex-shrink:0;width:34px;height:34px;padding:0}.VMOGPa_dropActive{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:2px}.VMOGPa_fileInput{display:none}.VMOGPa_attachments{gap:8px;max-height:90px;padding-bottom:4px;display:flex;overflow-x:auto}.VMOGPa_attachments .VMOGPa_sourceImage{flex-shrink:0;min-width:200px;max-width:300px}.VMOGPa_composerHead{border-bottom:.5px solid var(--dsw-alias-border-l2);grid-column:1/-1;justify-content:space-between;align-items:flex-start;gap:16px;padding-bottom:14px;display:flex}.VMOGPa_composerHead h2{margin:0;font-size:18px;font-weight:500;line-height:26px}.VMOGPa_composerHead p{color:var(--dsw-alias-label-secondary);margin:3px 0 0;font-size:13px;line-height:20px}.VMOGPa_composerHead>span{border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-layer-3);max-width:40%;color:var(--dsw-alias-label-secondary);text-overflow:ellipsis;white-space:nowrap;padding:6px 10px;font-size:12px;overflow:hidden}.VMOGPa_promptInput,.VMOGPa_negativeInput,.VMOGPa_controls input,.VMOGPa_controls select{box-sizing:border-box;border:.5px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-2);font:inherit}.VMOGPa_promptInput{resize:vertical;background:0 0;border:0;outline:none;width:100%;min-height:190px;padding:12px;font-size:16px;line-height:24px;display:block}.VMOGPa_composer>.VMOGPa_promptInput{grid-area:2/1}.VMOGPa_composer>.VMOGPa_sourceImage,.VMOGPa_composer>.VMOGPa_negativeInput{grid-column:1}.VMOGPa_composer>.VMOGPa_controls{grid-area:2/2/span 3;align-self:start}.VMOGPa_composer>.VMOGPa_notice,.VMOGPa_composer>.VMOGPa_error,.VMOGPa_composer>.VMOGPa_modelSummary{grid-column:1/-1}.VMOGPa_negativeInput{border-radius:var(--dsw-radius-md);width:100%;height:36px;padding:0 10px}.VMOGPa_sourceImage{border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-bg-layer-2);align-items:center;gap:12px;margin:10px 0;padding:8px;display:flex}.VMOGPa_sourceImage img{border-radius:var(--dsw-radius-md);object-fit:cover;width:56px;height:56px}.VMOGPa_sourceImage div{flex-direction:column;flex:1;gap:3px;min-width:0;font-size:13px;display:flex}.VMOGPa_sourceImage strong{font-weight:500}.VMOGPa_sourceImage span{color:var(--dsw-alias-label-secondary);text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.VMOGPa_controls{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:0;display:grid}.VMOGPa_controls label{color:var(--dsw-alias-label-secondary);flex-direction:column;gap:4px;font-size:11px;line-height:16px;display:flex}.VMOGPa_controls label:first-child,.VMOGPa_controls button{grid-column:1/-1}.VMOGPa_controls select,.VMOGPa_controls input{border-radius:var(--dsw-radius-md);width:100%;min-width:0;height:34px;padding:0 8px;font-size:12px}.VMOGPa_controls label:first-child select{width:100%}.VMOGPa_readonlyValue{border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-md);min-height:34px;color:var(--dsw-alias-label-secondary);align-items:center;padding:0 8px;font-size:12px;display:flex}.VMOGPa_controls button{justify-content:center}.VMOGPa_notice,.VMOGPa_error,.VMOGPa_modelSummary{margin:10px 0 0;font-size:13px;line-height:20px}.VMOGPa_notice{color:var(--dsw-alias-state-warn-primary)}.VMOGPa_error{color:var(--dsw-alias-state-error-primary)}.VMOGPa_modelSummary{color:var(--dsw-alias-label-tertiary)}.VMOGPa_pending{border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-bg-layer-1);max-width:960px;color:var(--dsw-alias-label-secondary);gap:12px;margin:0 auto 20px;padding:14px 16px;font-size:13px}.VMOGPa_pending button{margin-left:auto}.VMOGPa_pendingArt{border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-bg-layer-3);width:42px;height:42px;color:var(--dsw-alias-state-business-primary);place-items:center;animation:1.6s ease-in-out infinite VMOGPa_pulse;display:grid}@keyframes VMOGPa_pulse{50%{opacity:.45;transform:scale(.96)}}.VMOGPa_gallery{max-width:1200px;margin:0 auto}.VMOGPa_gallery h2{margin:0 0 14px;font-size:16px;font-weight:500;line-height:24px}.VMOGPa_galleryHeader{justify-content:space-between;align-items:flex-end;gap:16px;margin-bottom:14px;display:flex}.VMOGPa_galleryHeaderActions{align-items:center;gap:10px;display:flex}.VMOGPa_galleryHeader h2{margin-bottom:2px}.VMOGPa_galleryHeader p{color:var(--dsw-alias-label-secondary);margin:0;font-size:13px}.VMOGPa_selectionBar{z-index:4;border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-bg-layer-1);flex-wrap:wrap;align-items:center;gap:8px;margin:0 0 14px;padding:10px 12px;display:flex;position:sticky;top:0}.VMOGPa_selectionBar strong{white-space:nowrap;font-size:13px;font-weight:500}.VMOGPa_selectionBar span{color:var(--dsw-alias-label-secondary);white-space:nowrap;flex:1;font-size:12px}.VMOGPa_selectionBar button{align-items:center;gap:5px;display:inline-flex}.VMOGPa_selectionError{color:var(--dsw-alias-state-error-primary);margin:0 0 12px;font-size:13px}.VMOGPa_gallery>button{margin:18px auto 0;display:block}.VMOGPa_empty{color:var(--dsw-alias-label-tertiary);margin:0;font-size:13px}.VMOGPa_grid{grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px;display:grid}.VMOGPa_card{content-visibility:auto;contain-intrinsic-size:320px 420px;border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-xl);background:var(--dsw-alias-bg-layer-1);overflow:hidden}.VMOGPa_cardSelected{border-color:var(--dsw-alias-state-business-primary);box-shadow:0 0 0 1px var(--dsw-alias-state-business-primary)}.VMOGPa_previewFrame{aspect-ratio:1;background:var(--dsw-alias-bg-layer-2);position:relative}.VMOGPa_preview{aspect-ratio:1;background:var(--dsw-alias-bg-layer-2);cursor:zoom-in;border:0;place-items:center;width:100%;padding:0;display:grid}.VMOGPa_preview:disabled{cursor:default}.VMOGPa_preview img{object-fit:cover;width:100%;height:100%;display:block}.VMOGPa_video{object-fit:contain;width:100%;height:100%;display:block}.VMOGPa_selectionControl{border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-layer-1);cursor:pointer;place-items:center;width:28px;height:28px;padding:0;display:grid;position:absolute;top:9px;left:9px}.VMOGPa_videoSelection{background:0 0;border:0;border-radius:0;place-items:start;width:100%;height:100%;padding:9px;inset:0}.VMOGPa_videoSelection .VMOGPa_selectionCheck{border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-layer-1);place-items:center;width:28px;height:28px;display:grid}.VMOGPa_videoSelection[aria-pressed=true]{background:0 0}.VMOGPa_videoSelection[aria-pressed=true] .VMOGPa_selectionCheck,.VMOGPa_selectionControl[aria-pressed=true]{border-color:var(--dsw-alias-state-business-primary);background:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-bg-base)}.VMOGPa_selectionCheck{font-size:16px;line-height:1}.VMOGPa_selectionControl:focus-visible,.VMOGPa_preview:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:-2px}.VMOGPa_loading,.VMOGPa_failed{color:var(--dsw-alias-label-tertiary);padding:20px;font-size:12px}.VMOGPa_failed{color:var(--dsw-alias-state-error-primary)}.VMOGPa_cardBody{padding:12px}.VMOGPa_workflow{color:var(--dsw-alias-state-business-primary);text-overflow:ellipsis;white-space:nowrap;margin:0 0 6px;font-size:11px;font-weight:500;line-height:16px;overflow:hidden}.VMOGPa_prompt{-webkit-line-clamp:2;-webkit-box-orient:vertical;margin:0;font-size:13px;line-height:19px;display:-webkit-box;overflow:hidden}.VMOGPa_meta{color:var(--dsw-alias-label-tertiary);text-overflow:ellipsis;white-space:nowrap;margin:6px 0 10px;font-size:11px;line-height:16px;overflow:hidden}.VMOGPa_cardActions{flex-wrap:wrap;gap:8px}.VMOGPa_download{margin-left:auto}.VMOGPa_deleteButton{color:var(--dsw-alias-state-error-primary)}.VMOGPa_confirmActions{justify-content:flex-end;gap:8px;display:flex}.VMOGPa_connectionForm{flex-direction:column;gap:12px;min-width:0;display:flex}.VMOGPa_connectionDialog{background:var(--dsw-alias-bg-layer-1);width:520px;max-width:calc(100vw - 32px)}.VMOGPa_connectionForm p{color:var(--dsw-alias-label-secondary);overflow-wrap:anywhere;margin:0;font-size:13px}.VMOGPa_connectionForm label{flex-direction:column;gap:6px;font-size:13px;display:flex}.VMOGPa_connectionForm input,.VMOGPa_connectionForm select{box-sizing:border-box;border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-layer-1);width:100%;min-width:0;color:var(--dsw-alias-label-primary);font:inherit;padding:8px 10px}.VMOGPa_connectionForm .VMOGPa_error{color:var(--dsw-alias-state-error-primary)}.VMOGPa_confirmActions{flex-wrap:wrap}@media (width<=720px){.VMOGPa_panel{padding:20px 14px 36px}.VMOGPa_header{align-items:flex-start}.VMOGPa_headerActions{flex-direction:row;align-items:center}.VMOGPa_actionLabel{display:none}.VMOGPa_conversationList{box-sizing:border-box;flex-direction:row;align-items:center;gap:8px;width:100%;max-height:none;padding:8px 10px;display:flex;overflow:auto hidden}.VMOGPa_withRooms>.VMOGPa_conversationList{align-self:stretch}.VMOGPa_conversationList h2{flex:none;margin:0}.VMOGPa_conversationList .VMOGPa_conversationEntry{flex:none;max-width:220px}.VMOGPa_conversationList .VMOGPa_conversationAction{flex:none}.VMOGPa_composer{flex-direction:column;padding:14px;display:flex}.VMOGPa_promptArea .VMOGPa_promptInput{resize:none;min-height:96px}.VMOGPa_composerHead{padding-bottom:12px}.VMOGPa_composerHead>span{display:none}.VMOGPa_controls,.VMOGPa_controls button{width:100%}.VMOGPa_grid{grid-template-columns:repeat(auto-fill,minmax(180px,1fr))}.VMOGPa_galleryHeader{flex-direction:column;align-items:flex-start}.VMOGPa_galleryHeaderActions{justify-content:space-between;width:100%}.VMOGPa_selectionBar span{flex-basis:100%;order:2}.VMOGPa_chatStage{height:min(620px, max(0px, calc(var(--dsh-frame-viewport-height,100dvh) - 420px)))}[data-dsh-keyboard] .VMOGPa_panel:has(.VMOGPa_chatStage){flex-direction:column;display:flex;overflow:hidden}[data-dsh-keyboard] .VMOGPa_header,[data-dsh-keyboard] .VMOGPa_modeBar,[data-dsh-keyboard] .VMOGPa_conversationList,[data-dsh-keyboard] .VMOGPa_roomPicker,[data-dsh-keyboard] .VMOGPa_roomLayout:has(.VMOGPa_chatStage)>.VMOGPa_gallery{display:none}[data-dsh-keyboard] .VMOGPa_roomLayout:has(.VMOGPa_chatStage){flex:1;gap:0;min-height:0;margin:0}[data-dsh-keyboard] .VMOGPa_chatStage{flex:1;height:auto;min-height:148px}.VMOGPa_autoComposer .VMOGPa_composerToolbar{gap:6px}.VMOGPa_dropHint{display:none}.VMOGPa_composerToolbar .VMOGPa_sendButton{width:34px}.VMOGPa_roomLayout .VMOGPa_grid{grid-template-columns:repeat(auto-fill,minmax(160px,1fr))}}.VMOGPa_promptArea{min-width:0}.VMOGPa_promptVoice{justify-content:flex-end;min-height:32px;padding:0 10px 6px;display:flex}.VMOGPa_withRooms{grid-template-columns:220px minmax(0,1fr);gap:24px;display:grid}.VMOGPa_withRooms>.VMOGPa_gallery{grid-column:2}.VMOGPa_conversationList{border-radius:var(--dsw-radius-xl);background:var(--dsw-alias-bg-layer-1);border:.5px solid var(--dsw-alias-border-l2);grid-area:1/1/span 3;align-self:start;min-width:0;max-height:calc(100dvh - 180px);padding:14px;position:sticky;top:0;overflow-y:auto}.VMOGPa_conversationList h2{margin:0 0 12px;font-size:13px;font-weight:500}.VMOGPa_conversationRow{border-radius:var(--dsw-radius-md);width:100%;color:var(--dsw-alias-label-secondary);font:inherit;text-align:left;cursor:pointer;background:0 0;border:0;align-items:center;gap:8px;padding:10px;font-size:13px;display:flex}.VMOGPa_conversationEntry{align-items:center;display:flex}.VMOGPa_conversationEntry>.VMOGPa_conversationRow{flex:1;min-width:0}.VMOGPa_conversationAction{opacity:0;flex-shrink:0;width:28px;height:28px;padding:0}.VMOGPa_conversationEntry:hover .VMOGPa_conversationAction,.VMOGPa_conversationEntry:focus-within .VMOGPa_conversationAction{opacity:1}@media (hover:none){.VMOGPa_conversationAction{opacity:1}}.VMOGPa_conversationRow span{white-space:nowrap;text-overflow:ellipsis;overflow:hidden}.VMOGPa_conversationRow svg{flex-shrink:0}.VMOGPa_conversationRow:hover,.VMOGPa_conversationRow[aria-current=page]{background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-primary)}.VMOGPa_conversationRow:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary)}@media (width<=900px){.VMOGPa_withRooms{display:flex}.VMOGPa_conversationList{max-height:180px;overflow-y:auto}}@container VMOGPa_images (width<=900px){.VMOGPa_withRooms{display:flex}.VMOGPa_conversationList{max-height:180px;position:static;overflow-y:auto}}@container VMOGPa_images (width<=720px){.VMOGPa_header{flex-wrap:wrap;align-items:flex-start}.VMOGPa_headerActions{flex-wrap:wrap}.VMOGPa_composer{flex-direction:column;padding:14px;display:flex}.VMOGPa_promptArea .VMOGPa_promptInput{resize:none;min-height:96px}.VMOGPa_composerHead>span{display:none}.VMOGPa_controls{width:100%}.VMOGPa_dropHint{display:none}.VMOGPa_roomLayout .VMOGPa_grid{grid-template-columns:repeat(auto-fill,minmax(min(160px,100%),1fr))}}.VMOGPa_communityPanel{flex-direction:column;padding:24px;display:flex;overflow-y:auto}.VMOGPa_communityHeader{flex:none;width:100%;max-width:none}.VMOGPa_communityLayout{flex:none;grid-template-rows:auto;width:100%;max-width:none;min-height:420px;margin:0}.VMOGPa_communityLayout>.VMOGPa_conversationList{grid-row:1}.VMOGPa_communityStage>.VMOGPa_dropHint{flex:none;margin:0 auto 12px}.VMOGPa_communityStage{grid-row:1;height:clamp(400px,52dvh,640px);min-height:0}.VMOGPa_communityConversation{flex-direction:column;flex:1;min-height:0;display:flex}.VMOGPa_communityConversation>[data-slot]{flex-direction:column;flex:1;min-height:0;display:flex}.VMOGPa_communityConversation [data-conversation-content]{--dsh-chat-content-width:min(calc(100% - 32px), 920px);--dsh-composer-card-max-width:min(calc(100% - 16px), 952px)}.VMOGPa_communityConversation [data-conversation-scroll]>[data-slot=conversation\\.session]{flex:1}.VMOGPa_communityConversation [data-conversation-region=composer]{margin-top:auto}.VMOGPa_communityGreeting{text-align:center;padding:48px 20px 24px}.VMOGPa_communityGreeting h2{margin:0 0 12px;font-size:24px;font-weight:500}.VMOGPa_communityGreeting p{color:var(--dsw-alias-label-secondary);margin:0}.VMOGPa_communityBlank>[data-conversation-content]{flex:none}.VMOGPa_communityMedia{margin-top:32px;margin-left:244px}@container VMOGPa_images (width<=900px){.VMOGPa_communityPanel{padding:16px}.VMOGPa_communityMedia{margin-left:0}.VMOGPa_communityStage{flex:none}}.VMOGPa_serverSection{align-items:center;gap:16px;margin-bottom:24px;display:flex}.VMOGPa_serverPanel{border:1px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-xl);background:var(--dsw-alias-bg-layer-1);flex-wrap:wrap;flex:1;justify-content:space-between;align-items:center;gap:16px;padding:18px 22px;display:flex;position:relative;overflow:hidden}.VMOGPa_serverSummary{align-items:center;gap:14px;display:flex}.VMOGPa_serverSummary h2{margin:0 0 4px;font-size:14px;font-weight:500}.VMOGPa_serverSummary p{color:var(--dsw-alias-label-secondary);margin:0;font-size:13px}.VMOGPa_serverPanel[data-server-state=running] .VMOGPa_serverSummary p{color:var(--dsw-alias-state-success-primary)}.VMOGPa_serverPanel[data-server-state=failed] .VMOGPa_serverSummary p{color:var(--dsw-alias-state-error-primary)}.VMOGPa_serverActions{flex-wrap:wrap;gap:8px;display:flex}.VMOGPa_serverProgress{background:var(--dsw-alias-border-l2);height:3px;position:absolute;bottom:0;left:0;right:0}.VMOGPa_serverProgress:after{content:\"\";background:var(--dsw-alias-state-business-primary);width:35%;height:100%;animation:1.4s ease-in-out infinite VMOGPa_serverProgress;display:block}@keyframes VMOGPa_serverProgress{0%{transform:translate(-100%)}to{transform:translate(390%)}}@media (prefers-reduced-motion:reduce){.VMOGPa_serverProgress:after{width:100%;animation:none}}.VMOGPa_chatUnavailable{border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-bg-layer-1);max-width:920px;color:var(--dsw-alias-label-secondary);margin:0 auto 12px;padding:12px 16px;font-size:13px}.VMOGPa_communityPanel .VMOGPa_conversationList{background:var(--dsw-alias-bg-layer-1)}.VMOGPa_communityMedia .VMOGPa_galleryHeader{border-bottom:1px solid var(--dsw-alias-border-l2);padding-bottom:12px}@container VMOGPa_images (width<=720px){.VMOGPa_serverSection{flex-direction:column;align-items:stretch}.VMOGPa_serverPanel{padding:16px}}.VMOGPa_communityPanel{gap:16px;padding:24px 28px}.VMOGPa_communityHeader{align-items:center;gap:24px;margin:0}.VMOGPa_communityHeader p{color:var(--dsw-alias-label-secondary)}.VMOGPa_communityHeader .VMOGPa_headerActions{flex-wrap:wrap;justify-content:flex-end}.VMOGPa_studioToolbar{flex-wrap:wrap;justify-content:space-between;align-items:center;gap:12px;display:flex}.VMOGPa_studioTabs,.VMOGPa_mediaCollections,.VMOGPa_mediaFilters{align-items:center;gap:4px;display:flex}.VMOGPa_studioTabs{background:var(--dsw-alias-bg-layer-1);border-radius:var(--dsw-radius-lg);padding:4px}.VMOGPa_studioTabs [aria-pressed=true],.VMOGPa_mediaCollections [aria-pressed=true],.VMOGPa_mediaFilters [aria-pressed=true]{background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-primary)}.VMOGPa_studioConnection{color:var(--dsw-alias-label-secondary);font-size:13px}.VMOGPa_studioConnection summary{cursor:pointer;align-items:center;gap:8px;padding:8px;display:flex}.VMOGPa_studioConnection[open]{flex-basis:100%}.VMOGPa_studioConnection .VMOGPa_serverSection{margin:8px 0 0}.VMOGPa_studioConnection .VMOGPa_serverPanel{border-width:.5px}.VMOGPa_studioWorkspace{flex:1;grid-template-columns:minmax(0,1fr) minmax(300px,360px);gap:20px;min-height:0;display:grid}.VMOGPa_communityLayout{border-radius:var(--dsw-radius-xl);min-height:480px;box-shadow:var(--dsw-elevation-panel);border:0;flex-direction:column;gap:0;display:flex;overflow:hidden}.VMOGPa_communityLayout[hidden],.VMOGPa_communityMedia .VMOGPa_gallery[hidden]{display:none}.VMOGPa_studioConversations{background:var(--dsw-alias-bg-layer-1);border-bottom:.5px solid var(--dsw-alias-border-l2);padding:12px 18px;font-size:13px}.VMOGPa_studioConversations summary{cursor:pointer;color:var(--dsw-alias-label-secondary)}.VMOGPa_studioConversationTitle{color:var(--dsw-alias-label-primary);overflow-wrap:anywhere;margin-left:14px}.VMOGPa_studioConversations .VMOGPa_conversationList{border:0;max-height:200px;margin-top:12px;padding:0;position:static;overflow-y:auto}.VMOGPa_communityStage{flex:1;height:auto;padding:14px 0 0}.VMOGPa_communityStage>.VMOGPa_dropHint{color:var(--dsw-alias-label-secondary);padding:0 16px;font-size:12px}.VMOGPa_communityConversation{overflow:hidden}.VMOGPa_communityBlank{justify-content:flex-start}.VMOGPa_communityBlank .VMOGPa_communityGreeting{flex:1;min-height:0;margin:0 auto;overflow-y:auto}.VMOGPa_communityBlank>[data-slot]{flex:none}.VMOGPa_communityGreeting{text-align:left;box-sizing:border-box;width:min(100%,800px);margin:auto;padding:32px 28px 20px}.VMOGPa_studioEyebrow{color:var(--dsw-alias-label-secondary);letter-spacing:.12em;font-size:11px;line-height:20px}.VMOGPa_communityGreeting h2{margin:12px 0 8px;font-size:32px;font-weight:500;line-height:40px}.VMOGPa_communityGreeting p{max-width:540px;font-size:14px;line-height:22px}.VMOGPa_ideaGrid{grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:28px;display:grid}.VMOGPa_ideaCard{border:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);border-radius:var(--dsw-radius-lg);cursor:pointer;color:var(--dsw-alias-label-primary);text-align:left;font:inherit;padding:0;overflow:hidden}.VMOGPa_ideaCard:hover{background:var(--dsw-alias-bg-layer-2)}.VMOGPa_ideaCard:focus-visible,.VMOGPa_studioConnection summary:focus-visible,.VMOGPa_studioConversations summary:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:3px}.VMOGPa_ideaCard:disabled{opacity:.5;cursor:default}.VMOGPa_ideaArtwork{height:62px;color:var(--dsw-alias-state-business-primary);background:linear-gradient(135deg, var(--dsw-alias-bg-layer-3), var(--dsw-alias-bg-layer-1));justify-content:center;align-items:center;display:flex}.VMOGPa_ideaArtwork svg{width:26px;height:26px}.VMOGPa_ideaArtwork[data-kind=edit],.VMOGPa_ideaArtwork[data-kind=film]{background:linear-gradient(45deg, var(--dsw-alias-bg-layer-1), var(--dsw-alias-bg-layer-3))}.VMOGPa_ideaCopy{flex-direction:column;gap:5px;padding:12px;display:flex}.VMOGPa_ideaTitle{font-size:13px;font-weight:500;line-height:18px}.VMOGPa_ideaHint{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}.VMOGPa_communityMedia{border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-xl);background:var(--dsw-alias-bg-layer-1);min-width:0;max-height:calc(100dvh - 200px);margin:0;padding:18px;overflow-y:auto}.VMOGPa_mediaHeading{justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:16px;display:flex}.VMOGPa_mediaHeading h2{margin:0 0 6px;font-size:16px;font-weight:500;line-height:24px}.VMOGPa_mediaHeading p{color:var(--dsw-alias-label-secondary);margin:0;font-size:12px;line-height:18px}.VMOGPa_mediaSearch{box-sizing:border-box;border:.5px solid var(--dsw-alias-border-l2);border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-base);width:100%;color:var(--dsw-alias-label-primary);font:inherit;margin:12px 0 8px;padding:10px 12px;font-size:13px}.VMOGPa_mediaSearch:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:2px}.VMOGPa_communityMedia .VMOGPa_gallery{width:100%;max-width:none;margin:16px 0 0}.VMOGPa_communityMedia .VMOGPa_grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.VMOGPa_communityMedia .VMOGPa_cardBody{padding:10px}.VMOGPa_communityMedia .VMOGPa_cardActions{flex-wrap:wrap;gap:6px}.VMOGPa_communityMedia .VMOGPa_prompt{overflow-wrap:anywhere;font-size:12px}.VMOGPa_communityMedia .VMOGPa_selectionBar{flex-wrap:wrap;padding:12px 0;position:static}.VMOGPa_communityMedia .VMOGPa_video{aspect-ratio:1;object-fit:cover;width:100%}.VMOGPa_communityMedia .VMOGPa_preview{aspect-ratio:1}.VMOGPa_communityPanel[data-studio-view=library] .VMOGPa_studioWorkspace{grid-template-columns:minmax(0,1fr)}.VMOGPa_communityPanel[data-studio-view=library] .VMOGPa_communityMedia{max-height:none}.VMOGPa_communityPanel[data-studio-view=library] .VMOGPa_communityMedia .VMOGPa_grid{grid-template-columns:repeat(auto-fill,minmax(200px,1fr))}@container VMOGPa_images (width<=1100px){.VMOGPa_studioWorkspace{grid-template-columns:minmax(0,1fr) 300px;gap:14px}.VMOGPa_communityGreeting{padding:24px 20px 16px}.VMOGPa_communityGreeting h2{font-size:28px;line-height:36px}.VMOGPa_ideaGrid{margin-top:20px}.VMOGPa_ideaArtwork{height:36px}.VMOGPa_ideaCopy{padding:10px}}@container VMOGPa_images (width<=850px){.VMOGPa_studioWorkspace{grid-template-columns:minmax(0,1fr)}.VMOGPa_communityMedia{max-height:none}.VMOGPa_communityMedia .VMOGPa_grid{grid-template-columns:repeat(auto-fill,minmax(180px,1fr))}.VMOGPa_communityGreeting h2{font-size:24px;line-height:32px}}@container VMOGPa_images (width<=520px){.VMOGPa_communityPanel{padding:16px}.VMOGPa_communityHeader .VMOGPa_headerActions{justify-content:flex-start}.VMOGPa_communityLayout{min-height:560px}.VMOGPa_communityGreeting{padding:20px 16px}.VMOGPa_ideaGrid{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:18px}.VMOGPa_ideaArtwork{height:40px}.VMOGPa_studioConversationTitle{margin:6px 0 0;display:block}}";
		const tagId = "@deepseek-ai/dsh-client-ui-images/ImagesPanel.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-images";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var ImagesPanel_module_css_default = {
			"actionLabel": "VMOGPa_actionLabel",
			"agentConversation": "VMOGPa_agentConversation",
			"attachments": "VMOGPa_attachments",
			"autoComposer": "VMOGPa_autoComposer",
			"card": "VMOGPa_card",
			"cardActions": "VMOGPa_cardActions",
			"cardBody": "VMOGPa_cardBody",
			"cardSelected": "VMOGPa_cardSelected",
			"chatStage": "VMOGPa_chatStage",
			"chatUnavailable": "VMOGPa_chatUnavailable",
			"communityBlank": "VMOGPa_communityBlank",
			"communityConversation": "VMOGPa_communityConversation",
			"communityGreeting": "VMOGPa_communityGreeting",
			"communityHeader": "VMOGPa_communityHeader",
			"communityLayout": "VMOGPa_communityLayout",
			"communityMedia": "VMOGPa_communityMedia",
			"communityPanel": "VMOGPa_communityPanel",
			"communityStage": "VMOGPa_communityStage",
			"composer": "VMOGPa_composer",
			"composerActions": "VMOGPa_composerActions",
			"composerHead": "VMOGPa_composerHead",
			"composerToolbar": "VMOGPa_composerToolbar",
			"confirmActions": "VMOGPa_confirmActions",
			"connected": "VMOGPa_connected",
			"connectionDialog": "VMOGPa_connectionDialog",
			"connectionForm": "VMOGPa_connectionForm",
			"controls": "VMOGPa_controls",
			"conversationAction": "VMOGPa_conversationAction",
			"conversationEntry": "VMOGPa_conversationEntry",
			"conversationList": "VMOGPa_conversationList",
			"conversationRow": "VMOGPa_conversationRow",
			"creationArea": "VMOGPa_creationArea",
			"deleteButton": "VMOGPa_deleteButton",
			"download": "VMOGPa_download",
			"dropActive": "VMOGPa_dropActive",
			"dropHint": "VMOGPa_dropHint",
			"empty": "VMOGPa_empty",
			"error": "VMOGPa_error",
			"failed": "VMOGPa_failed",
			"fileInput": "VMOGPa_fileInput",
			"gallery": "VMOGPa_gallery",
			"galleryHeader": "VMOGPa_galleryHeader",
			"galleryHeaderActions": "VMOGPa_galleryHeaderActions",
			"grid": "VMOGPa_grid",
			"header": "VMOGPa_header",
			"headerActions": "VMOGPa_headerActions",
			"ideaArtwork": "VMOGPa_ideaArtwork",
			"ideaCard": "VMOGPa_ideaCard",
			"ideaCopy": "VMOGPa_ideaCopy",
			"ideaGrid": "VMOGPa_ideaGrid",
			"ideaHint": "VMOGPa_ideaHint",
			"ideaTitle": "VMOGPa_ideaTitle",
			"images": "VMOGPa_images",
			"loading": "VMOGPa_loading",
			"mediaCollections": "VMOGPa_mediaCollections",
			"mediaFilters": "VMOGPa_mediaFilters",
			"mediaHeading": "VMOGPa_mediaHeading",
			"mediaSearch": "VMOGPa_mediaSearch",
			"meta": "VMOGPa_meta",
			"modeBar": "VMOGPa_modeBar",
			"modelSummary": "VMOGPa_modelSummary",
			"negativeInput": "VMOGPa_negativeInput",
			"notice": "VMOGPa_notice",
			"offline": "VMOGPa_offline",
			"openComfy": "VMOGPa_openComfy",
			"panel": "VMOGPa_panel",
			"pending": "VMOGPa_pending",
			"pendingArt": "VMOGPa_pendingArt",
			"preview": "VMOGPa_preview",
			"previewFrame": "VMOGPa_previewFrame",
			"prompt": "VMOGPa_prompt",
			"promptArea": "VMOGPa_promptArea",
			"promptInput": "VMOGPa_promptInput",
			"promptVoice": "VMOGPa_promptVoice",
			"pulse": "VMOGPa_pulse",
			"readonlyValue": "VMOGPa_readonlyValue",
			"roomError": "VMOGPa_roomError",
			"roomLayout": "VMOGPa_roomLayout",
			"roomPicker": "VMOGPa_roomPicker",
			"selectionBar": "VMOGPa_selectionBar",
			"selectionCheck": "VMOGPa_selectionCheck",
			"selectionControl": "VMOGPa_selectionControl",
			"selectionError": "VMOGPa_selectionError",
			"sendButton": "VMOGPa_sendButton",
			"serverActions": "VMOGPa_serverActions",
			"serverPanel": "VMOGPa_serverPanel",
			"serverProgress": "VMOGPa_serverProgress",
			"serverSection": "VMOGPa_serverSection",
			"serverSummary": "VMOGPa_serverSummary",
			"sourceImage": "VMOGPa_sourceImage",
			"starters": "VMOGPa_starters",
			"studioConnection": "VMOGPa_studioConnection",
			"studioConversationTitle": "VMOGPa_studioConversationTitle",
			"studioConversations": "VMOGPa_studioConversations",
			"studioEyebrow": "VMOGPa_studioEyebrow",
			"studioTabs": "VMOGPa_studioTabs",
			"studioToolbar": "VMOGPa_studioToolbar",
			"studioWorkspace": "VMOGPa_studioWorkspace",
			"uploadButton": "VMOGPa_uploadButton",
			"video": "VMOGPa_video",
			"videoSelection": "VMOGPa_videoSelection",
			"welcome": "VMOGPa_welcome",
			"withRooms": "VMOGPa_withRooms",
			"workflow": "VMOGPa_workflow"
		};
		//#endregion
		//#region lib/types/client/StudioIdeas.js
		/** Editable creative briefs offered before a Content conversation begins. */
		const IDEAS = [
			"photo",
			"edit",
			"design",
			"animate",
			"film",
			"storyboard"
		];
		/** Offer creative starting points without sending a request or spending a render.
		* @param props - Localized idea briefs, availability and draft insertion.
		* @returns Keyboard-accessible idea cards.
		*/
		function StudioIdeas({ t, onPick, disabled }) {
			return (0, react_jsx_runtime.jsx)("div", {
				className: ImagesPanel_module_css_default.ideaGrid,
				children: IDEAS.map((idea, index) => {
					const Icon = index === 1 ? _deepseek_ai_dsh_client_ui_primitives.IconEditOutlineRegular : index === 2 ? _deepseek_ai_dsh_client_ui_primitives.IconEnhanceOutlineRegular : index === 4 ? _deepseek_ai_dsh_client_ui_primitives.IconMicrophoneOutlineRegular : index === 5 ? _deepseek_ai_dsh_client_ui_primitives.IconPlanOutlineRegular : _deepseek_ai_dsh_client_ui_primitives.IconSparkleRegular;
					return (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: ImagesPanel_module_css_default.ideaCard,
						disabled,
						onClick: () => {
							onPick(t(`studio.${idea}.prompt`));
						},
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: ImagesPanel_module_css_default.ideaArtwork,
							"data-kind": idea,
							"aria-hidden": "true",
							children: (0, react_jsx_runtime.jsx)(Icon, {})
						}), (0, react_jsx_runtime.jsxs)("span", {
							className: ImagesPanel_module_css_default.ideaCopy,
							children: [(0, react_jsx_runtime.jsx)("span", {
								className: ImagesPanel_module_css_default.ideaTitle,
								children: t(`studio.${idea}.title`)
							}), (0, react_jsx_runtime.jsx)("span", {
								className: ImagesPanel_module_css_default.ideaHint,
								children: t(`studio.${idea}.hint`)
							})]
						})]
					}, idea);
				})
			});
		}
		//#endregion
		//#region lib/types/client/ImagesAgent.js
		/** Embedded Images conversation using the resident Conversation factory. */
		function ImagesChatView({ renderSlot }) {
			return renderSlot("conversation.session", { view: "chat" });
		}
		/**
		* Refresh media when the Images agent settles; render standard tool and approval UI.
		* @param props - Session-scoped renderer seats and gallery refresh callback.
		* @returns the embedded conversation.
		*/
		function ImagesAgent({ useSession, renderFactorySlot, onSettled, onUseStarter, attachPreview, t, readOnly = false }) {
			(0, react.useLayoutEffect)(attachPreview, [attachPreview]);
			const blank = useSession((state) => state.blank);
			const running = useSession((state) => state.running);
			const error = useSession((state) => state.promptError?.error.message ?? state.lastAgentError);
			const wasRunning = (0, react.useRef)(false);
			const refresh = (0, react.useRef)(onSettled);
			refresh.current = onSettled;
			(0, react.useEffect)(() => {
				if (wasRunning.current && !running) refresh.current();
				wasRunning.current = running;
			}, [running]);
			return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.UserTextPresentationContext.Provider, {
				value: imageUserText,
				children: (0, react_jsx_runtime.jsxs)("div", {
					className: `${ImagesPanel_module_css_default.communityConversation} ${blank && !running ? ImagesPanel_module_css_default.communityBlank : ""}`,
					children: [
						blank && !running && (0, react_jsx_runtime.jsxs)("div", {
							className: ImagesPanel_module_css_default.communityGreeting,
							children: [
								(0, react_jsx_runtime.jsx)("span", {
									className: ImagesPanel_module_css_default.studioEyebrow,
									children: t("studio.eyebrow")
								}),
								(0, react_jsx_runtime.jsx)("h2", { children: t("studio.welcome") }),
								(0, react_jsx_runtime.jsx)("p", { children: t("studio.welcomeHint") }),
								(0, react_jsx_runtime.jsx)(StudioIdeas, {
									t,
									onPick: onUseStarter,
									disabled: readOnly
								})
							]
						}),
						error != null && (0, react_jsx_runtime.jsx)("p", {
							className: ImagesPanel_module_css_default.roomError,
							role: "alert",
							children: error
						}),
						renderFactorySlot("conversation.content", {
							variant: "embedded",
							phase: "active",
							hero: false,
							transcriptOnly: readOnly
						}, { slots: { views: ImagesChatView } })
					]
				})
			});
		}
		/** Render the resident model and permission controls beside the Images composer.
		* @param props Session controls, stop operation and localized labels.
		* @returns Model selection, permission selection and a stop action while running.
		*/
		function ImagesAgentControls({ useSession, renderFactorySlot, stop, locked, t }) {
			const running = useSession((state) => state.running);
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				renderFactorySlot("permission.selection", { locked }),
				renderFactorySlot("model.selection", { locked }),
				running && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
					size: "sm",
					onClick: () => {
						stop().catch((_error) => {});
					},
					children: t("room.stop")
				})
			] });
		}
		//#endregion
		//#region lib/types/client/ComfyConnection.js
		/** Profile connection form shared by Images direct generation and MCP execution. */
		/** Open, test and save the profile's ComfyUI connection without losing the image draft.
		* @param props Localized form and persistent connection operations.
		* @returns Header action and dismissable connection modal.
		*/
		function ComfyConnection({ t, readConnection, testConnection, saveConnection, onSaved, startServer, stopServer, restartServer, readStatus, pollIntervalMs, onServerState, presentation }) {
			const [open, setOpen] = (0, react.useState)(false);
			const [settings, setSettings] = (0, react.useState)();
			const [pending, setPending] = (0, react.useState)(false);
			const [error, setError] = (0, react.useState)();
			const [tested, setTested] = (0, react.useState)(false);
			const [serverBusy, setServerBusy] = (0, react.useState)(false);
			const [phase, setPhase] = (0, react.useState)("checking");
			const operation = (0, react.useRef)(false);
			const epoch = (0, react.useRef)(0);
			const [statusRevision, setStatusRevision] = (0, react.useState)(0);
			const [serverState, setServerState] = (0, react.useState)();
			const [serverError, setServerError] = (0, react.useState)();
			(0, react.useEffect)(() => {
				onServerState?.(phase);
			}, [onServerState, phase]);
			(0, react.useEffect)(() => {
				if (readStatus === void 0) return void 0;
				let disposed = false;
				let timer;
				const check = async () => {
					const version = epoch.current;
					try {
						if (!operation.current) {
							const status = await readStatus();
							if (!disposed && version === epoch.current) {
								setPhase(status.reachable ? "running" : "stopped");
								setServerError(void 0);
							}
						}
					} catch (cause) {
						if (!disposed && version === epoch.current && !operation.current) {
							setPhase("failed");
							setServerError(cause instanceof Error ? cause.message : String(cause));
						}
					} finally {
						if (!disposed && pollIntervalMs !== void 0) timer = setTimeout(() => {
							check();
						}, pollIntervalMs());
					}
				};
				check();
				return () => {
					disposed = true;
					if (timer !== void 0) clearTimeout(timer);
				};
			}, [
				readStatus,
				pollIntervalMs,
				statusRevision
			]);
			const fail = (reason) => {
				setError(reason instanceof Error ? reason.message : String(reason));
			};
			const control = async (action, transition) => {
				epoch.current++;
				operation.current = true;
				setPhase(transition);
				setServerBusy(true);
				setServerError(void 0);
				try {
					const result = await action();
					setServerState(result.detail);
					setPhase(result.running ? "running" : "stopped");
					onSaved();
				} catch (reason) {
					setPhase("failed");
					setServerError(reason instanceof Error ? reason.message : String(reason));
				} finally {
					operation.current = false;
					setServerBusy(false);
				}
			};
			const show = async () => {
				setOpen(true);
				setPending(true);
				setSettings(void 0);
				setError(void 0);
				setTested(false);
				try {
					setSettings(await readConnection());
				} catch (reason) {
					fail(reason);
				} finally {
					setPending(false);
				}
			};
			const test = async () => {
				/* v8 ignore next -- the footer disables Test and Save until the profile's connection loads. */
				if (!settings) return;
				setPending(true);
				setError(void 0);
				setTested(false);
				try {
					await testConnection(settings.baseUrl);
					setTested(true);
				} catch (reason) {
					fail(reason);
				} finally {
					setPending(false);
				}
			};
			const save = async () => {
				/* v8 ignore next -- the footer disables Test and Save until the profile's connection loads. */
				if (!settings) return;
				setPending(true);
				setError(void 0);
				try {
					await saveConnection(settings);
					epoch.current++;
					setPhase("checking");
					setStatusRevision((value) => value + 1);
					onSaved();
					setOpen(false);
				} catch (reason) {
					fail(reason);
				} finally {
					setPending(false);
				}
			};
			/* v8 ignore next -- the stylesheet always declares the class; the empty fallback only satisfies exactOptionalPropertyTypes. */
			const dialogClass = ImagesPanel_module_css_default.connectionDialog ?? "";
			const controls = (0, react_jsx_runtime.jsxs)("div", {
				className: ImagesPanel_module_css_default.serverActions,
				children: [
					(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
						disabled: serverBusy || phase === "running" || phase === "checking",
						onClick: () => {
							control(startServer, "starting");
						},
						children: t("connection.serverStart")
					}),
					(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
						variant: "outline",
						disabled: serverBusy || phase !== "running",
						onClick: () => {
							control(stopServer, "stopping");
						},
						children: t("connection.serverStop")
					}),
					(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
						variant: "outline",
						disabled: serverBusy || phase !== "running",
						onClick: () => {
							control(restartServer, "restarting");
						},
						children: t("connection.serverRestart")
					})
				]
			});
			const transitioning = phase === "checking" || phase === "starting" || phase === "stopping" || phase === "restarting";
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				presentation === "panel" && (0, react_jsx_runtime.jsxs)("section", {
					className: ImagesPanel_module_css_default.serverPanel,
					"data-server-state": phase,
					"aria-busy": transitioning,
					children: [
						(0, react_jsx_runtime.jsxs)("div", {
							className: ImagesPanel_module_css_default.serverSummary,
							children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, {
								state: transitioning ? "ongoing" : phase === "running" ? "done" : phase === "failed" ? "error" : "idle",
								size: 24
							}), (0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("h2", { children: t("server.title") }), (0, react_jsx_runtime.jsx)("p", {
								role: "status",
								"aria-live": "polite",
								children: t(`server.${phase}`)
							})] })]
						}),
						controls,
						transitioning && (0, react_jsx_runtime.jsx)("div", {
							className: ImagesPanel_module_css_default.serverProgress,
							role: "progressbar",
							"aria-label": t(`server.${phase}`)
						}),
						serverError !== void 0 && (0, react_jsx_runtime.jsx)("p", {
							className: ImagesPanel_module_css_default.roomError,
							role: "alert",
							children: serverError
						})
					]
				}),
				(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
					label: t("connection.open"),
					side: "bottom",
					delayMs: 500,
					portal: true,
					children: (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.Button, {
						size: "sm",
						onClick: () => {
							show();
						},
						"aria-label": t("connection.open"),
						children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSlidersTwoOutlineRegular, { size: 14 }), (0, react_jsx_runtime.jsx)("span", {
							className: ImagesPanel_module_css_default.actionLabel,
							children: t("connection.open")
						})]
					})
				}),
				(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
					open,
					title: t("connection.title"),
					closeLabel: t("delete.close"),
					className: dialogClass,
					onClose: () => {
						if (!pending) setOpen(false);
					},
					footer: (0, react_jsx_runtime.jsxs)("div", {
						className: ImagesPanel_module_css_default.confirmActions,
						children: [
							(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								variant: "outline",
								disabled: pending,
								onClick: () => {
									setOpen(false);
								},
								children: t("delete.cancel")
							}),
							(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								variant: "outline",
								disabled: pending || !settings?.baseUrl.trim(),
								onClick: () => {
									test();
								},
								children: t("connection.test")
							}),
							(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								disabled: pending || !settings?.baseUrl.trim(),
								onClick: () => {
									save();
								},
								children: t(pending ? "connection.pending" : "connection.save")
							})
						]
					}),
					children: (0, react_jsx_runtime.jsxs)("div", {
						className: ImagesPanel_module_css_default.connectionForm,
						children: [
							(0, react_jsx_runtime.jsx)("p", { children: t("connection.description") }),
							settings && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
								(0, react_jsx_runtime.jsxs)("label", { children: [t("connection.location"), (0, react_jsx_runtime.jsxs)("select", {
									disabled: pending,
									value: settings.remote ? "remote" : "local",
									onChange: (event) => {
										setSettings({
											...settings,
											remote: event.target.value === "remote"
										});
										setTested(false);
									},
									children: [(0, react_jsx_runtime.jsx)("option", {
										value: "local",
										children: t("connection.local")
									}), (0, react_jsx_runtime.jsx)("option", {
										value: "remote",
										children: t("connection.remote")
									})]
								})] }),
								(0, react_jsx_runtime.jsxs)("label", { children: [t("connection.address"), (0, react_jsx_runtime.jsx)("input", {
									type: "url",
									disabled: pending,
									value: settings.baseUrl,
									onChange: (event) => {
										setSettings({
											...settings,
											baseUrl: event.target.value
										});
										setTested(false);
									}
								})] }),
								(0, react_jsx_runtime.jsxs)("label", { children: [t("connection.folder"), (0, react_jsx_runtime.jsx)("input", {
									disabled: pending,
									value: settings.outputDirectory,
									onChange: (event) => {
										setSettings({
											...settings,
											outputDirectory: event.target.value
										});
									}
								})] }),
								(0, react_jsx_runtime.jsx)("p", { children: t("connection.folderHint") })
							] }),
							(0, react_jsx_runtime.jsx)("div", {
								role: "status",
								"aria-live": "polite",
								children: pending ? t("connection.pending") : tested ? t("connection.connected") : null
							}),
							error && (0, react_jsx_runtime.jsx)("p", {
								role: "alert",
								className: ImagesPanel_module_css_default.error,
								children: error
							}),
							(0, react_jsx_runtime.jsxs)("section", { children: [
								(0, react_jsx_runtime.jsx)("p", { children: t("connection.serverDescription") }),
								(0, react_jsx_runtime.jsx)("p", {
									role: "status",
									children: t(`server.${phase}`)
								}),
								(0, react_jsx_runtime.jsxs)("div", {
									className: ImagesPanel_module_css_default.confirmActions,
									children: [
										(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
											variant: "outline",
											disabled: serverBusy,
											onClick: () => {
												control(startServer, "starting");
											},
											children: t("connection.serverStart")
										}),
										(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
											variant: "outline",
											disabled: serverBusy,
											onClick: () => {
												control(stopServer, "stopping");
											},
											children: t("connection.serverStop")
										}),
										(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
											variant: "outline",
											disabled: serverBusy,
											onClick: () => {
												control(restartServer, "restarting");
											},
											children: t("connection.serverRestart")
										})
									]
								}),
								(0, react_jsx_runtime.jsx)("div", {
									role: "status",
									"aria-live": "polite",
									children: serverBusy ? t("connection.serverPending") : serverState ?? null
								}),
								serverError && (0, react_jsx_runtime.jsx)("p", {
									role: "alert",
									className: ImagesPanel_module_css_default.error,
									children: serverError
								})
							] })
						]
					})
				})
			] });
		}
		//#endregion
		//#region lib/types/client/Starters.js
		/** Starter examples offered while an Images conversation is empty. */
		//#endregion
		//#region lib/types/client/ImagesPanel.js
		const COMFY_MEDIA_ROUTE = "api/comfyui-media";
		function mediaUrl(image) {
			return `${COMFY_MEDIA_ROUTE}?${new URLSearchParams({
				filename: image.filename,
				subfolder: image.subfolder
			})}`;
		}
		function isVideo(image) {
			return /\.(mp4|webm|mov|mkv)$/iu.test(image.filename);
		}
		/** Render saved or generated media with preview, download, edit, and delete actions.
		* @param props - Media metadata, loader, actions, and localized labels.
		* @returns A media card.
		*/
		function ImageCard({ generation, stored, image, deleting, selecting, selected, onSelect, load, onDelete, onReuse, onEdit, onAttach, onFrame, t }) {
			const [remoteSrc, setRemoteSrc] = (0, react.useState)();
			const [failed, setFailed] = (0, react.useState)(false);
			const [open, setOpen] = (0, react.useState)(false);
			const [confirming, setConfirming] = (0, react.useState)(false);
			const [visible, setVisible] = (0, react.useState)(false);
			const cardRef = (0, react.useRef)(null);
			const videoRef = (0, react.useRef)(null);
			const [frameError, setFrameError] = (0, react.useState)(false);
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
				if (!visible || stored !== void 0) return void 0;
				const controller = new AbortController();
				load(image).then((value) => {
					if (!controller.signal.aborted) setRemoteSrc(value);
				}).catch(() => {
					if (!controller.signal.aborted) setFailed(true);
				});
				return () => {
					controller.abort();
				};
			}, [
				image,
				load,
				stored,
				visible
			]);
			const src = stored === void 0 ? remoteSrc : visible ? mediaUrl(image) : void 0;
			const video = isVideo(image);
			return (0, react_jsx_runtime.jsxs)("article", {
				ref: cardRef,
				draggable: !selecting,
				onDragStart: (event) => {
					event.dataTransfer.setData("application/x-arya-media", JSON.stringify(image));
					event.dataTransfer.effectAllowed = "copy";
				},
				className: `${ImagesPanel_module_css_default.card} ${selected ? ImagesPanel_module_css_default.cardSelected : ""}`,
				children: [
					(0, react_jsx_runtime.jsxs)("div", {
						className: ImagesPanel_module_css_default.previewFrame,
						children: [video ? src !== void 0 && !failed ? (0, react_jsx_runtime.jsx)("video", {
							ref: videoRef,
							className: ImagesPanel_module_css_default.video,
							src,
							controls: !selecting,
							preload: "metadata",
							playsInline: true,
							onError: () => {
								setFailed(true);
							}
						}) : (0, react_jsx_runtime.jsx)("div", {
							className: ImagesPanel_module_css_default.preview,
							children: (0, react_jsx_runtime.jsx)("span", {
								className: failed ? ImagesPanel_module_css_default.failed : ImagesPanel_module_css_default.loading,
								children: failed ? t("gallery.failed") : t("gallery.loading")
							})
						}) : (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: ImagesPanel_module_css_default.preview,
							disabled: src === void 0 && !selecting,
							"aria-label": selecting ? t("selection.toggle", { name: image.filename }) : t("gallery.open", { name: image.filename }),
							onClick: (event) => {
								if (selecting) onSelect?.(event.shiftKey);
								else setOpen(true);
							},
							children: src !== void 0 ? (0, react_jsx_runtime.jsx)("img", {
								src,
								alt: generation?.prompt ?? image.filename,
								loading: "lazy",
								onError: () => {
									setFailed(true);
								}
							}) : (0, react_jsx_runtime.jsx)("span", {
								className: failed ? ImagesPanel_module_css_default.failed : ImagesPanel_module_css_default.loading,
								children: failed ? t("gallery.failed") : t("gallery.loading")
							})
						}), selecting && (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: `${ImagesPanel_module_css_default.selectionControl} ${video ? ImagesPanel_module_css_default.videoSelection : ""}`,
							"aria-pressed": selected,
							"aria-label": t("selection.toggle", { name: image.filename }),
							onClick: (event) => {
								onSelect?.(event.shiftKey);
							},
							children: (0, react_jsx_runtime.jsx)("span", {
								className: ImagesPanel_module_css_default.selectionCheck,
								"aria-hidden": "true",
								children: selected ? "✓" : ""
							})
						})]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: ImagesPanel_module_css_default.cardBody,
						children: [
							frameError && (0, react_jsx_runtime.jsx)("p", {
								role: "alert",
								children: t("notice.frameFailed")
							}),
							(0, react_jsx_runtime.jsx)("p", {
								className: ImagesPanel_module_css_default.workflow,
								children: generation === void 0 ? t(video ? "gallery.localVideo" : "gallery.localFile") : t("gallery.workflow", { workflow: generation.workflowLabel })
							}),
							(0, react_jsx_runtime.jsx)("p", {
								className: ImagesPanel_module_css_default.prompt,
								children: generation?.prompt ?? image.filename
							}),
							(0, react_jsx_runtime.jsx)("p", {
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
							!selecting && (0, react_jsx_runtime.jsxs)("div", {
								className: ImagesPanel_module_css_default.cardActions,
								children: [
									video && onFrame !== void 0 && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
										size: "sm",
										onClick: () => {
											const player = videoRef.current;
											if (player === null || player.videoWidth === 0) {
												setFrameError(true);
												return;
											}
											const canvas = document.createElement("canvas");
											canvas.width = player.videoWidth;
											canvas.height = player.videoHeight;
											try {
												const context = canvas.getContext("2d");
												if (context === null) throw new Error("Canvas unavailable");
												context.drawImage(player, 0, 0);
												canvas.toBlob((blob) => {
													if (blob === null) {
														setFrameError(true);
														return;
													}
													onFrame(new File([blob], image.filename + "-frame.png", { type: "image/png" })).then(() => {
														setFrameError(false);
													}).catch(() => {
														setFrameError(true);
													});
												}, "image/png");
											} catch (_error) {
												setFrameError(true);
											}
										},
										children: t("action.useFrame")
									}),
									onAttach !== void 0 && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
										size: "sm",
										onClick: () => {
											onAttach(image);
										},
										children: t("action.addToChat")
									}),
									generation !== void 0 && !video && onReuse !== void 0 && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
										size: "sm",
										onClick: () => {
											onReuse(generation);
										},
										children: t("action.reuse")
									}),
									src !== void 0 && !video && onEdit !== void 0 && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
										size: "sm",
										onClick: () => {
											onEdit(image, generation, src);
										},
										children: t("action.editImage")
									}),
									src !== void 0 && (0, react_jsx_runtime.jsxs)("a", {
										className: ImagesPanel_module_css_default.download,
										href: stored === void 0 ? src : mediaUrl(image),
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
					open && src !== void 0 && !video && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.ImageLightbox, {
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
					(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
						open: confirming,
						title: t("delete.title"),
						description: t(generation === void 0 ? "delete.fileDescription" : "delete.description"),
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
									onDelete().then((deleted) => {
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
		//#endregion
		//#region lib/types/client/CommunityMedia.js
		/** Recent ComfyUI runs and the local media library beside community chat. */
		/** Render saved media without taking over plugin generation.
		* @param props - Existing media operations and a refresh revision.
		* @returns Recent runs, saved files, and an image-edit prompt.
		*/
		function CommunityMedia({ revision, canCreate = true, ...props }) {
			const [runs, setRuns] = (0, react.useState)([]);
			const [library, setLibrary] = (0, react.useState)({
				images: [],
				total: 0
			});
			const [error, setError] = (0, react.useState)();
			const [source, setSource] = (0, react.useState)();
			const [prompt, setPrompt] = (0, react.useState)("");
			const [busy, setBusy] = (0, react.useState)(false);
			const [selecting, setSelecting] = (0, react.useState)(false);
			const [selected, setSelected] = (0, react.useState)([]);
			const [confirmDelete, setConfirmDelete] = (0, react.useState)(false);
			const anchor = (0, react.useRef)(void 0);
			const [refresh, setRefresh] = (0, react.useState)(0);
			const [query, setQuery] = (0, react.useState)("");
			const [kind, setKind] = (0, react.useState)("all");
			const [collection, setCollection] = (0, react.useState)("library");
			(0, react.useEffect)(() => {
				let disposed = false;
				Promise.allSettled([props.history(), props.library(0)]).then(([history, page]) => {
					if (disposed) return;
					if (history.status === "fulfilled") setRuns(history.value);
					if (page.status === "fulfilled") setLibrary(page.value);
					const cause = history.status === "rejected" ? history.reason : page.status === "rejected" ? page.reason : void 0;
					setError(cause === void 0 ? void 0 : cause instanceof Error ? cause.message : props.t("notice.failed"));
				});
				return () => {
					disposed = true;
				};
			}, [
				props.history,
				props.library,
				props.t,
				revision,
				refresh
			]);
			const key = (image) => JSON.stringify([
				image.type,
				image.subfolder,
				image.filename
			]);
			const chosen = [...new Map([...runs.flatMap((run) => run.images), ...library.images.map((item) => item.image)].map((image) => [key(image), image])).values()].filter((image) => selected.includes(key(image)));
			const matches = (image, prompt = "") => {
				const video = /\.(mp4|webm|mov|mkv)$/iu.test(image.filename);
				return (kind === "all" || (kind === "videos" ? video : !video)) && `${image.filename} ${prompt}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());
			};
			const visibleMedia = collection === "recent" ? runs.flatMap((run) => run.images.filter((image) => matches(image, run.prompt))) : library.images.filter((item) => matches(item.image)).map((item) => item.image);
			const toggle = (image, shift) => {
				const index = visibleMedia.findIndex((item) => key(item) === key(image));
				const range = shift && anchor.current !== void 0 ? visibleMedia.slice(Math.min(index, anchor.current), Math.max(index, anchor.current) + 1) : [image];
				setSelected((current) => {
					const next = new Set(current);
					if (!shift && next.has(key(image))) next.delete(key(image));
					else for (const item of range) if (next.size < 100) next.add(key(item));
					return [...next];
				});
				anchor.current = index;
			};
			const download = async () => {
				setBusy(true);
				setError(void 0);
				try {
					const url = "api/comfyui-archive?" + new URLSearchParams({ files: JSON.stringify(chosen) }).toString();
					const response = await fetch(url, { method: "HEAD" });
					if (!response.ok) throw new Error(await response.text());
					const link = document.createElement("a");
					link.href = url;
					link.download = "aryaai-media.zip";
					link.click();
				} catch (cause) {
					setError(cause instanceof Error ? cause.message : props.t("notice.failed"));
				} finally {
					setBusy(false);
				}
			};
			const deleteSelection = async () => {
				setBusy(true);
				setError(void 0);
				try {
					const result = await props.removeImages(chosen);
					const deleted = new Set(result.deleted.map(key));
					setRuns((current) => current.map((run) => ({
						...run,
						images: run.images.filter((image) => !deleted.has(key(image)))
					})));
					setLibrary((current) => ({
						images: current.images.filter((item) => !deleted.has(key(item.image))),
						total: Math.max(0, current.total - result.deleted.length)
					}));
					setSelected((current) => current.filter((value) => !deleted.has(value)));
					setConfirmDelete(false);
					if (result.failed.length > 0) setError(props.t("selection.deleteFailed", { count: result.failed.length }));
				} catch (cause) {
					setError(cause instanceof Error ? cause.message : props.t("notice.failed"));
				} finally {
					setBusy(false);
				}
			};
			const selectionButton = (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
				disabled: busy,
				onClick: () => {
					setSelecting((value) => !value);
					setSelected([]);
					anchor.current = void 0;
				},
				children: props.t(selecting ? "selection.done" : "selection.start")
			});
			const attach = (image) => {
				setError(void 0);
				props.addMedia?.([image]).catch((cause) => {
					setError(cause instanceof Error ? cause.message : props.t("notice.attachFailed"));
				});
			};
			const edit = (image) => {
				setSource(image);
				setPrompt("");
			};
			const remove = async (operation) => {
				try {
					await operation();
					setRefresh((value) => value + 1);
					return true;
				} catch (cause) {
					setError(cause instanceof Error ? cause.message : props.t("notice.failed"));
					return false;
				}
			};
			return (0, react_jsx_runtime.jsxs)("div", {
				className: ImagesPanel_module_css_default.communityMedia,
				children: [
					(0, react_jsx_runtime.jsxs)("div", {
						className: ImagesPanel_module_css_default.mediaHeading,
						children: [(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("h2", { children: props.t("studio.library") }), (0, react_jsx_runtime.jsx)("p", { children: props.t("studio.mediaHint") })] }), selectionButton]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: ImagesPanel_module_css_default.mediaCollections,
						children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							size: "sm",
							variant: "ghost",
							"aria-pressed": collection === "library",
							onClick: () => {
								setCollection("library");
								anchor.current = void 0;
							},
							children: props.t("gallery.library")
						}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							size: "sm",
							variant: "ghost",
							"aria-pressed": collection === "recent",
							onClick: () => {
								setCollection("recent");
								anchor.current = void 0;
							},
							children: props.t("gallery.recent")
						})]
					}),
					(0, react_jsx_runtime.jsx)("input", {
						className: ImagesPanel_module_css_default.mediaSearch,
						type: "search",
						value: query,
						"aria-label": props.t("studio.search"),
						placeholder: props.t("studio.searchHint"),
						onChange: (event) => {
							setQuery(event.target.value);
							anchor.current = void 0;
						}
					}),
					(0, react_jsx_runtime.jsx)("div", {
						className: ImagesPanel_module_css_default.mediaFilters,
						children: [
							"all",
							"images",
							"videos"
						].map((value) => (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							size: "sm",
							variant: "ghost",
							"aria-pressed": kind === value,
							onClick: () => {
								setKind(value);
								anchor.current = void 0;
							},
							children: props.t(`studio.${value}`)
						}, value))
					}),
					error !== void 0 && (0, react_jsx_runtime.jsx)("p", {
						role: "alert",
						className: ImagesPanel_module_css_default.roomError,
						children: error
					}),
					selecting && (0, react_jsx_runtime.jsxs)("div", {
						className: ImagesPanel_module_css_default.selectionBar,
						children: [
							(0, react_jsx_runtime.jsx)("span", { children: props.t("selection.count", { count: chosen.length }) }),
							props.addMedia !== void 0 && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								disabled: !canCreate || busy || chosen.length === 0,
								onClick: () => {
									setBusy(true);
									props.addMedia?.(chosen).catch((cause) => {
										setError(cause instanceof Error ? cause.message : props.t("notice.attachFailed"));
									}).finally(() => {
										setBusy(false);
									});
								},
								children: props.t("action.addToChat")
							}),
							(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								disabled: busy,
								onClick: () => {
									setSelected(visibleMedia.slice(0, 100).map(key));
								},
								children: props.t("selection.selectLoaded")
							}),
							(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								disabled: busy || chosen.length === 0,
								onClick: () => {
									setSelected([]);
								},
								children: props.t("selection.clear")
							}),
							(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								disabled: busy || chosen.length === 0,
								onClick: () => {
									download();
								},
								children: props.t("selection.download")
							}),
							(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								disabled: busy || chosen.length === 0,
								onClick: () => {
									setConfirmDelete(true);
								},
								children: props.t("selection.delete")
							}),
							busy && (0, react_jsx_runtime.jsx)("span", {
								role: "status",
								children: props.t("connection.pending")
							})
						]
					}),
					visibleMedia.length === 0 && (query !== "" || kind !== "all") && (0, react_jsx_runtime.jsx)("p", {
						className: ImagesPanel_module_css_default.empty,
						role: "status",
						children: props.t("studio.noMatches")
					}),
					(0, react_jsx_runtime.jsxs)("section", {
						className: ImagesPanel_module_css_default.gallery,
						"aria-label": props.t("gallery.recent"),
						hidden: collection !== "recent",
						children: [runs.length === 0 && (0, react_jsx_runtime.jsx)("p", {
							className: ImagesPanel_module_css_default.empty,
							children: props.t("gallery.empty")
						}), (0, react_jsx_runtime.jsx)("div", {
							className: ImagesPanel_module_css_default.grid,
							children: runs.flatMap((run) => run.images.filter((image) => matches(image, run.prompt)).map((image) => (0, react_jsx_runtime.jsx)(ImageCard, {
								generation: run,
								image,
								deleting: busy,
								load: props.image,
								onEdit: canCreate ? edit : void 0,
								onAttach: canCreate && props.addMedia !== void 0 ? attach : void 0,
								onFrame: canCreate && props.addFiles !== void 0 ? async (file) => {
									await props.addFiles?.([file]);
								} : void 0,
								t: props.t,
								selecting,
								selected: selected.includes(key(image)),
								onSelect: (shift) => {
									toggle(image, shift);
								},
								onDelete: () => remove(() => props.remove(run.promptId))
							}, `${run.promptId}:${image.subfolder}:${image.filename}`)))
						})]
					}),
					(0, react_jsx_runtime.jsxs)("section", {
						className: ImagesPanel_module_css_default.gallery,
						"aria-label": props.t("gallery.library"),
						hidden: collection !== "library",
						children: [
							library.images.length === 0 && (0, react_jsx_runtime.jsx)("p", {
								className: ImagesPanel_module_css_default.empty,
								children: props.t("gallery.emptyLibrary")
							}),
							(0, react_jsx_runtime.jsx)("div", {
								className: ImagesPanel_module_css_default.grid,
								children: library.images.filter((stored) => matches(stored.image)).map((stored) => (0, react_jsx_runtime.jsx)(ImageCard, {
									image: stored.image,
									stored,
									deleting: busy,
									load: props.image,
									onEdit: canCreate ? edit : void 0,
									onAttach: canCreate && props.addMedia !== void 0 ? attach : void 0,
									onFrame: canCreate && props.addFiles !== void 0 ? async (file) => {
										await props.addFiles?.([file]);
									} : void 0,
									t: props.t,
									selecting,
									selected: selected.includes(key(stored.image)),
									onSelect: (shift) => {
										toggle(stored.image, shift);
									},
									onDelete: () => remove(() => props.removeImage(stored.image))
								}, `${stored.image.subfolder}:${stored.image.filename}`))
							}),
							library.images.length < library.total && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								onClick: () => {
									props.library(library.images.length).then((page) => {
										setLibrary((current) => ({
											...page,
											images: [...current.images, ...page.images]
										}));
									}).catch((cause) => {
										setError(cause instanceof Error ? cause.message : props.t("notice.failed"));
									});
								},
								children: props.t("gallery.loadMore")
							})
						]
					}),
					(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
						open: confirmDelete,
						title: props.t("selection.confirmTitle", { count: chosen.length }),
						description: props.t("selection.confirmDescription", { count: chosen.length }),
						closeLabel: props.t("delete.close"),
						onClose: () => {
							if (!busy) setConfirmDelete(false);
						},
						footer: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							disabled: busy,
							onClick: () => {
								setConfirmDelete(false);
							},
							children: props.t("delete.cancel")
						}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							disabled: busy || chosen.length === 0,
							onClick: () => {
								deleteSelection();
							},
							children: props.t("delete.confirm")
						})] })
					}),
					(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
						open: source !== void 0,
						title: props.t("composer.editTitle"),
						closeLabel: props.t("delete.close"),
						onClose: () => {
							if (!busy) setSource(void 0);
						},
						footer: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							disabled: !canCreate || busy || prompt.trim() === "",
							onClick: () => {
								if (source === void 0) return;
								setBusy(true);
								props.status().then((status) => props.askAgent(prompt, status, source)).then(() => {
									setSource(void 0);
									setRefresh((value) => value + 1);
								}).catch((cause) => {
									setError(cause instanceof Error ? cause.message : props.t("notice.failed"));
								}).finally(() => {
									setBusy(false);
								});
							},
							children: props.t("room.send")
						}),
						children: (0, react_jsx_runtime.jsx)("textarea", {
							"aria-label": props.t("composer.editHint"),
							placeholder: props.t("composer.editHint"),
							value: prompt,
							onChange: (event) => {
								setPrompt(event.target.value);
							},
							disabled: busy
						})
					})
				]
			});
		}
		//#endregion
		//#region lib/types/client/CommunityImagesPanel.js
		/** Dedicated Images navigation around the standard session conversation. */
		/** Render profile-installed image generation with ordinary chat tools and cards.
		* @param props - Durable Images sessions, plugin availability, and resident chat slots.
		* @returns The plugin setup state or full session conversation.
		*/
		function CommunityImagesPanel(props) {
			const { rooms, currentAgent, settleAgent, openRoom, resetAgent, roomTitle, exportRoom, archiveRoom, renderSlot, SessionProvider, imagePlugin, openImagePlugin, t } = props;
			const navigation = (0, react.useSyncExternalStore)((listener) => rooms.subscribe(listener), () => rooms.getSnapshot());
			const [reference, setReference] = (0, react.useState)(currentAgent);
			const [serverPhase, setServerPhase] = (0, react.useState)("checking");
			const [ready, setReady] = (0, react.useState)();
			const [error, setError] = (0, react.useState)();
			const [busy, setBusy] = (0, react.useState)(false);
			const [revision, setRevision] = (0, react.useState)(0);
			const [archived, setArchived] = (0, react.useState)(false);
			const [view, setView] = (0, react.useState)("studio");
			(0, react.useEffect)(() => {
				let disposed = false;
				setReady(void 0);
				setError(void 0);
				imagePlugin().then((value) => {
					if (!disposed) setReady(value);
				}).catch((cause) => {
					if (!disposed) setError(cause instanceof Error ? cause.message : t("notice.failed"));
				});
				return () => {
					disposed = true;
				};
			}, [
				imagePlugin,
				revision,
				t
			]);
			(0, react.useEffect)(() => {
				settleAgent?.(reference);
			}, [reference, settleAgent]);
			(0, react.useEffect)(() => {
				if (ready !== true || reference !== void 0) return void 0;
				let disposed = false;
				resetAgent().then((value) => {
					if (!disposed) setReference(value);
				}).catch((cause) => {
					if (!disposed) setError(cause instanceof Error ? cause.message : t("notice.failed"));
				});
				return () => {
					disposed = true;
				};
			}, [
				ready,
				reference,
				resetAgent,
				t
			]);
			const visibleIds = navigation.ids.filter((id) => (navigation.archivedIds ?? []).includes(id) === archived);
			const select = (operation) => {
				setBusy(true);
				setError(void 0);
				operation().then(setReference).catch((cause) => {
					setError(cause instanceof Error ? cause.message : t("notice.failed"));
				}).finally(() => {
					setBusy(false);
				});
			};
			return (0, react_jsx_runtime.jsxs)("main", {
				className: `${ImagesPanel_module_css_default.panel} ${ImagesPanel_module_css_default.communityPanel}`,
				"data-studio-view": view,
				children: [
					(0, react_jsx_runtime.jsxs)("header", {
						className: `${ImagesPanel_module_css_default.header} ${ImagesPanel_module_css_default.communityHeader}`,
						children: [(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("h1", { children: t("page.title") }), (0, react_jsx_runtime.jsx)("p", { children: t("community.description") })] }), (0, react_jsx_runtime.jsxs)("div", {
							className: ImagesPanel_module_css_default.headerActions,
							children: [
								(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: "outline",
									onClick: openImagePlugin,
									children: t("community.settings")
								}),
								(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: "outline",
									onClick: () => {
										setRevision((value) => value + 1);
									},
									children: t("action.refresh")
								}),
								reference !== void 0 && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: "outline",
									onClick: () => {
										exportRoom(reference.sessionId).then((exported) => {
											if (!exported) setError(t("notice.exportUnavailable"));
										}).catch((cause) => {
											setError(cause instanceof Error ? cause.message : t("notice.failed"));
										});
									},
									children: t("action.export")
								}),
								ready === true && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: "primary",
									disabled: busy,
									onClick: () => {
										select(resetAgent);
									},
									children: t("composer.newConversation")
								})
							]
						})]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: ImagesPanel_module_css_default.studioToolbar,
						children: [(0, react_jsx_runtime.jsxs)("div", {
							className: ImagesPanel_module_css_default.studioTabs,
							"aria-label": t("studio.views"),
							children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								variant: "ghost",
								"aria-pressed": view === "studio",
								onClick: () => {
									setView("studio");
								},
								children: t("studio.workspace")
							}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								variant: "ghost",
								"aria-pressed": view === "library",
								onClick: () => {
									setView("library");
								},
								children: t("studio.library")
							})]
						}), (0, react_jsx_runtime.jsxs)("details", {
							className: ImagesPanel_module_css_default.studioConnection,
							children: [(0, react_jsx_runtime.jsxs)("summary", { children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: serverPhase === "running" ? "done" : serverPhase === "checking" ? "ongoing" : "error" }), t(serverPhase === "running" ? "studio.connected" : serverPhase === "checking" ? "server.checking" : "studio.offline")] }), (0, react_jsx_runtime.jsx)("div", {
								className: ImagesPanel_module_css_default.serverSection,
								children: renderSlot("images.connection", {
									presentation: "panel",
									onServerState: setServerPhase,
									onSaved: () => {
										setRevision((value) => value + 1);
									}
								})
							})]
						})]
					}),
					error !== void 0 && (0, react_jsx_runtime.jsx)("p", {
						className: ImagesPanel_module_css_default.roomError,
						role: "alert",
						children: error
					}),
					ready === void 0 && error === void 0 && (0, react_jsx_runtime.jsx)("div", {
						className: ImagesPanel_module_css_default.welcome,
						children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, {
							state: "ongoing",
							size: 28
						})
					}),
					ready === false && (0, react_jsx_runtime.jsxs)("section", {
						className: ImagesPanel_module_css_default.welcome,
						children: [
							(0, react_jsx_runtime.jsx)("h2", { children: t("community.installTitle") }),
							(0, react_jsx_runtime.jsx)("p", { children: t("community.installHint") }),
							(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								onClick: openImagePlugin,
								children: t("community.installAction")
							}),
							(0, react_jsx_runtime.jsx)("a", {
								href: "https://github.com/KonnectSuite/dsh-image-gen",
								target: "_blank",
								rel: "noreferrer",
								children: t("community.about")
							})
						]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: ImagesPanel_module_css_default.studioWorkspace,
						children: [(0, react_jsx_runtime.jsxs)("div", {
							className: `${ImagesPanel_module_css_default.roomLayout} ${ImagesPanel_module_css_default.communityLayout}`,
							hidden: view !== "studio",
							children: [(0, react_jsx_runtime.jsxs)("details", {
								className: ImagesPanel_module_css_default.studioConversations,
								children: [(0, react_jsx_runtime.jsxs)("summary", { children: [t("room.conversations"), (0, react_jsx_runtime.jsx)("span", {
									className: ImagesPanel_module_css_default.studioConversationTitle,
									children: reference === void 0 ? t("composer.newConversation") : roomTitle(reference.sessionId)
								})] }), (0, react_jsx_runtime.jsxs)("nav", {
									className: ImagesPanel_module_css_default.conversationList,
									"aria-label": t("room.conversations"),
									children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
										variant: "ghost",
										onClick: () => {
											setArchived((value) => !value);
										},
										children: t(archived ? "room.active" : "room.archived")
									}), visibleIds.map((id) => (0, react_jsx_runtime.jsxs)("div", {
										className: ImagesPanel_module_css_default.conversationEntry,
										children: [(0, react_jsx_runtime.jsx)("button", {
											type: "button",
											className: ImagesPanel_module_css_default.conversationRow,
											disabled: busy,
											"aria-current": reference?.sessionId === id ? "page" : void 0,
											onClick: () => {
												select(() => openRoom(id));
											},
											children: roomTitle(id)
										}), archiveRoom !== void 0 && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
											variant: "ghost",
											disabled: busy,
											onClick: () => {
												archiveRoom(id, !archived).then(() => {
													if (reference?.sessionId === id && !archived) setReference(void 0);
												}).catch((cause) => {
													setError(cause instanceof Error ? cause.message : t("notice.failed"));
												});
											},
											children: t(archived ? "room.restore" : "room.archive")
										})]
									}, id))]
								})]
							}), (0, react_jsx_runtime.jsxs)("section", {
								className: `${ImagesPanel_module_css_default.creationArea} ${ImagesPanel_module_css_default.chatStage} ${ImagesPanel_module_css_default.communityStage}`,
								onDragOver: (event) => {
									if (serverPhase === "running" && ready === true) {
										event.preventDefault();
										event.dataTransfer.dropEffect = "copy";
									}
								},
								onDrop: (event) => {
									if (event.defaultPrevented) return;
									const encoded = event.dataTransfer.getData("application/x-arya-media");
									if (encoded === "" && event.dataTransfer.files.length === 0) return;
									event.preventDefault();
									if (serverPhase !== "running" || ready !== true) return;
									try {
										let operation;
										if (encoded !== "") {
											const item = JSON.parse(encoded);
											if (typeof item !== "object" || item === null || !("filename" in item) || typeof item.filename !== "string" || !("subfolder" in item) || typeof item.subfolder !== "string" || !("type" in item) || typeof item.type !== "string") throw new Error(t("notice.attachFailed"));
											operation = props.addMedia?.([{
												filename: item.filename,
												subfolder: item.subfolder,
												type: item.type
											}]);
										} else operation = props.addFiles?.([...event.dataTransfer.files]);
										operation?.catch((cause) => {
											setError(cause instanceof Error ? cause.message : t("notice.attachFailed"));
										});
									} catch (cause) {
										setError(cause instanceof Error ? cause.message : t("notice.attachFailed"));
									}
								},
								children: [
									(0, react_jsx_runtime.jsx)("p", {
										className: ImagesPanel_module_css_default.dropHint,
										children: t("room.mediaDrop")
									}),
									ready === true && serverPhase !== "running" && (0, react_jsx_runtime.jsx)("p", {
										className: ImagesPanel_module_css_default.chatUnavailable,
										role: "status",
										children: t("server.chatUnavailable")
									}),
									reference !== void 0 && (0, react_jsx_runtime.jsx)(SessionProvider, {
										session: reference,
										children: renderSlot("images.agent", {
											onSettled: () => {
												setRevision((value) => value + 1);
											},
											onUseStarter: (text) => {
												props.fillDraft?.(text).catch((cause) => {
													setError(cause instanceof Error ? cause.message : t("notice.failed"));
												});
											},
											readOnly: serverPhase !== "running" || ready !== true || (navigation.archivedIds ?? []).includes(reference.sessionId)
										})
									})
								]
							})]
						}), (0, react_jsx_runtime.jsx)(CommunityMedia, {
							...props,
							revision,
							canCreate: ready === true && serverPhase === "running"
						})]
					})
				]
			});
		}
		//#endregion
		//#region lib/types/client/ImagesIcon.js
		/** Decorative photo glyph used by the Images navigation row. */
		function ImagesIcon({ size }) {
			return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.LinkIconRegular, {
				kind: "image",
				size
			});
		}
		//#endregion
		//#region lib/types/client/locales.js
		/** Dictionary namespace owned by the Images page. */
		const NS = "images";
		/** Simplified Chinese dictionary (the key-set source of truth). */
		const zh = {
			"studio.views": "内容视图",
			"studio.workspace": "创作工作室",
			"studio.library": "媒体库",
			"studio.eyebrow": "你的创意伙伴",
			"studio.welcome": "把想法变成作品",
			"studio.welcomeHint": "从一句想法或一张参考图开始。和 Arya 一起策划、创作并完善每个细节。",
			"studio.connected": "本地引擎已就绪",
			"studio.offline": "检查本地引擎",
			"studio.draftPreserved": "已保留当前草稿。清空草稿后再选择创意",
			"studio.search": "搜索已加载媒体",
			"studio.searchHint": "搜索文件名或提示词",
			"studio.all": "全部媒体",
			"studio.images": "图片",
			"studio.videos": "视频",
			"studio.noMatches": "没有匹配的媒体。试试其他关键词或筛选",
			"studio.mediaHint": "拖入对话，或添加为参考。原文件保持不变。",
			"studio.photo.title": "摄影作品",
			"studio.photo.hint": "产品、人物与空间",
			"studio.photo.prompt": "帮我创作一张专业产品照片：简洁背景、自然光线与精致构图。先一起确定产品和视觉方向。",
			"studio.edit.title": "编辑照片",
			"studio.edit.hint": "修改背景、风格或细节",
			"studio.edit.prompt": "我想编辑一张照片。我会添加参考图；请先帮我确定修改内容及需要保留的主体细节。",
			"studio.design.title": "品牌视觉",
			"studio.design.hint": "海报、社交媒体与透明素材",
			"studio.design.prompt": "帮我策划一组风格一致的品牌视觉。先确定受众、发布渠道、品牌氛围和所需尺寸，再制作素材。",
			"studio.animate.title": "让图片动起来",
			"studio.animate.hint": "参考图片 → 视频场景",
			"studio.animate.prompt": "把我将添加的参考图片变成一个短视频场景。保持主体和构图，加入自然的细微动作与缓慢镜头运动。",
			"studio.film.title": "制作影片",
			"studio.film.hint": "场景、节奏与音频",
			"studio.film.prompt": "帮我策划并制作一部多场景短片。先明确受众、主题和总时长，保存故事板，再逐场景生成并拼接影片。",
			"studio.storyboard.title": "探索创意",
			"studio.storyboard.hint": "从想法到拍摄计划",
			"studio.storyboard.prompt": "我有一个内容创意，想先一起探索方向。帮我提炼核心概念、受众和视觉风格，再形成可修订的故事板，先不要生成媒体。",
			"action.useFrame": "将当前帧用作参考",
			"notice.frameFailed": "请先加载视频并选择一帧，然后重试。",
			"action.addToChat": "添加到对话",
			"notice.attachFailed": "无法添加媒体。请重试，或先新建对话。",
			"room.mediaDrop": "将图库中的图片或视频拖到这里，或点击添加到对话。",
			"server.title": "本地图像服务器",
			"server.checking": "正在检查服务器…",
			"server.running": "正在运行 · 可以创作图片",
			"server.stopped": "已停止 · 启动服务器后即可创作",
			"server.starting": "正在启动服务器…",
			"server.stopping": "正在停止服务器…",
			"server.restarting": "正在重启服务器…",
			"server.failed": "连接失败 · 请检查服务器设置",
			"server.chatUnavailable": "服务器就绪后可发送图像请求。已保存的对话和照片仍可查看。",
			"community.welcomeHint": "描述要创作的图片或视频，添加参考图片并告诉 Arya 要保留或修改什么。",
			"community.description": "在对话中创作图片和视频、编辑图片并复用已有媒体",
			"community.settings": "创作设置",
			"community.installTitle": "启用图像创作",
			"community.installHint": "在 Plugin Market 中启用或恢复随应用提供的 dsh-image-gen bundle，再配置图像服务。完成后返回这里并点击刷新。",
			"community.installAction": "打开插件页面",
			"community.about": "查看图像插件",
			"connection.open": "ComfyUI 连接",
			"connection.title": "连接 ComfyUI",
			"connection.description": "设置本地图像服务器地址及媒体保存文件夹。图像插件的服务设置单独管理。",
			"connection.location": "服务器位置",
			"connection.local": "此电脑",
			"connection.remote": "远程电脑",
			"connection.address": "服务器地址",
			"connection.folder": "可访问的输出文件夹（可选）",
			"connection.folderHint": "文件夹必须可由运行 Arya 的电脑访问。远程服务器可使用共享文件夹；留空仍可生成和查看最近运行。",
			"connection.test": "测试连接",
			"connection.save": "保存并重新连接",
			"connection.pending": "请稍候…",
			"connection.connected": "已连接到 ComfyUI",
			"connection.serverDescription": "在本机启动、停止或重启 ComfyUI。停止只会结束 ComfyUI 自己的进程。",
			"connection.serverStart": "启动服务器",
			"connection.serverStop": "停止服务器",
			"connection.serverRestart": "重启服务器",
			"connection.serverPending": "正在处理服务器…",
			"room.title": "内容",
			"room.conversation": "图像会话",
			"room.send": "发送消息",
			"room.stop": "停止",
			"room.drop": "拖放参考照片",
			"room.attachHint": "添加、拖放或粘贴参考照片",
			"gallery.recentHint": "最近在 ComfyUI 生成的图像和视频",
			"room.welcome": "想创作什么？",
			"starter.portrait": "秋日阳光下的一只狐狸肖像照",
			"starter.edit": "把这张照片画成油画",
			"starter.video": "日出时海浪拍岸的短视频",
			"action.export": "导出会话",
			"notice.exportUnavailable": "当前部署未提供会话导出。",
			"room.conversations": "会话",
			"room.archive": "归档",
			"room.archived": "已归档",
			"room.active": "当前会话",
			"room.restore": "恢复",
			"room.restoreFirst": "请先恢复此已归档会话，再发送消息。",
			"room.missing": "此会话已不可用，已从列表中移除。",
			"composer.upload": "添加参考照片",
			"composer.uploadType": "请选择 PNG、JPEG、WebP 或 GIF 图像。",
			"composer.newConversation": "新建内容会话",
			"composer.auto": "对话",
			"composer.advanced": "高级",
			"composer.autoHint": "与 Arya 对话来创建或修改照片和视频。工作流由 Arya 选择；可添加参考照片或选择图库中的图像。",
			"composer.editTitle": "编辑图像",
			"composer.editHint": "描述想要的修改，以及哪些内容需要保留。",
			"composer.voiceSetup": "设置语音输入",
			"panel.label": "内容",
			"page.title": "内容",
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
			"gallery.library": "本地媒体",
			"gallery.recent": "最近生成",
			"gallery.count": "本地保存 {count} 个文件",
			"gallery.localFile": "本地文件",
			"gallery.localVideo": "本地视频",
			"gallery.fileMeta": "{date} · {size} KB",
			"gallery.runMeta": "{width} × {height} · {steps} 步 · 种子 {seed}",
			"gallery.unconfigured": "设置 ComfyUI 输出目录以浏览已保存的图像。",
			"gallery.emptyLibrary": "输出目录中还没有图像。",
			"gallery.loadMore": "加载更多",
			"gallery.workflow": "工作流：{workflow}",
			"gallery.empty": "生成的图像会显示在这里。",
			"gallery.loading": "正在加载预览…",
			"gallery.failed": "无法预览此文件。",
			"gallery.open": "查看图像：{name}",
			"gallery.close": "关闭图像",
			"selection.start": "选择",
			"selection.done": "完成",
			"selection.count": "已选择 {count} 个",
			"selection.hint": "按住 Shift 可选择连续文件",
			"selection.selectLoaded": "选择已加载文件",
			"selection.clear": "清除",
			"selection.download": "下载 ZIP",
			"selection.delete": "删除所选",
			"selection.toggle": "选择 {name}",
			"selection.limit": "一次最多选择 100 个文件",
			"selection.confirmTitle": "删除 {count} 个文件？",
			"selection.confirmDescription": "这将从 ComfyUI 输出目录中永久删除所选图像和视频。",
			"selection.confirmDelete": "删除所选",
			"selection.deleteFailed": "{count} 个文件未能删除；它们仍保留在图库中",
			"selection.removeRuns": "移除运行记录",
			"selection.removeRunsTitle": "移除所选运行记录？",
			"selection.removeRunsDescription": "从最近生成中移除所选完整运行。图像和视频文件仍保留在 ComfyUI 中。",
			"selection.wholeRuns": "请选中同一次运行的所有输出以移除该运行记录。永久删除文件需要配置可访问的输出文件夹。",
			"gallery.previous": "上一张图像",
			"gallery.next": "下一张图像",
			"notice.failed": "无法完成图像操作。",
			"pending.title": "ComfyUI 正在生成图像"
		};
		/** English dictionary, key-identical to the Chinese source of truth. */
		const en = {
			"studio.views": "Content views",
			"studio.workspace": "Studio",
			"studio.library": "Library",
			"studio.eyebrow": "YOUR CREATIVE PARTNER",
			"studio.welcome": "Make something worth sharing.",
			"studio.welcomeHint": "Start with an idea or a reference. Plan, create and refine it with Arya.",
			"studio.connected": "Local engine ready",
			"studio.offline": "Check local engine",
			"studio.draftPreserved": "Your current draft was preserved. Clear it before choosing an idea.",
			"studio.search": "Search loaded media",
			"studio.searchHint": "Search filenames or prompts",
			"studio.all": "All media",
			"studio.images": "Images",
			"studio.videos": "Videos",
			"studio.noMatches": "No matching media. Try another search or filter.",
			"studio.mediaHint": "Drag into chat or add as a reference. Your originals stay intact.",
			"studio.photo.title": "Photo studio",
			"studio.photo.hint": "Products, portraits & places",
			"studio.photo.prompt": "Help me create a professional product photograph with a clean background, natural light and thoughtful composition. First help me choose the subject and visual direction.",
			"studio.edit.title": "Reimagine a photo",
			"studio.edit.hint": "Change the setting, style or detail",
			"studio.edit.prompt": "I want to edit a photograph. I will attach the reference; help me decide what to change and which subject details to preserve.",
			"studio.design.title": "Brand & design",
			"studio.design.hint": "Campaigns, posts & transparent assets",
			"studio.design.prompt": "Help me plan a consistent set of brand visuals. First establish the audience, publishing channel, brand mood and required sizes, then create the assets.",
			"studio.animate.title": "Bring an image to life",
			"studio.animate.hint": "Reference image → moving scene",
			"studio.animate.prompt": "Animate the reference image I will attach into a short video scene. Preserve the subject and composition, with subtle natural motion and a slow camera move.",
			"studio.film.title": "Direct a film",
			"studio.film.hint": "Scenes, pacing & sound",
			"studio.film.prompt": "Help me plan and produce a film with multiple scenes. Establish the audience, subject and total duration first, save a storyboard, then generate and assemble the scenes.",
			"studio.storyboard.title": "Find the idea",
			"studio.storyboard.hint": "From a spark to a shot list",
			"studio.storyboard.prompt": "I have a content idea and want to explore directions first. Help me develop the core concept, audience and visual style, then save an editable storyboard. Do not generate media yet.",
			"action.useFrame": "Use current frame as reference",
			"notice.frameFailed": "Load the video and seek to a frame, then try again.",
			"action.addToChat": "Add to chat",
			"notice.attachFailed": "Could not attach media. Try again or start a new conversation.",
			"room.mediaDrop": "Drag a gallery image or video here, or choose Add to chat.",
			"server.title": "Local image server",
			"server.checking": "Checking the server…",
			"server.running": "Running · Ready to create",
			"server.stopped": "Stopped · Start the server to create",
			"server.starting": "Starting the server…",
			"server.stopping": "Stopping the server…",
			"server.restarting": "Restarting the server…",
			"server.failed": "Connection failed · Check server settings",
			"server.chatUnavailable": "Image chat becomes available when the server is ready. Saved conversations and photos are still available.",
			"community.welcomeHint": "Describe a photo or video. Attach your reference and tell Arya what to preserve or change.",
			"community.description": "Create photos and videos, edit images, and reuse your saved media.",
			"community.settings": "Content settings",
			"community.installTitle": "Enable image creation",
			"community.installHint": "Enable or restore the shipped dsh-image-gen bundle in Plugin Market, then configure an image provider. Return here and select Refresh.",
			"community.installAction": "Open Plugins",
			"community.about": "View image plugin",
			"connection.open": "ComfyUI connection",
			"connection.title": "Connect ComfyUI",
			"connection.description": "Set the local image server address and saved-media folder. Image plugin provider settings are managed separately.",
			"connection.location": "Server location",
			"connection.local": "This computer",
			"connection.remote": "Remote computer",
			"connection.address": "Server address",
			"connection.folder": "Accessible output folder (optional)",
			"connection.folderHint": "The folder must be accessible from the computer running Arya. Use a shared folder for a remote server, or leave it empty to generate and view recent runs.",
			"connection.test": "Test connection",
			"connection.save": "Save and reconnect",
			"connection.pending": "Please wait…",
			"connection.connected": "Connected to ComfyUI",
			"connection.serverDescription": "Start, stop, or restart ComfyUI on this machine. Stopping ends only ComfyUI’s own processes.",
			"connection.serverStart": "Start server",
			"connection.serverStop": "Stop server",
			"connection.serverRestart": "Restart server",
			"connection.serverPending": "Working on the server…",
			"room.title": "Content",
			"room.conversation": "Image conversation",
			"room.send": "Send message",
			"room.stop": "Stop",
			"room.drop": "Drop a reference photo",
			"room.attachHint": "Add, drop or paste a reference photo",
			"gallery.recentHint": "Your latest images and videos from ComfyUI",
			"room.welcome": "What would you like to create?",
			"starter.portrait": "A portrait photo of a fox in autumn light",
			"starter.edit": "Make this photo look like an oil painting",
			"starter.video": "A short video of waves breaking at sunrise",
			"action.export": "Export conversation",
			"notice.exportUnavailable": "This deployment provides no conversation export.",
			"room.conversations": "Conversations",
			"room.archive": "Archive",
			"room.archived": "Archived",
			"room.active": "Active conversations",
			"room.restore": "Restore",
			"room.restoreFirst": "Restore this archived conversation before sending a message.",
			"room.missing": "This conversation is no longer available and was removed from the list.",
			"composer.upload": "Add reference photo",
			"composer.uploadType": "Choose a PNG, JPEG, WebP or GIF image.",
			"composer.newConversation": "New content conversation",
			"composer.auto": "Chat",
			"composer.advanced": "Advanced",
			"composer.autoHint": "Talk to Arya to create or edit photos and videos. Arya chooses the workflow; add a reference photo or choose an image from your library.",
			"composer.editTitle": "Edit an image",
			"composer.editHint": "Describe what to change and what to keep. Reference editing uses the source image as context.",
			"composer.voiceSetup": "Set up voice input",
			"panel.label": "Content",
			"page.title": "Content",
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
			"gallery.title": "Media library",
			"gallery.library": "Local media",
			"gallery.recent": "Recent runs",
			"gallery.count": "{count} files saved locally",
			"gallery.localFile": "Local file",
			"gallery.localVideo": "Local video",
			"gallery.fileMeta": "{date} · {size} KB",
			"gallery.runMeta": "{width} × {height} · {steps} steps · seed {seed}",
			"gallery.unconfigured": "Set the ComfyUI output directory to browse saved images.",
			"gallery.emptyLibrary": "No images are saved in the output folder yet.",
			"gallery.loadMore": "Load more",
			"gallery.workflow": "Workflow: {workflow}",
			"gallery.empty": "Generated images will appear here.",
			"gallery.loading": "Loading preview…",
			"gallery.failed": "Could not preview this file.",
			"gallery.open": "View image: {name}",
			"gallery.close": "Close image",
			"selection.start": "Select",
			"selection.done": "Done",
			"selection.count": "{count} selected",
			"selection.hint": "Shift-click for a range",
			"selection.selectLoaded": "Select loaded",
			"selection.clear": "Clear",
			"selection.download": "Download ZIP",
			"selection.delete": "Delete selected",
			"selection.toggle": "Select {name}",
			"selection.limit": "Select up to 100 files at a time",
			"selection.confirmTitle": "Delete {count} files?",
			"selection.confirmDescription": "This permanently deletes the selected images and videos from ComfyUI’s output folder.",
			"selection.confirmDelete": "Delete selected",
			"selection.deleteFailed": "{count} files could not be deleted and remain in the library",
			"selection.removeRuns": "Remove runs",
			"selection.removeRunsTitle": "Remove selected runs?",
			"selection.removeRunsDescription": "Remove selected complete runs from Recent runs. Image and video files remain in ComfyUI.",
			"selection.wholeRuns": "Select every output of a run to remove its history. Permanently deleting files requires an accessible output folder.",
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
			"remote.mcp",
			"remote.session",
			"remote.commands",
			"remote.pluginManager",
			"workspaces",
			"slots",
			"pluginNavigation",
			"sessions",
			"configForms",
			"sidebarRightViews"
		];
		const PANEL_ID = "images";
		/** Register the global page and its left-sidebar navigation entry. */
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "ui-images: dictionaries");
			const t = ctx.locale.bind(NS);
			const preview = ctx.configForms.get("ui-images");
			const unwrap = async (operation) => {
				const result = await operation;
				if (!result.ok) throw new Error(result.error.message);
				return result.value;
			};
			let agent;
			const retired = /* @__PURE__ */ new Set();
			let creating;
			let generation = 0;
			const navigation = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)({
				ids: [],
				active: null
			}, { persist: { name: "aryaai.images.rooms.v1" } });
			navigation.set(readImageRooms(navigation.getSnapshot()));
			const rooms = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)(readImageRooms(navigation.getSnapshot()));
			const saveRooms = (value) => {
				navigation.set(value);
				rooms.set(value);
			};
			ctx.effect(() => {
				const reconcile = () => {
					const catalog = ctx.sessions.list.getSnapshot();
					const current = rooms.getSnapshot();
					if (catalog.phase !== "ready") {
						rooms.set({ ...current });
						return;
					}
					const ids = current.ids.filter((id) => catalog.byId[id] !== void 0);
					const active = current.active !== null && ids.includes(current.active) ? current.active : null;
					const archived = current.archivedIds === void 0 ? {} : { archivedIds: current.archivedIds.filter((id) => ids.includes(id)) };
					saveRooms({
						...current,
						ids,
						active,
						...archived
					});
				};
				reconcile();
				return ctx.sessions.list.subscribe(reconcile);
			}, "ui-images: room catalog");
			ctx.effect(() => {
				const syncArchives = () => {
					const catalog = ctx.workspaces.list.getSnapshot();
					if (catalog.phase !== "ready") return;
					const current = rooms.getSnapshot();
					const archivedIds = current.ids.filter((id) => catalog.archivedSessionIds.includes(id));
					if (archivedIds.length === 0 && current.archivedIds === void 0) return;
					saveRooms({
						...current,
						archivedIds
					});
				};
				syncArchives();
				return ctx.workspaces.list.subscribe(syncArchives);
			}, "ui-images: room archives");
			const lifetime = new AbortController();
			ctx.effect(() => () => {
				lifetime.abort();
				agent?.release();
				for (const reference of retired) reference.release();
				retired.clear();
			}, "ui-images: conversation reference");
			const openRoom = async (id) => {
				if (ctx.sessions.list.getSnapshot().byId[id] === void 0) await ctx.sessions.refresh();
				if (ctx.sessions.list.getSnapshot().byId[id] === void 0) {
					const current = rooms.getSnapshot();
					saveRooms({
						...current,
						ids: current.ids.filter((value) => value !== id),
						active: current.active === id ? null : current.active
					});
					throw new Error(t("room.missing"));
				}
				if (!rooms.getSnapshot().ids.includes(id)) throw new Error("Unknown Images conversation");
				if (agent?.sessionId === id) {
					await agent.ready;
					return agent;
				}
				const ticket = ++generation;
				const reference = ctx.sessions.retain(id, {
					source: "imagesConversation",
					signal: lifetime.signal
				});
				try {
					await reference.ready;
					lifetime.signal.throwIfAborted();
					if (ticket !== generation) throw new DOMException("Images navigation superseded", "AbortError");
					if (agent !== void 0) retired.add(agent);
					agent = reference;
					saveRooms({
						...rooms.getSnapshot(),
						active: id
					});
					return reference;
				} catch (error) {
					reference.release();
					throw error;
				}
			};
			const acquire = () => {
				if (agent !== void 0) {
					const reference = agent;
					return reference.ready.then(() => reference);
				}
				creating ??= (async () => {
					const active = rooms.getSnapshot().active;
					if (active !== null) return openRoom(active);
					const main = Object.values(ctx.sessions.list.getSnapshot().byId).find((item) => (item.retainedBy.mainView ?? 0) > 0);
					const ticket = ++generation;
					const id = await ctx.sessions.create({
						...main?.cwd === void 0 ? {} : { cwd: main.cwd },
						agentPreset: preview.getSnapshot().value?.agentPreset ?? "content"
					});
					lifetime.signal.throwIfAborted();
					const reference = ctx.sessions.retain(id, {
						source: "imagesConversation",
						signal: lifetime.signal
					});
					try {
						await reference.ready;
						const permission = await unwrap(ctx.remote.commands.execute(id, `/permission ${preview.getSnapshot().value?.permissionPreset ?? "danger-full-access"}`, []));
						if (permission === void 0) throw new Error("Content requires the /permission command");
						if (permission.result.kind === "error") throw new Error(permission.result.text);
						lifetime.signal.throwIfAborted();
						if (ticket !== generation) throw new DOMException("Images navigation superseded", "AbortError");
						agent = reference;
						saveRooms({
							...rooms.getSnapshot(),
							ids: [id, ...rooms.getSnapshot().ids],
							active: id
						});
						return reference;
					} catch (error) {
						reference.release();
						/* v8 ignore next -- each retain mints a fresh reference, so the agent cannot already be this failing one. */
						if (agent === reference) agent = void 0;
						throw error;
					}
				})().finally(() => {
					creating = void 0;
				});
				return creating;
			};
			const attachFiles = (reference, files) => {
				lifetime.signal.throwIfAborted();
				if (ctx.workspaces.list.getSnapshot().archivedSessionIds.includes(reference.sessionId)) throw new Error(t("room.restoreFirst"));
				const conversation = ctx.sessions.scope(reference.sessionId)?.get("conversation");
				if (conversation === void 0 || !conversation.attachFiles(files)) throw new Error(t("notice.attachFailed"));
			};
			const face = {
				fillDraft: async (text) => {
					const reference = await acquire();
					if (ctx.workspaces.list.getSnapshot().archivedSessionIds.includes(reference.sessionId)) throw new Error(t("room.restoreFirst"));
					const scope = ctx.sessions.scope(reference.sessionId);
					const conversation = scope?.get("conversation");
					if (conversation === void 0 || scope === void 0) throw new Error(t("notice.attachFailed"));
					if (conversation.input.requestDraftInitialization(reference.binding, { prompt: text }) !== "applied") throw new Error(t("studio.draftPreserved"));
					conversation.input.for(scope).focus();
				},
				addFiles: async (files) => {
					attachFiles(await acquire(), files);
				},
				addMedia: async (media) => {
					attachFiles(await acquire(), await Promise.all(media.map(async (item) => {
						const address = "api/comfyui-media?" + new URLSearchParams({
							filename: item.filename,
							subfolder: item.subfolder
						}).toString();
						const response = await fetch(address, { signal: lifetime.signal });
						if (!response.ok) throw new Error(t("notice.attachFailed"));
						const blob = await response.blob();
						return new File([blob], item.filename, { type: blob.type });
					})));
				},
				imagePlugin: async () => {
					return (await unwrap(ctx.remote.pluginManager.listBundles())).some((bundle) => bundle.name === "dsh-image-gen" && bundle.enabled && bundle.error === void 0);
				},
				openImagePlugin: () => {
					ctx.pluginNavigation.openBundle("dsh-image-gen");
				},
				autoPreview: {
					getSnapshot: () => preview.getSnapshot().value?.autoPreview !== false,
					subscribe: (listener) => preview.subscribe(listener)
				},
				currentAgent: () => agent,
				settleAgent: (reference) => {
					for (const previous of retired) if (previous !== reference) {
						previous.release();
						retired.delete(previous);
					}
				},
				rooms,
				openRoom,
				archiveRoom: async (id, archived) => {
					if (archived) await ctx.workspaces.archiveSession(id);
					else await ctx.workspaces.unarchiveSession(id);
					const current = rooms.getSnapshot();
					const archivedIds = archived ? [...new Set([...current.archivedIds ?? [], id])] : (current.archivedIds ?? []).filter((value) => value !== id);
					saveRooms({
						...current,
						archivedIds,
						active: current.active === id && archived ? null : current.active
					});
					if (archived && agent?.sessionId === id) {
						retired.add(agent);
						agent = void 0;
					}
				},
				roomTitle: (id) => ctx.sessions.list.getSnapshot().byId[id]?.title ?? `${t("composer.newConversation")} · ${id.slice(-6)}`,
				exportRoom: async (id) => {
					const logDownload = ctx.get("sessionLogDownload");
					if (logDownload === void 0) return false;
					await logDownload.download(id);
					return true;
				},
				resetAgent: async () => {
					if (agent !== void 0) {
						const snapshot = agent.binding.session.getSnapshot();
						if (snapshot.blank && !snapshot.running && !snapshot.awaitingFirstTurn) return agent;
					}
					const blankId = rooms.getSnapshot().ids.find((id) => {
						const summary = ctx.sessions.list.getSnapshot().byId[id];
						return summary?.blank === true && !summary.running && !(rooms.getSnapshot().archivedIds ?? []).includes(id);
					});
					if (blankId !== void 0) return openRoom(blankId);
					const previous = agent;
					const previousRooms = rooms.getSnapshot();
					++generation;
					if (agent !== void 0) retired.add(agent);
					agent = void 0;
					saveRooms({
						...rooms.getSnapshot(),
						active: null
					});
					try {
						if (creating !== void 0) await creating.catch(() => void 0);
						return await acquire();
					} catch (error) {
						agent = previous;
						if (previous !== void 0) retired.delete(previous);
						saveRooms(previousRooms);
						throw error;
					}
				},
				askAgent: async (prompt, _status, source, uploads) => {
					const reference = await acquire();
					if (ctx.workspaces.list.getSnapshot().archivedSessionIds.includes(reference.sessionId)) throw new Error(t("room.restoreFirst"));
					const content = [{
						type: "text",
						text: prompt
					}];
					if (source !== null) {
						const image = await unwrap(ctx.remote.comfyImages.image(source));
						const mediaType = image.contentType;
						if (!isStillMediaType(mediaType)) throw new Error(`Unsupported reference image type: ${mediaType}`);
						content.push({
							type: "image",
							mediaType,
							data: image.base64,
							name: source.filename
						});
					}
					if (uploads !== void 0) content.push(...uploads);
					lifetime.signal.throwIfAborted();
					if (reference.binding.session.getSnapshot().blank && prompt.trim().length > 0) {
						const renamed = await reference.binding.session.rename(prompt);
						if (!renamed.ok) throw new Error(renamed.error.message);
					}
					const result = await reference.binding.session.prompt(content, "queue");
					if (!result.ok) throw new Error(result.error.message);
					return reference;
				},
				openVoiceSettings: () => {
					ctx.pluginNavigation.openBundle("@deepseek-ai/dsh-experimental-voice-input-bundle");
				},
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
				removeImages: (images) => unwrap(ctx.remote.comfyImages.deleteImages({ images })),
				image: async (image) => {
					const value = await unwrap(ctx.remote.comfyImages.image(image));
					return `data:${value.contentType};base64,${value.base64}`;
				}
			};
			ctx.slots.inject("main", () => ctx.slots.register({
				name: "main",
				key: PANEL_ID,
				locale: NS,
				inject: () => face,
				children: {
					"images.prompt.activity": {
						kind: "single",
						scope: "root"
					},
					"images.agent": {
						kind: "single",
						scope: "session"
					},
					"images.agent.controls": {
						kind: "single",
						scope: "session"
					},
					"images.connection": {
						kind: "single",
						scope: "root"
					}
				}
			}, CommunityImagesPanel));
			ctx.slots.inject("images.agent", () => ctx.slots.register({
				name: "images.agent",
				locale: NS,
				inject: (sessionId) => ({ attachPreview: () => ctx.sidebarRightViews.registerPanel(PANEL_ID, sessionId) })
			}, ImagesAgent));
			ctx.slots.inject("images.agent.controls", () => ctx.slots.register({
				name: "images.agent.controls",
				locale: NS,
				inject: () => ({ stop: async () => {
					if (agent !== void 0) await unwrap(agent.binding.session.cancel());
				} })
			}, ImagesAgentControls));
			ctx.slots.inject("images.connection", () => ctx.slots.register({
				name: "images.connection",
				locale: NS,
				inject: () => ({
					readStatus: () => unwrap(ctx.remote.comfyImages.status()),
					pollIntervalMs: () => ctx.configForms.get("ui-images").getSnapshot().value?.serverStatusPollIntervalMs ?? 1e4,
					readConnection: () => unwrap(ctx.remote.mcp.getComfyConnection()),
					testConnection: (baseUrl) => unwrap(ctx.remote.mcp.testComfyConnection(baseUrl)),
					saveConnection: (settings) => unwrap(ctx.remote.mcp.setComfyConnection(settings)),
					startServer: () => unwrap(ctx.remote.comfyImages.startServer()),
					stopServer: () => unwrap(ctx.remote.comfyImages.stopServer()),
					restartServer: () => unwrap(ctx.remote.comfyImages.restartServer())
				})
			}, ComfyConnection));
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