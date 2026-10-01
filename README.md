# Header Nav

Moves the forum's navigation out of the pill row above the discussion list and
into the header, grouped.

## Why grouped

The pill row had nine equal-weight items wrapping onto two lines, which is a
list rather than navigation — nothing in it said which were the things people
come for. Four do: discussions, the pick'em, fantasy and the rosters. Everything
else lives behind **More** and stops competing.

## 🚨 Nothing is hardcoded into existence

Every destination belongs to another extension, any of which can be disabled.
Each item is checked against Flarum's own nav before it is shown — a link to
`/gallery` on a forum without the gallery is a nav item that only ever 404s, in
the most visible place on the page.

## 🚨 The pill row is hidden by item, not by hiding the nav

That same container also holds the conference tags, which are the forum's
structure. Hiding `.item-nav` outright takes SEC, ACC, the Big Ten and the rest
with it.

On a phone the header nav goes and the pill row comes back: the header has room
for a logo and two controls at 375px and nothing else.
