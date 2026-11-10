---
title: Brand
layer: prototypes
component: portal
kind: design
summary: The recorded primary color ramp and the two UI stacks; no typography or spacing system is written down.
links:
  - type: refines
    target: "[[portal]]"
  - type: relates_to
    target: "[[bo-views]]"
updated: 2026-11-10
---
The only recorded brand artifact is the primary color ramp in `.ai-material/colors.md`:

| Token | Hex |
| --- | --- |
| primary-50 | `#f6e8e9` |
| primary-100 | `#e2b6ba` |
| primary-200 | `#d59398` |
| primary-300 | `#c16269` |
| primary-400 | `#b5444c` |
| primary-500 | `#a3151f` |
| primary-600 | `#94131c` |
| primary-700 | `#740f16` |
| primary-800 | `#5a0c11` |
| primary-900 | `#44090d` |

The two front ends use different Mantine majors: the portal is on Mantine 8, the back office on Mantine 7. That is a real integration constraint, not a style choice.

There is no written typography scale, spacing system, or component library beyond Mantine. The logo and the redesign screenshots live under `.ai-material/`. Do not invent a design system from the ramp alone.
