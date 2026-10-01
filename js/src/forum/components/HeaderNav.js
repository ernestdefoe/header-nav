import Component from 'flarum/common/Component';
import Dropdown from 'flarum/common/components/Dropdown';
import Link from 'flarum/common/components/Link';
import icon from 'flarum/common/helpers/icon';
import app from 'flarum/forum/app';
import { PRIMARY, MORE } from '../nav';

/**
 * The forum's navigation, in the header.
 *
 * 🚨 Every destination is checked against Flarum's OWN nav before it is shown.
 *
 * These routes come from other extensions, any of which can be disabled. A
 * hardcoded link to /gallery on a forum without the gallery is a nav item that
 * only ever 404s — the decorative-control trap, in the most visible place on
 * the page. If Flarum is not offering it, neither is this.
 */
export default class HeaderNav extends Component {
  /** The `li` classes Flarum's own nav is currently rendering. */
  available() {
    const nav = document.querySelector('.IndexPage-nav .item-nav');
    if (!nav) return null; // Not on a page that has the nav — show everything.

    const seen = new Set();
    nav.querySelectorAll('li[class*="item-"]').forEach((li) =>
      li.classList.forEach((c) => c.startsWith('item-') && seen.add(c))
    );
    return seen.size ? seen : null;
  }

  link(entry) {
    return (
      <Link href={entry.href} className="HeaderNav-link" key={entry.key}>
        {icon(entry.icon, { className: 'HeaderNav-icon' })}
        <span className="HeaderNav-label">{app.translator.trans(entry.label)}</span>
      </Link>
    );
  }

  view() {
    const have = this.available();
    const show = (e) => !have || have.has(e.item);

    const primary = PRIMARY.filter(show);
    const more = MORE.filter(show);

    if (!primary.length && !more.length) return null;

    return (
      <nav className="HeaderNav" aria-label={app.translator.trans('ernestdefoe-header-nav.forum.label')}>
        {primary.map((e) => this.link(e))}

        {more.length ? (
          <Dropdown
            className="HeaderNav-more"
            buttonClassName="Button Button--link HeaderNav-link"
            label={app.translator.trans('ernestdefoe-header-nav.forum.more')}
            icon="fas fa-ellipsis"
            caretIcon="fas fa-chevron-down"
          >
            {more.map((e) => this.link(e))}
          </Dropdown>
        ) : null}
      </nav>
    );
  }
}
