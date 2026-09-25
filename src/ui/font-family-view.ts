/**
 * The expanded/collapsed state of one font family row.
 *
 * The state is held in a class (`is-open`) rather than in an inline style, so the stylesheet
 * decides what "open" looks like and no element carries a style attribute. Two callers need to
 * agree on it — the row's own header, and the expand-all / collapse-all buttons above the list —
 * so the class contract lives in one place instead of being spelled out at each call site.
 */

/** The row's disclosure icon, which the stylesheet rotates when the row is open. */
const TOGGLE_SELECTOR = '.font-family-toggle';

/** The variant list inside a row, hidden by the stylesheet unless the row is open. */
const VARIANTS_SELECTOR = '.font-variants';

/**
 * Opens or closes one family row.
 *
 * @param familyEl - The `.font-family-item` element
 * @param expanded - True to open, false to close
 */
export function setFontFamilyExpanded(familyEl: HTMLElement, expanded: boolean): void {
    familyEl.querySelector<HTMLElement>(TOGGLE_SELECTOR)?.toggleClass('is-open', expanded);
    familyEl.querySelector<HTMLElement>(VARIANTS_SELECTOR)?.toggleClass('is-open', expanded);
}

/**
 * Tells whether one family row is currently open.
 *
 * Read from the class rather than tracked alongside it, so a re-render or an expand-all pass
 * cannot leave a caller's own copy of the state disagreeing with what is on screen.
 *
 * @param familyEl - The `.font-family-item` element
 * @returns True when the row is open
 */
export function isFontFamilyExpanded(familyEl: HTMLElement): boolean {
    return familyEl.querySelector<HTMLElement>(VARIANTS_SELECTOR)?.hasClass('is-open') ?? false;
}
