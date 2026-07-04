// Maps each encyclopedia region key to the country/territory ids that
// highlight it on src/data/world-map.svg. Ids are ISO 3166-1 alpha-2 codes
// (matching the `id` attribute of each `<path class="country">` in the SVG),
// except for "MA-EH" (the Moroccan-administered part of Western Sahara,
// drawn as its own path in the source map) and "oceans" (the id of the
// background `<rect class="ocean-bg">`).
//
// Notes on special regions:
// - arctic: no dedicated Arctic Ocean shape exists in the source SVG, so
//   this points at Greenland (GL), the only landmass in the map that sits
//   within the Arctic Circle.
// - antarctica: the source SVG does not include an Antarctica landmass
//   (it is cropped south of roughly 60S, as is common for populated-world
//   country maps), so this is an empty array. Consumers should fall back
//   gracefully when a region has no shapes to highlight.
// - oceans: maps to the id of the ocean background rect ("oceans") rather
//   than a country, so it can still be styled/highlighted if needed.
export const REGION_COUNTRIES = {
    "north-america": ["US", "CA", "MX", "BM"],
    "central-america": [
        "AG", "AI", "AW", "BB", "BS", "BZ", "CR", "CU", "CW", "DM", "DO",
        "GD", "GP", "GT", "HN", "HT", "JM", "KN", "KY", "LC", "MQ", "MS",
        "NI", "PA", "PR", "SV", "SX", "TC", "TT", "VC", "VG", "VI",
    ],
    "south-america": [
        "AR", "BO", "BR", "CL", "CO", "EC", "FK", "GF", "GY", "PE", "PY",
        "SR", "UY", "VE",
    ],
    "north-africa": ["DZ", "EG", "EH", "LY", "MA", "MA-EH", "SD", "TN"],
    "sub-saharan-africa": [
        "BF", "BI", "BJ", "CD", "CF", "CG", "CI", "CM", "CV", "DJ", "ER",
        "ET", "GA", "GH", "GM", "GN", "GQ", "GW", "KE", "KM", "LR", "MG",
        "ML", "MR", "MU", "NE", "NG", "RE", "RW", "SC", "SL", "SN", "SO",
        "SS", "ST", "TD", "TG", "TZ", "UG", "YT",
    ],
    "southern-africa": [
        "AO", "BW", "LS", "MW", "MZ", "NA", "SZ", "ZA", "ZM", "ZW",
    ],
    "europe": [
        "AD", "AL", "AT", "BA", "BE", "BG", "BY", "CH", "CZ", "DE", "DK",
        "EE", "ES", "FI", "FO", "FR", "GB", "GR", "HR", "HU", "IE", "IS",
        "IT", "LI", "LT", "LU", "LV", "MC", "MD", "ME", "MK", "MT", "NL",
        "NO", "PL", "PT", "RO", "RS", "SE", "SI", "SK", "SM", "UA", "VA",
        "XK",
    ],
    "middle-east": [
        "AE", "AM", "AZ", "BH", "CY", "GE", "IL", "IQ", "IR", "JO", "KW",
        "LB", "OM", "PS", "QA", "SA", "SY", "TR", "YE",
    ],
    "central-asia": ["AF", "KG", "KZ", "TJ", "TM", "UZ"],
    "south-asia": ["BD", "BT", "IN", "LK", "MV", "NP", "PK"],
    "east-asia": ["CN", "HK", "JP", "KP", "KR", "MN", "TW"],
    "southeast-asia": [
        "BN", "ID", "KH", "LA", "MM", "MY", "PH", "SG", "TH", "TL", "VN",
    ],
    "siberia": ["RU"],
    "australia": ["AU", "NZ"],
    "oceania": ["FJ", "NC", "NR", "PF", "PG", "PN", "SB", "TO", "VU"],
    "arctic": ["GL"],
    "antarctica": [],
    "oceans": ["oceans"],
};
