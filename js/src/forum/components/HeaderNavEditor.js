import app from 'flarum/forum/app';
import Page from 'flarum/common/components/Page';
import Button from 'flarum/common/components/Button';
import Icon from 'flarum/common/components/Icon';
import extractText from 'flarum/common/utils/extractText';
import Sortable from 'sortablejs';
import { readNav } from '../nav';
import { applyLogo } from '../logo';
import { current, defaults, isSaved, prepare, newCustomKey, safeHref, safeIcon, PLACES } from '../config';

const t = (key, params) => app.translator.trans(`ernestdefoe-header-nav.forum.editor.${key}`, params);

/**
 * The navigation editor.
 *
 * 🚨 On the forum, not in the admin panel.
 *
 * The admin panel does not load the forum's JavaScript, so it cannot know what
 * the forum's nav contains — the pick'em, the knowledge base, Page Builder's
 * content types all add themselves there. Here the editor reads the real list,
 * names every entry the way visitors see it, and a save shows up in the header
 * behind it straight away.
 */
export default class HeaderNavEditor extends Page {
  oninit(vnode) {
    super.oninit(vnode);

    app.setTitle(extractText(t('title')));
    this.saving = false;
    this.load(current());
  }

  /** Build the working rows: the saved order, then anything new the forum offers. */
  load(cfg, fromSaved = isSaved()) {
    const offered = readNav();
    const byKey = new Map(offered.map((n) => [n.key, n]));
    const listed = new Set(cfg.items.map((it) => it.key));

    // 🚨 "Not offered" rows only for a navigation someone SAVED.
    //
    // The starting list names destinations from several extensions so it works
    // on any forum; on a forum without them, listing each as unavailable is
    // noise about extensions nobody here installed. Once a forum saves, an
    // entry that goes missing is worth showing — its extension was disabled,
    // and the row says so instead of the setting silently vanishing.
    const keep = fromSaved ? () => true : (it) => it.custom || byKey.has(it.key);

    this.direct = cfg.direct;
    this.logo = cfg.logo || '';
    this.rows = [
      ...cfg.items.filter(keep).map((it) => {
        const offered = it.custom ? null : byKey.get(it.key) || null;
        return { ...it, place: offered && !offered.link && it.place === 'header' ? 'menu' : it.place, offered };
      }),
      ...offered.filter((n) => !listed.has(n.key)).map((n) => ({ key: n.key, place: 'menu', label: '', icon: '', offered: n })),
    ];
    this.dirty = false;
  }

  view() {
    if (!app.session.user || !app.session.user.isAdmin()) {
      return (
        <div className="HeaderNavEditor container">
          <p className="HeaderNavEditor-denied">{t('denied')}</p>
        </div>
      );
    }

    return (
      <div className="HeaderNavEditor container">
        <header className="HeaderNavEditor-head">
          <h1>{t('title')}</h1>
          <p className="helpText">{t('intro')}</p>
        </header>

        <div className="HeaderNavEditor-legend">
          <span><strong>{t('place_header')}</strong> {t('place_header_help')}</span>
          <span><strong>{t('place_menu')}</strong> {t('place_menu_help')}</span>
          <span><strong>{t('place_hidden')}</strong> {t('place_hidden_help')}</span>
        </div>

        <ol className="HeaderNavEditor-list" oncreate={(vnode) => this.sortable(vnode.dom)}>
          {this.rows.map((row) => this.rowView(row))}
        </ol>

        <div className="HeaderNavEditor-add">
          <Button className="Button" icon="fas fa-plus" onclick={() => this.addCustom()}>
            {t('add_link')}
          </Button>
        </div>

        <div className="Form-group HeaderNavEditor-direct">
          <label for="HeaderNavEditor-direct">{t('direct_label')}</label>
          <p className="helpText">{t('direct_help')}</p>
          <input
            id="HeaderNavEditor-direct"
            className="FormControl"
            type="number"
            min="1"
            max="12"
            value={this.direct}
            oninput={(e) => {
              this.direct = e.target.value;
              this.dirty = true;
            }}
          />
        </div>

        <div className="Form-group HeaderNavEditor-direct">
          <label for="HeaderNavEditor-logo">{t('logo_label')}</label>
          <p className="helpText">{t('logo_help')}</p>
          <input
            id="HeaderNavEditor-logo"
            className="FormControl"
            type="number"
            min="20"
            max="120"
            placeholder={t('logo_placeholder')}
            value={this.logo}
            oninput={(e) => {
              this.logo = e.target.value;
              this.dirty = true;
            }}
          />
        </div>

        <div className="HeaderNavEditor-actions">
          <Button className="Button Button--primary" loading={this.saving} disabled={!this.dirty} onclick={() => this.save()}>
            {t('save')}
          </Button>
          <Button className="Button" disabled={this.saving} onclick={() => this.reset()}>
            {t('reset')}
          </Button>
          {this.dirty ? <span className="HeaderNavEditor-unsaved">{t('unsaved')}</span> : null}
        </div>
      </div>
    );
  }

