import { RPCharacter } from '../types';

const now = Date.now();

export const REVEALED_AVATARS_PREFIX = 'roblox_rp_real_avatar_';

export function isCharacterAvatarRevealed(characterId: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(`${REVEALED_AVATARS_PREFIX}${characterId}`) === 'true';
  } catch {
    return false;
  }
}

export function setCharacterAvatarRevealed(characterId: string) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`${REVEALED_AVATARS_PREFIX}${characterId}`, 'true');
  } catch {
    // ignore
  }
}

// Mộng chè - Ngọc Hoàng đặc biệt luôn đứng đầu danh sách phòng tranh & tặng tranh
export const MONG_CHE_CHARACTER: RPCharacter = {
  id: 'mong_che_admin',
  name: 'Mộng chè - Chơi Roblox Khum',
  avatarUrl: 'https://i.ibb.co/sLXrS2L/FB-IMG-1787048727875.jpg',
  roleTag: 'Ngọc Hoàng / Chơi Roblox Khum',
  tags: ['Admin', 'Ngọc Hoàng', 'Mộng chè', 'Chơi Roblox Khum'],
  tagline: 'Chơi Roblox Khum',
  robuxDonations: 0,
  personality: 'Đáng yêu, hài hước, luôn thương bồ',
  plotTitle: 'Mộng chè',
  plotSummary: 'Ngọc Hoàng tối cao của vũ trụ Chơi Roblox Khum 👑✨',
  fullPlot: '',
  sampleDialogue: [],
  createdAt: now + 999999999,
  isNew: true,
  cornerTag: 'ADMIN ✨',
};

