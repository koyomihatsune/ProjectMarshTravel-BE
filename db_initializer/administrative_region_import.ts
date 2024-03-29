/* eslint-disable no-console */

/* DISCLAIMER:
This part of database is based on the following resources:
- https://github.com/ThangLeQuoc/vietnamese-provinces-database
*/

import * as fs from 'fs';
import * as mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

// Read the MONGODB_URI from the .config file

const configFilePath = './.config';
console.log('Reading .config file...');
const config = dotenv.parse(fs.readFileSync(configFilePath));

if (!fs.existsSync(configFilePath)) {
  console.error(
    '.config file not found. Please create one with your MONGODB_URI.',
  );
  process.exit(1);
}

process.env.MONGODB_URI = config.MONGODB_URI;

const MONGODB_URI = process.env.MONGODB_URI as string;

// Connect to MongoDB
mongoose.connect(MONGODB_URI);
const db = mongoose.connection;

// Define a schema and model for your data
const provinceSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  name_en: String,
  full_name: {
    type: String,
    required: true,
  },
  full_name_en: String,
  code_name: String,
  administrative_unit_id: Number,
  administrative_region_id: Number,
  explore_tags: [String],
  imageURL: String,
});

// Create a model for the provinces collection
const ProvinceModel = mongoose.model('Province', provinceSchema);

const p1 = [
  {
    code: '01',
    name: 'Hà Nội',
    name_en: 'Ha Noi',
    full_name: 'Thành phố Hà Nội',
    full_name_en: 'Ha Noi City',
    code_name: 'ha_noi',
    administrative_unit_id: 1,
    administrative_region_id: 3,
    explore_tags: ['pagoda_temple', 'landscape', 'old_quarter', 'cityscape'],
    imageURL:
      'https://owa.bestprice.vn/images/destinations/uploads/trung-tam-thanh-pho-ha-noi-603da1f235b38.jpg',
  },
  {
    code: '26',
    name: 'Vĩnh Phúc',
    name_en: 'Vinh Phuc',
    full_name: 'Tỉnh Vĩnh Phúc',
    full_name_en: 'Vinh Phuc Province',
    code_name: 'vinh_phuc',
    administrative_unit_id: 2,
    administrative_region_id: 3,
    explore_tags: ['mountain', 'lake'],
    imageURL: 'https://songhongresort.com/img_duhoc/images/2_326.jpg',
  },
  {
    code: '27',
    name: 'Bắc Ninh',
    name_en: 'Bac Ninh',
    full_name: 'Tỉnh Bắc Ninh',
    full_name_en: 'Bac Ninh Province',
    code_name: 'bac_ninh',
    administrative_unit_id: 2,
    administrative_region_id: 3,
    explore_tags: ['pagoda_temple', 'landscape'],
    imageURL:
      'https://dulichvn.org.vn/nhaptin/uploads/images/2020/Thang8/dancaquanhobacninh.jpg',
  },
  {
    code: '30',
    name: 'Hải Dương',
    name_en: 'Hai Duong',
    full_name: 'Tỉnh Hải Dương',
    full_name_en: 'Hai Duong Province',
    code_name: 'hai_duong',
    administrative_unit_id: 2,
    administrative_region_id: 3,
    imageURL:
      'https://media.baodautu.vn/Images/quynhnga/2023/04/04/Quy_Hoach_Hai_Duong_2040.jpg',
  },
  {
    code: '31',
    name: 'Hải Phòng',
    name_en: 'Hai Phong',
    full_name: 'Thành phố Hải Phòng',
    full_name_en: 'Hai Phong City',
    code_name: 'hai_phong',
    administrative_unit_id: 1,
    administrative_region_id: 3,
    imageURL:
      'https://xdcs.cdnchinhphu.vn/446259493575335936/2023/9/8/haiphong-16941453185961261457986.jpg',
  },
  {
    code: '33',
    name: 'Hưng Yên',
    name_en: 'Hung Yen',
    full_name: 'Tỉnh Hưng Yên',
    full_name_en: 'Hung Yen Province',
    code_name: 'hung_yen',
    administrative_unit_id: 2,
    administrative_region_id: 3,
    imageURL:
      'https://bandovietnam.com.vn/media/article/ban-do-tinh-hung-yen-bandovietnam.jpg',
  },
  {
    code: '34',
    name: 'Thái Bình',
    name_en: 'Thai Binh',
    full_name: 'Tỉnh Thái Bình',
    full_name_en: 'Thai Binh Province',
    code_name: 'thai_binh',
    administrative_unit_id: 2,
    administrative_region_id: 3,
    imageURL:
      'https://baolangson.vn/uploads/2020/10/24/thap1-1603437883717.jpg',
  },
  {
    code: '35',
    name: 'Hà Nam',
    name_en: 'Ha Nam',
    full_name: 'Tỉnh Hà Nam',
    full_name_en: 'Ha Nam Province',
    code_name: 'ha_nam',
    administrative_unit_id: 2,
    administrative_region_id: 3,
    imageURL:
      'https://file1.dangcongsan.vn/data/0/images/2022/03/25/hungnm/ecaf15aea8ba141873ece18ca986f865.jpg',
  },
  {
    code: '96',
    name: 'Cà Mau',
    name_en: 'Ca Mau',
    full_name: 'Tỉnh Cà Mau',
    full_name_en: 'Ca Mau Province',
    code_name: 'ca_mau',
    administrative_unit_id: 2,
    administrative_region_id: 8,
    imageURL:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Tuongdaimuicamau.jpg/1200px-Tuongdaimuicamau.jpg',
  },
  {
    code: '02',
    name: 'Hà Giang',
    name_en: 'Ha Giang',
    full_name: 'Tỉnh Hà Giang',
    full_name_en: 'Ha Giang Province',
    code_name: 'ha_giang',
    administrative_unit_id: 2,
    administrative_region_id: 1,
    imageURL:
      'https://ik.imagekit.io/tvlk/blog/2022/11/kinh-nghiem-du-lich-ha-giang-7-1024x684.jpg?tr=dpr-2,w-675',
  },
];

