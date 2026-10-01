/**
 * What goes in the header, and how it is grouped.
 *
 * 🚨 Four direct links and ONE dropdown, not nine pills moved sideways.
 *
 * The pill row had nine equal-weight items wrapping onto two lines, which is a
 * list rather than navigation — nothing in it said which were the things people
 * come here for. Discussions, the pick'em, fantasy and the rosters are those
 * four; everything else is somewhere you go occasionally, so it lives behind
 * "More" and stops competing.
 *
 * Each entry names the `li` class Flarum's own nav uses for the same
 * destination, so the sidebar copy can be hidden precisely rather than by
 * hiding the whole nav — which would take the conference tags with it.
 */
export const PRIMARY = [
  { key: 'discussions', href: '/all', icon: 'far fa-comments', label: 'ernestdefoe-header-nav.forum.discussions', item: 'item-allDiscussions' },
  { key: 'picks', href: '/picks', icon: 'fas fa-football', label: 'ernestdefoe-header-nav.forum.picks', item: 'item-picks' },
  { key: 'fantasy', href: '/fantasy', icon: 'fas fa-trophy', label: 'ernestdefoe-header-nav.forum.fantasy', item: 'item-fantasy' },
  { key: 'roster', href: '/roster', icon: 'fas fa-users', label: 'ernestdefoe-header-nav.forum.roster', item: 'item-roster' },
];

export const MORE = [
  { key: 'articles', href: '/c/articles', icon: 'fas fa-newspaper', label: 'ernestdefoe-header-nav.forum.articles', item: 'item-pagebuilder-articles' },
  { key: 'gallery', href: '/gallery', icon: 'fas fa-images', label: 'ernestdefoe-header-nav.forum.gallery', item: 'item-atrium' },
  { key: 'badges', href: '/badges', icon: 'fas fa-award', label: 'ernestdefoe-header-nav.forum.badges', item: 'item-badges' },
  { key: 'tags', href: '/tags', icon: 'fas fa-th-large', label: 'ernestdefoe-header-nav.forum.tags', item: 'item-tags' },
  { key: 'hashtags', href: '/hashtags', icon: 'fas fa-hashtag', label: 'ernestdefoe-header-nav.forum.hashtags', item: 'item-hashtags' },
];

/**
 * The order is the organisation.
 *
 * HeaderPrimary's OverflowingList drops from the END when space runs out, so
 * the four things people come here for sit first and are the last to go into
 * the overflow menu.
 */
export const ALL = [...PRIMARY, ...MORE];
