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

/** Removes what an `initBurger` call added. */
export type Teardown = () => void;

const isOpen = (toggle: Element): boolean =>
  toggle.getAttribute("aria-expanded") === "true";

/**
 * Everything outside the menu, as the shallowest set of elements that covers it.
 *
 * Walks up from each of the menu's parts and collects the siblings at every
 * level. Inerting `<body>`'s children alone is not enough: the toggle is usually
 * nested inside a `<header>` on a real page, and that header's siblings — the
 * `<main>` full of links — would stay in the tab order.
 */
const outsideOf = (keep: Element[]): Element[] => {
  const inside = new Set<Element>();
  for (const element of keep) {
    for (
      let node: Element | null = element;
      node && node !== document.body;
      node = node.parentElement
    ) {
      inside.add(node);
    }
  }

  // A Set, because two parts of the menu under the same ancestor would otherwise
  // yield that ancestor's siblings twice.
  const outside = new Set<Element>();
  for (const element of inside) {
    for (const sibling of element.parentElement?.children ?? []) {
      if (!inside.has(sibling)) {
        outside.add(sibling);
      }
    }
  }

  return [...outside];
};

/**
 * Take the page out of the tab order while the menu covers it, and put it back
 * afterwards.
 *
 * Only elements this made inert are cleared again: a page that set `inert`
 * itself keeps it. Without this the overlay hides the page visually while every
 * link behind it stays focusable, so a keyboard user tabs out of the menu into
 * content they cannot see (WCAG 2.4.3).
 */
const createInertScope = (keep: Element[]): ((active: boolean) => void) => {
  let held: Element[] = [];

  return (active: boolean) => {
    if (active) {
      // The content attribute rather than the `inert` IDL property: it is what
      // the browser acts on either way, and it survives environments that have
      // not implemented the property (jsdom among them).
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

/**
 * Wire one toggle to the navigation it controls.
 *
 * @param toggle A `.b-menu` whose `aria-controls` names the nav's id.
 * @returns Removes every listener this added and clears any inert it set.
 */
export const initBurger = (toggle: HTMLElement): Teardown => {
  const navId = toggle.getAttribute("aria-controls");
  const nav = navId ? document.querySelector(`#${navId}`) : null;
  // The container, not the toggle: the brand sits beside the button and stays
  // part of the menu while it is open, so inerting the toggle's siblings would
  // make it unclickable.
  const root = toggle.closest(".b-container") ?? toggle;
  const setInert = createInertScope(
    [root, nav].filter((element): element is Element => element !== null)
  );

  const setOpen = (open: boolean) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    setInert(open);
  };

  setOpen(isOpen(toggle));

  const onClick = () => setOpen(!isOpen(toggle));

  // Escape is the expected way out of anything covering the page, and focus has
  // to return to the toggle: closing while focus sits on a link that is now
  // hidden would drop the user back at the top of the document.
  const onKeydown = (event: KeyboardEvent) => {
    if (event.key !== "Escape" || !isOpen(toggle)) {
      return;
    }
    setOpen(false);
    toggle.focus();
  };

  // A click on a link inside the menu is a navigation. Leaving the overlay up
  // over the destination is the most common complaint about menus like this one.
  const onNavClick = (event: Event) => {
    if ((event.target as Element | null)?.closest("a")) {
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

/** Wire every `.b-menu` on the page. Called on import. */
export const initAllBurgers = (): Teardown[] =>
  [...document.querySelectorAll<HTMLElement>(TOGGLE)].map(initBurger);

initAllBurgers();