// QUY TẮC: Nhân vật mới thêm vào luôn được đặt ở ĐẦU mảng (index 0) để xuất hiện phía trước,
// và gắn cờ isNew: true, cornerTag: 'MỚI' để hiển thị tag nổi bật ở góc phải trên cùng ảnh (tối đa 3 nhân vật).
export const INITIAL_RP_CHARACTERS: RPCharacter[] = [
  {
    id: 'char-16-hoang-nhat-thien',
    name: 'Hoàng Nhất Thiên',
    avatarUrl: 'https://i.ibb.co/zjDNf5m/Kh-ng-C-Ti-u-65-20260919130152.jpg',
    roleTag: 'Hiện đại',
    tags: ['Hiện đại', 'char máu S', 'user ngoại tình (?)', 'trai IT', 'Sài Gòn'],
    tagline: '',
    robuxDonations: 0,
    personality: 'Trai IT, máu S, sắc sảo, nguy hiểm',
    plotTitle: '',
    plotSummary: 'Tôi phát hiện bạn gái ngoại tình với...Google AI Studio?',
    fullPlot: '',
    sampleDialogue: [],
    playUrl: 'https://aistudio.google.com/app/prompts?state=%7B%22ids%22%3A%5B%221ERpUQlKrc-YcynTWrJgw2yU8BdMnChqn%22%5D%2C%22action%22%3A%22open%22%2C%22userId%22%3A%22102834450421569886676%22%2C%22resourceKeys%22%3A%7B%7D%7D&usp=drive_link',
    plotUrl: 'https://rentry.co/choirobloxkhum_thien',
    voiceUrl: 'https://res.cloudinary.com/opmwpbzb/video/upload/v1789908496/ElevenLabs_2026-09-20T12_44_00_Hung_Tran_-_Deep_Calm_and_Reflective_pvc_sp105_s50_sb75_v3.mp3',
    createdAt: now + 5000,
    isNew: true,
    cornerTag: 'MỚI',
    hasDynamicPassword: true,
    password: 'HN1T89',
    passwordHint: 'Nhấp anh mười đêm',
    hint1: 'Chữ "anh" có bình thường không nhỉ?',
    hint2: 'Nhấp vào chữ anh trong phần hint 10 lần sẽ ra Password',
  },
  {
    id: 'char-15-seo-jihoon',
    name: 'Seo Jihoon',
    avatarUrl: 'https://i.ibb.co/XrJQzRnq/Kh-ng-C-Ti-u-4-20260908130049.png',
    roleTag: 'Học đường',
    tags: ['Học đường', 'Ngọt', '🦊✖️🐰', 'user ngốc'],
    tagline: '',
    robuxDonations: 0,
    personality: '',
    plotTitle: '',
    plotSummary: 'Sau này nếu cậu muốn hôn. Thì hôn tôi cũng được.',
    fullPlot: '',
    sampleDialogue: [],
    playUrl: 'https://aistudio.google.com/app/prompts?state=%7B%22ids%22:%5B%2211oW_p0ptUtGAbMOC2zsw09SLdnY7MLOQ%22%5D,%22action%22:%22open%22,%22userId%22:%22118220567926520160271%22,%22resourceKeys%22:%7B%7D%7D&usp=sharing',
    plotUrl: 'https://rentry.co/choirobloxkhum_jihoon',
    voiceUrl: 'https://res.cloudinary.com/opmwpbzb/video/upload/v1789908658/ElevenLabs_2026-09-20T12_49_54_Chris_-_Warm_and_Clear_pvc_sp100_s55_sb55_v3.mp3',
    createdAt: now + 4000,
    isNew: true,
    cornerTag: 'MỚI',
  },
  {
    id: 'char-14-gabriel',
    name: 'Gabriel Marias',
    avatarUrl: 'https://i.ibb.co/yc5hB8Gx/media-1788541815.png',
    roleTag: 'Khác',
    tags: ['Khác', 'Ngọt', 'slowburn', 'gấu lớn x tiểu thư', '1870s', 'Pháp'],
    tagline: '',
    robuxDonations: 0,
    personality: '',
    plotTitle: '',
    plotSummary: 'vậy em ơi, khi nào em mới để nắng đậu trọn vấn vương?',
    fullPlot: '',
    sampleDialogue: [],
    playUrl: 'https://aistudio.google.com/app/prompts?state=%7B%22ids%22:%5B%221STcC-TMWNpGfErOuEC01LyAW3a0xgfRG%22%5D,%22action%22:%22open%22,%22userId%22:%22102834450421569886676%22,%22resourceKeys%22:%7B%7D%7D',
    plotUrl: 'https://rentry.org/gabriel_choirobloxkhum',
    voiceUrl: 'https://res.cloudinary.com/ygmarp6t/video/upload/v1788595927/ElevenLabs_2026-09-05T08_10_10_Alexandre_-_Calm_Storyteller_pvc_sp100_s50_sb75_v3.mp3',
    createdAt: now + 3000,
    isNew: true,
    cornerTag: 'MỚI',
  },
  {
    id: 'char-11-lucifer',
    name: 'Lucifer',
    avatarUrl: 'https://i.ibb.co/SwLw6RXR/media-1788514839.png',
    roleTag: 'Khác',
    tags: ['🔒', 'Khác', 'ma vương', 'hài', 'chim bé', 'user là incubus/succubus', 'F7 Big Wrongs'],
    tagline: '',
    robuxDonations: 0,
    personality: '',
    plotTitle: '',
    plotSummary: 'Đối tượng của tôi lại là Ma Vương chim bé?!',
    fullPlot: '',
    sampleDialogue: [],
    playUrl: 'https://aistudio.google.com/app/prompts?state=%7B%22ids%22%3A%5B%221WF5piR7Ba9qPmdWjSph7aYDjqPVz2-B2%22%5D%2C%22action%22%3A%22open%22%2C%22userId%22%3A%22102834450421569886676%22%2C%22resourceKeys%22%3A%7B%7D%7D&usp=drive_link',
    plotUrl: 'https://rentry.co/choirobloxkhum_lucifer',
    voiceUrl: 'https://res.cloudinary.com/ygmarp6t/video/upload/v1788602993/ElevenLabs_2026-09-05T10_06_43_VASKO_-_Deep_Warm_and_Pleasant_pvc_sp100_s75_sb70_v3.mp3',
    createdAt: now + 2000,
    password: 'cuccut',
    passwordHint: 'gọi tui là cục cưng, bạn tệ bạc gọi là...?',
    hint1: 'Facebook của Ngọc Hoàng',
    hint1Url: 'https://www.facebook.com/profile.php?id=61590620211736',
    hint2: 'Bio mô tả của Ngọc Hoàng',
  },
  {
    id: 'char-12-jaxon',
    name: 'Jaxon Petrov',
    avatarUrl: 'https://i.ibb.co/TDw1NC5s/media-1788512571.png',
    roleTag: 'Hiện đại',
    tags: ['Hiện đại', 'fckboy', 'f1', 'slowburn', 'hài'],
    tagline: '',
    robuxDonations: 0,
    personality: '',
    plotTitle: '',
    plotSummary: 'Huh, vết cắn này sao? Just a crazy dog. Bit me and ran"',
    fullPlot: '',
    sampleDialogue: [],
    playUrl: 'https://aistudio.google.com/app/prompts?state=%7B%22ids%22:%5B%221j46zIyS0HeoKc0qMlcYE1-I9cokHLPKi%22%5D,%22action%22:%22open%22,%22userId%22:%22102834450421569886676%22,%22resourceKeys%22:%7B%7D%7D',
    plotUrl: 'https://rentry.co/choirobloxkhum_jaxon',
    voiceUrl: 'https://res.cloudinary.com/opmwpbzb/video/upload/v1788452056/ElevenLabs_2026-09-03T16_10_32_Ryan_-_Rich_Smooth_and_Engaging_pvc_sp89_s39_sb32_v3.mp3',
    createdAt: now + 1500,
  },
  {
    id: 'char-13-asmodeus',
    name: 'Asmodeus',
    avatarUrl: 'https://i.ibb.co/hJrFztd0/media-1788514551.png',
    roleTag: 'Khác',
    tags: ['Khác', 'ma vương', 'hài', 'user bán s** toy', 'máu M?', 'F7 Big Wrongs'],
    tagline: '',
    robuxDonations: 0,
    personality: '',
    plotTitle: '',
    plotSummary: 'Bị mẹ phát hiện khi đang móc, tôi chuyển sinh thành nhân viên bán s** toy cho Ma Vương Sắc Dục',
    fullPlot: '',
    sampleDialogue: [],
    playUrl: 'https://aistudio.google.com/app/prompts?state=%7B%22ids%22:%5B%221Z7UyhD695Vu3-ggXj98ZL1U6bQS7nwBU%22%5D,%22action%22:%22open%22,%22userId%22:%22102834450421569886676%22,%22resourceKeys%22:%7B%7D%7D',
    plotUrl: 'https://rentry.co/choirobloxkhum_asmodeus',
    voiceUrl: 'https://res.cloudinary.com/ygmarp6t/video/upload/v1788602993/ElevenLabs_2026-09-05T09_35_22_Ritsuto_-_Anime_Prince_Voice_pvc_sp94_s59_sb52_v3.mp3',
    createdAt: now + 1200,
  },
  {
    id: 'char-10-belphegor',
    name: 'Belphegor',
    avatarUrl: 'https://i.ibb.co/0Vcs6x6R/media-1787371640.png',
    roleTag: 'Khác',
    tags: ['Khác', 'hài', 'user là hệ thống', 'ma vương', 'vỡ nợ', 'F7 Big Wrongs'],
    tagline: '',
    robuxDonations: 0,
    personality: '',
    plotTitle: '',
    plotSummary: 'Bị BWM tông tôi chuyển sinh thành hệ thống Idol Live của Ma vương vỡ nợ',
    fullPlot: '',
    sampleDialogue: [],
    playUrl: 'https://aistudio.google.com/app/prompts?state=%7B%22ids%22:%5B%221RBDzCPfiB4mG2n47wnvizDrXlv3CEiOX%22%5D,%22action%22:%22open%22,%22userId%22:%22102834450421569886676%22,%22resourceKeys%22:%7B%7D%7D',
    plotUrl: 'https://rentry.co/belphegor_choirobloxkhum',
    voiceUrl: 'https://res.cloudinary.com/ygmarp6t/video/upload/v1787373156/ElevenLabs_2026-08-22T04_29_15_Meisam_-_Deep_Strong_and_Engaging_pvc_sp115_s80_sb13_v3.mp3',
    createdAt: now + 1000,
  },
  {
    id: 'char-1-yuuma',
    name: 'Okari Yuuma',
    avatarUrl: 'https://i.ibb.co/k6kP8p1W/773378939-122261971682253380-8952321491521867540-n.jpg',
    roleTag: 'Học đường',
    tags: ['Học đường', 'user đơn phương', 'nhật bản', 'slowburn'],
    tagline: '',
    robuxDonations: 0,
    personality: '',
    plotTitle: '',
    plotSummary: 'Hàm số tiến về vô cùng, đường tiệm cận tiến sát đường con nhưng không bao giờ giao nhau. Toán học không lừa dối ai cả, chỉ có lòng người tự ảo vọng về một điểm chạm.',
    fullPlot: '',
    sampleDialogue: [],
    playUrl: 'https://aistudio.google.com/app/prompts?state=%7B%22ids%22:%5B%221S-cnzBMNJKUEZwMpEqQfCDbgUJCF7vuI%22%5D,%22action%22:%22open%22,%22userId%22:%22102834450421569886676%22,%22resourceKeys%22:%7B%7D%7D&usp=sharing',
    plotUrl: 'https://rentry.org/yuuma_choirobloxkhum',
    voiceUrl: 'https://res.cloudinary.com/ygmarp6t/video/upload/v1787313230/ElevenLabs_2026-08-21T11_51_56_Kyo_-_Low_Soft_Steady_pvc_sp100_s50_sb40_v3.mp3',
    createdAt: now,
  },
  {
    id: 'char-2-thetri',
    name: 'Trần Thế Trí',
    avatarUrl: 'https://i.ibb.co/B2yrj89v/media-1787356147.png',
    roleTag: 'Hiện đại',
    tags: ['Hiện đại', 'Ngọt', 'đời thường', 'agegap', 'char là chồng', 'việt nam'],
    tagline: '',
    robuxDonations: 0,
    personality: '',
    plotTitle: '',
    plotSummary: 'Em…bớt mua Shopee lại đi. Cái váy này tiết kiệm vải dữ vậy hả? Rồi định bắt anh mặc…hay em mặc?',
    fullPlot: '',
    sampleDialogue: [],
    playUrl: 'https://aistudio.google.com/app/prompts?state=%7B%22ids%22:%5B%2219ZUYJp7bX64iY5bTz_DVt4bVgHMgwPOr%22%5D,%22action%22:%22open%22,%22userId%22:%22102834450421569886676%22,%22resourceKeys%22:%7B%7D%7D',
    plotUrl: 'https://rentry.org/thetri_choirobloxkhum',
    voiceUrl: 'https://res.cloudinary.com/ygmarp6t/video/upload/v1787311779/ElevenLabs_2026-08-20T15_00_31_Hung_Tran_-_Deep_Calm_and_Reflective_pvc_sp105_s50_sb75_v3.mp3',
    createdAt: now - 1000,
  },
  {
    id: 'char-3-taloi',
    name: 'Đừng Tạ Lỗi',
    avatarUrl: 'https://i.ibb.co/Pv1zDf85/media-1787357130.png',
    roleTag: 'Hiện đại',
    tags: ['Hiện đại', 'giấc mơ', 'hồng hài nhi', 'user ghét char', 'trung quốc'],
    tagline: '',
    robuxDonations: 0,
    personality: '',
    plotTitle: '',
    plotSummary: 'Chị…sao chị nhìn em như muốn dùng pikachu đấm em thế? Tiểu Mộng bảo chúng ta tương thích 97.3% mà…',
    fullPlot: '',
    sampleDialogue: [],
    playUrl: 'https://aistudio.google.com/app/prompts?state=%7B%22ids%22:%5B%221OfO3VfDuYzNYsNJpwI32KWLOK8aOjtW2%22%5D,%22action%22:%22open%22,%22userId%22:%22102834450421569886676%22,%22resourceKeys%22:%7B%7D%7D&usp=sharing',
    plotUrl: 'https://rentry.org/taloi_choirobloxkhum',
    voiceUrl: 'https://res.cloudinary.com/ygmarp6t/video/upload/v1787312109/ElevenLabs_2026-08-20T13_36_12_Jing_-_Natural_Bright_and_Conversational_pvc_sp110_s100_sb75_v3.mp3',
    createdAt: now - 2000,
  },
  {
    id: 'char-4-rex',
    name: 'Reginald Arthur Vane - Rex',
    avatarUrl: 'https://i.ibb.co/xKPHc5Cq/media-1787357430.png',
    roleTag: 'Hiện đại',
    tags: ['Hiện đại', 'enemies to lovers', 'user đấm char', 'cotswolds'],
    tagline: '',
    robuxDonations: 0,
    personality: '',
    plotTitle: '',
    plotSummary: 'Dùng kỹ năng của tầng lớp lao động trên mặt tôi…Cậu đang cố gây ấn tượng với tôi đấy à, ‘Scholarship’?',
    fullPlot: '',
    sampleDialogue: [],
    playUrl: 'https://aistudio.google.com/app/prompts?state=%7B%22ids%22:%5B%221uKA9PHnLk2xjTxm2sJtRslPnoZLcsLdS%22%5D,%22action%22:%22open%22,%22userId%22:%22102834450421569886676%22,%22resourceKeys%22:%7B%7D%7D',
    plotUrl: 'https://rentry.org/rex_choirobloxkhum',
    voiceUrl: 'https://res.cloudinary.com/ygmarp6t/video/upload/v1787311833/ElevenLabs_2026-08-21T05_27_15_Oliver_-_Clean_British_and_Steady_pvc_sp100_s100_sb100_v3.mp3',
    createdAt: now - 3000,
  },
  {
    id: 'char-5-ducson',
    name: 'Thiếu Dực Sơn',
    avatarUrl: 'https://i.ibb.co/p6zRrrj4/media-1787368273.png',
    roleTag: 'Cổ trang',
    tags: ['Cổ trang', 'Ngọt', 'user xuyên không', 'char yêu thầm', 'trung quốc'],
    tagline: '',
    robuxDonations: 0,
    personality: '',
    plotTitle: '',
    plotSummary: 'Nàng vừa khen ta…đẹp trai vãi ò? Đó là phương ngữ vùng nào?...Bỏ đi, đừng nhìn ta nữa. Uống thuốc!',
    fullPlot: '',
    sampleDialogue: [],
    playUrl: 'https://aistudio.google.com/app/prompts?state=%7B%22ids%22%3A%5B%221c9Rrxb2xjj6Rb3dI1-B6rcb6-bDqflVy%22%5D%2C%22action%22%3A%22open%22%2C%22userId%22%3A%22102834450421569886676%22%2C%22resourceKeys%22%3A%7B%7D%7D&usp=drive_link',
    plotUrl: 'https://rentry.org/ducson_choirobloxkhum',
    voiceUrl: 'https://res.cloudinary.com/ygmarp6t/video/upload/v1787312199/ElevenLabs_2026-08-20T15_54_20_Xinghe_Jiang_-_Magnetic_Conversational_pvc_sp110_s50_sb75_v3.mp3',
    createdAt: now - 4000,
  },
  {
    id: 'char-6-kenji',
    name: 'Kenji Aranaka',
    avatarUrl: 'https://i.ibb.co/391gm1bd/media-1787358159.png',
    roleTag: 'Khác',
    tags: ['Khác', 'plot ẩn', 'char sát thủ', 'thời minh trị'],
    tagline: '',
    robuxDonations: 0,
    personality: '',
    plotTitle: '',
    plotSummary: 'Hime-sama à, cô ho to quá, cá ngoài biển cũng không ngủ được kìa.',
    fullPlot: '',
    sampleDialogue: [],
    playUrl: 'https://aistudio.google.com/app/prompts?state=%7B%22ids%22:%5B%221NTCZy8Ux7oA0-sqgrvLjDEeQ0Ju5Dou5%22%5D,%22action%22:%22open%22,%22userId%22:%22102834450421569886676%22,%22resourceKeys%22:%7B%7D%7D&usp=sharing',
    plotUrl: 'https://rentry.org/kenji_choirobloxkhum',
    voiceUrl: 'https://res.cloudinary.com/ygmarp6t/video/upload/v1787311945/ElevenLabs_2026-08-20T16_28_52_Xinghe_Jiang_-_Magnetic_Conversational_pvc_sp110_s50_sb75_v3_1.mp3',
    createdAt: now - 5000,
    isLinkLocked: true,
  },
  {
    id: 'char-7-james',
    name: 'James Rodriguez',
    avatarUrl: 'https://i.ibb.co/B5v8wxGR/media-1787368652-1.png',
    roleTag: 'Hiện đại',
    tags: ['Hiện đại', 'Ngọt', 'đời thường', 'green flag', 'latino'],
    tagline: '',
    robuxDonations: 0,
    personality: '',
    plotTitle: '',
    plotSummary: 'Como decía mi abuelo: ‘el amor es el único juicio donde el corazón siempre tiên la razón’',
    fullPlot: '',
    sampleDialogue: [],
    playUrl: 'https://aistudio.google.com/app/prompts?state=%7B%22ids%22:%5B%221nRbdYmIfCqWJYC9zKn1kYeqJgh7gfdJA%22%5D,%22action%22:%22open%22,%22userId%22:%22102834450421569886676%22,%22resourceKeys%22:%7B%7D%7D&usp=sharing',
    plotUrl: 'https://rentry.org/james_choirobloxkhum',
    voiceUrl: 'https://res.cloudinary.com/ygmarp6t/video/upload/v1787324849/ElevenLabs_2026-08-21T15_04_24_Elomi_pvc_sp95_s30_sb75_v3_1.mp3',
    createdAt: now - 6000,
    isLinkLocked: true,
  },
  {
    id: 'char-8-votran',
    name: 'Tạ Vô Trần',
    avatarUrl: 'https://i.ibb.co/ynZJCxm4/media-1787359430-1.png',
    roleTag: 'Ngược',
    tags: ['Ngược', 'bl', 'char đã có vợ', 'côn trùng', 'yandere', 'dân quốc'],
    tagline: '',
    robuxDonations: 0,
    personality: '',
    plotTitle: '',
    plotSummary: 'Em xinh đẹp nhất là khi không thể cựa quậy. Đừng sợ, kim của anh bén lắm, sẽ không đau lâu đâu…',
    fullPlot: '',
    sampleDialogue: [],
    playUrl: 'https://aistudio.google.com/app/prompts?state=%7B%22ids%22:%5B%221VYLhQmuLQfZ0ZNPFI0ZOr0Ii7NBn0Ry_%22%5D,%22action%22:%22open%22,%22userId%22:%22109731245535774144208%22,%22resourceKeys%22:%7B%7D%7D&usp=sharing',
    plotUrl: 'https://rentry.org/votran_choirobloxkhum',
    voiceUrl: 'https://res.cloudinary.com/ygmarp6t/video/upload/v1787311691/ElevenLabs_2026-08-21T10_33_31_Xinghe_Jiang_-_Magnetic_Conversational_pvc_sp110_s50_sb75_v3.mp3',
    createdAt: now - 7000,
    isLinkLocked: true,
  },
  {
    id: 'char-9-nolan',
    name: 'Nolan Wilson',
    avatarUrl: 'https://i.ibb.co/chj1SZBk/media-1787361799.png',
    roleTag: 'Hiện đại',
    tags: ['Hiện đại', 'char lừa dối', 'khác biệt giai cấp', 'cotswolds'],
    tagline: '',
    robuxDonations: 0,
    personality: '',
    plotTitle: '',
    plotSummary: 'Anh yêu em bằng tất cả những gì anh có - trừ sự thật',
    fullPlot: '',
    sampleDialogue: [],
    playUrl: 'https://aistudio.google.com/app/prompts?state=%7B%22ids%22:%5B%2214r-oxfF3PLgigCgxZcPHYivKVKwiUW_d%22%5D,%22action%22:%22open%22,%22userId%22:%22102834450421569886676%22,%22resourceKeys%22:%7B%7D%7D',
    plotUrl: 'https://rentry.org/nolan_choirobloxkhum',
    voiceUrl: 'https://res.cloudinary.com/ygmarp6t/video/upload/v1787311889/ElevenLabs_2026-08-21T05_00_02_Oliver_-_Clean_British_and_Steady_pvc_sp100_s100_sb100_v3.mp3',
    createdAt: now - 8000,
    isLinkLocked: true,
  },
];

