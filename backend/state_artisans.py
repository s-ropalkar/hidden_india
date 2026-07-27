"""Two additional artisans per state — same regional crafts and artifact catalog as primary."""

# state -> [(name, bio), (name, bio)]
STATE_PEER_ARTISANS: dict[str, list[tuple[str, str]]] = {
    "Jammu & Kashmir": [
        ("Razia Bhat", "Senior pashmina weaver from Srinagar's old city."),
        ("Mohsin Dar", "Third-generation walnut carver and carpet maker."),
    ],
    "Himachal Pradesh": [
        ("Dev Sharma", "Kullu valley wool weaver on traditional pit looms."),
        ("Anita Negi", "Handloom rug specialist from Mandi district."),
    ],
    "Punjab": [
        ("Balwinder Singh", "Patiala phulkari embroiderer preserving floral motifs."),
        ("Simran Kaur", "Traditional Punjabi jutti maker from Ludhiana."),
    ],
    "Rajasthan": [
        ("Lakshmi Devi", "Jaipur bandhani artisan from the Amber Road quarter."),
        ("Vikram Meena", "Miniature painting framer and blue pottery apprentice."),
    ],
    "Delhi": [
        ("Imran Qureshi", "Old Delhi zardozi craftsman specializing in metal threadwork."),
        ("Sunita Verma", "Ceramic painter and textile embellisher from Shahjahanabad."),
    ],
    "Haryana": [
        ("Sunita Devi", "Panipat handloom rug weaver for export-quality textiles."),
        ("Rajesh Kumar", "Traditional clay potter from Rohtak district."),
    ],
    "Arunachal Pradesh": [
        ("Dorjee Tsering", "Monpa bamboo basket weaver from Tawang."),
        ("Meki Tashi", "Tribal mask carver and shawl weaver from Itanagar."),
    ],
    "Assam": [
        ("Pranab Gogoi", "Muga silk weaver from Sualkuchi silk village."),
        ("Rina Das", "Bamboo decor craftswoman from Guwahati."),
    ],
    "Manipur": [
        ("Thangjam Bino", "Imphal handloom weaver of traditional Manipuri patterns."),
        ("Ningthoujam Leima", "Ceramic potter and bamboo craft artisan."),
    ],
    "Meghalaya": [
        ("Baplang Khongwir", "Khasi cane basket weaver from Shillong."),
        ("Doris Khonglam", "Wool shawl weaver and wood decor carver."),
    ],
    "Mizoram": [
        ("Vanlalchhuanga", "Aizawl bamboo furniture craftsman."),
        ("Lalhriatpuii", "Handwoven textile and tribal wall art specialist."),
    ],
    "Nagaland": [
        ("Akum Konyak", "Konyak beadwork jeweler from Mon district."),
        ("Viboto Zhimomi", "Tribal shawl weaver and wooden sculptor."),
    ],
    "Tripura": [
        ("Bijoy Debbarma", "Agartala bamboo and cane furniture maker."),
        ("Swapna Reang", "Woven textile mat specialist from Udaipur, Tripura."),
    ],
    "West Bengal": [
        ("Ananya Ghosh", "Bolpur kantha stitch artisan from Santiniketan."),
        ("Tarun Pal", "Terracotta idol maker and Dokra metal caster."),
    ],
    "Odisha": [
        ("Pratima Moharana", "Raghurajpur pattachitra scroll painter."),
        ("Sudhir Behera", "Silver filigree jeweler from Cuttack."),
    ],
    "Bihar": [
        ("Ram Bachan Paswan", "Madhubani folk painter from Jitwarpur village."),
        ("Kamla Devi", "Sikki grass basket weaver from Madhubani district."),
    ],
    "Jharkhand": [
        ("Birsa Munda", "Santhal tribal painter from Ranchi region."),
        ("Chandra Hansda", "Bamboo decor and wooden mask craftsman."),
    ],
    "Kerala": [
        ("Radha Menon", "Alleppey coir mat weaver and coconut shell lamp maker."),
        ("Unni Krishnan", "Kathakali mask carver from Thrissur."),
    ],
    "Tamil Nadu": [
        ("Meenakshi Sundaram", "Thanjavur Tanjore painter from temple town."),
        ("Murugan Sthapati", "Bronze idol caster from Swamimalai."),
    ],
    "Karnataka": [
        ("Gopal Rao", "Mysore sandalwood carver from heritage workshop."),
        ("Shakuntala Bai", "Bidri metal inlay specialist from Bidar."),
    ],
    "Andhra Pradesh": [
        ("Lakshmi Devi Rao", "Srikalahasti kalamkari artist using natural dyes."),
        ("Krishnaiah", "Wooden toy maker from Kondapalli tradition."),
    ],
    "Telangana": [
        ("Srinivas Reddy", "Pochampally ikat weaver from Nalgonda."),
        ("Laxmi Goud", "Cheriyal scroll painter from Warangal region."),
    ],
    "Madhya Pradesh": [
        ("Jangarh Singh Shyam", "Gond tribal painter from Bhopal."),
        ("Ram Bai", "Chanderi silk weaver and Dhokra metal artisan."),
    ],
    "Chhattisgarh": [
        ("Ghanshyam Vishwakarma", "Bastar iron craft forger from Kondagaon."),
        ("Sushila Yadav", "Wooden decor carver and clay lamp maker."),
    ],
    "Gujarat": [
        ("Hansaben Rabari", "Kutch bandhani and mirror-work embroiderer."),
        ("Mahesh Patel", "Patola silk weaver from Patan heritage loom."),
    ],
    "Goa": [
        ("Antonio D'Souza", "Coastal shell lamp craftsman from Panjim."),
        ("Fatima Sheikh", "Goan ceramic plate painter and coconut decor maker."),
    ],
    "Maharashtra": [
        ("Ananya Mashe", "Warli painter from Palghar tribal community."),
        ("Rahul Kolhapure", "Paithani silk weaver and Kolhapuri chappal maker."),
    ],
    "Sikkim": [
        ("Karma Bhutia", "Gangtok thangka painter preserving Buddhist scroll art."),
        ("Pema Lhamu", "Handwoven carpet and bamboo craft artisan."),
    ],
    "Uttar Pradesh": [
        ("Ramesh Varanasi", "Banarasi brocade silk weaver from Varanasi ghats."),
        ("Noor Jahan", "Chikankari embroiderer from Lucknow."),
    ],
    "Uttarakhand": [
        ("Hemwati Devi", "Almora wool shawl weaver from Kumaon hills."),
        ("Ramesh Carver", "Wooden carving and ceramic lamp artisan from Nainital."),
    ],
}

ARTISANS_PER_STATE = 3  # 1 primary (catalog) + 2 peers
