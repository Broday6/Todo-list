# /quote tests (re-run Nov 16, 2026 in the cloud: all pass)

Run from this folder: `python3 quote_calc.py '<json>'`. Expected Ekena list/unit and AD retail/unit for 2026:

| # | Request | JSON | List/unit | AD/unit |
|---|---|---|---|---|
| 1a | 8 Timberthane corbels 6x10x12, closed | {"category":"Corbels","w":6,"h":10,"d":12,"qty":8,"material":"Timberthane","options":["closed"]} | 124.80 | 106.08 |
| 1b | 30 PVC rafter tails 4x6x24 (25+ tier) | {"category":"Rafter Tails","w":4,"h":6,"d":24,"qty":30} | 84.57 | 64.69 |
| 2 | Plain text: 2 fluted PVC pilasters 8x60x2 | {"category":"Pilasters","w":8,"h":60,"d":2,"qty":2,"options":["fluted or paneled"]} | 163.06 | 138.60 |
| 3 | 2 gable vents 18x30, functional + brick mold | {"category":"Gable Vents","w":18,"h":30,"qty":2,"options":["functional vent","brick mold vent"]} | 135.80 | 115.43 |
| 4 | Crosshead | {"category":"Crossheads","w":1,"h":1,"d":1} | error: Send to Ryan | |

The calculator also matched all 4 worked examples in Ryan Shumaker's Custom Quoting Tool.xlsx to the cent (Nov 10 run).
