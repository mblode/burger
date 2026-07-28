/*!
 * Burger — a minimal hamburger menu with fullscreen navigation
 * MIT License | https://github.com/mblode/burger
 *
 * The whole of the open/closed state is `aria-expanded` on the toggle. The
 * stylesheet derives the overlay, the scroll lock, the bars folding into a
 * cross, and the list animation from it with :has(), so there is nothing here to
 * keep in sync with the CSS.
 *
 * The one thing CSS cannot do is take the rest of the page out of the tab order,
 * so that is what the `inert` handling below is for.
 */
const TOGGLE = ".b-menu";
const isOpen = (toggle) => toggle.getAttribute("aria-expanded") === "true";
const outsideOf = (keep) => {
  const inside = /* @__PURE__ */ new Set();
  for (const element of keep) {
    for (let node = element; node && node !== document.body; node = node.parentElement) {
      inside.add(node);
    }
  }
  const outside = /* @__PURE__ */ new Set();
  for (const element of inside) {
    for (const sibling of element.parentElement?.children ?? []) {
      if (!inside.has(sibling)) {
        outside.add(sibling);
      }
    }
  }
  return [...outside];
};
const createInertScope = (keep) => {
  let held = [];
  return (active) => {
    if (active) {
      held = outsideOf(keep).filter(
        (element) => !element.hasAttribute("inert")
      );
      for (const element of held) {
        element.setAttribute("inert", "");
      }
      return;
    }
    for (const element of held) {
      element.removeAttribute("inert");
    }
    held = [];
  };
};
const initBurger = (toggle) => {
  const navId = toggle.getAttribute("aria-controls");
  const nav = navId ? document.querySelector(`#${navId}`) : null;
  const root = toggle.closest(".b-container") ?? toggle;
  const setInert = createInertScope(
    [root, nav].filter((element) => element !== null)
  );
  const setOpen = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    setInert(open);
  };
  setOpen(isOpen(toggle));
  const onClick = () => setOpen(!isOpen(toggle));
  const onKeydown = (event) => {
    if (event.key !== "Escape" || !isOpen(toggle)) {
      return;
    }
    setOpen(false);
    toggle.focus();
  };
  const onNavClick = (event) => {
    if (event.target?.closest("a")) {
      setOpen(false);
    }
  };
  toggle.addEventListener("click", onClick);
  document.addEventListener("keydown", onKeydown);
  nav?.addEventListener("click", onNavClick);
  return () => {
    toggle.removeEventListener("click", onClick);
    document.removeEventListener("keydown", onKeydown);
    nav?.removeEventListener("click", onNavClick);
    setInert(false);
  };
};
const initAllBurgers = () => [...document.querySelectorAll(TOGGLE)].map(initBurger);
initAllBurgers();
export {
  initAllBurgers,
  initBurger
};
