export type Location = {
  district: string;
  areas: string[];
};

export const locations: Location[] = [
  {
    district: "Bagerhat",
    areas: ["Bagerhat Sadar", "Chitalmari", "Fakirhat", "Kachua", "Mollahat", "Mongla", "Morrelganj", "Rampal", "Sarankhola"]
  },
  {
    district: "Bandarban",
    areas: ["Alikadam", "Bandarban Sadar", "Lama", "Naikhongchhari", "Rowangchhari", "Ruma", "Thanchi"]
  },
  {
    district: "Barguna",
    areas: ["Amtali", "Bamna", "Barguna Sadar", "Betagi", "Pathorghata", "Taltali"]
  },
  {
    district: "Barisal",
    areas: ["Agailjhara", "Babuganj", "Bakerganj", "Banaripara", "Barisal Sadar", "Gournadi", "Hizla", "Mehendiganj", "Muladi", "Wazirpur"]
  },
  {
    district: "Bhola",
    areas: ["Bhola Sadar", "Borhan Sddin", "Charfesson", "Doulatkhan", "Lalmohan", "Monpura", "Tazumuddin"]
  },
  {
    district: "Bogra",
    areas: ["Adamdighi", "Bogra Sadar", "Dhunot", "Dupchanchia", "Gabtali", "Kahaloo", "Nondigram", "Shajahanpur", "Shariakandi", "Sherpur", "Shibganj", "Sonatala"]
  },
  {
    district: "Brahmanbaria",
    areas: ["Akhaura", "Ashuganj", "Bancharampur", "Bijoynagar", "Brahmanbaria Sadar", "Kasba", "Nabinagar", "Nasirnagar", "Sarail"]
  },
  {
    district: "Chandpur",
    areas: ["Chandpur Sadar", "Faridgonj", "Haimchar", "Hajiganj", "Kachua", "Matlab North", "Matlab South", "Shahrasti"]
  },
  {
    district: "Chapainawabganj",
    areas: ["Bholahat", "Chapainawabganj Sadar", "Gomostapur", "Nachol", "Shibganj"]
  },
  {
    district: "Chattogram",
    areas: ["Anwara", "Banshkhali", "Boalkhali", "Chandanaish", "Fatikchhari", "Hathazari", "Karmafuli", "Lohagara", "Mirsharai", "Patiya", "Rangunia", "Raozan", "Sandwip", "Satkania", "Sitakunda"]
  },
  {
    district: "Chuadanga",
    areas: ["Alamdanga", "Chuadanga Sadar", "Damurhuda", "Jibannagar"]
  },
  {
    district: "Comilla",
    areas: ["Barura", "Brahmanpara", "Burichang", "Chandina", "Chauddagram", "Comilla Sadar", "Daudkandi", "Debidwar", "Homna", "Laksam", "Lalmai", "Meghna", "Monohargonj", "Muradnagar", "Nangalkot", "Sadarsouth", "Titas"]
  },
  {
    district: "Coxsbazar",
    areas: ["Chakaria", "Coxsbazar Sadar", "Kutubdia", "Moheshkhali", "Pekua", "Ramu", "Teknaf", "Ukhiya"]
  },
  {
    district: "Dhaka",
    areas: ["60 feet", "Abdullahpur Uttara", "Abul Hotel", "Adabor", "Adarsha Nagar - Kutubpur", "Aftab Nagar", "Aganagar", "Agargaon", "Agargaon-Taltola", "Akran Bazar", "Amin Bazar", "Amritopur", "Amtola", "Arambag", "Ashkona", "Ashulia Bazar", "Azimpur (Lalbag)", "Badda", "Baily Road", "Baipail", "Bakshi Bazar", "Bakurta", "Balughat", "Banani", "Banani DOHS", "Banasree (Block A-G)", "Banasree (Block H-J)", "Bangla bazar", "Banglamotor", "Bangshal", "Bank Colony", "Baridhara DOHS", "Baridhara Diplomatic Zone", "Baridhara J Block", "Baroipara", "Barobaria", "Bashabo", "Bashundhara R/A", "Bawnia", "Begunbari", "Benaroshi Polli", "Benaroshi polli Blok A", "Benaroshi polli Blok B,C", "Benaroshi polli Blok D", "Beraid", "Bibir Bagicha", "Block A, C", "Block A,B", "Block B, D", "Block D,E ", "Block-E", "Bolivodro", "Boro Moghbazar", "Borobag", "Bosila", "Brahmonkitta", "BUET", "Bulk Merchant", "Central Road", "Chakraborty", "Charabag", "ChawkBazar (Dhaka)", "Chunkutia", "Dakshinkhan", "Darussalam", "Demra", "Deogao", "Dhaka Medical", "Dhaka Uddyan", "Dhaka University", "Dhaka cantonment", "Dhamrai", "Dhanmondi", "Dholaipar", "Dholpur", "Dhonia", "Dhulivita", "Diabari", "DIT Road", "Document-Central", "Dohar", "ECB", "Elephant Road", "EPZ", "Equria Thana", "Eskaton", "Estern Housing", "Extension Pallabi", "Faidabad", "Faridabad", "Farmgate", "Fulbariya", "Gabtoli", "Gandaria", "Ganda", "GhatarChar", "Giridhara Abashik", "Gobindopur", "Golam Bazar", "Gopibagh", "Goran", "Gulbagh", "Gulishan 1", "Gulishan 2", "Hasnabad", "Hatirpool", "Hazaribagh", "Hemayetpur", "Huzurbari Gate", "Ibrahimpur", "Islambag", "Islampur", "Islampur (Dhamrai)", "Jahangirnagar", "Jamgora", "Jhauchor", "Jigatola", "Joardar Lane", "Jonopoth More Bus Stop", "Journalist Residential Area", "Jurain", "Kadamtoli", "Kalabagan", "Kalachadpur", "Kalampur", "Kalindi", "Kallyanpur", "Kamalapur", "Kamranggirchar", "Karatitola", "Katashur", "Katghora", "Kathalbagan", "Kawalipara", "Kawla", "Kawran Bazar", "Kazipara", "Keraniganj", "Keraniganj Abdullahpur", "Keraniganj Atibazar", "Keraniganj BoshundhoraRiverview", "Keraniganj Kaliganj", "Keraniganj Model Thana", "Keraniganj Rajendrapur", "Khejurbag", "Khilgaon", "Khilkhet", "Kholamura", "Khorarchar", "Kochukhet", "Kodomtoli.", "Kolatia", "Kolma", "Konakhola", "Konapara", "Kotwali (Dhaka)", "Kuril", "Kutubkhali", "Lakshmibazar", "Lalbag", "Lalkuthi", "Lalmatia", "LaxmiBazar", "Love Road", "Madani nagar", "Malibagh Baganbari", "Malibagh College Road", "Malibagh Lane", "Malibagh Pabna Colony", "Maloncho Road", "Manda", "Manik Nagar", "Manikdi", "Masjid Market", "Matikata", "Matuail", "Mazar road", "Middle Rosulbag", "Mirhazirbag", "Mirpur 1", "Mirpur 1 Market Area", "Mirpur 10", "Mirpur 11", "Mirpur 11 Lalmatia", "Mirpur 12", "Mirpur 12 Block A,C", "Mirpur 12 Block Ta", "Mirpur 12 Block-Dhak, B", "Mirpur 13", "Mirpur 14", "Mirpur 2", "Mirpur 6", "Mirpur 6 (Block C)", "Mirpur 7", "Mirpur Cantonment", "Mirpur Cantonment (Ave new 3 )", "Mirpur DOHS", "Mirpur DOHS (Ave New 9)", "Mirpur DOHS (Ave new 2)", "Mirpur-2", "Mirpur-Rupnagar", "Modhubag", "Mogbazar", "Mohakhali", "Mohakhali DOHS", "Mohammadpur", "Monipur", "Monumia Market", "Motijheel", "Mugda", "Nadda", "Nakhal para", "Nakhalpara", "Narinda", "Nawabganj (Dhaka)", "Nawabganj (Dohar)", "Nawabpur", "Naya Bazar", "Nayanagar", "Nazim Uddin Road", "Nazira Bazar", "New Elephant Road", "New Market", "New Town R/A", "Niketan", "Nikunja", "Nikunja 2", "Nilkhet", "Nimaikishori", "Nischintapur", "Nobinagar", "Nobodoy", "Norosinhopur", "North Badda", "North Sanarpar", "Notun Bazar", "Noyarhat", "Noyatola road", "Nurerchala", "Paikpara", "Pakiza", "Pallabi", "Pallabi Residential area", "Palli Bidyut", "Paltan", "Panthapath", "Paterbag", "Pathao Central FTL", "Pathao Central LTL", "Pirerbagh", "Polashbari", "Polashpur", "Radio Colony", "Rajashon", "Rampura", "Rayer Bazar", "Rayerbag", "Razarbag Police line", "Rohitpur", "Rupnagar", "Sadarghat (Dhaka)", "Saddam Market", "Sarkar Market", "Savar", "Savar Bazar", "Savar Thana Road", "Savar-Nabinagar", "Saydabad", "Sayedabad Bus Terminal", "Senpara", "Senpara Parbata", "Shagufta Block-D", "Shah Ali Bag", "Shahbag", "Shahid Faruk Road", "Shahid Nagar", "Shahjadpur", "Shajahanpur", "Shankar", "Shantinagar", "Shegunbagicha", "Sheikh Rasel Park", "Sheikhdi", "Sher-E-Bangla National Cricket Stadium", "Sher-e Bangla Nagar", "Shewrapara", "Shiddeshwari", "Shimrail", "Shimultola", "Shimultola Jamgora", "Shishu Mela", "Shobujbag", "Shonalibagh", "Shukrabad", "Shuvadda", "Shyamoli", "Singair Road", "Solmaid", "SONY Cinema Hall", "South Badda", "South Banasree", "South kafrul", "Sreepur-Kashimpur", "Sutrapur", "Technical", "Tejgaon", "Tejkunipara", "Tenari Savar", "Tolarbag", "Turag", "Unique Bus Stand", "UttarKhan", "Uttara Sector 1", "Uttara Sector 10", "Uttara Sector 11", "Uttara Sector 12", "Uttara Sector 13", "Uttara Sector 14", "Uttara Sector 15", "Uttara Sector 16", "Uttara Sector 17", "Uttara Sector 18", "Uttara Sector 3", "Uttara Sector 4", "Uttara Sector 5", "Uttara Sector 7", "Uttara Sector 8", "Uttara Sector 9", "Uttara sector 6", "Vadail", "Vasan Tek", "Vootergoli", "Wari", "West Agargaon", "West Kafrul", "Zazira", "Zinzira", "Zirabo", "Zirani", "Zoo Road", "azampur (Uttara)", "banani hq", "house building", "kalachadpur", "london market", "mukti nagar", "narayanpur - keshobpur", "new paltan azimpur", "rajlakkhi market", "ranavola", "shampur"]
  },
  {
    district: "Dinajpur",
    areas: ["Birampur", "Birganj", "Birol", "Bochaganj", "Chirirbandar", "Dinajpur Sadar", "Fulbari", "Ghoraghat", "Hakimpur", "Kaharol", "Khansama", "Nawabganj", "Parbatipur"]
  },
  {
    district: "Faridpur",
    areas: ["Alfadanga", "Bhanga", "Boalmari", "Charbhadrasan", "Faridpur Sadar", "Madhukhali", "Nagarkanda", "Sadarpur", "Saltha"]
  },
  {
    district: "Feni",
    areas: ["Chhagalnaiya", "Daganbhuiyan", "Feni Sadar", "Fulgazi", "Parshuram", "Sonagazi"]
  },
  {
    district: "Gaibandha",
    areas: ["Gaibandha Sadar", "Gobindaganj", "Palashbari", "Phulchari", "Sadullapur", "Saghata", "Sundarganj"]
  },
  {
    district: "Gazipur",
    areas: ["Gazipur Sadar", "Kaliganj", "Kaliakair", "Kapasia", "Sreepur"]
  },
  {
    district: "Gopalganj",
    areas: ["Gopalganj Sadar", "Kashiani", "Kotalipara", "Muksudpur", "Tungipara"]
  },
  {
    district: "Habiganj",
    areas: ["Ajmiriganj", "Bahubal", "Baniachong", "Chunarughat", "Habiganj Sadar", "Lakhai", "Madhabpur", "Nabiganj"]
  },
  {
    district: "Jamalpur",
    areas: ["Bokshiganj", "Dewangonj", "Islampur", "Jamalpur Sadar", "Madarganj", "Melandah", "Sarishabari"]
  },
  {
    district: "Jashore",
    areas: ["Abhaynagar", "Bagherpara", "Chougachha", "Jhikargacha", "Jessore Sadar", "Keshabpur", "Manirampur", "Sharsha"]
  },
  {
    district: "Jhalakathi",
    areas: ["Jhalakathi Sadar", "Kathalia", "Nalchity", "Rajapur"]
  },
  {
    district: "Jhenaidah",
    areas: ["Harinakundu", "Jhenaidah Sadar", "Kaliganj", "Kotchandpur", "Moheshpur", "Shailkupa"]
  },
  {
    district: "Joypurhat",
    areas: ["Akkelpur", "Joypurhat Sadar", "Kalai", "Khetlal", "Panchbibi"]
  },
  {
    district: "Khagrachhari",
    areas: ["Dighinala", "Guimara", "Khagrachhari Sadar", "Laxmichhari", "Mohalchari", "Manikchari", "Panchari", "Ramgarh", "Matiranga"]
  },
  {
    district: "Khulna",
    areas: ["Botiaghata", "Dakop", "Digholia", "Dumuria", "Fultola", "Koyra", "Paikgasa", "Rupsha", "Terokhada"]
  },
  {
    district: "Kishoreganj",
    areas: ["Austagram", "Bajitpur", "Bhairab", "Hossainpur", "Itna", "Karimgonj", "Katiadi", "Kishoreganj Sadar", "Kuliarchar", "Mithamoin", "Nikli", "Pakundia", "Tarail"]
  },
  {
    district: "Kurigram",
    areas: ["Bhurungamari", "Charrajibpur", "Chilmari", "Kurigram Sadar", "Nageshwari", "Phulbari", "Rajarhat", "Rowmari", "Ulipur"]
  },
  {
    district: "Kushtia",
    areas: ["Bheramara", "Daulatpur", "Khoksa", "Kumarkhali", "Kushtia Sadar", "Mirpur"]
  },
  {
    district: "Lakshmipur",
    areas: ["Kamalnagar", "Lakshmipur Sadar", "Raipur", "Ramganj", "Ramgati"]
  },
  {
    district: "Lalmonirhat",
    areas: ["Aditmari", "Hatibandha", "Kaliganj", "Lalmonirhat Sadar", "Patgram"]
  },
  {
    district: "Madaripur",
    areas: ["Kalkini", "Madaripur Sadar", "Rajoir", "Shibchar"]
  },
  {
    district: "Magura",
    areas: ["Magura Sadar", "Mohammadpur", "Shalikha", "Sreepur"]
  },
  {
    district: "Manikganj",
    areas: ["Doulatpur", "Gior", "Harirampur", "Manikganj Sadar", "Saturia", "Shibaloy", "Singiar"]
  },
  {
    district: "Meherpur",
    areas: ["Gangni", "Meherpur Sadar", "Mujibnagar"]
  },
  {
    district: "Moulvibazar",
    areas: ["Barlekha", "Juri", "Kamolganj", "Kulaura", "Moulvibazar Sadar", "Rajnagar", "Sreemangal"]
  },
  {
    district: "Munshiganj",
    areas: ["Gajaria", "Louhajanj", "Munshiganj Sadar", "Sirajdikhan", "Sreenagar", "Tongibari"]
  },
  {
    district: "Mymensingh",
    areas: ["Bhaluka", "Dhobaura", "Fulbaria", "Gafargaon", "Gouripur", "Haluaghat", "Iswarganj", "Muktagacha", "Mymensingh Sadar", "Nandail", "Phulpur", "Tarakanda", "Trishal"]
  },
  {
    district: "Naogaon",
    areas: ["Atrai", "Badalgachi", "Dhamoirhat", "Manda", "Mohadevpur", "Naogaon Sadar", "Niamatpur", "Patnitala", "Porsha", "Raninagar", "Sapahar"]
  },
  {
    district: "Narail",
    areas: ["Kalia", "Lohagara", "Narail Sadar"]
  },
  {
    district: "Narayanganj",
    areas: ["Araihazar", "Bandar", "Narayanganj Sadar", "Rupganj", "Sonargaon"]
  },
  {
    district: "Narsingdi",
    areas: ["Belabo", "Monohardi", "Narsingdi Sadar", "Palash", "Raipura", "Shibpur"]
  },
  {
    district: "Natore",
    areas: ["Bagatipara", "Baraigram", "Gurudaspur", "Lalpur", "Naldanga", "Natore Sadar", "Singra"]
  },
  {
    district: "Netrokona",
    areas: ["Atpara", "Barhatta", "Durgapur", "Kalmakanda", "Kendua", "Khaliajuri", "Madan", "Mohongonj", "Netrokona Sadar", "Purbadhala"]
  },
  {
    district: "Nilphamari",
    areas: ["Dimla", "Domar", "Jaldhaka", "Kishorganj", "Nilphamari Sadar", "Syedpur"]
  },
  {
    district: "Noakhali",
    areas: ["Begumganj", "Chatkhil", "Companiganj", "Hatia", "Kabirhat", "Noakhali Sadar", "Senbug", "Sonaimori", "Subamachar"]
  },
  {
    district: "Pabna",
    areas: ["Atghoria", "Bera", "Bhangura", "Chatmohar", "Faridpur", "Ishurdi", "Pabna Sadar", "Santhia", "Sujanagar"]
  },
  {
    district: "Panchagarh",
    areas: ["Atwari", "Boda", "Debiganj", "Panchagarh Sadar", "Tetulia"]
  },
  {
    district: "Patuakhali",
    areas: ["Bauphal", "Dashmina", "Dumki", "Galachipa", "Kalapara", "Mirzaganj", "Patuakhali Sadar", "Rangabali"]
  },
  {
    district: "Pirojpur",
    areas: ["Bhandaria", "Kawkhali", "Mathbaria", "Nesarabad", "Nazirpur", "Pirojpur Sadar", "Zianagar"]
  },
  {
    district: "Rajbari",
    areas: ["Baliakandi", "Goalanda", "Kalukhali", "Pangsa", "Rajbari Sadar"]
  },
  {
    district: "Rajshahi",
    areas: ["Bagha", "Bagmara", "Charghat", "Durgapur", "Godagari", "Mohonpur", "Paba", "Puthia", "Tanore"]
  },
  {
    district: "Rangamati",
    areas: ["Baghaichari", "Barkal", "Belaichari", "Juraichari", "Kaptai", "Kawkhali", "Langadu", "Naniarchar", "Rajasthali", "Rangamati Sadar"]
  },
  {
    district: "Rangpur",
    areas: ["Badargonj", "Gangachara", "Kaunia", "Mithapukur", "Pirgacha", "Pirgonj", "Rangpur Sadar", "Taragonj"]
  },
  {
    district: "Satkhira",
    areas: ["Assasuni", "Debhata", "Kalaroa", "Kaliganj", "Satkhira Sadar", "Shyamnagar", "Tala"]
  },
  {
    district: "Shariatpur",
    areas: ["Bhedarganj", "Damudya", "Gosairhat", "Naria", "Shariatpur Sadar", "Zajira"]
  },
  {
    district: "Sherpur",
    areas: ["Jhenaigati", "Nalitabari", "Nokla", "Sherpur Sadar", "Sreebordi"]
  },
  {
    district: "Sirajganj",
    areas: ["Belkuchi", "Chauhali", "Kamarkhand", "Kazipur", "Raigonj", "Shahjadpur", "Sirajganj Sadar", "Tarash", "Ullapara"]
  },
  {
    district: "Sunamganj",
    areas: ["Bishwambarpur", "Chhatak", "Derai", "Dharmapasha", "Dowarabazar", "Jagannathpur", "Jamalganj", "Shalla", "South Sunamganj", "Sunamganj Sadar", "Tahirpur"]
  },
  {
    district: "Sylhet",
    areas: ["Balaganj", "Beanibazar", "Bishwanath", "Companiganj", "Dakshinsurma", "Fenchuganj", "Golapganj", "Gowainghat", "Jaintiapur", "Kanaighat", "Osmaninagar", "Sylhet Sadar", "Zakiganj"]
  },
  {
    district: "Tangail",
    areas: ["Basail", "Bhuapur", "Delduar", "Dhanbari", "Ghatail", "Gopalpur", "Kalihati", "Madhupur", "Mirzapur", "Nagarpur", "Sakhipur", "Tangail Sadar"]
  },
  {
    district: "Thakurgaon",
    areas: ["Baliadangi", "Haripur", "Pirganj", "Ranisankail", "Thakurgaon Sadar"]
  }
];

    