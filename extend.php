<?php

use Flarum\Extend;

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__ . '/js/dist/forum.js')
        // The nav editor (and SortableJS with it) is its own chunk, loaded
        // only on /header-nav; this publishes it.
        ->jsDirectory(__DIR__ . '/js/dist/forum')
        ->css(__DIR__ . '/less/forum.less')
        ->route('/header-nav', 'ernestdefoe-header-nav.editor'),

    (new Extend\Frontend('admin'))
        ->js(__DIR__ . '/js/dist/admin.js'),

    new Extend\Locales(__DIR__ . '/locale'),

    // The saved navigation, to every visitor: the header and the menu are drawn
    // from it on every page. Null until a forum saves one, and the starting
    // navigation applies.
    (new Extend\Settings())
        ->serializeToForum('headerNav', 'ernestdefoe-header-nav.config', function ($value) {
            if (! is_string($value) || $value === '') {
                return null;
            }

            $decoded = json_decode($value, true);

            return is_array($decoded) ? $decoded : null;
        }),
];