const p2 = [
  {
    code: '04',
    name: 'Cao Bằng',
    name_en: 'Cao Bang',
    full_name: 'Tỉnh Cao Bằng',
    full_name_en: 'Cao Bang Province',
    code_name: 'cao_bang',
    administrative_unit_id: 2,
    administrative_region_id: 1,
    imageURL:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Ban_Gioc_-_Detian_Falls2.jpg/800px-Ban_Gioc_-_Detian_Falls2.jpg',
  },
  {
    code: '06',
    name: 'Bắc Kạn',
    name_en: 'Bac Kan',
    full_name: 'Tỉnh Bắc Kạn',
    full_name_en: 'Bac Kan Province',
    code_name: 'bac_kan',
    administrative_unit_id: 2,
    administrative_region_id: 1,
    imageURL: 'https://media.truyenhinhdulich.vn/upload/news/59_bac_kan.jpg',
  },
  {
    code: '08',
    name: 'Tuyên Quang',
    name_en: 'Tuyen Quang',
    full_name: 'Tỉnh Tuyên Quang',
    full_name_en: 'Tuyen Quang Province',
    code_name: 'tuyen_quang',
    administrative_unit_id: 2,
    administrative_region_id: 1,
    imageURL: 'https://tuyenquang.dcs.vn/Image/Large/2021813105723_47959.jpg',
  },
  {
    code: '19',
    name: 'Thái Nguyên',
    name_en: 'Thai Nguyen',
    full_name: 'Tỉnh Thái Nguyên',
    full_name_en: 'Thai Nguyen Province',
    code_name: 'thai_nguyen',
    administrative_unit_id: 2,
    administrative_region_id: 1,
    imageURL:
      'https://cdn.tgdd.vn/Files/2023/04/26/1527479/du-lich-dong-hy-thai-nguyen-5-dia-diem-du-lich-nen-kham-pha-202304260848095809.jpg',
  },
  {
    code: '20',
    name: 'Lạng Sơn',
    name_en: 'Lang Son',
    full_name: 'Tỉnh Lạng Sơn',
    full_name_en: 'Lang Son Province',
    code_name: 'lang_son',
    administrative_unit_id: 2,
    administrative_region_id: 1,
    imageURL:
      'https://scontent.iocvnpt.com/resources/portal/Images/LSN/linhnk.lsn/langson_694464698.jpg',
  },
  {
    code: '22',
    name: 'Quảng Ninh',
    name_en: 'Quang Ninh',
    full_name: 'Tỉnh Quảng Ninh',
    full_name_en: 'Quang Ninh Province',
    code_name: 'quang_ninh',
    administrative_unit_id: 2,
    administrative_region_id: 1,
    imageURL:
      'https://upload.wikimedia.org/wikipedia/commons/d/d3/A_view_of_Ha_Long_Bay_from_the_high_point_of_Sun_Sot_cave_%2831520203451%29.jpg',
  },
  {
    code: '24',
    name: 'Bắc Giang',
    name_en: 'Bac Giang',
    full_name: 'Tỉnh Bắc Giang',
    full_name_en: 'Bac Giang Province',
    code_name: 'bac_giang',
    administrative_unit_id: 2,
    administrative_region_id: 1,
    imageURL:
      'https://ik.imagekit.io/tvlk/blog/2022/09/dia-diem-check-in-o-bac-giang-1.jpg?tr=dpr-2,w-675',
  },
  {
    code: '25',
    name: 'Phú Thọ',
    name_en: 'Phu Tho',
    full_name: 'Tỉnh Phú Thọ',
    full_name_en: 'Phu Tho Province',
    code_name: 'phu_tho',
    administrative_unit_id: 2,
    administrative_region_id: 1,
    imageURL:
      'https://afamilycdn.com/zoom/700_438/150157425591193600/2023/4/27/photo2023-04-2708-31-54-16825596378382054335799-98-0-517-800-crop-16825714988841343707957.jpg',
  },
  {
    code: '10',
    name: 'Lào Cai',
    name_en: 'Lao Cai',
    full_name: 'Tỉnh Lào Cai',
    full_name_en: 'Lao Cai Province',
    code_name: 'lao_cai',
    administrative_unit_id: 2,
    administrative_region_id: 2,
    imageURL:
      'https://media.baodautu.vn/Images/phuongthanh02/2022/08/25/14-Du%20l%E1%BB%8Bch%20l%C3%A0o%20Cai%204.jpg',
  },
  {
    code: '11',
    name: 'Điện Biên',
    name_en: 'Dien Bien',
    full_name: 'Tỉnh Điện Biên',
    full_name_en: 'Dien Bien Province',
    code_name: 'dien_bien',
    administrative_unit_id: 2,
    administrative_region_id: 2,
    explore_tags: ['visage'],
    imageURL:
      'https://upload.wikimedia.org/wikipedia/commons/d/d2/The_Victory_Monument_of_Dien_Bien_Phu_%28front%29_v2.jpg',
  },
];

