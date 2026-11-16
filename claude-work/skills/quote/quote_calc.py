"""Ekena custom PVC quote calculator. Mirrors Ryan Shumaker's "Custom Quoting Tool.xlsx" (PVC Pricing 2.4.2022 model).
list/unit = (labor + material*(1+sum of % options)*(1+material upcharge)*(1+tooling) + extras) * annual multiplier
AD retail = list*(1-0.15), then quantity tier off retail (10+: 5%, 25+: 10%, 50+: 15%). Round to cents at each step."""
import json, sys
from decimal import Decimal, ROUND_HALF_UP
MATRIX = {  # category: (2022 base labor, material rate, basis)
 "Corbels":(16,.09,"vol"),"Brackets":(33,.07,"vol"),"Braces":(16,.07,"vol"),"Gingerbread Brackets":(20,.10,"vol"),
 "Outlookers":(33,.07,"vol"),"Gable Brackets":(230,.08,"vol"),"Gable Pediments":(50,.09,"vol"),"Rafter Tails":(26,.07,"vol"),
 "Running Trim":(13,.10,"vol"),"Dentil Trim":(13,.10,"vol"),"Pilasters":(33,.09,"vol"),"Pediments":(45,.08,"vol"),
 "Gable Vents":(26,.12,"area"),"PVC Medallions":(33,.09,"vol"),"Wall Panels":(10,.10,"vol"),
 "L 2-Piece Wall Panels":(7,.05,"vol"),"Flat Trim":(7,.08,"vol"),"Flat Arch Trim":(10,.10,"vol"),
 "Plinths and Rosettes":(4,.10,"vol"),"Custom Radius Rail":(50,.70,"LxD")}
OPTIONS = {"closed":.12,"solid":.20,"gable face >4-6":.04,"gable face >6-8":.07,"fluted or paneled":.08,"3 or 4 spoke":.07,
 "sunburst":.12,"functional vent":.10,"brick mold vent":.12,"bottom sill vent":.04,"outer edge detail":.10,"bullseye":.10}
MATERIAL = {"PVC":0,"Signature Urethane":.07,"Timberthane":.10}
TOOLING = .10
INCREASES = {2023:.05,2024:.07,2025:0,2026:.07}
NO_CONSTRUCTION = {"Braces"}  # braces are solid at base price
BLOCKED = {"Crossheads":"Ryan's sheet says do not use for crossheads yet. Send to Ryan."}
AD_START = .15; AD_TIERS = [(50,.15),(25,.10),(10,.05)]
def c(x): return Decimal(str(x)).quantize(Decimal("0.01"), ROUND_HALF_UP)
def mult(year):
    m=1.0
    for y in range(2023,year+1): m*=1+INCREASES.get(y,0)
    return m
def quote(category, w, h, d=None, qty=1, material="PVC", options=(), extra_2022=0, face=None, medallion_od=None, freight=0, year=2026):
    if category in BLOCKED: return {"error":BLOCKED[category]}
    if category not in MATRIX: return {"error":f"'{category}' is not in the custom matrix. Quote it as a catalog item or ask Ryan."}
    labor, rate, basis = MATRIX[category]; flags=[]
    opts=[o.lower() for o in options]
    if category in NO_CONSTRUCTION: opts=[o for o in opts if o not in("closed","solid")]
    if category=="Gable Brackets" and face:
        if face>8: return {"error":"Gable face over 8 in needs review by Ryan."}
        if face>6: opts.append("gable face >6-8")
        elif face>4: opts.append("gable face >4-6")
    for o in opts:
        if o not in OPTIONS: return {"error":f"Unknown option '{o}'"}
    if material not in MATERIAL: return {"error":f"Unknown material '{material}'"}
    size = w*h if basis=="area" else (w*d if basis=="LxD" else w*h*d)
    mat = size*rate*(1+sum(OPTIONS[o] for o in opts))*(1+MATERIAL[material])*(1+TOOLING)
    extras = extra_2022 + (1.5*medallion_od if medallion_od else 0)
    m = mult(year)
    lst = c((labor+mat+extras)*m)
    start = c(float(lst)*(1-AD_START))
    tier = next((p for q,p in AD_TIERS if qty>=q),0)
    ad = c(float(start)*(1-tier))
    if category=="Pediments": flags.append("Custom pediments usually need a design fee; suggest a standard trim first.")
    if category=="Running Trim": flags.append("Length is limited to repeat length x number of repeats.")
    return {"category":category,"material":material,"options":opts,"size":round(size,3),"list_unit":str(lst),
            "list_total":str(c(float(lst)*qty+freight)),"ad_start_unit":str(start),"ad_qty_discount":tier,
            "ad_unit":str(ad),"ad_total":str(c(float(ad)*qty+freight)),"qty":qty,"flags":flags}
if __name__=="__main__":
    print(json.dumps(quote(**json.loads(sys.argv[1])),indent=1))