const ROBUX_DONATIONS_KEY = 'roblox_rp_character_robux_donations_v13_reset_zero';

// Helper to get total Robux map per character from permanent storage
export function getStoredRobuxMap(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  const map: Record<string, number> = {};

  try {
    const raw = localStorage.getItem(ROBUX_DONATIONS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        Object.keys(parsed).forEach((k) => {
          if (typeof parsed[k] === 'number') {
            map[k] = Math.max(0, parsed[k]);
          }
        });
      }
    }
  } catch {
    // ignore
  }

  return map;
}

export function getStoredRPCharacters(): RPCharacter[] {
  const robuxMap = getStoredRobuxMap();
  return INITIAL_RP_CHARACTERS.map((initialChar) => {
    const savedAmount = robuxMap[initialChar.id];
    return {
      ...initialChar,
      robuxDonations: typeof savedAmount === 'number' ? savedAmount : 0,
    };
  });
}

export function saveStoredRPCharacters(chars: RPCharacter[]) {
  if (typeof window === 'undefined') return;
  try {
    const map: Record<string, number> = {};
    chars.forEach((c) => {
      if (c && c.id) {
        map[c.id] = c.robuxDonations || 0;
      }
    });
    localStorage.setItem(ROBUX_DONATIONS_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

export function saveSingleCharacterDonation(characterId: string, addedAmount: number = 1): number {
  if (typeof window === 'undefined') return 0;
  try {
    const map = getStoredRobuxMap();
    const current = map[characterId] || 0;
    const newTotal = current + addedAmount;
    map[characterId] = newTotal;
    localStorage.setItem(ROBUX_DONATIONS_KEY, JSON.stringify(map));
    return newTotal;
  } catch {
    return 0;
  }
}

export function resetAllRobuxToZeroPermanent() {
  if (typeof window === 'undefined') return;
  try {
    const emptyMap: Record<string, number> = {};
    INITIAL_RP_CHARACTERS.forEach((c) => {
      emptyMap[c.id] = 0;
    });
    localStorage.setItem(ROBUX_DONATIONS_KEY, JSON.stringify(emptyMap));
  } catch {
    // ignore
  }
}

