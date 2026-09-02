/**
 * Wards and CDAs for Surulere LGA, as supplied by the CDC General Secretary.
 * Ward order and CDA names are authoritative — don't reorder/rename without
 * checking against the source list again.
 *
 * Two things to flag if this list is ever updated:
 * - The source list had a few duplicate/skipped serial numbers (e.g. "12"
 *   used twice, "61" used twice) — those were transcription numbering slips,
 *   not duplicate CDAs. Serial numbers below are renumbered cleanly 1..80.
 * - Ward G3's source list trailed off at a blank "80." with no CDA name —
 *   that entry is omitted here since there's nothing to put in it.
 */

const RAW_CDAS_BY_WARD = {
  "Ward E": [
    "Obele Oniwala CDA",
    "Adeniji/Itire/Ishaga CDA",
    "Iseoluwa CDA",
    "Anuoluwapo CDA",
    "Itire Ladega CDA",
    "Obele Grand View CDA",
  ],
  "Ward E1": [
    "Ojuelegba CDA",
    "Timberline CDA",
    "Faaschimacos CDA",
    "Abfll CDA",
    "New Irewolede CDA",
    "Aduropo CDA",
  ],
  "Ward F1": [
    "Moboluwaduro CDA",
    "Mosafejo CDA",
    "Majahe CDA",
    "Empire CDA",
    "Oorelope CDA",
    "Ololade CDA",
    "Toluwani CDA",
    "Ifedapo CDA",
    "Famorl CDA",
  ],
  "Ward F2": [
    "Aralile CDA",
    "Alaka Estate CDA",
    "Tejuosho CDA",
  ],
  "Ward F3": [
    "Gbaja CDA",
    "Love Garden CDA",
    "Abebe CDA",
    "Akerele Extension CDA",
    "Ogunmola South CDA",
    "Ogunmola CDA",
    "Ifesowapo CDA",
    "Obele Odan CDA",
    "Aiyegbami CDA",
    "Kadiri Ishola CDA",
  ],
  "Ward G": [
    "Livingstone CDA",
    "Ayedun CDA",
    "Fefoobrad CDA",
    "Oda Isabo CDA",
    "BOE CDA",
    "Samabod CDA",
    "Aseasoma CDA",
    "Ajumose CDA",
    "Oluwalogbon CDA",
    "Owooniran CDA",
    "Moyosore CDA",
    "Irepo CDA",
    "Olukole CDA",
    "Adegoke CDA",
  ],
  "Ward G1": [
    "Bank Olemoh CDA",
    "Jaso CDA",
    "Ratama CDA",
    "Alhaji Masha CDA",
    "Idi Aba CDA",
    "Boluwatife CDA",
    "Isokan CDA",
    "Irepodun CDA",
    "Irewole CDA",
  ],
  "Ward G2": [
    "Small London CDA",
    "Ajowa CDA",
    "Shomade CDA",
    "Tafawa Balewa CDA",
    "New Adeniran Ogunsanya CDA",
    "Adebola South CDA",
    "Adebola Central CDA",
    "Adebola North CDA",
    "Razado CDA",
    "BLOY CDA",
    "Beam CDA",
    "Alaka LSDPC CDA",
    "Ihera Island CDA",
    "Agbo Omoluabi CDA",
  ],
  "Ward G3": [
    "Iponri Housing Estate CDA",
    "Temidire CDA",
    "Itesiwaju CDA",
    "Adara CDA",
    "Akinsemoyin CDA",
    "Games Village CDA",
    "Idita CDA",
    "Alaka Estate Extension CDA",
    "Jimoh Odutola CDA",
  ],
};

export const WARD_NAMES = Object.keys(RAW_CDAS_BY_WARD);

function wardCode(name) {
  return name.replace(/^Ward\s+/, ""); // "Ward E1" -> "E1"
}

function slug(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export const WARDS = WARD_NAMES.map((name, i) => ({
  id: `ward-${slug(wardCode(name))}`,
  name,
  code: wardCode(name),
  created_at: "2025-01-01",
  _seq: i,
}));

let serial = 0;
export const CDAS = WARDS.flatMap((ward) =>
  RAW_CDAS_BY_WARD[ward.name].map((cdaName) => {
    serial += 1;
    return {
      id: `cda-${slug(ward.code)}-${slug(cdaName)}`,
      name: cdaName,
      serial_number: serial,
      ward_id: ward.id,
      is_active: true,
      created_at: "2025-01-01",
    };
  })
);

export function getWard(wardId) {
  return WARDS.find((w) => w.id === wardId);
}

export function getCda(cdaId) {
  return CDAS.find((c) => c.id === cdaId);
}

export function getCdasForWard(wardId) {
  return CDAS.filter((c) => c.ward_id === wardId);
}
