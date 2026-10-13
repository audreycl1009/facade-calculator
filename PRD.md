# Facade Material Area Calculator — PRD

Oct 13, 2026 · @Audrey Chang Liao

A web calculator that turns facade dimensions, openings and material zones into net area per material, with waste included, in under 3 minutes per facade. Version 1 is manual input only. It replaces the spreadsheet and hand calculations used today.

## 1. Problem

Facade area takeoffs are slow and easy to get wrong. The main causes are:

- **Opening deductions.** Windows and doors are subtracted by hand, often from the wrong material zone, or missed entirely.
- **Multi-material splits.** When one facade has several materials (stone base, aluminum panel above), each zone is calculated separately and openings that cross zones get double-counted or skipped.
- **Waste factors.** These are applied inconsistently, and it is hard to tell which totals include them.
- **Rework.** A design change means redoing the whole sheet, with no record of the inputs behind each number.

## 2. Users

| User | Stage | What they need |
| --- | --- | --- |
| Architect | Construction documents | Quick, checkable areas per material to coordinate with specifications |
| Contractor estimator | Bidding and procurement | Net and ordered quantities (with waste) to price and buy material |
| Project manager | Change review | See how a design change shifts quantities |

## 3. Inputs

Each facade is entered as a flat rectangle. All dimensions are in meters and areas in m².

| Input | Fields | Notes |
| --- | --- | --- |
| Facade | Name, width (m), height (m) | e.g. North elevation, 24.0 × 15.6 |
| Openings | Type (window/door/louver), width, height, sill height, count | Sill height places the opening, so it is deducted from the right zone |
| Material zones | Material, bottom height, top height | By height band (e.g. stone 0–4.2 m, aluminum panel 4.2–15.6 m); bands must cover the full height with no overlap |
| Waste factor | % per material | Default 5%, editable |

Zoning by percentage is an option for early estimates, but openings can't be placed in percentage zones, so v1 supports height bands only.

## 4. Outputs

For each material in each zone, the tool computes:

```latex
A_{net} = A_{zone} - \sum A_{openings \cap zone}, \qquad A_{order} = A_{net} \times (1 + w)
```

The results table has one row per facade × material:

- Gross area (m²)
- Openings deducted (m²)
- Net area (m²)
- Waste %
- Order area (m²)

Subtotals are shown per facade and per material, plus a project total.

Export options:

- **Copy to clipboard** as tab-separated text that pastes straight into Excel.
- **Download CSV**, which also lists every input so the numbers can be checked.

A warning appears when an opening extends past the facade edge or the zones don't cover the full height.

## 5. Success

| Metric | Target |
| --- | --- |
| Accuracy vs. hand calculation | Within 1% per material on 5 self-designed test facades with hand-calculated answers (this doubles as the tool's eval set) |
| Time to complete one facade | Under 3 minutes (about 10 openings, 3 materials) |
| Feedback | 2–3 architects or contractor estimators try it and give written feedback within 1 month of launch |
| Rework after a design change | Edit inputs and re-export in under 1 minute |

## Decisions (v1)

| # | Question | Decision |
| --- | --- | --- |
| 1 | Do openings appear in the results? | Yes. Opening area is listed per type (window, door, louver) as separate rows |
| 2 | Are small openings deducted? | All openings are deducted by default. A "don't deduct openings smaller than X m²" threshold is available, default 0 |
| 3 | Reveals (jambs, sills, heads)? | Not in v1 (see Out of scope) |
| 4 | Repeated identical facades? | Each facade has a quantity field, default 1 |
| 5 | Zones don't cover the full height? | Calculate anyway and show a prominent warning |
| 6 | Overlapping openings? | Not detected, because openings have no horizontal position. Usage notes say openings must not overlap |
| 7 | Rounding | Display 2 decimal places. No rounding during calculation |
| 8 | Language | English UI (portfolio piece for international roles) |

## 6. Out of scope (v1)

- Importing from Rhino, Revit, DWG or IFC files
- 3D views or drawing the facade on screen
- Non-rectangular facades (gables, curves) and non-rectangular openings
- Cost estimates and unit prices
- Panel layout or cut optimization
- User accounts and saving projects to the cloud (sessions are saved locally only)
- Reveal surfaces around openings (jambs, sills, heads)
- Detecting overlapping openings
