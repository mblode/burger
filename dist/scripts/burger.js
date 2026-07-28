/*!
 * Burger — a minimal hamburger menu with fullscreen navigation
 * MIT License | https://github.com/mblode/burger
 *
 * The whole of the open/closed state is `aria-expanded` on the toggle. The
 * stylesheet derives the overlay, the scroll lock, the bars folding into a
 * cross, and the list animation from it with :has(), so there is nothing here to
 * keep in sync with the CSS.
 */
const TOGGLE = ".b-menu";
const isOpen = (toggle) => toggle.getAttribute("aria-expanded") === "true";
const setOpen = (toggle, open) => {
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
};
const initBurger = (toggle) => {
  const navId = toggle.getAttribute("aria-controls");
  const nav = navId ? document.querySelector(`#${navId}`) : null;
  setOpen(toggle, isOpen(toggle));
  const onClick = () => setOpen(toggle, !isOpen(toggle));
  const onKeydown = (event) => {
    if (event.key !== "Escape" || !isOpen(toggle)) {
      return;
    }
    setOpen(toggle, false);
    toggle.focus();
  };
  const onNavClick = (event) => {
    if (event.target.closest("a")) {
      setOpen(toggle, false);
    }
  };
  toggle.addEventListener("click", onClick);
  document.addEventListener("keydown", onKeydown);
  nav?.addEventListener("click", onNavClick);
  return () => {
    toggle.removeEventListener("click", onClick);
    document.removeEventListener("keydown", onKeydown);
    nav?.removeEventListener("click", onNavClick);
  };
};
const initAllBurgers = () => [...document.querySelectorAll(TOGGLE)].map(initBurger);
initAllBurgers();
export {
  initAllBurgers,
  initBurger
};
