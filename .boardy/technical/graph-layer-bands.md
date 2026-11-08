---
title: Graph layer bands
layer: technical
component: studio
kind: decision
links:
  - type: affects
    target: "[[studio]]"
---
The Studio graph draws one band per layer behind the nodes. Bands render inside React Flow's viewport portal in flow coordinates, so panning and zooming only change the viewport transform and never recompute a band. Bounds are recalculated only when the chart changes: a node moves, resizes, appears, or disappears. Only the layer name counter-scales with zoom, so it keeps its screen size.
