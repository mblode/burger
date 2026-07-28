import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * These cover the JavaScript contract only.
 *
 * The other half of the component is CSS: the wash, the scroll lock, the bars
 * folding into a cross, and the closed nav dropping out of the tab order all come
 * from `:has()` selectors keyed on aria-expanded. jsdom implements neither
 * `:has()` nor visibility inheritance, so none of that can be asserted here and
 * nothing below pretends to. It is verified in a real browser instead.
 */

// The toggle sits inside a <header> on purpose. Inerting only <body>'s children
// would leave that header's siblings — the <main> full of links — focusable.
const HTML = `
  <header id="site-header">
    <div class="b-container">
      <button
        class="b-menu"
        type="button"
        aria-expanded="false"
        aria-controls="b-nav"
        aria-label="Open menu"
      >
        <span class="b-bun b-bun--top"></span>
      </button>
      <a href="/" class="b-brand">Burger</a>
    </div>
  </header>
  <nav class="b-nav" id="b-nav" aria-label="Main">
    <ul>
      <li><a class="b-link" href="#one">One</a></li>
      <li><a class="b-link" href="#two">Two</a></li>
    </ul>
  </nav>
  <main id="page"><a href="#bg" id="bg-link">Background</a></main>
  <aside id="page-inerted" inert></aside>
`;

const TWO_MENUS = `
  <div class="b-container">
    <button class="b-menu" id="first" aria-expanded="false" aria-controls="nav-a"></button>
  </div>
  <nav class="b-nav" id="nav-a"></nav>
  <div class="b-container">
    <button class="b-menu" id="second" aria-expanded="false" aria-controls="nav-b"></button>
  </div>
  <nav class="b-nav" id="nav-b"></nav>
`;

/** Throws rather than handing back null, so a broken fixture names itself. */
const query = <T extends HTMLElement = HTMLElement>(
  selector: string,
  within: ParentNode = document
): T => {
  const element = within.querySelector<T>(selector);
  if (!element) {
    throw new Error(`Fixture is missing ${selector}`);
  }
  return element;
};

const dom = () => ({
  brand: query(".b-brand"),
  header: query("#site-header"),
  nav: query("#b-nav"),
  navLink: query(".b-nav .b-link"),
  page: query("#page"),
  pageLink: query("#bg-link"),
  preInerted: query("#page-inerted"),
  toggle: query("#site-header .b-menu"),
});

/** Fresh module evaluation, so the import-time initAllBurgers() wires this DOM. */
const load = async () => {
  vi.resetModules();
  return await import("./burger.ts");
};

/**
 * Import against an empty body so the module's own initAllBurgers() finds
 * nothing, then install the markup. Loading with markup already in place and
 * calling initBurger again wires each toggle twice, and two listeners cancel.
 */
const loadUnwired = async (html: string) => {
  document.body.innerHTML = "";
  const module = await load();
  document.body.innerHTML = html;
  return module;
};

const pressEscape = () =>
  document.dispatchEvent(
    new KeyboardEvent("keydown", { bubbles: true, key: "Escape" })
  );

const expanded = (element: HTMLElement) =>
  element.getAttribute("aria-expanded");

beforeEach(() => {
  document.body.innerHTML = HTML;
});

describe("toggling", () => {
  it("wires every .b-menu on import", async () => {
    await load();
    const { toggle } = dom();

    expect(expanded(toggle)).toBe("false");
    toggle.click();
    expect(expanded(toggle)).toBe("true");
  });

  it("flips aria-expanded and aria-label together", async () => {
    await load();
    const { toggle } = dom();

    toggle.click();
    expect(expanded(toggle)).toBe("true");
    expect(toggle.getAttribute("aria-label")).toBe("Close menu");

    toggle.click();
    expect(expanded(toggle)).toBe("false");
    expect(toggle.getAttribute("aria-label")).toBe("Open menu");
  });

  it("honours markup that starts open", async () => {
    query("#site-header .b-menu").setAttribute("aria-expanded", "true");
    await load();
    const { toggle, page } = dom();

    expect(toggle.getAttribute("aria-label")).toBe("Close menu");
    expect(page.hasAttribute("inert")).toBe(true);
  });

  it("wires two menus independently", async () => {
    const { initAllBurgers } = await loadUnwired(TWO_MENUS);

    expect(initAllBurgers()).toHaveLength(2);

    const first = query("#first");
    const second = query("#second");
    first.click();

    expect(expanded(first)).toBe("true");
    expect(expanded(second)).toBe("false");
  });
});

