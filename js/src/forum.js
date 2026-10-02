import app from 'flarum/forum/app';
import { extend, override } from 'flarum/common/extend';
import OverflowingList from 'flarum/common/components/OverflowingList';
import Link from 'flarum/common/components/Link';
import Icon from 'flarum/common/components/Icon';
import { ALL, DIRECT } from './forum/nav';

/**
 * What Flarum's own nav is offering, and where each entry points.
 *
 * 🚨 Both existence and destination come from there, not from this file.
 *
 * These routes belong to other extensions, any of which can be disabled — a
 * hardcoded link to /gallery on a forum without the gallery is a nav item that
 * only ever 404s. And "All Discussions" is /all on one forum and / on another
 * depending on the default route, so the href cannot be assumed either.
 */
function offered() {
  const nav = document.querySelector('.IndexPage-nav .item-nav');
  if (!nav) return null; // Not on a page with the nav — show everything.

  const found = new Map();
  nav.querySelectorAll('li[class*="item-"]').forEach((li) => {
    const a = li.querySelector('a');
    li.classList.forEach((c) => {
      if (c.startsWith('item-')) found.set(c, a ? a.getAttribute('href') : null);
    });
  });
  return found.size ? found : null;
}

app.initializers.add('ernestdefoe-header-nav', () => {
  /*
   * 🚨 The "More" menu is chosen, not left to the window width.
   *
   * HeaderPrimary is an OverflowingList, which only collapses what does not
   * fit. On fbsfb nine links never fit, so the row read as a few links and a
   * menu; on a forum with seven shorter ones everything fitted and the header
   * became a wall of links. Capping the room the header row is allowed to use
   * at DIRECT links plus the toggle gives every forum the same shape, and it
   * reuses core's own menu rather than building a second one.
   *
   * The cap goes on the measured width, not on the count core settles on:
   * core redraws whenever its count changes, and overriding the count after it
   * would make the two take turns forever. A smaller real width still wins, so
   * a narrow window collapses further exactly as before.
   */
  /*
   * 🚨 Core measures item widths only while every item is on the row, and
   * never again once its count stops matching. This row starts with every
   * entry (the sidebar it is checked against has not rendered yet) and then
   * drops the ones the forum does not offer: 11 became 7 with core holding a
   * count of 8, so it never re-measured, its widths never matched again, and
   * every later layout returned early. Nothing ever collapsed. When the
   * number of items changes, start the measurement over.
   */
  override(OverflowingList.prototype, 'recalculate', function (original) {
    const count = (this.attrs.items || []).length;

    if (
      this.element?.closest('#header-primary') &&
      this.visibleCount !== null &&
      this.itemWidths.length !== count
    ) {
      this.visibleCount = null;
      this.itemWidths = [];
      m.redraw();
      return;
    }

    return original();
  });

  override(OverflowingList.prototype, 'availableWidth', function (original, list) {
    const free = original(list);

    if (!list.closest('#header-primary') || this.itemWidths.length <= DIRECT) return free;

    const direct = this.itemWidths.slice(0, DIRECT).reduce((sum, width) => sum + width, 0);

    return Math.min(free, Math.ceil(direct + (this.toggleWidth || 48)) + 1);
  });

  /*
   * 🚨 Each link is its OWN item in HeaderPrimary.
   *
   * HeaderPrimary wraps its items in an OverflowingList, which moves whatever
   * does not fit into a "..." menu. Adding the whole nav as ONE item meant the
   * entire thing collapsed as a single blob — the menu opened onto a panel with
   * every link crammed into it and nothing to tell you what it was.
   *
   * One item per link lets that list do exactly what it is for: show what fits,
   * in priority order, and put the rest in the menu as ordinary labelled rows.
   * The priorities are the organisation — discussions, the pick'em, fantasy and
   * the rosters are what people come for, so they are the last to go.
   */
  extend('flarum/forum/components/HeaderPrimary', 'items', function (items) {
    const have = offered();

    ALL.forEach((entry, i) => {
      if (have && !have.has(entry.item)) return;

      const href = (have && have.get(entry.item)) || entry.href;

      items.add(
        `ernestdefoe-header-nav-${entry.key}`,
        <Link
          href={href}
          className="HeaderNav-link"
          title={app.translator.trans(entry.label, {}, true)}
          aria-label={app.translator.trans(entry.label, {}, true)}
        >
          <Icon name={entry.icon} className="HeaderNav-icon" />
          <span className="HeaderNav-label">{app.translator.trans(entry.label)}</span>
        </Link>,
        100 - i
      );
    });
  });
});
