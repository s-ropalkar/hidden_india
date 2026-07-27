"""
Hidden India Explorer — structured catalog for 28 states/UTs.
Each entry: region meta, 1 artisan, 3 artifacts, 2 workshops.
"""

import json
from pathlib import Path

_MAP_PATH = Path(__file__).resolve().parent / "catalog_image_map.json"
_CATALOG_MAP: dict | None = None


def _load_catalog_map() -> dict:
    global _CATALOG_MAP
    if _CATALOG_MAP is None:
        if _MAP_PATH.is_file():
            _CATALOG_MAP = json.loads(_MAP_PATH.read_text(encoding="utf-8"))
        else:
            _CATALOG_MAP = {"products": {}, "workshops": {}}
    return _CATALOG_MAP


# (lng, lat) approximate state centroids for GeoJSON
STATE_COORDS = {
    "Jammu & Kashmir": (74.79, 34.08),
    "Himachal Pradesh": (77.17, 31.10),
    "Punjab": (75.84, 30.90),
    "Rajasthan": (75.79, 26.91),
    "Delhi": (77.21, 28.61),
    "Haryana": (76.78, 29.06),
    "Arunachal Pradesh": (93.61, 27.08),
    "Assam": (91.75, 26.14),
    "Manipur": (93.94, 24.79),
    "Meghalaya": (91.88, 25.57),
    "Mizoram": (92.72, 23.73),
    "Nagaland": (94.16, 26.16),
    "Tripura": (91.29, 23.83),
    "West Bengal": (88.36, 22.57),
    "Odisha": (85.82, 20.26),
    "Bihar": (85.13, 25.59),
    "Jharkhand": (85.31, 23.61),
    "Kerala": (76.27, 10.85),
    "Tamil Nadu": (80.27, 13.08),
    "Karnataka": (77.59, 12.97),
    "Andhra Pradesh": (79.41, 15.91),
    "Telangana": (78.47, 17.38),
    "Madhya Pradesh": (77.41, 23.25),
    "Chhattisgarh": (81.63, 21.25),
    "Gujarat": (72.57, 23.02),
    "Goa": (73.83, 15.49),
    "Maharashtra": (75.71, 19.08),
    "Sikkim": (88.61, 27.33),
    "Uttar Pradesh": (80.95, 26.85),
    "Uttarakhand": (79.02, 30.07),
}

STATE_ZONE = {
    "Jammu & Kashmir": "North India",
    "Himachal Pradesh": "North India",
    "Punjab": "North India",
    "Rajasthan": "North India",
    "Delhi": "North India",
    "Haryana": "North India",
    "Uttar Pradesh": "North India",
    "Uttarakhand": "North India",
    "Arunachal Pradesh": "North East India",
    "Assam": "North East India",
    "Manipur": "North East India",
    "Meghalaya": "North East India",
    "Mizoram": "North East India",
    "Nagaland": "North East India",
    "Tripura": "North East India",
    "Sikkim": "North East India",
    "West Bengal": "East India",
    "Odisha": "East India",
    "Bihar": "East India",
    "Jharkhand": "East India",
    "Kerala": "South India",
    "Tamil Nadu": "South India",
    "Karnataka": "South India",
    "Andhra Pradesh": "South India",
    "Telangana": "South India",
    "Madhya Pradesh": "Central India",
    "Chhattisgarh": "Central India",
    "Gujarat": "West India",
    "Goa": "West India",
    "Maharashtra": "West India",
}