const p3 = [
  {
    code: '12',
    name: 'Lai Châu',
    name_en: 'Lai Chau',
    full_name: 'Tỉnh Lai Châu',
    full_name_en: 'Lai Chau Province',
    code_name: 'lai_chau',
    administrative_unit_id: 2,
    administrative_region_id: 2,
    imageURL:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Flag_of_Vietnam.svg/1200px-Flag_of_Vietnam.svg.png',
  },
  {
    code: '14',
    name: 'Sơn La',
    name_en: 'Son La',
    full_name: 'Tỉnh Sơn La',
    full_name_en: 'Son La Province',
    code_name: 'son_la',
    administrative_unit_id: 2,
    administrative_region_id: 2,
    imageURL:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Flag_of_Vietnam.svg/1200px-Flag_of_Vietnam.svg.png',
  },
  {
    code: '15',
    name: 'Yên Bái',
    name_en: 'Yen Bai',
    full_name: 'Tỉnh Yên Bái',
    full_name_en: 'Yen Bai Province',
    code_name: 'yen_bai',
    administrative_unit_id: 2,
    administrative_region_id: 2,
    imageURL:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Flag_of_Vietnam.svg/1200px-Flag_of_Vietnam.svg.png',
  },
  {
    code: '17',
    name: 'Hoà Bình',
    name_en: 'Hoa Binh',
    full_name: 'Tỉnh Hoà Bình',
    full_name_en: 'Hoa Binh Province',
    code_name: 'hoa_binh',
    administrative_unit_id: 2,
    administrative_region_id: 2,
    imageURL:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Flag_of_Vietnam.svg/1200px-Flag_of_Vietnam.svg.png',
  },
  {
    code: '70',
    name: 'Bình Phước',
    name_en: 'Binh Phuoc',
    full_name: 'Tỉnh Bình Phước',
    full_name_en: 'Binh Phuoc Province',
    code_name: 'binh_phuoc',
    administrative_unit_id: 2,
    administrative_region_id: 7,
    imageURL:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Flag_of_Vietnam.svg/1200px-Flag_of_Vietnam.svg.png',
  },
  {
    code: '72',
    name: 'Tây Ninh',
    name_en: 'Tay Ninh',
    full_name: 'Tỉnh Tây Ninh',
    full_name_en: 'Tay Ninh Province',
    code_name: 'tay_ninh',
    administrative_unit_id: 2,
    administrative_region_id: 7,
    imageURL:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Flag_of_Vietnam.svg/1200px-Flag_of_Vietnam.svg.png',
  },
  {
    code: '74',
    name: 'Bình Dương',
    name_en: 'Binh Duong',
    full_name: 'Tỉnh Bình Dương',
    full_name_en: 'Binh Duong Province',
    code_name: 'binh_duong',
    administrative_unit_id: 2,
    administrative_region_id: 7,
    imageURL:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Flag_of_Vietnam.svg/1200px-Flag_of_Vietnam.svg.png',
  },

  {
    code: '75',
    name: 'Đồng Nai',
    name_en: 'Dong Nai',
    full_name: 'Tỉnh Đồng Nai',
    full_name_en: 'Dong Nai Province',
    code_name: 'dong_nai',
    administrative_unit_id: 2,
    administrative_region_id: 7,
    imageURL:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Flag_of_Vietnam.svg/1200px-Flag_of_Vietnam.svg.png',
  },
  {
    code: '79',
    name: 'Hồ Chí Minh',
    name_en: 'Ho Chi Minh',
    full_name: 'Thành phố Hồ Chí Minh',
    full_name_en: 'Ho Chi Minh City',
    code_name: 'ho_chi_minh',
    administrative_unit_id: 1,
    administrative_region_id: 7,
    imageURL:
      'https://img.itinari.com/pages/images/original/f725925d-3b5a-4086-b3d2-5fa16224e468-istock-1182864019.jpg?ch=DPR&dpr=2.625&w=1600&s=fa9fac3064d1c3bc6b204c50c21d618f',
  },
  {
    code: '77',
    name: 'Bà Rịa - Vũng Tàu',
    name_en: 'Ba Ria - Vung Tau',
    full_name: 'Tỉnh Bà Rịa - Vũng Tàu',
    full_name_en: 'Ba Ria - Vung Tau Province',
    code_name: 'ba_ria_vung_tau',
    administrative_unit_id: 2,
    administrative_region_id: 7,
    imageURL:
      'https://vtv1.mediacdn.vn/zoom/640_400/2022/11/30/b22-16697994119911201542911-crop-1669799574167932517806.jpeg',
  },
];

