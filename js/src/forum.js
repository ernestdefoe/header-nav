import app from 'flarum/forum/app';
import { extend, override } from 'flarum/common/extend';
import OverflowingList from 'flarum/common/components/OverflowingList';
import Link from 'flarum/common/components/Link';
import Icon from 'flarum/common/components/Icon';
import LinkButton from 'flarum/common/components/LinkButton';
import IndexSidebar from 'flarum/forum/components/IndexSidebar';
import { readNav, isReading } from './forum/nav';
import { current, safeHref } from './forum/config';
import { applyLogo } from './forum/logo';

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

    if (this.element?.closest('#header-primary') && this.visibleCount !== null && this.itemWidths.length !== count) {
      this.visibleCount = null;
      this.itemWidths = [];
      m.redraw();
      return;
    }

    return original();
  });

  override(OverflowingList.prototype, 'availableWidth', function (original, list) {
    const free = original(list);

    const DIRECT = current().direct;

    // In the phone drawer the links are a list with room for all of them.
    if (!list.closest('#header-primary') || (list.closest('.App-drawer') && window.innerWidth < 768) || this.itemWidths.length <= DIRECT) return free;

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
   * in the forum's chosen order, and put the rest in the menu as ordinary
   * labelled rows.
   */
  extend('flarum/forum/components/HeaderPrimary', 'items', function (items) {
    // 🚨 Here, not in the initializer: initializers run before the forum's
    // data is loaded, so `app.forum` does not exist yet there. The header is
    // drawn after it does, on every page; writing the same rule twice is a
    // no-op.
    applyLogo();

    const cfg = current();
    const offered = new Map(readNav().map((n) => [n.key, n]));

    cfg.items
      .filter((it) => it.place === 'header')
      .forEach((it, i) => {
        let href, icon, label, external;

        if (it.custom) {
          href = safeHref(it.href);
          if (!href || !it.label) return;
          icon = it.icon || 'fas fa-link';
          label = it.label;
          external = !href.startsWith('/');
        } else {
          const n = offered.get(it.key);
          // Its extension is not enabled here, or it is a button, not a link.
          if (!n || !n.link) return;
          href = n.href;
          icon = it.icon || n.icon;
          label = it.label || n.label;
        }

        items.add(
          `ernestdefoe-header-nav-${it.key}`,
          <Link
            href={href}
            external={external}
            target={it.custom && it.newTab ? '_blank' : undefined}
            rel={it.custom && it.newTab ? 'noopener noreferrer' : undefined}
            className="HeaderNav-link"
            title={label}
            aria-label={label}
          >
            {icon ? <Icon name={icon} className="HeaderNav-icon" /> : null}
            <span className="HeaderNav-label">{label}</span>
          </Link>,
          100 - i
        );
      });
  });

  app.routes['ernestdefoe-header-nav.editor'] = { path: '/header-nav', component: () => import('./forum/components/HeaderNavEditor') };
});

/*
 * 🚨 The sidebar is adjusted LAST.
 *
 * Extensions initialise in alphabetical order, so at the default priority this
 * would run before flarum/tags, the pick'em and the rest had added their
 * entries — and could neither move nor rename them. A low initializer priority
 * puts this extend at the end of the navItems chain, after all of them.
 *
 * Whatever is in the header is taken out of the menu (one place each), what is
 * hidden is taken out everywhere, and what stays is renamed and put in the
 * saved order. Every theme draws its pills or tiles from this same list, so
 * they all follow.
 */
app.initializers.add(
  'ernestdefoe-header-nav-menu',
  () => {
    extend(IndexSidebar.prototype, 'navItems', function (items) {
      if (isReading()) return;

      const cfg = current();

      cfg.items.forEach((it, i) => {
        const priority = 1000 - i;

        if (it.custom) {
          const href = safeHref(it.href);
          if (it.place !== 'menu' || !href || !it.label) return;

          items.add(
            it.key,
            <LinkButton
              href={href}
              icon={it.icon || 'fas fa-link'}
              external={!href.startsWith('/')}
              target={it.newTab ? '_blank' : undefined}
              rel={it.newTab ? 'noopener noreferrer' : undefined}
            >
              {it.label}
            </LinkButton>,
            priority
          );
          return;
        }

        if (!items.has(it.key)) return;

        if (it.place !== 'menu') {
          items.remove(it.key);
          return;
        }

        const v = items.get(it.key);
        if ((it.label || it.icon) && v && v.tag && v.attrs) {
          items.setContent(it.key, m(v.tag, { ...v.attrs, icon: it.icon || v.attrs.icon }, it.label || v.children));
        }
        items.setPriority(it.key, priority);
      });
    });
  },
  -1000
);
