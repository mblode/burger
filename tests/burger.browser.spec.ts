// oxlint-disable no-await-in-loop -- Tab presses are ordered by definition here;
// the sequence *is* the assertion, so they cannot be collected into Promise.all.
import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

/**
 * The half `burger.test.ts` cannot reach.
 *
 * Every behaviour here comes out of a `:has()` selector, inherited `visibility`, a
 * real scroll container, or a media query — none of which jsdom implements. These
 * ran as throwaway scripts while the component was being fixed; they live here so
 * the next change has to keep them passing.
 */

const open = async (page: Page) => {
  await page.locator(".b-menu").click();
  // Longer than --burger-duration (0.4s): `visibility` transitions discretely, so
  // reading it mid-transition still returns the outgoing value.
  await page.waitForTimeout(600);
};

/** Makes the page taller than the window and puts a link behind the overlay. */
const addBackgroundContent = (page: Page) =>
  page.evaluate(() => {
    const spacer = document.createElement("div");
    spacer.id = "spacer";
    spacer.style.height = "300vh";
    const link = document.createElement("a");
    link.id = "probe-link";
    link.href = "#bg";
    link.textContent = "Background link";
    link.style.cssText = "position:absolute;top:250vh";
    document.body.append(spacer, link);
  });

/** Grows the nav past any viewport. */
const addNavItems = (page: Page, total: number) =>
  page.evaluate((n) => {
    const ul = document.querySelector(".b-nav ul");
    for (let i = 5; i <= n; i += 1) {
      const li = document.createElement("li");
      li.innerHTML = `<a class="b-link" href="#i${i}">Item ${i}</a>`;
      ul?.append(li);
    }
  }, total);

test.beforeEach(async ({ page }) => {
  await page.goto("./");
});

test.describe("viewport anchoring", () => {
  test("stays over the viewport when the page is scrolled", async ({
    page,
  }) => {
    await addBackgroundContent(page);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(1000);

    // Reachable after scrolling is the point: as `position: absolute` this sat at
    // the top of the document and scrolled away.
    const toggle = await page.locator(".b-menu").boundingBox();
    expect(toggle?.y).toBeGreaterThanOrEqual(0);
    expect(toggle?.y).toBeLessThan(page.viewportSize()?.height ?? 0);

    await open(page);
    expect(
      await page.evaluate(
        () => getComputedStyle(document.body, "::after").position
      )
    ).toBe("fixed");

    const nav = await page.locator(".b-nav").boundingBox();
    expect(nav?.y).toBeGreaterThanOrEqual(0);
  });

  test("the wash covers the viewport and swallows clicks behind it", async ({
    page,
  }) => {
    await addBackgroundContent(page);
    await open(page);
    const atCentre = await page.evaluate(() => {
      const el = document.elementFromPoint(innerWidth / 2, innerHeight / 2);
      return el?.id ?? el?.tagName ?? "";
    });
    expect(atCentre).not.toBe("probe-link");
  });
});

test.describe("scrolling a list taller than the window", () => {
  for (const vp of [
    { height: 300, links: 4, width: 800 },
    { height: 390, links: 8, width: 844 },
    { height: 640, links: 14, width: 390 },
  ]) {
    test(`${vp.width}x${vp.height} with ${vp.links} links reaches the last link`, async ({
      page,
    }) => {
      await page.setViewportSize({ height: vp.height, width: vp.width });
      if (vp.links > 4) {
        await addNavItems(page, vp.links);
      }
      await open(page);

      const nav = page.locator(".b-nav");
      expect(await nav.evaluate((n) => n.scrollHeight > n.clientHeight)).toBe(
        true
      );

      await nav.evaluate((n) => n.scrollTo(0, n.scrollHeight));
      await page.waitForTimeout(200);

      const last = await page.locator(".b-nav li").last().boundingBox();
      expect(last?.y).toBeGreaterThanOrEqual(0);
      expect((last?.y ?? 0) + (last?.height ?? 0)).toBeLessThanOrEqual(
        vp.height + 1
      );

      // The close button must not scroll away with the list.
      const toggle = await page.locator(".b-menu").boundingBox();
      expect((toggle?.y ?? -1) + (toggle?.height ?? 0)).toBeLessThanOrEqual(
        vp.height
      );

      // Scroll stays in the menu.
      expect(await page.evaluate(() => window.scrollY)).toBe(0);
      expect(
        await nav.evaluate((n) => getComputedStyle(n).overscrollBehaviorY)
      ).toBe("contain");
    });
  }
});