  rowView(row) {
    const missing = !row.custom && !row.offered;
    const icon = safeIcon(row.icon) || (row.offered && row.offered.icon) || (row.custom ? 'fas fa-link' : '');
    const update = (patch) => {
      Object.assign(row, patch);
      this.dirty = true;
    };

    return (
      <li key={row.key} data-key={row.key} className={'HeaderNavEditor-row' + (missing ? ' is-missing' : '') + ` is-${row.place}`}>
        <span className="HeaderNavEditor-handle" title={t('drag')} aria-label={t('drag')}>
          <Icon name="fas fa-grip-vertical" />
        </span>

        <span className="HeaderNavEditor-preview" aria-hidden="true">
          {icon ? <Icon name={icon} /> : null}
        </span>

        <div className="HeaderNavEditor-fields">
          <div className="HeaderNavEditor-line">
            <input
              className="FormControl HeaderNavEditor-label"
              type="text"
              maxlength="60"
              aria-label={t('label')}
              placeholder={row.custom ? t('label') : row.offered ? row.offered.label : row.key}
              value={row.label}
              oninput={(e) => update({ label: e.target.value })}
            />
            <input
              className="FormControl HeaderNavEditor-icon"
              type="text"
              maxlength="80"
              aria-label={t('icon')}
              placeholder={(row.offered && row.offered.icon) || 'fas fa-link'}
              value={row.icon}
              oninput={(e) => update({ icon: e.target.value })}
            />
          </div>

          {row.custom ? (
            <div className="HeaderNavEditor-line">
              <input
                className={'FormControl HeaderNavEditor-href' + (row.href && !safeHref(row.href) ? ' is-invalid' : '')}
                type="text"
                maxlength="500"
                aria-label={t('url')}
                placeholder={t('url_placeholder')}
                value={row.href}
                oninput={(e) => update({ href: e.target.value })}
              />
              <label className="checkbox HeaderNavEditor-newTab">
                <input type="checkbox" checked={!!row.newTab} onchange={(e) => update({ newTab: e.target.checked })} />
                {t('new_tab')}
              </label>
            </div>
          ) : null}

          {missing ? <p className="HeaderNavEditor-note">{t('missing')}</p> : null}
          {row.offered && !row.offered.link ? <p className="HeaderNavEditor-note">{t('not_a_link')}</p> : null}
          {row.custom && row.href && !safeHref(row.href) ? <p className="HeaderNavEditor-note is-error">{t('url_invalid')}</p> : null}
        </div>

        <div className="ButtonGroup HeaderNavEditor-place" role="group" aria-label={t('placement')}>
          {PLACES.filter((p) => !(row.custom && p === 'hidden') && !(p === 'header' && row.offered && !row.offered.link)).map((p) => (
            <Button
              className={'Button Button--small' + (row.place === p ? ' active Button--primary' : '')}
              aria-pressed={row.place === p ? 'true' : 'false'}
              onclick={() => update({ place: p })}
            >
              {t('place_' + p)}
            </Button>
          ))}
        </div>

        {row.custom ? (
          <Button
            className="Button Button--icon Button--link HeaderNavEditor-remove"
            icon="fas fa-trash-alt"
            aria-label={t('remove')}
            title={t('remove')}
            onclick={() => {
              this.rows = this.rows.filter((r) => r !== row);
              this.dirty = true;
            }}
          />
        ) : null}
      </li>
    );
  }

  /**
   * Drag to reorder.
   *
   * 🚨 The DOM move is undone before the rows are reordered.
   *
   * Sortable moves the element itself; Mithril then redraws from `this.rows`
   * and finds the DOM already rearranged under it, which leaves the two
   * disagreeing about which node is which. Putting the node back first lets
   * Mithril make the move from the data, so they never diverge.
   */
  sortable(list) {
    Sortable.create(list, {
      handle: '.HeaderNavEditor-handle',
      animation: 150,
      onEnd: (e) => {
        const { oldIndex, newIndex, item, from } = e;
        if (oldIndex === newIndex) return;

        from.removeChild(item);
        from.insertBefore(item, from.children[oldIndex] || null);

        const [moved] = this.rows.splice(oldIndex, 1);
        this.rows.splice(newIndex, 0, moved);
        this.dirty = true;
        m.redraw();
      },
    });
  }

  addCustom() {
    this.rows.push({ key: newCustomKey(), custom: true, place: 'header', label: '', icon: '', href: '', newTab: false, offered: null });
    this.dirty = true;
  }

  reset() {
    if (!confirm(extractText(t('reset_confirm')))) return;
    this.load(defaults(), false);
    this.dirty = true;
  }

  save() {
    const cfg = prepare({
      direct: this.direct,
      logo: this.logo,
      // A custom link with no name or no usable address has nowhere to go.
      items: this.rows
        .filter((r) => !r.custom || (r.label.trim() && safeHref(r.href)))
        .map(({ offered, ...r }) => ({ ...r, label: r.label.trim(), icon: r.icon.trim() })),
    });

    this.saving = true;

    return app
      .request({
        method: 'POST',
        url: `${app.forum.attribute('apiUrl')}/settings`,
        body: { 'ernestdefoe-header-nav.config': JSON.stringify(cfg) },
      })
      .then(() => {
        // The header and the menu read this attribute, so they update now.
        app.forum.pushAttributes({ headerNav: cfg });
        applyLogo();
        this.load(cfg, true);
        app.alerts.show({ type: 'success' }, t('saved'));
      })
      .catch(() => {
        app.alerts.show({ type: 'error' }, t('save_failed'));
      })
      .finally(() => {
        this.saving = false;
        m.redraw();
      });
  }
}
