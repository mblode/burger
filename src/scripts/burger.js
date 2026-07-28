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

/**
 * Wire one toggle to the navigation it controls.
 *
 * @param {HTMLElement} toggle An element whose aria-controls names a nav id.
 * @returns {() => void} Removes every listener this added.
 */
export const initBurger = (toggle) => {
  const navId = toggle.getAttribute("aria-controls");
  const nav = navId ? document.querySelector(`#${navId}`) : null;

  setOpen(toggle, isOpen(toggle));

  const onClick = () => setOpen(toggle, !isOpen(toggle));

  // Escape is the expected way out of anything covering the page, and focus has
  // to return to the toggle: closing while focus sits on a link that is now
  // hidden would drop the user back at the top of the document.
  const onKeydown = (event) => {
    if (event.key !== "Escape" || !isOpen(toggle)) {
      return;
    }
    setOpen(toggle, false);
    toggle.focus();
  };

  // A click on a link inside the menu is a navigation. Leaving the overlay up
  // over the destination is the most common complaint about menus like this one.
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

/** Wire every `.b-menu` on the page. Called on import. */
export const initAllBurgers = () =>
  [...document.querySelectorAll(TOGGLE)].map(initBurger);

initAllBurgers();
