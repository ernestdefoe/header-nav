# Header Nav

Put your forum's navigation in the header, and decide what goes where.

Flarum 2. Works with the default theme and with themes that draw the menu as
pills or tiles (Bespoke, GridIron Nation and others), because it changes the
menu itself rather than any one theme's markup.

## What you can do

Open **Admin → Header Nav → Open the navigation editor**. The editor opens on
the forum, and lists everything your forum's menu offers: All Discussions,
Following, Tags, Messages, and whatever your extensions add (a pick'em, a
knowledge base, a gallery…). For each one:

- **Where it goes.** *Header* puts it in the header and takes it out of the
  menu. *Menu* leaves it in the sidebar, or in your theme's pills or tiles.
  *Hidden* removes it everywhere — for example, "All Discussions" when your
  forum's home is the tags page.
- **Rename it.** Leave the name empty to keep the original.
- **Change its icon.** Any Font Awesome class, such as `fas fa-home`.
- **Drag it into order.** The order applies to the header and to the menu.

You can also **add your own links** — a privacy notice, your main site, a
Discord — to the header or the menu, opening in the same tab or a new one.

And choose **how many links sit on the header row** before the rest go behind
**More**. A narrow window shows fewer; on a phone they are all in the drawer.

Changes show in the header as soon as you save.

## Good to know

- **Nothing is linked into existence.** An entry belongs to the extension that
  provides it. Disable that extension and the entry disappears from the header
  too, instead of becoming a link that goes nowhere; enable it again and it
  comes back where you put it.
- **New extensions are never lost.** Anything a new extension adds to the menu
  after you saved stays in the menu, where that extension put it, until you
  move it.
- **Buttons stay buttons.** A menu entry that is not a link, such as "Mark all
  as read", can be kept in the menu or hidden, but not put in the header.
- **Only safe addresses.** A custom link must be a path on your forum
  (`/p/privacy`), an `http(s)` address or `mailto:`. Anything else is refused.
- **Before you save anything**, the header starts with the common destinations
  your forum has — discussions, a pick'em, a roster, a knowledge base, an issue
  tracker, articles, a gallery, badges, tags and hashtags, whichever exist —
  and everything else stays in the menu.

## Installation

```bash
composer require ernestdefoe/header-nav
php flarum cache:clear
```

Then enable **Header Nav** in the admin panel.

## Updating

```bash
composer update ernestdefoe/header-nav
php flarum cache:clear
```

## Licence

MIT.