# state -> (highlight_craft, artisan_name, artisan_category, bio, artifacts[(name, category, price)], workshops[(title, category)])
INDIA_CATALOG = {
    "Jammu & Kashmir": (
        "Pashmina Weaving",
        "Gulzar Ahmed Khan",
        "Pashmina & Walnut Craft",
        "Master pashmina weaver from Srinagar preserving centuries-old Kashmiri loom traditions.",
        [
            ("Pashmina shawl", "Textiles", 8500),
            ("Walnut wood decor box", "Decor", 4200),
            ("Kashmiri carpet", "Textiles", 12000),
        ],
        [("Pashmina weaving basics", "Hands-on"), ("Wood carving decor craft", "Masterclass")],
    ),
    "Himachal Pradesh": (
        "Wool Weaving",
        "Priya Thakur",
        "Himalayan Textiles",
        "Handloom specialist from Kullu valley weaving wool shawls on traditional pit looms.",
        [
            ("Wool shawl", "Textiles", 3200),
            ("Handwoven rug", "Textiles", 5600),
            ("Wooden wall decor", "Decor", 2800),
        ],
        [("Wool weaving", "Hands-on"), ("Rug weaving", "Masterclass")],
    ),
    "Punjab": (
        "Phulkari Embroidery",
        "Harpreet Kaur",
        "Phulkari & Jutti Craft",
        "Award-winning phulkari artisan from Patiala reviving floral threadwork motifs.",
        [
            ("Phulkari dupatta", "Textiles", 4500),
            ("Punjabi jutti", "Decor", 2200),
            ("Handcrafted textile bag", "Textiles", 1800),
        ],
        [("Phulkari embroidery", "Hands-on"), ("Jutti making", "Masterclass")],
    ),
    "Rajasthan": (
        "Blue Pottery",
        "Master Kripal Singh",
        "Blue Pottery & Bandhani",
        "Fourth-generation blue pottery master from Jaipur's Amber Road heritage quarter.",
        [
            ("Blue pottery vase", "Ceramics", 3800),
            ("Bandhani textile", "Textiles", 4200),
            ("Miniature painting frame", "Decor", 6500),
        ],
        [("Blue pottery crafting", "Hands-on"), ("Bandhani dyeing", "Masterclass")],
    ),
    "Delhi": (
        "Zardozi Embroidery",
        "Naseem Begum",
        "Zardozi & Metal Craft",
        "Old Delhi zardozi artisan embellishing fabrics with gold and silver threadwork.",
        [
            ("Zardozi cushion cover", "Textiles", 5200),
            ("Metal wall decor", "Decor", 3400),
            ("Ceramic mug", "Ceramics", 1200),
        ],
        [("Zardozi embroidery", "Hands-on"), ("Ceramic painting", "Masterclass")],
    ),
    "Haryana": (
        "Rug Weaving",
        "Ramesh Yadav",
        "Handloom & Pottery",
        "Panipat rug weaver continuing the region's export-quality handloom legacy.",
        [
            ("Handwoven rug", "Textiles", 4800),
            ("Clay pottery", "Ceramics", 1500),
            ("Textile bag", "Textiles", 1600),
        ],
        [("Rug weaving", "Hands-on"), ("Pottery making", "Masterclass")],
    ),
    "Arunachal Pradesh": (
        "Bamboo Craft",
        "Tashi Lama",
        "Tribal Bamboo & Wood",
        "Monpa artisan from Tawang crafting bamboo baskets and tribal wooden masks.",
        [
            ("Bamboo basket", "Decor", 1400),
            ("Tribal shawl", "Textiles", 2800),
            ("Wooden mask", "Decor", 3600),
        ],
        [("Bamboo weaving", "Hands-on"), ("Wood carving", "Masterclass")],
    ),
    "Assam": (
        "Muga Silk Weaving",
        "Anjali Baruah",
        "Assam Silk & Bamboo",
        "Muga silk weaver from Guwahati working with golden Assamese silk yarns.",
        [
            ("Muga silk fabric", "Textiles", 7200),
            ("Bamboo decor item", "Decor", 1800),
            ("Handwoven scarf", "Textiles", 2400),
        ],
        [("Silk weaving", "Hands-on"), ("Bamboo craft", "Masterclass")],
    ),
    "Manipur": (
        "Handloom Weaving",
        "Linthoi Devi",
        "Manipur Handloom",
        "Imphal handloom weaver preserving Manipuri textile patterns and ceramic traditions.",
        [
            ("Handloom textile", "Textiles", 3200),
            ("Bamboo decor item", "Decor", 1600),
            ("Ceramic pot", "Ceramics", 2200),
        ],
        [("Handloom weaving", "Hands-on"), ("Ceramic craft", "Masterclass")],
    ),
    "Meghalaya": (
        "Cane & Bamboo",
        "Kong Ibahunlang",
        "Khasi Cane Craft",
        "Khasi cane weaver from Shillong crafting baskets and wool shawls.",
        [
            ("Cane basket", "Decor", 1500),
            ("Wool shawl", "Textiles", 2900),
            ("Wooden decor item", "Decor", 2600),
        ],
        [("Cane weaving", "Hands-on"), ("Wood carving", "Masterclass")],
    ),
    "Mizoram": (
        "Bamboo Furniture",
        "Lalruatkima",
        "Mizo Bamboo Craft",
        "Aizawl bamboo craftsman creating furniture decor and tribal wall art.",
        [
            ("Bamboo furniture decor", "Decor", 4200),
            ("Handwoven textile", "Textiles", 2800),
            ("Tribal wall art", "Decor", 3400),
        ],
        [("Bamboo crafting", "Hands-on"), ("Textile weaving", "Masterclass")],
    ),
    "Nagaland": (
        "Naga Beadwork",
        "Neiphiu Konyak",
        "Naga Tribal Arts",
        "Konyak tribe artisan specializing in beaded jewelry and wooden sculptures.",
        [
            ("Beaded jewelry", "Decor", 3800),
            ("Tribal shawl", "Textiles", 4500),
            ("Wooden sculpture", "Decor", 5200),
        ],
        [("Jewelry making", "Hands-on"), ("Wood carving", "Masterclass")],
    ),
    "Tripura": (
        "Bamboo & Cane",
        "Bimal Debbarma",
        "Tripura Bamboo Craft",
        "Agartala bamboo artisan weaving cane furniture and textile mats.",
        [
            ("Bamboo craft item", "Decor", 1800),
            ("Cane furniture", "Decor", 6800),
            ("Woven textile mat", "Textiles", 1200),
        ],
        [("Bamboo weaving", "Hands-on"), ("Cane furniture craft", "Masterclass")],
    ),
    "West Bengal": (
        "Kantha Embroidery",
        "Mira Sen",
        "Kantha & Terracotta",
        "Bolpur kantha artisan stitching narrative textiles and terracotta forms.",
        [
            ("Kantha stitched textile", "Textiles", 3800),
            ("Terracotta idol", "Ceramics", 2400),
            ("Dokra metal figurine", "Decor", 4600),
        ],
        [("Kantha embroidery", "Hands-on"), ("Terracotta molding", "Masterclass")],
    ),
    "Odisha": (
        "Pattachitra Painting",
        "Subash Moharana",
        "Pattachitra & Filigree",
        "Raghurajpur pattachitra painter and silver filigree craftsman.",
        [
            ("Pattachitra scroll", "Decor", 5800),
            ("Silver filigree jewelry", "Decor", 7200),
            ("Applique wall hanging", "Textiles", 3400),
        ],
        [("Scroll painting", "Hands-on"), ("Filigree jewelry making", "Masterclass")],
    ),
    "Bihar": (
        "Madhubani Art",
        "Sita Devi",
        "Madhubani & Sikki Grass",
        "Madhubani folk artist painting mythological narratives on hand-made paper.",
        [
            ("Madhubani painting", "Decor", 4200),
            ("Sikki grass basket", "Decor", 1800),
            ("Clay pottery", "Ceramics", 1400),
        ],
        [("Madhubani painting", "Hands-on"), ("Basket weaving", "Masterclass")],
    ),
    "Jharkhand": (
        "Tribal Painting",
        "Soma Munda",
        "Jharkhand Tribal Arts",
        "Santhal tribal painter and bamboo craftsman from Ranchi region.",
        [
            ("Tribal painting", "Decor", 3200),
            ("Bamboo decor item", "Decor", 1600),
            ("Wooden mask", "Decor", 2800),
        ],
        [("Tribal painting", "Hands-on"), ("Bamboo craft", "Masterclass")],
    ),
    "Kerala": (
        "Coir & Coconut Craft",
        "Lakshmi Nair",
        "Kerala Coconut Craft",
        "Alleppey coir weaver crafting coconut shell lamps and Kathakali masks.",
        [
            ("Coconut shell lamp", "Decor", 2600),
            ("Coir mat", "Textiles", 1400),
            ("Kathakali mask", "Decor", 3800),
        ],
        [("Coconut lamp making", "Hands-on"), ("Coir weaving", "Masterclass")],
    ),
    "Tamil Nadu": (
        "Tanjore Painting",
        "Ravi Chettiar",
        "Tanjore & Bronze",
        "Thanjavur Tanjore painter and bronze idol caster from temple town.",
        [
            ("Tanjore painting", "Decor", 8500),
            ("Bronze idol", "Decor", 15000),
            ("Silk textile", "Textiles", 6200),
        ],
        [("Tanjore painting", "Hands-on"), ("Bronze casting", "Masterclass")],
    ),
    "Karnataka": (
        "Sandalwood Carving",
        "Madhavan Unni",
        "Mysore Sandalwood",
        "Mysore sandalwood carver and Bidri metal inlay specialist.",
        [
            ("Sandalwood statue", "Decor", 9800),
            ("Mysore silk", "Textiles", 5400),
            ("Bidri metal bowl", "Decor", 7200),
        ],
        [("Sandalwood carving", "Hands-on"), ("Metal inlay craft", "Masterclass")],
    ),
    "Andhra Pradesh": (
        "Kalamkari Art",
        "Venkat Rao",
        "Kalamkari & Toys",
        "Srikalahasti kalamkari artist painting natural-dye wall art on cotton.",
        [
            ("Kalamkari wall art", "Decor", 4800),
            ("Wooden toy", "Decor", 2200),
            ("Handloom fabric", "Textiles", 3200),
        ],
        [("Kalamkari painting", "Hands-on"), ("Wooden toy making", "Masterclass")],
    ),
    "Telangana": (
        "Ikat Weaving",
        "Padma Reddy",
        "Telangana Ikat & Cheriyal",
        "Pochampally ikat weaver and Cheriyal scroll painter from Hyderabad region.",
        [
            ("Ikat textile", "Textiles", 4200),
            ("Cheriyal scroll", "Decor", 5600),
            ("Handwoven fabric", "Textiles", 2800),
        ],
        [("Ikat weaving", "Hands-on"), ("Scroll painting", "Masterclass")],
    ),
    "Madhya Pradesh": (
        "Gond Painting",
        "Bhajju Shyam",
        "Gond & Dhokra",
        "Gond tribal painter from Bhopal depicting forest spirits and nature motifs.",
        [
            ("Gond painting", "Decor", 5200),
            ("Chanderi silk", "Textiles", 6800),
            ("Dhokra metal figurine", "Decor", 4400),
        ],
        [("Gond painting", "Hands-on"), ("Metal casting", "Masterclass")],
    ),
    "Chhattisgarh": (
        "Bastar Iron Craft",
        "Suresh Yadav",
        "Bastar Tribal Metal",
        "Bastar iron craftsman forging tribal figurines and clay lamps.",
        [
            ("Bastar iron craft", "Decor", 3800),
            ("Wooden decor item", "Decor", 2600),
            ("Clay lamp", "Ceramics", 1800),
        ],
        [("Iron craft forging", "Hands-on"), ("Wood carving", "Masterclass")],
    ),
    "Gujarat": (
        "Bandhani & Patola",
        "Pabiben Rabari",
        "Kutch Embroidery",
        "Kutch Rabari artisan known for bandhani textiles and mirror-work decor.",
        [
            ("Bandhani textile", "Textiles", 3600),
            ("Patola silk", "Textiles", 12000),
            ("Mirror work decor", "Decor", 2800),
        ],
        [("Bandhani dyeing", "Hands-on"), ("Mirror embroidery", "Masterclass")],
    ),
    "Goa": (
        "Shell Craft",
        "Maria Fernandes",
        "Goan Shell & Ceramic",
        "Goan shell craft artisan creating lamps and coconut decor by the coast.",
        [
            ("Shell lamp", "Decor", 3200),
            ("Coconut decor item", "Decor", 1800),
            ("Ceramic plate", "Ceramics", 1600),
        ],
        [("Shell craft", "Hands-on"), ("Ceramic painting", "Masterclass")],
    ),
    "Maharashtra": (
        "Warli Art",
        "Jivya Soma Mashe",
        "Warli & Paithani",
        "Pioneer of modern Warli movement from Palghar tribal heartland.",
        [
            ("Warli painting", "Decor", 4500),
            ("Paithani silk", "Textiles", 18000),
            ("Kolhapuri chappal", "Decor", 2400),
        ],
        [("Warli painting", "Hands-on"), ("Leather craft", "Masterclass")],
    ),
    "Sikkim": (
        "Thangka Painting",
        "Pema Dorjee",
        "Sikkim Thangka & Carpet",
        "Gangtok thangka painter preserving Buddhist scroll art and carpet weaving.",
        [
            ("Thangka painting", "Decor", 9200),
            ("Bamboo craft", "Decor", 1800),
            ("Handwoven carpet", "Textiles", 5600),
        ],
        [("Thangka painting", "Hands-on"), ("Carpet weaving", "Masterclass")],
    ),
    "Uttar Pradesh": (
        "Banarasi Weaving",
        "Mayuri Vayeda",
        "Banarasi Silk & Chikankari",
        "Varanasi master weaver of brocade silk and chikankari embroidery.",
        [
            ("Banarasi silk", "Textiles", 8500),
            ("Brass decor", "Decor", 3200),
            ("Chikankari fabric", "Textiles", 4200),
        ],
        [("Silk weaving", "Hands-on"), ("Embroidery craft", "Masterclass")],
    ),
    "Uttarakhand": (
        "Wool Weaving",
        "Geeta Rawat",
        "Himalayan Wool Craft",
        "Almora wool weaver crafting shawls and wooden carvings in the hills.",
        [
            ("Wool shawl", "Textiles", 3400),
            ("Wooden carving", "Decor", 3800),
            ("Ceramic lamp", "Ceramics", 2200),
        ],
        [("Wool weaving", "Hands-on"), ("Wood carving", "Masterclass")],
    ),
}