const p4 = [
  {
    code: '36',
    name: 'Nam Định',
    name_en: 'Nam Dinh',
    full_name: 'Tỉnh Nam Định',
    full_name_en: 'Nam Dinh Province',
    code_name: 'nam_dinh',
    administrative_unit_id: 2,
    administrative_region_id: 3,
    imageURL:
      'https://vcdn1-dulich.vnecdn.net/2022/05/19/namdinh-1652930657-8629-1652930664.jpg?w=0&h=0&q=100&dpr=2&fit=crop&s=8MehPIYcj_-RiT5YFmBErg',
  },
  {
    code: '37',
    name: 'Ninh Bình',
    name_en: 'Ninh Binh',
    full_name: 'Tỉnh Ninh Bình',
    full_name_en: 'Ninh Binh Province',
    code_name: 'ninh_binh',
    administrative_unit_id: 2,
    administrative_region_id: 3,
    imageURL:
      'https://ik.imagekit.io/tvlk/blog/2022/12/du-lich-ninh-binh-1.jpg?tr=dpr-2,w-675',
  },
  {
    code: '38',
    name: 'Thanh Hóa',
    name_en: 'Thanh Hoa',
    full_name: 'Tỉnh Thanh Hóa',
    full_name_en: 'Thanh Hoa Province',
    code_name: 'thanh_hoa',
    administrative_unit_id: 2,
    administrative_region_id: 4,
  },
  {
    code: '40',
    name: 'Nghệ An',
    name_en: 'Nghe An',
    full_name: 'Tỉnh Nghệ An',
    full_name_en: 'Nghe An Province',
    code_name: 'nghe_an',
    administrative_unit_id: 2,
    administrative_region_id: 4,
    imageURL: 'https://statics.vinpearl.com/thoi-tiet-nghe-an-3_1642728132.png',
  },
  {
    code: '42',
    name: 'Hà Tĩnh',
    name_en: 'Ha Tinh',
    full_name: 'Tỉnh Hà Tĩnh',
    full_name_en: 'Ha Tinh Province',
    code_name: 'ha_tinh',
    administrative_unit_id: 2,
    administrative_region_id: 4,
  },
  {
    code: '44',
    name: 'Quảng Bình',
    name_en: 'Quang Binh',
    full_name: 'Tỉnh Quảng Bình',
    full_name_en: 'Quang Binh Province',
    code_name: 'quang_binh',
    administrative_unit_id: 2,
    administrative_region_id: 4,
  },
  {
    code: '45',
    name: 'Quảng Trị',
    name_en: 'Quang Tri',
    full_name: 'Tỉnh Quảng Trị',
    full_name_en: 'Quang Tri Province',
    code_name: 'quang_tri',
    administrative_unit_id: 2,
    administrative_region_id: 4,
  },
  {
    code: '46',
    name: 'Thừa Thiên Huế',
    name_en: 'Thua Thien Hue',
    full_name: 'Tỉnh Thừa Thiên Huế',
    full_name_en: 'Thua Thien Hue Province',
    code_name: 'thua_thien_hue',
    administrative_unit_id: 2,
    administrative_region_id: 4,
    explore_tags: ['pagoda_temple'],
    imageURL:
      'https://file1.dangcongsan.vn/data/0/images/2021/11/05/halthts/thua-thien-hue.jpg',
  },
  {
    code: '48',
    name: 'Đà Nẵng',
    name_en: 'Da Nang',
    full_name: 'Thành phố Đà Nẵng',
    full_name_en: 'Da Nang City',
    code_name: 'da_nang',
    administrative_unit_id: 1,
    administrative_region_id: 5,
    explore_tags: ['beach', 'pagoda_temple', 'amusement', 'old_town'],
    imageURL:
      'https://photo-cms-tinnhanhchungkhoan.epicdn.me/w660/Uploaded/2023/bpikpjik/2023_06_14/da-nang-5-8014.jpg',
  },
  {
    code: '49',
    name: 'Quảng Nam',
    name_en: 'Quang Nam',
    full_name: 'Tỉnh Quảng Nam',
    full_name_en: 'Quang Nam Province',
    code_name: 'quang_nam',
    administrative_unit_id: 2,
    administrative_region_id: 5,
    imageURL: 'https://toplist.vn/images/800px/pho-co-hoi-an-532793.jpg',
  },
];