describe("escape", () => {
  it("closes and returns focus to the toggle", async () => {
    await load();
    const { toggle, navLink } = dom();

    toggle.click();
    navLink.focus();
    pressEscape();

    expect(expanded(toggle)).toBe("false");
    expect(document.activeElement).toBe(toggle);
  });

  it("does nothing while closed", async () => {
    await load();
    const { toggle, pageLink } = dom();

    pageLink.focus();
    pressEscape();

    expect(expanded(toggle)).toBe("false");
    // Focus is left where it was rather than yanked to a menu nobody opened.
    expect(document.activeElement).toBe(pageLink);
  });
});

describe("closing on navigation", () => {
  it("closes when a link inside the nav is clicked", async () => {
    await load();
    const { toggle, navLink } = dom();

    toggle.click();
    navLink.click();

    expect(expanded(toggle)).toBe("false");
  });

  it("stays open when the nav's own chrome is clicked", async () => {
    await load();
    const { toggle, nav } = dom();

    toggle.click();
    query("ul", nav).click();

    expect(expanded(toggle)).toBe("true");
  });
});

describe("focus containment", () => {
  it("inerts content outside the menu while open", async () => {
    await load();
    const { toggle, page } = dom();

    expect(page.hasAttribute("inert")).toBe(false);
    toggle.click();
    expect(page.hasAttribute("inert")).toBe(true);
  });

  it("reaches siblings of the toggle's ancestors, not just body children", async () => {
    await load();
    const { toggle, header, page } = dom();

    toggle.click();
    // The header holds the toggle, so it stays live while its sibling does not.
    expect(header.hasAttribute("inert")).toBe(false);
    expect(page.hasAttribute("inert")).toBe(true);
  });

  it("leaves the menu's own parts interactive", async () => {
    await load();
    const { toggle, nav, brand } = dom();

    toggle.click();

    expect(nav.hasAttribute("inert")).toBe(false);
    expect(brand.hasAttribute("inert")).toBe(false);
    expect(toggle.hasAttribute("inert")).toBe(false);
  });

  it("releases everything it inerted on close", async () => {
    await load();
    const { toggle, page } = dom();

    toggle.click();
    toggle.click();

    expect(page.hasAttribute("inert")).toBe(false);
  });

  it("does not clear an inert the page set itself", async () => {
    await load();
    const { toggle, preInerted } = dom();

    toggle.click();
    toggle.click();

    expect(preInerted.hasAttribute("inert")).toBe(true);
  });
});

describe("teardown", () => {
  it("removes every listener and releases inert", async () => {
    const { initBurger } = await loadUnwired(HTML);
    const { toggle, navLink, page } = dom();

    const teardown = initBurger(toggle);
    toggle.click();
    expect(expanded(toggle)).toBe("true");

    teardown();
    expect(page.hasAttribute("inert")).toBe(false);

    // Every listener is gone, so the attribute stays wherever teardown left it.
    toggle.click();
    expect(expanded(toggle)).toBe("true");

    pressEscape();
    expect(expanded(toggle)).toBe("true");

    navLink.click();
    expect(expanded(toggle)).toBe("true");
  });
});

describe("markup tolerance", () => {
  it("works without a nav to control", async () => {
    document.body.innerHTML = `
      <div class="b-container">
        <button class="b-menu" id="lonely" aria-expanded="false"></button>
      </div>
      <main id="page"></main>
    `;
    await load();
    const toggle = query("#lonely");

    expect(() => toggle.click()).not.toThrow();
    expect(expanded(toggle)).toBe("true");
    expect(query("#page").hasAttribute("inert")).toBe(true);
  });
});
