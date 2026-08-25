window.__ModuleLoader__.load({
	id: "@staff-os/dsh-workbench",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region node_modules/.pnpm/clsx@2.1.1/node_modules/clsx/dist/clsx.mjs
		function r(e) {
			var t, f, n = "";
			if ("string" == typeof e || "number" == typeof e) n += e;
			else if ("object" == typeof e) if (Array.isArray(e)) {
				var o = e.length;
				for (t = 0; t < o; t++) e[t] && (f = r(e[t])) && (n && (n += " "), n += f);
			} else for (f in e) e[f] && (n && (n += " "), n += f);
			return n;
		}
		function clsx() {
			for (var e, t, f = 0, n = "", o = arguments.length; f < o; f++) (e = arguments[f]) && (t = r(e)) && (n && (n += " "), n += t);
			return n;
		}
		//#endregion
		//#region src/client/icons.tsx
		/**
		* 工作台自己画的图标。
		*
		* 宿主 primitives 那 70 个图标里没有「工具」这一形状，最接近的
		* `IconSkillOutline16` 画的是一份文档加一颗星——它说的是「一份写好的说明」，
		* 而技能在会话里是一件**被拿起来用的东西**。剩下能读作工具的只有齿轮
		* （在这套里已经是「设置」，`employee.tab.tools` 就用它）、插头与 API 那两个，
		* 后两个正被侧栏的插件域与 MCP 域占着——同一列里撞形状比换成文档还糟。
		*
		* 所以这里补一把扳手。图标就是几行 SVG，没必要为了一个形状去等上游。
		*
		* @module @staff-os/dsh-workbench/client/icons
		*/
		/**
		* 扳手。技能域用它。
		*
		* 描边画法（primitives 那边多是实心填充），因为一把开口扳手的头是个开环，
		* 实心轮廓要同时描内外两圈，在 16 px 上糊成一团。
		*
		* @param props - `size` 是边长，`className` 透传；颜色跟 `currentColor`。
		* @returns 图标元素。
		*/
		function IconWrenchOutline16({ size = 16, className }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				width: size,
				height: size,
				className,
				viewBox: "0 0 16 16",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: 1.7,
				strokeLinecap: "round",
				strokeLinejoin: "round",
				xmlns: "http://www.w3.org/2000/svg",
				"aria-hidden": true,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M10.91 1.91A3.5 3.5 0 1 0 14.09 5.1" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M8.13 7.88 3.3 12.7" })]
			});
		}
		/**
		* 一份普通文件。文件树上认不出类型的都画它。
		*
		* 顶掉的是 `IconCodeOutline16`——那是个 `#`，摆在文件名前面看着像文件名自己
		* 带了一个井号（`# report.html`），而不像一个图标。
		*
		* @param props - `size` 是边长，`className` 透传；颜色跟 `currentColor`。
		* @returns 图标元素。
		*/
		function IconFileOutline16({ size = 16, className }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				width: size,
				height: size,
				className,
				viewBox: "0 0 16 16",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: 1.4,
				strokeLinecap: "round",
				strokeLinejoin: "round",
				xmlns: "http://www.w3.org/2000/svg",
				"aria-hidden": true,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M9.3 2.2H4.9A1.4 1.4 0 0 0 3.5 3.6v8.8a1.4 1.4 0 0 0 1.4 1.4h6.2a1.4 1.4 0 0 0 1.4-1.4V5.5z" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M9.3 2.2v2.2a1.1 1.1 0 0 0 1.1 1.1h2.1" })]
			});
		}
		/**
		* 一枚盾牌。市场详情里那张「安全审核结论」卡片用它。
		*
		* primitives 那套里没有盾——最接近的是 `IconWarningOutline16`，但那是个惊叹
		* 号三角，摆在「已通过审核」旁边等于把一条好消息说成警告。盾牌本身不表态，
		* 表态的是它旁边那行字，这正是这张卡要的：结论由源给，图标只说这是「安全」
		* 这一栏。
		*
		* @param props - `size` 是边长，`className` 透传；颜色跟 `currentColor`。
		* @returns 图标元素。
		*/
		function IconShieldOutline16({ size = 16, className }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				width: size,
				height: size,
				className,
				viewBox: "0 0 16 16",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: 1.4,
				strokeLinecap: "round",
				strokeLinejoin: "round",
				xmlns: "http://www.w3.org/2000/svg",
				"aria-hidden": true,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M8 1.9 13 3.5v4.2c0 3-2 5.2-5 6.4-3-1.2-5-3.4-5-6.4V3.5z" })
			});
		}
		/**
		* 一颗五角星。市场卡片与详情里的平均评分用它。
		*
		* @param props - `size` 是边长，`className` 透传；颜色跟 `currentColor`。
		* @returns 图标元素。
		*/
		function IconStarOutline16({ size = 16, className }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				width: size,
				height: size,
				className,
				viewBox: "0 0 16 16",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: 1.4,
				strokeLinecap: "round",
				strokeLinejoin: "round",
				xmlns: "http://www.w3.org/2000/svg",
				"aria-hidden": true,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", { d: "M8 2.1 9.85 5.9l4.15.6-3 2.94.71 4.15L8 11.63 4.29 13.6 5 9.44 2 6.5l4.15-.6z" })
			});
		}
		//#endregion
		//#region src/client/sections.ts
		/** rail 上的分区，自上而下。 */
		const SECTIONS = [
			{
				id: "sessions",
				titleKey: "section.sessions",
				visible: true
			},
			{
				id: "employees",
				titleKey: "section.employees",
				summaryKey: "section.employees.summary",
				tool: "workbench_employee",
				actionKeys: [
					"action.employees.list",
					"action.employees.create",
					"action.employees.bind"
				]
			},
			{
				id: "knowledge",
				titleKey: "section.knowledge",
				summaryKey: "section.knowledge.summary",
				tool: "workbench_knowledge",
				actionKeys: [
					"action.knowledge.create",
					"action.knowledge.add",
					"action.knowledge.search"
				]
			},
			{
				id: "skills",
				titleKey: "section.skills",
				visible: true,
				summaryKey: "section.skills.summary",
				tool: "workbench_skill",
				actionKeys: [
					"action.skills.list",
					"action.skills.create",
					"action.skills.market"
				]
			},
			{
				id: "mcp",
				titleKey: "section.mcp",
				summaryKey: "section.mcp.summary",
				tool: "workbench_mcp",
				actionKeys: [
					"action.mcp.list",
					"action.mcp.add",
					"action.mcp.import"
				]
			},
			{
				id: "plugins",
				titleKey: "section.plugins",
				summaryKey: "section.plugins.summary",
				tool: "workbench_plugin",
				actionKeys: [
					"action.plugins.list",
					"action.plugins.install",
					"action.plugins.market"
				]
			}
		];
		/** rail 上真正画出来的那些分区，自上而下。 */
		const VISIBLE_SECTIONS = SECTIONS.filter((section) => section.visible === true);
		/** 按 id 取一个分区；取不到时退回会话区。 */
		function sectionOf(id) {
			return SECTIONS.find((section) => section.id === id) ?? SECTIONS[0];
		}
		/**
		* 这个分区现在露出来了吗。
		*
		* 面板要用它兜一次底：分区选择存在共享盒子里，用户上一次停在某个域、
		* 而那个域这一版被隐掉时，不兜底就会停在一个没有入口回不去的页面上。
		*/
		function sectionVisible(id) {
			return sectionOf(id).visible === true;
		}
		//#endregion
		//#region src/client/state.ts
		/**
		* 一个够用的可订阅状态盒子。
		*
		* 侧栏和 overlay 面板是两棵**互不相邻**的 React 树——一个在 `sidebar` 槽里，
		* 一个在 `shell.overlay` 里，中间隔着 AppFrame。React context 跨不过去，所以
		* 分区选择、员工数据这类两边都要看的东西放在这里，各自用
		* `useSyncExternalStore` 订阅同一个盒子。
		*
		* 不引 zustand：客户端产物的模块表只认六个说明符，别的依赖一律内联进
		* bundle，为这点状态多背一个库不值当。
		*
		* @module @staff-os/dsh-workbench/client/state
		*/
		/**
		* 建一个状态盒子。
		* @param initial - 初始值。
		* @returns 盒子。
		*/
		function createStore(initial) {
			let current = initial;
			const listeners = /* @__PURE__ */ new Set();
			return {
				get: () => current,
				set: (next) => {
					const value = typeof next === "function" ? next(current) : next;
					if (Object.is(value, current)) return;
					current = value;
					for (const listener of [...listeners]) listener();
				},
				subscribe: (listener) => {
					listeners.add(listener);
					return () => {
						listeners.delete(listener);
					};
				}
			};
		}
		/**
		* 在组件里订阅一个盒子。
		* @param store - 要订阅的盒子。
		* @returns 当前值。
		*/
		function useStore(store) {
			return (0, react.useSyncExternalStore)(store.subscribe, store.get, store.get);
		}
		//#endregion
		//#region \0workbench-css:src/client/WorkbenchSidebar.module.css.mjs
		const css$3 = ".iYxVLW_root{box-sizing:border-box;background:var(--dsw-specific-sidebar-fill);height:100%;color:var(--dsw-alias-label-primary);--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2);font-size:14px;display:flex;overflow:hidden}.iYxVLW_rail{box-sizing:border-box;flex-direction:column;flex:0 0 56px;align-items:center;gap:12px;width:56px;padding:14px 10px 8px;display:flex}.iYxVLW_railGroup{flex-direction:column;align-items:center;gap:6px;width:100%;display:flex}.iYxVLW_railGroup.iYxVLW_bottom{margin-top:auto}.iYxVLW_brandMark{justify-content:center;align-items:center;width:24px;height:24px;margin-bottom:2px;display:flex}.iYxVLW_railButton{width:36px;height:36px;color:var(--dsw-alias-label-secondary);cursor:pointer;transition:background .12s var(--ds-ease-in-out), color .12s var(--ds-ease-in-out);background:0 0;border:none;border-radius:10px;justify-content:center;align-items:center;padding:0;display:flex;position:relative}.iYxVLW_railButton:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}.iYxVLW_railButton.iYxVLW_active,.iYxVLW_railButton.iYxVLW_active:hover{background:var(--dsw-alias-label-primary);color:var(--dsw-alias-label-primary-inverted)}.iYxVLW_railButton:focus-visible{outline:2px solid var(--dsw-alias-label-primary);outline-offset:2px}.iYxVLW_badge{background:var(--dsw-alias-label-primary);min-width:8px;height:8px;box-shadow:0 0 0 2px var(--dsw-specific-sidebar-fill);border-radius:999px;position:absolute;top:4px;right:4px}.iYxVLW_railDivider{background:var(--dsw-alias-border-l2);width:20px;height:1px;margin:2px 0}.iYxVLW_avatar{background:var(--dsw-alias-button-elevated-fill);width:28px;height:28px;color:var(--dsw-alias-label-secondary);user-select:none;border-radius:999px;justify-content:center;align-items:center;margin-top:2px;font-size:12px;font-weight:600;display:flex}.iYxVLW_content{box-sizing:border-box;border-left:1px solid var(--dsw-alias-border-l2);flex-direction:column;flex:auto;min-width:0;padding:6px 12px 6px 0;display:flex}.iYxVLW_contentHead{align-items:center;gap:8px;min-height:36px;padding:0 4px 0 12px;display:flex}.iYxVLW_title{text-overflow:ellipsis;white-space:nowrap;flex:auto;min-width:0;font-size:14px;font-weight:600;overflow:hidden}.iYxVLW_iconButton{width:28px;height:28px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:none;border-radius:8px;justify-content:center;align-items:center;padding:0;display:flex}.iYxVLW_iconButton:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}.iYxVLW_body{flex-direction:column;flex:auto;min-height:0;display:flex}.iYxVLW_footArea{flex-direction:column;gap:4px;padding-left:12px;display:flex}.iYxVLW_railFoot{flex-direction:column;align-items:center;gap:4px;width:100%;display:flex}";
		const tagId$3 = "@staff-os/dsh-workbench/WorkbenchSidebar.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$3) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@staff-os/dsh-workbench";
			tag.dataset.pluginCss = tagId$3;
			tag.textContent = css$3;
			document.head.appendChild(tag);
		}
		var WorkbenchSidebar_module_css_default = {
			"footArea": "iYxVLW_footArea",
			"railFoot": "iYxVLW_railFoot",
			"content": "iYxVLW_content",
			"bottom": "iYxVLW_bottom",
			"avatar": "iYxVLW_avatar",
			"root": "iYxVLW_root",
			"railGroup": "iYxVLW_railGroup",
			"iconButton": "iYxVLW_iconButton",
			"body": "iYxVLW_body",
			"contentHead": "iYxVLW_contentHead",
			"badge": "iYxVLW_badge",
			"title": "iYxVLW_title",
			"active": "iYxVLW_active",
			"rail": "iYxVLW_rail",
			"railDivider": "iYxVLW_railDivider",
			"brandMark": "iYxVLW_brandMark",
			"railButton": "iYxVLW_railButton"
		};
		//#endregion
		//#region src/client/WorkbenchSidebar.tsx
		/**
		* 工作台侧栏：常驻 56px 图标 rail + 一列随分区切换的内容。
		*
		* 与上游单列侧栏最大的不同是 **rail 常驻**：收起只收内容列，rail 原样留着，
		* 所以任何宽度下都能切分区。上游的收起态是整列缩成 56px 图标条，那是同一
		* 列的两个形态，切不了分区。
		*
		* 会话分区把内容整块交给 `sidebar.workspaces`（ui-workspace），设置座位交给
		* `sidebar.settings`（ui-settings）——占了 `sidebar` 就等于把上游那几个座位
		* 一起拿走，重新托管是让它们继续工作的唯一办法。
		*
		* **内容列只属于会话分区。** 其余分区的界面在右边整幅铺开，这一列不再渲染，
		* 侧栏缩成一条 rail。理由是内容列在那些分区里只能摆一份与右边讲同一件事的
		* 摘要，既切走一块可用宽度，又让人先在窄栏里选一次、再到右边选一次。
		*
		* @module @staff-os/dsh-workbench/client/WorkbenchSidebar
		*/
		/** rail 图标的统一尺寸。 */
		const RAIL_ICON = 18;
		/**
		* rail 那一列的宽度，与 WorkbenchSidebar.module.css 里的 `.rail` 对齐。
		*
		* 内容列不渲染时侧栏实际只占这么宽，管理面板要从这里起铺。注意 AppFrame 的
		* 那条轨道仍是 `width` 那么宽——面板在 overlay 层上，正好把多出来的那截
		* 空侧栏底色盖住，所以不用去改布局 store（`ctx.layout` 只给了 toggle，
		* 拿它模拟「关上」会跟用户自己的收起状态打架）。
		*/
		const RAIL_WIDTH = 56;
		/** 各分区的图标。放在组件这边而不是 sections.ts：那份表要能被非 React 代码读。 */
		function sectionIcon(id) {
			switch (id) {
				case "sessions": return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconNewChatOutline16, { size: RAIL_ICON });
				case "employees": return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconAgentPresetOutline16, { size: RAIL_ICON });
				case "knowledge": return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconDataOutline16, { size: RAIL_ICON });
				case "skills": return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconWrenchOutline16, { size: RAIL_ICON });
				case "mcp": return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconApiOutline14, { size: RAIL_ICON });
				case "plugins": return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCordisPluginOutline14, { size: RAIL_ICON });
			}
		}
		/**
		* 画工作台侧栏。
		* @param props - 组合出来的插槽 props，见 contract/slots.ts。
		* @returns 侧栏元素树。
		*/
		function WorkbenchSidebar({ collapsed, width, ui, startSession, toggleSidebar, t, renderSlot }) {
			const active = useStore(ui).section;
			const showContent = active === "sessions" && !collapsed;
			(0, react.useEffect)(() => {
				ui.set((current) => ({
					...current,
					sidebarWidth: showContent ? width : RAIL_WIDTH
				}));
			}, [
				ui,
				width,
				showContent
			]);
			/** 点 rail 图标：切分区。 */
			const pick = (id) => {
				ui.set((current) => ({
					...current,
					section: id
				}));
				if (id === "sessions" && collapsed) toggleSidebar();
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: WorkbenchSidebar_module_css_default.root,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: WorkbenchSidebar_module_css_default.rail,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: WorkbenchSidebar_module_css_default.brandMark,
							"aria-hidden": "true",
							children: renderSlot("sidebar.brand.mark", { size: 24 }, { fallback: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.FishLogo, { size: 24 }) })
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: WorkbenchSidebar_module_css_default.railGroup,
							role: "tablist",
							"aria-orientation": "vertical",
							children: VISIBLE_SECTIONS.map((item) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
								label: t(item.titleKey),
								delayMs: 400,
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									role: "tab",
									"aria-selected": item.id === active,
									className: clsx(WorkbenchSidebar_module_css_default.railButton, item.id === active && WorkbenchSidebar_module_css_default.active),
									"aria-label": t(item.titleKey),
									onClick: () => {
										pick(item.id);
									},
									children: sectionIcon(item.id)
								})
							}, item.id))
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: clsx(WorkbenchSidebar_module_css_default.railGroup, WorkbenchSidebar_module_css_default.bottom),
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: WorkbenchSidebar_module_css_default.railDivider,
									"aria-hidden": "true"
								}),
								!showContent && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: WorkbenchSidebar_module_css_default.railFoot,
									children: [renderSlot("sidebar.footer.action", { wide: false }), renderSlot("sidebar.settings", { wide: false })]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: WorkbenchSidebar_module_css_default.avatar,
									"aria-hidden": "true",
									children: "DS"
								})
							]
						})
					]
				}), showContent && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: WorkbenchSidebar_module_css_default.content,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: WorkbenchSidebar_module_css_default.contentHead,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: WorkbenchSidebar_module_css_default.title,
									children: renderSlot("sidebar.brand.name", {}, { fallback: t("section.sessions") })
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
									label: t("session.new"),
									delayMs: 400,
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: WorkbenchSidebar_module_css_default.iconButton,
										"aria-label": t("session.new"),
										onClick: () => {
											startSession();
										},
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconNewChatOutline16, { size: 16 })
									})
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
									label: t("toggle.collapse"),
									delayMs: 400,
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: WorkbenchSidebar_module_css_default.iconButton,
										"aria-label": t("toggle.collapse"),
										onClick: () => {
											toggleSidebar();
										},
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPanelLeftOutline16, { size: 16 })
									})
								})
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: WorkbenchSidebar_module_css_default.body,
							children: renderSlot("sidebar.workspaces", {
								wide: true,
								expandSidebar: () => {
									if (collapsed) toggleSidebar();
								}
							})
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: WorkbenchSidebar_module_css_default.footArea,
							children: [renderSlot("sidebar.footer.action", { wide: true }), renderSlot("sidebar.settings", { wide: true })]
						})
					]
				})]
			});
		}
		//#endregion
		//#region \0workbench-css:src/client/employee/EmployeeSection.module.css.mjs
		const css$2 = ".xxnxZG_section{flex-direction:column;height:100%;min-height:0;display:flex}.xxnxZG_head{border-bottom:1px solid var(--dsw-alias-border-l1);align-items:flex-start;gap:16px;padding:24px 28px 16px;display:flex}.xxnxZG_headText{flex:1;min-width:0}.xxnxZG_back{color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:none;align-items:center;margin-bottom:6px;padding:0;font-size:12px;display:inline-flex}.xxnxZG_back:hover{color:var(--dsw-alias-label-primary)}.xxnxZG_title{color:var(--dsw-alias-label-primary);text-overflow:ellipsis;white-space:nowrap;margin:0;font-size:18px;font-weight:600;overflow:hidden}.xxnxZG_subtitle{color:var(--dsw-alias-label-tertiary);margin:4px 0 0;font-size:12px}.xxnxZG_headActions{flex-shrink:0;align-items:center;gap:8px;display:flex}.xxnxZG_search{width:200px}.xxnxZG_body{flex:1;min-height:0;padding:20px 28px 28px;overflow-y:auto}.xxnxZG_grid{grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;margin:0;padding:0;list-style:none;display:grid}.xxnxZG_card{text-align:left;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);cursor:pointer;border-radius:12px;gap:12px;width:100%;padding:14px 16px;transition:border-color .12s,background .12s;display:flex}.xxnxZG_card:hover{border-color:var(--dsw-alias-border-l3);background:var(--dsw-alias-interactive-bg-hover)}.xxnxZG_cardMark{background:var(--dsw-alias-interactive-bg-active);width:34px;height:34px;color:var(--dsw-alias-label-secondary);border-radius:9px;flex-shrink:0;justify-content:center;align-items:center;display:flex}.xxnxZG_cardMain{flex-direction:column;flex:1;gap:3px;min-width:0;display:flex}.xxnxZG_cardTitle{align-items:center;gap:6px;min-width:0;display:flex}.xxnxZG_cardName{color:var(--dsw-alias-label-primary);text-overflow:ellipsis;white-space:nowrap;font-size:14px;font-weight:500;overflow:hidden}.xxnxZG_cardId{color:var(--dsw-alias-label-tertiary);font-size:11px;font-family:var(--ds-font-family-code,monospace)}.xxnxZG_cardDesc{color:var(--dsw-alias-label-secondary);-webkit-line-clamp:2;-webkit-box-orient:vertical;font-size:12px;display:-webkit-box;overflow:hidden}.xxnxZG_cardMeta{color:var(--dsw-alias-label-tertiary);margin-top:2px;font-size:11px}.xxnxZG_broken{color:var(--dsw-alias-state-error-primary);align-items:center;gap:4px;display:inline-flex}.xxnxZG_tag{flex-shrink:0;font-size:11px}.xxnxZG_editor{flex:1;grid-template-columns:168px minmax(0,1fr);min-height:0;display:grid}.xxnxZG_tabs{border-right:1px solid var(--dsw-alias-border-l1);flex-direction:column;gap:2px;padding:16px 12px;display:flex;overflow-y:auto}.xxnxZG_tab{color:var(--dsw-alias-label-secondary);text-align:left;cursor:pointer;background:0 0;border:none;border-radius:8px;align-items:center;gap:8px;padding:7px 10px;font-size:13px;display:flex}.xxnxZG_tab:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}.xxnxZG_tabActive,.xxnxZG_tabActive:hover{background:var(--dsw-alias-interactive-bg-active);color:var(--dsw-alias-label-primary)}.xxnxZG_tabBody{min-height:0;overflow-y:auto}.xxnxZG_pane{flex-direction:column;gap:18px;max-width:720px;padding:22px 28px 28px;display:flex}.xxnxZG_field{flex-direction:column;gap:6px;display:flex}.xxnxZG_fieldLabel{color:var(--dsw-alias-label-primary);font-size:13px;font-weight:500}.xxnxZG_fieldHint{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:1.5}.xxnxZG_textarea,.xxnxZG_select{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);width:100%;color:var(--dsw-alias-label-primary);resize:vertical;border-radius:8px;padding:8px 10px;font-family:inherit;font-size:13px;line-height:1.6}.xxnxZG_textarea:focus,.xxnxZG_select:focus{border-color:var(--dsw-alias-border-l3);outline:none}.xxnxZG_textarea:disabled,.xxnxZG_select:disabled{opacity:.6;cursor:not-allowed}.xxnxZG_paneActions{gap:8px;display:flex}.xxnxZG_note{color:var(--dsw-alias-label-tertiary);margin:0;font-size:12px;line-height:1.6}.xxnxZG_checkList{flex-direction:column;gap:2px;margin:0;padding:0;list-style:none;display:flex}.xxnxZG_check{color:var(--dsw-alias-label-primary);cursor:pointer;border-radius:8px;align-items:center;gap:9px;padding:7px 10px;font-size:13px;display:flex}.xxnxZG_check:hover{background:var(--dsw-alias-interactive-bg-hover)}.xxnxZG_check input:disabled{cursor:not-allowed}.xxnxZG_missing{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary);border-radius:8px;align-items:flex-start;gap:6px;padding:9px 11px;font-size:12px;line-height:1.5;display:flex}.xxnxZG_source{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary);font-family:var(--ds-font-family-code,monospace);white-space:pre-wrap;word-break:break-word;border-radius:10px;margin:0;padding:14px 16px;font-size:12px;line-height:1.65;overflow-x:auto}.xxnxZG_empty{text-align:center;color:var(--dsw-alias-label-tertiary);margin:0;padding:28px 0;font-size:13px}.xxnxZG_error{color:var(--dsw-alias-state-error-primary);background:var(--dsw-alias-interactive-bg-hover);align-items:center;gap:6px;margin:0;padding:9px 28px;font-size:12px;display:flex}.xxnxZG_dialogBody{flex-direction:column;gap:16px;display:flex}.xxnxZG_dialogFooter{justify-content:flex-end;gap:8px;display:flex}.xxnxZG_block{border-top:1px solid var(--dsw-alias-border-l1);flex-direction:column;gap:10px;padding-top:18px;display:flex}.xxnxZG_blockTitle{color:var(--dsw-alias-label-primary);margin:0;font-size:13px;font-weight:600}.xxnxZG_facts{color:var(--dsw-alias-label-secondary);flex-direction:column;gap:4px;margin:0;padding:0 0 0 16px;font-size:12px;line-height:1.6;list-style:outside;display:flex}.xxnxZG_capability{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary);border-radius:8px;padding:9px 11px;font-size:12px;line-height:1.5}.xxnxZG_entryList{grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:8px;margin:0;padding:0;list-style:none;display:grid}.xxnxZG_entry{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);border-radius:9px;flex-direction:column;gap:3px;min-width:0;padding:9px 11px;display:flex}.xxnxZG_entryHead{align-items:baseline;gap:6px;min-width:0;display:flex}.xxnxZG_entryName{color:var(--dsw-alias-label-primary);text-overflow:ellipsis;white-space:nowrap;font-size:13px;overflow:hidden}.xxnxZG_entryFlag{color:var(--dsw-alias-state-warn-label);word-break:break-word;flex-shrink:0;font-size:11px}.xxnxZG_entryPackage{font-family:var(--ds-font-family-code,monospace);color:var(--dsw-alias-label-tertiary);text-overflow:ellipsis;white-space:nowrap;font-size:11px;overflow:hidden}.xxnxZG_entryGroup{color:var(--dsw-alias-label-tertiary);font-size:11px}.xxnxZG_cardFacts{flex-wrap:wrap;gap:4px 8px;margin-top:3px;display:flex}.xxnxZG_fact{color:var(--dsw-alias-label-tertiary);font-size:11px}.xxnxZG_fact+.xxnxZG_fact:before{content:\"·\";margin-right:8px}";
		const tagId$2 = "@staff-os/dsh-workbench/EmployeeSection.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$2) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@staff-os/dsh-workbench";
			tag.dataset.pluginCss = tagId$2;
			tag.textContent = css$2;
			document.head.appendChild(tag);
		}
		var EmployeeSection_module_css_default = {
			"paneActions": "xxnxZG_paneActions",
			"field": "xxnxZG_field",
			"fieldLabel": "xxnxZG_fieldLabel",
			"capability": "xxnxZG_capability",
			"entryList": "xxnxZG_entryList",
			"source": "xxnxZG_source",
			"select": "xxnxZG_select",
			"entryFlag": "xxnxZG_entryFlag",
			"tab": "xxnxZG_tab",
			"cardMark": "xxnxZG_cardMark",
			"cardMain": "xxnxZG_cardMain",
			"headActions": "xxnxZG_headActions",
			"grid": "xxnxZG_grid",
			"title": "xxnxZG_title",
			"broken": "xxnxZG_broken",
			"cardName": "xxnxZG_cardName",
			"tag": "xxnxZG_tag",
			"fieldHint": "xxnxZG_fieldHint",
			"cardDesc": "xxnxZG_cardDesc",
			"note": "xxnxZG_note",
			"missing": "xxnxZG_missing",
			"dialogFooter": "xxnxZG_dialogFooter",
			"blockTitle": "xxnxZG_blockTitle",
			"entry": "xxnxZG_entry",
			"entryGroup": "xxnxZG_entryGroup",
			"cardFacts": "xxnxZG_cardFacts",
			"fact": "xxnxZG_fact",
			"cardMeta": "xxnxZG_cardMeta",
			"empty": "xxnxZG_empty",
			"check": "xxnxZG_check",
			"entryHead": "xxnxZG_entryHead",
			"tabs": "xxnxZG_tabs",
			"dialogBody": "xxnxZG_dialogBody",
			"cardId": "xxnxZG_cardId",
			"entryName": "xxnxZG_entryName",
			"card": "xxnxZG_card",
			"subtitle": "xxnxZG_subtitle",
			"error": "xxnxZG_error",
			"block": "xxnxZG_block",
			"head": "xxnxZG_head",
			"headText": "xxnxZG_headText",
			"pane": "xxnxZG_pane",
			"checkList": "xxnxZG_checkList",
			"editor": "xxnxZG_editor",
			"back": "xxnxZG_back",
			"body": "xxnxZG_body",
			"tabActive": "xxnxZG_tabActive",
			"facts": "xxnxZG_facts",
			"entryPackage": "xxnxZG_entryPackage",
			"cardTitle": "xxnxZG_cardTitle",
			"section": "xxnxZG_section",
			"search": "xxnxZG_search",
			"textarea": "xxnxZG_textarea",
			"tabBody": "xxnxZG_tabBody"
		};
		//#endregion
		//#region src/client/employee/EmployeeSection.tsx
		/**
		* AI 员工域的维护界面：列表 ⇄ 编辑面板。
		*
		* 形态照搬智能体页——编辑不是弹窗，而是**内联覆盖列表**，
		* 顶部一条「返回列表」回去；编辑面板左侧一列 tab 导航，右侧是内容。弹窗装
		* 不下十来个字段，来回开关也会丢掉正在改的东西。
		*
		* 底下接的全是 DSH 自己的能力：员工是 `ctx.agentPresets` 的 preset，绑定是
		* 工作台写在 preset 目录里的 `employee.yml`，两者都经本包的 Remote 通道取。
		* 界面上出现的每一个字段都对应一个真实的本地文件字段，没有为了好看而画的
		* 空壳。
		*
		* @module @staff-os/dsh-workbench/client/employee/EmployeeSection
		*/
		/** 分页表：id、标题字典键、图标。 */
		const TABS = [
			{
				id: "identity",
				titleKey: "employee.tab.identity",
				icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconUserOutline16, { size: 14 })
			},
			{
				id: "tools",
				titleKey: "employee.tab.tools",
				icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSettingsOutline14, { size: 14 })
			},
			{
				id: "knowledge",
				titleKey: "employee.tab.knowledge",
				icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconDataOutline16, { size: 14 })
			},
			{
				id: "skills",
				titleKey: "employee.tab.skills",
				icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconWrenchOutline16, { size: 14 })
			},
			{
				id: "mcp",
				titleKey: "employee.tab.mcp",
				icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconApiOutline14, { size: 14 })
			},
			{
				id: "files",
				titleKey: "employee.tab.files",
				icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCodeOutline16, { size: 14 })
			}
		];
		/**
		* 画员工域。
		* @param props - 数据层与翻译函数。
		* @returns 列表或编辑面板。
		*/
		function EmployeeSection({ data, t }) {
			const state = useStore(data.store);
			const [editing, setEditing] = (0, react.useState)(void 0);
			(0, react.useEffect)(() => {
				data.refresh();
			}, [data]);
			const employees = state.snapshot?.employees ?? [];
			const current = editing === void 0 ? void 0 : employees.find((employee) => employee.id === editing);
			(0, react.useEffect)(() => {
				if (editing !== void 0 && state.snapshot !== void 0 && current === void 0) setEditing(void 0);
			}, [
				editing,
				state.snapshot,
				current
			]);
			if (current !== void 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmployeeEditor, {
				employee: current,
				data,
				t,
				onBack: () => {
					setEditing(void 0);
				}
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmployeeList, {
				data,
				t,
				onEdit: (id) => {
					setEditing(id);
				}
			});
		}
		/** 员工列表：一屏卡片，外加新建入口。 */
		function EmployeeList({ data, t, onEdit }) {
			const state = useStore(data.store);
			const [keyword, setKeyword] = (0, react.useState)("");
			const [creating, setCreating] = (0, react.useState)(false);
			const employees = state.snapshot?.employees ?? [];
			const needle = keyword.trim().toLowerCase();
			const shown = needle === "" ? employees : employees.filter((employee) => `${employee.id} ${employee.name} ${employee.description ?? ""}`.toLowerCase().includes(needle));
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: EmployeeSection_module_css_default.section,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
						className: EmployeeSection_module_css_default.head,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: EmployeeSection_module_css_default.headText,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h1", {
								className: EmployeeSection_module_css_default.title,
								children: t("section.employees")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: EmployeeSection_module_css_default.subtitle,
								children: t("employee.subtitle")
							})]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: EmployeeSection_module_css_default.headActions,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
									className: clsx(EmployeeSection_module_css_default.search),
									value: keyword,
									placeholder: t("employee.search"),
									"aria-label": t("employee.search"),
									onChange: (event) => {
										setKeyword(event.target.value);
									}
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
									label: t("employee.refresh"),
									delayMs: 400,
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
										variant: "outline",
										size: "sm",
										"aria-label": t("employee.refresh"),
										disabled: state.busy,
										icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconRefreshOutline16, { size: 16 }),
										onClick: () => {
											data.refresh();
										}
									})
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: "primary",
									size: "sm",
									icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPlusOutline16, { size: 16 }),
									disabled: state.busy || employees.length === 0,
									onClick: () => {
										setCreating(true);
									},
									children: t("employee.create")
								})
							]
						})]
					}),
					state.error !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ErrorLine$1, { text: state.error }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: EmployeeSection_module_css_default.body,
						children: state.loading ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: EmployeeSection_module_css_default.empty,
							children: t("employee.loading")
						}) : shown.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: EmployeeSection_module_css_default.empty,
							children: needle === "" ? t("employee.none") : t("employee.noMatch")
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
							className: EmployeeSection_module_css_default.grid,
							children: shown.map((employee) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmployeeCard, {
								employee,
								t,
								onEdit: () => {
									onEdit(employee.id);
								}
							}) }, employee.id))
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(CreateDialog$1, {
						open: creating,
						data,
						t,
						employees,
						defaultId: state.snapshot?.defaultId,
						onClose: () => {
							setCreating(false);
						},
						onCreated: (id) => {
							setCreating(false);
							onEdit(id);
						}
					})
				]
			});
		}
		/** 一张员工卡片。 */
		function EmployeeCard({ employee, t, onEdit }) {
			const readOnly = employee.trust !== "user";
			const bound = employee.knowledgeBases.length + employee.skills.length + employee.mcpServers.length;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				className: EmployeeSection_module_css_default.card,
				"aria-label": employee.name,
				onClick: onEdit,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: EmployeeSection_module_css_default.cardMark,
					"aria-hidden": "true",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconAgentPresetOutline16, { size: 18 })
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
					className: EmployeeSection_module_css_default.cardMain,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: EmployeeSection_module_css_default.cardTitle,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: EmployeeSection_module_css_default.cardName,
									children: employee.name
								}),
								employee.isDefault && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Pill, {
									className: clsx(EmployeeSection_module_css_default.tag),
									children: t("employee.tag.default")
								}),
								readOnly && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Pill, {
									className: clsx(EmployeeSection_module_css_default.tag),
									children: t("employee.tag.readonly")
								})
							]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: EmployeeSection_module_css_default.cardId,
							children: employee.id
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: EmployeeSection_module_css_default.cardDesc,
							children: employee.description ?? employee.persona ?? employee.capabilities.personaLine ?? t("employee.noDescription")
						}),
						employee.broken === void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: EmployeeSection_module_css_default.cardFacts,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: EmployeeSection_module_css_default.fact,
									children: t("employee.meta.tools").replace("{n}", String(employee.capabilities.tools))
								}),
								employee.capabilities.skills > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: EmployeeSection_module_css_default.fact,
									children: t("employee.meta.skillCapable")
								}),
								employee.capabilities.personaComplete && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: EmployeeSection_module_css_default.fact,
									children: t("employee.meta.fixedPrompt")
								}),
								employee.capabilities.agentInstructions && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: EmployeeSection_module_css_default.fact,
									children: t("employee.meta.agents")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: EmployeeSection_module_css_default.fact,
									children: t(bound === 0 ? "employee.meta.unbound" : "employee.meta.bound").replace("{n}", String(bound))
								})
							]
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: EmployeeSection_module_css_default.cardMeta,
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: EmployeeSection_module_css_default.broken,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconWarningOutline16, { size: 14 }), employee.broken]
							})
						})
					]
				})]
			});
		}
		/** 编辑面板：左 tab 导航，右内容。 */
		function EmployeeEditor({ employee, data, t, onBack }) {
			const state = useStore(data.store);
			const [tab, setTab] = (0, react.useState)("identity");
			const [removing, setRemoving] = (0, react.useState)(false);
			const [source, setSource] = (0, react.useState)(void 0);
			const [composition, setComposition] = (0, react.useState)(void 0);
			const readOnly = employee.trust !== "user";
			(0, react.useEffect)(() => {
				setTab("identity");
			}, [employee.id]);
			(0, react.useEffect)(() => {
				let live = true;
				setSource(void 0);
				setComposition(void 0);
				data.read(employee.id).then((result) => {
					if (!live || result === void 0) return;
					setSource(result.source);
					setComposition(result.composition);
				});
				return () => {
					live = false;
				};
			}, [data, employee.id]);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: EmployeeSection_module_css_default.section,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
						className: EmployeeSection_module_css_default.head,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: EmployeeSection_module_css_default.headText,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: EmployeeSection_module_css_default.back,
									onClick: onBack,
									children: t("employee.back")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h1", {
									className: EmployeeSection_module_css_default.title,
									children: employee.name
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: EmployeeSection_module_css_default.subtitle,
									children: employee.id
								})
							]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: EmployeeSection_module_css_default.headActions,
							children: [
								employee.isDefault && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Pill, {
									className: clsx(EmployeeSection_module_css_default.tag),
									children: t("employee.tag.default")
								}),
								readOnly && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Pill, {
									className: clsx(EmployeeSection_module_css_default.tag),
									children: t("employee.tag.readonly")
								}),
								!readOnly && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: "outline",
									size: "sm",
									icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconTrashOutline16, { size: 16 }),
									disabled: state.busy,
									onClick: () => {
										setRemoving(true);
									},
									children: t("employee.delete")
								})
							]
						})]
					}),
					state.error !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ErrorLine$1, { text: state.error }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: EmployeeSection_module_css_default.editor,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("nav", {
							className: EmployeeSection_module_css_default.tabs,
							"aria-orientation": "vertical",
							role: "tablist",
							children: TABS.map((item) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								role: "tab",
								"aria-selected": item.id === tab,
								"aria-label": t(item.titleKey),
								className: clsx(EmployeeSection_module_css_default.tab, item.id === tab && EmployeeSection_module_css_default.tabActive),
								onClick: () => {
									setTab(item.id);
								},
								children: [item.icon, /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t(item.titleKey) })]
							}, item.id))
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: EmployeeSection_module_css_default.tabBody,
							children: [
								tab === "identity" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IdentityTab, {
									employee,
									data,
									t,
									readOnly,
									composition
								}),
								tab === "tools" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ToolsTab, {
									composition,
									t
								}),
								tab === "knowledge" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(BindingTab, {
									kind: "knowledgeBases",
									employee,
									data,
									t,
									readOnly,
									available: state.snapshot?.knowledgeBases ?? [],
									emptyKey: "employee.bind.noKnowledge",
									composition
								}),
								tab === "skills" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(BindingTab, {
									kind: "skills",
									employee,
									data,
									t,
									readOnly,
									available: state.snapshot?.skills ?? [],
									emptyKey: "employee.bind.noSkills",
									composition
								}),
								tab === "mcp" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(BindingTab, {
									kind: "mcpServers",
									employee,
									data,
									t,
									readOnly,
									available: state.snapshot?.mcpServers ?? [],
									emptyKey: "employee.bind.noMcp",
									composition
								}),
								tab === "files" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FilesTab, {
									source,
									t
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
						open: removing,
						title: t("employee.delete.title"),
						description: t("employee.delete.hint").replace("{id}", employee.id),
						closeLabel: t("employee.cancel"),
						onClose: () => {
							setRemoving(false);
						},
						footer: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: EmployeeSection_module_css_default.dialogFooter,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								variant: "ghost",
								onClick: () => {
									setRemoving(false);
								},
								children: t("employee.cancel")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								variant: "primary",
								disabled: state.busy,
								onClick: () => {
									data.remove(employee.id).then((done) => {
										setRemoving(false);
										if (done) onBack();
									});
								},
								children: t("employee.delete.confirm")
							})]
						})
					})
				]
			});
		}
		/**
		* 基本设置页：名片（可改）+ 模板自带的人设（只读）。
		*
		* 两个「人设」得分清楚，界面上也分了两块：
		*
		* - **模板自带的人设**是组合文件里 `dsh-persona` 行的系统提示，它决定这个
		*   智能体开口时是谁。改它要动组合文件，本插件不碰。
		* - **岗位说明**是工作台自己加的一层，写在 `employee.yml` 里，给模型看
		*   「以这个员工身份工作时你负责什么」。
		*
		* 把后者说成"人设"会让人以为改了它就改了系统提示，其实没有。
		*/
		function IdentityTab({ employee, data, t, readOnly, composition }) {
			const state = useStore(data.store);
			const [name, setName] = (0, react.useState)(employee.name);
			const [description, setDescription] = (0, react.useState)(employee.description ?? "");
			const [persona, setPersona] = (0, react.useState)(employee.persona ?? "");
			(0, react.useEffect)(() => {
				setName(employee.name);
				setDescription(employee.description ?? "");
				setPersona(employee.persona ?? "");
			}, [
				employee.id,
				employee.name,
				employee.description,
				employee.persona
			]);
			const metaDirty = name.trim() !== employee.name || description.trim() !== (employee.description ?? "");
			const personaDirty = persona.trim() !== (employee.persona ?? "");
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: EmployeeSection_module_css_default.pane,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Field$1, {
						label: t("employee.field.name"),
						hint: t("employee.field.name.hint"),
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
							value: name,
							disabled: readOnly,
							onChange: (event) => {
								setName(event.target.value);
							}
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Field$1, {
						label: t("employee.field.description"),
						hint: t("employee.field.description.hint"),
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
							className: EmployeeSection_module_css_default.textarea,
							rows: 2,
							value: description,
							disabled: readOnly,
							onChange: (event) => {
								setDescription(event.target.value);
							}
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Field$1, {
						label: t("employee.field.persona"),
						hint: t("employee.field.persona.hint"),
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
							className: EmployeeSection_module_css_default.textarea,
							rows: 6,
							value: persona,
							disabled: readOnly,
							onChange: (event) => {
								setPersona(event.target.value);
							}
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
						className: EmployeeSection_module_css_default.block,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
								className: EmployeeSection_module_css_default.blockTitle,
								children: t("employee.field.systemPrompt")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: EmployeeSection_module_css_default.note,
								children: t("employee.field.systemPrompt.hint")
							}),
							composition === void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: EmployeeSection_module_css_default.empty,
								children: t("employee.loading")
							}) : composition.persona === void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: EmployeeSection_module_css_default.empty,
								children: t("employee.persona.inherited")
							}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", {
								className: EmployeeSection_module_css_default.source,
								children: composition.persona.text
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("ul", {
								className: EmployeeSection_module_css_default.facts,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: t(composition.persona.complete ? "employee.persona.complete" : "employee.persona.extendable") }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: t(composition.persona.includeRuntimeContext ? "employee.persona.runtimeOn" : "employee.persona.runtimeOff") }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: t(composition.agentInstructions ? "employee.persona.agentsOn" : "employee.persona.agentsOff") })
								]
							})] })
						]
					}),
					!readOnly && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: EmployeeSection_module_css_default.paneActions,
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: "primary",
							size: "sm",
							disabled: state.busy || !metaDirty && !personaDirty,
							onClick: () => {
								(async () => {
									if (metaDirty) await data.update(employee.id, {
										name: name.trim(),
										description: description.trim(),
										...employee.order === void 0 ? {} : { order: employee.order }
									});
									if (personaDirty) await data.bind(employee.id, { persona: persona.trim() });
								})();
							},
							children: t("employee.save")
						})
					}),
					readOnly && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: EmployeeSection_module_css_default.note,
						children: t("employee.readonly.hint")
					})
				]
			});
		}
		/**
		* 工具页：这个模板装了哪些工具插件。
		*
		* 全部读自组合文件，只读——工具是 preset 的组成部分，加减工具等于改这个
		* 智能体本身，那要动组合文件。
		*
		* 显示的是**插件行**而不是工具名：一行可能往目录里注册好几个工具（`fs` 就
		* 是），真正的工具名要到运行时才定。界面上照实写清楚，免得有人照着这个数
		* 去数模型能调几个工具。
		*/
		function ToolsTab({ composition, t }) {
			if (composition === void 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: EmployeeSection_module_css_default.pane,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: EmployeeSection_module_css_default.empty,
					children: t("employee.loading")
				})
			});
			if (composition.error !== void 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: EmployeeSection_module_css_default.pane,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
					className: EmployeeSection_module_css_default.missing,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconWarningOutline16, { size: 14 }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("employee.composition.error").replace("{reason}", composition.error) })]
				})
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: EmployeeSection_module_css_default.pane,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: EmployeeSection_module_css_default.note,
						children: t("employee.tools.hint")
					}),
					composition.tools.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: EmployeeSection_module_css_default.empty,
						children: t("employee.tools.none")
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EntryList, {
						entries: composition.tools,
						t
					}),
					composition.others.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
						className: EmployeeSection_module_css_default.block,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
								className: EmployeeSection_module_css_default.blockTitle,
								children: t("employee.tools.others")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: EmployeeSection_module_css_default.note,
								children: t("employee.tools.others.hint")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)(EntryList, {
								entries: composition.others,
								t
							})
						]
					})
				]
			});
		}
		/** 一列组合文件条目。 */
		function EntryList({ entries, t }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
				className: EmployeeSection_module_css_default.entryList,
				children: entries.map((entry) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
					className: EmployeeSection_module_css_default.entry,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: EmployeeSection_module_css_default.entryHead,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: EmployeeSection_module_css_default.entryName,
								children: entry.id ?? entry.label
							}), entry.disabled !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: EmployeeSection_module_css_default.entryFlag,
								children: entry.disabled === true ? t("employee.entry.disabled") : t("employee.entry.conditional").replace("{cond}", entry.disabled)
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", {
							className: EmployeeSection_module_css_default.entryPackage,
							children: entry.name
						}),
						entry.group.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: EmployeeSection_module_css_default.entryGroup,
							children: entry.group.join(" › ")
						})
					]
				}, `${entry.group.join("/")}/${entry.id ?? entry.name}`))
			});
		}
		/**
		* 三个绑定页共用一个实现：先说这个模板本身支不支持该类资源，再给绑定清单。
		*
		* 两层必须分开讲，否则界面会骗人：`minimal` 那种模板压根没装技能能力，给它
		* 绑一堆技能，绑定是写进去了，模型却根本没有用技能的工具。上面一行说的是
		* 「这个智能体有没有这个能力」（读自组合文件），下面的清单才是「让它用哪些」。
		*/
		function BindingTab({ kind, employee, data, t, readOnly, available, emptyKey, composition }) {
			const state = useStore(data.store);
			const bound = employee[kind];
			const toggle = (id) => {
				const next = bound.includes(id) ? bound.filter((item) => item !== id) : [...bound, id];
				data.bind(employee.id, {
					[kind]: next,
					mode: "replace"
				});
			};
			const missing = bound.filter((id) => !available.includes(id));
			const capability = composition === void 0 || kind === "knowledgeBases" ? void 0 : kind === "skills" ? composition.skills : composition.mcpServers;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: EmployeeSection_module_css_default.pane,
				children: [
					capability !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: capability.length === 0 ? EmployeeSection_module_css_default.missing : EmployeeSection_module_css_default.capability,
						children: capability.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconWarningOutline16, { size: 14 }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t(kind === "skills" ? "employee.capability.noSkills" : "employee.capability.noMcp") })] }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t(kind === "skills" ? "employee.capability.skills" : "employee.capability.mcp").replace("{items}", capability.map((entry) => entry.id ?? entry.label).join("、")) })
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: EmployeeSection_module_css_default.note,
						children: t("employee.bind.hint")
					}),
					missing.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: EmployeeSection_module_css_default.missing,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconWarningOutline16, { size: 14 }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("employee.bind.missing").replace("{items}", missing.join("、")) })]
					}),
					available.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: EmployeeSection_module_css_default.empty,
						children: t(emptyKey)
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
						className: EmployeeSection_module_css_default.checkList,
						children: available.map((id) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
							className: EmployeeSection_module_css_default.check,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: bound.includes(id),
								disabled: readOnly || state.busy,
								onChange: () => {
									toggle(id);
								}
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: id })]
						}) }, id))
					})
				]
			});
		}
		/**
		* 核心文件页：组合文件原文。
		*
		* 上面几页展示的都是从这份文件解析出来的东西，而解析是按包名前缀的启发式；
		* 认不出来的行只有原文说了算，所以原文得能看到。
		*/
		function FilesTab({ source, t }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: EmployeeSection_module_css_default.pane,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: EmployeeSection_module_css_default.note,
					children: t("employee.files.hint")
				}), source === void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: EmployeeSection_module_css_default.empty,
					children: t("employee.loading")
				}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", {
					className: EmployeeSection_module_css_default.source,
					children: source
				})]
			});
		}
		/** 新建对话框：选模板、起 id 和名字。 */
		function CreateDialog$1({ open, data, t, employees, defaultId, onClose, onCreated }) {
			const state = useStore(data.store);
			const [id, setId] = (0, react.useState)("");
			const [name, setName] = (0, react.useState)("");
			const [from, setFrom] = (0, react.useState)(defaultId ?? "");
			(0, react.useEffect)(() => {
				if (!open) return;
				setId("");
				setName("");
				setFrom(defaultId ?? employees[0]?.id ?? "");
			}, [
				open,
				defaultId,
				employees
			]);
			const valid = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(id.trim());
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
				open,
				title: t("employee.create.title"),
				description: t("employee.create.hint"),
				closeLabel: t("employee.cancel"),
				onClose,
				footer: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: EmployeeSection_module_css_default.dialogFooter,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
						variant: "ghost",
						onClick: onClose,
						children: t("employee.cancel")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
						variant: "primary",
						disabled: !valid || state.busy || from === "",
						onClick: () => {
							data.create(id.trim(), from, name.trim() === "" ? void 0 : name.trim()).then((done) => {
								if (done) onCreated(id.trim());
							});
						},
						children: t("employee.create.confirm")
					})]
				}),
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: EmployeeSection_module_css_default.dialogBody,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Field$1, {
							label: t("employee.create.from"),
							hint: t("employee.create.from.hint"),
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("select", {
								className: EmployeeSection_module_css_default.select,
								value: from,
								onChange: (event) => {
									setFrom(event.target.value);
								},
								children: employees.map((employee) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("option", {
									value: employee.id,
									children: [
										employee.name,
										"（",
										employee.id,
										"）"
									]
								}, employee.id))
							})
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Field$1, {
							label: t("employee.create.id"),
							hint: t("employee.create.id.hint"),
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
								value: id,
								placeholder: "sales-assistant",
								onChange: (event) => {
									setId(event.target.value);
								}
							})
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Field$1, {
							label: t("employee.field.name"),
							hint: t("employee.create.name.hint"),
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
								value: name,
								onChange: (event) => {
									setName(event.target.value);
								}
							})
						})
					]
				})
			});
		}
		/** 一个带标签与说明的字段。 */
		function Field$1({ label, hint, children }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
				className: EmployeeSection_module_css_default.field,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: EmployeeSection_module_css_default.fieldLabel,
						children: label
					}),
					children,
					hint !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: EmployeeSection_module_css_default.fieldHint,
						children: hint
					})
				]
			});
		}
		/** 一条错误横幅。 */
		function ErrorLine$1({ text }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
				className: EmployeeSection_module_css_default.error,
				role: "alert",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconWarningOutline16, { size: 14 }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: text })]
			});
		}
		//#endregion
		//#region src/client/skill/data.ts
		/**
		* 技能域的数据层：一个盒子装快照，写操作走 Remote 再把结果填回去。
		*
		* 形态与员工域那一份（`client/employee/data.ts`）一致：写操作的返回自带一份
		* 刷新过的完整快照，界面改完不用再取一次；失败不抛，统一折成盒子里的
		* `error`，由界面决定怎么显示。
		*
		* 多出来的是**市场**：它不属于快照。快照是本机状态，市场是一次网络查询的
		* 结果，两者刷新时机不同——重取本机清单不该把搜索结果清掉，反之亦然。所以
		* 市场单独占盒子里的一格，并且带自己的 loading 与错误。
		*
		* 写操作的结果里还带一句 `message` 和一份 `activation`。`message` 说的是
		* 「做了什么」，`activation` 说的是「它现在到底生没生效」——后者是回读
		* `ctx.skills` 得来的事实，不是预测。两者拼成 `notice`，与 `error` 分开存：
		* 它说明操作**成功了**，混进错误位会让人分不清刚才那下到底成没成。
		*
		* @module @staff-os/dsh-workbench/client/skill/data
		*/
		/**
		* 浏览器上传技能包的体积上限，与 Node 半边的 `MAX_UPLOAD_BYTES` 同值。
		*
		* 这里挡一道是为了在读文件之前就当场给反馈——传上去再被拒，用户白等一次
		* 编码加一次往返。真正说了算的仍然是那边。
		*/
		const MAX_UPLOAD_BYTES = 8388608;
		/** 认得出的技能包扩展名，与 Node 半边的 `ARCHIVE_SUFFIX` 同形。 */
		const ARCHIVE_ACCEPT = ".zip,.tar,.tgz,.tar.gz";
		/**
		* 把一个 File 读成 base64。
		*
		* 走 `readAsDataURL` 而不是自己对 `ArrayBuffer` 做 `btoa`：后者要把字节先摊成
		* 一个字符串，几 MB 的包足以把 `String.fromCharCode(...bytes)` 的参数栈撑爆。
		*/
		async function fileToBase64(file) {
			const dataUrl = await new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.onerror = () => {
					reject(reader.error ?? /* @__PURE__ */ new Error("读取文件失败"));
				};
				reader.onload = () => {
					resolve(typeof reader.result === "string" ? reader.result : "");
				};
				reader.readAsDataURL(file);
			});
			const comma = dataUrl.indexOf(",");
			return comma === -1 ? "" : dataUrl.slice(comma + 1);
		}
		/** 初始状态：还没开始取。 */
		const INITIAL$1 = {
			loading: true,
			busy: false,
			marketLoading: false,
			updatesLoading: false,
			configBusy: false
		};
		/** 把 Remote 失败转成一句人话。 */
		function failureText$1(result) {
			const { code, message } = result.error;
			return message === "" ? code : message;
		}
		/** 把一个抛出来的东西转成一句人话。 */
		function causeText(cause) {
			return cause instanceof Error ? cause.message : String(cause);
		}
		/**
		* 建技能域的数据层。
		* @param remote - 取当前的 Remote 命名空间；没挂上时返回 undefined。
		* @returns 数据层。
		*/
		function createSkillData(remote) {
			const store = createStore(INITIAL$1);
			/** 没有通道时统一的说法。 */
			const noChannel = () => {
				store.set((current) => ({
					...current,
					loading: false,
					busy: false,
					marketLoading: false,
					updatesLoading: false,
					error: "技能数据通道没有接上：本插件的 Remote 契约未挂载"
				}));
			};
			/** 收下一份快照。 */
			const accept = (snapshot) => {
				store.set((current) => {
					const { error: _dropped, ...rest } = current;
					return {
						...rest,
						loading: false,
						busy: false,
						snapshot
					};
				});
			};
			/** 跑一次写操作：置忙、调用、按结果收快照或记错误。 */
			const mutate = async (call) => {
				const face = remote();
				if (face === void 0) {
					noChannel();
					return false;
				}
				store.set((current) => {
					const { error: _dropped, notice: _cleared, activation: _stale, ...rest } = current;
					return {
						...rest,
						busy: true
					};
				});
				let result;
				try {
					result = await call(face);
				} catch (cause) {
					store.set((current) => ({
						...current,
						busy: false,
						error: causeText(cause)
					}));
					return false;
				}
				if (!result.ok) {
					store.set((current) => ({
						...current,
						busy: false,
						error: failureText$1(result)
					}));
					return false;
				}
				accept(result.value.snapshot);
				const { message, activation } = result.value;
				store.set((current) => ({
					...current,
					notice: activation === void 0 ? message : `${message}。${activation.summary}`,
					...activation === void 0 ? {} : { activation }
				}));
				return true;
			};
			const api = {
				store,
				refresh: async () => {
					const face = remote();
					if (face === void 0) {
						noChannel();
						return;
					}
					store.set((current) => ({
						...current,
						loading: current.snapshot === void 0
					}));
					let result;
					try {
						result = await face.list();
					} catch (cause) {
						store.set((current) => ({
							...current,
							loading: false,
							error: causeText(cause)
						}));
						return;
					}
					if (!result.ok) {
						store.set((current) => ({
							...current,
							loading: false,
							error: failureText$1(result)
						}));
						return;
					}
					accept(result.value);
				},
				dismiss: () => {
					store.set((current) => {
						const { error: _e, notice: _n, marketError: _m, activation: _a, ...rest } = current;
						return rest;
					});
				},
				read: async (name) => {
					const face = remote();
					if (face === void 0) {
						noChannel();
						return;
					}
					try {
						const result = await face.read(name);
						if (!result.ok) {
							store.set((current) => ({
								...current,
								error: failureText$1(result)
							}));
							return;
						}
						return result.value;
					} catch (cause) {
						store.set((current) => ({
							...current,
							error: causeText(cause)
						}));
						return;
					}
				},
				readFile: async (name, path) => {
					const face = remote();
					if (face === void 0) {
						noChannel();
						return;
					}
					try {
						const result = await face.readFile(name, path);
						if (!result.ok) {
							store.set((current) => ({
								...current,
								error: failureText$1(result)
							}));
							return;
						}
						return result.value;
					} catch (cause) {
						store.set((current) => ({
							...current,
							error: causeText(cause)
						}));
						return;
					}
				},
				scan: async (name) => {
					const face = remote();
					if (face === void 0) {
						noChannel();
						return;
					}
					try {
						const result = await face.scan(name);
						if (!result.ok) {
							store.set((current) => ({
								...current,
								error: failureText$1(result)
							}));
							return;
						}
						return result.value;
					} catch (cause) {
						store.set((current) => ({
							...current,
							error: causeText(cause)
						}));
						return;
					}
				},
				create: async (input) => mutate((face) => face.create(input)),
				visibility: async (name, next) => mutate((face) => face.visibility(name, next)),
				remove: async (name) => mutate((face) => face.delete(name)),
				install: async (slug, version, registry, overwrite, owner) => mutate((face) => face.marketInstall(slug, version, registry, overwrite, owner)),
				update: async (name) => mutate((face) => face.marketUpdate(name, void 0, void 0, void 0)),
				updateAll: async () => {
					const ok = await mutate((face) => face.marketUpdateAll());
					if (ok) await api.checkUpdates();
					return ok;
				},
				checkUpdates: async () => {
					const face = remote();
					if (face === void 0) {
						noChannel();
						return;
					}
					store.set((current) => ({
						...current,
						updatesLoading: true
					}));
					let result;
					try {
						result = await face.updates();
					} catch (cause) {
						store.set((current) => ({
							...current,
							updatesLoading: false,
							error: causeText(cause)
						}));
						return;
					}
					if (!result.ok) {
						store.set((current) => ({
							...current,
							updatesLoading: false,
							error: failureText$1(result)
						}));
						return;
					}
					const updates = new Map(result.value.map((status) => [status.name, status]));
					store.set((current) => ({
						...current,
						updatesLoading: false,
						updates
					}));
				},
				upload: async (file, overwrite, name) => {
					if (file.size > 8388608) {
						store.set((current) => ({
							...current,
							error: `${file.name} 有 ${String(file.size)} 字节，超过上传上限 ${String(MAX_UPLOAD_BYTES)}`
						}));
						return false;
					}
					let encoded;
					try {
						encoded = await fileToBase64(file);
					} catch (cause) {
						store.set((current) => ({
							...current,
							error: causeText(cause)
						}));
						return false;
					}
					return mutate((face) => face.importPackage(file.name, encoded, overwrite, name));
				},
				importUrl: async (url, overwrite, name) => {
					const value = url.trim();
					if (value === "") {
						store.set((current) => ({
							...current,
							error: "请先填一个链接"
						}));
						return false;
					}
					return mutate((face) => face.importUrl(value, overwrite, name));
				},
				marketGet: async (slug, registry) => {
					const face = remote();
					if (face === void 0) {
						noChannel();
						return;
					}
					try {
						const result = await face.marketGet(slug, registry);
						if (!result.ok) {
							store.set((current) => ({
								...current,
								marketError: failureText$1(result)
							}));
							return;
						}
						return result.value;
					} catch (cause) {
						store.set((current) => ({
							...current,
							marketError: causeText(cause)
						}));
						return;
					}
				},
				marketFile: async (slug, version, registry, owner, path) => {
					const face = remote();
					if (face === void 0) {
						noChannel();
						return;
					}
					try {
						const result = await face.marketFile(slug, version, registry, owner, path);
						if (!result.ok) {
							store.set((current) => ({
								...current,
								marketError: failureText$1(result)
							}));
							return;
						}
						return result.value;
					} catch (cause) {
						store.set((current) => ({
							...current,
							marketError: causeText(cause)
						}));
						return;
					}
				},
				marketScan: async (slug, version, registry, owner) => {
					const face = remote();
					if (face === void 0) {
						noChannel();
						return;
					}
					try {
						const result = await face.marketScan(slug, version, registry, owner);
						if (!result.ok) {
							store.set((current) => ({
								...current,
								marketError: failureText$1(result)
							}));
							return;
						}
						return result.value;
					} catch (cause) {
						store.set((current) => ({
							...current,
							marketError: causeText(cause)
						}));
						return;
					}
				},
				marketPreview: async (slug, version, registry, owner) => {
					const face = remote();
					if (face === void 0) {
						noChannel();
						return;
					}
					try {
						const result = await face.marketPreview(slug, version, registry, owner);
						if (!result.ok) {
							store.set((current) => ({
								...current,
								marketError: failureText$1(result)
							}));
							return;
						}
						return result.value;
					} catch (cause) {
						store.set((current) => ({
							...current,
							marketError: causeText(cause)
						}));
						return;
					}
				},
				loadLabels: async () => {
					const face = remote();
					if (face === void 0) {
						noChannel();
						return;
					}
					try {
						const result = await face.marketLabels();
						store.set((current) => ({
							...current,
							labels: result.ok ? result.value : []
						}));
					} catch {
						store.set((current) => ({
							...current,
							labels: []
						}));
					}
				},
				search: async (keyword, page, sort, label, labelRegistry) => {
					const face = remote();
					if (face === void 0) {
						noChannel();
						return;
					}
					store.set((current) => {
						const { marketError: _dropped, ...rest } = current;
						return {
							...rest,
							marketLoading: true
						};
					});
					let result;
					try {
						result = await face.marketSearch(keyword, page, sort, label, labelRegistry);
					} catch (cause) {
						store.set((current) => ({
							...current,
							marketLoading: false,
							marketError: causeText(cause)
						}));
						return;
					}
					if (!result.ok) {
						store.set((current) => ({
							...current,
							marketLoading: false,
							marketError: failureText$1(result)
						}));
						return;
					}
					store.set((current) => ({
						...current,
						marketLoading: false,
						market: result.value
					}));
				},
				readMarketConfig: async () => {
					const face = remote();
					if (face === void 0) {
						noChannel();
						return [];
					}
					store.set((current) => ({
						...current,
						configBusy: true
					}));
					try {
						const result = await face.marketConfigRead();
						if (!result.ok) {
							store.set((current) => ({
								...current,
								configBusy: false,
								error: failureText$1(result)
							}));
							return [];
						}
						store.set((current) => ({
							...current,
							configBusy: false,
							marketConfig: result.value
						}));
						return result.value;
					} catch (cause) {
						store.set((current) => ({
							...current,
							configBusy: false,
							error: causeText(cause)
						}));
						return [];
					}
				},
				writeMarketConfig: async (sources) => {
					const face = remote();
					if (face === void 0) {
						noChannel();
						return;
					}
					store.set((current) => ({
						...current,
						configBusy: true
					}));
					try {
						const result = await face.marketConfigWrite(sources);
						if (!result.ok) {
							store.set((current) => ({
								...current,
								configBusy: false,
								error: failureText$1(result)
							}));
							return;
						}
						store.set((current) => ({
							...current,
							configBusy: false,
							marketConfig: result.value
						}));
						api.refresh();
						return result.value;
					} catch (cause) {
						store.set((current) => ({
							...current,
							configBusy: false,
							error: causeText(cause)
						}));
						return;
					}
				}
			};
			return api;
		}
		//#endregion
		//#region \0workbench-css:src/client/skill/SkillSection.module.css.mjs
		const css$1 = ".QZMXAG_section{flex-direction:column;height:100%;min-height:0;display:flex;position:relative}.QZMXAG_head{align-items:flex-start;gap:16px;padding:24px 28px 16px;display:flex}.QZMXAG_headText{flex:1;min-width:0}.QZMXAG_back{color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:none;align-items:center;margin-bottom:6px;padding:0;font-size:12px;display:inline-flex}.QZMXAG_back:hover{color:var(--dsw-alias-label-primary)}.QZMXAG_title{color:var(--dsw-alias-label-primary);text-overflow:ellipsis;white-space:nowrap;margin:0;font-size:18px;font-weight:600;overflow:hidden}.QZMXAG_subtitle{color:var(--dsw-alias-label-tertiary);margin:4px 0 0;font-size:12px}.QZMXAG_headActions{flex-shrink:0;align-items:center;gap:8px;display:flex}.QZMXAG_tabs{border-bottom:1px solid var(--dsw-alias-border-l1);gap:4px;padding:2px 28px 12px;display:flex}.QZMXAG_tab{color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:none;border-radius:999px;padding:8px 18px;font-size:13px;line-height:1.4;transition:background .12s,color .12s}.QZMXAG_tab:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}.QZMXAG_tabActive,.QZMXAG_tabActive:hover{background:var(--dsw-alias-label-primary);color:var(--dsw-alias-label-primary-inverted)}.QZMXAG_body{flex-direction:column;flex:1;gap:16px;min-height:0;padding:20px 28px 28px;display:flex;overflow-y:auto}.QZMXAG_empty{color:var(--dsw-alias-label-tertiary);margin:0;padding:24px 0;font-size:13px}.QZMXAG_banner{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary);border-radius:8px;align-items:flex-start;gap:6px;margin:0;padding:10px 12px;font-size:12px;line-height:1.6;display:flex}.QZMXAG_bannerWarn{color:var(--dsw-alias-state-warn-label)}.QZMXAG_glyph{letter-spacing:-.01em;border-radius:11px;flex-shrink:0;justify-content:center;align-items:center;width:44px;height:44px;font-size:18px;font-weight:600;line-height:1;display:flex}.QZMXAG_glyphSm{border-radius:10px;width:40px;height:40px;font-size:16px}.QZMXAG_glyph0{background:var(--dsw-alias-interactive-bg-active);color:var(--dsw-alias-label-primary)}.QZMXAG_glyph1{background:color-mix(in oklab, var(--dsw-alias-state-success-primary) 16%, transparent);color:var(--dsw-alias-label-primary)}.QZMXAG_glyph2{background:color-mix(in oklab, var(--dsw-alias-state-warn-primary) 16%, transparent);color:var(--dsw-alias-label-primary)}.QZMXAG_glyph3{background:color-mix(in oklab, var(--dsw-alias-brand-primary) 16%, transparent);color:var(--dsw-alias-label-primary)}.QZMXAG_glyph4{background:color-mix(in oklab, var(--dsw-alias-state-business-primary) 16%, transparent);color:var(--dsw-alias-label-primary)}.QZMXAG_glyph5{background:var(--dsw-alias-label-primary);color:var(--dsw-alias-label-primary-inverted)}.QZMXAG_grid{grid-template-columns:repeat(auto-fill,minmax(272px,1fr));gap:18px;margin:0;padding:0;list-style:none;display:grid}.QZMXAG_marketCard{text-align:left;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);cursor:pointer;width:100%;height:100%;transition:transform .16s var(--ds-ease-in-out,ease), box-shadow .16s var(--ds-ease-in-out,ease), border-color .16s var(--ds-ease-in-out,ease);border-radius:14px;flex-direction:column;padding:20px;display:flex}.QZMXAG_marketCard:hover{border-color:var(--dsw-alias-border-l3);transform:translateY(-2px);box-shadow:0 10px 26px #00000014}@media (prefers-reduced-motion:reduce){.QZMXAG_marketCard{transition:none}.QZMXAG_marketCard:hover{transform:none}}.QZMXAG_marketCardHead{justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:16px;display:flex}.QZMXAG_registryPill{border:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-tertiary);white-space:nowrap;border-radius:999px;flex-shrink:0;align-items:center;gap:5px;padding:4px 9px 4px 7px;font-size:11px;line-height:1.4;display:inline-flex}.QZMXAG_registryDot{background:var(--dsw-alias-label-secondary);border-radius:50%;flex-shrink:0;width:5px;height:5px}.QZMXAG_cardStatus{color:var(--dsw-alias-label-tertiary);font-family:var(--ds-font-family-code,monospace);letter-spacing:.04em;margin-bottom:7px;font-size:11px}.QZMXAG_cardStatusOn{color:var(--dsw-alias-state-success-primary)}.QZMXAG_cardStatusOff{color:var(--dsw-alias-label-dimmed)}.QZMXAG_cardName{color:var(--dsw-alias-label-primary);letter-spacing:-.01em;margin-bottom:6px;font-size:16px;font-weight:600;line-height:1.3}.QZMXAG_cardDesc{-webkit-line-clamp:3;color:var(--dsw-alias-label-secondary);-webkit-box-orient:vertical;font-size:13px;line-height:1.55;display:-webkit-box;overflow:hidden}.QZMXAG_cardSpacer{flex:1;min-height:14px}.QZMXAG_cardTags{flex-wrap:wrap;gap:6px;margin-bottom:12px;display:flex}.QZMXAG_cardTag{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-tertiary);white-space:nowrap;border-radius:6px;padding:3px 8px;font-size:11px}.QZMXAG_cardMetrics{border-top:1px solid var(--dsw-alias-border-l1);align-items:center;gap:14px;padding-top:12px;display:flex}.QZMXAG_metric{color:var(--dsw-alias-label-tertiary);font-family:var(--ds-font-family-code,monospace);align-items:center;gap:5px;font-size:11px;display:inline-flex}.QZMXAG_metricMark{opacity:.55;flex-shrink:0}.QZMXAG_rows{flex-direction:column;gap:10px;margin:0;padding:0;list-style:none;display:flex}.QZMXAG_row{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);border-radius:14px;flex-wrap:wrap;align-items:center;gap:10px 14px;padding:14px 18px;transition:border-color .12s;display:flex}.QZMXAG_row:hover{border-color:var(--dsw-alias-border-l3)}.QZMXAG_rowOpen{text-align:left;cursor:pointer;background:0 0;border:none;flex:300px;align-items:center;gap:14px;min-width:0;padding:0;display:flex}.QZMXAG_rowMain{flex-direction:column;flex:1;gap:4px;min-width:0;display:flex}.QZMXAG_rowTitle{flex-wrap:wrap;align-items:center;gap:8px;min-width:0;display:flex}.QZMXAG_rowName{color:var(--dsw-alias-label-primary);text-overflow:ellipsis;white-space:nowrap;font-size:15px;font-weight:600;overflow:hidden}.QZMXAG_rowSource{border:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-tertiary);font-family:var(--ds-font-family-code,monospace);border-radius:5px;flex-shrink:0;padding:2px 6px;font-size:11px}.QZMXAG_rowPath{color:var(--dsw-alias-label-tertiary);font-family:var(--ds-font-family-code,monospace);text-overflow:ellipsis;white-space:nowrap;font-size:11px;overflow:hidden}.QZMXAG_rowNote{color:var(--dsw-alias-state-warn-label);margin-top:3px;font-size:12px;line-height:1.6}.QZMXAG_rowSide{flex-wrap:wrap;flex-shrink:0;align-items:center;gap:8px;margin-left:auto;display:flex}.QZMXAG_badge{background:var(--dsw-alias-interactive-bg-active);color:var(--dsw-alias-label-tertiary);white-space:nowrap;border-radius:6px;flex-shrink:0;align-items:center;gap:4px;padding:3px 7px;font-size:11px;line-height:1.4;display:inline-flex}.QZMXAG_badgeWarn{background:color-mix(in oklab, var(--dsw-alias-state-warn-primary) 14%, transparent);color:var(--dsw-alias-state-warn-label)}.QZMXAG_badgeGood{background:color-mix(in oklab, var(--dsw-alias-state-success-primary) 14%, transparent);color:var(--dsw-alias-state-success-primary)}.QZMXAG_stateChip{background:var(--dsw-alias-interactive-bg-active);color:var(--dsw-alias-label-secondary);white-space:nowrap;border:1px solid #0000;border-radius:6px;flex-shrink:0;padding:5px 9px;font-size:12px;line-height:1.4}.QZMXAG_stateChipMono{font-family:var(--ds-font-family-code,monospace)}.QZMXAG_stateChipOff{border-color:var(--dsw-alias-border-l2);color:var(--dsw-alias-label-dimmed);background:0 0;border-style:dashed;text-decoration:line-through 1px}.QZMXAG_toolBar{flex-wrap:wrap;align-items:center;gap:12px;display:flex}.QZMXAG_toolBarActions{align-items:center;gap:8px;margin-left:auto;display:flex}.QZMXAG_searchPill{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);border-radius:999px;flex:200px;align-items:center;gap:9px;min-width:0;max-width:320px;padding:8px 14px;display:flex}.QZMXAG_searchPill:focus-within{border-color:var(--dsw-alias-border-l3)}.QZMXAG_searchMark{color:var(--dsw-alias-label-tertiary);flex-shrink:0}.QZMXAG_searchInput{min-width:0;color:var(--dsw-alias-label-primary);background:0 0;border:none;outline:none;flex:1;font-family:inherit;font-size:13px}.QZMXAG_searchInput::placeholder{color:var(--dsw-alias-label-tertiary)}.QZMXAG_resultLine{color:var(--dsw-alias-label-tertiary);margin:0;font-size:12px}.QZMXAG_rejected{border-top:1px solid var(--dsw-alias-border-l1);flex-direction:column;margin-top:12px;padding-top:20px;display:flex}.QZMXAG_rejectedTitle{color:var(--dsw-alias-label-primary);margin:0;font-size:14px;font-weight:600}.QZMXAG_rejectedHint{max-width:640px;color:var(--dsw-alias-label-secondary);margin:6px 0 12px;font-size:12px;line-height:1.6}.QZMXAG_rejectedList{flex-direction:column;gap:8px;margin:0;padding:0;list-style:none;display:flex}.QZMXAG_rejectedRow{border:1px dashed var(--dsw-alias-border-l2);background:var(--dsw-alias-interactive-bg-hover);border-radius:12px;align-items:center;gap:14px;padding:12px 16px;display:flex}.QZMXAG_rejectedMark{color:var(--dsw-alias-state-warn-label);flex-shrink:0}.QZMXAG_rejectedMain{flex-direction:column;flex:1;gap:3px;min-width:0;display:flex}.QZMXAG_rejectedName{color:var(--dsw-alias-label-primary);font-family:var(--ds-font-family-code,monospace);font-size:12px}.QZMXAG_rejectedPath{color:var(--dsw-alias-label-tertiary);font-family:var(--ds-font-family-code,monospace);text-overflow:ellipsis;white-space:nowrap;font-size:11px;overflow:hidden}.QZMXAG_rejectedReason{max-width:330px;color:var(--dsw-alias-label-secondary);flex:none;font-size:12px;line-height:1.5}.QZMXAG_tag{flex-shrink:0;font-size:11px}.QZMXAG_tagWarn{color:var(--dsw-alias-state-warn-label)}.QZMXAG_field{flex-direction:column;gap:6px;max-width:720px;display:flex}.QZMXAG_label{color:var(--dsw-alias-label-primary);font-size:13px;font-weight:500}.QZMXAG_hint{color:var(--dsw-alias-label-tertiary);margin:0;font-size:11px;line-height:1.5}.QZMXAG_value{color:var(--dsw-alias-label-secondary);margin:0;font-size:13px;line-height:1.6}.QZMXAG_source{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-interactive-bg-hover);max-height:420px;color:var(--dsw-alias-label-secondary);font-family:var(--ds-font-family-code,monospace);white-space:pre;border-radius:8px;margin:0;padding:12px 14px;font-size:12px;line-height:1.6;overflow:auto}.QZMXAG_checkList{flex-direction:column;gap:6px;margin:0;padding:0;list-style:none;display:flex}.QZMXAG_check{color:var(--dsw-alias-label-primary);cursor:pointer;align-items:center;gap:8px;font-size:13px;display:flex}.QZMXAG_check input:disabled{cursor:not-allowed}.QZMXAG_check input:disabled+span{opacity:.6}.QZMXAG_textarea{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);width:100%;color:var(--dsw-alias-label-primary);resize:vertical;border-radius:8px;padding:8px 10px;font-family:inherit;font-size:13px;line-height:1.6}.QZMXAG_textarea:focus{border-color:var(--dsw-alias-border-l3);outline:none}.QZMXAG_marketBar{flex-wrap:wrap;align-items:flex-start;gap:16px;display:flex}.QZMXAG_marketSearchGroup{flex:none;align-items:center;gap:8px;margin-left:auto;display:flex}.QZMXAG_marketSearchGroup .QZMXAG_searchPill{flex:0 260px}.QZMXAG_marketSearchGroup>:last-child{flex:none}.QZMXAG_facetRow{flex-wrap:wrap;flex:320px;gap:6px;min-width:0;display:flex}.QZMXAG_facet{border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border-radius:999px;padding:4px 11px;font-size:11px;line-height:1.5}.QZMXAG_facet:hover{color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-border-l3)}.QZMXAG_facetActive,.QZMXAG_facetActive:hover{background:var(--dsw-alias-label-primary);color:var(--dsw-alias-label-primary-inverted);border-color:#0000}.QZMXAG_facetMark{color:var(--dsw-alias-label-tertiary);border-style:dashed}.QZMXAG_facetMark.QZMXAG_facetActive{color:var(--dsw-alias-label-primary-inverted)}.QZMXAG_facetMore{color:var(--dsw-alias-label-tertiary);border-color:#0000}.QZMXAG_error{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-state-error-primary);border-radius:8px;align-items:flex-start;gap:6px;margin:0;padding:10px 12px;font-size:12px;line-height:1.6;display:flex}.QZMXAG_dismiss{color:color-mix(in oklab, var(--dsw-alias-label-primary-inverted) 60%, transparent);cursor:pointer;background:0 0;border:none;flex-shrink:0;padding:0;font-size:12px}.QZMXAG_dismiss:hover{color:var(--dsw-alias-label-primary-inverted)}.QZMXAG_form{flex-direction:column;gap:16px;display:flex}.QZMXAG_dialogFooter{justify-content:flex-end;gap:8px;display:flex}.QZMXAG_detail{flex:1;align-items:flex-start;gap:28px;min-height:0;padding:4px 28px 32px;display:flex;overflow-y:auto}.QZMXAG_detailMain{flex-direction:column;flex:1;gap:14px;min-width:0;display:flex}.QZMXAG_detailAside{flex-direction:column;flex-shrink:0;gap:12px;width:280px;display:flex;position:sticky;top:4px}@media (width<=1020px){.QZMXAG_detail{flex-direction:column}.QZMXAG_detailAside{width:100%;position:static}}.QZMXAG_detailBadges{flex-wrap:wrap;align-items:center;gap:8px;display:flex}.QZMXAG_detailTitle{color:var(--dsw-alias-label-primary);word-break:break-word;margin:0;font-size:24px;font-weight:600;line-height:1.35}.QZMXAG_metaChip{border:1px solid var(--dsw-alias-border-l1);max-width:100%;color:var(--dsw-alias-label-secondary);border-radius:999px;align-self:flex-start;align-items:center;gap:6px;padding:4px 12px 4px 6px;font-size:12px;display:inline-flex}.QZMXAG_metaChipMark{background:var(--dsw-alias-interactive-bg-active);border-radius:999px;justify-content:center;align-items:center;width:20px;height:20px;display:inline-flex}.QZMXAG_detailDesc{color:var(--dsw-alias-label-secondary);word-break:break-word;margin:0;font-size:14px;line-height:1.75}.QZMXAG_chipRow{flex-wrap:wrap;gap:6px;display:flex}.QZMXAG_chip{border:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-secondary);border-radius:999px;padding:3px 10px;font-size:11px}.QZMXAG_subTabs{border-bottom:1px solid var(--dsw-alias-border-l1);gap:4px;margin-top:4px;display:flex}.QZMXAG_subTab{color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:none;border-bottom:2px solid #0000;padding:6px 12px 8px;font-size:12px}.QZMXAG_subTab:hover{color:var(--dsw-alias-label-primary)}.QZMXAG_subTabActive,.QZMXAG_subTabActive:hover{color:var(--dsw-alias-label-primary);border-bottom-color:var(--dsw-alias-label-primary)}.QZMXAG_factCard{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);border-radius:12px;flex-direction:column;padding:4px 16px;display:flex}.QZMXAG_factRow{justify-content:space-between;align-items:baseline;gap:12px;padding:11px 0;font-size:12px;display:flex}.QZMXAG_factRow+.QZMXAG_factRow{border-top:1px solid var(--dsw-alias-border-l1)}.QZMXAG_factLabel{color:var(--dsw-alias-label-tertiary);flex-shrink:0}.QZMXAG_factValue{min-width:0;color:var(--dsw-alias-label-primary);text-align:right;word-break:break-all;font-weight:500}.QZMXAG_factMono{font-family:var(--ds-font-family-code,monospace);font-size:11px;font-weight:400;line-height:1.6}.QZMXAG_factBlock{flex-direction:column;gap:8px;padding:12px 0;display:flex}.QZMXAG_factBlock+.QZMXAG_factBlock,.QZMXAG_factRow+.QZMXAG_factBlock,.QZMXAG_factBlock+.QZMXAG_factRow{border-top:1px solid var(--dsw-alias-border-l1)}.QZMXAG_factTitle{color:var(--dsw-alias-label-tertiary);font-size:12px}.QZMXAG_asideActions{flex-direction:column;gap:8px;display:flex}.QZMXAG_asideActions>*{width:100%}.QZMXAG_tree{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);border-radius:10px;margin-top:8px;overflow:hidden}.QZMXAG_treeHead{border-bottom:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary);align-items:center;gap:8px;padding:9px 14px;font-size:12px;font-weight:500;display:flex}.QZMXAG_treeHeadMark{color:var(--dsw-alias-label-tertiary);display:inline-flex}.QZMXAG_treeCount{background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums;border-radius:999px;margin-left:auto;padding:1px 8px;font-size:11px;font-weight:400}.QZMXAG_treeBody{margin:0;padding:0;list-style:none}.QZMXAG_treeRow{width:100%;color:var(--dsw-alias-label-secondary);font-family:var(--ds-font-family-code,monospace);text-align:left;background:0 0;border:none;align-items:center;gap:8px;padding:6px 14px 6px 12px;font-size:12px;line-height:1.6;display:flex}.QZMXAG_treeDir{color:var(--dsw-alias-label-primary);cursor:pointer}.QZMXAG_treeDir:hover{background:var(--dsw-alias-interactive-bg-hover)}.QZMXAG_treeTwisty{width:12px;color:var(--dsw-alias-label-tertiary);flex-shrink:0;justify-content:center;align-items:center;display:inline-flex}.QZMXAG_treeMark{color:var(--dsw-alias-label-tertiary);flex-shrink:0;display:inline-flex}.QZMXAG_treeName{text-overflow:ellipsis;white-space:nowrap;flex:auto;min-width:0;overflow:hidden}.QZMXAG_treeSize{color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums;flex-shrink:0;font-size:11px}.QZMXAG_docBar{gap:2px;margin-bottom:6px;display:flex}.QZMXAG_docToggle{color:var(--dsw-alias-label-tertiary);cursor:pointer;background:0 0;border:none;border-radius:6px;padding:3px 10px;font-size:11px}.QZMXAG_docToggle:hover{color:var(--dsw-alias-label-primary)}.QZMXAG_docToggleActive,.QZMXAG_docToggleActive:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}.QZMXAG_markdown{max-width:100%;padding:2px 0;font-size:13px;overflow-x:auto}.QZMXAG_markdown img{max-width:100%;height:auto}.QZMXAG_markdown table{max-width:100%;display:block;overflow-x:auto}.QZMXAG_markdownClipped{max-height:520px;position:relative;overflow:hidden}.QZMXAG_markdownClipped:after{content:\"\";pointer-events:none;background:linear-gradient(to top, var(--dsw-alias-bg-layer-1), transparent);height:80px;position:absolute;inset:auto 0 0}.QZMXAG_docMore{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-secondary);cursor:pointer;border-radius:999px;align-self:flex-start;align-items:center;gap:6px;margin-top:8px;padding:5px 12px;font-size:12px;display:inline-flex}.QZMXAG_docMore:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}.QZMXAG_previewCard{width:min(880px,92vw)}.QZMXAG_previewCode{max-height:60vh;overflow:auto}.QZMXAG_drop{border:1px dashed var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);width:100%;color:var(--dsw-alias-label-secondary);text-align:center;cursor:pointer;border-radius:12px;flex-direction:column;align-items:center;gap:8px;padding:26px 20px;font-size:13px;display:flex}.QZMXAG_drop:hover,.QZMXAG_dropOver{border-color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}.QZMXAG_dropHint{color:var(--dsw-alias-label-tertiary);font-size:11px}.QZMXAG_picked{border:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-primary);border-radius:8px;justify-content:space-between;align-items:center;gap:12px;padding:10px 12px;font-size:12px;display:flex}.QZMXAG_pickedName{text-overflow:ellipsis;white-space:nowrap;min-width:0;font-family:var(--ds-font-family-code,monospace);overflow:hidden}.QZMXAG_pickedSize{color:var(--dsw-alias-label-tertiary);flex-shrink:0}.QZMXAG_scanRow{text-align:left;background:0 0;border:none;align-items:flex-start;gap:10px;width:100%;padding:10px 12px;display:flex}.QZMXAG_scanRowOpen{cursor:pointer}.QZMXAG_scanRowOpen:hover{background:var(--dsw-alias-interactive-bg-hover)}.QZMXAG_scanSeverity{width:44px;color:var(--dsw-alias-label-tertiary);flex-shrink:0;padding-top:1px;font-size:11px;line-height:1.6}.QZMXAG_scanCRITICAL,.QZMXAG_scanHIGH{color:var(--dsw-alias-state-error-primary)}.QZMXAG_scanBody{flex-direction:column;gap:4px;min-width:0;display:flex}.QZMXAG_scanWhat{color:var(--dsw-alias-label-primary);font-size:12px;line-height:1.6}.QZMXAG_scanWhere{color:var(--dsw-alias-label-tertiary);flex-wrap:wrap;align-items:center;gap:10px;font-size:11px;display:flex}.QZMXAG_scanPath{font-family:var(--ds-font-family-code,monospace);color:var(--dsw-alias-label-secondary)}.QZMXAG_scanRule{font-family:var(--ds-font-family-code,monospace)}.QZMXAG_scanNote{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-tertiary);border-radius:8px;margin:0;padding:10px 12px;font-size:11px;line-height:1.7}.QZMXAG_report{flex-direction:column;gap:12px;max-width:960px;display:flex}.QZMXAG_reportHead{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);border-radius:10px;align-items:center;gap:10px;padding:14px 16px;display:flex}.QZMXAG_reportMark{background:var(--dsw-alias-interactive-bg-active);width:28px;height:28px;color:var(--dsw-alias-label-secondary);border-radius:8px;flex-shrink:0;justify-content:center;align-items:center;display:flex}.QZMXAG_reportTitle{color:var(--dsw-alias-label-primary);margin:0;font-size:15px;font-weight:600}.QZMXAG_reportEngine{color:var(--dsw-alias-label-tertiary);margin-left:auto;font-size:11px}.QZMXAG_reportTop{grid-template-columns:260px minmax(0,1fr);gap:12px;display:grid}@media (width<=900px){.QZMXAG_reportTop{grid-template-columns:minmax(0,1fr)}}.QZMXAG_scoreCard{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);border-radius:10px;flex-direction:column;align-items:center;gap:12px;padding:18px 16px;display:flex}.QZMXAG_scoreLabel{color:var(--dsw-alias-label-tertiary);align-self:flex-start;font-size:12px}.QZMXAG_ring{width:128px;height:128px}.QZMXAG_ringTrack{fill:none;stroke:var(--dsw-alias-interactive-bg-active);stroke-width:10px}.QZMXAG_ringFill{fill:none;stroke:var(--dsw-alias-state-warn-label);stroke-width:10px;stroke-linecap:round}.QZMXAG_ringFillClean{stroke:var(--dsw-alias-state-success-primary,#0b0)}.QZMXAG_ringText{fill:var(--dsw-alias-label-primary);text-anchor:middle;dominant-baseline:central;font-size:34px;font-weight:600}.QZMXAG_ringTextClean{fill:var(--dsw-alias-state-success-primary,#0b0)}.QZMXAG_scoreFacts{flex-direction:column;gap:8px;width:100%;margin:0;display:flex}.QZMXAG_scoreFact{border-top:1px solid var(--dsw-alias-border-l1);justify-content:space-between;align-items:center;gap:12px;padding-top:8px;font-size:12px;display:flex}.QZMXAG_scoreFact dt{color:var(--dsw-alias-label-tertiary)}.QZMXAG_scoreFact dd{color:var(--dsw-alias-label-primary);margin:0}.QZMXAG_verdict{color:var(--dsw-alias-state-warn-label)}.QZMXAG_verdictClean{color:var(--dsw-alias-state-success-primary,#0b0)}.QZMXAG_reportRight{flex-direction:column;gap:12px;min-width:0;display:flex}.QZMXAG_tiles{grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px;display:grid}.QZMXAG_tile{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);border-radius:10px;flex-direction:column;gap:6px;padding:14px 16px;display:flex}.QZMXAG_tileLabel{color:var(--dsw-alias-label-tertiary);font-size:12px}.QZMXAG_tileValue{color:var(--dsw-alias-label-primary);font-size:26px;font-weight:600;line-height:1.2}.QZMXAG_tileFoot{color:var(--dsw-alias-label-tertiary);font-size:11px}.QZMXAG_tileWarn .QZMXAG_tileValue,.QZMXAG_tileMild .QZMXAG_tileValue{color:var(--dsw-alias-state-warn-label)}.QZMXAG_summaryCard{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);border-radius:10px;flex-direction:column;gap:8px;padding:14px 16px;display:flex}.QZMXAG_summaryTitle,.QZMXAG_sectionTitle{color:var(--dsw-alias-label-primary);margin:0;font-size:13px;font-weight:600}.QZMXAG_summaryBody{border-left:3px solid var(--dsw-alias-state-warn-label);background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary);border-radius:0 8px 8px 0;margin:0;padding:10px 12px;font-size:12px;line-height:1.7}.QZMXAG_summaryBodyClean{border-left-color:var(--dsw-alias-state-success-primary,#0b0)}.QZMXAG_facesCard{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);border-radius:10px;flex-direction:column;gap:12px;padding:14px 16px;display:flex}.QZMXAG_faces{grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;margin:0;padding:0;list-style:none;display:grid}.QZMXAG_face{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-interactive-bg-hover);border-radius:8px;flex-direction:column;gap:4px;padding:10px 12px;display:flex}.QZMXAG_faceName{color:var(--dsw-alias-label-primary);font-size:12px}.QZMXAG_faceState{color:var(--dsw-alias-label-tertiary);font-size:11px}.QZMXAG_faceHit .QZMXAG_faceState{color:var(--dsw-alias-state-warn-label)}.QZMXAG_faceBlock{border-top:1px solid var(--dsw-alias-border-l1);flex-direction:column;gap:8px;padding-top:12px;display:flex}.QZMXAG_sectionTitle+.QZMXAG_faceBlock{border-top:none;padding-top:0}.QZMXAG_faceHead{align-items:center;gap:8px;display:flex}.QZMXAG_faceBadge{background:var(--dsw-alias-interactive-bg-active);color:var(--dsw-alias-label-tertiary);border-radius:999px;padding:2px 8px;font-size:11px}.QZMXAG_faceBadgeHit{color:var(--dsw-alias-state-warn-label)}.QZMXAG_faceTag{border:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-tertiary);border-radius:999px;padding:2px 8px;font-size:11px}.QZMXAG_faceBlockName{color:var(--dsw-alias-label-primary);font-size:13px;font-weight:600}.QZMXAG_log{border:1px solid var(--dsw-alias-border-l1);border-radius:8px;overflow:hidden}.QZMXAG_logHead{background:var(--dsw-alias-interactive-bg-active);color:var(--dsw-alias-label-tertiary);padding:8px 12px;font-size:11px}.QZMXAG_logQuiet{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-tertiary);margin:0;padding:10px 12px;font-size:12px;line-height:1.6}.QZMXAG_logList{background:var(--dsw-alias-interactive-bg-hover);flex-direction:column;margin:0;padding:0;list-style:none;display:flex}.QZMXAG_logList>li+li{border-top:1px solid var(--dsw-alias-border-l1)}.QZMXAG_configList{flex-direction:column;gap:12px;margin:0;padding:0;list-style:none;display:flex}.QZMXAG_configCard{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);border-radius:10px;flex-direction:column;gap:14px;padding:16px 18px;display:flex}.QZMXAG_configRow{grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;display:grid}.QZMXAG_configActions{justify-content:flex-end;display:flex}.QZMXAG_configFooter{justify-content:space-between;align-items:center;gap:12px;margin-top:4px;display:flex}.QZMXAG_configSave{align-items:center;gap:10px;display:flex}.QZMXAG_configSaved{color:var(--dsw-alias-state-success-primary,#0b0);font-size:12px}.QZMXAG_securityCard{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);border-radius:12px;align-items:flex-start;gap:12px;padding:14px 16px;display:flex}.QZMXAG_securityMark{color:var(--dsw-alias-label-tertiary);flex-shrink:0;margin-top:1px}.QZMXAG_securityText{flex-direction:column;gap:3px;min-width:0;display:flex}.QZMXAG_securityTitle{color:var(--dsw-alias-label-primary);font-size:13px;font-weight:500}.QZMXAG_securityUnknown{color:var(--dsw-alias-label-secondary);font-weight:400}.QZMXAG_securityNote{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:1.55}.QZMXAG_statGrid{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-border-l1);border-radius:12px;grid-template-columns:repeat(3,1fr);gap:1px;display:grid;overflow:hidden}.QZMXAG_stat{background:var(--dsw-alias-bg-layer-1);flex-direction:column;gap:3px;padding:12px 14px;display:flex}.QZMXAG_statValue{color:var(--dsw-alias-label-primary);font-family:var(--ds-font-family-code,monospace);font-size:16px}.QZMXAG_statLabel{color:var(--dsw-alias-label-tertiary);font-size:11px}.QZMXAG_modeList{flex-direction:column;gap:8px;display:flex}.QZMXAG_mode{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);text-align:left;cursor:pointer;border-radius:12px;align-items:center;gap:12px;width:100%;padding:12px 14px;transition:border-color .12s,background .12s;display:flex}.QZMXAG_mode:hover{border-color:var(--dsw-alias-border-l3)}.QZMXAG_modeActive{border-color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}.QZMXAG_modeMark{color:var(--dsw-alias-label-secondary);flex-shrink:0;display:flex}.QZMXAG_modeText{flex-direction:column;flex:1;gap:2px;min-width:0;display:flex}.QZMXAG_modeLabel{color:var(--dsw-alias-label-primary);font-size:13px}.QZMXAG_modeNote{color:var(--dsw-alias-label-tertiary);font-size:12px}.QZMXAG_modeCheck{border:1px solid var(--dsw-alias-border-l2);border-radius:50%;flex-shrink:0;justify-content:center;align-items:center;width:18px;height:18px;display:flex}.QZMXAG_modeCheckOn{background:var(--dsw-alias-label-primary);color:var(--dsw-alias-label-primary-inverted);border-color:#0000}.QZMXAG_modeInput{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);width:100%;color:var(--dsw-alias-label-primary);font-family:var(--ds-font-family-code,monospace);border-radius:10px;outline:none;padding:11px 14px;font-size:12px}.QZMXAG_modeInput:focus{border-color:var(--dsw-alias-border-l3)}.QZMXAG_modeInput::placeholder{color:var(--dsw-alias-label-tertiary)}.QZMXAG_toasts{z-index:5;flex-direction:column;gap:8px;max-width:min(440px,100% - 56px);display:flex;position:absolute;bottom:24px;left:28px}.QZMXAG_toast{background:var(--dsw-alias-label-primary);color:var(--dsw-alias-label-primary-inverted);border-radius:13px;align-items:flex-start;gap:12px;padding:14px 16px;animation:.18s cubic-bezier(.22,1,.36,1) QZMXAG_toastRise;display:flex;box-shadow:0 16px 40px #0000003d}@keyframes QZMXAG_toastRise{0%{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}@media (prefers-reduced-motion:reduce){.QZMXAG_toast{animation:none}}.QZMXAG_toastMark{opacity:.75;flex-shrink:0;margin-top:1px}.QZMXAG_toastBad .QZMXAG_toastMark,.QZMXAG_toastWarn .QZMXAG_toastMark{opacity:1}.QZMXAG_toastText{flex-direction:column;flex:1;gap:3px;min-width:0;display:flex}.QZMXAG_toastTitle{font-size:13px;font-weight:500}.QZMXAG_toastBody{color:color-mix(in oklab, var(--dsw-alias-label-primary-inverted) 66%, transparent);overflow-wrap:anywhere;font-size:12px;line-height:1.55}";
		const tagId$1 = "@staff-os/dsh-workbench/SkillSection.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$1) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@staff-os/dsh-workbench";
			tag.dataset.pluginCss = tagId$1;
			tag.textContent = css$1;
			document.head.appendChild(tag);
		}
		var SkillSection_module_css_default = {
			"cardStatusOff": "QZMXAG_cardStatusOff",
			"check": "QZMXAG_check",
			"tabs": "QZMXAG_tabs",
			"detailBadges": "QZMXAG_detailBadges",
			"previewCode": "QZMXAG_previewCode",
			"facesCard": "QZMXAG_facesCard",
			"faceTag": "QZMXAG_faceTag",
			"securityMark": "QZMXAG_securityMark",
			"securityText": "QZMXAG_securityText",
			"securityUnknown": "QZMXAG_securityUnknown",
			"treeDir": "QZMXAG_treeDir",
			"pickedName": "QZMXAG_pickedName",
			"scoreFact": "QZMXAG_scoreFact",
			"face": "QZMXAG_face",
			"tileLabel": "QZMXAG_tileLabel",
			"configRow": "QZMXAG_configRow",
			"marketBar": "QZMXAG_marketBar",
			"faceBlockName": "QZMXAG_faceBlockName",
			"marketSearchGroup": "QZMXAG_marketSearchGroup",
			"subTabs": "QZMXAG_subTabs",
			"summaryTitle": "QZMXAG_summaryTitle",
			"glyph2": "QZMXAG_glyph2",
			"configList": "QZMXAG_configList",
			"row": "QZMXAG_row",
			"treeName": "QZMXAG_treeName",
			"registryPill": "QZMXAG_registryPill",
			"logList": "QZMXAG_logList",
			"scanCRITICAL": "QZMXAG_scanCRITICAL",
			"factRow": "QZMXAG_factRow",
			"securityTitle": "QZMXAG_securityTitle",
			"facetActive": "QZMXAG_facetActive",
			"bannerWarn": "QZMXAG_bannerWarn",
			"previewCard": "QZMXAG_previewCard",
			"factCard": "QZMXAG_factCard",
			"glyph3": "QZMXAG_glyph3",
			"detailMain": "QZMXAG_detailMain",
			"treeHead": "QZMXAG_treeHead",
			"rowMain": "QZMXAG_rowMain",
			"tileValue": "QZMXAG_tileValue",
			"toastRise": "QZMXAG_toastRise",
			"rowPath": "QZMXAG_rowPath",
			"section": "QZMXAG_section",
			"factValue": "QZMXAG_factValue",
			"rejected": "QZMXAG_rejected",
			"factTitle": "QZMXAG_factTitle",
			"markdown": "QZMXAG_markdown",
			"rejectedMark": "QZMXAG_rejectedMark",
			"dropHint": "QZMXAG_dropHint",
			"verdict": "QZMXAG_verdict",
			"rowName": "QZMXAG_rowName",
			"chipRow": "QZMXAG_chipRow",
			"configFooter": "QZMXAG_configFooter",
			"facetRow": "QZMXAG_facetRow",
			"stateChipMono": "QZMXAG_stateChipMono",
			"scanSeverity": "QZMXAG_scanSeverity",
			"toastText": "QZMXAG_toastText",
			"stateChip": "QZMXAG_stateChip",
			"facetMark": "QZMXAG_facetMark",
			"detailTitle": "QZMXAG_detailTitle",
			"dismiss": "QZMXAG_dismiss",
			"docBar": "QZMXAG_docBar",
			"faceState": "QZMXAG_faceState",
			"treeCount": "QZMXAG_treeCount",
			"scoreLabel": "QZMXAG_scoreLabel",
			"modeNote": "QZMXAG_modeNote",
			"ringFillClean": "QZMXAG_ringFillClean",
			"headText": "QZMXAG_headText",
			"rejectedRow": "QZMXAG_rejectedRow",
			"ringTrack": "QZMXAG_ringTrack",
			"grid": "QZMXAG_grid",
			"tiles": "QZMXAG_tiles",
			"sectionTitle": "QZMXAG_sectionTitle",
			"rejectedList": "QZMXAG_rejectedList",
			"faceHead": "QZMXAG_faceHead",
			"textarea": "QZMXAG_textarea",
			"summaryBody": "QZMXAG_summaryBody",
			"modeCheckOn": "QZMXAG_modeCheckOn",
			"chip": "QZMXAG_chip",
			"facet": "QZMXAG_facet",
			"tag": "QZMXAG_tag",
			"scanPath": "QZMXAG_scanPath",
			"reportMark": "QZMXAG_reportMark",
			"modeText": "QZMXAG_modeText",
			"scanNote": "QZMXAG_scanNote",
			"form": "QZMXAG_form",
			"logHead": "QZMXAG_logHead",
			"toasts": "QZMXAG_toasts",
			"rowNote": "QZMXAG_rowNote",
			"toastBody": "QZMXAG_toastBody",
			"modeActive": "QZMXAG_modeActive",
			"reportTitle": "QZMXAG_reportTitle",
			"toastBad": "QZMXAG_toastBad",
			"tile": "QZMXAG_tile",
			"configCard": "QZMXAG_configCard",
			"factMono": "QZMXAG_factMono",
			"treeRow": "QZMXAG_treeRow",
			"rejectedPath": "QZMXAG_rejectedPath",
			"field": "QZMXAG_field",
			"metaChip": "QZMXAG_metaChip",
			"faceHit": "QZMXAG_faceHit",
			"cardStatus": "QZMXAG_cardStatus",
			"dialogFooter": "QZMXAG_dialogFooter",
			"value": "QZMXAG_value",
			"cardTag": "QZMXAG_cardTag",
			"treeSize": "QZMXAG_treeSize",
			"markdownClipped": "QZMXAG_markdownClipped",
			"marketCard": "QZMXAG_marketCard",
			"cardSpacer": "QZMXAG_cardSpacer",
			"faceBadge": "QZMXAG_faceBadge",
			"hint": "QZMXAG_hint",
			"faceBadgeHit": "QZMXAG_faceBadgeHit",
			"docToggleActive": "QZMXAG_docToggleActive",
			"searchMark": "QZMXAG_searchMark",
			"scanHIGH": "QZMXAG_scanHIGH",
			"scoreCard": "QZMXAG_scoreCard",
			"detail": "QZMXAG_detail",
			"glyph0": "QZMXAG_glyph0",
			"securityNote": "QZMXAG_securityNote",
			"modeLabel": "QZMXAG_modeLabel",
			"subTabActive": "QZMXAG_subTabActive",
			"reportEngine": "QZMXAG_reportEngine",
			"docToggle": "QZMXAG_docToggle",
			"scanBody": "QZMXAG_scanBody",
			"rowOpen": "QZMXAG_rowOpen",
			"rowSide": "QZMXAG_rowSide",
			"marketCardHead": "QZMXAG_marketCardHead",
			"checkList": "QZMXAG_checkList",
			"reportRight": "QZMXAG_reportRight",
			"badgeWarn": "QZMXAG_badgeWarn",
			"modeMark": "QZMXAG_modeMark",
			"modeCheck": "QZMXAG_modeCheck",
			"glyph": "QZMXAG_glyph",
			"treeBody": "QZMXAG_treeBody",
			"toastWarn": "QZMXAG_toastWarn",
			"subtitle": "QZMXAG_subtitle",
			"tileFoot": "QZMXAG_tileFoot",
			"securityCard": "QZMXAG_securityCard",
			"toastTitle": "QZMXAG_toastTitle",
			"headActions": "QZMXAG_headActions",
			"factBlock": "QZMXAG_factBlock",
			"rowSource": "QZMXAG_rowSource",
			"summaryBodyClean": "QZMXAG_summaryBodyClean",
			"statLabel": "QZMXAG_statLabel",
			"cardStatusOn": "QZMXAG_cardStatusOn",
			"metric": "QZMXAG_metric",
			"searchPill": "QZMXAG_searchPill",
			"banner": "QZMXAG_banner",
			"source": "QZMXAG_source",
			"configSaved": "QZMXAG_configSaved",
			"cardMetrics": "QZMXAG_cardMetrics",
			"faces": "QZMXAG_faces",
			"cardName": "QZMXAG_cardName",
			"rejectedHint": "QZMXAG_rejectedHint",
			"badgeGood": "QZMXAG_badgeGood",
			"tree": "QZMXAG_tree",
			"reportHead": "QZMXAG_reportHead",
			"detailAside": "QZMXAG_detailAside",
			"report": "QZMXAG_report",
			"picked": "QZMXAG_picked",
			"statValue": "QZMXAG_statValue",
			"empty": "QZMXAG_empty",
			"modeInput": "QZMXAG_modeInput",
			"logQuiet": "QZMXAG_logQuiet",
			"configSave": "QZMXAG_configSave",
			"ringText": "QZMXAG_ringText",
			"treeMark": "QZMXAG_treeMark",
			"cardTags": "QZMXAG_cardTags",
			"scanWhere": "QZMXAG_scanWhere",
			"ringTextClean": "QZMXAG_ringTextClean",
			"head": "QZMXAG_head",
			"docMore": "QZMXAG_docMore",
			"faceBlock": "QZMXAG_faceBlock",
			"back": "QZMXAG_back",
			"registryDot": "QZMXAG_registryDot",
			"glyph5": "QZMXAG_glyph5",
			"toastMark": "QZMXAG_toastMark",
			"resultLine": "QZMXAG_resultLine",
			"log": "QZMXAG_log",
			"tagWarn": "QZMXAG_tagWarn",
			"pickedSize": "QZMXAG_pickedSize",
			"verdictClean": "QZMXAG_verdictClean",
			"badge": "QZMXAG_badge",
			"metaChipMark": "QZMXAG_metaChipMark",
			"tileMild": "QZMXAG_tileMild",
			"glyph4": "QZMXAG_glyph4",
			"facetMore": "QZMXAG_facetMore",
			"scanRowOpen": "QZMXAG_scanRowOpen",
			"treeTwisty": "QZMXAG_treeTwisty",
			"drop": "QZMXAG_drop",
			"cardDesc": "QZMXAG_cardDesc",
			"subTab": "QZMXAG_subTab",
			"dropOver": "QZMXAG_dropOver",
			"toolBar": "QZMXAG_toolBar",
			"tabActive": "QZMXAG_tabActive",
			"toolBarActions": "QZMXAG_toolBarActions",
			"summaryCard": "QZMXAG_summaryCard",
			"ringFill": "QZMXAG_ringFill",
			"asideActions": "QZMXAG_asideActions",
			"rejectedTitle": "QZMXAG_rejectedTitle",
			"scanRule": "QZMXAG_scanRule",
			"configActions": "QZMXAG_configActions",
			"reportTop": "QZMXAG_reportTop",
			"ring": "QZMXAG_ring",
			"rowTitle": "QZMXAG_rowTitle",
			"tab": "QZMXAG_tab",
			"statGrid": "QZMXAG_statGrid",
			"glyph1": "QZMXAG_glyph1",
			"stateChipOff": "QZMXAG_stateChipOff",
			"rows": "QZMXAG_rows",
			"glyphSm": "QZMXAG_glyphSm",
			"rejectedMain": "QZMXAG_rejectedMain",
			"searchInput": "QZMXAG_searchInput",
			"stat": "QZMXAG_stat",
			"metricMark": "QZMXAG_metricMark",
			"scoreFacts": "QZMXAG_scoreFacts",
			"faceName": "QZMXAG_faceName",
			"mode": "QZMXAG_mode",
			"tileWarn": "QZMXAG_tileWarn",
			"rejectedName": "QZMXAG_rejectedName",
			"label": "QZMXAG_label",
			"rejectedReason": "QZMXAG_rejectedReason",
			"error": "QZMXAG_error",
			"treeHeadMark": "QZMXAG_treeHeadMark",
			"scanWhat": "QZMXAG_scanWhat",
			"body": "QZMXAG_body",
			"detailDesc": "QZMXAG_detailDesc",
			"title": "QZMXAG_title",
			"scanRow": "QZMXAG_scanRow",
			"toast": "QZMXAG_toast",
			"factLabel": "QZMXAG_factLabel",
			"modeList": "QZMXAG_modeList"
		};
		//#endregion
		//#region src/client/skill/SkillSection.tsx
		/**
		* 技能域的维护界面：本机清单 ⇄ 详情，外加一页技能市场。
		*
		* 形态与员工域一致——列表与详情不是弹窗，而是内联覆盖，顶部一条「返回列表」
		* 回去。本机与市场之间用一组分段控件切，因为它们是同一件事的两个来源，不是
		* 两个域。
		*
		* 详情页是**两栏**：左边「这是什么」（标题、描述、标签、正文/文件两个页签），
		* 右边「它现在什么状态」（事实卡与操作）。本机技能与市场条目共用这一套版式，
		* 因为它们讲的是同一种东西，换一栏看就得重新找一遍。
		*
		* 这一域有三件事界面必须照实说，不能糊过去：
		*
		* - **被遮蔽的技能**：盘上有、但同名的更高优先级来源盖住了它。改它不会有任何
		*   效果，所以详情页顶上是一条明确的横幅，而不是一个小角标。
		* - **被拒收的文件**：盘上有、但 DSH 因为 frontmatter 不合规整份丢弃。它不会
		*   出现在任何会话里，而 DSH 那边只有一行日志——不在这里说，就没有别处会说。
		* - **写完之后到底生没生效**：不是「重启后生效」（那句话是错的，写完下一个
		*   模型回合就生效），而是回读 `ctx.skills` 得到的真实结论。没生效时那句结论
		*   要显著显示，因为它意味着刚才那下白做了。
		*
		* @module @staff-os/dsh-workbench/client/skill/SkillSection
		*/
		/**
		* 画技能域。
		* @param props - 数据层与翻译函数。
		* @returns 列表、详情或市场。
		*/
		function SkillSection({ data, t }) {
			const state = useStore(data.store);
			const [tab, setTab] = (0, react.useState)("local");
			const [viewing, setViewing] = (0, react.useState)(void 0);
			(0, react.useEffect)(() => {
				data.refresh();
				data.checkUpdates();
			}, [data]);
			const skills = state.snapshot?.skills ?? [];
			const current = viewing?.kind === "local" ? skills.find((skill) => skill.name === viewing.name) : void 0;
			(0, react.useEffect)(() => {
				if (viewing?.kind === "local" && state.snapshot !== void 0 && current === void 0) setViewing(void 0);
			}, [
				viewing,
				state.snapshot,
				current
			]);
			const back = () => {
				setViewing(void 0);
			};
			if (viewing?.kind === "market") return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MarketDetail, {
				slug: viewing.slug,
				registry: viewing.registry,
				data,
				t,
				onBack: back
			});
			if (current !== void 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SkillDetail, {
				skill: current,
				data,
				t,
				onBack: back
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SkillList, {
				data,
				t,
				tab,
				onTab: onTabChange(setTab, setViewing),
				onOpen: setViewing
			});
		}
		/** 换页签时顺手关掉详情，免得从市场详情切回本机还停在那一页。 */
		function onTabChange(setTab, setViewing) {
			return (tab) => {
				setViewing(void 0);
				setTab(tab);
			};
		}
		/**
		* 本机清单、市场与市场配置的外壳：标题行、分段控件、正文。
		*
		* 标题行上只留「新建」与「导入」两个按钮。原先那五个（搜索框、重新读取、
		* 查更新、全部更新、上传、新建）挤成一排，谁也不比谁显眼，而其中大半只跟
		* 本机清单有关——它们现在归到清单自己的工具条上，标题行只回答「从哪来一份
		* 新技能」这一件事。
		*/
		function SkillList({ data, t, tab, onTab, onOpen }) {
			const state = useStore(data.store);
			const [keyword, setKeyword] = (0, react.useState)("");
			const [creating, setCreating] = (0, react.useState)(false);
			const [importing, setImporting] = (0, react.useState)(false);
			const skills = state.snapshot?.skills ?? [];
			const rejected = state.snapshot?.rejected ?? [];
			const statuses = [...state.updates?.values() ?? []];
			const outdated = statuses.filter((status) => status.outdated);
			const unchecked = statuses.filter((status) => status.error !== void 0);
			const needle = keyword.trim().toLowerCase();
			const shown = needle === "" ? skills : skills.filter((skill) => `${skill.name} ${skill.description} ${skill.whenToUse ?? ""}`.toLowerCase().includes(needle));
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: SkillSection_module_css_default.section,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
						className: SkillSection_module_css_default.head,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: SkillSection_module_css_default.headText,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h1", {
								className: SkillSection_module_css_default.title,
								children: t("section.skills")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: SkillSection_module_css_default.subtitle,
								children: t("skill.subtitle")
							})]
						}), tab !== "config" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: SkillSection_module_css_default.headActions,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								variant: "outline",
								size: "sm",
								icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPlusOutline16, { size: 16 }),
								disabled: state.busy,
								onClick: () => {
									setCreating(true);
								},
								children: t("skill.create")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								variant: "primary",
								size: "sm",
								icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconArchiveOutline20, { size: 16 }),
								disabled: state.busy,
								onClick: () => {
									setImporting(true);
								},
								children: t("skill.import")
							})]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: SkillSection_module_css_default.tabs,
						role: "tablist",
						"aria-label": t("section.skills"),
						children: [
							"local",
							"market",
							"config"
						].map((id) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							role: "tab",
							"aria-selected": tab === id,
							className: clsx(SkillSection_module_css_default.tab, tab === id && SkillSection_module_css_default.tabActive),
							onClick: () => {
								onTab(id);
							},
							children: t(id === "local" ? "skill.tab.local" : id === "market" ? "skill.tab.market" : "skill.tab.config")
						}, id))
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Notices, {
						data,
						t
					}),
					tab === "market" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MarketPanel, {
						data,
						t,
						onOpen
					}) : tab === "config" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MarketConfigPanel, {
						data,
						t
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: SkillSection_module_css_default.body,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: SkillSection_module_css_default.toolBar,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
									className: SkillSection_module_css_default.searchPill,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSearchOutline16, {
										size: 15,
										className: SkillSection_module_css_default.searchMark
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										className: SkillSection_module_css_default.searchInput,
										value: keyword,
										placeholder: t("skill.search"),
										"aria-label": t("skill.search"),
										onChange: (event) => {
											setKeyword(event.target.value);
										}
									})]
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: SkillSection_module_css_default.toolBarActions,
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
											variant: "outline",
											size: "sm",
											disabled: state.busy,
											icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconRefreshOutline16, { size: 16 }),
											onClick: () => {
												data.refresh();
											},
											children: t("skill.refresh")
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
											variant: "outline",
											size: "sm",
											disabled: state.busy || state.updatesLoading,
											icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconEnhanceOutline16, { size: 16 }),
											onClick: () => {
												data.checkUpdates();
											},
											children: t(state.updatesLoading ? "skill.updates.checking" : "skill.updates.check")
										}),
										outdated.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
											variant: "primary",
											size: "sm",
											icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconRefreshOutline16, { size: 16 }),
											disabled: state.busy,
											onClick: () => {
												data.updateAll();
											},
											children: t("skill.updates.all").replace("{n}", String(outdated.length))
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: SkillSection_module_css_default.resultLine,
								children: localSummary(skills, rejected.length, t)
							}),
							state.snapshot?.hasRegistry === false && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: SkillSection_module_css_default.banner,
								children: t("skill.noRegistry")
							}),
							state.updatesLoading && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: SkillSection_module_css_default.banner,
								children: t("skill.updates.checking")
							}),
							outdated.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
								className: SkillSection_module_css_default.banner,
								children: [
									t("skill.updates.available").replace("{n}", String(outdated.length)),
									"：",
									outdated.map((status) => `${status.name} ${status.installed} → ${status.latest ?? "?"}`).join("、")
								]
							}),
							unchecked.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
								className: SkillSection_module_css_default.banner,
								children: [
									t("skill.updates.unchecked").replace("{n}", String(unchecked.length)),
									"：",
									unchecked.map((status) => `${status.name}（${status.error ?? "?"}）`).join("；")
								]
							}),
							state.loading ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: SkillSection_module_css_default.empty,
								children: t("skill.loading")
							}) : shown.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: SkillSection_module_css_default.empty,
								children: needle === "" ? t("skill.none") : t("skill.noMatch")
							}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
								className: SkillSection_module_css_default.rows,
								children: shown.map((skill) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SkillRow, {
									skill,
									update: state.updates?.get(skill.name),
									busy: state.busy,
									t,
									onOpen: () => {
										onOpen({
											kind: "local",
											name: skill.name
										});
									},
									onUpdate: () => {
										data.update(skill.name);
									}
								}) }, `${skill.source}:${skill.name}`))
							}),
							rejected.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
								className: SkillSection_module_css_default.rejected,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
										className: SkillSection_module_css_default.rejectedTitle,
										children: t("skill.rejected.section")
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
										className: SkillSection_module_css_default.rejectedHint,
										children: t("skill.rejected.sectionHint")
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
										className: SkillSection_module_css_default.rejectedList,
										children: rejected.map((entry) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
											className: SkillSection_module_css_default.rejectedRow,
											children: [
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconWarningOutline16, {
													size: 16,
													className: SkillSection_module_css_default.rejectedMark
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
													className: SkillSection_module_css_default.rejectedMain,
													children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
														className: SkillSection_module_css_default.rejectedName,
														children: entry.hint
													}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
														className: SkillSection_module_css_default.rejectedPath,
														children: entry.path
													})]
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
													className: SkillSection_module_css_default.rejectedReason,
													children: entry.reason
												})
											]
										}, entry.path))
									})
								]
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(CreateDialog, {
						open: creating,
						data,
						t,
						onClose: () => {
							setCreating(false);
						},
						onCreated: (name) => {
							setCreating(false);
							onOpen({
								kind: "local",
								name
							});
						}
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ImportDialog, {
						open: importing,
						data,
						t,
						onClose: () => {
							setImporting(false);
						}
					})
				]
			});
		}
		/**
		* 已装清单顶上那一行数字。
		*
		* 「受本插件管理」数的是用户目录里、且没被遮蔽的那些——只有它们在这个界面上
		* 改得动。项目级与随插件发布的技能照样生效、照样列出来，但它们不归这里管，
		* 混进同一个数里会让人以为界面能改。
		*
		* @param skills - 当前快照里的全部技能。
		* @param rejectedCount - 被 DSH 拒收的文件数。
		* @param t - 翻译函数。
		* @returns 一行用「·」串起来的说明。
		*/
		function localSummary(skills, rejectedCount, t) {
			const managed = skills.filter((skill) => skill.managed && !skill.shadowed).length;
			const shadowed = skills.filter((skill) => skill.shadowed).length;
			return [
				t("skill.local.count").replace("{n}", String(skills.length)),
				t("skill.local.managed").replace("{n}", String(managed)),
				t("skill.local.shadowed").replace("{n}", String(shadowed)),
				t("skill.local.rejectedCount").replace("{n}", String(rejectedCount))
			].join(" · ");
		}
		/** 方牌的配色档数；`glyph0`…`glyph5` 在样式表里。 */
		const TILE_TONES = 6;
		/**
		* 一个名字落在哪一档方牌配色上。
		*
		* 按名字的码点和取模，而不是按它在列表里的下标：同一个技能在市场页与已装
		* 清单里下标不同，按下标算的话同一件东西会换颜色，看着像两个。
		*
		* @param name - 技能名或 slug。
		* @returns `0` 到 `TILE_TONES - 1`。
		*/
		function toneOf(name) {
			let sum = 0;
			for (const ch of name) sum += ch.codePointAt(0) ?? 0;
			return sum % TILE_TONES;
		}
		/**
		* 方牌上那个字。
		*
		* 按码点切而不是 `name[0]`：后者切的是 UTF-16 码元，遇到 emoji 或增补平面的
		* 汉字会切出半个字符，渲染成一个替换符。
		*
		* @param name - 技能名。
		* @returns 头一个字符，拉丁字母转大写。
		*/
		function initialOf(name) {
			return [...name][0]?.toUpperCase() ?? "·";
		}
		/**
		* 已装清单里的一行。
		*
		* 做成横排而不是卡片：这份清单要回答的是「盘上现在有什么、它生没生效、
		* 调不调得到」，这些都是逐项对齐着看的事实，网格卡片会把同一列的事实错开。
		*
		* 一行里从左到右是四件事，顺序就是人查这一页的顺序：**是谁**（方牌与名字）、
		* **在哪**（来源与路径）、**怎么调**（模型可调用 / 斜杠触发两个开关状态）、
		* **要不要动它**（有新版时才出现的更新按钮）。
		*
		* 「已安装 vX」不挂在这里：那个版本号只有**台账里有记录**的技能才有，也就是
		* 从市场装来的那些。手写的技能同样在盘上、同样生效，但它没有上游版本可言，
		* 给它挂一个版本号是无中生有。
		*/
		function SkillRow({ skill, update, busy, t, onOpen, onUpdate }) {
			const outdated = update?.outdated === true;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: SkillSection_module_css_default.row,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: SkillSection_module_css_default.rowOpen,
					"aria-label": skill.name,
					onClick: onOpen,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: clsx(SkillSection_module_css_default.glyph, SkillSection_module_css_default.glyphSm, SkillSection_module_css_default[`glyph${String(toneOf(skill.name))}`]),
						"aria-hidden": "true",
						children: initialOf(skill.name)
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: SkillSection_module_css_default.rowMain,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: SkillSection_module_css_default.rowTitle,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: SkillSection_module_css_default.rowName,
										children: skill.name
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: SkillSection_module_css_default.rowSource,
										children: skill.source
									}),
									skill.shadowed && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
										className: clsx(SkillSection_module_css_default.badge, SkillSection_module_css_default.badgeWarn),
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconWarningOutline16, { size: 12 }), t("skill.tag.shadowed.long")]
									}),
									outdated && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: clsx(SkillSection_module_css_default.badge, SkillSection_module_css_default.badgeGood),
										children: `${t("skill.updates.newer")} v${update?.latest ?? "?"}`
									}),
									!skill.managed && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: SkillSection_module_css_default.badge,
										children: t("skill.tag.readonly")
									})
								]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: SkillSection_module_css_default.rowPath,
								children: skill.path ?? skill.source
							}),
							skill.shadowed && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: SkillSection_module_css_default.rowNote,
								children: t("skill.shadowed.hint").replace("{source}", skill.source)
							})
						]
					})]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: SkillSection_module_css_default.rowSide,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: clsx(SkillSection_module_css_default.stateChip, !skill.modelInvocable && SkillSection_module_css_default.stateChipOff),
							children: t("skill.tag.modelOn")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: clsx(SkillSection_module_css_default.stateChip, SkillSection_module_css_default.stateChipMono, !skill.userInvocable && SkillSection_module_css_default.stateChipOff),
							children: `/${skill.name}`
						}),
						outdated && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: "primary",
							size: "sm",
							disabled: busy,
							onClick: onUpdate,
							children: t("skill.market.update")
						})
					]
				})]
			});
		}
		/** 一个本机技能的详情：正文、文件、可见性与操作。 */
		function SkillDetail({ skill, data, t, onBack }) {
			const state = useStore(data.store);
			const [removing, setRemoving] = (0, react.useState)(false);
			const [tab, setTab] = (0, react.useState)("overview");
			const [detail, setDetail] = (0, react.useState)(void 0);
			const picked = useFilePreview((path) => data.readFile(skill.name, path), [data, skill.name]);
			const scan = useScan(() => data.scan(skill.name), tab === "scan", [data, skill.name]);
			(0, react.useEffect)(() => {
				let live = true;
				setDetail(void 0);
				data.read(skill.name).then((result) => {
					if (live && result !== void 0) setDetail(result);
				});
				return () => {
					live = false;
				};
			}, [data, skill.name]);
			const editable = skill.managed && !skill.shadowed;
			const update = state.updates?.get(skill.name);
			const files = detail?.files;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: SkillSection_module_css_default.section,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Notices, {
						data,
						t
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: SkillSection_module_css_default.detail,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: SkillSection_module_css_default.detailMain,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: SkillSection_module_css_default.back,
									onClick: onBack,
									children: t("skill.back")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: SkillSection_module_css_default.detailBadges,
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Pill, {
											className: clsx(SkillSection_module_css_default.tag),
											children: skill.source
										}),
										skill.shadowed && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Pill, {
											className: clsx(SkillSection_module_css_default.tag, SkillSection_module_css_default.tagWarn),
											children: t("skill.tag.shadowed")
										}),
										!skill.managed && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Pill, {
											className: clsx(SkillSection_module_css_default.tag),
											children: t("skill.tag.readonly")
										}),
										!skill.modelInvocable && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Pill, {
											className: clsx(SkillSection_module_css_default.tag),
											children: t("skill.tag.modelOff")
										}),
										!skill.userInvocable && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Pill, {
											className: clsx(SkillSection_module_css_default.tag),
											children: t("skill.tag.userOff")
										})
									]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h1", {
									className: SkillSection_module_css_default.detailTitle,
									children: skill.name
								}),
								skill.provider !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									className: SkillSection_module_css_default.metaChip,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: SkillSection_module_css_default.metaChipMark,
										"aria-hidden": "true",
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconUserOutline16, { size: 12 })
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("skill.detail.author").replace("{name}", skill.provider) })]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: SkillSection_module_css_default.detailDesc,
									children: skill.description
								}),
								skill.shadowed && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
									className: clsx(SkillSection_module_css_default.banner, SkillSection_module_css_default.bannerWarn),
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconWarningOutline16, { size: 14 }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("skill.shadowed.hint").replace("{source}", skill.source) })]
								}),
								!skill.managed && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: SkillSection_module_css_default.banner,
									children: t("skill.readonly.hint").replace("{source}", skill.source)
								}),
								detail?.note !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: SkillSection_module_css_default.banner,
									children: detail.note
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SubTabs, {
									tabs: [
										["overview", t("skill.tab.overview")],
										["files", `${t("skill.tab.files")}${files === void 0 ? "" : ` (${String(files.length)})`}`],
										["scan", scanTabLabel(scan.report, t)]
									],
									active: tab,
									onPick: setTab
								}),
								tab === "overview" && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [skill.whenToUse !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Field, {
									label: t("skill.field.whenToUse"),
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
										className: SkillSection_module_css_default.value,
										children: skill.whenToUse
									})
								}), detail === void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: SkillSection_module_css_default.empty,
									children: t("skill.detail.loading")
								}) : detail.content.trim() === "" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: SkillSection_module_css_default.empty,
									children: t("skill.detail.noContent")
								}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MarkdownBody, {
									body: detail.content,
									t
								})] }),
								tab === "files" && (files === void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: SkillSection_module_css_default.empty,
									children: t("skill.detail.loading")
								}) : files.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: SkillSection_module_css_default.empty,
									children: t("skill.detail.noFiles")
								}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FileTree, {
									files,
									t,
									onOpen: picked.open
								})),
								tab === "scan" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ScanPanel, {
									report: scan.report,
									loading: scan.loading,
									t,
									onOpen: picked.open
								})
							]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("aside", {
							className: SkillSection_module_css_default.detailAside,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: SkillSection_module_css_default.factCard,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(FactRow, {
										label: t("skill.field.source"),
										children: skill.source
									}),
									skill.provider !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FactRow, {
										label: t("panel.tool"),
										children: skill.provider
									}),
									update !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FactRow, {
										label: t("skill.detail.installedVersion"),
										children: update.installed
									}),
									files !== void 0 && files.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FactRow, {
										label: t("skill.tab.files"),
										children: t("skill.detail.fileCount").replace("{n}", String(files.length))
									}),
									skill.path !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: SkillSection_module_css_default.factBlock,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: SkillSection_module_css_default.factTitle,
											children: t("skill.field.path")
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", {
											className: clsx(SkillSection_module_css_default.factValue, SkillSection_module_css_default.factMono),
											children: skill.path
										})]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: SkillSection_module_css_default.factBlock,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: SkillSection_module_css_default.factTitle,
											children: t("skill.visibility")
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("ul", {
											className: SkillSection_module_css_default.checkList,
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
												className: SkillSection_module_css_default.check,
												children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
													type: "checkbox",
													checked: skill.modelInvocable,
													disabled: !editable || state.busy,
													onChange: () => {
														data.visibility(skill.name, { modelInvocable: !skill.modelInvocable });
													}
												}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("skill.visibility.model") })]
											}) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
												className: SkillSection_module_css_default.check,
												children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
													type: "checkbox",
													checked: skill.userInvocable,
													disabled: !editable || state.busy,
													onChange: () => {
														data.visibility(skill.name, { userInvocable: !skill.userInvocable });
													}
												}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("skill.visibility.user") })]
											}) })]
										})]
									})
								]
							}), skill.managed && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: SkillSection_module_css_default.factCard,
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: SkillSection_module_css_default.factBlock,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: SkillSection_module_css_default.factTitle,
										children: t("skill.detail.actions")
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: SkillSection_module_css_default.asideActions,
										children: [update !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
											variant: update.outdated ? "primary" : "outline",
											size: "sm",
											icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconRefreshOutline16, { size: 16 }),
											disabled: state.busy || !update.outdated,
											onClick: () => {
												data.update(skill.name);
											},
											children: update.outdated ? `${t("skill.market.update")} → ${update.latest ?? ""}` : t("skill.market.upToDate")
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
											variant: "outline",
											size: "sm",
											icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconTrashOutline16, { size: 16 }),
											disabled: state.busy,
											onClick: () => {
												setRemoving(true);
											},
											children: t("skill.delete")
										})]
									})]
								})
							})]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(FilePreview, {
						path: picked.path,
						content: picked.content,
						loading: picked.loading,
						t,
						onClose: picked.close
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
						open: removing,
						title: t("skill.delete.title"),
						description: t("skill.delete.hint").replace("{name}", skill.name),
						closeLabel: t("skill.cancel"),
						onClose: () => {
							setRemoving(false);
						},
						footer: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: SkillSection_module_css_default.dialogFooter,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								variant: "ghost",
								onClick: () => {
									setRemoving(false);
								},
								children: t("skill.cancel")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								variant: "primary",
								disabled: state.busy,
								onClick: () => {
									data.remove(skill.name).then((ok) => {
										if (ok) {
											setRemoving(false);
											onBack();
										}
									});
								},
								children: t("skill.delete")
							})]
						})
					})
				]
			});
		}
		/**
		* 一个市场条目的详情。与本机详情同一套版式与同一组页签，但只读，右边那栏是安装。
		*
		* 「概览」与「文件」的内容来自**把包取回来**，而不是市场的某个目录接口：
		* 这样看到的正文与文件就是装上去会得到的那一份。取不到时两个页签都照实说
		* 为什么，而不是留一片空白——见 `skill/remote.ts` 的 `marketPreview`。
		*/
		function MarketDetail({ slug, registry, data, t, onBack }) {
			const state = useStore(data.store);
			const [item, setItem] = (0, react.useState)(void 0);
			const [tab, setTab] = (0, react.useState)("overview");
			const [preview, setPreview] = (0, react.useState)(void 0);
			(0, react.useEffect)(() => {
				let live = true;
				setItem(void 0);
				data.marketGet(slug, registry).then((result) => {
					if (live && result !== void 0) setItem(result);
				});
				return () => {
					live = false;
				};
			}, [
				data,
				slug,
				registry
			]);
			const version = item?.version;
			const owner = item?.owner;
			const installable = item?.installable;
			(0, react.useEffect)(() => {
				if (item === void 0) return void 0;
				let live = true;
				setPreview(void 0);
				if (installable === false) return () => {
					live = false;
				};
				data.marketPreview(slug, version, registry, owner).then((result) => {
					if (live && result !== void 0) setPreview(result);
				});
				return () => {
					live = false;
				};
			}, [
				data,
				slug,
				registry,
				item,
				version,
				owner,
				installable
			]);
			const installed = new Set((state.snapshot?.skills ?? []).map((skill) => skill.name));
			const install = item === void 0 ? void 0 : installOf(item, installed, state.updates);
			const taken = install?.taken === true;
			const status = install?.status;
			const foreign = item !== void 0 && !item.installable;
			const files = preview?.files ?? [];
			const picked = useFilePreview((path) => data.marketFile(slug, version, registry, owner, path), [
				data,
				slug,
				version,
				registry,
				owner
			]);
			const scan = useScan(() => data.marketScan(slug, version, registry, owner), tab === "scan" && !foreign, [
				data,
				slug,
				version,
				registry,
				owner
			]);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: SkillSection_module_css_default.section,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Notices, {
						data,
						t
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: SkillSection_module_css_default.detail,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: SkillSection_module_css_default.detailMain,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: SkillSection_module_css_default.back,
									onClick: onBack,
									children: t("skill.back")
								}),
								state.marketError !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ErrorLine, { text: state.marketError }),
								item === void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: SkillSection_module_css_default.empty,
									children: t("skill.detail.loading")
								}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: SkillSection_module_css_default.detailBadges,
										children: [
											item.version !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Pill, {
												className: clsx(SkillSection_module_css_default.tag),
												children: `v${item.version}`
											}),
											status !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Pill, {
												className: clsx(SkillSection_module_css_default.tag),
												children: `${t("skill.installed")} v${status.installed}`
											}),
											status?.outdated === true && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Pill, {
												className: clsx(SkillSection_module_css_default.tag, SkillSection_module_css_default.tagWarn),
												children: `${t("skill.updates.newer")} v${status.latest ?? "?"}`
											}),
											status === void 0 && taken && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Pill, {
												className: clsx(SkillSection_module_css_default.tag, SkillSection_module_css_default.tagWarn),
												children: t("skill.market.sameName")
											})
										]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h1", {
										className: SkillSection_module_css_default.detailTitle,
										children: item.name
									}),
									item.owner !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
										className: SkillSection_module_css_default.metaChip,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: SkillSection_module_css_default.metaChipMark,
											"aria-hidden": "true",
											children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconUserOutline16, { size: 12 })
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("skill.detail.owner").replace("{name}", item.owner) })]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
										className: SkillSection_module_css_default.detailDesc,
										children: item.description ?? item.name
									}),
									item.tags.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										className: SkillSection_module_css_default.chipRow,
										children: item.tags.map((tag) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: SkillSection_module_css_default.chip,
											children: tag
										}, tag))
									}),
									foreign && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
										className: SkillSection_module_css_default.banner,
										children: t("skill.market.foreign").replace("{kind}", item.installKind ?? "外部")
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SubTabs, {
										tabs: [
											["overview", t("skill.tab.overview")],
											["files", `${t("skill.tab.files")}${files.length === 0 ? "" : ` (${String(files.length)})`}`],
											["scan", scanTabLabel(scan.report, t)]
										],
										active: tab,
										onPick: setTab
									}),
									tab === "overview" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PreviewBody, {
										preview,
										foreign,
										t,
										fallback: t("skill.detail.noContent"),
										children: preview === void 0 || (preview.content ?? "").trim() === "" ? void 0 : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MarkdownBody, {
											body: preview.content ?? "",
											t
										})
									}),
									tab === "files" && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PreviewBody, {
										preview,
										foreign,
										t,
										fallback: t("skill.market.preview.noFiles"),
										children: files.length === 0 ? void 0 : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FileTree, {
											files,
											t,
											onOpen: picked.open
										})
									}),
									tab === "scan" && (foreign ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
										className: SkillSection_module_css_default.empty,
										children: t("skill.market.preview.foreign")
									}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ScanPanel, {
										report: scan.report,
										loading: scan.loading,
										t,
										onOpen: picked.open
									}))
								] })
							]
						}), item !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("aside", {
							className: SkillSection_module_css_default.detailAside,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: SkillSection_module_css_default.securityCard,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconShieldOutline16, {
										size: 17,
										className: SkillSection_module_css_default.securityMark
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: SkillSection_module_css_default.securityText,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: clsx(SkillSection_module_css_default.securityTitle, item.securityStatus === void 0 && SkillSection_module_css_default.securityUnknown),
											children: item.securityStatus ?? t("skill.market.security.unknown")
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: SkillSection_module_css_default.securityNote,
											children: t(item.securityStatus === void 0 ? "skill.market.security.unknownNote" : "skill.market.security.note")
										})]
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: SkillSection_module_css_default.factCard,
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: SkillSection_module_css_default.factBlock,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: SkillSection_module_css_default.factTitle,
											children: t("skill.detail.actions")
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: SkillSection_module_css_default.asideActions,
											children: [
												status?.outdated === true && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
													variant: "primary",
													size: "sm",
													icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconRefreshOutline16, { size: 16 }),
													disabled: state.busy,
													onClick: () => {
														data.update(status.name);
													},
													children: `${t("skill.market.update")} → v${status.latest ?? "?"}`
												}),
												/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
													variant: taken || status !== void 0 ? "outline" : "primary",
													size: "sm",
													disabled: state.busy || foreign,
													onClick: () => {
														data.install(item.slug, item.version, item.registry, taken, item.owner);
													},
													children: t(taken ? "skill.market.overwrite" : "skill.market.install")
												}),
												item.homepage !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
													variant: "outline",
													size: "sm",
													icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconRightUpOutline14, { size: 14 }),
													onClick: () => {
														window.open(item.homepage, "_blank", "noopener,noreferrer");
													},
													children: t("skill.detail.homepage")
												})
											]
										})]
									})
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: SkillSection_module_css_default.statGrid,
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: SkillSection_module_css_default.stat,
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: SkillSection_module_css_default.statValue,
												children: formatCount(item.downloadCount)
											}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: SkillSection_module_css_default.statLabel,
												children: t("skill.market.downloadCount")
											})]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: SkillSection_module_css_default.stat,
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: SkillSection_module_css_default.statValue,
												children: item.avgRating > 0 ? item.avgRating.toFixed(1) : "—"
											}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: SkillSection_module_css_default.statLabel,
												children: t("skill.market.rating")
											})]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: SkillSection_module_css_default.stat,
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: SkillSection_module_css_default.statValue,
												children: item.stars > 0 ? formatCount(item.stars) : "—"
											}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: SkillSection_module_css_default.statLabel,
												children: t("skill.market.starCount")
											})]
										})
									]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: SkillSection_module_css_default.factCard,
									children: [
										item.version !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FactRow, {
											label: t("skill.market.version"),
											children: `v${item.version}`
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)(FactRow, {
											label: t("skill.detail.registry"),
											children: item.registryName
										}),
										item.owner !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FactRow, {
											label: t("skill.market.owner"),
											children: item.owner
										}),
										item.installKind !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FactRow, {
											label: t("skill.market.installKind"),
											children: item.installKind
										}),
										item.installCount > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FactRow, {
											label: t("skill.market.installCount"),
											children: formatCount(item.installCount)
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: SkillSection_module_css_default.factBlock,
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: SkillSection_module_css_default.factTitle,
												children: t("skill.market.install")
											}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", {
												className: clsx(SkillSection_module_css_default.factValue, SkillSection_module_css_default.factMono),
												children: item.owner === void 0 ? item.slug : `${item.owner}/${item.slug}`
											})]
										})
									]
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(FilePreview, {
						path: picked.path,
						content: picked.content,
						loading: picked.loading,
						t,
						onClose: picked.close
					})
				]
			});
		}
		/** 市场页：浏览、筛选与挑一条看详情。 */
		function MarketPanel({ data, t, onOpen }) {
			const state = useStore(data.store);
			const [keyword, setKeyword] = (0, react.useState)("");
			/**
			* 上一次真正发给市场的那个关键词。
			*
			* 与 `keyword` 分开记，因为排序要看它：留空浏览时这一页按下载量重排（热门
			* 的在前，这也是人打开市场首页想看到的），而带关键词搜出来的那一批得保持
			* 市场给的次序——那是相关度，按下载量重排会把最贴题的一条压到第二屏去。
			*/
			const [submitted, setSubmitted] = (0, react.useState)("");
			const [picked, setPicked] = (0, react.useState)(void 0);
			const [label, setLabel] = (0, react.useState)(void 0);
			const [expanded, setExpanded] = (0, react.useState)(false);
			const autoloaded = (0, react.useRef)(false);
			const registries = state.snapshot?.registries ?? [];
			const installed = new Set((state.snapshot?.skills ?? []).map((skill) => skill.name));
			const items = state.market?.items;
			const facets = (0, react.useMemo)(() => countFacets(items ?? []), [items]);
			const active = facets.some((facet) => facet.key === picked) ? picked : void 0;
			const filtered = active === void 0 ? items ?? [] : (items ?? []).filter((item) => facetsOf(item).some((one) => normalizeLabel(one) === active));
			const byDownloads = submitted === "";
			const shown = byDownloads ? [...filtered].sort((a, b) => b.downloadCount - a.downloadCount) : filtered;
			const labels = state.labels ?? [];
			const run = (next) => {
				setSubmitted(keyword.trim());
				data.search(keyword, void 0, void 0, next?.slug, next?.registry);
			};
			(0, react.useEffect)(() => {
				if (autoloaded.current || registries.length === 0) return;
				autoloaded.current = true;
				if (state.labels === void 0) data.loadLabels();
				if (state.market === void 0 && !state.marketLoading) data.search();
			}, [
				data,
				registries.length,
				state.labels,
				state.market,
				state.marketLoading
			]);
			if (registries.length === 0 && state.snapshot !== void 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: SkillSection_module_css_default.body,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: SkillSection_module_css_default.empty,
					children: t("skill.market.noRegistry")
				})
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: SkillSection_module_css_default.body,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: SkillSection_module_css_default.marketBar,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: SkillSection_module_css_default.facetRow,
							children: [labels.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: clsx(SkillSection_module_css_default.facet, label === void 0 && SkillSection_module_css_default.facetActive),
									onClick: () => {
										setLabel(void 0);
										setPicked(void 0);
										run(void 0);
									},
									children: t("skill.market.filter.all")
								}),
								labels.filter((one, index) => expanded || index < FACET_LIMIT || one.slug === label?.slug).map((one) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: clsx(SkillSection_module_css_default.facet, one.kind === "PRIVILEGED" && SkillSection_module_css_default.facetMark, label?.slug === one.slug && label.registry === one.registry && SkillSection_module_css_default.facetActive),
									onClick: () => {
										const next = label?.slug === one.slug && label.registry === one.registry ? void 0 : one;
										setLabel(next);
										setPicked(void 0);
										run(next);
									},
									children: one.name
								}, `${one.registry}:${one.slug}`)),
								labels.length > FACET_LIMIT && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: clsx(SkillSection_module_css_default.facet, SkillSection_module_css_default.facetMore),
									onClick: () => {
										setExpanded(!expanded);
									},
									children: expanded ? t("skill.market.filter.less") : t("skill.market.filter.more").replace("{n}", String(labels.length - FACET_LIMIT))
								})
							] }), labels.length === 0 && facets.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: clsx(SkillSection_module_css_default.facet, active === void 0 && SkillSection_module_css_default.facetActive),
									onClick: () => {
										setPicked(void 0);
									},
									children: `${t("skill.market.filter.all")} (${String(items?.length ?? 0)})`
								}),
								facets.filter((facet, index) => expanded || index < FACET_LIMIT || facet.key === active).map((facet) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: clsx(SkillSection_module_css_default.facet, active === facet.key && SkillSection_module_css_default.facetActive),
									onClick: () => {
										setPicked(active === facet.key ? void 0 : facet.key);
									},
									children: `${facet.label} (${String(facet.count)})`
								}, facet.key)),
								facets.length > FACET_LIMIT && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: clsx(SkillSection_module_css_default.facet, SkillSection_module_css_default.facetMore),
									onClick: () => {
										setExpanded(!expanded);
									},
									children: expanded ? t("skill.market.filter.less") : t("skill.market.filter.more").replace("{n}", String(facets.length - FACET_LIMIT))
								})
							] })]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: SkillSection_module_css_default.marketSearchGroup,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
								className: SkillSection_module_css_default.searchPill,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSearchOutline16, {
									size: 15,
									className: SkillSection_module_css_default.searchMark
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
									className: SkillSection_module_css_default.searchInput,
									value: keyword,
									placeholder: t("skill.market.search"),
									"aria-label": t("skill.market.search"),
									onChange: (event) => {
										setKeyword(event.target.value);
									},
									onKeyDown: (event) => {
										if (event.key === "Enter") run(label);
									}
								})]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								variant: "outline",
								size: "sm",
								disabled: state.marketLoading,
								onClick: () => {
									run(label);
								},
								children: t("skill.market.go")
							})]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: SkillSection_module_css_default.resultLine,
						children: [t("skill.market.resultLine").replace("{n}", String(shown.length)).replace("{m}", String(registries.length)), t(byDownloads ? "skill.market.sortedByDownloads" : "skill.market.sortedByRelevance")].join(" · ")
					}),
					registries.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: SkillSection_module_css_default.hint,
						children: t("skill.market.sources").replace("{names}", registries.map((one) => one.name).join("、"))
					}),
					labels.length === 0 && facets.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: SkillSection_module_css_default.hint,
						children: t("skill.market.filter.scope").replace("{n}", String(items?.length ?? 0))
					}),
					state.marketError !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ErrorLine, { text: state.marketError }),
					state.market?.fromCache === true && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: SkillSection_module_css_default.banner,
						children: t("skill.market.cached")
					}),
					state.marketLoading ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: SkillSection_module_css_default.empty,
						children: t("skill.market.loading")
					}) : state.market === void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: SkillSection_module_css_default.empty,
						children: t("skill.market.idle")
					}) : shown.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: SkillSection_module_css_default.empty,
						children: t("skill.market.none")
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
						className: SkillSection_module_css_default.grid,
						children: shown.map((item) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MarketCard, {
							item,
							t,
							install: installOf(item, installed, state.updates),
							onOpen: () => {
								onOpen({
									kind: "market",
									slug: item.slug,
									registry: item.registry
								});
							}
						}) }, `${item.registry}:${item.slug}`))
					})
				]
			});
		}
		/**
		* 一张市场卡片。
		*
		* 整张卡是一个按钮，点进去是详情——卡片上**没有安装按钮**。这是刻意的：技能
		* 装上去就是模型会照着执行的一段指令，而一张卡片放不下决定要不要装它所需的
		* 东西（谁发布的、平台给没给审核结论、包里有什么、静态扫描命中了什么）。让
		* 「装」这一下只能在看过那些之后按，比在网格里一路点下去安全。
		*
		* 卡上留的是能一眼比较的那几样：
		*
		* - **它来自哪个源**：搜索结果是几个源混在一起的，同一个 slug 在不同源上是
		*   不同的包。
		* - **它在本机是什么处境**：已安装 / 可安装 / 仅浏览。「仅浏览」是别家目录的
		*   镜像条目，这个源上没有它的包——点进去也装不了，先在卡上说清。
		* - **热度**：下载量、评分、上游 star。三个都是给人排序用的参考，不是结论。
		*/
		function MarketCard({ item, t, install, onOpen }) {
			const { taken, status } = install;
			const state = status !== void 0 ? t("skill.market.status.installed") : item.installable ? t("skill.market.status.installable") : t("skill.market.status.browseOnly");
			const suffix = status?.outdated === true ? ` · ${t("skill.market.status.update").replace("{v}", status.latest ?? "?")}` : status === void 0 && taken ? ` · ${t("skill.market.sameName")}` : "";
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				className: SkillSection_module_css_default.marketCard,
				"aria-label": item.name,
				onClick: onOpen,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: SkillSection_module_css_default.marketCardHead,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: clsx(SkillSection_module_css_default.glyph, SkillSection_module_css_default[`glyph${String(toneOf(item.slug))}`]),
							"aria-hidden": "true",
							children: initialOf(item.name)
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: SkillSection_module_css_default.registryPill,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: SkillSection_module_css_default.registryDot,
								"aria-hidden": "true"
							}), item.registryName]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: clsx(SkillSection_module_css_default.cardStatus, status !== void 0 && SkillSection_module_css_default.cardStatusOn, status === void 0 && !item.installable && SkillSection_module_css_default.cardStatusOff),
						children: `${state}${suffix}`
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: SkillSection_module_css_default.cardName,
						children: item.name
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: SkillSection_module_css_default.cardDesc,
						children: item.description ?? item.name
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: SkillSection_module_css_default.cardSpacer }),
					item.tags.length > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: SkillSection_module_css_default.cardTags,
						children: item.tags.slice(0, 3).map((tag) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: SkillSection_module_css_default.cardTag,
							children: tag
						}, tag))
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: SkillSection_module_css_default.cardMetrics,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: SkillSection_module_css_default.metric,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconDownloadOutline16, {
									size: 13,
									className: SkillSection_module_css_default.metricMark
								}), formatCount(item.downloadCount)]
							}),
							item.avgRating > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: SkillSection_module_css_default.metric,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconStarOutline16, {
									size: 13,
									className: SkillSection_module_css_default.metricMark
								}), item.avgRating.toFixed(1)]
							}),
							item.stars > 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: SkillSection_module_css_default.metric,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconBranchOutline16, {
									size: 13,
									className: SkillSection_module_css_default.metricMark
								}), formatCount(item.stars)]
							})
						]
					})
				]
			});
		}
		/**
		* 市场配置面板：加减与编辑 ClawHub 兼容源。
		*
		* 这里的编辑是**本地草稿**，按「保存」才整份写回去。写完立刻生效——`data.writeMarketConfig`
		* 调的那一头在写完之后会重取一份快照，本地清单里的 registries 跟着变。
		*
		* 空列表是一个合法配置，含义是「回退到出厂源」。所以删光再保存不会报错，只是
		* 转一圈又回到默认。这条要说清，否则「我删光了，怎么市场还能搜」会成为一个谜。
		*/
		function MarketConfigPanel({ data, t }) {
			const state = useStore(data.store);
			const [draft, setDraft] = (0, react.useState)(void 0);
			const [saved, setSaved] = (0, react.useState)(false);
			(0, react.useEffect)(() => {
				let live = true;
				setDraft(void 0);
				data.readMarketConfig().then((result) => {
					if (!live) return;
					setDraft(result.map((source) => ({
						id: source.id,
						name: source.name,
						url: source.url,
						flavor: source.flavor,
						...source.apiKeyEnv === void 0 ? {} : { apiKeyEnv: source.apiKeyEnv }
					})));
				});
				return () => {
					live = false;
				};
			}, [data]);
			if (draft === void 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: SkillSection_module_css_default.body,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: SkillSection_module_css_default.empty,
					children: t("skill.config.loading")
				})
			});
			const update = (index, patch) => {
				setDraft((current) => current?.map((one, i) => i === index ? {
					...one,
					...patch
				} : one));
			};
			const add = () => {
				setDraft((current) => [...current ?? [], {
					id: "",
					name: "",
					url: "",
					flavor: "",
					apiKeyEnv: ""
				}]);
			};
			const remove = (index) => {
				setDraft((current) => current?.filter((_, i) => i !== index));
			};
			const save = () => {
				const filtered = draft.map((one) => ({
					...one,
					id: one.id.trim(),
					name: one.name.trim(),
					url: one.url.trim()
				})).filter((one) => one.id !== "");
				data.writeMarketConfig(filtered).then((result) => {
					if (result !== void 0) {
						setSaved(true);
						setDraft(result.map((source) => ({
							id: source.id,
							name: source.name,
							url: source.url,
							flavor: source.flavor
						})));
						setTimeout(() => {
							setSaved(false);
						}, 3e3);
					}
				});
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: SkillSection_module_css_default.body,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: SkillSection_module_css_default.subtitle,
						children: t("skill.config.subtitle")
					}),
					draft.length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: SkillSection_module_css_default.banner,
						children: t("skill.config.empty")
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
						className: SkillSection_module_css_default.configList,
						children: draft.map((source, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
							className: SkillSection_module_css_default.configCard,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: SkillSection_module_css_default.configRow,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Field, {
										label: t("skill.config.field.id"),
										hint: t("skill.config.field.id.hint"),
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
											value: source.id,
											placeholder: "clawhub",
											onChange: (event) => {
												update(index, { id: event.target.value });
											}
										})
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Field, {
										label: t("skill.config.field.name"),
										hint: t("skill.config.field.name.hint"),
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
											value: source.name,
											placeholder: source.id || "ClawHub",
											onChange: (event) => {
												update(index, { name: event.target.value });
											}
										})
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Field, {
									label: t("skill.config.field.url"),
									hint: t("skill.config.field.url.hint"),
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
										value: source.url,
										placeholder: "https://clawhub.ai",
										onChange: (event) => {
											update(index, { url: event.target.value });
										}
									})
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: SkillSection_module_css_default.configRow,
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Field, {
										label: t("skill.config.field.flavor"),
										hint: t("skill.config.field.flavor.hint"),
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
											value: source.flavor ?? "",
											placeholder: "clawhub",
											onChange: (event) => {
												update(index, { flavor: event.target.value });
											}
										})
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Field, {
										label: t("skill.config.field.apiKeyEnv"),
										hint: t("skill.config.field.apiKeyEnv.hint"),
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
											value: source.apiKeyEnv ?? "",
											placeholder: "CLAWHUB_API_KEY",
											onChange: (event) => {
												update(index, { apiKeyEnv: event.target.value });
											}
										})
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: SkillSection_module_css_default.configActions,
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
										variant: "ghost",
										size: "sm",
										icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconTrashOutline16, { size: 14 }),
										onClick: () => {
											remove(index);
										},
										children: t("skill.config.remove")
									})
								})
							]
						}, String(index)))
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: SkillSection_module_css_default.configFooter,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: "outline",
							size: "sm",
							icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPlusOutline16, { size: 14 }),
							onClick: add,
							children: t("skill.config.add")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: SkillSection_module_css_default.configSave,
							children: [saved && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: SkillSection_module_css_default.configSaved,
								children: t("skill.config.saved")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								variant: "primary",
								size: "sm",
								disabled: state.configBusy,
								icon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconEnhanceOutline16, { size: 14 }),
								onClick: save,
								children: t("skill.config.save")
							})]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: SkillSection_module_css_default.hint,
						children: t("skill.config.hint")
					})
				]
			});
		}
		/**
		* 查一条市场条目在本机装没装。
		*
		* @param item - 市场条目。
		* @param names - 本机技能名。
		* @param updates - 按技能名索引的安装台账／更新状态。
		* @returns 名字占没占、以及台账里对得上的那条记录。
		*/
		function installOf(item, names, updates) {
			const status = [...updates?.values() ?? []].find((one) => one.origin.registry === item.registry && one.origin.slug === item.slug);
			return {
				taken: names.has(item.slug),
				...status === void 0 ? {} : { status }
			};
		}
		/** 归一：大小写与连字符不该让同一个类目认不出来。 */
		function normalizeLabel(raw) {
			return raw.toLowerCase().replace(/[^a-z0-9]+/gu, "");
		}
		/** 筛选条上默认摆几个；再多就折起来。 */
		const FACET_LIMIT = 12;
		/**
		* 一个条目归在哪些分类下。
		*
		* `category` 与 `tags` 合成一个平面：上游两边都可能给，也可能都不给
		* （内网那台 SkillHub 两个都是空的），分开摆会得到两条时有时无的筛选条。
		*/
		function facetsOf(item) {
			const all = item.category === void 0 ? item.tags : [item.category, ...item.tags];
			return [...new Set(all.map((one) => one.trim()).filter((one) => one !== ""))];
		}
		/**
		* 数出这一批结果里有哪些分类，多的排前面。
		*
		* 两处不照抄上游：
		*
		* - **分类是从结果里数出来的**，不是市场给的目录。ClawHub 兼容契约里没有分类
		*   端点（内网那台的 `/api/v1/categories` 要登录，`search?category=` 直接 500），
		*   所以这是「这一页里有哪些分类」。一条都数不出来时筛选条整条不出现，
		*   而不是摆一个只有「全部」的空壳。
		* - **写法归一**：同一批结果里 `Audio` 与 `audio`、`Data Analysis` 与
		*   `data-analysis` 都会同时出现，它们显然是一个分类。不合并的话筛选条上会有
		*   两颗一模一样的按钮，点哪颗都只得到一半结果——译成中文之后更看不出区别。
		*/
		function countFacets(items) {
			const counts = /* @__PURE__ */ new Map();
			for (const item of items) for (const facet of facetsOf(item)) {
				const key = normalizeLabel(facet);
				const seen = counts.get(key);
				counts.set(key, {
					label: seen?.label ?? facet,
					count: (seen?.count ?? 0) + 1
				});
			}
			return [...counts].map(([key, { label, count }]) => ({
				key,
				label,
				count
			})).sort((left, right) => right.count - left.count || left.label.localeCompare(right.label));
		}
		/** 把大数字缩成 `12.3k` 这样，免得一张卡片被一串零撑开。 */
		function formatCount(value) {
			if (value < 1e3) return String(value);
			if (value < 1e6) return `${(value / 1e3).toFixed(value < 1e4 ? 1 : 0)}k`;
			return `${(value / 1e6).toFixed(1)}M`;
		}
		/** 把字节数说成人话。 */
		function formatBytes(value) {
			if (value < 1024) return `${String(value)} B`;
			if (value < 1048576) return `${(value / 1024).toFixed(0)} KB`;
			return `${(value / 1048576).toFixed(1)} MB`;
		}
		const IMPORT_MODES = [
			{
				id: "zip",
				label: "skill.import.mode.zip",
				note: "skill.import.mode.zip.note",
				hint: "skill.import.mode.zip.hint",
				placeholder: "skill.import.mode.zip.placeholder"
			},
			{
				id: "url",
				label: "skill.import.mode.url",
				note: "skill.import.mode.url.note",
				hint: "skill.import.mode.url.hint",
				placeholder: "skill.import.mode.url.placeholder"
			},
			{
				id: "github",
				label: "skill.import.mode.github",
				note: "skill.import.mode.github.note",
				hint: "skill.import.mode.github.hint",
				placeholder: "skill.import.mode.github.placeholder"
			},
			{
				id: "slug",
				label: "skill.import.mode.slug",
				note: "skill.import.mode.slug.note",
				hint: "skill.import.mode.slug.hint",
				placeholder: "skill.import.mode.slug.placeholder"
			}
		];
		/**
		* 导入技能的对话框。
		*
		* 四种来源摆在同一个对话框里，因为对用户来说它们是同一件事——「我手上有一份
		* 技能，让它进来」。底下也确实是同一条路：解包 → 校验（条目数、单文件与整包
		* 体积、路径穿越）→ 落到技能根之外的暂存目录 → 整目录原子换上去。四条分支
		* 只在「字节从哪来」这一步不同。
		*
		* 两处必须说清，否则会变成查不明白的问题：
		*
		* - **装成什么名字由包内 `SKILL.md` 的 frontmatter `name` 决定**，与文件名、
		*   仓库名都无关。「我传的是 my-skill.zip，怎么装出来叫别的」就是这么来的。
		* - **只有市场 slug 那一条记安装台账**。压缩包和链接没有 registry 坐标，
		*   记一条假的进去，之后的更新检查会拿技能名去市场里碰一个同名条目，用一个
		*   不相干的包盖掉用户的东西。代价是这两种装法之后不出现在更新检查里。
		*/
		function ImportDialog({ open, data, t, onClose }) {
			const state = useStore(data.store);
			const [mode, setMode] = (0, react.useState)("zip");
			const [file, setFile] = (0, react.useState)(void 0);
			const [value, setValue] = (0, react.useState)("");
			const [overwrite, setOverwrite] = (0, react.useState)(false);
			const [over, setOver] = (0, react.useState)(false);
			const input = (0, react.useRef)(null);
			(0, react.useEffect)(() => {
				if (!open) return;
				setMode("zip");
				setFile(void 0);
				setValue("");
				setOverwrite(false);
				setOver(false);
			}, [open]);
			const pick = (next) => {
				setMode(next);
				setValue("");
				setFile(void 0);
			};
			const current = IMPORT_MODES.find((one) => one.id === mode) ?? IMPORT_MODES[0];
			const ready = mode === "zip" ? file !== void 0 : value.trim() !== "";
			const submit = () => {
				const done = (ok) => {
					if (ok) onClose();
				};
				if (mode === "zip") {
					if (file === void 0) return;
					data.upload(file, overwrite).then(done);
					return;
				}
				if (mode === "slug") {
					const raw = value.trim();
					const slash = raw.lastIndexOf("/");
					const owner = slash === -1 ? void 0 : raw.slice(0, slash);
					const slug = slash === -1 ? raw : raw.slice(slash + 1);
					data.install(slug, void 0, void 0, overwrite, owner).then(done);
					return;
				}
				data.importUrl(value.trim(), overwrite).then(done);
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
				open,
				title: t("skill.import.title"),
				description: t("skill.import.hint"),
				closeLabel: t("skill.cancel"),
				onClose,
				footer: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: SkillSection_module_css_default.dialogFooter,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
						variant: "ghost",
						onClick: onClose,
						children: t("skill.cancel")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
						variant: "primary",
						disabled: !ready || state.busy,
						onClick: submit,
						children: t("skill.import.go")
					})]
				}),
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: SkillSection_module_css_default.form,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: SkillSection_module_css_default.modeList,
							children: IMPORT_MODES.map((one) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								"aria-pressed": mode === one.id,
								className: clsx(SkillSection_module_css_default.mode, mode === one.id && SkillSection_module_css_default.modeActive),
								onClick: () => {
									pick(one.id);
								},
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: SkillSection_module_css_default.modeMark,
										"aria-hidden": "true",
										children: one.id === "zip" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconArchiveOutline20, { size: 17 }) : one.id === "url" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconLinkOutline16, { size: 17 }) : one.id === "github" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconBranchOutline16, { size: 17 }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconApiOutline14, { size: 17 })
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
										className: SkillSection_module_css_default.modeText,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: SkillSection_module_css_default.modeLabel,
											children: t(one.label)
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: SkillSection_module_css_default.modeNote,
											children: t(one.note)
										})]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: clsx(SkillSection_module_css_default.modeCheck, mode === one.id && SkillSection_module_css_default.modeCheckOn),
										"aria-hidden": "true",
										children: mode === one.id && /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutline16, { size: 13 })
									})
								]
							}, one.id))
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							ref: input,
							type: "file",
							hidden: true,
							accept: ARCHIVE_ACCEPT,
							onChange: (event) => {
								const picked = event.target.files?.[0];
								if (picked !== void 0) setFile(picked);
								event.target.value = "";
							}
						}),
						mode === "zip" ? file === void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							className: clsx(SkillSection_module_css_default.drop, over && SkillSection_module_css_default.dropOver),
							onClick: () => {
								input.current?.click();
							},
							onDragOver: (event) => {
								event.preventDefault();
								setOver(true);
							},
							onDragLeave: () => {
								setOver(false);
							},
							onDrop: (event) => {
								event.preventDefault();
								setOver(false);
								const dropped = event.dataTransfer.files[0];
								if (dropped !== void 0) setFile(dropped);
							},
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconArchiveOutline20, { size: 22 }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("skill.upload.drop") }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: SkillSection_module_css_default.dropHint,
									children: t("skill.upload.accept").replace("{size}", formatBytes(MAX_UPLOAD_BYTES))
								})
							]
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: SkillSection_module_css_default.picked,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: SkillSection_module_css_default.pickedName,
									children: file.name
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: SkillSection_module_css_default.pickedSize,
									children: formatBytes(file.size)
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: "ghost",
									size: "sm",
									onClick: () => {
										setFile(void 0);
									},
									children: t("skill.upload.replace")
								})
							]
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
							className: SkillSection_module_css_default.modeInput,
							value,
							placeholder: t(current.placeholder),
							"aria-label": t(current.label),
							onChange: (event) => {
								setValue(event.target.value);
							},
							onKeyDown: (event) => {
								if (event.key === "Enter" && ready) submit();
							}
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
							className: SkillSection_module_css_default.check,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: overwrite,
								onChange: () => {
									setOverwrite(!overwrite);
								}
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("skill.upload.overwrite") })]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: SkillSection_module_css_default.hint,
							children: t(current.hint).replace("{size}", formatBytes(MAX_UPLOAD_BYTES))
						})
					]
				})
			});
		}
		/** 新建技能的对话框。 */
		function CreateDialog({ open, data, t, onClose, onCreated }) {
			const state = useStore(data.store);
			const [name, setName] = (0, react.useState)("");
			const [description, setDescription] = (0, react.useState)("");
			const [whenToUse, setWhenToUse] = (0, react.useState)("");
			const [content, setContent] = (0, react.useState)("");
			(0, react.useEffect)(() => {
				if (!open) return;
				setName("");
				setDescription("");
				setWhenToUse("");
				setContent("");
			}, [open]);
			const valid = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(name) && description.trim() !== "";
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
				open,
				title: t("skill.create.title"),
				description: t("skill.create.hint"),
				closeLabel: t("skill.cancel"),
				onClose,
				footer: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: SkillSection_module_css_default.dialogFooter,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
						variant: "ghost",
						onClick: onClose,
						children: t("skill.cancel")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
						variant: "primary",
						disabled: !valid || state.busy,
						onClick: () => {
							data.create({
								name: name.trim(),
								description: description.trim(),
								...whenToUse.trim() === "" ? {} : { whenToUse: whenToUse.trim() },
								...content.trim() === "" ? {} : { content }
							}).then((ok) => {
								if (ok) onCreated(name.trim());
							});
						},
						children: t("skill.create")
					})]
				}),
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: SkillSection_module_css_default.form,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Field, {
							label: t("skill.field.name"),
							hint: t("skill.field.name.hint"),
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
								value: name,
								onChange: (event) => {
									setName(event.target.value);
								}
							})
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Field, {
							label: t("skill.field.description"),
							hint: t("skill.field.description.hint"),
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
								className: SkillSection_module_css_default.textarea,
								rows: 3,
								value: description,
								onChange: (event) => {
									setDescription(event.target.value);
								}
							})
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Field, {
							label: t("skill.field.whenToUse"),
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
								value: whenToUse,
								onChange: (event) => {
									setWhenToUse(event.target.value);
								}
							})
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Field, {
							label: t("skill.field.content"),
							hint: t("skill.field.content.hint"),
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
								className: SkillSection_module_css_default.textarea,
								rows: 6,
								value: content,
								onChange: (event) => {
									setContent(event.target.value);
								}
							})
						})
					]
				})
			});
		}
		/** 一条成功提示在屏幕上待多久。够读完两行字，又不至于一直挡着列表。 */
		const TOAST_LINGER_MS = 6e3;
		/**
		* 写操作的结果，浮在这一页左下角。
		*
		* 从原先夹在页签与列表之间的一条横幅改成浮层：那条横幅会把整份列表往下推一
		* 截，装完一个技能之后刚才在看的那一行就跑了位置——而人这时候多半正想接着
		* 装下一个。
		*
		* 三种结果分得很开，因为它们要人做的事完全不同：
		*
		* - **失败**：这一步没做成，得重来。
		* - **成功且生效**：可以接着干别的。这一种会自己消失。
		* - **成功但没生效**：文件确实写进去了，但回读 `ctx.skills` 得到的结论是它调
		*   不到（多半是被同名的更高优先级来源遮蔽）。这句是这一域最要紧的一句话，
		*   它意味着刚才那下白做了，所以**不自动消失**，要人自己点掉。
		*
		* 「生没生效」是回读来的事实，不是「重启后生效」那种预测——写完下一个模型
		* 回合就生效，会不会生效取决于有没有人挡在前面。
		*/
		function Notices({ data, t }) {
			const { error, notice, activation } = useStore(data.store);
			const stuck = activation !== void 0 && !activation.active;
			const transient = error === void 0 && notice !== void 0 && !stuck;
			(0, react.useEffect)(() => {
				if (!transient) return void 0;
				const timer = setTimeout(() => {
					data.dismiss();
				}, TOAST_LINGER_MS);
				return () => {
					clearTimeout(timer);
				};
			}, [
				data,
				transient,
				notice
			]);
			if (error === void 0 && notice === void 0) return null;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: SkillSection_module_css_default.toasts,
				role: "status",
				"aria-live": "polite",
				children: [error !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: clsx(SkillSection_module_css_default.toast, SkillSection_module_css_default.toastBad),
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconWarningOutline16, {
							size: 16,
							className: SkillSection_module_css_default.toastMark
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: SkillSection_module_css_default.toastText,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: SkillSection_module_css_default.toastTitle,
								children: t("skill.toast.failed")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: SkillSection_module_css_default.toastBody,
								children: error
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: SkillSection_module_css_default.dismiss,
							onClick: () => {
								data.dismiss();
							},
							children: t("skill.dismiss")
						})
					]
				}), notice !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: clsx(SkillSection_module_css_default.toast, stuck && SkillSection_module_css_default.toastWarn),
					children: [
						stuck ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconWarningOutline16, {
							size: 16,
							className: SkillSection_module_css_default.toastMark
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutline16, {
							size: 16,
							className: SkillSection_module_css_default.toastMark
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: SkillSection_module_css_default.toastText,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: SkillSection_module_css_default.toastTitle,
								children: t(stuck ? "skill.toast.inactive" : "skill.toast.done")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: SkillSection_module_css_default.toastBody,
								children: notice
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: SkillSection_module_css_default.dismiss,
							onClick: () => {
								data.dismiss();
							},
							children: t("skill.dismiss")
						})
					]
				})]
			});
		}
		/**
		* 把一串扁平路径折成目录树。
		*
		* 技能包里的路径本来就是 `references/api.md` 这种形状，摊成一列看不出哪些
		* 归在一起。折成树之后，「这个技能带了一套 references 和一套 scripts」是
		* 一眼的事，而不是要在二十几行里自己数前缀。
		*
		* @param entries - 扁平的文件清单。
		* @returns 根层的节点，目录在前、同类按名字排。
		*/
		function buildFileTree(entries) {
			const root = {
				dirs: /* @__PURE__ */ new Map(),
				files: []
			};
			for (const entry of entries) {
				const parts = entry.path.split("/").filter((part) => part !== "");
				const name = parts.pop();
				if (name === void 0) continue;
				let cursor = root;
				for (const part of parts) {
					let next = cursor.dirs.get(part);
					if (next === void 0) {
						next = {
							dirs: /* @__PURE__ */ new Map(),
							files: []
						};
						cursor.dirs.set(part, next);
					}
					cursor = next;
				}
				cursor.files.push({
					name,
					path: entry.path,
					size: entry.size
				});
			}
			return flattenDraft(root, "");
		}
		/** 把中间态转成节点，目录排在文件前面。 */
		function flattenDraft(draft, prefix) {
			const dirs = [...draft.dirs].map(([name, child]) => {
				const path = prefix === "" ? name : `${prefix}/${name}`;
				const children = flattenDraft(child, path);
				return {
					kind: "dir",
					name,
					path,
					children,
					count: countFiles(children)
				};
			}).sort((left, right) => left.name.localeCompare(right.name));
			const files = draft.files.map((file) => ({
				kind: "file",
				...file
			})).sort((left, right) => manifestFirst(left.name) - manifestFirst(right.name) || left.name.localeCompare(right.name));
			return [...dirs, ...files];
		}
		/** 排序权重：SKILL.md 在前，别的在后。 */
		function manifestFirst(name) {
			return name === "SKILL.md" ? 0 : 1;
		}
		/** 一棵子树里有多少个文件。 */
		function countFiles(nodes) {
			return nodes.reduce((total, node) => total + (node.kind === "file" ? 1 : node.count), 0);
		}
		/**
		* 按扩展名挑一个图标；认不出的画一份普通文件。
		*
		* 兜底的不能是 `IconCodeOutline16`：那是个 `#`，摆在文件名前面看着像文件名
		* 自己带了个井号（`# report.html`），而不像一个图标。
		*/
		function fileIcon(name) {
			const ext = name.includes(".") ? name.toLowerCase().split(".").pop() ?? "" : "";
			if (ext === "md" || ext === "markdown" || ext === "txt") return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconListPenOutline16, { size: 13 });
			if (ext === "json" || ext === "yml" || ext === "yaml" || ext === "toml") return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconDataOutline16, { size: 13 });
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconFileOutline16, { size: 13 });
		}
		/**
		* 文件树：目录可折叠，文件带体积。
		*
		* 默认只摊开第一层：点进「文件」页先看见这个技能有哪几块，要看哪一块再点开
		* 哪一块。整棵摊开的话，references 里几十个文件会把顶层结构冲得看不出来。
		*/
		function FileTree({ files, t, onOpen }) {
			const tree = (0, react.useMemo)(() => buildFileTree(files), [files]);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: SkillSection_module_css_default.tree,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: SkillSection_module_css_default.treeHead,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: SkillSection_module_css_default.treeHeadMark,
							"aria-hidden": "true",
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconFolderOpenOutline16, { size: 14 })
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("skill.tab.files") }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: SkillSection_module_css_default.treeCount,
							children: String(files.length)
						})
					]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
					className: SkillSection_module_css_default.treeBody,
					children: tree.map((node) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TreeRow, {
						node,
						depth: 0,
						t,
						onOpen
					}, node.path))
				})]
			});
		}
		/** 树里的一行；目录会把自己的子树画在下面。 */
		function TreeRow({ node, depth, t, onOpen }) {
			const [open, setOpen] = (0, react.useState)(false);
			const indent = { paddingLeft: `${String(depth * 16 + 12)}px` };
			if (node.kind === "file") {
				const body = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: SkillSection_module_css_default.treeTwisty,
						"aria-hidden": "true"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: SkillSection_module_css_default.treeMark,
						"aria-hidden": "true",
						children: fileIcon(node.name)
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: SkillSection_module_css_default.treeName,
						children: node.name
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: SkillSection_module_css_default.treeSize,
						children: formatBytes(node.size)
					})
				] });
				return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: onOpen === void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: SkillSection_module_css_default.treeRow,
					style: indent,
					children: body
				}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: clsx(SkillSection_module_css_default.treeRow, SkillSection_module_css_default.treeFile),
					style: indent,
					onClick: () => {
						onOpen(node.path);
					},
					children: body
				}) });
			}
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				className: clsx(SkillSection_module_css_default.treeRow, SkillSection_module_css_default.treeDir),
				style: indent,
				"aria-expanded": open,
				onClick: () => {
					setOpen(!open);
				},
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: SkillSection_module_css_default.treeTwisty,
						"aria-hidden": "true",
						children: open ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutline14, { size: 12 }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutline14, { size: 12 })
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: SkillSection_module_css_default.treeMark,
						"aria-hidden": "true",
						children: open ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconFolderOpen16, { size: 14 }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconFolderClose16, { size: 14 })
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: SkillSection_module_css_default.treeName,
						children: node.name
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: SkillSection_module_css_default.treeSize,
						children: t("skill.detail.fileCount").replace("{n}", String(node.count))
					})
				]
			}), open && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
				className: SkillSection_module_css_default.treeBody,
				children: node.children.map((child) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)(TreeRow, {
					node: child,
					depth: depth + 1,
					t,
					onOpen
				}, child.path))
			})] });
		}
		/**
		* 管一个文件预览：点开、取内容、关掉。
		*
		* 本机与市场两边取内容的方式不同（一个读盘、一个从包里翻），但「点开→等→
		* 显示→关掉」这套状态一模一样，所以收在这里，两边只把各自那个取法传进来。
		*
		* @param fetch - 按路径取内容；取不到时给 undefined（错误已经进了盒子）。
		* @param deps - `fetch` 依赖了什么；变了就把当前这次预览作废。
		* @returns 预览状态与开关。
		*/
		function useFilePreview(fetch, deps) {
			const [path, setPath] = (0, react.useState)(void 0);
			const [content, setContent] = (0, react.useState)(void 0);
			const [loading, setLoading] = (0, react.useState)(false);
			const wanted = (0, react.useRef)(void 0);
			(0, react.useEffect)(() => {
				wanted.current = void 0;
				setPath(void 0);
				setContent(void 0);
				setLoading(false);
			}, deps);
			const open = (next) => {
				wanted.current = next;
				setPath(next);
				setContent(void 0);
				setLoading(true);
				fetch(next).then((result) => {
					if (wanted.current !== next) return;
					setContent(result);
					setLoading(false);
				});
			};
			const close = () => {
				wanted.current = void 0;
				setPath(void 0);
				setContent(void 0);
				setLoading(false);
			};
			return {
				path,
				content,
				loading,
				open,
				close
			};
		}
		/**
		* 静态扫描的取数：点进这一页才去扫。
		*
		* 扫一整包要读几十个文件、跑十三条正则，而多数人打开详情是来看正文的。
		* 挂在页签上按需取，比一进详情就扫一遍省事得多。
		*
		* @param fetch - 去扫；扫不动时给 undefined（错误已经进了盒子）。
		* @param active - 现在正看着这一页。
		* @param deps - `fetch` 依赖了什么；变了就把手上这份结果作废。
		* @returns 扫描结果与「正在扫」。
		*/
		function useScan(fetch, active, deps) {
			const [report, setReport] = (0, react.useState)(void 0);
			const [loading, setLoading] = (0, react.useState)(false);
			const token = (0, react.useRef)(0);
			(0, react.useEffect)(() => {
				token.current += 1;
				setReport(void 0);
				setLoading(false);
			}, deps);
			(0, react.useEffect)(() => {
				if (!active || report !== void 0 || loading) return void 0;
				const mine = token.current;
				setLoading(true);
				fetch().then((result) => {
					if (token.current !== mine) return;
					setReport(result);
					setLoading(false);
				});
			}, [
				active,
				report,
				loading,
				...deps
			]);
			return {
				report,
				loading
			};
		}
		/**
		* 「安全扫描」这个页签写什么。
		*
		* 命中条数直接摆在页签上：这一页的价值在于「有没有值得看一眼的东西」，
		* 那个数字不点进去就该看得见。还没扫过时不写数——写 0 会被读成「扫过、干净」。
		*/
		function scanTabLabel(report, t) {
			const label = t("skill.tab.scan");
			return report === void 0 ? label : `${label} (${String(report.findings.length)})`;
		}
		/** 严重度的字典键；不认识的原样显示。 */
		function severityKey(severity) {
			switch (severity) {
				case "CRITICAL": return "skill.scan.severity.critical";
				case "HIGH": return "skill.scan.severity.high";
				case "MEDIUM": return "skill.scan.severity.medium";
				case "LOW": return "skill.scan.severity.low";
				case "INFO": return "skill.scan.severity.info";
				default: return;
			}
		}
		/** 分类的字典键；不认识的原样显示。 */
		function categoryKey(category) {
			switch (category) {
				case "remote-payload": return "skill.scan.category.remotePayload";
				case "credential-access": return "skill.scan.category.credentialAccess";
				case "reconnaissance": return "skill.scan.category.reconnaissance";
				case "prompt-injection": return "skill.scan.category.promptInjection";
				case "remote-control": return "skill.scan.category.remoteControl";
				case "obfuscation": return "skill.scan.category.obfuscation";
				case "data-exfiltration": return "skill.scan.category.dataExfiltration";
				case "persistence": return "skill.scan.category.persistence";
				default: return;
			}
		}
		/**
		* 静态扫描这一页，摆成一份报告。
		*
		* 版式借的是常见的技能安全报告：左边一个评分环，右边几格数字与一段摘要，
		* 下面是八个检测面各自的结论，再往下逐面展开命中了什么。这样摆是因为多数
		* 时候人只想知道「要不要细看」，那个判断该在第一屏就做完。
		*
		* 但有两处刻意与那类报告**不一样**，否则这一页会骗人：
		*
		* - **不写「可信」「无风险」这种结论**。这里只有十三条正则，给不出安全结论。
		*   一条没命中时说的是「没命中」，不是「安全」。
		* - **不假装有多个引擎**。就一个静态规则引擎，页面上也只标它。
		*
		* 分数同理：它是一个**规则命中分**，用来把一批技能排个先后，决定先看哪一个。
		*/
		function ScanPanel({ report, loading, t, onOpen }) {
			if (loading || report === void 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
				className: SkillSection_module_css_default.empty,
				children: t(loading ? "skill.scan.running" : "skill.detail.loading")
			});
			const clean = report.findings.length === 0;
			const grave = report.findings.filter((one) => one.severity === "CRITICAL" || one.severity === "HIGH");
			const mild = report.findings.length - grave.length;
			const byCategory = /* @__PURE__ */ new Map();
			for (const finding of report.findings) {
				const bucket = byCategory.get(finding.category);
				if (bucket === void 0) byCategory.set(finding.category, [finding]);
				else bucket.push(finding);
			}
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: SkillSection_module_css_default.report,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
						className: SkillSection_module_css_default.reportHead,
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: SkillSection_module_css_default.reportMark,
								"aria-hidden": "true",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconInspectOutline12, { size: 16 })
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
								className: SkillSection_module_css_default.reportTitle,
								children: t("skill.scan.title")
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: SkillSection_module_css_default.reportEngine,
								children: t("skill.scan.engine")
							})
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: SkillSection_module_css_default.reportTop,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
							className: SkillSection_module_css_default.scoreCard,
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: SkillSection_module_css_default.scoreLabel,
									children: t("skill.scan.score")
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ScoreRing, {
									score: report.score,
									clean
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("dl", {
									className: SkillSection_module_css_default.scoreFacts,
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: SkillSection_module_css_default.scoreFact,
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: t("skill.scan.scannedFiles") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: String(report.scanned) })]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: SkillSection_module_css_default.scoreFact,
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: t("skill.scan.skippedFiles") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: String(report.skipped) })]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: SkillSection_module_css_default.scoreFact,
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: t("skill.scan.topSeverity") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
												className: clsx(SkillSection_module_css_default.verdict, clean && SkillSection_module_css_default.verdictClean),
												children: report.severity === void 0 ? t("skill.scan.none") : severityText(report.severity, t)
											}) })]
										})
									]
								})
							]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: SkillSection_module_css_default.reportRight,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: SkillSection_module_css_default.tiles,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Tile, {
										label: t("skill.scan.tile.total"),
										foot: t("skill.scan.tile.total.foot"),
										value: report.findings.length
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Tile, {
										label: t("skill.scan.tile.grave"),
										foot: t("skill.scan.tile.grave.foot"),
										value: grave.length,
										tone: "warn"
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Tile, {
										label: t("skill.scan.tile.mild"),
										foot: t("skill.scan.tile.mild.foot"),
										value: mild,
										tone: "mild"
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Tile, {
										label: t("skill.scan.tile.faces"),
										foot: t("skill.scan.tile.faces.foot"),
										value: report.categories.length
									})
								]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
								className: SkillSection_module_css_default.summaryCard,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
									className: SkillSection_module_css_default.summaryTitle,
									children: t("skill.scan.summaryTitle")
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: clsx(SkillSection_module_css_default.summaryBody, clean && SkillSection_module_css_default.summaryBodyClean),
									children: clean ? t("skill.scan.summary.clean").replace("{scanned}", String(report.scanned)).replace("{rules}", String(RULE_COUNT)) : t("skill.scan.summary.hits").replace("{hits}", String(report.findings.length)).replace("{faces}", String(report.categories.filter((one) => one.hits > 0).length)).replace("{scanned}", String(report.scanned))
								})]
							})]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
						className: SkillSection_module_css_default.facesCard,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
							className: SkillSection_module_css_default.sectionTitle,
							children: t("skill.scan.facesTitle")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
							className: SkillSection_module_css_default.faces,
							children: report.categories.map((face) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
								className: clsx(SkillSection_module_css_default.face, face.hits > 0 && SkillSection_module_css_default.faceHit),
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: SkillSection_module_css_default.faceName,
									children: categoryText(face.id, t)
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: SkillSection_module_css_default.faceState,
									children: face.hits === 0 ? t("skill.scan.face.quiet") : t("skill.scan.face.hits").replace("{n}", String(face.hits))
								})]
							}, face.id))
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
						className: SkillSection_module_css_default.facesCard,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
							className: SkillSection_module_css_default.sectionTitle,
							children: t("skill.scan.detailTitle")
						}), report.categories.map((face) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: SkillSection_module_css_default.faceBlock,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: SkillSection_module_css_default.faceHead,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: clsx(SkillSection_module_css_default.faceBadge, face.hits > 0 && SkillSection_module_css_default.faceBadgeHit),
										children: face.hits === 0 ? t("skill.scan.face.quiet") : severityText(face.severity ?? "INFO", t)
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: SkillSection_module_css_default.faceTag,
										children: t("skill.scan.engine.static")
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: SkillSection_module_css_default.faceBlockName,
										children: categoryText(face.id, t)
									})
								]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: SkillSection_module_css_default.log,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: SkillSection_module_css_default.logHead,
									children: t("skill.scan.log")
								}), face.hits === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: SkillSection_module_css_default.logQuiet,
									children: t("skill.scan.face.quietLine")
								}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
									className: SkillSection_module_css_default.logList,
									children: (byCategory.get(face.id) ?? []).map((finding, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(FindingRow, {
										finding,
										t,
										onOpen
									}) }, `${finding.rule}:${finding.path}:${String(finding.line ?? 0)}:${String(index)}`))
								})]
							})]
						}, face.id))]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: SkillSection_module_css_default.scanNote,
						children: t("skill.scan.disclaimer")
					})
				]
			});
		}
		/** 规则条数。摘要里那句「这十三条都没匹上」用它，改了规则表这句跟着变。 */
		const RULE_COUNT = 13;
		/** 顶上那几格数字。 */
		function Tile({ label, foot, value, tone }) {
			const lit = value > 0;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: clsx(SkillSection_module_css_default.tile, tone === "warn" && lit && SkillSection_module_css_default.tileWarn, tone === "mild" && lit && SkillSection_module_css_default.tileMild),
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: SkillSection_module_css_default.tileLabel,
						children: label
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: SkillSection_module_css_default.tileValue,
						children: String(value)
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: SkillSection_module_css_default.tileFoot,
						children: foot
					})
				]
			});
		}
		/**
		* 评分环。
		*
		* 用 `stroke-dasharray` 画弧：实线画满对应的弧长，剩下的留空。起点转到十二点
		* 方向，否则 SVG 从三点钟开始画，看着像少了四分之一圈。
		*/
		function ScoreRing({ score, clean }) {
			const radius = 52;
			const circumference = 2 * Math.PI * radius;
			const filled = circumference * (Math.max(0, Math.min(100, score)) / 100);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				className: SkillSection_module_css_default.ring,
				viewBox: "0 0 128 128",
				role: "img",
				"aria-label": String(score),
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
						className: SkillSection_module_css_default.ringTrack,
						cx: "64",
						cy: "64",
						r: radius
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
						className: clsx(SkillSection_module_css_default.ringFill, clean && SkillSection_module_css_default.ringFillClean),
						cx: "64",
						cy: "64",
						r: radius,
						strokeDasharray: `${String(filled)} ${String(circumference - filled)}`,
						transform: "rotate(-90 64 64)"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("text", {
						className: clsx(SkillSection_module_css_default.ringText, clean && SkillSection_module_css_default.ringTextClean),
						x: "64",
						y: "64",
						children: String(score)
					})
				]
			});
		}
		/** 一条命中。点开就是那个文件。 */
		function FindingRow({ finding, t, onOpen }) {
			const body = /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: clsx(SkillSection_module_css_default.scanSeverity, SkillSection_module_css_default[`scan${finding.severity}`]),
				children: severityText(finding.severity, t)
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
				className: SkillSection_module_css_default.scanBody,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: SkillSection_module_css_default.scanWhat,
					children: finding.description
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
					className: SkillSection_module_css_default.scanWhere,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: SkillSection_module_css_default.scanPath,
							children: finding.line === void 0 ? finding.path : `${finding.path}:${String(finding.line)}`
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: SkillSection_module_css_default.scanRule,
							children: finding.rule
						}),
						finding.recovery !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: SkillSection_module_css_default.scanRule,
							children: finding.recovery
						})
					]
				})]
			})] });
			if (onOpen === void 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: SkillSection_module_css_default.scanRow,
				children: body
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				type: "button",
				className: clsx(SkillSection_module_css_default.scanRow, SkillSection_module_css_default.scanRowOpen),
				onClick: () => {
					onOpen(finding.path);
				},
				children: body
			});
		}
		/** 严重度写成人话；不认识的原样显示。 */
		function severityText(severity, t) {
			const key = severityKey(severity);
			return key === void 0 ? severity : t(key);
		}
		/** 检测面写成人话；不认识的原样显示。 */
		function categoryText(category, t) {
			const key = categoryKey(category);
			return key === void 0 ? category : t(key);
		}
		/** 认得出 markdown 的扩展名；这些用渲染视图看，别的按代码看。 */
		const MARKDOWN_SUFFIX = /\.(?:md|markdown)$/iu;
		/**
		* 从文件名猜一个语法高亮用的语言。
		*
		* 猜不着不要紧：`CodeBlock` 对认不出的 lang 就按纯文本画，不会出错。
		*/
		function langOf(path) {
			const ext = path.includes(".") ? path.toLowerCase().split(".").pop() ?? "" : "";
			return ext === "" ? void 0 : {
				yml: "yaml",
				py: "python",
				sh: "bash",
				mjs: "javascript",
				cjs: "javascript"
			}[ext] ?? ext;
		}
		/**
		* 一个文件的预览弹窗。
		*
		* markdown 走与正文同一套渲染（预览／源码两档），别的走 `CodeBlock`——带高亮
		* 和复制按钮，与会话里代码块的样子一致。
		*
		* 两件事要照实说而不是留空：**二进制**文件的字节压根没往浏览器送（送了也看
		* 不出什么，还白占一次调用），**过大**的只送了开头一段。
		*/
		function FilePreview({ path, content, loading, t, onClose }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
				open: path !== void 0,
				title: path ?? "",
				...content === void 0 ? {} : { description: formatBytes(content.size) },
				closeLabel: t("skill.cancel"),
				className: clsx(SkillSection_module_css_default.previewCard),
				onClose,
				children: loading || content === void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: SkillSection_module_css_default.empty,
					children: t("skill.file.loading")
				}) : content.binary ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: SkillSection_module_css_default.banner,
					children: t("skill.file.binary").replace("{size}", formatBytes(content.size))
				}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [content.truncated && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: SkillSection_module_css_default.banner,
					children: t("skill.file.truncated").replace("{size}", formatBytes(content.size))
				}), MARKDOWN_SUFFIX.test(content.path) ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(MarkdownBody, {
					body: content.text ?? "",
					t
				}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.CodeBlock, {
					code: content.text ?? "",
					lang: langOf(content.path),
					className: clsx(SkillSection_module_css_default.previewCode),
					copyLabel: t("skill.file.copy"),
					copiedLabel: t("skill.file.copied")
				})] })
			});
		}
		/**
		* 一份 SKILL.md 正文：默认渲染成预览，可以切回源码。
		*
		* 渲染走宿主的 {@link MarkdownText}——就是会话里渲染模型回复的那一个。
		* 不自己引一套 markdown 依赖有两层原因：它已经在加载器模块表里，插件产物
		* 不用为此胖一圈；更要紧的是它对**不可信内容**是收着的（原始 HTML 与危险
		* 协议一律禁掉），而市场上的 SKILL.md 正是不可信内容。
		*
		* 留着源码那一档，是因为模型读到的是原文而不是渲染结果：排查一份技能为什么
		* 不对劲时，要看的是原文里到底写了什么。
		*/
		function MarkdownBody({ body, t }) {
			const [expanded, setExpanded] = (0, react.useState)(false);
			const [tall, setTall] = (0, react.useState)(false);
			const rendered = (0, react.useRef)(null);
			(0, react.useEffect)(() => {
				const node = rendered.current;
				setTall(node !== null && node.scrollHeight > 568);
			}, [body]);
			const clipped = tall && !expanded;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: clsx(SkillSection_module_css_default.markdown, clipped && SkillSection_module_css_default.markdownClipped),
				ref: rendered,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MarkdownText, { text: body })
			}), tall && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				className: SkillSection_module_css_default.docMore,
				"aria-expanded": expanded,
				onClick: () => {
					setExpanded(!expanded);
				},
				children: [expanded ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronUpOutline14, { size: 12 }) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutline14, { size: 12 }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t(expanded ? "skill.doc.collapse" : "skill.doc.expand") })]
			})] });
		}
		/**
		* 包内容那两个页签的公共外壳：加载中、没有包、取不到，三种情况说法一致。
		*
		* 取不到**不是错误**，所以这里给的是一句说明而不是一条红色横幅。`note` 里装的
		* 是宿主下载失败的原话（源不可达、条目转发到了 GitHub、包里 frontmatter 不合规），
		* 比一句「加载失败」有用得多。
		*/
		function PreviewBody({ preview, foreign, t, fallback, children }) {
			if (foreign) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
				className: SkillSection_module_css_default.empty,
				children: t("skill.market.preview.foreign")
			});
			if (preview === void 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
				className: SkillSection_module_css_default.empty,
				children: t("skill.market.preview.loading")
			});
			if (children === void 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
				className: SkillSection_module_css_default.empty,
				children: preview.note ?? fallback
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children });
		}
		function SubTabs({ tabs, active, onPick }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: SkillSection_module_css_default.subTabs,
				role: "tablist",
				children: tabs.map(([id, label]) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					role: "tab",
					"aria-selected": active === id,
					className: clsx(SkillSection_module_css_default.subTab, active === id && SkillSection_module_css_default.subTabActive),
					onClick: () => {
						onPick(id);
					},
					children: label
				}, id))
			});
		}
		/** 事实卡里的一行。 */
		function FactRow({ label, children }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: SkillSection_module_css_default.factRow,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: SkillSection_module_css_default.factLabel,
					children: label
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: SkillSection_module_css_default.factValue,
					children
				})]
			});
		}
		/** 一个带标签的字段。 */
		function Field({ label, hint, children }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: SkillSection_module_css_default.field,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: SkillSection_module_css_default.label,
						children: label
					}),
					children,
					hint !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: SkillSection_module_css_default.hint,
						children: hint
					})
				]
			});
		}
		/** 一条错误。 */
		function ErrorLine({ text }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
				className: SkillSection_module_css_default.error,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconWarningOutline16, { size: 14 }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: text })]
			});
		}
		//#endregion
		//#region \0workbench-css:src/client/WorkbenchPanel.module.css.mjs
		const css = ".X3zu9a_panel{box-sizing:border-box;background:var(--dsw-alias-bg-base);border-left:1px solid var(--dsw-alias-border-l1);transition:left var(--ds-transition-duration-slow) var(--ds-ease-in-out);flex-direction:column;display:flex;position:absolute;top:0;bottom:0;right:0;overflow:hidden}@media (prefers-reduced-motion:reduce){.X3zu9a_panel{transition:none}}.X3zu9a_section{flex-direction:column;height:100%;min-height:0;display:flex}.X3zu9a_head{border-bottom:1px solid var(--dsw-alias-border-l1);padding:24px 28px 16px}.X3zu9a_title{color:var(--dsw-alias-label-primary);margin:0;font-size:18px;font-weight:600}.X3zu9a_subtitle{color:var(--dsw-alias-label-tertiary);margin:4px 0 0;font-size:12px}.X3zu9a_body{flex-direction:column;flex:1;align-items:flex-start;gap:12px;max-width:720px;min-height:0;padding:20px 28px 28px;display:flex;overflow-y:auto}.X3zu9a_actions{flex-direction:column;gap:6px;width:100%;margin:0;padding:0;list-style:none;display:flex}.X3zu9a_action{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary);border-radius:8px;padding:9px 12px;font-size:13px;line-height:1.5}.X3zu9a_toolLine{color:var(--dsw-alias-label-tertiary);flex-wrap:wrap;align-items:baseline;gap:6px;margin:0;font-size:12px;display:flex}.X3zu9a_toolName{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary);font-family:var(--ds-font-family-code,monospace);border-radius:6px;padding:2px 7px;font-size:12px}.X3zu9a_hint{color:var(--dsw-alias-label-secondary);margin:0;font-size:13px;line-height:1.7}.X3zu9a_startButton{background:var(--dsw-alias-label-primary);color:var(--dsw-alias-label-primary-inverted);cursor:pointer;border:none;border-radius:999px;padding:7px 14px;font-size:13px}.X3zu9a_startButton:hover{opacity:.88}";
		const tagId = "@staff-os/dsh-workbench/WorkbenchPanel.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@staff-os/dsh-workbench";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var WorkbenchPanel_module_css_default = {
			"section": "X3zu9a_section",
			"action": "X3zu9a_action",
			"actions": "X3zu9a_actions",
			"body": "X3zu9a_body",
			"hint": "X3zu9a_hint",
			"toolLine": "X3zu9a_toolLine",
			"head": "X3zu9a_head",
			"title": "X3zu9a_title",
			"startButton": "X3zu9a_startButton",
			"panel": "X3zu9a_panel",
			"subtitle": "X3zu9a_subtitle",
			"toolName": "X3zu9a_toolName"
		};
		//#endregion
		//#region src/client/WorkbenchPanel.tsx
		/**
		* 工作台管理面板：铺在 `shell.overlay` 上，从侧栏右边缘起占满剩下的地方。
		*
		* 非会话分区的侧栏只剩一条 56px 的 rail，所以「剩下的地方」实际是整幅——
		* 每个域的界面横铺开，中间没有第二列。侧栏那条轨道在 AppFrame 里仍按用户
		* 拖出的宽度占着，多出来的那截空底色由本面板盖住（overlay 的 z-index 高于
		* 侧栏列）。
		*
		* 为什么是 overlay 而不是中间列：中间列那个 `conversation` 槽是 single，已经
		* 被 ui-conversation 占着，占它就等于把整个对话界面连同它声明的座位一起换掉
		* ——那意味着自己重写一遍对话。overlay 是 list 槽，加一份进去谁都不影响；
		* 选回会话分区时本面板整个不渲染，对话界面原样露出来。
		*
		* overlay 那一层是 `inset: 0` 且 click-through 的（entry 自己开 pointer-events），
		* 所以这里要自己让开侧栏那一列——宽度由侧栏写进共享盒子，它才是知道自己
		* 有多宽的人。
		*
		* @module @staff-os/dsh-workbench/client/WorkbenchPanel
		*/
		/**
		* 画管理面板。
		* @param props - 组合出来的插槽 props，见 contract/panel.ts。
		* @returns 面板；停在会话分区时是 null。
		*/
		function WorkbenchPanel({ ui, employees, skills, startSession, t }) {
			const { section, sidebarWidth } = useStore(ui);
			if (section === "sessions" || !sectionVisible(section)) return null;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: WorkbenchPanel_module_css_default.panel,
				style: { left: `${String(sidebarWidth)}px` },
				children: section === "employees" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmployeeSection, {
					data: employees,
					t
				}) : section === "skills" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(SkillSection, {
					data: skills,
					t
				}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(Placeholder, {
					section,
					t,
					onStart: () => {
						ui.set((current) => ({
							...current,
							section: "sessions"
						}));
						startSession();
					}
				})
			});
		}
		/**
		* 还没做成维护界面的域，先照实说这一域现在只能用工具管。
		*
		* 版式与员工域对齐（同样的标题行 + 可滚正文），换域时不会跳成另一种页面；
		* 内容是原先侧栏那块说明面板搬过来的——那块在这里才有位置把话说全。
		*/
		function Placeholder({ section, t, onStart }) {
			const definition = sectionOf(section);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: WorkbenchPanel_module_css_default.section,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
					className: WorkbenchPanel_module_css_default.head,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h1", {
						className: WorkbenchPanel_module_css_default.title,
						children: t(definition.titleKey)
					}), definition.summaryKey !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: WorkbenchPanel_module_css_default.subtitle,
						children: t(definition.summaryKey)
					})]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: WorkbenchPanel_module_css_default.body,
					children: [
						definition.actionKeys !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
							className: WorkbenchPanel_module_css_default.actions,
							children: definition.actionKeys.map((key) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", {
								className: WorkbenchPanel_module_css_default.action,
								children: t(key)
							}, key))
						}),
						definition.tool !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
							className: WorkbenchPanel_module_css_default.toolLine,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("panel.tool") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("code", {
								className: WorkbenchPanel_module_css_default.toolName,
								children: definition.tool
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: WorkbenchPanel_module_css_default.hint,
							children: t("panel.hint")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: WorkbenchPanel_module_css_default.startButton,
							onClick: onStart,
							children: t("panel.start")
						})
					]
				})]
			});
		}
		//#endregion
		//#region src/client/workbench-ui.ts
		/**
		* 侧栏与 overlay 面板之间共享的那点 UI 状态。
		*
		* 只有一件事：rail 上现在选中哪个分区。侧栏负责改它，面板负责跟着它显示或
		* 让开——选中会话分区时面板整个不渲染，中间列的对话界面原样露出来。
		*
		* 这块状态不能放在侧栏组件的 `useState` 里：面板在 `shell.overlay` 槽，
		* 与侧栏是两棵不相邻的 React 树（见 {@link module:@staff-os/dsh-workbench/client/state}）。
		*
		* @module @staff-os/dsh-workbench/client/workbench-ui
		*/
		/**
		* 建共享状态盒子。
		* @returns 盒子，初始停在会话分区。
		*/
		function createWorkbenchUi() {
			return createStore({
				section: "sessions",
				sidebarWidth: 0
			});
		}
		//#endregion
		//#region src/client/employee/data.ts
		/**
		* 员工域的数据层：一个盒子装快照，写操作走 Remote 再把结果填回去。
		*
		* 每个写方法拿到的返回里都带一份**刷新过的完整快照**（Node 半边一并算好），
		* 所以界面改完东西不用再取一次列表，也不会出现「改完了但列表还是旧的」。
		*
		* 失败不抛：Remote 把载体故障也折进 `ok: false` 分支，这里统一转成盒子里的
		* `error` 字段，由界面决定怎么显示。抛异常穿过 React 事件处理器只会变成一条
		* 控制台噪音，界面上什么都看不见。
		*
		* @module @staff-os/dsh-workbench/client/employee/data
		*/
		/** 初始状态：还没开始取。 */
		const INITIAL = {
			loading: true,
			busy: false
		};
		/**
		* 把 Remote 失败转成一句人话。
		*
		* 通道没挂上时 `remote` 是 undefined——那是部署问题而不是操作失败，说清楚
		* 是「通道没接上」比让界面一直转圈有用。
		*/
		function failureText(result) {
			const { code, message } = result.error;
			return message === "" ? code : message;
		}
		/**
		* 建员工域的数据层。
		* @param remote - 取当前的 Remote 命名空间；没挂上时返回 undefined。
		* @returns 数据层。
		*/
		function createEmployeeData(remote) {
			const store = createStore(INITIAL);
			/** 没有通道时统一的说法。 */
			const noChannel = () => {
				store.set((current) => ({
					...current,
					loading: false,
					busy: false,
					error: "员工数据通道没有接上：本插件的 Remote 契约未挂载"
				}));
			};
			/** 收下一份快照，顺带修正选中项。 */
			const accept = (snapshot) => {
				store.set((current) => {
					const selected = current.selected !== void 0 && snapshot.employees.some((employee) => employee.id === current.selected) ? current.selected : snapshot.employees[0]?.id;
					return {
						loading: false,
						busy: false,
						snapshot,
						...selected === void 0 ? {} : { selected }
					};
				});
			};
			/** 跑一次写操作：置忙、调用、按结果收快照或记错误。 */
			const mutate = async (call, selectAfter) => {
				const face = remote();
				if (face === void 0) {
					noChannel();
					return false;
				}
				store.set((current) => ({
					...current,
					busy: true
				}));
				let result;
				try {
					result = await call(face);
				} catch (cause) {
					store.set((current) => ({
						...current,
						busy: false,
						error: cause instanceof Error ? cause.message : String(cause)
					}));
					return false;
				}
				if (!result.ok) {
					store.set((current) => ({
						...current,
						busy: false,
						error: failureText(result)
					}));
					return false;
				}
				if (selectAfter !== void 0) store.set((current) => ({
					...current,
					selected: selectAfter
				}));
				accept(result.value.snapshot);
				return true;
			};
			return {
				store,
				refresh: async () => {
					const face = remote();
					if (face === void 0) {
						noChannel();
						return;
					}
					store.set((current) => ({
						...current,
						loading: current.snapshot === void 0
					}));
					let result;
					try {
						result = await face.list();
					} catch (cause) {
						store.set((current) => ({
							...current,
							loading: false,
							error: cause instanceof Error ? cause.message : String(cause)
						}));
						return;
					}
					if (!result.ok) {
						store.set((current) => ({
							...current,
							loading: false,
							error: failureText(result)
						}));
						return;
					}
					accept(result.value);
				},
				select: (id) => {
					store.set((current) => {
						const { error: _dropped, ...rest } = current;
						return {
							...rest,
							...id === void 0 ? {} : { selected: id }
						};
					});
				},
				create: async (id, from, name) => mutate((face) => face.create(id, from, name), id),
				update: async (id, metadata) => mutate((face) => face.update(id, metadata)),
				bind: async (id, bindings) => mutate((face) => face.bind(id, bindings)),
				remove: async (id) => mutate((face) => face.delete(id)),
				read: async (id) => {
					const face = remote();
					if (face === void 0) {
						noChannel();
						return;
					}
					try {
						const result = await face.read(id);
						if (!result.ok) {
							store.set((current) => ({
								...current,
								error: failureText(result)
							}));
							return;
						}
						return result.value;
					} catch (cause) {
						store.set((current) => ({
							...current,
							error: cause instanceof Error ? cause.message : String(cause)
						}));
						return;
					}
				}
			};
		}
		//#endregion
		//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/core.js
		var _a$1;
		function $constructor(name, initializer, params) {
			function init(inst, def) {
				if (!inst._zod) Object.defineProperty(inst, "_zod", {
					value: {
						def,
						constr: _,
						traits: /* @__PURE__ */ new Set()
					},
					enumerable: false
				});
				if (inst._zod.traits.has(name)) return;
				inst._zod.traits.add(name);
				initializer(inst, def);
				const proto = _.prototype;
				const keys = Object.keys(proto);
				for (let i = 0; i < keys.length; i++) {
					const k = keys[i];
					if (!(k in inst)) inst[k] = proto[k].bind(inst);
				}
			}
			const Parent = params?.Parent ?? Object;
			class Definition extends Parent {}
			Object.defineProperty(Definition, "name", { value: name });
			function _(def) {
				var _a;
				const inst = params?.Parent ? new Definition() : this;
				init(inst, def);
				(_a = inst._zod).deferred ?? (_a.deferred = []);
				for (const fn of inst._zod.deferred) fn();
				return inst;
			}
			Object.defineProperty(_, "init", { value: init });
			Object.defineProperty(_, Symbol.hasInstance, { value: (inst) => {
				if (params?.Parent && inst instanceof params.Parent) return true;
				return inst?._zod?.traits?.has(name);
			} });
			Object.defineProperty(_, "name", { value: name });
			return _;
		}
		var $ZodAsyncError = class extends Error {
			constructor() {
				super(`Encountered Promise during synchronous parse. Use .parseAsync() instead.`);
			}
		};
		var $ZodEncodeError = class extends Error {
			constructor(name) {
				super(`Encountered unidirectional transform during encode: ${name}`);
				this.name = "ZodEncodeError";
			}
		};
		(_a$1 = globalThis).__zod_globalConfig ?? (_a$1.__zod_globalConfig = {});
		const globalConfig = globalThis.__zod_globalConfig;
		function config(newConfig) {
			if (newConfig) Object.assign(globalConfig, newConfig);
			return globalConfig;
		}
		//#endregion
		//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/util.js
		function getEnumValues(entries) {
			const numericValues = Object.values(entries).filter((v) => typeof v === "number");
			return Object.entries(entries).filter(([k, _]) => numericValues.indexOf(+k) === -1).map(([_, v]) => v);
		}
		function jsonStringifyReplacer(_, value) {
			if (typeof value === "bigint") return value.toString();
			return value;
		}
		function cached(getter) {
			return { get value() {
				{
					const value = getter();
					Object.defineProperty(this, "value", { value });
					return value;
				}
			} };
		}
		function nullish(input) {
			return input === null || input === void 0;
		}
		function cleanRegex(source) {
			const start = source.startsWith("^") ? 1 : 0;
			const end = source.endsWith("$") ? source.length - 1 : source.length;
			return source.slice(start, end);
		}
		function floatSafeRemainder(val, step) {
			const ratio = val / step;
			const roundedRatio = Math.round(ratio);
			const tolerance = Number.EPSILON * Math.max(Math.abs(ratio), 1);
			if (Math.abs(ratio - roundedRatio) < tolerance) return 0;
			return ratio - roundedRatio;
		}
		const EVALUATING = /* @__PURE__*/ Symbol("evaluating");
		function defineLazy(object, key, getter) {
			let value = void 0;
			Object.defineProperty(object, key, {
				get() {
					if (value === EVALUATING) return;
					if (value === void 0) {
						value = EVALUATING;
						value = getter();
					}
					return value;
				},
				set(v) {
					Object.defineProperty(object, key, { value: v });
				},
				configurable: true
			});
		}
		function assignProp(target, prop, value) {
			Object.defineProperty(target, prop, {
				value,
				writable: true,
				enumerable: true,
				configurable: true
			});
		}
		function mergeDefs(...defs) {
			const mergedDescriptors = {};
			for (const def of defs) {
				const descriptors = Object.getOwnPropertyDescriptors(def);
				Object.assign(mergedDescriptors, descriptors);
			}
			return Object.defineProperties({}, mergedDescriptors);
		}
		function esc(str) {
			return JSON.stringify(str);
		}
		function slugify(input) {
			return input.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
		}
		const captureStackTrace = "captureStackTrace" in Error ? Error.captureStackTrace : (..._args) => {};
		function isObject(data) {
			return typeof data === "object" && data !== null && !Array.isArray(data);
		}
		const allowsEval = /* @__PURE__*/ cached(() => {
			if (globalConfig.jitless) return false;
			if (typeof navigator !== "undefined" && navigator?.userAgent?.includes("Cloudflare")) return false;
			try {
				new Function("");
				return true;
			} catch (_) {
				return false;
			}
		});
		function isPlainObject(o) {
			if (isObject(o) === false) return false;
			const ctor = o.constructor;
			if (ctor === void 0) return true;
			if (typeof ctor !== "function") return true;
			const prot = ctor.prototype;
			if (isObject(prot) === false) return false;
			if (Object.prototype.hasOwnProperty.call(prot, "isPrototypeOf") === false) return false;
			return true;
		}
		function shallowClone(o) {
			if (isPlainObject(o)) return { ...o };
			if (Array.isArray(o)) return [...o];
			if (o instanceof Map) return new Map(o);
			if (o instanceof Set) return new Set(o);
			return o;
		}
		const propertyKeyTypes = /* @__PURE__*/ new Set([
			"string",
			"number",
			"symbol"
		]);
		function escapeRegex(str) {
			return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		}
		function clone(inst, def, params) {
			const cl = new inst._zod.constr(def ?? inst._zod.def);
			if (!def || params?.parent) cl._zod.parent = inst;
			return cl;
		}
		function normalizeParams(_params) {
			const params = _params;
			if (!params) return {};
			if (typeof params === "string") return { error: () => params };
			if (params?.message !== void 0) {
				if (params?.error !== void 0) throw new Error("Cannot specify both `message` and `error` params");
				params.error = params.message;
			}
			delete params.message;
			if (typeof params.error === "string") return {
				...params,
				error: () => params.error
			};
			return params;
		}
		function optionalKeys(shape) {
			return Object.keys(shape).filter((k) => {
				return shape[k]._zod.optin === "optional" && shape[k]._zod.optout === "optional";
			});
		}
		const NUMBER_FORMAT_RANGES = {
			safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
			int32: [-2147483648, 2147483647],
			uint32: [0, 4294967295],
			float32: [-34028234663852886e22, 34028234663852886e22],
			float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
		};
		function pick(schema, mask) {
			const currDef = schema._zod.def;
			const checks = currDef.checks;
			if (checks && checks.length > 0) throw new Error(".pick() cannot be used on object schemas containing refinements");
			return clone(schema, mergeDefs(schema._zod.def, {
				get shape() {
					const newShape = {};
					for (const key in mask) {
						if (!(key in currDef.shape)) throw new Error(`Unrecognized key: "${key}"`);
						if (!mask[key]) continue;
						newShape[key] = currDef.shape[key];
					}
					assignProp(this, "shape", newShape);
					return newShape;
				},
				checks: []
			}));
		}
		function omit(schema, mask) {
			const currDef = schema._zod.def;
			const checks = currDef.checks;
			if (checks && checks.length > 0) throw new Error(".omit() cannot be used on object schemas containing refinements");
			return clone(schema, mergeDefs(schema._zod.def, {
				get shape() {
					const newShape = { ...schema._zod.def.shape };
					for (const key in mask) {
						if (!(key in currDef.shape)) throw new Error(`Unrecognized key: "${key}"`);
						if (!mask[key]) continue;
						delete newShape[key];
					}
					assignProp(this, "shape", newShape);
					return newShape;
				},
				checks: []
			}));
		}
		function extend(schema, shape) {
			if (!isPlainObject(shape)) throw new Error("Invalid input to extend: expected a plain object");
			const checks = schema._zod.def.checks;
			if (checks && checks.length > 0) {
				const existingShape = schema._zod.def.shape;
				for (const key in shape) if (Object.getOwnPropertyDescriptor(existingShape, key) !== void 0) throw new Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
			}
			return clone(schema, mergeDefs(schema._zod.def, { get shape() {
				const _shape = {
					...schema._zod.def.shape,
					...shape
				};
				assignProp(this, "shape", _shape);
				return _shape;
			} }));
		}
		function safeExtend(schema, shape) {
			if (!isPlainObject(shape)) throw new Error("Invalid input to safeExtend: expected a plain object");
			return clone(schema, mergeDefs(schema._zod.def, { get shape() {
				const _shape = {
					...schema._zod.def.shape,
					...shape
				};
				assignProp(this, "shape", _shape);
				return _shape;
			} }));
		}
		function merge(a, b) {
			if (a._zod.def.checks?.length) throw new Error(".merge() cannot be used on object schemas containing refinements. Use .safeExtend() instead.");
			return clone(a, mergeDefs(a._zod.def, {
				get shape() {
					const _shape = {
						...a._zod.def.shape,
						...b._zod.def.shape
					};
					assignProp(this, "shape", _shape);
					return _shape;
				},
				get catchall() {
					return b._zod.def.catchall;
				},
				checks: b._zod.def.checks ?? []
			}));
		}
		function partial(Class, schema, mask) {
			const checks = schema._zod.def.checks;
			if (checks && checks.length > 0) throw new Error(".partial() cannot be used on object schemas containing refinements");
			return clone(schema, mergeDefs(schema._zod.def, {
				get shape() {
					const oldShape = schema._zod.def.shape;
					const shape = { ...oldShape };
					if (mask) for (const key in mask) {
						if (!(key in oldShape)) throw new Error(`Unrecognized key: "${key}"`);
						if (!mask[key]) continue;
						shape[key] = Class ? new Class({
							type: "optional",
							innerType: oldShape[key]
						}) : oldShape[key];
					}
					else for (const key in oldShape) shape[key] = Class ? new Class({
						type: "optional",
						innerType: oldShape[key]
					}) : oldShape[key];
					assignProp(this, "shape", shape);
					return shape;
				},
				checks: []
			}));
		}
		function required(Class, schema, mask) {
			return clone(schema, mergeDefs(schema._zod.def, { get shape() {
				const oldShape = schema._zod.def.shape;
				const shape = { ...oldShape };
				if (mask) for (const key in mask) {
					if (!(key in shape)) throw new Error(`Unrecognized key: "${key}"`);
					if (!mask[key]) continue;
					shape[key] = new Class({
						type: "nonoptional",
						innerType: oldShape[key]
					});
				}
				else for (const key in oldShape) shape[key] = new Class({
					type: "nonoptional",
					innerType: oldShape[key]
				});
				assignProp(this, "shape", shape);
				return shape;
			} }));
		}
		function aborted(x, startIndex = 0) {
			if (x.aborted === true) return true;
			for (let i = startIndex; i < x.issues.length; i++) if (x.issues[i]?.continue !== true) return true;
			return false;
		}
		function explicitlyAborted(x, startIndex = 0) {
			if (x.aborted === true) return true;
			for (let i = startIndex; i < x.issues.length; i++) if (x.issues[i]?.continue === false) return true;
			return false;
		}
		function prefixIssues(path, issues) {
			return issues.map((iss) => {
				var _a;
				(_a = iss).path ?? (_a.path = []);
				iss.path.unshift(path);
				return iss;
			});
		}
		function unwrapMessage(message) {
			return typeof message === "string" ? message : message?.message;
		}
		function finalizeIssue(iss, ctx, config) {
			const message = iss.message ? iss.message : unwrapMessage(iss.inst?._zod.def?.error?.(iss)) ?? unwrapMessage(ctx?.error?.(iss)) ?? unwrapMessage(config.customError?.(iss)) ?? unwrapMessage(config.localeError?.(iss)) ?? "Invalid input";
			const { inst: _inst, continue: _continue, input: _input, ...rest } = iss;
			rest.path ?? (rest.path = []);
			rest.message = message;
			if (ctx?.reportInput) rest.input = _input;
			return rest;
		}
		function getLengthableOrigin(input) {
			if (Array.isArray(input)) return "array";
			if (typeof input === "string") return "string";
			return "unknown";
		}
		function issue(...args) {
			const [iss, input, inst] = args;
			if (typeof iss === "string") return {
				message: iss,
				code: "custom",
				input,
				inst
			};
			return { ...iss };
		}
		//#endregion
		//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/errors.js
		const initializer$1 = (inst, def) => {
			inst.name = "$ZodError";
			Object.defineProperty(inst, "_zod", {
				value: inst._zod,
				enumerable: false
			});
			Object.defineProperty(inst, "issues", {
				value: def,
				enumerable: false
			});
			inst.message = JSON.stringify(def, jsonStringifyReplacer, 2);
			Object.defineProperty(inst, "toString", {
				value: () => inst.message,
				enumerable: false
			});
		};
		const $ZodError = $constructor("$ZodError", initializer$1);
		const $ZodRealError = $constructor("$ZodError", initializer$1, { Parent: Error });
		function flattenError(error, mapper = (issue) => issue.message) {
			const fieldErrors = {};
			const formErrors = [];
			for (const sub of error.issues) if (sub.path.length > 0) {
				fieldErrors[sub.path[0]] = fieldErrors[sub.path[0]] || [];
				fieldErrors[sub.path[0]].push(mapper(sub));
			} else formErrors.push(mapper(sub));
			return {
				formErrors,
				fieldErrors
			};
		}
		function formatError(error, mapper = (issue) => issue.message) {
			const fieldErrors = { _errors: [] };
			const processError = (error, path = []) => {
				for (const issue of error.issues) if (issue.code === "invalid_union" && issue.errors.length) issue.errors.map((issues) => processError({ issues }, [...path, ...issue.path]));
				else if (issue.code === "invalid_key") processError({ issues: issue.issues }, [...path, ...issue.path]);
				else if (issue.code === "invalid_element") processError({ issues: issue.issues }, [...path, ...issue.path]);
				else {
					const fullpath = [...path, ...issue.path];
					if (fullpath.length === 0) fieldErrors._errors.push(mapper(issue));
					else {
						let curr = fieldErrors;
						let i = 0;
						while (i < fullpath.length) {
							const el = fullpath[i];
							if (!(i === fullpath.length - 1)) curr[el] = curr[el] || { _errors: [] };
							else {
								curr[el] = curr[el] || { _errors: [] };
								curr[el]._errors.push(mapper(issue));
							}
							curr = curr[el];
							i++;
						}
					}
				}
			};
			processError(error);
			return fieldErrors;
		}
		//#endregion
		//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/parse.js
		const _parse = (_Err) => (schema, value, _ctx, _params) => {
			const ctx = _ctx ? {
				..._ctx,
				async: false
			} : { async: false };
			const result = schema._zod.run({
				value,
				issues: []
			}, ctx);
			if (result instanceof Promise) throw new $ZodAsyncError();
			if (result.issues.length) {
				const e = new ((_params?.Err) ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
				captureStackTrace(e, _params?.callee);
				throw e;
			}
			return result.value;
		};
		const _parseAsync = (_Err) => async (schema, value, _ctx, params) => {
			const ctx = _ctx ? {
				..._ctx,
				async: true
			} : { async: true };
			let result = schema._zod.run({
				value,
				issues: []
			}, ctx);
			if (result instanceof Promise) result = await result;
			if (result.issues.length) {
				const e = new ((params?.Err) ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
				captureStackTrace(e, params?.callee);
				throw e;
			}
			return result.value;
		};
		const _safeParse = (_Err) => (schema, value, _ctx) => {
			const ctx = _ctx ? {
				..._ctx,
				async: false
			} : { async: false };
			const result = schema._zod.run({
				value,
				issues: []
			}, ctx);
			if (result instanceof Promise) throw new $ZodAsyncError();
			return result.issues.length ? {
				success: false,
				error: new (_Err ?? $ZodError)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
			} : {
				success: true,
				data: result.value
			};
		};
		const safeParse$1 = /* @__PURE__*/ _safeParse($ZodRealError);
		const _safeParseAsync = (_Err) => async (schema, value, _ctx) => {
			const ctx = _ctx ? {
				..._ctx,
				async: true
			} : { async: true };
			let result = schema._zod.run({
				value,
				issues: []
			}, ctx);
			if (result instanceof Promise) result = await result;
			return result.issues.length ? {
				success: false,
				error: new _Err(result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
			} : {
				success: true,
				data: result.value
			};
		};
		const safeParseAsync$1 = /* @__PURE__*/ _safeParseAsync($ZodRealError);
		const _encode = (_Err) => (schema, value, _ctx) => {
			const ctx = _ctx ? {
				..._ctx,
				direction: "backward"
			} : { direction: "backward" };
			return _parse(_Err)(schema, value, ctx);
		};
		const _decode = (_Err) => (schema, value, _ctx) => {
			return _parse(_Err)(schema, value, _ctx);
		};
		const _encodeAsync = (_Err) => async (schema, value, _ctx) => {
			const ctx = _ctx ? {
				..._ctx,
				direction: "backward"
			} : { direction: "backward" };
			return _parseAsync(_Err)(schema, value, ctx);
		};
		const _decodeAsync = (_Err) => async (schema, value, _ctx) => {
			return _parseAsync(_Err)(schema, value, _ctx);
		};
		const _safeEncode = (_Err) => (schema, value, _ctx) => {
			const ctx = _ctx ? {
				..._ctx,
				direction: "backward"
			} : { direction: "backward" };
			return _safeParse(_Err)(schema, value, ctx);
		};
		const _safeDecode = (_Err) => (schema, value, _ctx) => {
			return _safeParse(_Err)(schema, value, _ctx);
		};
		const _safeEncodeAsync = (_Err) => async (schema, value, _ctx) => {
			const ctx = _ctx ? {
				..._ctx,
				direction: "backward"
			} : { direction: "backward" };
			return _safeParseAsync(_Err)(schema, value, ctx);
		};
		const _safeDecodeAsync = (_Err) => async (schema, value, _ctx) => {
			return _safeParseAsync(_Err)(schema, value, _ctx);
		};
		//#endregion
		//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/regexes.js
		/**
		* @deprecated CUID v1 is deprecated by its authors due to information leakage
		* (timestamps embedded in the id). Use {@link cuid2} instead.
		* See https://github.com/paralleldrive/cuid.
		*/
		const cuid = /^[cC][0-9a-z]{6,}$/;
		const cuid2 = /^[0-9a-z]+$/;
		const ulid = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/;
		const xid = /^[0-9a-vA-V]{20}$/;
		const ksuid = /^[A-Za-z0-9]{27}$/;
		const nanoid = /^[a-zA-Z0-9_-]{21}$/;
		/** ISO 8601-1 duration regex. Does not support the 8601-2 extensions like negative durations or fractional/negative components. */
		const duration$1 = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/;
		/** A regex for any UUID-like identifier: 8-4-4-4-12 hex pattern */
		const guid = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/;
		/** Returns a regex for validating an RFC 9562/4122 UUID.
		*
		* @param version Optionally specify a version 1-8. If no version is specified, all versions are supported. */
		const uuid = (version) => {
			if (!version) return /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/;
			return new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${version}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`);
		};
		/** Practical email validation */
		const email = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/;
		const _emoji$1 = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
		function emoji() {
			return new RegExp(_emoji$1, "u");
		}
		const ipv4 = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
		const ipv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/;
		const cidrv4 = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/;
		const cidrv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
		const base64 = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/;
		const base64url = /^[A-Za-z0-9_-]*$/;
		const httpProtocol = /^https?$/;
		const e164 = /^\+[1-9]\d{6,14}$/;
		const dateSource = `(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))`;
		const date$1 = /*@__PURE__*/ new RegExp(`^${dateSource}$`);
		function timeSource(args) {
			const hhmm = `(?:[01]\\d|2[0-3]):[0-5]\\d`;
			return typeof args.precision === "number" ? args.precision === -1 ? `${hhmm}` : args.precision === 0 ? `${hhmm}:[0-5]\\d` : `${hhmm}:[0-5]\\d\\.\\d{${args.precision}}` : `${hhmm}(?::[0-5]\\d(?:\\.\\d+)?)?`;
		}
		function time$1(args) {
			return new RegExp(`^${timeSource(args)}$`);
		}
		function datetime$1(args) {
			const time = timeSource({ precision: args.precision });
			const opts = ["Z"];
			if (args.local) opts.push("");
			if (args.offset) opts.push(`([+-](?:[01]\\d|2[0-3]):[0-5]\\d)`);
			const timeRegex = `${time}(?:${opts.join("|")})`;
			return new RegExp(`^${dateSource}T(?:${timeRegex})$`);
		}
		const string$1 = (params) => {
			const regex = params ? `[\\s\\S]{${params?.minimum ?? 0},${params?.maximum ?? ""}}` : `[\\s\\S]*`;
			return new RegExp(`^${regex}$`);
		};
		const integer = /^-?\d+$/;
		const number$1 = /^-?\d+(?:\.\d+)?$/;
		const boolean$1 = /^(?:true|false)$/i;
		const lowercase = /^[^A-Z]*$/;
		const uppercase = /^[^a-z]*$/;
		//#endregion
		//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/checks.js
		const $ZodCheck = /*@__PURE__*/ $constructor("$ZodCheck", (inst, def) => {
			var _a;
			inst._zod ?? (inst._zod = {});
			inst._zod.def = def;
			(_a = inst._zod).onattach ?? (_a.onattach = []);
		});
		const numericOriginMap = {
			number: "number",
			bigint: "bigint",
			object: "date"
		};
		const $ZodCheckLessThan = /*@__PURE__*/ $constructor("$ZodCheckLessThan", (inst, def) => {
			$ZodCheck.init(inst, def);
			const origin = numericOriginMap[typeof def.value];
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				const curr = (def.inclusive ? bag.maximum : bag.exclusiveMaximum) ?? Number.POSITIVE_INFINITY;
				if (def.value < curr) {
					if (def.inclusive) bag.maximum = def.value;
					else bag.exclusiveMaximum = def.value;
				}
			});
			inst._zod.check = (payload) => {
				if (def.inclusive ? payload.value <= def.value : payload.value < def.value) return;
				payload.issues.push({
					origin,
					code: "too_big",
					maximum: typeof def.value === "object" ? def.value.getTime() : def.value,
					input: payload.value,
					inclusive: def.inclusive,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckGreaterThan = /*@__PURE__*/ $constructor("$ZodCheckGreaterThan", (inst, def) => {
			$ZodCheck.init(inst, def);
			const origin = numericOriginMap[typeof def.value];
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				const curr = (def.inclusive ? bag.minimum : bag.exclusiveMinimum) ?? Number.NEGATIVE_INFINITY;
				if (def.value > curr) {
					if (def.inclusive) bag.minimum = def.value;
					else bag.exclusiveMinimum = def.value;
				}
			});
			inst._zod.check = (payload) => {
				if (def.inclusive ? payload.value >= def.value : payload.value > def.value) return;
				payload.issues.push({
					origin,
					code: "too_small",
					minimum: typeof def.value === "object" ? def.value.getTime() : def.value,
					input: payload.value,
					inclusive: def.inclusive,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckMultipleOf = /*@__PURE__*/ $constructor("$ZodCheckMultipleOf", (inst, def) => {
			$ZodCheck.init(inst, def);
			inst._zod.onattach.push((inst) => {
				var _a;
				(_a = inst._zod.bag).multipleOf ?? (_a.multipleOf = def.value);
			});
			inst._zod.check = (payload) => {
				if (typeof payload.value !== typeof def.value) throw new Error("Cannot mix number and bigint in multiple_of check.");
				if (typeof payload.value === "bigint" ? payload.value % def.value === BigInt(0) : floatSafeRemainder(payload.value, def.value) === 0) return;
				payload.issues.push({
					origin: typeof payload.value,
					code: "not_multiple_of",
					divisor: def.value,
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckNumberFormat = /*@__PURE__*/ $constructor("$ZodCheckNumberFormat", (inst, def) => {
			$ZodCheck.init(inst, def);
			def.format = def.format || "float64";
			const isInt = def.format?.includes("int");
			const origin = isInt ? "int" : "number";
			const [minimum, maximum] = NUMBER_FORMAT_RANGES[def.format];
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				bag.format = def.format;
				bag.minimum = minimum;
				bag.maximum = maximum;
				if (isInt) bag.pattern = integer;
			});
			inst._zod.check = (payload) => {
				const input = payload.value;
				if (isInt) {
					if (!Number.isInteger(input)) {
						payload.issues.push({
							expected: origin,
							format: def.format,
							code: "invalid_type",
							continue: false,
							input,
							inst
						});
						return;
					}
					if (!Number.isSafeInteger(input)) {
						if (input > 0) payload.issues.push({
							input,
							code: "too_big",
							maximum: Number.MAX_SAFE_INTEGER,
							note: "Integers must be within the safe integer range.",
							inst,
							origin,
							inclusive: true,
							continue: !def.abort
						});
						else payload.issues.push({
							input,
							code: "too_small",
							minimum: Number.MIN_SAFE_INTEGER,
							note: "Integers must be within the safe integer range.",
							inst,
							origin,
							inclusive: true,
							continue: !def.abort
						});
						return;
					}
				}
				if (input < minimum) payload.issues.push({
					origin: "number",
					input,
					code: "too_small",
					minimum,
					inclusive: true,
					inst,
					continue: !def.abort
				});
				if (input > maximum) payload.issues.push({
					origin: "number",
					input,
					code: "too_big",
					maximum,
					inclusive: true,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckMaxLength = /*@__PURE__*/ $constructor("$ZodCheckMaxLength", (inst, def) => {
			var _a;
			$ZodCheck.init(inst, def);
			(_a = inst._zod.def).when ?? (_a.when = (payload) => {
				const val = payload.value;
				return !nullish(val) && val.length !== void 0;
			});
			inst._zod.onattach.push((inst) => {
				const curr = inst._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
				if (def.maximum < curr) inst._zod.bag.maximum = def.maximum;
			});
			inst._zod.check = (payload) => {
				const input = payload.value;
				if (input.length <= def.maximum) return;
				const origin = getLengthableOrigin(input);
				payload.issues.push({
					origin,
					code: "too_big",
					maximum: def.maximum,
					inclusive: true,
					input,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckMinLength = /*@__PURE__*/ $constructor("$ZodCheckMinLength", (inst, def) => {
			var _a;
			$ZodCheck.init(inst, def);
			(_a = inst._zod.def).when ?? (_a.when = (payload) => {
				const val = payload.value;
				return !nullish(val) && val.length !== void 0;
			});
			inst._zod.onattach.push((inst) => {
				const curr = inst._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
				if (def.minimum > curr) inst._zod.bag.minimum = def.minimum;
			});
			inst._zod.check = (payload) => {
				const input = payload.value;
				if (input.length >= def.minimum) return;
				const origin = getLengthableOrigin(input);
				payload.issues.push({
					origin,
					code: "too_small",
					minimum: def.minimum,
					inclusive: true,
					input,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckLengthEquals = /*@__PURE__*/ $constructor("$ZodCheckLengthEquals", (inst, def) => {
			var _a;
			$ZodCheck.init(inst, def);
			(_a = inst._zod.def).when ?? (_a.when = (payload) => {
				const val = payload.value;
				return !nullish(val) && val.length !== void 0;
			});
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				bag.minimum = def.length;
				bag.maximum = def.length;
				bag.length = def.length;
			});
			inst._zod.check = (payload) => {
				const input = payload.value;
				const length = input.length;
				if (length === def.length) return;
				const origin = getLengthableOrigin(input);
				const tooBig = length > def.length;
				payload.issues.push({
					origin,
					...tooBig ? {
						code: "too_big",
						maximum: def.length
					} : {
						code: "too_small",
						minimum: def.length
					},
					inclusive: true,
					exact: true,
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckStringFormat = /*@__PURE__*/ $constructor("$ZodCheckStringFormat", (inst, def) => {
			var _a, _b;
			$ZodCheck.init(inst, def);
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				bag.format = def.format;
				if (def.pattern) {
					bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
					bag.patterns.add(def.pattern);
				}
			});
			if (def.pattern) (_a = inst._zod).check ?? (_a.check = (payload) => {
				def.pattern.lastIndex = 0;
				if (def.pattern.test(payload.value)) return;
				payload.issues.push({
					origin: "string",
					code: "invalid_format",
					format: def.format,
					input: payload.value,
					...def.pattern ? { pattern: def.pattern.toString() } : {},
					inst,
					continue: !def.abort
				});
			});
			else (_b = inst._zod).check ?? (_b.check = () => {});
		});
		const $ZodCheckRegex = /*@__PURE__*/ $constructor("$ZodCheckRegex", (inst, def) => {
			$ZodCheckStringFormat.init(inst, def);
			inst._zod.check = (payload) => {
				def.pattern.lastIndex = 0;
				if (def.pattern.test(payload.value)) return;
				payload.issues.push({
					origin: "string",
					code: "invalid_format",
					format: "regex",
					input: payload.value,
					pattern: def.pattern.toString(),
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckLowerCase = /*@__PURE__*/ $constructor("$ZodCheckLowerCase", (inst, def) => {
			def.pattern ?? (def.pattern = lowercase);
			$ZodCheckStringFormat.init(inst, def);
		});
		const $ZodCheckUpperCase = /*@__PURE__*/ $constructor("$ZodCheckUpperCase", (inst, def) => {
			def.pattern ?? (def.pattern = uppercase);
			$ZodCheckStringFormat.init(inst, def);
		});
		const $ZodCheckIncludes = /*@__PURE__*/ $constructor("$ZodCheckIncludes", (inst, def) => {
			$ZodCheck.init(inst, def);
			const escapedRegex = escapeRegex(def.includes);
			const pattern = new RegExp(typeof def.position === "number" ? `^.{${def.position}}${escapedRegex}` : escapedRegex);
			def.pattern = pattern;
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
				bag.patterns.add(pattern);
			});
			inst._zod.check = (payload) => {
				if (payload.value.includes(def.includes, def.position)) return;
				payload.issues.push({
					origin: "string",
					code: "invalid_format",
					format: "includes",
					includes: def.includes,
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckStartsWith = /*@__PURE__*/ $constructor("$ZodCheckStartsWith", (inst, def) => {
			$ZodCheck.init(inst, def);
			const pattern = new RegExp(`^${escapeRegex(def.prefix)}.*`);
			def.pattern ?? (def.pattern = pattern);
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
				bag.patterns.add(pattern);
			});
			inst._zod.check = (payload) => {
				if (payload.value.startsWith(def.prefix)) return;
				payload.issues.push({
					origin: "string",
					code: "invalid_format",
					format: "starts_with",
					prefix: def.prefix,
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckEndsWith = /*@__PURE__*/ $constructor("$ZodCheckEndsWith", (inst, def) => {
			$ZodCheck.init(inst, def);
			const pattern = new RegExp(`.*${escapeRegex(def.suffix)}$`);
			def.pattern ?? (def.pattern = pattern);
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
				bag.patterns.add(pattern);
			});
			inst._zod.check = (payload) => {
				if (payload.value.endsWith(def.suffix)) return;
				payload.issues.push({
					origin: "string",
					code: "invalid_format",
					format: "ends_with",
					suffix: def.suffix,
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckOverwrite = /*@__PURE__*/ $constructor("$ZodCheckOverwrite", (inst, def) => {
			$ZodCheck.init(inst, def);
			inst._zod.check = (payload) => {
				payload.value = def.tx(payload.value);
			};
		});
		//#endregion
		//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/doc.js
		var Doc = class {
			constructor(args = []) {
				this.content = [];
				this.indent = 0;
				if (this) this.args = args;
			}
			indented(fn) {
				this.indent += 1;
				fn(this);
				this.indent -= 1;
			}
			write(arg) {
				if (typeof arg === "function") {
					arg(this, { execution: "sync" });
					arg(this, { execution: "async" });
					return;
				}
				const lines = arg.split("\n").filter((x) => x);
				const minIndent = Math.min(...lines.map((x) => x.length - x.trimStart().length));
				const dedented = lines.map((x) => x.slice(minIndent)).map((x) => " ".repeat(this.indent * 2) + x);
				for (const line of dedented) this.content.push(line);
			}
			compile() {
				const F = Function;
				const args = this?.args;
				const lines = [...(this?.content ?? [``]).map((x) => `  ${x}`)];
				return new F(...args, lines.join("\n"));
			}
		};
		//#endregion
		//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/versions.js
		const version = {
			major: 4,
			minor: 4,
			patch: 3
		};
		//#endregion
		//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/schemas.js
		const $ZodType = /*@__PURE__*/ $constructor("$ZodType", (inst, def) => {
			var _a;
			inst ?? (inst = {});
			inst._zod.def = def;
			inst._zod.bag = inst._zod.bag || {};
			inst._zod.version = version;
			const checks = [...inst._zod.def.checks ?? []];
			if (inst._zod.traits.has("$ZodCheck")) checks.unshift(inst);
			for (const ch of checks) for (const fn of ch._zod.onattach) fn(inst);
			if (checks.length === 0) {
				(_a = inst._zod).deferred ?? (_a.deferred = []);
				inst._zod.deferred?.push(() => {
					inst._zod.run = inst._zod.parse;
				});
			} else {
				const runChecks = (payload, checks, ctx) => {
					let isAborted = aborted(payload);
					let asyncResult;
					for (const ch of checks) {
						if (ch._zod.def.when) {
							if (explicitlyAborted(payload)) continue;
							if (!ch._zod.def.when(payload)) continue;
						} else if (isAborted) continue;
						const currLen = payload.issues.length;
						const _ = ch._zod.check(payload);
						if (_ instanceof Promise && ctx?.async === false) throw new $ZodAsyncError();
						if (asyncResult || _ instanceof Promise) asyncResult = (asyncResult ?? Promise.resolve()).then(async () => {
							await _;
							if (payload.issues.length === currLen) return;
							if (!isAborted) isAborted = aborted(payload, currLen);
						});
						else {
							if (payload.issues.length === currLen) continue;
							if (!isAborted) isAborted = aborted(payload, currLen);
						}
					}
					if (asyncResult) return asyncResult.then(() => {
						return payload;
					});
					return payload;
				};
				const handleCanaryResult = (canary, payload, ctx) => {
					if (aborted(canary)) {
						canary.aborted = true;
						return canary;
					}
					const checkResult = runChecks(payload, checks, ctx);
					if (checkResult instanceof Promise) {
						if (ctx.async === false) throw new $ZodAsyncError();
						return checkResult.then((checkResult) => inst._zod.parse(checkResult, ctx));
					}
					return inst._zod.parse(checkResult, ctx);
				};
				inst._zod.run = (payload, ctx) => {
					if (ctx.skipChecks) return inst._zod.parse(payload, ctx);
					if (ctx.direction === "backward") {
						const canary = inst._zod.parse({
							value: payload.value,
							issues: []
						}, {
							...ctx,
							skipChecks: true
						});
						if (canary instanceof Promise) return canary.then((canary) => {
							return handleCanaryResult(canary, payload, ctx);
						});
						return handleCanaryResult(canary, payload, ctx);
					}
					const result = inst._zod.parse(payload, ctx);
					if (result instanceof Promise) {
						if (ctx.async === false) throw new $ZodAsyncError();
						return result.then((result) => runChecks(result, checks, ctx));
					}
					return runChecks(result, checks, ctx);
				};
			}
			defineLazy(inst, "~standard", () => ({
				validate: (value) => {
					try {
						const r = safeParse$1(inst, value);
						return r.success ? { value: r.data } : { issues: r.error?.issues };
					} catch (_) {
						return safeParseAsync$1(inst, value).then((r) => r.success ? { value: r.data } : { issues: r.error?.issues });
					}
				},
				vendor: "zod",
				version: 1
			}));
		});
		const $ZodString = /*@__PURE__*/ $constructor("$ZodString", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.pattern = [...inst?._zod.bag?.patterns ?? []].pop() ?? string$1(inst._zod.bag);
			inst._zod.parse = (payload, _) => {
				if (def.coerce) try {
					payload.value = String(payload.value);
				} catch (_) {}
				if (typeof payload.value === "string") return payload;
				payload.issues.push({
					expected: "string",
					code: "invalid_type",
					input: payload.value,
					inst
				});
				return payload;
			};
		});
		const $ZodStringFormat = /*@__PURE__*/ $constructor("$ZodStringFormat", (inst, def) => {
			$ZodCheckStringFormat.init(inst, def);
			$ZodString.init(inst, def);
		});
		const $ZodGUID = /*@__PURE__*/ $constructor("$ZodGUID", (inst, def) => {
			def.pattern ?? (def.pattern = guid);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodUUID = /*@__PURE__*/ $constructor("$ZodUUID", (inst, def) => {
			if (def.version) {
				const v = {
					v1: 1,
					v2: 2,
					v3: 3,
					v4: 4,
					v5: 5,
					v6: 6,
					v7: 7,
					v8: 8
				}[def.version];
				if (v === void 0) throw new Error(`Invalid UUID version: "${def.version}"`);
				def.pattern ?? (def.pattern = uuid(v));
			} else def.pattern ?? (def.pattern = uuid());
			$ZodStringFormat.init(inst, def);
		});
		const $ZodEmail = /*@__PURE__*/ $constructor("$ZodEmail", (inst, def) => {
			def.pattern ?? (def.pattern = email);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodURL = /*@__PURE__*/ $constructor("$ZodURL", (inst, def) => {
			$ZodStringFormat.init(inst, def);
			inst._zod.check = (payload) => {
				try {
					const trimmed = payload.value.trim();
					if (!def.normalize && def.protocol?.source === httpProtocol.source) {
						if (!/^https?:\/\//i.test(trimmed)) {
							payload.issues.push({
								code: "invalid_format",
								format: "url",
								note: "Invalid URL format",
								input: payload.value,
								inst,
								continue: !def.abort
							});
							return;
						}
					}
					const url = new URL(trimmed);
					if (def.hostname) {
						def.hostname.lastIndex = 0;
						if (!def.hostname.test(url.hostname)) payload.issues.push({
							code: "invalid_format",
							format: "url",
							note: "Invalid hostname",
							pattern: def.hostname.source,
							input: payload.value,
							inst,
							continue: !def.abort
						});
					}
					if (def.protocol) {
						def.protocol.lastIndex = 0;
						if (!def.protocol.test(url.protocol.endsWith(":") ? url.protocol.slice(0, -1) : url.protocol)) payload.issues.push({
							code: "invalid_format",
							format: "url",
							note: "Invalid protocol",
							pattern: def.protocol.source,
							input: payload.value,
							inst,
							continue: !def.abort
						});
					}
					if (def.normalize) payload.value = url.href;
					else payload.value = trimmed;
					return;
				} catch (_) {
					payload.issues.push({
						code: "invalid_format",
						format: "url",
						input: payload.value,
						inst,
						continue: !def.abort
					});
				}
			};
		});
		const $ZodEmoji = /*@__PURE__*/ $constructor("$ZodEmoji", (inst, def) => {
			def.pattern ?? (def.pattern = emoji());
			$ZodStringFormat.init(inst, def);
		});
		const $ZodNanoID = /*@__PURE__*/ $constructor("$ZodNanoID", (inst, def) => {
			def.pattern ?? (def.pattern = nanoid);
			$ZodStringFormat.init(inst, def);
		});
		/**
		* @deprecated CUID v1 is deprecated by its authors due to information leakage
		* (timestamps embedded in the id). Use {@link $ZodCUID2} instead.
		* See https://github.com/paralleldrive/cuid.
		*/
		const $ZodCUID = /*@__PURE__*/ $constructor("$ZodCUID", (inst, def) => {
			def.pattern ?? (def.pattern = cuid);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodCUID2 = /*@__PURE__*/ $constructor("$ZodCUID2", (inst, def) => {
			def.pattern ?? (def.pattern = cuid2);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodULID = /*@__PURE__*/ $constructor("$ZodULID", (inst, def) => {
			def.pattern ?? (def.pattern = ulid);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodXID = /*@__PURE__*/ $constructor("$ZodXID", (inst, def) => {
			def.pattern ?? (def.pattern = xid);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodKSUID = /*@__PURE__*/ $constructor("$ZodKSUID", (inst, def) => {
			def.pattern ?? (def.pattern = ksuid);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodISODateTime = /*@__PURE__*/ $constructor("$ZodISODateTime", (inst, def) => {
			def.pattern ?? (def.pattern = datetime$1(def));
			$ZodStringFormat.init(inst, def);
		});
		const $ZodISODate = /*@__PURE__*/ $constructor("$ZodISODate", (inst, def) => {
			def.pattern ?? (def.pattern = date$1);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodISOTime = /*@__PURE__*/ $constructor("$ZodISOTime", (inst, def) => {
			def.pattern ?? (def.pattern = time$1(def));
			$ZodStringFormat.init(inst, def);
		});
		const $ZodISODuration = /*@__PURE__*/ $constructor("$ZodISODuration", (inst, def) => {
			def.pattern ?? (def.pattern = duration$1);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodIPv4 = /*@__PURE__*/ $constructor("$ZodIPv4", (inst, def) => {
			def.pattern ?? (def.pattern = ipv4);
			$ZodStringFormat.init(inst, def);
			inst._zod.bag.format = `ipv4`;
		});
		const $ZodIPv6 = /*@__PURE__*/ $constructor("$ZodIPv6", (inst, def) => {
			def.pattern ?? (def.pattern = ipv6);
			$ZodStringFormat.init(inst, def);
			inst._zod.bag.format = `ipv6`;
			inst._zod.check = (payload) => {
				try {
					new URL(`http://[${payload.value}]`);
				} catch {
					payload.issues.push({
						code: "invalid_format",
						format: "ipv6",
						input: payload.value,
						inst,
						continue: !def.abort
					});
				}
			};
		});
		const $ZodCIDRv4 = /*@__PURE__*/ $constructor("$ZodCIDRv4", (inst, def) => {
			def.pattern ?? (def.pattern = cidrv4);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodCIDRv6 = /*@__PURE__*/ $constructor("$ZodCIDRv6", (inst, def) => {
			def.pattern ?? (def.pattern = cidrv6);
			$ZodStringFormat.init(inst, def);
			inst._zod.check = (payload) => {
				const parts = payload.value.split("/");
				try {
					if (parts.length !== 2) throw new Error();
					const [address, prefix] = parts;
					if (!prefix) throw new Error();
					const prefixNum = Number(prefix);
					if (`${prefixNum}` !== prefix) throw new Error();
					if (prefixNum < 0 || prefixNum > 128) throw new Error();
					new URL(`http://[${address}]`);
				} catch {
					payload.issues.push({
						code: "invalid_format",
						format: "cidrv6",
						input: payload.value,
						inst,
						continue: !def.abort
					});
				}
			};
		});
		function isValidBase64(data) {
			if (data === "") return true;
			if (/\s/.test(data)) return false;
			if (data.length % 4 !== 0) return false;
			try {
				atob(data);
				return true;
			} catch {
				return false;
			}
		}
		const $ZodBase64 = /*@__PURE__*/ $constructor("$ZodBase64", (inst, def) => {
			def.pattern ?? (def.pattern = base64);
			$ZodStringFormat.init(inst, def);
			inst._zod.bag.contentEncoding = "base64";
			inst._zod.check = (payload) => {
				if (isValidBase64(payload.value)) return;
				payload.issues.push({
					code: "invalid_format",
					format: "base64",
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		function isValidBase64URL(data) {
			if (!base64url.test(data)) return false;
			const base64 = data.replace(/[-_]/g, (c) => c === "-" ? "+" : "/");
			return isValidBase64(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
		}
		const $ZodBase64URL = /*@__PURE__*/ $constructor("$ZodBase64URL", (inst, def) => {
			def.pattern ?? (def.pattern = base64url);
			$ZodStringFormat.init(inst, def);
			inst._zod.bag.contentEncoding = "base64url";
			inst._zod.check = (payload) => {
				if (isValidBase64URL(payload.value)) return;
				payload.issues.push({
					code: "invalid_format",
					format: "base64url",
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodE164 = /*@__PURE__*/ $constructor("$ZodE164", (inst, def) => {
			def.pattern ?? (def.pattern = e164);
			$ZodStringFormat.init(inst, def);
		});
		function isValidJWT(token, algorithm = null) {
			try {
				const tokensParts = token.split(".");
				if (tokensParts.length !== 3) return false;
				const [header] = tokensParts;
				if (!header) return false;
				const parsedHeader = JSON.parse(atob(header));
				if ("typ" in parsedHeader && parsedHeader?.typ !== "JWT") return false;
				if (!parsedHeader.alg) return false;
				if (algorithm && (!("alg" in parsedHeader) || parsedHeader.alg !== algorithm)) return false;
				return true;
			} catch {
				return false;
			}
		}
		const $ZodJWT = /*@__PURE__*/ $constructor("$ZodJWT", (inst, def) => {
			$ZodStringFormat.init(inst, def);
			inst._zod.check = (payload) => {
				if (isValidJWT(payload.value, def.alg)) return;
				payload.issues.push({
					code: "invalid_format",
					format: "jwt",
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodNumber = /*@__PURE__*/ $constructor("$ZodNumber", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.pattern = inst._zod.bag.pattern ?? number$1;
			inst._zod.parse = (payload, _ctx) => {
				if (def.coerce) try {
					payload.value = Number(payload.value);
				} catch (_) {}
				const input = payload.value;
				if (typeof input === "number" && !Number.isNaN(input) && Number.isFinite(input)) return payload;
				const received = typeof input === "number" ? Number.isNaN(input) ? "NaN" : !Number.isFinite(input) ? "Infinity" : void 0 : void 0;
				payload.issues.push({
					expected: "number",
					code: "invalid_type",
					input,
					inst,
					...received ? { received } : {}
				});
				return payload;
			};
		});
		const $ZodNumberFormat = /*@__PURE__*/ $constructor("$ZodNumberFormat", (inst, def) => {
			$ZodCheckNumberFormat.init(inst, def);
			$ZodNumber.init(inst, def);
		});
		const $ZodBoolean = /*@__PURE__*/ $constructor("$ZodBoolean", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.pattern = boolean$1;
			inst._zod.parse = (payload, _ctx) => {
				if (def.coerce) try {
					payload.value = Boolean(payload.value);
				} catch (_) {}
				const input = payload.value;
				if (typeof input === "boolean") return payload;
				payload.issues.push({
					expected: "boolean",
					code: "invalid_type",
					input,
					inst
				});
				return payload;
			};
		});
		const $ZodUnknown = /*@__PURE__*/ $constructor("$ZodUnknown", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.parse = (payload) => payload;
		});
		const $ZodNever = /*@__PURE__*/ $constructor("$ZodNever", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.parse = (payload, _ctx) => {
				payload.issues.push({
					expected: "never",
					code: "invalid_type",
					input: payload.value,
					inst
				});
				return payload;
			};
		});
		function handleArrayResult(result, final, index) {
			if (result.issues.length) final.issues.push(...prefixIssues(index, result.issues));
			final.value[index] = result.value;
		}
		const $ZodArray = /*@__PURE__*/ $constructor("$ZodArray", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.parse = (payload, ctx) => {
				const input = payload.value;
				if (!Array.isArray(input)) {
					payload.issues.push({
						expected: "array",
						code: "invalid_type",
						input,
						inst
					});
					return payload;
				}
				payload.value = Array(input.length);
				const proms = [];
				for (let i = 0; i < input.length; i++) {
					const item = input[i];
					const result = def.element._zod.run({
						value: item,
						issues: []
					}, ctx);
					if (result instanceof Promise) proms.push(result.then((result) => handleArrayResult(result, payload, i)));
					else handleArrayResult(result, payload, i);
				}
				if (proms.length) return Promise.all(proms).then(() => payload);
				return payload;
			};
		});
		function handlePropertyResult(result, final, key, input, isOptionalIn, isOptionalOut) {
			const isPresent = key in input;
			if (result.issues.length) {
				if (isOptionalIn && isOptionalOut && !isPresent) return;
				final.issues.push(...prefixIssues(key, result.issues));
			}
			if (!isPresent && !isOptionalIn) {
				if (!result.issues.length) final.issues.push({
					code: "invalid_type",
					expected: "nonoptional",
					input: void 0,
					path: [key]
				});
				return;
			}
			if (result.value === void 0) {
				if (isPresent) final.value[key] = void 0;
			} else final.value[key] = result.value;
		}
		function normalizeDef(def) {
			const keys = Object.keys(def.shape);
			for (const k of keys) if (!def.shape?.[k]?._zod?.traits?.has("$ZodType")) throw new Error(`Invalid element at key "${k}": expected a Zod schema`);
			const okeys = optionalKeys(def.shape);
			return {
				...def,
				keys,
				keySet: new Set(keys),
				numKeys: keys.length,
				optionalKeys: new Set(okeys)
			};
		}
		function handleCatchall(proms, input, payload, ctx, def, inst) {
			const unrecognized = [];
			const keySet = def.keySet;
			const _catchall = def.catchall._zod;
			const t = _catchall.def.type;
			const isOptionalIn = _catchall.optin === "optional";
			const isOptionalOut = _catchall.optout === "optional";
			for (const key in input) {
				if (key === "__proto__") continue;
				if (keySet.has(key)) continue;
				if (t === "never") {
					unrecognized.push(key);
					continue;
				}
				const r = _catchall.run({
					value: input[key],
					issues: []
				}, ctx);
				if (r instanceof Promise) proms.push(r.then((r) => handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut)));
				else handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut);
			}
			if (unrecognized.length) payload.issues.push({
				code: "unrecognized_keys",
				keys: unrecognized,
				input,
				inst
			});
			if (!proms.length) return payload;
			return Promise.all(proms).then(() => {
				return payload;
			});
		}
		const $ZodObject = /*@__PURE__*/ $constructor("$ZodObject", (inst, def) => {
			$ZodType.init(inst, def);
			if (!Object.getOwnPropertyDescriptor(def, "shape")?.get) {
				const sh = def.shape;
				Object.defineProperty(def, "shape", { get: () => {
					const newSh = { ...sh };
					Object.defineProperty(def, "shape", { value: newSh });
					return newSh;
				} });
			}
			const _normalized = cached(() => normalizeDef(def));
			defineLazy(inst._zod, "propValues", () => {
				const shape = def.shape;
				const propValues = {};
				for (const key in shape) {
					const field = shape[key]._zod;
					if (field.values) {
						propValues[key] ?? (propValues[key] = /* @__PURE__ */ new Set());
						for (const v of field.values) propValues[key].add(v);
					}
				}
				return propValues;
			});
			const isObject$1 = isObject;
			const catchall = def.catchall;
			let value;
			inst._zod.parse = (payload, ctx) => {
				value ?? (value = _normalized.value);
				const input = payload.value;
				if (!isObject$1(input)) {
					payload.issues.push({
						expected: "object",
						code: "invalid_type",
						input,
						inst
					});
					return payload;
				}
				payload.value = {};
				const proms = [];
				const shape = value.shape;
				for (const key of value.keys) {
					const el = shape[key];
					const isOptionalIn = el._zod.optin === "optional";
					const isOptionalOut = el._zod.optout === "optional";
					const r = el._zod.run({
						value: input[key],
						issues: []
					}, ctx);
					if (r instanceof Promise) proms.push(r.then((r) => handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut)));
					else handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut);
				}
				if (!catchall) return proms.length ? Promise.all(proms).then(() => payload) : payload;
				return handleCatchall(proms, input, payload, ctx, _normalized.value, inst);
			};
		});
		const $ZodObjectJIT = /*@__PURE__*/ $constructor("$ZodObjectJIT", (inst, def) => {
			$ZodObject.init(inst, def);
			const superParse = inst._zod.parse;
			const _normalized = cached(() => normalizeDef(def));
			const generateFastpass = (shape) => {
				const doc = new Doc([
					"shape",
					"payload",
					"ctx"
				]);
				const normalized = _normalized.value;
				const parseStr = (key) => {
					const k = esc(key);
					return `shape[${k}]._zod.run({ value: input[${k}], issues: [] }, ctx)`;
				};
				doc.write(`const input = payload.value;`);
				const ids = Object.create(null);
				let counter = 0;
				for (const key of normalized.keys) ids[key] = `key_${counter++}`;
				doc.write(`const newResult = {};`);
				for (const key of normalized.keys) {
					const id = ids[key];
					const k = esc(key);
					const schema = shape[key];
					const isOptionalIn = schema?._zod?.optin === "optional";
					const isOptionalOut = schema?._zod?.optout === "optional";
					doc.write(`const ${id} = ${parseStr(key)};`);
					if (isOptionalIn && isOptionalOut) doc.write(`
        if (${id}.issues.length) {
          if (${k} in input) {
            payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
              ...iss,
              path: iss.path ? [${k}, ...iss.path] : [${k}]
            })));
          }
        }
        
        if (${id}.value === undefined) {
          if (${k} in input) {
            newResult[${k}] = undefined;
          }
        } else {
          newResult[${k}] = ${id}.value;
        }
        
      `);
					else if (!isOptionalIn) doc.write(`
        const ${id}_present = ${k} in input;
        if (${id}.issues.length) {
          payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${k}, ...iss.path] : [${k}]
          })));
        }
        if (!${id}_present && !${id}.issues.length) {
          payload.issues.push({
            code: "invalid_type",
            expected: "nonoptional",
            input: undefined,
            path: [${k}]
          });
        }

        if (${id}_present) {
          if (${id}.value === undefined) {
            newResult[${k}] = undefined;
          } else {
            newResult[${k}] = ${id}.value;
          }
        }

      `);
					else doc.write(`
        if (${id}.issues.length) {
          payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${k}, ...iss.path] : [${k}]
          })));
        }
        
        if (${id}.value === undefined) {
          if (${k} in input) {
            newResult[${k}] = undefined;
          }
        } else {
          newResult[${k}] = ${id}.value;
        }
        
      `);
				}
				doc.write(`payload.value = newResult;`);
				doc.write(`return payload;`);
				const fn = doc.compile();
				return (payload, ctx) => fn(shape, payload, ctx);
			};
			let fastpass;
			const isObject$2 = isObject;
			const jit = !globalConfig.jitless;
			const fastEnabled = jit && allowsEval.value;
			const catchall = def.catchall;
			let value;
			inst._zod.parse = (payload, ctx) => {
				value ?? (value = _normalized.value);
				const input = payload.value;
				if (!isObject$2(input)) {
					payload.issues.push({
						expected: "object",
						code: "invalid_type",
						input,
						inst
					});
					return payload;
				}
				if (jit && fastEnabled && ctx?.async === false && ctx.jitless !== true) {
					if (!fastpass) fastpass = generateFastpass(def.shape);
					payload = fastpass(payload, ctx);
					if (!catchall) return payload;
					return handleCatchall([], input, payload, ctx, value, inst);
				}
				return superParse(payload, ctx);
			};
		});
		function handleUnionResults(results, final, inst, ctx) {
			for (const result of results) if (result.issues.length === 0) {
				final.value = result.value;
				return final;
			}
			const nonaborted = results.filter((r) => !aborted(r));
			if (nonaborted.length === 1) {
				final.value = nonaborted[0].value;
				return nonaborted[0];
			}
			final.issues.push({
				code: "invalid_union",
				input: final.value,
				inst,
				errors: results.map((result) => result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
			});
			return final;
		}
		const $ZodUnion = /*@__PURE__*/ $constructor("$ZodUnion", (inst, def) => {
			$ZodType.init(inst, def);
			defineLazy(inst._zod, "optin", () => def.options.some((o) => o._zod.optin === "optional") ? "optional" : void 0);
			defineLazy(inst._zod, "optout", () => def.options.some((o) => o._zod.optout === "optional") ? "optional" : void 0);
			defineLazy(inst._zod, "values", () => {
				if (def.options.every((o) => o._zod.values)) return new Set(def.options.flatMap((option) => Array.from(option._zod.values)));
			});
			defineLazy(inst._zod, "pattern", () => {
				if (def.options.every((o) => o._zod.pattern)) {
					const patterns = def.options.map((o) => o._zod.pattern);
					return new RegExp(`^(${patterns.map((p) => cleanRegex(p.source)).join("|")})$`);
				}
			});
			const first = def.options.length === 1 ? def.options[0]._zod.run : null;
			inst._zod.parse = (payload, ctx) => {
				if (first) return first(payload, ctx);
				let async = false;
				const results = [];
				for (const option of def.options) {
					const result = option._zod.run({
						value: payload.value,
						issues: []
					}, ctx);
					if (result instanceof Promise) {
						results.push(result);
						async = true;
					} else {
						if (result.issues.length === 0) return result;
						results.push(result);
					}
				}
				if (!async) return handleUnionResults(results, payload, inst, ctx);
				return Promise.all(results).then((results) => {
					return handleUnionResults(results, payload, inst, ctx);
				});
			};
		});
		const $ZodIntersection = /*@__PURE__*/ $constructor("$ZodIntersection", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.parse = (payload, ctx) => {
				const input = payload.value;
				const left = def.left._zod.run({
					value: input,
					issues: []
				}, ctx);
				const right = def.right._zod.run({
					value: input,
					issues: []
				}, ctx);
				if (left instanceof Promise || right instanceof Promise) return Promise.all([left, right]).then(([left, right]) => {
					return handleIntersectionResults(payload, left, right);
				});
				return handleIntersectionResults(payload, left, right);
			};
		});
		function mergeValues(a, b) {
			if (a === b) return {
				valid: true,
				data: a
			};
			if (a instanceof Date && b instanceof Date && +a === +b) return {
				valid: true,
				data: a
			};
			if (isPlainObject(a) && isPlainObject(b)) {
				const bKeys = Object.keys(b);
				const sharedKeys = Object.keys(a).filter((key) => bKeys.indexOf(key) !== -1);
				const newObj = {
					...a,
					...b
				};
				for (const key of sharedKeys) {
					const sharedValue = mergeValues(a[key], b[key]);
					if (!sharedValue.valid) return {
						valid: false,
						mergeErrorPath: [key, ...sharedValue.mergeErrorPath]
					};
					newObj[key] = sharedValue.data;
				}
				return {
					valid: true,
					data: newObj
				};
			}
			if (Array.isArray(a) && Array.isArray(b)) {
				if (a.length !== b.length) return {
					valid: false,
					mergeErrorPath: []
				};
				const newArray = [];
				for (let index = 0; index < a.length; index++) {
					const itemA = a[index];
					const itemB = b[index];
					const sharedValue = mergeValues(itemA, itemB);
					if (!sharedValue.valid) return {
						valid: false,
						mergeErrorPath: [index, ...sharedValue.mergeErrorPath]
					};
					newArray.push(sharedValue.data);
				}
				return {
					valid: true,
					data: newArray
				};
			}
			return {
				valid: false,
				mergeErrorPath: []
			};
		}
		function handleIntersectionResults(result, left, right) {
			const unrecKeys = /* @__PURE__ */ new Map();
			let unrecIssue;
			for (const iss of left.issues) if (iss.code === "unrecognized_keys") {
				unrecIssue ?? (unrecIssue = iss);
				for (const k of iss.keys) {
					if (!unrecKeys.has(k)) unrecKeys.set(k, {});
					unrecKeys.get(k).l = true;
				}
			} else result.issues.push(iss);
			for (const iss of right.issues) if (iss.code === "unrecognized_keys") for (const k of iss.keys) {
				if (!unrecKeys.has(k)) unrecKeys.set(k, {});
				unrecKeys.get(k).r = true;
			}
			else result.issues.push(iss);
			const bothKeys = [...unrecKeys].filter(([, f]) => f.l && f.r).map(([k]) => k);
			if (bothKeys.length && unrecIssue) result.issues.push({
				...unrecIssue,
				keys: bothKeys
			});
			if (aborted(result)) return result;
			const merged = mergeValues(left.value, right.value);
			if (!merged.valid) throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(merged.mergeErrorPath)}`);
			result.value = merged.data;
			return result;
		}
		const $ZodEnum = /*@__PURE__*/ $constructor("$ZodEnum", (inst, def) => {
			$ZodType.init(inst, def);
			const values = getEnumValues(def.entries);
			const valuesSet = new Set(values);
			inst._zod.values = valuesSet;
			inst._zod.pattern = new RegExp(`^(${values.filter((k) => propertyKeyTypes.has(typeof k)).map((o) => typeof o === "string" ? escapeRegex(o) : o.toString()).join("|")})$`);
			inst._zod.parse = (payload, _ctx) => {
				const input = payload.value;
				if (valuesSet.has(input)) return payload;
				payload.issues.push({
					code: "invalid_value",
					values,
					input,
					inst
				});
				return payload;
			};
		});
		const $ZodLiteral = /*@__PURE__*/ $constructor("$ZodLiteral", (inst, def) => {
			$ZodType.init(inst, def);
			if (def.values.length === 0) throw new Error("Cannot create literal schema with no valid values");
			const values = new Set(def.values);
			inst._zod.values = values;
			inst._zod.pattern = new RegExp(`^(${def.values.map((o) => typeof o === "string" ? escapeRegex(o) : o ? escapeRegex(o.toString()) : String(o)).join("|")})$`);
			inst._zod.parse = (payload, _ctx) => {
				const input = payload.value;
				if (values.has(input)) return payload;
				payload.issues.push({
					code: "invalid_value",
					values: def.values,
					input,
					inst
				});
				return payload;
			};
		});
		const $ZodTransform = /*@__PURE__*/ $constructor("$ZodTransform", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.optin = "optional";
			inst._zod.parse = (payload, ctx) => {
				if (ctx.direction === "backward") throw new $ZodEncodeError(inst.constructor.name);
				const _out = def.transform(payload.value, payload);
				if (ctx.async) return (_out instanceof Promise ? _out : Promise.resolve(_out)).then((output) => {
					payload.value = output;
					payload.fallback = true;
					return payload;
				});
				if (_out instanceof Promise) throw new $ZodAsyncError();
				payload.value = _out;
				payload.fallback = true;
				return payload;
			};
		});
		function handleOptionalResult(result, input) {
			if (input === void 0 && (result.issues.length || result.fallback)) return {
				issues: [],
				value: void 0
			};
			return result;
		}
		const $ZodOptional = /*@__PURE__*/ $constructor("$ZodOptional", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.optin = "optional";
			inst._zod.optout = "optional";
			defineLazy(inst._zod, "values", () => {
				return def.innerType._zod.values ? /* @__PURE__ */ new Set([...def.innerType._zod.values, void 0]) : void 0;
			});
			defineLazy(inst._zod, "pattern", () => {
				const pattern = def.innerType._zod.pattern;
				return pattern ? new RegExp(`^(${cleanRegex(pattern.source)})?$`) : void 0;
			});
			inst._zod.parse = (payload, ctx) => {
				if (def.innerType._zod.optin === "optional") {
					const input = payload.value;
					const result = def.innerType._zod.run(payload, ctx);
					if (result instanceof Promise) return result.then((r) => handleOptionalResult(r, input));
					return handleOptionalResult(result, input);
				}
				if (payload.value === void 0) return payload;
				return def.innerType._zod.run(payload, ctx);
			};
		});
		const $ZodExactOptional = /*@__PURE__*/ $constructor("$ZodExactOptional", (inst, def) => {
			$ZodOptional.init(inst, def);
			defineLazy(inst._zod, "values", () => def.innerType._zod.values);
			defineLazy(inst._zod, "pattern", () => def.innerType._zod.pattern);
			inst._zod.parse = (payload, ctx) => {
				return def.innerType._zod.run(payload, ctx);
			};
		});
		const $ZodNullable = /*@__PURE__*/ $constructor("$ZodNullable", (inst, def) => {
			$ZodType.init(inst, def);
			defineLazy(inst._zod, "optin", () => def.innerType._zod.optin);
			defineLazy(inst._zod, "optout", () => def.innerType._zod.optout);
			defineLazy(inst._zod, "pattern", () => {
				const pattern = def.innerType._zod.pattern;
				return pattern ? new RegExp(`^(${cleanRegex(pattern.source)}|null)$`) : void 0;
			});
			defineLazy(inst._zod, "values", () => {
				return def.innerType._zod.values ? /* @__PURE__ */ new Set([...def.innerType._zod.values, null]) : void 0;
			});
			inst._zod.parse = (payload, ctx) => {
				if (payload.value === null) return payload;
				return def.innerType._zod.run(payload, ctx);
			};
		});
		const $ZodDefault = /*@__PURE__*/ $constructor("$ZodDefault", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.optin = "optional";
			defineLazy(inst._zod, "values", () => def.innerType._zod.values);
			inst._zod.parse = (payload, ctx) => {
				if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
				if (payload.value === void 0) {
					payload.value = def.defaultValue;
					/**
					* $ZodDefault returns the default value immediately in forward direction.
					* It doesn't pass the default value into the validator ("prefault"). There's no reason to pass the default value through validation. The validity of the default is enforced by TypeScript statically. Otherwise, it's the responsibility of the user to ensure the default is valid. In the case of pipes with divergent in/out types, you can specify the default on the `in` schema of your ZodPipe to set a "prefault" for the pipe.   */
					return payload;
				}
				const result = def.innerType._zod.run(payload, ctx);
				if (result instanceof Promise) return result.then((result) => handleDefaultResult(result, def));
				return handleDefaultResult(result, def);
			};
		});
		function handleDefaultResult(payload, def) {
			if (payload.value === void 0) payload.value = def.defaultValue;
			return payload;
		}
		const $ZodPrefault = /*@__PURE__*/ $constructor("$ZodPrefault", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.optin = "optional";
			defineLazy(inst._zod, "values", () => def.innerType._zod.values);
			inst._zod.parse = (payload, ctx) => {
				if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
				if (payload.value === void 0) payload.value = def.defaultValue;
				return def.innerType._zod.run(payload, ctx);
			};
		});
		const $ZodNonOptional = /*@__PURE__*/ $constructor("$ZodNonOptional", (inst, def) => {
			$ZodType.init(inst, def);
			defineLazy(inst._zod, "values", () => {
				const v = def.innerType._zod.values;
				return v ? new Set([...v].filter((x) => x !== void 0)) : void 0;
			});
			inst._zod.parse = (payload, ctx) => {
				const result = def.innerType._zod.run(payload, ctx);
				if (result instanceof Promise) return result.then((result) => handleNonOptionalResult(result, inst));
				return handleNonOptionalResult(result, inst);
			};
		});
		function handleNonOptionalResult(payload, inst) {
			if (!payload.issues.length && payload.value === void 0) payload.issues.push({
				code: "invalid_type",
				expected: "nonoptional",
				input: payload.value,
				inst
			});
			return payload;
		}
		const $ZodCatch = /*@__PURE__*/ $constructor("$ZodCatch", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.optin = "optional";
			defineLazy(inst._zod, "optout", () => def.innerType._zod.optout);
			defineLazy(inst._zod, "values", () => def.innerType._zod.values);
			inst._zod.parse = (payload, ctx) => {
				if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
				const result = def.innerType._zod.run(payload, ctx);
				if (result instanceof Promise) return result.then((result) => {
					payload.value = result.value;
					if (result.issues.length) {
						payload.value = def.catchValue({
							...payload,
							error: { issues: result.issues.map((iss) => finalizeIssue(iss, ctx, config())) },
							input: payload.value
						});
						payload.issues = [];
						payload.fallback = true;
					}
					return payload;
				});
				payload.value = result.value;
				if (result.issues.length) {
					payload.value = def.catchValue({
						...payload,
						error: { issues: result.issues.map((iss) => finalizeIssue(iss, ctx, config())) },
						input: payload.value
					});
					payload.issues = [];
					payload.fallback = true;
				}
				return payload;
			};
		});
		const $ZodPipe = /*@__PURE__*/ $constructor("$ZodPipe", (inst, def) => {
			$ZodType.init(inst, def);
			defineLazy(inst._zod, "values", () => def.in._zod.values);
			defineLazy(inst._zod, "optin", () => def.in._zod.optin);
			defineLazy(inst._zod, "optout", () => def.out._zod.optout);
			defineLazy(inst._zod, "propValues", () => def.in._zod.propValues);
			inst._zod.parse = (payload, ctx) => {
				if (ctx.direction === "backward") {
					const right = def.out._zod.run(payload, ctx);
					if (right instanceof Promise) return right.then((right) => handlePipeResult(right, def.in, ctx));
					return handlePipeResult(right, def.in, ctx);
				}
				const left = def.in._zod.run(payload, ctx);
				if (left instanceof Promise) return left.then((left) => handlePipeResult(left, def.out, ctx));
				return handlePipeResult(left, def.out, ctx);
			};
		});
		function handlePipeResult(left, next, ctx) {
			if (left.issues.length) {
				left.aborted = true;
				return left;
			}
			return next._zod.run({
				value: left.value,
				issues: left.issues,
				fallback: left.fallback
			}, ctx);
		}
		const $ZodReadonly = /*@__PURE__*/ $constructor("$ZodReadonly", (inst, def) => {
			$ZodType.init(inst, def);
			defineLazy(inst._zod, "propValues", () => def.innerType._zod.propValues);
			defineLazy(inst._zod, "values", () => def.innerType._zod.values);
			defineLazy(inst._zod, "optin", () => def.innerType?._zod?.optin);
			defineLazy(inst._zod, "optout", () => def.innerType?._zod?.optout);
			inst._zod.parse = (payload, ctx) => {
				if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
				const result = def.innerType._zod.run(payload, ctx);
				if (result instanceof Promise) return result.then(handleReadonlyResult);
				return handleReadonlyResult(result);
			};
		});
		function handleReadonlyResult(payload) {
			payload.value = Object.freeze(payload.value);
			return payload;
		}
		const $ZodCustom = /*@__PURE__*/ $constructor("$ZodCustom", (inst, def) => {
			$ZodCheck.init(inst, def);
			$ZodType.init(inst, def);
			inst._zod.parse = (payload, _) => {
				return payload;
			};
			inst._zod.check = (payload) => {
				const input = payload.value;
				const r = def.fn(input);
				if (r instanceof Promise) return r.then((r) => handleRefineResult(r, payload, input, inst));
				handleRefineResult(r, payload, input, inst);
			};
		});
		function handleRefineResult(result, payload, input, inst) {
			if (!result) {
				const _iss = {
					code: "custom",
					input,
					inst,
					path: [...inst._zod.def.path ?? []],
					continue: !inst._zod.def.abort
				};
				if (inst._zod.def.params) _iss.params = inst._zod.def.params;
				payload.issues.push(issue(_iss));
			}
		}
		//#endregion
		//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/registries.js
		var _a;
		var $ZodRegistry = class {
			constructor() {
				this._map = /* @__PURE__ */ new WeakMap();
				this._idmap = /* @__PURE__ */ new Map();
			}
			add(schema, ..._meta) {
				const meta = _meta[0];
				this._map.set(schema, meta);
				if (meta && typeof meta === "object" && "id" in meta) this._idmap.set(meta.id, schema);
				return this;
			}
			clear() {
				this._map = /* @__PURE__ */ new WeakMap();
				this._idmap = /* @__PURE__ */ new Map();
				return this;
			}
			remove(schema) {
				const meta = this._map.get(schema);
				if (meta && typeof meta === "object" && "id" in meta) this._idmap.delete(meta.id);
				this._map.delete(schema);
				return this;
			}
			get(schema) {
				const p = schema._zod.parent;
				if (p) {
					const pm = { ...this.get(p) ?? {} };
					delete pm.id;
					const f = {
						...pm,
						...this._map.get(schema)
					};
					return Object.keys(f).length ? f : void 0;
				}
				return this._map.get(schema);
			}
			has(schema) {
				return this._map.has(schema);
			}
		};
		function registry() {
			return new $ZodRegistry();
		}
		(_a = globalThis).__zod_globalRegistry ?? (_a.__zod_globalRegistry = registry());
		const globalRegistry = globalThis.__zod_globalRegistry;
		//#endregion
		//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/api.js
		// @__NO_SIDE_EFFECTS__
		function _string(Class, params) {
			return new Class({
				type: "string",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _email(Class, params) {
			return new Class({
				type: "string",
				format: "email",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _guid(Class, params) {
			return new Class({
				type: "string",
				format: "guid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _uuid(Class, params) {
			return new Class({
				type: "string",
				format: "uuid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _uuidv4(Class, params) {
			return new Class({
				type: "string",
				format: "uuid",
				check: "string_format",
				abort: false,
				version: "v4",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _uuidv6(Class, params) {
			return new Class({
				type: "string",
				format: "uuid",
				check: "string_format",
				abort: false,
				version: "v6",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _uuidv7(Class, params) {
			return new Class({
				type: "string",
				format: "uuid",
				check: "string_format",
				abort: false,
				version: "v7",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _url(Class, params) {
			return new Class({
				type: "string",
				format: "url",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _emoji(Class, params) {
			return new Class({
				type: "string",
				format: "emoji",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _nanoid(Class, params) {
			return new Class({
				type: "string",
				format: "nanoid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		/**
		* @deprecated CUID v1 is deprecated by its authors due to information leakage
		* (timestamps embedded in the id). Use {@link _cuid2} instead.
		* See https://github.com/paralleldrive/cuid.
		*/
		// @__NO_SIDE_EFFECTS__
		function _cuid(Class, params) {
			return new Class({
				type: "string",
				format: "cuid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _cuid2(Class, params) {
			return new Class({
				type: "string",
				format: "cuid2",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _ulid(Class, params) {
			return new Class({
				type: "string",
				format: "ulid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _xid(Class, params) {
			return new Class({
				type: "string",
				format: "xid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _ksuid(Class, params) {
			return new Class({
				type: "string",
				format: "ksuid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _ipv4(Class, params) {
			return new Class({
				type: "string",
				format: "ipv4",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _ipv6(Class, params) {
			return new Class({
				type: "string",
				format: "ipv6",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _cidrv4(Class, params) {
			return new Class({
				type: "string",
				format: "cidrv4",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _cidrv6(Class, params) {
			return new Class({
				type: "string",
				format: "cidrv6",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _base64(Class, params) {
			return new Class({
				type: "string",
				format: "base64",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _base64url(Class, params) {
			return new Class({
				type: "string",
				format: "base64url",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _e164(Class, params) {
			return new Class({
				type: "string",
				format: "e164",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _jwt(Class, params) {
			return new Class({
				type: "string",
				format: "jwt",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _isoDateTime(Class, params) {
			return new Class({
				type: "string",
				format: "datetime",
				check: "string_format",
				offset: false,
				local: false,
				precision: null,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _isoDate(Class, params) {
			return new Class({
				type: "string",
				format: "date",
				check: "string_format",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _isoTime(Class, params) {
			return new Class({
				type: "string",
				format: "time",
				check: "string_format",
				precision: null,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _isoDuration(Class, params) {
			return new Class({
				type: "string",
				format: "duration",
				check: "string_format",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _number(Class, params) {
			return new Class({
				type: "number",
				checks: [],
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _int(Class, params) {
			return new Class({
				type: "number",
				check: "number_format",
				abort: false,
				format: "safeint",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _boolean(Class, params) {
			return new Class({
				type: "boolean",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _unknown(Class) {
			return new Class({ type: "unknown" });
		}
		// @__NO_SIDE_EFFECTS__
		function _never(Class, params) {
			return new Class({
				type: "never",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _lt(value, params) {
			return new $ZodCheckLessThan({
				check: "less_than",
				...normalizeParams(params),
				value,
				inclusive: false
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _lte(value, params) {
			return new $ZodCheckLessThan({
				check: "less_than",
				...normalizeParams(params),
				value,
				inclusive: true
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _gt(value, params) {
			return new $ZodCheckGreaterThan({
				check: "greater_than",
				...normalizeParams(params),
				value,
				inclusive: false
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _gte(value, params) {
			return new $ZodCheckGreaterThan({
				check: "greater_than",
				...normalizeParams(params),
				value,
				inclusive: true
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _multipleOf(value, params) {
			return new $ZodCheckMultipleOf({
				check: "multiple_of",
				...normalizeParams(params),
				value
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _maxLength(maximum, params) {
			return new $ZodCheckMaxLength({
				check: "max_length",
				...normalizeParams(params),
				maximum
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _minLength(minimum, params) {
			return new $ZodCheckMinLength({
				check: "min_length",
				...normalizeParams(params),
				minimum
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _length(length, params) {
			return new $ZodCheckLengthEquals({
				check: "length_equals",
				...normalizeParams(params),
				length
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _regex(pattern, params) {
			return new $ZodCheckRegex({
				check: "string_format",
				format: "regex",
				...normalizeParams(params),
				pattern
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _lowercase(params) {
			return new $ZodCheckLowerCase({
				check: "string_format",
				format: "lowercase",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _uppercase(params) {
			return new $ZodCheckUpperCase({
				check: "string_format",
				format: "uppercase",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _includes(includes, params) {
			return new $ZodCheckIncludes({
				check: "string_format",
				format: "includes",
				...normalizeParams(params),
				includes
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _startsWith(prefix, params) {
			return new $ZodCheckStartsWith({
				check: "string_format",
				format: "starts_with",
				...normalizeParams(params),
				prefix
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _endsWith(suffix, params) {
			return new $ZodCheckEndsWith({
				check: "string_format",
				format: "ends_with",
				...normalizeParams(params),
				suffix
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _overwrite(tx) {
			return new $ZodCheckOverwrite({
				check: "overwrite",
				tx
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _normalize(form) {
			return /* @__PURE__ */ _overwrite((input) => input.normalize(form));
		}
		// @__NO_SIDE_EFFECTS__
		function _trim() {
			return /* @__PURE__ */ _overwrite((input) => input.trim());
		}
		// @__NO_SIDE_EFFECTS__
		function _toLowerCase() {
			return /* @__PURE__ */ _overwrite((input) => input.toLowerCase());
		}
		// @__NO_SIDE_EFFECTS__
		function _toUpperCase() {
			return /* @__PURE__ */ _overwrite((input) => input.toUpperCase());
		}
		// @__NO_SIDE_EFFECTS__
		function _slugify() {
			return /* @__PURE__ */ _overwrite((input) => slugify(input));
		}
		// @__NO_SIDE_EFFECTS__
		function _array(Class, element, params) {
			return new Class({
				type: "array",
				element,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _refine(Class, fn, _params) {
			return new Class({
				type: "custom",
				check: "custom",
				fn,
				...normalizeParams(_params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _superRefine(fn, params) {
			const ch = /* @__PURE__ */ _check((payload) => {
				payload.addIssue = (issue$2) => {
					if (typeof issue$2 === "string") payload.issues.push(issue(issue$2, payload.value, ch._zod.def));
					else {
						const _issue = issue$2;
						if (_issue.fatal) _issue.continue = false;
						_issue.code ?? (_issue.code = "custom");
						_issue.input ?? (_issue.input = payload.value);
						_issue.inst ?? (_issue.inst = ch);
						_issue.continue ?? (_issue.continue = !ch._zod.def.abort);
						payload.issues.push(issue(_issue));
					}
				};
				return fn(payload.value, payload);
			}, params);
			return ch;
		}
		// @__NO_SIDE_EFFECTS__
		function _check(fn, params) {
			const ch = new $ZodCheck({
				check: "custom",
				...normalizeParams(params)
			});
			ch._zod.check = fn;
			return ch;
		}
		//#endregion
		//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/to-json-schema.js
		function initializeContext(params) {
			let target = params?.target ?? "draft-2020-12";
			if (target === "draft-4") target = "draft-04";
			if (target === "draft-7") target = "draft-07";
			return {
				processors: params.processors ?? {},
				metadataRegistry: params?.metadata ?? globalRegistry,
				target,
				unrepresentable: params?.unrepresentable ?? "throw",
				override: params?.override ?? (() => {}),
				io: params?.io ?? "output",
				counter: 0,
				seen: /* @__PURE__ */ new Map(),
				cycles: params?.cycles ?? "ref",
				reused: params?.reused ?? "inline",
				external: params?.external ?? void 0
			};
		}
		function process(schema, ctx, _params = {
			path: [],
			schemaPath: []
		}) {
			var _a;
			const def = schema._zod.def;
			const seen = ctx.seen.get(schema);
			if (seen) {
				seen.count++;
				if (_params.schemaPath.includes(schema)) seen.cycle = _params.path;
				return seen.schema;
			}
			const result = {
				schema: {},
				count: 1,
				cycle: void 0,
				path: _params.path
			};
			ctx.seen.set(schema, result);
			const overrideSchema = schema._zod.toJSONSchema?.();
			if (overrideSchema) result.schema = overrideSchema;
			else {
				const params = {
					..._params,
					schemaPath: [..._params.schemaPath, schema],
					path: _params.path
				};
				if (schema._zod.processJSONSchema) schema._zod.processJSONSchema(ctx, result.schema, params);
				else {
					const _json = result.schema;
					const processor = ctx.processors[def.type];
					if (!processor) throw new Error(`[toJSONSchema]: Non-representable type encountered: ${def.type}`);
					processor(schema, ctx, _json, params);
				}
				const parent = schema._zod.parent;
				if (parent) {
					if (!result.ref) result.ref = parent;
					process(parent, ctx, params);
					ctx.seen.get(parent).isParent = true;
				}
			}
			const meta = ctx.metadataRegistry.get(schema);
			if (meta) Object.assign(result.schema, meta);
			if (ctx.io === "input" && isTransforming(schema)) {
				delete result.schema.examples;
				delete result.schema.default;
			}
			if (ctx.io === "input" && "_prefault" in result.schema) (_a = result.schema).default ?? (_a.default = result.schema._prefault);
			delete result.schema._prefault;
			return ctx.seen.get(schema).schema;
		}
		function extractDefs(ctx, schema) {
			const root = ctx.seen.get(schema);
			if (!root) throw new Error("Unprocessed schema. This is a bug in Zod.");
			const idToSchema = /* @__PURE__ */ new Map();
			for (const entry of ctx.seen.entries()) {
				const id = ctx.metadataRegistry.get(entry[0])?.id;
				if (id) {
					const existing = idToSchema.get(id);
					if (existing && existing !== entry[0]) throw new Error(`Duplicate schema id "${id}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`);
					idToSchema.set(id, entry[0]);
				}
			}
			const makeURI = (entry) => {
				const defsSegment = ctx.target === "draft-2020-12" ? "$defs" : "definitions";
				if (ctx.external) {
					const externalId = ctx.external.registry.get(entry[0])?.id;
					const uriGenerator = ctx.external.uri ?? ((id) => id);
					if (externalId) return { ref: uriGenerator(externalId) };
					const id = entry[1].defId ?? entry[1].schema.id ?? `schema${ctx.counter++}`;
					entry[1].defId = id;
					return {
						defId: id,
						ref: `${uriGenerator("__shared")}#/${defsSegment}/${id}`
					};
				}
				if (entry[1] === root) return { ref: "#" };
				const defUriPrefix = `#/${defsSegment}/`;
				const defId = entry[1].schema.id ?? `__schema${ctx.counter++}`;
				return {
					defId,
					ref: defUriPrefix + defId
				};
			};
			const extractToDef = (entry) => {
				if (entry[1].schema.$ref) return;
				const seen = entry[1];
				const { ref, defId } = makeURI(entry);
				seen.def = { ...seen.schema };
				if (defId) seen.defId = defId;
				const schema = seen.schema;
				for (const key in schema) delete schema[key];
				schema.$ref = ref;
			};
			if (ctx.cycles === "throw") for (const entry of ctx.seen.entries()) {
				const seen = entry[1];
				if (seen.cycle) throw new Error(`Cycle detected: #/${seen.cycle?.join("/")}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`);
			}
			for (const entry of ctx.seen.entries()) {
				const seen = entry[1];
				if (schema === entry[0]) {
					extractToDef(entry);
					continue;
				}
				if (ctx.external) {
					const ext = ctx.external.registry.get(entry[0])?.id;
					if (schema !== entry[0] && ext) {
						extractToDef(entry);
						continue;
					}
				}
				if (ctx.metadataRegistry.get(entry[0])?.id) {
					extractToDef(entry);
					continue;
				}
				if (seen.cycle) {
					extractToDef(entry);
					continue;
				}
				if (seen.count > 1) {
					if (ctx.reused === "ref") {
						extractToDef(entry);
						continue;
					}
				}
			}
		}
		function finalize(ctx, schema) {
			const root = ctx.seen.get(schema);
			if (!root) throw new Error("Unprocessed schema. This is a bug in Zod.");
			const flattenRef = (zodSchema) => {
				const seen = ctx.seen.get(zodSchema);
				if (seen.ref === null) return;
				const schema = seen.def ?? seen.schema;
				const _cached = { ...schema };
				const ref = seen.ref;
				seen.ref = null;
				if (ref) {
					flattenRef(ref);
					const refSeen = ctx.seen.get(ref);
					const refSchema = refSeen.schema;
					if (refSchema.$ref && (ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0")) {
						schema.allOf = schema.allOf ?? [];
						schema.allOf.push(refSchema);
					} else Object.assign(schema, refSchema);
					Object.assign(schema, _cached);
					if (zodSchema._zod.parent === ref) for (const key in schema) {
						if (key === "$ref" || key === "allOf") continue;
						if (!(key in _cached)) delete schema[key];
					}
					if (refSchema.$ref && refSeen.def) for (const key in schema) {
						if (key === "$ref" || key === "allOf") continue;
						if (key in refSeen.def && JSON.stringify(schema[key]) === JSON.stringify(refSeen.def[key])) delete schema[key];
					}
				}
				const parent = zodSchema._zod.parent;
				if (parent && parent !== ref) {
					flattenRef(parent);
					const parentSeen = ctx.seen.get(parent);
					if (parentSeen?.schema.$ref) {
						schema.$ref = parentSeen.schema.$ref;
						if (parentSeen.def) for (const key in schema) {
							if (key === "$ref" || key === "allOf") continue;
							if (key in parentSeen.def && JSON.stringify(schema[key]) === JSON.stringify(parentSeen.def[key])) delete schema[key];
						}
					}
				}
				ctx.override({
					zodSchema,
					jsonSchema: schema,
					path: seen.path ?? []
				});
			};
			for (const entry of [...ctx.seen.entries()].reverse()) flattenRef(entry[0]);
			const result = {};
			if (ctx.target === "draft-2020-12") result.$schema = "https://json-schema.org/draft/2020-12/schema";
			else if (ctx.target === "draft-07") result.$schema = "http://json-schema.org/draft-07/schema#";
			else if (ctx.target === "draft-04") result.$schema = "http://json-schema.org/draft-04/schema#";
			else if (ctx.target === "openapi-3.0") {}
			if (ctx.external?.uri) {
				const id = ctx.external.registry.get(schema)?.id;
				if (!id) throw new Error("Schema is missing an `id` property");
				result.$id = ctx.external.uri(id);
			}
			Object.assign(result, root.def ?? root.schema);
			const rootMetaId = ctx.metadataRegistry.get(schema)?.id;
			if (rootMetaId !== void 0 && result.id === rootMetaId) delete result.id;
			const defs = ctx.external?.defs ?? {};
			for (const entry of ctx.seen.entries()) {
				const seen = entry[1];
				if (seen.def && seen.defId) {
					if (seen.def.id === seen.defId) delete seen.def.id;
					defs[seen.defId] = seen.def;
				}
			}
			if (ctx.external) {} else if (Object.keys(defs).length > 0) {
				if (ctx.target === "draft-2020-12") result.$defs = defs;
				else result.definitions = defs;
			}
			try {
				const finalized = JSON.parse(JSON.stringify(result));
				Object.defineProperty(finalized, "~standard", {
					value: {
						...schema["~standard"],
						jsonSchema: {
							input: createStandardJSONSchemaMethod(schema, "input", ctx.processors),
							output: createStandardJSONSchemaMethod(schema, "output", ctx.processors)
						}
					},
					enumerable: false,
					writable: false
				});
				return finalized;
			} catch (_err) {
				throw new Error("Error converting schema to JSON.");
			}
		}
		function isTransforming(_schema, _ctx) {
			const ctx = _ctx ?? { seen: /* @__PURE__ */ new Set() };
			if (ctx.seen.has(_schema)) return false;
			ctx.seen.add(_schema);
			const def = _schema._zod.def;
			if (def.type === "transform") return true;
			if (def.type === "array") return isTransforming(def.element, ctx);
			if (def.type === "set") return isTransforming(def.valueType, ctx);
			if (def.type === "lazy") return isTransforming(def.getter(), ctx);
			if (def.type === "promise" || def.type === "optional" || def.type === "nonoptional" || def.type === "nullable" || def.type === "readonly" || def.type === "default" || def.type === "prefault") return isTransforming(def.innerType, ctx);
			if (def.type === "intersection") return isTransforming(def.left, ctx) || isTransforming(def.right, ctx);
			if (def.type === "record" || def.type === "map") return isTransforming(def.keyType, ctx) || isTransforming(def.valueType, ctx);
			if (def.type === "pipe") {
				if (_schema._zod.traits.has("$ZodCodec")) return true;
				return isTransforming(def.in, ctx) || isTransforming(def.out, ctx);
			}
			if (def.type === "object") {
				for (const key in def.shape) if (isTransforming(def.shape[key], ctx)) return true;
				return false;
			}
			if (def.type === "union") {
				for (const option of def.options) if (isTransforming(option, ctx)) return true;
				return false;
			}
			if (def.type === "tuple") {
				for (const item of def.items) if (isTransforming(item, ctx)) return true;
				if (def.rest && isTransforming(def.rest, ctx)) return true;
				return false;
			}
			return false;
		}
		/**
		* Creates a toJSONSchema method for a schema instance.
		* This encapsulates the logic of initializing context, processing, extracting defs, and finalizing.
		*/
		const createToJSONSchemaMethod = (schema, processors = {}) => (params) => {
			const ctx = initializeContext({
				...params,
				processors
			});
			process(schema, ctx);
			extractDefs(ctx, schema);
			return finalize(ctx, schema);
		};
		const createStandardJSONSchemaMethod = (schema, io, processors = {}) => (params) => {
			const { libraryOptions, target } = params ?? {};
			const ctx = initializeContext({
				...libraryOptions ?? {},
				target,
				io,
				processors
			});
			process(schema, ctx);
			extractDefs(ctx, schema);
			return finalize(ctx, schema);
		};
		//#endregion
		//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/json-schema-processors.js
		const formatMap = {
			guid: "uuid",
			url: "uri",
			datetime: "date-time",
			json_string: "json-string",
			regex: ""
		};
		const stringProcessor = (schema, ctx, _json, _params) => {
			const json = _json;
			json.type = "string";
			const { minimum, maximum, format, patterns, contentEncoding } = schema._zod.bag;
			if (typeof minimum === "number") json.minLength = minimum;
			if (typeof maximum === "number") json.maxLength = maximum;
			if (format) {
				json.format = formatMap[format] ?? format;
				if (json.format === "") delete json.format;
				if (format === "time") delete json.format;
			}
			if (contentEncoding) json.contentEncoding = contentEncoding;
			if (patterns && patterns.size > 0) {
				const regexes = [...patterns];
				if (regexes.length === 1) json.pattern = regexes[0].source;
				else if (regexes.length > 1) json.allOf = [...regexes.map((regex) => ({
					...ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0" ? { type: "string" } : {},
					pattern: regex.source
				}))];
			}
		};
		const numberProcessor = (schema, ctx, _json, _params) => {
			const json = _json;
			const { minimum, maximum, format, multipleOf, exclusiveMaximum, exclusiveMinimum } = schema._zod.bag;
			if (typeof format === "string" && format.includes("int")) json.type = "integer";
			else json.type = "number";
			const exMin = typeof exclusiveMinimum === "number" && exclusiveMinimum >= (minimum ?? Number.NEGATIVE_INFINITY);
			const exMax = typeof exclusiveMaximum === "number" && exclusiveMaximum <= (maximum ?? Number.POSITIVE_INFINITY);
			const legacy = ctx.target === "draft-04" || ctx.target === "openapi-3.0";
			if (exMin) {
				if (legacy) {
					json.minimum = exclusiveMinimum;
					json.exclusiveMinimum = true;
				} else json.exclusiveMinimum = exclusiveMinimum;
			} else if (typeof minimum === "number") json.minimum = minimum;
			if (exMax) {
				if (legacy) {
					json.maximum = exclusiveMaximum;
					json.exclusiveMaximum = true;
				} else json.exclusiveMaximum = exclusiveMaximum;
			} else if (typeof maximum === "number") json.maximum = maximum;
			if (typeof multipleOf === "number") json.multipleOf = multipleOf;
		};
		const booleanProcessor = (_schema, _ctx, json, _params) => {
			json.type = "boolean";
		};
		const neverProcessor = (_schema, _ctx, json, _params) => {
			json.not = {};
		};
		const enumProcessor = (schema, _ctx, json, _params) => {
			const def = schema._zod.def;
			const values = getEnumValues(def.entries);
			if (values.every((v) => typeof v === "number")) json.type = "number";
			if (values.every((v) => typeof v === "string")) json.type = "string";
			json.enum = values;
		};
		const literalProcessor = (schema, ctx, json, _params) => {
			const def = schema._zod.def;
			const vals = [];
			for (const val of def.values) if (val === void 0) {
				if (ctx.unrepresentable === "throw") throw new Error("Literal `undefined` cannot be represented in JSON Schema");
			} else if (typeof val === "bigint") {
				if (ctx.unrepresentable === "throw") throw new Error("BigInt literals cannot be represented in JSON Schema");
				else vals.push(Number(val));
			} else vals.push(val);
			if (vals.length === 0) {} else if (vals.length === 1) {
				const val = vals[0];
				json.type = val === null ? "null" : typeof val;
				if (ctx.target === "draft-04" || ctx.target === "openapi-3.0") json.enum = [val];
				else json.const = val;
			} else {
				if (vals.every((v) => typeof v === "number")) json.type = "number";
				if (vals.every((v) => typeof v === "string")) json.type = "string";
				if (vals.every((v) => typeof v === "boolean")) json.type = "boolean";
				if (vals.every((v) => v === null)) json.type = "null";
				json.enum = vals;
			}
		};
		const customProcessor = (_schema, ctx, _json, _params) => {
			if (ctx.unrepresentable === "throw") throw new Error("Custom types cannot be represented in JSON Schema");
		};
		const transformProcessor = (_schema, ctx, _json, _params) => {
			if (ctx.unrepresentable === "throw") throw new Error("Transforms cannot be represented in JSON Schema");
		};
		const arrayProcessor = (schema, ctx, _json, params) => {
			const json = _json;
			const def = schema._zod.def;
			const { minimum, maximum } = schema._zod.bag;
			if (typeof minimum === "number") json.minItems = minimum;
			if (typeof maximum === "number") json.maxItems = maximum;
			json.type = "array";
			json.items = process(def.element, ctx, {
				...params,
				path: [...params.path, "items"]
			});
		};
		const objectProcessor = (schema, ctx, _json, params) => {
			const json = _json;
			const def = schema._zod.def;
			json.type = "object";
			json.properties = {};
			const shape = def.shape;
			for (const key in shape) json.properties[key] = process(shape[key], ctx, {
				...params,
				path: [
					...params.path,
					"properties",
					key
				]
			});
			const allKeys = new Set(Object.keys(shape));
			const requiredKeys = new Set([...allKeys].filter((key) => {
				const v = def.shape[key]._zod;
				if (ctx.io === "input") return v.optin === void 0;
				else return v.optout === void 0;
			}));
			if (requiredKeys.size > 0) json.required = Array.from(requiredKeys);
			if (def.catchall?._zod.def.type === "never") json.additionalProperties = false;
			else if (!def.catchall) {
				if (ctx.io === "output") json.additionalProperties = false;
			} else if (def.catchall) json.additionalProperties = process(def.catchall, ctx, {
				...params,
				path: [...params.path, "additionalProperties"]
			});
		};
		const unionProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			const isExclusive = def.inclusive === false;
			const options = def.options.map((x, i) => process(x, ctx, {
				...params,
				path: [
					...params.path,
					isExclusive ? "oneOf" : "anyOf",
					i
				]
			}));
			if (isExclusive) json.oneOf = options;
			else json.anyOf = options;
		};
		const intersectionProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			const a = process(def.left, ctx, {
				...params,
				path: [
					...params.path,
					"allOf",
					0
				]
			});
			const b = process(def.right, ctx, {
				...params,
				path: [
					...params.path,
					"allOf",
					1
				]
			});
			const isSimpleIntersection = (val) => "allOf" in val && Object.keys(val).length === 1;
			json.allOf = [...isSimpleIntersection(a) ? a.allOf : [a], ...isSimpleIntersection(b) ? b.allOf : [b]];
		};
		const nullableProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			const inner = process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			if (ctx.target === "openapi-3.0") {
				seen.ref = def.innerType;
				json.nullable = true;
			} else json.anyOf = [inner, { type: "null" }];
		};
		const nonoptionalProcessor = (schema, ctx, _json, params) => {
			const def = schema._zod.def;
			process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = def.innerType;
		};
		const defaultProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = def.innerType;
			json.default = JSON.parse(JSON.stringify(def.defaultValue));
		};
		const prefaultProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = def.innerType;
			if (ctx.io === "input") json._prefault = JSON.parse(JSON.stringify(def.defaultValue));
		};
		const catchProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = def.innerType;
			let catchValue;
			try {
				catchValue = def.catchValue(void 0);
			} catch {
				throw new Error("Dynamic catch values are not supported in JSON Schema");
			}
			json.default = catchValue;
		};
		const pipeProcessor = (schema, ctx, _json, params) => {
			const def = schema._zod.def;
			const inIsTransform = def.in._zod.traits.has("$ZodTransform");
			const innerType = ctx.io === "input" ? inIsTransform ? def.out : def.in : def.out;
			process(innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = innerType;
		};
		const readonlyProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = def.innerType;
			json.readOnly = true;
		};
		const optionalProcessor = (schema, ctx, _json, params) => {
			const def = schema._zod.def;
			process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = def.innerType;
		};
		//#endregion
		//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/iso.js
		const ZodISODateTime = /*@__PURE__*/ $constructor("ZodISODateTime", (inst, def) => {
			$ZodISODateTime.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		function datetime(params) {
			return /* @__PURE__ */ _isoDateTime(ZodISODateTime, params);
		}
		const ZodISODate = /*@__PURE__*/ $constructor("ZodISODate", (inst, def) => {
			$ZodISODate.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		function date(params) {
			return /* @__PURE__ */ _isoDate(ZodISODate, params);
		}
		const ZodISOTime = /*@__PURE__*/ $constructor("ZodISOTime", (inst, def) => {
			$ZodISOTime.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		function time(params) {
			return /* @__PURE__ */ _isoTime(ZodISOTime, params);
		}
		const ZodISODuration = /*@__PURE__*/ $constructor("ZodISODuration", (inst, def) => {
			$ZodISODuration.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		function duration(params) {
			return /* @__PURE__ */ _isoDuration(ZodISODuration, params);
		}
		//#endregion
		//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/errors.js
		const initializer = (inst, issues) => {
			$ZodError.init(inst, issues);
			inst.name = "ZodError";
			Object.defineProperties(inst, {
				format: { value: (mapper) => formatError(inst, mapper) },
				flatten: { value: (mapper) => flattenError(inst, mapper) },
				addIssue: { value: (issue) => {
					inst.issues.push(issue);
					inst.message = JSON.stringify(inst.issues, jsonStringifyReplacer, 2);
				} },
				addIssues: { value: (issues) => {
					inst.issues.push(...issues);
					inst.message = JSON.stringify(inst.issues, jsonStringifyReplacer, 2);
				} },
				isEmpty: { get() {
					return inst.issues.length === 0;
				} }
			});
		};
		const ZodRealError = /*@__PURE__*/ $constructor("ZodError", initializer, { Parent: Error });
		//#endregion
		//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/parse.js
		const parse = /* @__PURE__ */ _parse(ZodRealError);
		const parseAsync = /* @__PURE__ */ _parseAsync(ZodRealError);
		const safeParse = /* @__PURE__ */ _safeParse(ZodRealError);
		const safeParseAsync = /* @__PURE__ */ _safeParseAsync(ZodRealError);
		const encode = /* @__PURE__ */ _encode(ZodRealError);
		const decode = /* @__PURE__ */ _decode(ZodRealError);
		const encodeAsync = /* @__PURE__ */ _encodeAsync(ZodRealError);
		const decodeAsync = /* @__PURE__ */ _decodeAsync(ZodRealError);
		const safeEncode = /* @__PURE__ */ _safeEncode(ZodRealError);
		const safeDecode = /* @__PURE__ */ _safeDecode(ZodRealError);
		const safeEncodeAsync = /* @__PURE__ */ _safeEncodeAsync(ZodRealError);
		const safeDecodeAsync = /* @__PURE__ */ _safeDecodeAsync(ZodRealError);
		//#endregion
		//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/schemas.js
		const _installedGroups = /* @__PURE__ */ new WeakMap();
		function _installLazyMethods(inst, group, methods) {
			const proto = Object.getPrototypeOf(inst);
			let installed = _installedGroups.get(proto);
			if (!installed) {
				installed = /* @__PURE__ */ new Set();
				_installedGroups.set(proto, installed);
			}
			if (installed.has(group)) return;
			installed.add(group);
			for (const key in methods) {
				const fn = methods[key];
				Object.defineProperty(proto, key, {
					configurable: true,
					enumerable: false,
					get() {
						const bound = fn.bind(this);
						Object.defineProperty(this, key, {
							configurable: true,
							writable: true,
							enumerable: true,
							value: bound
						});
						return bound;
					},
					set(v) {
						Object.defineProperty(this, key, {
							configurable: true,
							writable: true,
							enumerable: true,
							value: v
						});
					}
				});
			}
		}
		const ZodType = /*@__PURE__*/ $constructor("ZodType", (inst, def) => {
			$ZodType.init(inst, def);
			Object.assign(inst["~standard"], { jsonSchema: {
				input: createStandardJSONSchemaMethod(inst, "input"),
				output: createStandardJSONSchemaMethod(inst, "output")
			} });
			inst.toJSONSchema = createToJSONSchemaMethod(inst, {});
			inst.def = def;
			inst.type = def.type;
			Object.defineProperty(inst, "_def", { value: def });
			inst.parse = (data, params) => parse(inst, data, params, { callee: inst.parse });
			inst.safeParse = (data, params) => safeParse(inst, data, params);
			inst.parseAsync = async (data, params) => parseAsync(inst, data, params, { callee: inst.parseAsync });
			inst.safeParseAsync = async (data, params) => safeParseAsync(inst, data, params);
			inst.spa = inst.safeParseAsync;
			inst.encode = (data, params) => encode(inst, data, params);
			inst.decode = (data, params) => decode(inst, data, params);
			inst.encodeAsync = async (data, params) => encodeAsync(inst, data, params);
			inst.decodeAsync = async (data, params) => decodeAsync(inst, data, params);
			inst.safeEncode = (data, params) => safeEncode(inst, data, params);
			inst.safeDecode = (data, params) => safeDecode(inst, data, params);
			inst.safeEncodeAsync = async (data, params) => safeEncodeAsync(inst, data, params);
			inst.safeDecodeAsync = async (data, params) => safeDecodeAsync(inst, data, params);
			_installLazyMethods(inst, "ZodType", {
				check(...chks) {
					const def = this.def;
					return this.clone(mergeDefs(def, { checks: [...def.checks ?? [], ...chks.map((ch) => typeof ch === "function" ? { _zod: {
						check: ch,
						def: { check: "custom" },
						onattach: []
					} } : ch)] }), { parent: true });
				},
				with(...chks) {
					return this.check(...chks);
				},
				clone(def, params) {
					return clone(this, def, params);
				},
				brand() {
					return this;
				},
				register(reg, meta) {
					reg.add(this, meta);
					return this;
				},
				refine(check, params) {
					return this.check(refine(check, params));
				},
				superRefine(refinement, params) {
					return this.check(superRefine(refinement, params));
				},
				overwrite(fn) {
					return this.check(/* @__PURE__ */ _overwrite(fn));
				},
				optional() {
					return optional(this);
				},
				exactOptional() {
					return exactOptional(this);
				},
				nullable() {
					return nullable(this);
				},
				nullish() {
					return optional(nullable(this));
				},
				nonoptional(params) {
					return nonoptional(this, params);
				},
				array() {
					return array(this);
				},
				or(arg) {
					return union([this, arg]);
				},
				and(arg) {
					return intersection(this, arg);
				},
				transform(tx) {
					return pipe(this, transform(tx));
				},
				default(d) {
					return _default(this, d);
				},
				prefault(d) {
					return prefault(this, d);
				},
				catch(params) {
					return _catch(this, params);
				},
				pipe(target) {
					return pipe(this, target);
				},
				readonly() {
					return readonly(this);
				},
				describe(description) {
					const cl = this.clone();
					globalRegistry.add(cl, { description });
					return cl;
				},
				meta(...args) {
					if (args.length === 0) return globalRegistry.get(this);
					const cl = this.clone();
					globalRegistry.add(cl, args[0]);
					return cl;
				},
				isOptional() {
					return this.safeParse(void 0).success;
				},
				isNullable() {
					return this.safeParse(null).success;
				},
				apply(fn) {
					return fn(this);
				}
			});
			Object.defineProperty(inst, "description", {
				get() {
					return globalRegistry.get(inst)?.description;
				},
				configurable: true
			});
			return inst;
		});
		/** @internal */
		const _ZodString = /*@__PURE__*/ $constructor("_ZodString", (inst, def) => {
			$ZodString.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => stringProcessor(inst, ctx, json, params);
			const bag = inst._zod.bag;
			inst.format = bag.format ?? null;
			inst.minLength = bag.minimum ?? null;
			inst.maxLength = bag.maximum ?? null;
			_installLazyMethods(inst, "_ZodString", {
				regex(...args) {
					return this.check(/* @__PURE__ */ _regex(...args));
				},
				includes(...args) {
					return this.check(/* @__PURE__ */ _includes(...args));
				},
				startsWith(...args) {
					return this.check(/* @__PURE__ */ _startsWith(...args));
				},
				endsWith(...args) {
					return this.check(/* @__PURE__ */ _endsWith(...args));
				},
				min(...args) {
					return this.check(/* @__PURE__ */ _minLength(...args));
				},
				max(...args) {
					return this.check(/* @__PURE__ */ _maxLength(...args));
				},
				length(...args) {
					return this.check(/* @__PURE__ */ _length(...args));
				},
				nonempty(...args) {
					return this.check(/* @__PURE__ */ _minLength(1, ...args));
				},
				lowercase(params) {
					return this.check(/* @__PURE__ */ _lowercase(params));
				},
				uppercase(params) {
					return this.check(/* @__PURE__ */ _uppercase(params));
				},
				trim() {
					return this.check(/* @__PURE__ */ _trim());
				},
				normalize(...args) {
					return this.check(/* @__PURE__ */ _normalize(...args));
				},
				toLowerCase() {
					return this.check(/* @__PURE__ */ _toLowerCase());
				},
				toUpperCase() {
					return this.check(/* @__PURE__ */ _toUpperCase());
				},
				slugify() {
					return this.check(/* @__PURE__ */ _slugify());
				}
			});
		});
		const ZodString = /*@__PURE__*/ $constructor("ZodString", (inst, def) => {
			$ZodString.init(inst, def);
			_ZodString.init(inst, def);
			inst.email = (params) => inst.check(/* @__PURE__ */ _email(ZodEmail, params));
			inst.url = (params) => inst.check(/* @__PURE__ */ _url(ZodURL, params));
			inst.jwt = (params) => inst.check(/* @__PURE__ */ _jwt(ZodJWT, params));
			inst.emoji = (params) => inst.check(/* @__PURE__ */ _emoji(ZodEmoji, params));
			inst.guid = (params) => inst.check(/* @__PURE__ */ _guid(ZodGUID, params));
			inst.uuid = (params) => inst.check(/* @__PURE__ */ _uuid(ZodUUID, params));
			inst.uuidv4 = (params) => inst.check(/* @__PURE__ */ _uuidv4(ZodUUID, params));
			inst.uuidv6 = (params) => inst.check(/* @__PURE__ */ _uuidv6(ZodUUID, params));
			inst.uuidv7 = (params) => inst.check(/* @__PURE__ */ _uuidv7(ZodUUID, params));
			inst.nanoid = (params) => inst.check(/* @__PURE__ */ _nanoid(ZodNanoID, params));
			inst.guid = (params) => inst.check(/* @__PURE__ */ _guid(ZodGUID, params));
			inst.cuid = (params) => inst.check(/* @__PURE__ */ _cuid(ZodCUID, params));
			inst.cuid2 = (params) => inst.check(/* @__PURE__ */ _cuid2(ZodCUID2, params));
			inst.ulid = (params) => inst.check(/* @__PURE__ */ _ulid(ZodULID, params));
			inst.base64 = (params) => inst.check(/* @__PURE__ */ _base64(ZodBase64, params));
			inst.base64url = (params) => inst.check(/* @__PURE__ */ _base64url(ZodBase64URL, params));
			inst.xid = (params) => inst.check(/* @__PURE__ */ _xid(ZodXID, params));
			inst.ksuid = (params) => inst.check(/* @__PURE__ */ _ksuid(ZodKSUID, params));
			inst.ipv4 = (params) => inst.check(/* @__PURE__ */ _ipv4(ZodIPv4, params));
			inst.ipv6 = (params) => inst.check(/* @__PURE__ */ _ipv6(ZodIPv6, params));
			inst.cidrv4 = (params) => inst.check(/* @__PURE__ */ _cidrv4(ZodCIDRv4, params));
			inst.cidrv6 = (params) => inst.check(/* @__PURE__ */ _cidrv6(ZodCIDRv6, params));
			inst.e164 = (params) => inst.check(/* @__PURE__ */ _e164(ZodE164, params));
			inst.datetime = (params) => inst.check(datetime(params));
			inst.date = (params) => inst.check(date(params));
			inst.time = (params) => inst.check(time(params));
			inst.duration = (params) => inst.check(duration(params));
		});
		function string(params) {
			return /* @__PURE__ */ _string(ZodString, params);
		}
		const ZodStringFormat = /*@__PURE__*/ $constructor("ZodStringFormat", (inst, def) => {
			$ZodStringFormat.init(inst, def);
			_ZodString.init(inst, def);
		});
		const ZodEmail = /*@__PURE__*/ $constructor("ZodEmail", (inst, def) => {
			$ZodEmail.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodGUID = /*@__PURE__*/ $constructor("ZodGUID", (inst, def) => {
			$ZodGUID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodUUID = /*@__PURE__*/ $constructor("ZodUUID", (inst, def) => {
			$ZodUUID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodURL = /*@__PURE__*/ $constructor("ZodURL", (inst, def) => {
			$ZodURL.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodEmoji = /*@__PURE__*/ $constructor("ZodEmoji", (inst, def) => {
			$ZodEmoji.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodNanoID = /*@__PURE__*/ $constructor("ZodNanoID", (inst, def) => {
			$ZodNanoID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		/**
		* @deprecated CUID v1 is deprecated by its authors due to information leakage
		* (timestamps embedded in the id). Use {@link ZodCUID2} instead.
		* See https://github.com/paralleldrive/cuid.
		*/
		const ZodCUID = /*@__PURE__*/ $constructor("ZodCUID", (inst, def) => {
			$ZodCUID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodCUID2 = /*@__PURE__*/ $constructor("ZodCUID2", (inst, def) => {
			$ZodCUID2.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodULID = /*@__PURE__*/ $constructor("ZodULID", (inst, def) => {
			$ZodULID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodXID = /*@__PURE__*/ $constructor("ZodXID", (inst, def) => {
			$ZodXID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodKSUID = /*@__PURE__*/ $constructor("ZodKSUID", (inst, def) => {
			$ZodKSUID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodIPv4 = /*@__PURE__*/ $constructor("ZodIPv4", (inst, def) => {
			$ZodIPv4.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodIPv6 = /*@__PURE__*/ $constructor("ZodIPv6", (inst, def) => {
			$ZodIPv6.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodCIDRv4 = /*@__PURE__*/ $constructor("ZodCIDRv4", (inst, def) => {
			$ZodCIDRv4.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodCIDRv6 = /*@__PURE__*/ $constructor("ZodCIDRv6", (inst, def) => {
			$ZodCIDRv6.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodBase64 = /*@__PURE__*/ $constructor("ZodBase64", (inst, def) => {
			$ZodBase64.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodBase64URL = /*@__PURE__*/ $constructor("ZodBase64URL", (inst, def) => {
			$ZodBase64URL.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodE164 = /*@__PURE__*/ $constructor("ZodE164", (inst, def) => {
			$ZodE164.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodJWT = /*@__PURE__*/ $constructor("ZodJWT", (inst, def) => {
			$ZodJWT.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodNumber = /*@__PURE__*/ $constructor("ZodNumber", (inst, def) => {
			$ZodNumber.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => numberProcessor(inst, ctx, json, params);
			_installLazyMethods(inst, "ZodNumber", {
				gt(value, params) {
					return this.check(/* @__PURE__ */ _gt(value, params));
				},
				gte(value, params) {
					return this.check(/* @__PURE__ */ _gte(value, params));
				},
				min(value, params) {
					return this.check(/* @__PURE__ */ _gte(value, params));
				},
				lt(value, params) {
					return this.check(/* @__PURE__ */ _lt(value, params));
				},
				lte(value, params) {
					return this.check(/* @__PURE__ */ _lte(value, params));
				},
				max(value, params) {
					return this.check(/* @__PURE__ */ _lte(value, params));
				},
				int(params) {
					return this.check(int(params));
				},
				safe(params) {
					return this.check(int(params));
				},
				positive(params) {
					return this.check(/* @__PURE__ */ _gt(0, params));
				},
				nonnegative(params) {
					return this.check(/* @__PURE__ */ _gte(0, params));
				},
				negative(params) {
					return this.check(/* @__PURE__ */ _lt(0, params));
				},
				nonpositive(params) {
					return this.check(/* @__PURE__ */ _lte(0, params));
				},
				multipleOf(value, params) {
					return this.check(/* @__PURE__ */ _multipleOf(value, params));
				},
				step(value, params) {
					return this.check(/* @__PURE__ */ _multipleOf(value, params));
				},
				finite() {
					return this;
				}
			});
			const bag = inst._zod.bag;
			inst.minValue = Math.max(bag.minimum ?? Number.NEGATIVE_INFINITY, bag.exclusiveMinimum ?? Number.NEGATIVE_INFINITY) ?? null;
			inst.maxValue = Math.min(bag.maximum ?? Number.POSITIVE_INFINITY, bag.exclusiveMaximum ?? Number.POSITIVE_INFINITY) ?? null;
			inst.isInt = (bag.format ?? "").includes("int") || Number.isSafeInteger(bag.multipleOf ?? .5);
			inst.isFinite = true;
			inst.format = bag.format ?? null;
		});
		function number(params) {
			return /* @__PURE__ */ _number(ZodNumber, params);
		}
		const ZodNumberFormat = /*@__PURE__*/ $constructor("ZodNumberFormat", (inst, def) => {
			$ZodNumberFormat.init(inst, def);
			ZodNumber.init(inst, def);
		});
		function int(params) {
			return /* @__PURE__ */ _int(ZodNumberFormat, params);
		}
		const ZodBoolean = /*@__PURE__*/ $constructor("ZodBoolean", (inst, def) => {
			$ZodBoolean.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => booleanProcessor(inst, ctx, json, params);
		});
		function boolean(params) {
			return /* @__PURE__ */ _boolean(ZodBoolean, params);
		}
		const ZodUnknown = /*@__PURE__*/ $constructor("ZodUnknown", (inst, def) => {
			$ZodUnknown.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => void 0;
		});
		function unknown() {
			return /* @__PURE__ */ _unknown(ZodUnknown);
		}
		const ZodNever = /*@__PURE__*/ $constructor("ZodNever", (inst, def) => {
			$ZodNever.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => neverProcessor(inst, ctx, json, params);
		});
		function never(params) {
			return /* @__PURE__ */ _never(ZodNever, params);
		}
		const ZodArray = /*@__PURE__*/ $constructor("ZodArray", (inst, def) => {
			$ZodArray.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => arrayProcessor(inst, ctx, json, params);
			inst.element = def.element;
			_installLazyMethods(inst, "ZodArray", {
				min(n, params) {
					return this.check(/* @__PURE__ */ _minLength(n, params));
				},
				nonempty(params) {
					return this.check(/* @__PURE__ */ _minLength(1, params));
				},
				max(n, params) {
					return this.check(/* @__PURE__ */ _maxLength(n, params));
				},
				length(n, params) {
					return this.check(/* @__PURE__ */ _length(n, params));
				},
				unwrap() {
					return this.element;
				}
			});
		});
		function array(element, params) {
			return /* @__PURE__ */ _array(ZodArray, element, params);
		}
		const ZodObject = /*@__PURE__*/ $constructor("ZodObject", (inst, def) => {
			$ZodObjectJIT.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => objectProcessor(inst, ctx, json, params);
			defineLazy(inst, "shape", () => {
				return def.shape;
			});
			_installLazyMethods(inst, "ZodObject", {
				keyof() {
					return _enum(Object.keys(this._zod.def.shape));
				},
				catchall(catchall) {
					return this.clone({
						...this._zod.def,
						catchall
					});
				},
				passthrough() {
					return this.clone({
						...this._zod.def,
						catchall: unknown()
					});
				},
				loose() {
					return this.clone({
						...this._zod.def,
						catchall: unknown()
					});
				},
				strict() {
					return this.clone({
						...this._zod.def,
						catchall: never()
					});
				},
				strip() {
					return this.clone({
						...this._zod.def,
						catchall: void 0
					});
				},
				extend(incoming) {
					return extend(this, incoming);
				},
				safeExtend(incoming) {
					return safeExtend(this, incoming);
				},
				merge(other) {
					return merge(this, other);
				},
				pick(mask) {
					return pick(this, mask);
				},
				omit(mask) {
					return omit(this, mask);
				},
				partial(...args) {
					return partial(ZodOptional, this, args[0]);
				},
				required(...args) {
					return required(ZodNonOptional, this, args[0]);
				}
			});
		});
		function object(shape, params) {
			const def = {
				type: "object",
				shape: shape ?? {},
				...normalizeParams(params)
			};
			return new ZodObject(def);
		}
		const ZodUnion = /*@__PURE__*/ $constructor("ZodUnion", (inst, def) => {
			$ZodUnion.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => unionProcessor(inst, ctx, json, params);
			inst.options = def.options;
		});
		function union(options, params) {
			return new ZodUnion({
				type: "union",
				options,
				...normalizeParams(params)
			});
		}
		const ZodIntersection = /*@__PURE__*/ $constructor("ZodIntersection", (inst, def) => {
			$ZodIntersection.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => intersectionProcessor(inst, ctx, json, params);
		});
		function intersection(left, right) {
			return new ZodIntersection({
				type: "intersection",
				left,
				right
			});
		}
		const ZodEnum = /*@__PURE__*/ $constructor("ZodEnum", (inst, def) => {
			$ZodEnum.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => enumProcessor(inst, ctx, json, params);
			inst.enum = def.entries;
			inst.options = Object.values(def.entries);
			const keys = new Set(Object.keys(def.entries));
			inst.extract = (values, params) => {
				const newEntries = {};
				for (const value of values) if (keys.has(value)) newEntries[value] = def.entries[value];
				else throw new Error(`Key ${value} not found in enum`);
				return new ZodEnum({
					...def,
					checks: [],
					...normalizeParams(params),
					entries: newEntries
				});
			};
			inst.exclude = (values, params) => {
				const newEntries = { ...def.entries };
				for (const value of values) if (keys.has(value)) delete newEntries[value];
				else throw new Error(`Key ${value} not found in enum`);
				return new ZodEnum({
					...def,
					checks: [],
					...normalizeParams(params),
					entries: newEntries
				});
			};
		});
		function _enum(values, params) {
			const entries = Array.isArray(values) ? Object.fromEntries(values.map((v) => [v, v])) : values;
			return new ZodEnum({
				type: "enum",
				entries,
				...normalizeParams(params)
			});
		}
		const ZodLiteral = /*@__PURE__*/ $constructor("ZodLiteral", (inst, def) => {
			$ZodLiteral.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => literalProcessor(inst, ctx, json, params);
			inst.values = new Set(def.values);
			Object.defineProperty(inst, "value", { get() {
				if (def.values.length > 1) throw new Error("This schema contains multiple valid literal values. Use `.values` instead.");
				return def.values[0];
			} });
		});
		function literal(value, params) {
			return new ZodLiteral({
				type: "literal",
				values: Array.isArray(value) ? value : [value],
				...normalizeParams(params)
			});
		}
		const ZodTransform = /*@__PURE__*/ $constructor("ZodTransform", (inst, def) => {
			$ZodTransform.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => transformProcessor(inst, ctx, json, params);
			inst._zod.parse = (payload, _ctx) => {
				if (_ctx.direction === "backward") throw new $ZodEncodeError(inst.constructor.name);
				payload.addIssue = (issue$1) => {
					if (typeof issue$1 === "string") payload.issues.push(issue(issue$1, payload.value, def));
					else {
						const _issue = issue$1;
						if (_issue.fatal) _issue.continue = false;
						_issue.code ?? (_issue.code = "custom");
						_issue.input ?? (_issue.input = payload.value);
						_issue.inst ?? (_issue.inst = inst);
						payload.issues.push(issue(_issue));
					}
				};
				const output = def.transform(payload.value, payload);
				if (output instanceof Promise) return output.then((output) => {
					payload.value = output;
					payload.fallback = true;
					return payload;
				});
				payload.value = output;
				payload.fallback = true;
				return payload;
			};
		});
		function transform(fn) {
			return new ZodTransform({
				type: "transform",
				transform: fn
			});
		}
		const ZodOptional = /*@__PURE__*/ $constructor("ZodOptional", (inst, def) => {
			$ZodOptional.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => optionalProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
		});
		function optional(innerType) {
			return new ZodOptional({
				type: "optional",
				innerType
			});
		}
		const ZodExactOptional = /*@__PURE__*/ $constructor("ZodExactOptional", (inst, def) => {
			$ZodExactOptional.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => optionalProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
		});
		function exactOptional(innerType) {
			return new ZodExactOptional({
				type: "optional",
				innerType
			});
		}
		const ZodNullable = /*@__PURE__*/ $constructor("ZodNullable", (inst, def) => {
			$ZodNullable.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => nullableProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
		});
		function nullable(innerType) {
			return new ZodNullable({
				type: "nullable",
				innerType
			});
		}
		const ZodDefault = /*@__PURE__*/ $constructor("ZodDefault", (inst, def) => {
			$ZodDefault.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => defaultProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
			inst.removeDefault = inst.unwrap;
		});
		function _default(innerType, defaultValue) {
			return new ZodDefault({
				type: "default",
				innerType,
				get defaultValue() {
					return typeof defaultValue === "function" ? defaultValue() : shallowClone(defaultValue);
				}
			});
		}
		const ZodPrefault = /*@__PURE__*/ $constructor("ZodPrefault", (inst, def) => {
			$ZodPrefault.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => prefaultProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
		});
		function prefault(innerType, defaultValue) {
			return new ZodPrefault({
				type: "prefault",
				innerType,
				get defaultValue() {
					return typeof defaultValue === "function" ? defaultValue() : shallowClone(defaultValue);
				}
			});
		}
		const ZodNonOptional = /*@__PURE__*/ $constructor("ZodNonOptional", (inst, def) => {
			$ZodNonOptional.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => nonoptionalProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
		});
		function nonoptional(innerType, params) {
			return new ZodNonOptional({
				type: "nonoptional",
				innerType,
				...normalizeParams(params)
			});
		}
		const ZodCatch = /*@__PURE__*/ $constructor("ZodCatch", (inst, def) => {
			$ZodCatch.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => catchProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
			inst.removeCatch = inst.unwrap;
		});
		function _catch(innerType, catchValue) {
			return new ZodCatch({
				type: "catch",
				innerType,
				catchValue: typeof catchValue === "function" ? catchValue : () => catchValue
			});
		}
		const ZodPipe = /*@__PURE__*/ $constructor("ZodPipe", (inst, def) => {
			$ZodPipe.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => pipeProcessor(inst, ctx, json, params);
			inst.in = def.in;
			inst.out = def.out;
		});
		function pipe(in_, out) {
			return new ZodPipe({
				type: "pipe",
				in: in_,
				out
			});
		}
		const ZodReadonly = /*@__PURE__*/ $constructor("ZodReadonly", (inst, def) => {
			$ZodReadonly.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => readonlyProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
		});
		function readonly(innerType) {
			return new ZodReadonly({
				type: "readonly",
				innerType
			});
		}
		const ZodCustom = /*@__PURE__*/ $constructor("ZodCustom", (inst, def) => {
			$ZodCustom.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => customProcessor(inst, ctx, json, params);
		});
		function refine(fn, _params = {}) {
			return /* @__PURE__ */ _refine(ZodCustom, fn, _params);
		}
		function superRefine(fn, params) {
			return /* @__PURE__ */ _superRefine(fn, params);
		}
		//#endregion
		//#region src/typert-schemas.ts
		/**
		* Remote 调用的运行时 schema 与 descriptor 表，两个产物入口共用一份。
		*
		* **这份表是手写的，DSH 自己的同类产物是 `@deepseek-ai/dsh-typert-generator`
		* 从源码类型生成的。** 生成器按 harness 的 workspace 布局发现包，仓库外的独立
		* 插件跑不了它；而 loader 那边只认 `package.json#exports` 里的 `./typert` 与
		* 产物里的 `TYPERT` 形状，不关心它是谁写的。所以这里按同一份**产物契约**手写，
		* 契约本身是 DSH 的加载协议——和 `tsdown.client.ts` 手写客户端产物是同一个道理。
		*
		* 代价是这份 schema 与 `employee/remote.ts` 的类型**没有编译期联系**：改了那边
		* 的返回类型，这里不会报错，而是运行时被 gateway 的 strict 校验挡下来。
		* 改任何一个 Remote 方法的签名时，这个文件必须跟着改。
		*
		* @module @staff-os/dsh-workbench/typert-schemas
		*/
		/** 本包名，descriptor id 与 manifest 都按它归属。 */
		const PACKAGE = "@staff-os/dsh-workbench";
		/** 员工域的 wire 命名空间；浏览器侧是 `ctx.remote.workbenchEmployee`。 */
		const EMPLOYEE_NAMESPACE = "workbenchEmployee";
		/** 一个员工装了什么。与 `employee/view.ts` 的 `EmployeeCapabilities` 对应。 */
		const capabilities$schema = object({
			tools: number(),
			skills: number(),
			mcpServers: number(),
			hasPersona: boolean(),
			personaLine: string().optional(),
			personaComplete: boolean(),
			agentInstructions: boolean(),
			entries: number(),
			error: string().optional()
		});
		/** 一个员工的投影。与 `employee/view.ts` 的 `EmployeeView` 对应。 */
		const employeeView$schema = object({
			id: string(),
			name: string(),
			description: string().optional(),
			order: number().optional(),
			trust: string(),
			isDefault: boolean(),
			broken: string().optional(),
			persona: string().optional(),
			knowledgeBases: array(string()),
			skills: array(string()),
			mcpServers: array(string()),
			capabilities: capabilities$schema
		});
		/** 一条指向不存在资源的绑定。 */
		const unknownBinding$schema = object({
			kind: string(),
			id: string()
		});
		/** 一次列表读取的结果。与 `employee/remote.ts` 的 `EmployeeSnapshot` 对应。 */
		const snapshot$schema = object({
			employees: array(employeeView$schema),
			defaultId: string(),
			knowledgeBases: array(string()),
			skills: array(string()),
			mcpServers: array(string()),
			unknownBindings: array(unknownBinding$schema)
		});
		/** 一次写操作的结果。与 `employee/remote.ts` 的 `EmployeeMutation` 对应。 */
		const mutation$schema = object({
			employee: employeeView$schema.optional(),
			snapshot: snapshot$schema
		});
		/** 改展示元数据的入参。 */
		const metadataInput$schema = object({
			name: string().optional(),
			description: string().optional(),
			order: number().optional()
		});
		/** 改绑定的入参。 */
		const bindingInput$schema = object({
			persona: string().optional(),
			knowledgeBases: array(string()).optional(),
			skills: array(string()).optional(),
			mcpServers: array(string()).optional(),
			mode: union([
				literal("replace"),
				literal("add"),
				literal("remove")
			]).optional()
		});
		const string$schema = string();
		/** 组合文件里的一行。与 `employee/composition.ts` 的 `CompositionEntry` 对应。 */
		const compositionEntry$schema = object({
			id: string().optional(),
			name: string(),
			label: string(),
			kind: union([
				literal("persona"),
				literal("instructions"),
				literal("tool"),
				literal("skill"),
				literal("mcp"),
				literal("other")
			]),
			disabled: union([literal(true), string()]).optional(),
			group: array(string())
		});
		/** 一份组合文件的解析结果。与 `CompositionSummary` 对应。 */
		const composition$schema = object({
			persona: object({
				text: string(),
				complete: boolean(),
				includeRuntimeContext: boolean()
			}).optional(),
			agentInstructions: boolean(),
			tools: array(compositionEntry$schema),
			skills: array(compositionEntry$schema),
			mcpServers: array(compositionEntry$schema),
			others: array(compositionEntry$schema),
			total: number(),
			error: string().optional()
		});
		/** `read` 的返回：原文加解析结果。 */
		const employeeComposition$schema = object({
			source: string(),
			composition: composition$schema
		});
		/**
		* 一个业务参数的 descriptor；本包的参数一律走 json，没有 lookup。
		*
		* `optional` 不是可有可无的修饰：api-gateway 收到调用时按 descriptor 逐字核
		* 对参数名，而 `undefined` 在 JSON 里根本不存在——传了个 undefined 的可选参
		* 数，到网关那边就是「少了一个字段」，调用被整个拒掉。让网关接受缺席的开关
		* 是参数上的 `acceptsUndefined`，schema 那边写 `.optional()` 管不了这件事。
		* @param name - 参数名，同时也是 wire 名。
		* @param schema - 运行时校验用的 schema。
		* @param typeSymbol - 类型符号，只用于诊断。
		* @param optional - 这个参数可以整个缺席。
		* @returns 参数 descriptor。
		*/
		function parameter(name, schema, typeSymbol, optional = false) {
			return {
				name,
				wire: name,
				source: "json",
				...optional ? { acceptsUndefined: true } : {},
				codec: {
					mode: "strict",
					typeSymbol,
					schema
				}
			};
		}
		/** 一个 direct 调用的 descriptor。 */
		function descriptor(namespace, method, parameters, result) {
			return {
				id: `${PACKAGE}#${namespace}/${method}`,
				service: namespace,
				namespace,
				method,
				invocation: { kind: "direct" },
				parameters,
				result: {
					mode: "strict",
					typeSymbol: result.typeSymbol,
					schema: result.schema
				}
			};
		}
		/** 类型符号前缀；只用于诊断，指回声明这些类型的模块。 */
		const SYMBOL = `${PACKAGE}#`;
		/** 员工域的全部 Remote 调用。 */
		const EMPLOYEE_DESCRIPTORS = [
			descriptor(EMPLOYEE_NAMESPACE, "list", [], {
				typeSymbol: `${SYMBOL}EmployeeSnapshot`,
				schema: snapshot$schema
			}),
			descriptor(EMPLOYEE_NAMESPACE, "create", [
				parameter("id", string$schema, `${SYMBOL}string`),
				parameter("from", string$schema.optional(), `${SYMBOL}string`, true),
				parameter("name", string$schema.optional(), `${SYMBOL}string`, true)
			], {
				typeSymbol: `${SYMBOL}EmployeeMutation`,
				schema: mutation$schema
			}),
			descriptor(EMPLOYEE_NAMESPACE, "update", [parameter("id", string$schema, `${SYMBOL}string`), parameter("metadata", metadataInput$schema, `${SYMBOL}EmployeeMetadataInput`)], {
				typeSymbol: `${SYMBOL}EmployeeMutation`,
				schema: mutation$schema
			}),
			descriptor(EMPLOYEE_NAMESPACE, "bind", [parameter("id", string$schema, `${SYMBOL}string`), parameter("bindings", bindingInput$schema, `${SYMBOL}EmployeeBindingInput`)], {
				typeSymbol: `${SYMBOL}EmployeeMutation`,
				schema: mutation$schema
			}),
			descriptor(EMPLOYEE_NAMESPACE, "delete", [parameter("id", string$schema, `${SYMBOL}string`)], {
				typeSymbol: `${SYMBOL}EmployeeMutation`,
				schema: mutation$schema
			}),
			descriptor(EMPLOYEE_NAMESPACE, "read", [parameter("id", string$schema, `${SYMBOL}string`)], {
				typeSymbol: `${SYMBOL}EmployeeComposition`,
				schema: employeeComposition$schema
			})
		];
		/** 技能域的 wire 命名空间；浏览器侧是 `ctx.remote.workbenchSkill`。 */
		const SKILL_NAMESPACE = "workbenchSkill";
		/** 一个技能的投影。与 `skill/view.ts` 的 `SkillView` 对应。 */
		const skillView$schema = object({
			name: string(),
			description: string(),
			whenToUse: string().optional(),
			source: string(),
			provider: string().optional(),
			modelInvocable: boolean(),
			userInvocable: boolean(),
			managed: boolean(),
			shadowed: boolean(),
			path: string().optional(),
			files: array(string()).optional()
		});
		/**
		* 一个市场条目的投影。与 `skill/view.ts` 的 `MarketView` 对应。
		*
		* 少写一个字段不会报错，只会被 strict 编解码悄悄剥掉——`installable` 漏掉时的
		* 表现就是安装按钮对着一条装不了的镜像条目照常可点。
		*/
		const marketView$schema = object({
			slug: string(),
			name: string(),
			description: string().optional(),
			version: string().optional(),
			tags: array(string()),
			category: string().optional(),
			installCount: number(),
			avgRating: number(),
			downloadCount: number(),
			stars: number(),
			owner: string().optional(),
			iconUrl: string().optional(),
			homepage: string().optional(),
			securityStatus: string().optional(),
			installKind: string().optional(),
			installable: boolean(),
			registry: string(),
			registryName: string()
		});
		/** 一个已配置的市场源。 */
		const registryInfo$schema = object({
			id: string(),
			name: string(),
			url: string(),
			flavor: string(),
			apiKeyEnv: string().optional()
		});
		/** 一个被 DSH 拒收的盘上条目。与 `skill/view.ts` 的 `RejectedView` 对应。 */
		const rejectedView$schema = object({
			hint: string(),
			path: string(),
			reason: string()
		});
		/** 一次技能列表读取的结果。与 `skill/remote.ts` 的 `SkillSnapshot` 对应。 */
		const skillSnapshot$schema = object({
			skills: array(skillView$schema),
			rejected: array(rejectedView$schema),
			registries: array(registryInfo$schema),
			hasRegistry: boolean()
		});
		/** 写完之后回读得到的生效结论。与 `skill/activation.ts` 的 `ActivationState` 对应。 */
		const activationState$schema = object({
			active: boolean(),
			mine: boolean(),
			winnerSource: string().optional(),
			winnerPath: string().optional(),
			summary: string(),
			scope: union([literal("skill"), literal("deployment")])
		});
		/** 一次技能写操作的结果。与 `SkillMutation` 对应。 */
		const skillMutation$schema = object({
			skill: skillView$schema.optional(),
			message: string(),
			activation: activationState$schema.optional(),
			snapshot: skillSnapshot$schema
		});
		/** 一条安装来源记录。与 `skill/ledger.ts` 的 `SkillOrigin` 对应。 */
		const skillOrigin$schema = object({
			name: string(),
			registry: string(),
			slug: string(),
			owner: string().optional(),
			version: string(),
			installedAt: number()
		});
		/** 一个已装技能的更新状态。与 `skill/ledger.ts` 的 `UpdateStatus` 对应。 */
		const updateStatus$schema = object({
			name: string(),
			installed: string(),
			latest: string().optional(),
			outdated: boolean(),
			origin: skillOrigin$schema,
			error: string().optional()
		});
		/** 技能目录或包里的一个文件。与 `skill/local.ts` 的 `SkillFileEntry` 对应。 */
		const skillFileEntry$schema = object({
			path: string(),
			size: number()
		});
		/** 一个技能的正文。与 `SkillContent` 对应。 */
		const skillContent$schema = object({
			skill: skillView$schema,
			content: string(),
			files: array(skillFileEntry$schema),
			note: string().optional()
		});
		/** 新建技能的入参。 */
		const skillInput$schema = object({
			name: string(),
			description: string(),
			whenToUse: string().optional(),
			content: string().optional(),
			modelInvocable: boolean().optional(),
			userInvocable: boolean().optional()
		});
		/** 改可见性的入参。 */
		const skillVisibilityInput$schema = object({
			modelInvocable: boolean().optional(),
			userInvocable: boolean().optional()
		});
		/** 市场上的一个标签。与 `MarketLabel` 对应。 */
		const marketLabel$schema = object({
			slug: string(),
			name: string(),
			kind: string(),
			registry: string(),
			registryName: string()
		});
		/** 一次市场搜索的结果。与 `MarketPage` 对应。 */
		const marketPage$schema = object({
			items: array(marketView$schema),
			fromCache: boolean()
		});
		/** 一个文件的内容。与 `FileContent` 对应。 */
		const fileContent$schema = object({
			path: string(),
			size: number(),
			text: string().optional(),
			binary: boolean(),
			truncated: boolean()
		});
		/** 一个市场条目的包内容。与 `MarketPreview` 对应。 */
		const marketPreview$schema = object({
			files: array(skillFileEntry$schema),
			content: string().optional(),
			note: string().optional()
		});
		/** 一次静态扫描的结果。与 `ScanReport` 对应。 */
		const scanReport$schema = object({
			findings: array(object({
				rule: string(),
				severity: string(),
				category: string(),
				description: string(),
				path: string(),
				line: number().optional(),
				recovery: string().optional()
			})),
			scanned: number(),
			skipped: number(),
			severity: string().optional(),
			score: number(),
			categories: array(object({
				id: string(),
				hits: number(),
				severity: string().optional()
			}))
		});
		const number$schema = number();
		const boolean$schema = boolean();
		/** 市场配置写操作的入参——一条源的编辑表单。 */
		const registrySourceInput$schema = object({
			id: string(),
			name: string(),
			url: string(),
			flavor: string().optional(),
			apiKeyEnv: string().optional()
		});
		/** 技能域的全部 Remote 调用。 */
		const SKILL_DESCRIPTORS = [
			descriptor(SKILL_NAMESPACE, "list", [], {
				typeSymbol: `${SYMBOL}SkillSnapshot`,
				schema: skillSnapshot$schema
			}),
			descriptor(SKILL_NAMESPACE, "read", [parameter("name", string$schema, `${SYMBOL}string`)], {
				typeSymbol: `${SYMBOL}SkillContent`,
				schema: skillContent$schema
			}),
			descriptor(SKILL_NAMESPACE, "readFile", [parameter("name", string$schema, `${SYMBOL}string`), parameter("path", string$schema, `${SYMBOL}string`)], {
				typeSymbol: `${SYMBOL}FileContent`,
				schema: fileContent$schema
			}),
			descriptor(SKILL_NAMESPACE, "scan", [parameter("name", string$schema, `${SYMBOL}string`)], {
				typeSymbol: `${SYMBOL}ScanReport`,
				schema: scanReport$schema
			}),
			descriptor(SKILL_NAMESPACE, "create", [parameter("input", skillInput$schema, `${SYMBOL}SkillInput`)], {
				typeSymbol: `${SYMBOL}SkillMutation`,
				schema: skillMutation$schema
			}),
			descriptor(SKILL_NAMESPACE, "visibility", [parameter("name", string$schema, `${SYMBOL}string`), parameter("visibility", skillVisibilityInput$schema, `${SYMBOL}SkillVisibilityInput`)], {
				typeSymbol: `${SYMBOL}SkillMutation`,
				schema: skillMutation$schema
			}),
			descriptor(SKILL_NAMESPACE, "delete", [parameter("name", string$schema, `${SYMBOL}string`)], {
				typeSymbol: `${SYMBOL}SkillMutation`,
				schema: skillMutation$schema
			}),
			descriptor(SKILL_NAMESPACE, "marketSearch", [
				parameter("keyword", string$schema.optional(), `${SYMBOL}string`, true),
				parameter("page", number$schema.optional(), `${SYMBOL}number`, true),
				parameter("sort", string$schema.optional(), `${SYMBOL}string`, true),
				parameter("label", string$schema.optional(), `${SYMBOL}string`, true),
				parameter("labelRegistry", string$schema.optional(), `${SYMBOL}string`, true)
			], {
				typeSymbol: `${SYMBOL}MarketPage`,
				schema: marketPage$schema
			}),
			descriptor(SKILL_NAMESPACE, "marketLabels", [], {
				typeSymbol: `${SYMBOL}MarketLabel[]`,
				schema: array(marketLabel$schema)
			}),
			descriptor(SKILL_NAMESPACE, "marketGet", [parameter("slug", string$schema, `${SYMBOL}string`), parameter("registry", string$schema.optional(), `${SYMBOL}string`, true)], {
				typeSymbol: `${SYMBOL}MarketView`,
				schema: marketView$schema
			}),
			descriptor(SKILL_NAMESPACE, "marketPreview", [
				parameter("slug", string$schema, `${SYMBOL}string`),
				parameter("version", string$schema.optional(), `${SYMBOL}string`, true),
				parameter("registry", string$schema.optional(), `${SYMBOL}string`, true),
				parameter("owner", string$schema.optional(), `${SYMBOL}string`, true)
			], {
				typeSymbol: `${SYMBOL}MarketPreview`,
				schema: marketPreview$schema
			}),
			descriptor(SKILL_NAMESPACE, "marketFile", [
				parameter("slug", string$schema, `${SYMBOL}string`),
				parameter("version", string$schema.optional(), `${SYMBOL}string`, true),
				parameter("registry", string$schema.optional(), `${SYMBOL}string`, true),
				parameter("owner", string$schema.optional(), `${SYMBOL}string`, true),
				parameter("path", string$schema.optional(), `${SYMBOL}string`, true)
			], {
				typeSymbol: `${SYMBOL}FileContent`,
				schema: fileContent$schema
			}),
			descriptor(SKILL_NAMESPACE, "marketScan", [
				parameter("slug", string$schema, `${SYMBOL}string`),
				parameter("version", string$schema.optional(), `${SYMBOL}string`, true),
				parameter("registry", string$schema.optional(), `${SYMBOL}string`, true),
				parameter("owner", string$schema.optional(), `${SYMBOL}string`, true)
			], {
				typeSymbol: `${SYMBOL}ScanReport`,
				schema: scanReport$schema
			}),
			descriptor(SKILL_NAMESPACE, "marketInstall", [
				parameter("slug", string$schema, `${SYMBOL}string`),
				parameter("version", string$schema.optional(), `${SYMBOL}string`, true),
				parameter("registry", string$schema.optional(), `${SYMBOL}string`, true),
				parameter("overwrite", boolean$schema.optional(), `${SYMBOL}boolean`, true),
				parameter("owner", string$schema.optional(), `${SYMBOL}string`, true)
			], {
				typeSymbol: `${SYMBOL}SkillMutation`,
				schema: skillMutation$schema
			}),
			descriptor(SKILL_NAMESPACE, "importPackage", [
				parameter("fileName", string$schema, `${SYMBOL}string`),
				parameter("contentBase64", string$schema, `${SYMBOL}string`),
				parameter("overwrite", boolean$schema.optional(), `${SYMBOL}boolean`, true),
				parameter("name", string$schema.optional(), `${SYMBOL}string`, true)
			], {
				typeSymbol: `${SYMBOL}SkillMutation`,
				schema: skillMutation$schema
			}),
			descriptor(SKILL_NAMESPACE, "importUrl", [
				parameter("url", string$schema, `${SYMBOL}string`),
				parameter("overwrite", boolean$schema.optional(), `${SYMBOL}boolean`, true),
				parameter("name", string$schema.optional(), `${SYMBOL}string`, true)
			], {
				typeSymbol: `${SYMBOL}SkillMutation`,
				schema: skillMutation$schema
			}),
			descriptor(SKILL_NAMESPACE, "marketUpdate", [
				parameter("name", string$schema, `${SYMBOL}string`),
				parameter("slug", string$schema.optional(), `${SYMBOL}string`, true),
				parameter("registry", string$schema.optional(), `${SYMBOL}string`, true),
				parameter("owner", string$schema.optional(), `${SYMBOL}string`, true)
			], {
				typeSymbol: `${SYMBOL}SkillMutation`,
				schema: skillMutation$schema
			}),
			descriptor(SKILL_NAMESPACE, "marketUpdateAll", [], {
				typeSymbol: `${SYMBOL}SkillMutation`,
				schema: skillMutation$schema
			}),
			descriptor(SKILL_NAMESPACE, "updates", [], {
				typeSymbol: `${SYMBOL}UpdateStatus[]`,
				schema: array(updateStatus$schema)
			}),
			descriptor(SKILL_NAMESPACE, "marketConfigRead", [], {
				typeSymbol: `${SYMBOL}RegistryInfo[]`,
				schema: array(registryInfo$schema)
			}),
			descriptor(SKILL_NAMESPACE, "marketConfigWrite", [parameter("sources", array(registrySourceInput$schema), `${SYMBOL}RegistrySourceInput[]`)], {
				typeSymbol: `${SYMBOL}RegistryInfo[]`,
				schema: array(registryInfo$schema)
			})
		];
		//#endregion
		//#region src/typert.remote-client.ts
		/**
		* 浏览器半边的 Remote contribution，由客户端 apply 里的 `ctx.remote.$mount()`
		* 挂上去。
		*
		* 挂上之后 `ctx.remote.workbenchEmployee.*` 与 `ctx.remote.workbenchSkill.*` 就存在
		* 了，调用经 api-gateway 走到 Node 半边对应的 gateway。gateway 只对每个 codec 调
		* `schema.parse()`，不认 zod 的实例身份，所以客户端 bundle 内联自己那份 zod
		* 不影响校验。
		*
		* 内容是手写的，原因与代价见 {@link module:@staff-os/dsh-workbench/typert-schemas}。
		*
		* @module @staff-os/dsh-workbench/typert.remote-client
		*/
		/** 本包向浏览器提供的 Remote 契约。 */
		const TYPERT_REMOTE = {
			package: PACKAGE,
			descriptors: [...EMPLOYEE_DESCRIPTORS, ...SKILL_DESCRIPTORS]
		};
		//#endregion
		//#region src/client/locales.ts
		/**
		* 工作台侧栏的字典。
		* @module @staff-os/dsh-workbench/client/locales
		*/
		/** 中文字典，也是键的定义源。 */
		const zh = {
			"toggle.open": "展开侧栏",
			"toggle.collapse": "收起侧栏",
			"session.new": "新建会话",
			"section.sessions": "会话",
			"section.employees": "AI 员工",
			"section.employees.summary": "一个 AI 员工就是一套可挂载的 agent 组合，外加它该用的知识库、技能与 MCP 服务。",
			"section.knowledge": "知识库",
			"section.knowledge.summary": "本地知识库：文档切块后建关键词索引，检索走 BM25 而不是语义向量。",
			"section.skills": "技能",
			"section.skills.summary": "本地技能落在 $DSH_HOME/skills 下，也可以从已配置的技能市场安装。",
			"section.mcp": "MCP 服务",
			"section.mcp.summary": "MCP 服务写在当前 profile 的 patch 文件里，改动在下次启动 DSH 时生效。",
			"section.plugins": "插件",
			"section.plugins.summary": "DSH 插件的装卸转发给 dsh plugin 命令行，装完要重启才生效。",
			"action.employees.list": "看看现在有哪些 AI 员工",
			"action.employees.create": "以某个员工为模板复制一个新的",
			"action.employees.bind": "给员工绑定知识库、技能与 MCP 服务",
			"action.knowledge.create": "新建一个知识库",
			"action.knowledge.add": "把文档加进知识库",
			"action.knowledge.search": "在知识库里检索内容",
			"action.skills.list": "看看当前生效的技能",
			"action.skills.create": "新建一个本地技能",
			"action.skills.market": "在技能市场里找并安装",
			"action.mcp.list": "看看配了哪些 MCP 服务",
			"action.mcp.add": "新增一个 MCP 服务",
			"action.mcp.import": "导入 Claude Code / Cursor 风格的 MCP 配置",
			"action.plugins.list": "看看装了哪些插件",
			"action.plugins.install": "安装一个插件",
			"action.plugins.market": "在插件市场里找并安装",
			"panel.tool": "管理入口：",
			"panel.hint": "在会话里直接说要做什么即可，模型会调用上面这个工具。",
			"panel.start": "开始一个会话",
			"employee.subtitle": "员工是本地 agent preset，绑定写在它自己的目录里，全部落盘不进数据库。",
			"employee.search": "搜索员工",
			"employee.refresh": "重新读取",
			"employee.create": "新建员工",
			"employee.loading": "正在读取…",
			"employee.none": "还没有任何 AI 员工",
			"employee.noMatch": "没有匹配的员工",
			"employee.noDescription": "这个员工还没有写简介",
			"employee.meta.bound": "已绑定 {n} 项资源",
			"employee.meta.unbound": "还没绑定资源",
			"employee.meta.tools": "{n} 个工具插件",
			"employee.meta.skillCapable": "支持技能",
			"employee.meta.fixedPrompt": "固定系统提示",
			"employee.meta.agents": "读 AGENTS.md",
			"employee.tag.default": "默认",
			"employee.tag.readonly": "随部署发布",
			"employee.back": "← 返回列表",
			"employee.save": "保存",
			"employee.cancel": "取消",
			"employee.delete": "删除",
			"employee.delete.title": "删除这个员工？",
			"employee.delete.hint": "将删掉 \"{id}\" 的整个 preset 目录，包括它的绑定清单。此操作不可撤销。",
			"employee.delete.confirm": "确认删除",
			"employee.readonly.hint": "这个员工随部署发布，改不了也删不掉。要改就复制一份再改。",
			"employee.tab.identity": "基本设置",
			"employee.tab.tools": "工具",
			"employee.tab.knowledge": "知识库",
			"employee.tab.skills": "技能",
			"employee.tab.mcp": "MCP",
			"employee.tab.files": "核心文件",
			"employee.field.name": "名称",
			"employee.field.name.hint": "界面上显示的名字，写在 preset.yml 里。",
			"employee.field.description": "简介",
			"employee.field.description.hint": "一句话说明这个员工是干什么的。",
			"employee.field.persona": "岗位说明",
			"employee.field.persona.hint": "工作台自己加的一层，写在 employee.yml 里，说明以这个员工身份工作时负责什么。它不会替换下面那段系统提示。",
			"employee.field.systemPrompt": "模板自带的人设",
			"employee.field.systemPrompt.hint": "组合文件里 dsh-persona 行的系统提示，决定这个智能体开口时是谁。只读——改它要动 agent 组合文件。",
			"employee.persona.inherited": "这个模板没写自己的人设，用部署的默认人设。",
			"employee.persona.complete": "这段就是完整的系统提示，别处再加不进去。",
			"employee.persona.extendable": "这段是系统提示的开头，全局身份与工具说明会接在后面。",
			"employee.persona.runtimeOn": "附带运行时上下文（工作目录、时间等）。",
			"employee.persona.runtimeOff": "不附带运行时上下文。",
			"employee.persona.agentsOn": "会读工作区的 AGENTS.md。",
			"employee.persona.agentsOff": "不读工作区的 AGENTS.md。",
			"employee.tools.hint": "这个模板装了哪些工具插件，读自它的 agent 组合文件。只读——加减工具等于改这个智能体本身。注意一行插件可能注册好几个工具，所以这不是模型看到的工具名清单。",
			"employee.tools.none": "这个模板没装任何工具插件",
			"employee.tools.others": "其他组成",
			"employee.tools.others.hint": "按包名认不出类别的行，原样列出，不猜。",
			"employee.entry.disabled": "已禁用",
			"employee.entry.conditional": "条件禁用：{cond}",
			"employee.composition.error": "读不懂这个模板的组合文件：{reason}",
			"employee.capability.skills": "模板已装技能能力（{items}），下面绑定的技能它用得上。",
			"employee.capability.noSkills": "这个模板没装技能能力，绑了技能它也没有调用技能的工具。",
			"employee.capability.mcp": "模板组合文件里有 MCP 行（{items}）。",
			"employee.capability.noMcp": "这个模板的组合文件里没有 MCP 行；MCP 服务通常配在 profile 层，对所有员工生效。",
			"employee.bind.hint": "这份清单是职责说明：绑定了知识库不会让检索自动发生，它告诉模型以这个员工身份工作时该去用哪些资源。",
			"employee.bind.missing": "这些绑定指向的资源当前不存在：{items}",
			"employee.bind.noKnowledge": "还没有任何知识库",
			"employee.bind.noSkills": "还没有任何技能",
			"employee.bind.noMcp": "当前 profile 还没配 MCP 服务",
			"employee.files.hint": "这个员工的 agent 组合文件原文，是它「实际是什么」的权威来源。这里只读，改它要走 DSH 自己的创作路径。",
			"employee.files.unavailable": "读不到这个员工的组合文件",
			"employee.create.title": "新建 AI 员工",
			"employee.create.hint": "只能以一个现成员工为模板整目录复制——这是 DSH 刻意的安全边界，复制出来的员工不会比模板多出任何能力。",
			"employee.create.from": "模板",
			"employee.create.from.hint": "新员工从这个员工的目录复制而来。",
			"employee.create.id": "员工 id",
			"employee.create.id.hint": "小写字母数字，用短横线分隔；同时是它的目录名，建好后改不了。",
			"employee.create.name.hint": "留空就沿用模板的名字。",
			"employee.create.confirm": "创建",
			"skill.subtitle": "技能落在 $DSH_HOME/skills 下，一个目录一份 SKILL.md；也可以从已配置的市场装。",
			"skill.tab.local": "本地技能",
			"skill.tab.market": "技能市场",
			"skill.search": "搜索技能",
			"skill.refresh": "重新读取",
			"skill.create": "新建技能",
			"skill.loading": "正在读取技能……",
			"skill.none": "本地还没有技能",
			"skill.noMatch": "没有匹配的技能",
			"skill.back": "← 返回列表",
			"skill.delete": "删除技能",
			"skill.cancel": "取消",
			"skill.dismiss": "知道了",
			"skill.save": "保存",
			"skill.noRegistry": "DSH 的技能服务没有装，下面只是盘上的目录清单，谈不上生不生效。",
			"skill.tag.shadowed": "被遮蔽",
			"skill.tag.readonly": "只读",
			"skill.tag.modelOff": "模型不可调用",
			"skill.tag.userOff": "不可 / 触发",
			"skill.shadowed.hint": "盘上有这份技能，但生效的是同名的 {source} 版本。改这一份不会有任何效果。",
			"skill.readonly.hint": "这份技能不在用户目录里（来源：{source}），本界面改不动它。",
			"skill.pending.hint": "DSH 还没扫描到这份技能，重启后生效。",
			"skill.field.description": "描述",
			"skill.field.description.hint": "写清「什么情况下该用它」——模型就是靠这句决定要不要调用。",
			"skill.field.whenToUse": "何时使用",
			"skill.field.name": "技能名",
			"skill.field.name.hint": "小写字母数字，短横线分隔，例如 my-skill。",
			"skill.field.content": "正文",
			"skill.field.content.hint": "SKILL.md 里 frontmatter 之后的部分，模型调用时读到的就是它。",
			"skill.field.path": "所在路径",
			"skill.field.source": "来源",
			"skill.visibility": "可见性",
			"skill.visibility.model": "模型可以自行调用",
			"skill.visibility.user": "用户可以用 /名字 触发",
			"skill.delete.title": "删除技能",
			"skill.delete.hint": "将要删除 \"{name}\" 及其整个目录。此操作不可撤销。",
			"skill.create.title": "新建技能",
			"skill.create.hint": "在 $DSH_HOME/skills 下建一个目录并写好 SKILL.md。写完下一个模型回合就生效，不用重启。",
			"skill.market.search": "搜索市场",
			"skill.market.go": "搜索",
			"skill.market.install": "安装",
			"skill.market.sameName": "已有同名",
			"skill.market.overwrite": "覆盖安装",
			"skill.market.none": "市场里没有匹配的技能",
			"skill.market.idle": "输入关键词开始搜索，留空则浏览列表。",
			"skill.market.loading": "正在查询市场……",
			"skill.market.cached": "registry 当前不可达，这是离线缓存里的结果。",
			"skill.market.noRegistry": "还没有配置任何技能市场。在插件配置的 registries 里加一条 ClawHub 兼容源。",
			"skill.market.sources": "已配置的源：{names}",
			"skill.market.installs": "{n} 次安装",
			"skill.market.downloads": "{n} 次下载",
			"skill.market.stars": "{n} star",
			"skill.market.foreign": "这条来自 {kind}，本市场没有它的包，装不了；到它的主页去取。",
			"skill.market.update": "更新",
			"skill.market.upToDate": "已是最新",
			"skill.updates.available": "{n} 个已装技能有新版本",
			"skill.updates.check": "查更新",
			"skill.updates.checking": "正在查更新……",
			"skill.updates.all": "全部更新（{n}）",
			"skill.updates.newer": "新版本",
			"skill.updates.unchecked": "{n} 个查不了更新",
			"skill.installed": "已安装",
			"skill.rejected.title": "{n} 个文件被 DSH 拒收，不会生效",
			"skill.rejected.hint": "这些文件在盘上，但 frontmatter 不合 DSH 的规矩，它会整份丢弃且只留一行日志。",
			"skill.upload": "上传技能",
			"skill.upload.title": "上传技能包",
			"skill.upload.hint": "选一个技能压缩包（zip / tar / tgz）。装成什么名字由包内 SKILL.md 的 name 决定，不是文件名。",
			"skill.upload.drop": "点击选择，或把压缩包拖到这里",
			"skill.upload.accept": "支持 .zip .tar .tgz .tar.gz，单个包不超过 {size}",
			"skill.upload.replace": "换一个",
			"skill.upload.overwrite": "同名技能已存在时覆盖它",
			"skill.upload.go": "安装",
			"skill.upload.note": "手上传的包没有市场坐标，装完不会出现在更新检查里。",
			"skill.tab.overview": "概览",
			"skill.tab.files": "文件",
			"skill.doc.expand": "展开全文",
			"skill.doc.collapse": "收起",
			"skill.file.loading": "正在读取文件……",
			"skill.file.binary": "这是一个二进制文件（{size}），没有可显示的文本。",
			"skill.file.truncated": "文件有 {size}，这里只显示开头一段。",
			"skill.file.copy": "复制",
			"skill.file.copied": "已复制",
			"skill.detail.author": "提供方 {name}",
			"skill.detail.owner": "发布者 {name}",
			"skill.detail.noContent": "这份技能的 SKILL.md 在 frontmatter 之后没有正文。",
			"skill.detail.noFiles": "读不到这份技能的文件清单——目录可能已经不在了。",
			"skill.detail.actions": "操作",
			"skill.detail.homepage": "打开主页",
			"skill.detail.loading": "正在读取详情……",
			"skill.detail.installedVersion": "已装版本",
			"skill.detail.security": "安全审核",
			"skill.detail.registry": "来源市场",
			"skill.detail.updated": "更新时间",
			"skill.detail.fileCount": "{n} 个文件",
			"skill.market.detail": "查看详情",
			"skill.market.filter.all": "全部",
			"skill.market.filter.more": "更多 {n} 个",
			"skill.market.filter.less": "收起",
			"skill.market.filter.scope": "分类是从已载入的 {n} 条结果里数出来的，不是整个市场的目录。",
			"skill.market.preview.loading": "正在取包内容……",
			"skill.market.preview.noFiles": "这个包里没有列出任何文件。",
			"skill.market.preview.foreign": "这条是别家目录的镜像，本源上没有包，看不到内容。",
			"skill.market.version": "版本",
			"skill.tab.scan": "安全扫描",
			"skill.scan.running": "正在扫……",
			"skill.scan.summary": "扫了 {scanned} 个文件，跳过 {skipped} 个，命中 {hits} 条。",
			"skill.scan.clean": "一条规则都没命中。",
			"skill.scan.disclaimer": "规则是正则匹配，命中只说明「这段文字长得像某种高危写法」，不代表它真会那么做——点开对应的文件自己看一眼再判断。反过来，没命中也不等于安全：规则只有十三条。",
			"skill.scan.title": "静态扫描报告",
			"skill.scan.engine": "规则集来自 AI-Infra-Guard skill-scan",
			"skill.scan.engine.static": "静态规则",
			"skill.scan.score": "规则命中评分",
			"skill.scan.scannedFiles": "已扫文件",
			"skill.scan.skippedFiles": "跳过",
			"skill.scan.topSeverity": "最高一档",
			"skill.scan.none": "未命中",
			"skill.scan.tile.total": "命中总数",
			"skill.scan.tile.grave": "严重与高危",
			"skill.scan.tile.mild": "中低危与提示",
			"skill.scan.tile.faces": "检测面",
			"skill.scan.tile.total.foot": "待人工确认",
			"skill.scan.tile.grave.foot": "建议先看",
			"skill.scan.tile.mild.foot": "可稍后看",
			"skill.scan.tile.faces.foot": "静态规则覆盖",
			"skill.scan.summaryTitle": "总体情况",
			"skill.scan.summary.clean": "扫过 {scanned} 个文本文件，{rules} 条规则一条都没匹上。这说明的是「没命中」，不是「安全」——规则只有这些，绕过它们并不难。",
			"skill.scan.summary.hits": "在 {scanned} 个文本文件里命中 {hits} 条，分布在 {faces} 个检测面上。命中只说明这段文字长得像某种高危写法，点开对应文件看一眼再判断。",
			"skill.scan.facesTitle": "检测面",
			"skill.scan.detailTitle": "逐面解析",
			"skill.scan.face.quiet": "未命中",
			"skill.scan.face.hits": "命中 {n} 条",
			"skill.scan.face.quietLine": "这一面上的规则都没有匹上。",
			"skill.scan.log": "命中明细",
			"skill.scan.severity.critical": "严重",
			"skill.scan.severity.high": "高危",
			"skill.scan.severity.medium": "中危",
			"skill.scan.severity.low": "低危",
			"skill.scan.severity.info": "提示",
			"skill.scan.category.remotePayload": "远程载荷",
			"skill.scan.category.credentialAccess": "凭据访问",
			"skill.scan.category.reconnaissance": "环境踩点",
			"skill.scan.category.promptInjection": "提示词注入",
			"skill.scan.category.remoteControl": "远程控制",
			"skill.scan.category.obfuscation": "混淆隐藏",
			"skill.scan.category.dataExfiltration": "数据外传",
			"skill.scan.category.persistence": "持久化",
			"skill.market.owner": "发布者",
			"skill.market.downloadCount": "下载量",
			"skill.market.starCount": "Star",
			"skill.market.installCount": "安装量",
			"skill.import": "导入技能",
			"skill.import.title": "导入技能",
			"skill.import.hint": "四种来源共用同一条解包与落盘路径：先落技能根之外的暂存目录，校验通过再整目录换上去。",
			"skill.import.go": "导入",
			"skill.import.mode.zip": "上传压缩包",
			"skill.import.mode.zip.note": "在浏览器里挑一个包",
			"skill.import.mode.zip.placeholder": "选择文件…",
			"skill.import.mode.zip.hint": "单包限 {size}；手动上传不记安装台账，之后不会被更新检查带上。",
			"skill.import.mode.url": "下载链接",
			"skill.import.mode.url.note": "直接给一个压缩包地址",
			"skill.import.mode.url.hint": "包由服务端去下。解包时校验条目数、单文件与整包体积，拒绝 ..、绝对路径与 NUL。同样不记台账。",
			"skill.import.mode.url.placeholder": "https://example.com/skill.zip",
			"skill.import.mode.github": "GitHub 仓库",
			"skill.import.mode.github.note": "页面地址会被翻成 /tarball",
			"skill.import.mode.github.hint": "仓库根下要有 SKILL.md；装出来的目录名以包内 frontmatter 的 name 为准，不是仓库名。",
			"skill.import.mode.github.placeholder": "https://github.com/owner/repo",
			"skill.import.mode.slug": "市场 slug",
			"skill.import.mode.slug.note": "从已配置的源里取",
			"skill.import.mode.slug.hint": "会记进安装台账，之后按源 id 回到同一个市场查更新。写成 owner/name 可以指定发布者。",
			"skill.import.mode.slug.placeholder": "pdf-to-markdown",
			"skill.local.count": "{n} 个技能",
			"skill.local.managed": "{n} 个受本插件管理",
			"skill.local.shadowed": "{n} 个被遮蔽",
			"skill.local.rejectedCount": "{n} 个被拒收",
			"skill.tag.shadowed.long": "不生效 · 被遮蔽",
			"skill.tag.modelOn": "模型可调用",
			"skill.rejected.section": "被 DSH 拒收",
			"skill.rejected.sectionHint": "盘上有这些文件，但 frontmatter 不合规，整份被丢弃。它们不在技能清单里，也不会被调用。",
			"skill.market.resultLine": "{n} 个技能 · {m} 个已配置的源",
			"skill.market.sortedByDownloads": "按累计下载量排序",
			"skill.market.sortedByRelevance": "按市场给的相关度排序",
			"skill.market.status.installed": "● 已安装",
			"skill.market.status.installable": "[ 可安装 ]",
			"skill.market.status.browseOnly": "[ 仅浏览 ]",
			"skill.market.status.update": "可更新 v{v}",
			"skill.market.rating": "平均评分",
			"skill.market.installKind": "托管方式",
			"skill.market.security.unknown": "该源不提供审核结论",
			"skill.market.security.note": "技能装上就是模型会照着执行的指令，装前看一眼来源与包内容。",
			"skill.market.security.unknownNote": "自建源没有这个字段，责任在配置这条源的人。",
			"skill.toast.done": "已生效",
			"skill.toast.inactive": "已写入，但没有生效",
			"skill.toast.failed": "这一步没做成",
			"skill.tab.config": "市场配置",
			"skill.config.subtitle": "配置 ClawHub 兼容市场的根地址和凭据。配置立刻生效，不必重启。",
			"skill.config.add": "添加源",
			"skill.config.remove": "删除",
			"skill.config.save": "保存",
			"skill.config.saved": "市场配置已保存",
			"skill.config.loading": "正在读取配置…",
			"skill.config.empty": "还没有配置任何市场源。空列表会回退到出厂自带的 ClawHub 源。",
			"skill.config.field.id": "标识",
			"skill.config.field.id.hint": "源的唯一标识，例如 clawhub、skillhub。同一个 id 不能重复。",
			"skill.config.field.name": "名称",
			"skill.config.field.name.hint": "显示用的名字；留空时用标识顶上。",
			"skill.config.field.url": "根地址",
			"skill.config.field.url.hint": "ClawHub 兼容市场的服务根地址，例如 https://clawhub.ai。/api/v1/... 由插件追加。",
			"skill.config.field.flavor": "协议方言",
			"skill.config.field.flavor.hint": "clawhub 是标准 ClawHub，skillhub 是国内的同类源（浏览走榜单端点）。留空按 clawhub 处理。",
			"skill.config.field.apiKeyEnv": "凭据引用名",
			"skill.config.field.apiKeyEnv.hint": "凭据服务的引用名（不是明文 key），例如 CLAWHUB_API_KEY。公开读接口匿名可用，带 key 时按用户算配额。",
			"skill.config.hint": "配置写在一个本地文件里（$DSH_HOME/workbench/market.json），不进 Cordis 配置。空列表回退到出厂源。"
		};
		/** 英文字典。 */
		const en = {
			"toggle.open": "Expand sidebar",
			"toggle.collapse": "Collapse sidebar",
			"session.new": "New session",
			"section.sessions": "Sessions",
			"section.employees": "AI employees",
			"section.employees.summary": "An AI employee is a mountable agent preset plus the knowledge bases, skills and MCP servers it should use.",
			"section.knowledge": "Knowledge",
			"section.knowledge.summary": "Local knowledge bases: documents are chunked and indexed for BM25 keyword retrieval, not semantic vector search.",
			"section.skills": "Skills",
			"section.skills.summary": "Local skills live under $DSH_HOME/skills, and can also be installed from a configured marketplace.",
			"section.mcp": "MCP servers",
			"section.mcp.summary": "MCP servers are written into the current profile's patch file and take effect on the next DSH start.",
			"section.plugins": "Plugins",
			"section.plugins.summary": "Plugin install and removal forward to the dsh plugin CLI; changes take effect after a restart.",
			"action.employees.list": "List the AI employees that exist now",
			"action.employees.create": "Copy an existing employee as a template",
			"action.employees.bind": "Bind knowledge bases, skills and MCP servers to an employee",
			"action.knowledge.create": "Create a knowledge base",
			"action.knowledge.add": "Add a document to a knowledge base",
			"action.knowledge.search": "Search inside the knowledge bases",
			"action.skills.list": "See which skills are currently in effect",
			"action.skills.create": "Create a local skill",
			"action.skills.market": "Find and install from the skill marketplace",
			"action.mcp.list": "See which MCP servers are configured",
			"action.mcp.add": "Add an MCP server",
			"action.mcp.import": "Import a Claude Code / Cursor style MCP config",
			"action.plugins.list": "See which plugins are installed",
			"action.plugins.install": "Install a plugin",
			"action.plugins.market": "Find and install from the plugin marketplace",
			"panel.tool": "Managed by:",
			"panel.hint": "Just say what you want in a session — the model calls the tool above.",
			"panel.start": "Start a session",
			"employee.subtitle": "An employee is a local agent preset; its bindings live in its own directory, on disk rather than in a database.",
			"employee.search": "Search employees",
			"employee.refresh": "Reload",
			"employee.create": "New employee",
			"employee.loading": "Loading…",
			"employee.none": "No AI employees yet",
			"employee.noMatch": "No matching employee",
			"employee.noDescription": "This employee has no description yet",
			"employee.meta.bound": "{n} bound resources",
			"employee.meta.unbound": "Nothing bound",
			"employee.meta.tools": "{n} tool plugins",
			"employee.meta.skillCapable": "Skills enabled",
			"employee.meta.fixedPrompt": "Fixed system prompt",
			"employee.meta.agents": "Reads AGENTS.md",
			"employee.tag.default": "Default",
			"employee.tag.readonly": "Shipped",
			"employee.back": "← Back to list",
			"employee.save": "Save",
			"employee.cancel": "Cancel",
			"employee.delete": "Delete",
			"employee.delete.title": "Delete this employee?",
			"employee.delete.hint": "This removes the entire preset directory for \"{id}\", including its binding list. It cannot be undone.",
			"employee.delete.confirm": "Delete",
			"employee.readonly.hint": "This employee ships with the deployment: it cannot be edited or deleted. Copy it first, then edit the copy.",
			"employee.tab.identity": "Basics",
			"employee.tab.tools": "Tools",
			"employee.tab.knowledge": "Knowledge",
			"employee.tab.skills": "Skills",
			"employee.tab.mcp": "MCP",
			"employee.tab.files": "Core files",
			"employee.field.name": "Name",
			"employee.field.name.hint": "The display name, stored in preset.yml.",
			"employee.field.description": "Description",
			"employee.field.description.hint": "One sentence on what this employee is for.",
			"employee.field.persona": "Role",
			"employee.field.persona.hint": "A layer the workbench adds, stored in employee.yml: what this employee is responsible for. It does not replace the system prompt below.",
			"employee.field.systemPrompt": "The template’s own persona",
			"employee.field.systemPrompt.hint": "The system prompt from the composition file’s dsh-persona row — who this agent is when it speaks. Read-only: changing it means editing the agent composition.",
			"employee.persona.inherited": "This template declares no persona of its own and uses the deployment default.",
			"employee.persona.complete": "This is the complete system prompt; nothing else can be appended.",
			"employee.persona.extendable": "This opens the system prompt; global identity and tool guidance follow it.",
			"employee.persona.runtimeOn": "Runtime context (working directory, time) is included.",
			"employee.persona.runtimeOff": "Runtime context is not included.",
			"employee.persona.agentsOn": "Reads the workspace’s AGENTS.md.",
			"employee.persona.agentsOff": "Does not read the workspace’s AGENTS.md.",
			"employee.tools.hint": "The tool plugins this template composes, read from its agent composition file. Read-only — adding or removing tools means changing the agent itself. Note that one plugin row may register several tools, so this is not the list of tool names the model sees.",
			"employee.tools.none": "This template composes no tool plugins",
			"employee.tools.others": "Other rows",
			"employee.tools.others.hint": "Rows whose category cannot be inferred from the package name, listed as they are rather than guessed.",
			"employee.entry.disabled": "disabled",
			"employee.entry.conditional": "conditional: {cond}",
			"employee.composition.error": "Cannot read this template’s composition file: {reason}",
			"employee.capability.skills": "The template composes skill support ({items}), so the skills bound below are usable.",
			"employee.capability.noSkills": "This template composes no skill support: binding skills gives it no tool to invoke them with.",
			"employee.capability.mcp": "The composition file has MCP rows ({items}).",
			"employee.capability.noMcp": "This template’s composition file has no MCP rows; MCP servers are usually configured at the profile layer, for every employee.",
			"employee.bind.hint": "This list is a statement of responsibility: binding a knowledge base does not make retrieval happen by itself — it tells the model which resources to reach for while working as this employee.",
			"employee.bind.missing": "These bindings point at resources that do not currently exist: {items}",
			"employee.bind.noKnowledge": "No knowledge bases yet",
			"employee.bind.noSkills": "No skills yet",
			"employee.bind.noMcp": "No MCP servers configured in this profile yet",
			"employee.files.hint": "The raw agent composition file — the authority on what this employee actually is. Read-only here; editing it goes through DSH’s own authoring path.",
			"employee.files.unavailable": "Cannot read this employee’s composition file",
			"employee.create.title": "New AI employee",
			"employee.create.hint": "A new employee can only be a whole-directory copy of an existing one — a deliberate DSH safety boundary, so the copy never gains capabilities the template lacked.",
			"employee.create.from": "Template",
			"employee.create.from.hint": "The new employee is copied from this one’s directory.",
			"employee.create.id": "Employee id",
			"employee.create.id.hint": "Lowercase alphanumerics separated by hyphens. It is also the directory name and cannot be changed later.",
			"employee.create.name.hint": "Leave empty to keep the template’s name.",
			"employee.create.confirm": "Create",
			"skill.subtitle": "Skills live under $DSH_HOME/skills, one SKILL.md per directory; they can also be installed from a configured marketplace.",
			"skill.tab.local": "Local skills",
			"skill.tab.market": "Marketplace",
			"skill.search": "Search skills",
			"skill.refresh": "Reload",
			"skill.create": "New skill",
			"skill.loading": "Loading skills…",
			"skill.none": "No skills on this machine yet",
			"skill.noMatch": "No matching skill",
			"skill.back": "← Back to list",
			"skill.delete": "Delete skill",
			"skill.cancel": "Cancel",
			"skill.dismiss": "Dismiss",
			"skill.save": "Save",
			"skill.noRegistry": "DSH's skill service is not installed, so the list below is just the directories on disk — nothing here is in effect or shadowed.",
			"skill.tag.shadowed": "Shadowed",
			"skill.tag.readonly": "Read-only",
			"skill.tag.modelOff": "Model cannot invoke",
			"skill.tag.userOff": "No / trigger",
			"skill.shadowed.hint": "This skill exists on disk, but the {source} copy of the same name is the one in effect. Editing this one changes nothing.",
			"skill.readonly.hint": "This skill is not in the user directory (source: {source}), so this surface cannot change it.",
			"skill.pending.hint": "DSH has not scanned this skill yet; it takes effect after a restart.",
			"skill.field.description": "Description",
			"skill.field.description.hint": "State when it should be used — that sentence is what the model decides on.",
			"skill.field.whenToUse": "When to use",
			"skill.field.name": "Skill name",
			"skill.field.name.hint": "Lowercase alphanumerics separated by hyphens, e.g. my-skill.",
			"skill.field.content": "Body",
			"skill.field.content.hint": "Everything after the frontmatter in SKILL.md — this is what the model reads when it invokes the skill.",
			"skill.field.path": "Path",
			"skill.field.source": "Source",
			"skill.visibility": "Visibility",
			"skill.visibility.model": "The model may invoke it on its own",
			"skill.visibility.user": "Users may trigger it with /name",
			"skill.delete.title": "Delete skill",
			"skill.delete.hint": "This deletes \"{name}\" and its whole directory. It cannot be undone.",
			"skill.create.title": "New skill",
			"skill.create.hint": "Creates a directory with a SKILL.md under $DSH_HOME/skills. It takes effect on the next model turn — no restart needed.",
			"skill.market.search": "Search the marketplace",
			"skill.market.go": "Search",
			"skill.market.install": "Install",
			"skill.market.sameName": "Name taken",
			"skill.market.overwrite": "Overwrite",
			"skill.market.none": "No matching skill in the marketplace",
			"skill.market.idle": "Type a keyword to search, or leave it empty to browse.",
			"skill.market.loading": "Querying the marketplace…",
			"skill.market.cached": "The registry is unreachable; these results come from the offline cache.",
			"skill.market.noRegistry": "No skill marketplace is configured. Add a ClawHub-compatible source under the plugin config's registries.",
			"skill.market.sources": "Configured sources: {names}",
			"skill.market.installs": "{n} installs",
			"skill.market.downloads": "{n} downloads",
			"skill.market.stars": "{n} stars",
			"skill.market.foreign": "This entry comes from {kind}; this marketplace has no package for it. Get it from its homepage instead.",
			"skill.market.update": "Update",
			"skill.market.upToDate": "Up to date",
			"skill.updates.available": "{n} installed skills have a newer version",
			"skill.updates.check": "Check for updates",
			"skill.updates.checking": "Checking for updates…",
			"skill.updates.all": "Update all ({n})",
			"skill.updates.newer": "New",
			"skill.updates.unchecked": "{n} could not be checked",
			"skill.installed": "Installed",
			"skill.rejected.title": "{n} files rejected by DSH — they will never take effect",
			"skill.rejected.hint": "These files are on disk, but their frontmatter breaks DSH’s rules, so it discards each one whole and only logs a warning.",
			"skill.upload": "Upload a skill",
			"skill.upload.title": "Upload a skill package",
			"skill.upload.hint": "Pick a skill archive (zip / tar / tgz). The installed name comes from the package’s own SKILL.md frontmatter, not the file name.",
			"skill.upload.drop": "Click to choose, or drop an archive here",
			"skill.upload.accept": ".zip .tar .tgz .tar.gz, up to {size} per package",
			"skill.upload.replace": "Choose another",
			"skill.upload.overwrite": "Overwrite an existing skill of the same name",
			"skill.upload.go": "Install",
			"skill.upload.note": "An uploaded package has no marketplace coordinates, so it will not appear in update checks.",
			"skill.tab.overview": "Overview",
			"skill.tab.files": "Files",
			"skill.doc.expand": "Show more",
			"skill.doc.collapse": "Show less",
			"skill.file.loading": "Reading file…",
			"skill.file.binary": "This is a binary file ({size}); there is no text to show.",
			"skill.file.truncated": "The file is {size}; only the beginning is shown here.",
			"skill.file.copy": "Copy",
			"skill.file.copied": "Copied",
			"skill.detail.author": "Provided by {name}",
			"skill.detail.owner": "Published by {name}",
			"skill.detail.noContent": "This skill’s SKILL.md has nothing after its frontmatter.",
			"skill.detail.noFiles": "Could not list this skill’s files — the directory may be gone.",
			"skill.detail.actions": "Actions",
			"skill.detail.homepage": "Open homepage",
			"skill.detail.loading": "Loading details…",
			"skill.detail.installedVersion": "Installed version",
			"skill.detail.security": "Security review",
			"skill.detail.registry": "Source",
			"skill.detail.updated": "Updated",
			"skill.detail.fileCount": "{n} files",
			"skill.market.detail": "View details",
			"skill.market.filter.all": "All",
			"skill.market.filter.more": "{n} more",
			"skill.market.filter.less": "Show less",
			"skill.market.filter.scope": "Categories are counted from the {n} loaded results, not from a marketplace-wide catalog.",
			"skill.market.preview.loading": "Fetching package contents…",
			"skill.market.preview.noFiles": "This package listed no files.",
			"skill.market.preview.foreign": "This entry mirrors another catalog; the source holds no package, so there is nothing to show.",
			"skill.market.version": "Version",
			"skill.tab.scan": "Security scan",
			"skill.scan.running": "Scanning…",
			"skill.scan.summary": "Scanned {scanned} files, skipped {skipped}, {hits} matches.",
			"skill.scan.clean": "No rule matched.",
			"skill.scan.disclaimer": "These are regex rules: a match only means the text looks like a high-risk pattern, not that the skill does it — open the file and judge for yourself. The reverse holds too: no match does not mean safe, there are only thirteen rules.",
			"skill.scan.title": "Static scan report",
			"skill.scan.engine": "Rules from AI-Infra-Guard skill-scan",
			"skill.scan.engine.static": "Static rules",
			"skill.scan.score": "Rule-match score",
			"skill.scan.scannedFiles": "Files scanned",
			"skill.scan.skippedFiles": "Skipped",
			"skill.scan.topSeverity": "Highest",
			"skill.scan.none": "No match",
			"skill.scan.tile.total": "Total matches",
			"skill.scan.tile.grave": "Critical and high",
			"skill.scan.tile.mild": "Medium, low and info",
			"skill.scan.tile.faces": "Surfaces checked",
			"skill.scan.tile.total.foot": "Needs a human look",
			"skill.scan.tile.grave.foot": "Look at these first",
			"skill.scan.tile.mild.foot": "Can wait",
			"skill.scan.tile.faces.foot": "Covered by static rules",
			"skill.scan.summaryTitle": "Overall",
			"skill.scan.summary.clean": "Scanned {scanned} text files; none of the {rules} rules matched. That means \"no match\", not \"safe\" — these are all the rules there are, and getting around them is not hard.",
			"skill.scan.summary.hits": "{hits} matches across {faces} surfaces in {scanned} text files. A match only means the text looks like a high-risk pattern; open the file and judge for yourself.",
			"skill.scan.facesTitle": "Surfaces checked",
			"skill.scan.detailTitle": "Surface by surface",
			"skill.scan.face.quiet": "No match",
			"skill.scan.face.hits": "{n} matches",
			"skill.scan.face.quietLine": "No rule on this surface matched.",
			"skill.scan.log": "Matches",
			"skill.scan.severity.critical": "Critical",
			"skill.scan.severity.high": "High",
			"skill.scan.severity.medium": "Medium",
			"skill.scan.severity.low": "Low",
			"skill.scan.severity.info": "Info",
			"skill.scan.category.remotePayload": "Remote payload",
			"skill.scan.category.credentialAccess": "Credential access",
			"skill.scan.category.reconnaissance": "Reconnaissance",
			"skill.scan.category.promptInjection": "Prompt injection",
			"skill.scan.category.remoteControl": "Remote control",
			"skill.scan.category.obfuscation": "Obfuscation",
			"skill.scan.category.dataExfiltration": "Data exfiltration",
			"skill.scan.category.persistence": "Persistence",
			"skill.market.owner": "Publisher",
			"skill.market.downloadCount": "Downloads",
			"skill.market.starCount": "Stars",
			"skill.market.installCount": "Installs",
			"skill.import": "Import skill",
			"skill.import.title": "Import a skill",
			"skill.import.hint": "All four sources share one unpack-and-land path: staged outside the skill root first, swapped in as a whole directory once it checks out.",
			"skill.import.go": "Import",
			"skill.import.mode.zip": "Upload an archive",
			"skill.import.mode.zip.note": "Pick a package from this machine",
			"skill.import.mode.zip.placeholder": "Choose a file…",
			"skill.import.mode.zip.hint": "{size} per package. Hand-uploaded packages get no ledger entry, so update checks will not cover them.",
			"skill.import.mode.url": "Download link",
			"skill.import.mode.url.note": "A direct archive address",
			"skill.import.mode.url.hint": "The server fetches it. Unpacking checks entry count, per-file and total size, and rejects .., absolute paths and NUL. No ledger entry either.",
			"skill.import.mode.url.placeholder": "https://example.com/skill.zip",
			"skill.import.mode.github": "GitHub repository",
			"skill.import.mode.github.note": "A page URL is turned into /tarball",
			"skill.import.mode.github.hint": "SKILL.md must sit at the repository root; the installed directory is named after the frontmatter name, not the repository.",
			"skill.import.mode.github.placeholder": "https://github.com/owner/repo",
			"skill.import.mode.slug": "Marketplace slug",
			"skill.import.mode.slug.note": "From a configured source",
			"skill.import.mode.slug.hint": "Recorded in the install ledger, so updates go back to the same source by its id. Write owner/name to pin the publisher.",
			"skill.import.mode.slug.placeholder": "pdf-to-markdown",
			"skill.local.count": "{n} skills",
			"skill.local.managed": "{n} managed here",
			"skill.local.shadowed": "{n} shadowed",
			"skill.local.rejectedCount": "{n} rejected",
			"skill.tag.shadowed.long": "Inactive · shadowed",
			"skill.tag.modelOn": "Model-invocable",
			"skill.rejected.section": "Rejected by DSH",
			"skill.rejected.sectionHint": "These files are on disk, but their frontmatter does not comply and the whole file is dropped. They are not in the skill list and will never be invoked.",
			"skill.market.resultLine": "{n} skills · {m} configured sources",
			"skill.market.sortedByDownloads": "Sorted by total downloads",
			"skill.market.sortedByRelevance": "In the order the marketplace returned",
			"skill.market.status.installed": "● Installed",
			"skill.market.status.installable": "[ Installable ]",
			"skill.market.status.browseOnly": "[ Browse only ]",
			"skill.market.status.update": "v{v} available",
			"skill.market.rating": "Average rating",
			"skill.market.installKind": "Hosting",
			"skill.market.security.unknown": "This source states no review verdict",
			"skill.market.security.note": "An installed skill is instructions the model will follow. Look at where it comes from before installing.",
			"skill.market.security.unknownNote": "Self-hosted sources do not carry this field; the responsibility sits with whoever configured it.",
			"skill.toast.done": "In effect",
			"skill.toast.inactive": "Written, but not in effect",
			"skill.toast.failed": "That did not go through",
			"skill.tab.config": "Market config",
			"skill.config.subtitle": "Configure ClawHub-compatible marketplace roots and credentials. Changes take effect immediately — no restart needed.",
			"skill.config.add": "Add source",
			"skill.config.remove": "Remove",
			"skill.config.save": "Save",
			"skill.config.saved": "Market configuration saved",
			"skill.config.loading": "Loading configuration…",
			"skill.config.empty": "No marketplace sources configured. An empty list falls back to the built-in ClawHub source.",
			"skill.config.field.id": "ID",
			"skill.config.field.id.hint": "A unique identifier for this source, e.g. clawhub, skillhub. Duplicate IDs are not allowed.",
			"skill.config.field.name": "Name",
			"skill.config.field.name.hint": "Display name; falls back to the ID when left empty.",
			"skill.config.field.url": "Root URL",
			"skill.config.field.url.hint": "The ClawHub-compatible service root, e.g. https://clawhub.ai. The /api/v1/... suffix is appended by the plugin.",
			"skill.config.field.flavor": "Flavor",
			"skill.config.field.flavor.hint": "clawhub is the standard ClawHub protocol; skillhub is a domestic variant that browses via showcase endpoints. Leave empty to use clawhub.",
			"skill.config.field.apiKeyEnv": "Credential ref",
			"skill.config.field.apiKeyEnv.hint": "A credential service reference name (not the raw key), e.g. CLAWHUB_API_KEY. Public read APIs work anonymously; a key raises the per-user quota.",
			"skill.config.hint": "Configuration is stored in a local file ($DSH_HOME/workbench/market.json), not in the Cordis config. An empty list falls back to the built-in source."
		};
		//#endregion
		//#region src/client/index.ts
		/** 本插件拥有的字典命名空间。 */
		const NS = "workbench";
		/** 客户端半边依赖的服务。 */
		const inject = [
			"slots",
			"layout",
			"sessions",
			"workspaces",
			"locale"
		];
		/**
		* 注册工作台侧栏、管理面板及其服务回调。
		* @param ctx - 客户端根上下文。
		*/
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "dsh-workbench: dictionaries");
			const ui = createWorkbenchUi();
			const injectSidebar = () => ({
				ui,
				startSession: (workspaceId) => {
					ctx.workspaces.startSession(workspaceId);
				},
				toggleSidebar: () => {
					ctx.layout.toggleSidebar();
				}
			});
			ctx.effect(() => ctx.slots.register({
				name: "sidebar",
				locale: NS,
				children: {
					"sidebar.brand.mark": {
						kind: "single",
						scope: "root"
					},
					"sidebar.brand.name": {
						kind: "single",
						scope: "root"
					},
					"sidebar.workspaces": {
						kind: "single",
						scope: "root"
					},
					"sidebar.settings": {
						kind: "single",
						scope: "root"
					},
					"sidebar.footer.action": {
						kind: "list",
						scope: "root"
					}
				},
				inject: injectSidebar
			}, WorkbenchSidebar), "dsh-workbench: sidebar registration");
			ctx.plugin({
				name: "dsh-workbench-panel",
				inject: ["slots", "remote"],
				apply: (panelCtx) => {
					const remote = panelCtx.get("remote");
					const face = () => panelCtx.get("remote.workbenchEmployee");
					const employees = createEmployeeData(face);
					const skillFace = () => panelCtx.get("remote.workbenchSkill");
					const skills = createSkillData(skillFace);
					panelCtx.effect(() => {
						let dispose;
						let dropped = false;
						remote?.$mount(TYPERT_REMOTE).then((disposer) => {
							if (dropped) {
								disposer();
								return;
							}
							dispose = disposer;
							employees.refresh();
							skills.refresh();
						}, (error) => {
							console.error("dsh-workbench: Remote 契约挂载失败", error);
						});
						return () => {
							dropped = true;
							dispose?.();
						};
					}, "dsh-workbench: remote contribution");
					const injectPanel = () => ({
						ui,
						employees,
						skills,
						startSession: () => {
							ctx.workspaces.startSession();
						}
					});
					panelCtx.effect(() => panelCtx.slots.register({
						name: "shell.overlay",
						id: "workbench.panel",
						locale: NS,
						inject: injectPanel
					}, WorkbenchPanel), "dsh-workbench: panel registration");
				}
			});
		}
		//#endregion
		exports.SECTIONS = SECTIONS;
		exports.VISIBLE_SECTIONS = VISIBLE_SECTIONS;
		exports.apply = apply;
		exports.createEmployeeData = createEmployeeData;
		exports.createSkillData = createSkillData;
		exports.createStore = createStore;
		exports.createWorkbenchUi = createWorkbenchUi;
		exports.inject = inject;
		exports.sectionOf = sectionOf;
		exports.sectionVisible = sectionVisible;
		exports.useStore = useStore;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map