test.describe("focus containment", () => {
  test("Tab never leaves the open menu", async ({ page }) => {
    await addBackgroundContent(page);
    await open(page);

    expect(
      await page.evaluate(() =>
        document.querySelector("#probe-link")?.hasAttribute("inert")
      )
    ).toBe(true);

    const visited: string[] = [];
    for (let i = 0; i < 8; i += 1) {
      await page.keyboard.press("Tab");
      visited.push(
        await page.evaluate(() => {
          const a = document.activeElement;
          return a === document.body ? "BODY" : `${a?.tagName}.${a?.className}`;
        })
      );
    }
    expect(visited.join(" ")).not.toContain("probe-link");
  });

  test("Escape closes, restores focus, and releases inert", async ({
    page,
  }) => {
    await addBackgroundContent(page);
    await open(page);
    await page.locator(".b-nav .b-link").first().focus();
    await page.keyboard.press("Escape");
    await page.waitForTimeout(600);

    const toggle = page.locator(".b-menu");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(
      await page.evaluate(() => document.activeElement?.className)
    ).toContain("b-menu");
    expect(
      await page.evaluate(() =>
        document.querySelector("#probe-link")?.hasAttribute("inert")
      )
    ).toBe(false);
  });

  test("closed nav links are unfocusable, even after interaction", async ({
    page,
  }) => {
    await open(page);
    // Tabbing first is deliberate: `transition: all` used to hold `visibility:
    // visible` on these links, so they became focusable again once touched.
    for (let i = 0; i < 8; i += 1) {
      await page.keyboard.press("Tab");
    }
    await page.keyboard.press("Escape");
    await page.waitForTimeout(600);

    const focusable = await page.evaluate(
      () =>
        [...document.querySelectorAll<HTMLElement>(".b-nav a")].filter((a) => {
          (document.activeElement as HTMLElement | null)?.blur();
          a.focus();
          return document.activeElement === a;
        }).length
    );
    expect(focusable).toBe(0);
    expect(
      await page
        .locator(".b-nav")
        .evaluate((n) => getComputedStyle(n).visibility)
    ).toBe("hidden");
  });
});

test.describe("touch targets", () => {
  test("links and the brand meet 44px", async ({ page }) => {
    await open(page);
    const link = await page.locator(".b-nav .b-link").first().boundingBox();
    expect(link?.height).toBeGreaterThanOrEqual(44);
    const brand = await page.locator(".b-brand").boundingBox();
    expect(brand?.height).toBeGreaterThanOrEqual(44);
  });
});

test.describe("motion", () => {
  test("nothing animates a layout property", async ({ page }) => {
    await open(page);
    const transitioned = await page.evaluate(() =>
      (
        [
          [".b-nav", null],
          [".b-nav li", "::before"],
          [".b-link", null],
          [".b-menu", null],
          [".b-bun", null],
          [".b-brand", null],
        ] as [string, string | null][]
      )
        .map(([selector, pseudo]) => {
          const el = document.querySelector(selector);
          return el
            ? getComputedStyle(el, pseudo ?? undefined).transitionProperty
            : "";
        })
        .join(" ")
    );
    for (const layout of [
      "width",
      "height",
      "padding",
      "margin",
      "inset",
      "all",
    ]) {
      expect(transitioned).not.toContain(layout);
    }
  });

  test("no transitions or slide under reduced motion", async ({ page }) => {
    // emulateMedia rather than `test.use`, so the emulation is applied at a point
    // this test controls instead of depending on option precedence.
    await page.emulateMedia({ reducedMotion: "reduce" });

    const state = await page.evaluate(() => ({
      li: getComputedStyle(document.querySelector(".b-nav li") as Element)
        .animationName,
      matches: matchMedia("(prefers-reduced-motion: reduce)").matches,
      nav: getComputedStyle(document.querySelector(".b-nav") as Element)
        .transitionProperty,
    }));

    expect(state.matches).toBe(true);
    expect(state.li).toBe("none");
    expect(["all", "none"]).toContain(state.nav);
  });
});

test.describe("forced colors", () => {
  test("bars, links and the indicator stay visible", async ({ page }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await open(page);
    const colors = await page.evaluate(() => ({
      bar: getComputedStyle(document.querySelector(".b-bun") as Element)
        .backgroundColor,
      indicator: getComputedStyle(
        document.querySelector(".b-nav li") as Element,
        "::before"
      ).backgroundColor,
      link: getComputedStyle(document.querySelector(".b-link") as Element)
        .color,
      wash: getComputedStyle(document.body, "::after").backgroundColor,
    }));
    expect(colors.bar).not.toBe("rgba(0, 0, 0, 0)");
    expect(colors.link).not.toBe("rgba(0, 0, 0, 0)");
    expect(colors.bar).not.toBe(colors.wash);
    expect(colors.indicator).not.toBe(colors.wash);
  });
});

test("no console errors on load or open", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.reload();
  await open(page);
  expect(errors).toEqual([]);
});
