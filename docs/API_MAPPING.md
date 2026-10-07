# Spotlight → Kiddies Check API mapping

Spotlight reads three Kiddies Check endpoints. Two of them, under `/api/spotlight/*`, were added to Kiddies Check for this project. They are read-only and use the same database; nothing new is stored.

## Why there are dedicated Spotlight endpoints

The existing endpoints return **raw records for one school per request**:

- `GET /api/teacher/attendance` returns every attendance record.
- `GET /api/teacher/assessments` has no date filter, so it returns every assessment the school has ever recorded.

A network view across N schools would mean N requests per load, downloading all of that data and doing the KPI maths in the browser. `/api/spotlight/view` does the same maths with MongoDB aggregations in one request.

## Endpoints

| Endpoint | Status | Used for |
|---|---|---|
| `POST /api/auth/login` | Existing | Sign in; returns the JWT Spotlight uses as a Bearer token |
| `POST /api/auth/logout` | Existing | Sign out (recorded in the Kiddies Check activity log) |
| `GET /api/spotlight/me` | **New** | Who is signed in, how many schools they oversee, and where Spotlight opens (network or their only school). 403 for teachers and parents |
| `GET /api/spotlight/view?level&id&period&date` | **New** | Everything one dashboard level shows (see below) |

Code in Kiddies Check:
- `src/app/api/spotlight/me/route.ts`
- `src/app/api/spotlight/view/route.ts`
- `src/app/server/lib/spotlight/period.ts`: periods, working days, term and week labels.
- `src/app/server/lib/spotlight/scope.ts`: which schools a user may see.
- `src/app/server/lib/spotlight/metrics.ts`: the KPI aggregations.

## View → data

All of these come from a single `GET /api/spotlight/view` response.

| Dashboard element | Response field | Source collections |
|---|---|---|
| Date range, term/week label, prev/next | `period` | AcademicCalendar (terms and holidays) |
| Breadcrumbs | `breadcrumbs` | School, Class |
| KPI panel values | `kpis.<key>.value` | Attendance, Assessment, Student, SchoolMember, User |
| Gauge trend ("−18 vs previous working day") | `kpis.<key>.previous` | as above, for the comparison period |
| Sub-metrics (On time / Late, Records marked, Teachers recording) | `kpis.<key>.detail` | Attendance (status), Assessment |
| Bar chart | `kpis.<key>.series` (Mon–Fri, or weekly across a term) | Attendance, Assessment |
| Performance bands | computed in Spotlight from `rows.items[].kpis` | n/a |
| Schools / Arms / Pupils table | `rows` | School + head teacher; Class + class teacher; Student |
| Team tab | `team` | Network: head teachers. School: teachers. Arm: class + subject teachers |
| Info panel profile | `entity` | User (network), School, Class |
| Info panel counts and Active PTR | `counts` | School, SchoolMember, Class, Student |

### Who sees what (`scope.ts`)

- **Admins, learning specialists and all-school platform roles** (school director, school coordinator, viewer and others): every active, non-rejected school. They land on the network view.
- **School leaders, and anyone with `managedSchools`:** their own schools. With one school they land on that school; with several, on the network view.
- **Teachers and parents:** no access (403).

## Flagged: data not in Kiddies Check

These parts of the reference design have no data behind them today. Spotlight leaves them out rather than showing invented values.

| Design element | Gap | What would be needed |
|---|---|---|
| Employee ID, Hiring date (Info panel) | Not stored on `User` | Add `employeeId` and `hireDate` to `User` and to the profile forms |
| Supervisor tier and "staff who report to me" | No reporting lines exist; the only links are school membership and `managedSchools` | A `reportsTo` field (or supervisor → schools assignments). Until then the network Team tab lists head teachers |
| School code (Info panel) | Not stored on `School` | Add a `code` field |
| Map pin from coordinates | `School.location` is free text with no coordinates | Add `latitude`/`longitude`. Today the map and "Open in Google Maps" search for the school name plus `location` text, which can land on the wrong place |
| Morning / Afternoon attendance | One attendance record per pupil per day; no session | Add a `session` field to `Attendance` and record twice daily |
| Head teacher Present / On time, Teacher Present / On time / Coverage | Staff attendance isn't recorded | A staff attendance model |
| Lessons Completed / Started | No lesson delivery tracking | A lesson log (`LessonTemplate` exists but completions aren't recorded) |
| Arms (in the reference: grade + stream) | `Class` is used as the arm; `section` is appended to the name when set | None, unless arms need to group into grades |
| Historical pupil counts | `Student.isActive` reflects today, so past periods use today's enrolment as the denominator | Enrolment history, if past percentages must be exact |

## KPI definitions

| KPI | Formula | Notes |
|---|---|---|
| Present | (present + late) ÷ records marked | Only pupils with a record count |
| Attendance Marked | records marked ÷ (active pupils × working days elapsed) | Capped at 100%. Future days never count |
| Assessment Records | staff with ≥ 1 assessment dated in the period ÷ (teaching staff ∪ everyone who recorded) | Counting every recorder means an assessment by a head teacher or learning specialist always shows at school and network level, matching the arm view. Arm level and arm rows: pupils with ≥ 1 assessment ÷ pupils, because an arm has no teacher roster |

"Teaching staff" means active `SchoolMember` records with role `teacher`, legacy `User` records with role `teacher` and a `schoolId`, and the class teachers of active arms. The same set drives the Teachers count and Active PTR. Working days are Monday to Friday minus academic-calendar holidays, counted only up to today.
