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
/** Removes what an `initBurger` call added. */
export type Teardown = () => void;
/**
 * Wire one toggle to the navigation it controls.
 *
 * @param toggle A `.b-menu` whose `aria-controls` names the nav's id.
 * @returns Removes every listener this added and clears any inert it set.
 */
export declare const initBurger: (toggle: HTMLElement) => Teardown;
/** Wire every `.b-menu` on the page. Called on import. */
export declare const initAllBurgers: () => Teardown[];