IMAGE_BY_CATEGORY = {
    "Textiles": "https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?w=600",
    "Ceramics": "https://images.unsplash.com/photo-1537123546496-d25f4e71d4a2?w=600",
    "Decor": "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=600",
}

TEXTILE_IMAGES = [
    "https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?w=600",
    "https://images.unsplash.com/photo-1586105251261-72a756659a11?w=600",
    "https://images.unsplash.com/photo-1617137968427-85924c800a41?w=600",
]
CERAMIC_IMAGES = [
    "https://images.unsplash.com/photo-1537123546496-d25f4e71d4a2?w=600",
    "https://images.unsplash.com/photo-1578746351920-4294967765?w=600",
    "https://images.unsplash.com/photo-1610701596007-1150276599c0?w=600",
]
DECOR_IMAGES = [
    "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=600",
    "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600",
    "https://images.unsplash.com/photo-1605218425087-1a13f034276b?w=600",
]
WORKSHOP_IMAGES = [
    "https://images.unsplash.com/photo-1452860606248-08befc0ff870?w=800",
    "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800",
    "https://images.unsplash.com/photo-1509090927625-8ea79b4e9c7f?w=800",
]
ARTISAN_AVATARS = [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400",
]

WORKSHOP_IMAGE = WORKSHOP_IMAGES[0]
ARTISAN_AVATAR = ARTISAN_AVATARS[0]

