# Facade Area Calculator

**Try it:** https://audreycl1009.github.io/facade-calculator/

A web calculator that turns facade dimensions, openings and material zones into net area per material, with waste included. It replaces the spreadsheet and hand calculations used for facade material takeoffs.

## What it does

- **Height-band material zones.** For example, stone from 0–4.2 m and aluminum panel from 4.2–15.6 m.
- **Openings deducted from the right zone.** Each opening is placed by its sill height, so a window that crosses a zone boundary is split between the two materials.
- **Waste factor per material.** The results show net area and order area (net × (1 + waste)).
- **Repeated facades.** A quantity field covers identical elevations.
- **Small-opening threshold.** Openings below a set area can be left undeducted.
- **Warnings.** The tool flags zone gaps or overlaps and openings that fall outside the facade.
- **Export.** Copy results straight into Excel, or download a CSV that includes every input so the numbers can be checked.

Inputs are saved in your browser only. Nothing is sent to a server.

## How it was built

| Step | Who |
| --- | --- |
| Problem, users, scope and decisions ([PRD.md](PRD.md)) | Audrey Chang Liao (product) |
| Implementation (`index.html`, `calc.js`) | Claude Code, working from the PRD |
| Test cases and hand calculations ([test-cases.md](test-cases.md)) | Audrey Chang Liao |
| Review and acceptance | Audrey Chang Liao, through pull requests |

## Evaluation

The PRD's accuracy target is **within 1% per material** against hand calculation on 5 test facades. The cases cover basic deductions, quantity, zone assignment, the small-opening threshold, and openings that cross zone boundaries.

Run the eval with Node:

```
node tests/run.js
```

Current result: **18/18 checks passed**.

## Known limitations (v1)

- Rectangular facades and openings only
- Opening types are limited to Window, Door and Louver
- No reveals (jambs, sills, heads)
- Overlapping openings are not detected, because openings have no horizontal position
- No import from Rhino, Revit, DWG or IFC