const p5 = [
  {
    code: '68',
    name: 'Lâm Đồng',
    name_en: 'Lam Dong',
    full_name: 'Tỉnh Lâm Đồng',
    full_name_en: 'Lam Dong Province',
    code_name: 'lam_dong',
    administrative_unit_id: 2,
    administrative_region_id: 6,
    imageURL:
      'https://static.vinwonders.com/production/gioi-thieu-ve-da-lat-1.jpg',
  },
  {
    code: '80',
    name: 'Long An',
    name_en: 'Long An',
    full_name: 'Tỉnh Long An',
    full_name_en: 'Long An Province',
    code_name: 'long_an',
    administrative_unit_id: 2,
    administrative_region_id: 8,
  },
  {
    code: '82',
    name: 'Tiền Giang',
    name_en: 'Tien Giang',
    full_name: 'Tỉnh Tiền Giang',
    full_name_en: 'Tien Giang Province',
    code_name: 'tien_giang',
    administrative_unit_id: 2,
    administrative_region_id: 8,
  },
  {
    code: '83',
    name: 'Bến Tre',
    name_en: 'Ben Tre',
    full_name: 'Tỉnh Bến Tre',
    full_name_en: 'Ben Tre Province',
    code_name: 'ben_tre',
    administrative_unit_id: 2,
    administrative_region_id: 8,
  },
  {
    code: '84',
    name: 'Trà Vinh',
    name_en: 'Tra Vinh',
    full_name: 'Tỉnh Trà Vinh',
    full_name_en: 'Tra Vinh Province',
    code_name: 'tra_vinh',
    administrative_unit_id: 2,
    administrative_region_id: 8,
  },
  {
    code: '86',
    name: 'Vĩnh Long',
    name_en: 'Vinh Long',
    full_name: 'Tỉnh Vĩnh Long',
    full_name_en: 'Vinh Long Province',
    code_name: 'vinh_long',
    administrative_unit_id: 2,
    administrative_region_id: 8,
  },
  {
    code: '87',
    name: 'Đồng Tháp',
    name_en: 'Dong Thap',
    full_name: 'Tỉnh Đồng Tháp',
    full_name_en: 'Dong Thap Province',
    code_name: 'dong_thap',
    administrative_unit_id: 2,
    administrative_region_id: 8,
  },
  {
    code: '89',
    name: 'An Giang',
    name_en: 'An Giang',
    full_name: 'Tỉnh An Giang',
    full_name_en: 'An Giang Province',
    code_name: 'an_giang',
    administrative_unit_id: 2,
    administrative_region_id: 8,
  },
  {
    code: '91',
    name: 'Kiên Giang',
    name_en: 'Kien Giang',
    full_name: 'Tỉnh Kiên Giang',
    full_name_en: 'Kien Giang Province',
    code_name: 'kien_giang',
    administrative_unit_id: 2,
    administrative_region_id: 8,
  },
  {
    code: '92',
    name: 'Cần Thơ',
    name_en: 'Can Tho',
    full_name: 'Thành phố Cần Thơ',
    full_name_en: 'Can Tho City',
    code_name: 'can_tho',
    administrative_unit_id: 1,
    administrative_region_id: 8,
  },
  {
    code: '93',
    name: 'Hậu Giang',
    name_en: 'Hau Giang',
    full_name: 'Tỉnh Hậu Giang',
    full_name_en: 'Hau Giang Province',
    code_name: 'hau_giang',
    administrative_unit_id: 2,
    administrative_region_id: 8,
  },
  {
    code: '94',
    name: 'Sóc Trăng',
    name_en: 'Soc Trang',
    full_name: 'Tỉnh Sóc Trăng',
    full_name_en: 'Soc Trang Province',
    code_name: 'soc_trang',
    administrative_unit_id: 2,
    administrative_region_id: 8,
  },
  {
    code: '95',
    name: 'Bạc Liêu',
    name_en: 'Bac Lieu',
    full_name: 'Tỉnh Bạc Liêu',
    full_name_en: 'Bac Lieu Province',
    code_name: 'bac_lieu',
    administrative_unit_id: 2,
    administrative_region_id: 8,
  },
];

const fullProvinceData = [...p1, ...p2, ...p3, ...p4, ...p5];

ProvinceModel.insertMany(fullProvinceData)
  .then((docs) => {
    console.log('Added data to the database:');
    console.log(docs);
  })
  .catch((err) => {
    if (err.code === 11000) {
      console.error('Database already updated.');
    } else {
      console.error(err);
    }
  })
  .finally(() => {
    // Close the database connection
    db.close();
  });