# Craft-specific artisan portraits (local + Unsplash)
CRAFT_ARTISAN_IMAGES: dict[str, str] = {
    "madhubani": "/images/artisan-madhubani.jpg",
    "mithila": "/images/artisan-madhubani.jpg",
    "folk": "/images/artisan-madhubani.jpg",
    "pattachitra": "https://images.unsplash.com/photo-1605218425087-1a13f034276b?w=400",
    "wood": "/images/artisan-wood-carving.jpg",
    "walnut": "/images/artisan-wood-carving.jpg",
    "carving": "/images/artisan-wood-carving.jpg",
    "kashmir": "/images/artisan-wood-carving.jpg",
    "warli": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
    "pottery": "https://images.unsplash.com/photo-1610701596007-1150276599c0?w=400",
    "blue pottery": "https://images.unsplash.com/photo-1578746351920-4294967765?w=400",
    "textile": "https://images.unsplash.com/photo-1617137968427-85924c800a41?w=400",
    "weav": "https://images.unsplash.com/photo-1586105251261-72a756659a11?w=400",
    "silk": "https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?w=400",
    "terracotta": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
}


def pick_artisan_avatar(name: str, craft: str = "") -> str:
    combined = f"{name} {craft}".lower()
    for key, url in CRAFT_ARTISAN_IMAGES.items():
        if key in combined:
            return url
    key = sum(ord(c) for c in name)
    return ARTISAN_AVATARS[key % len(ARTISAN_AVATARS)]


def pick_product_image(category: str, name: str, index: int = 0, state: str = "") -> str:
    if state:
        mapped = _load_catalog_map().get("products", {}).get(state, {}).get(name)
        if mapped:
            return mapped
    pool = {"Textiles": TEXTILE_IMAGES, "Ceramics": CERAMIC_IMAGES}.get(category, DECOR_IMAGES)
    key = sum(ord(c) for c in name) + index
    return pool[key % len(pool)]


def pick_workshop_image(title: str, index: int = 0, state: str = "") -> str:
    if state:
        mapped = _load_catalog_map().get("workshops", {}).get(state, {}).get(title)
        if mapped:
            return mapped
    key = sum(ord(c) for c in title) + index
    return WORKSHOP_IMAGES[key % len(WORKSHOP_IMAGES)]
