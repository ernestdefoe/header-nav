import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import Link from 'flarum/common/components/Link';
import Icon from 'flarum/common/components/Icon';
import { ALL } from './forum/nav';

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
        <Link href={href} className="HeaderNav-link">
          <Icon name={entry.icon} className="HeaderNav-icon" />
          <span className="HeaderNav-label">{app.translator.trans(entry.label)}</span>
        </Link>,
        100 - i
      );
    });
  });
});
