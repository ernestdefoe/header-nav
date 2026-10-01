import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import HeaderNav from './forum/components/HeaderNav';

app.initializers.add('ernestdefoe-header-nav', () => {
  /*
   * 🚨 Added to HeaderPrimary, which is the LEFT side of the header.
   *
   * HeaderSecondary is the right, and it already carries search, the theme
   * switcher, notifications and the session control. Putting navigation there
   * crowds the controls people need on every page; the middle of the header is
   * empty and is where a nav belongs.
   *
   * 🚨 Extended by module PATH, not `.prototype`. Core components are
   * code-split chunks and are undefined this early in boot, so a prototype
   * extension silently no-ops.
   */
  extend('flarum/forum/components/HeaderPrimary', 'items', function (items) {
    items.add('ernestdefoe-header-nav', <HeaderNav />, -10);
  });
});
