# 3d-bin-packing-demo

```npm start```

This is a 3D bin packing heuristic implemented in JS. It will pack cuboids into a concave polyehdron with an average oocupancy of 70%.
It works in two modes: 1. Bin first (binFirst.js) and 2. Item first (backup.js). The bin first mode is supposed to be more efficient when packing, although it is slower and buggier. The item first approach is more stable and works fine when the items are more or less homogenous in dimension.
