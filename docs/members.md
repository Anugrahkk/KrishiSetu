# Members: KrishiSetu (Tinkerhub Hackathon)

## Team
| # | Name | GitHub | Role |
|---|---|---|---|
| 1 | Anugrah | `@your-github-username` | Frontend lead, design, content, testing, pitch |
| 2 | `[Member 2 name]` | `@their-github-username` | Backend lead, OpenCV, database, GitHub setup |

> Suggested split. Because both of you are beginners, Antigravity's agent writes most code. The split below decides **who drives which part** so you do not edit the same files at once. Swap roles if you prefer.

## Responsibilities
### Member 1: Frontend and experience
- Landing page, farmer pages, buyer pages (`templates/`, `static/`)
- Follow `design.md` (colours, cards, navigation)
- Seed content: product names, sample photos, vet entries
- Test every page on phone-size screen
- Prepare demo script and pitch slides

### Member 2: Backend and Computer Vision
- Flask app, routes, SQLite schema and seed (`app.py`, `routes/`, `db.py`)
- OpenCV Crop Doctor (`cv/`), sample images, self-test
- GitHub repo creation, branch rules, merging
- Requirements file and run instructions in README

### Both
- Keep `log.md` updated (end of every hour)
- Review each other's pull requests
- Run the pre-demo checklist in `todo.md` together
- Final demo rehearsal (at least twice)

## Ownership map (avoid conflicts)
| Area | Owner | Files |
|---|---|---|
| Pages and styling | Member 1 | `templates/`, `static/css`, `static/js/*.js` (UI), `static/img` |
| API and database | Member 2 | `app.py`, `routes/`, `db.py`, `schema.sql`, `seed.sql` |
| Crop Doctor engine | Member 2 | `cv/` |
| Crop Doctor page (`doctor.html`, `scan.js`) | Member 1, with Member 2 for the API contract | |
| Docs | Shared | `docs/*.md` |

## Working agreement
1. One branch each: `member1-frontend`, `member2-backend`. Never commit straight to `main` after the first push.
2. Commit small and often with clear messages: `feat: add cart page`, `fix: scan retry message`.
3. **Pull before you push** (`git pull origin main`), and merge to `main` at least every hour.
4. If you touch a file the other person owns, tell them first.
5. Contract first: the API shapes in `api.md` do not change without telling each other.
6. Ask the Antigravity agent small, specific tasks and **run the app after every change**.

## Communication
- Quick sync every hour (5 minutes): what is done, what is blocked, what is next.
- Blockers longer than 15 minutes -> ask the other member or a hackathon mentor.

## Contact (fill in)
| Name | Phone / WhatsApp | Email |
|---|---|---|
| Anugrah | | |
| Member 2 | | |
