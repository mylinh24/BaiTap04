# TODO: Implementation of Song Features (Favorites, Similar, Listened, Comments)

## Completed Steps:
- [x] Create `favorites.js` model: Table creation, add/remove favorite, get user favorites, check if favorite.
- [x] Create `listenedHistory.js` model: Table creation, add listen (increment count), get user history, get listen count.
- [x] Create `comments.js` model: Table creation, add comment, get comments by song, delete comment.
- [x] Create `song.js` model: Add listener_count column to songs table, get song by ID, update listener count.
- [x] Update `song.controller.js`: Add methods for favorites, listened, similar songs (by category), comments.
- [x] Update `song.routes.js`: Add routes for new features, apply auth middleware where needed.

## Pending Steps:
- [ ] Update Elasticsearch indexing: Include `listener_count` in `indexSong` function. Reindex songs after listener updates (e.g., in `addListen`).
- [ ] Enhance similar songs: Use Elasticsearch for advanced similarity (e.g., artist fuzzy match) instead of just SQL category.
- [ ] Test backend APIs: Use Postman or execute_command to verify endpoints (e.g., POST /songs/:id/favorite requires auth).
- [x] Frontend integration: Update React components (home.jsx for similar/listen count/comments, user.jsx for favorites/history). Add API calls via util/api.js.
- [ ] Error handling & validation: Add more checks (e.g., song exists before operations).
- [ ] Reindex all songs: Run a command to sync listener_count to Elastic after schema changes.

## Next Steps:
Proceed with Elasticsearch updates, then confirm backend completion before frontend.
