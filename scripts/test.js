#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { finished } = require('stream');

const ROOT_PATH = path.join(__dirname, '..')
const SUMMARY_PATH = path.join(ROOT_PATH, 'SUMMARY.md')

const currWorkSchedule = 1
const schedule = {
  1: { finished: 6, updated: '2024-9-12' },
  2: { finished: 0 }
}

const utils = {
  checkAndCreateFile: file => {
    if (fs.existsSync(file)) {
      console.log(`- 文件 ${file} 已存在`)
      return true
    }
    console.log(`- 文件：${file} 不存在，创建...`)
    fs.writeFileSync(file, '', err => {
      console.error(`[Err] Create file: ${file} fail:`, err)
      process.exit(1)
    })
    return false
  },

  checkAndCreateDir: dir => {
    if (!fs.existsSync(dir)) {
      console.log(`+ 目录：${dir} 不存在，创建...`)
      fs.mkdirSync(dir, { recursive: true }, err => {
        console.error(`[Err] Create dir: ${dir} fail:`, err)
        process.exit(1)
      })
      return false
    }

    console.log(`- 目录：${dir} 已存在`)
    return true
  },

  numberToChinese: num => {
    num = parseInt(num)
    const units = ['', '十', '百', '千', '万', '十万', '百万', '千万', '亿'];
    const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];

    // 特殊处理 0
    if (num === 0) return '零';

    let numStr = num.toString();
    let result = '';
    let len = numStr.length;

    for (let i = 0; i < len; i++) {
      let n = parseInt(numStr[i]);
      let unit = units[len - i - 1];

      // 处理零的特殊情况
      if (n === 0) {
        // 防止多个连续的零，只保留一个零
        if (!result.endsWith('零') && i !== len - 1) {
          result += digits[n];
        }
      } else {
        result += digits[n] + unit;
      }
    }

    // 特殊处理“十”，如 12 应该输出 "十二" 而不是 "一十二"
    result = result.replace(/^一十/, '十');

    // 去掉末尾的零
    result = result.replace(/零+$/, '');

    return result;
  },

  // level: 0 1 2
  genSummary: (title, link, level) => {
    switch (level) {
      case 0:
        return `* [${title}](${link})\n`
      case 1:
        return `  * [${title}](${link})\n`
      case 2:
        return `    * [${title}](${link})\n`
      default:
        return ''
    }
  },

  genNumberedArticle: (num, article) => {
    return `${String(num).padStart(3, '0')}_${article}`
  },

  // numToStr(12, 3) => '012'
  // numToStr(3, 2) => '03
  numToStr: (num, pad) => {
    return String(num).padStart(pad, '0')
  }
}

/* ============================ CONTENT ============================ */
/*
本书结构：
  - Scroll [X]
    - Chapter [X]（仅5、6、9卷分章节）
        - Article [X]
*/
const SCROLL_COUNT = 32

const SCROLL_NAMES = {
  0: '序',
  1: '七佛',
  2: '应化圣贤',
  3: '西天祖师',
  4: '东土祖师',
  5: '﹝无﹞',
  6: '﹝无﹞',
  7: '未详法嗣',
  8: '六祖下第三世上',
  9: '六祖下第三世下',
  10: '六祖下第四世',
  11: '六祖下第四世',
  12: '六祖下第四世',
  13: '六祖下第五世',
  14: '六祖下第五世',
  15: '六祖下第五世',
  16: '六祖下第六世',
  17: '六祖下第六世',
  18: '六祖下第六世',
  19: '六祖下第七世',
  20: '六祖下第七世',
  21: '六祖下第八世',
  22: '六祖下第九世',
  23: '六祖下第十世',
  24: '六祖下第十一世',
  25: '六祖下第十二世',
  26: '六祖下第十三世上',
  27: '六祖下第十三世下',
  28: '六祖下第十四世',
  29: '六祖下第十五世',
  30: '六祖下第十六世',
  31: '六祖下第十六世',
  32: '六祖下第十六世'
}

const CHAPTERS = {
  5: ['六祖下第一世', '六祖下第二世'],
  6: ['二祖旁出法嗣', '四祖旁出法嗣', '五祖旁出法嗣', '六祖旁出法嗣'],
  9: ['六祖下第三世下', '南岳青原宗派未定法嗣'],
}

const ARTICLE_TITLES = {
  0: ['出版社简介', '水月斋指月录原序'],
  1: ['毗婆尸佛', '尸弃佛', '毗舍浮佛', '拘留孙佛', '拘那含牟尼佛', '迦叶佛', '释迦牟尼佛', '附、诸师拈颂诸经语句'],
  2: ["文殊菩萨", "天亲菩萨", "维摩会上", "善财", "须菩提尊者", "无厌足王", "舍利弗尊者", "鸯崛魔罗尊者", "宾头卢尊者", "障蔽魔王", "那吒太子", "广额屠儿", "秦跋陀禅师", "金陵宝志禅师", "双林善慧大士", "南岳慧思禅师", "天台山修禅寺智者禅师", "泗州僧伽大师", "天台丰干禅师", "寒山子", "拾得者", "明州奉化县布袋和尚", "法华志言大士", "扣冰澡先古佛", "千岁宝掌和尚", "懒残", "法顺大师", "清凉澄观国师"],
  3: ['一祖摩诃迦叶尊者', '二祖阿难尊者', '三祖商那和修尊者', '四祖优波鞠多尊者', '五祖提多迦尊者', '六祖弥遮迦尊者', '七祖婆须蜜尊者', '八祖佛陀难提尊者', '九祖伏驮蜜多尊者', '十祖胁尊者', '十一祖富那夜奢尊者', '十二祖马鸣大士者', '十三祖迦毗摩罗尊者', '十四祖龙树尊者', '十五祖迦那提婆尊者', '十六祖罗睺罗多尊者', '十七祖僧伽难提尊者', '十八祖伽耶舍多尊者', '十九祖鸠摩罗多尊者', '二十祖闭夜多尊者', '二十一祖婆修盘头尊者', '二十二祖摩孥罗尊者', '二十三祖鹤勒那尊者', '二十四祖师子比丘尊者', '二十五祖婆舍斯多尊者', '二十六祖不如蜜多尊者', '二十七祖般若多罗尊者'],
  4: ['初祖菩提达磨大师', '二祖慧可大祖大师', '三祖僧璨鉴智大师', '四祖道信大医禅师', '五祖弘忍大满禅师', '六祖慧能大鉴禅师'],
  5: [['南岳怀让禅师', '青原行思禅师'], ['江西道一禅师', '南岳石头希迁禅师']],
  6: [['僧那禅师', '向居士'], ['牛头山法融禅师', '牛头山智岩禅师', '牛头山智威禅师', '安国玄挺禅师', '天柱崇慧禅师', '径山道钦禅师', '天台云居智禅师', '鸟窠道林禅师'], ['嵩岳慧安国师', '寿州道树禅师', '嵩岳破灶堕和尚', '嵩岳元圭禅师', '终南惟政禅师', '嵩山峻极和尚'], ['司空山本净禅师', '南阳慧忠国师', '永嘉玄觉禅师', '西京荷泽神会禅师', '圭峰宗密禅师']],
  7: ['泗州塔头侍者', '或问僧', '有道流在佛殿前坐背', '台州六通院僧', '圣僧像被屋漏滴', '死鱼浮于水上', '江南相冯延巳', '有施主妇人入院', '偃台感山主', '有僧入冥见地藏菩萨', '鹞子趁鸽子', '官人问僧', '广南有僧住庵', '僧问圆通和尚', '有僧与童子上经了', '先净照禅师问楞严大师', '有僧到曹溪', '昔高丽国来钱塘', '有人问僧', '有官人', '老宿有偈日', '有僧持钵到长者家', '宋太宗幸相国寺', '茶陵郁山主', '唐朝因禅师', '楼子和尚', '神照本如法师', '临安府上竺圆智证悟法师', '公期和尚', '福州山东云顶禅师', '昔有一老宿', '昔有二庵主', '昔有一老宿', '昔有一老宿', '昔有婆子', '昔有婆子临斋', '昔有跨驴人', '肇法师在姚秦', '双溪布衲如禅师', '处州法海立禅师', '幽栖禅师', '魏府老洞华严', '太瘤蜀僧', '欧阳文忠公', '盐官会下', '昔有官人', '昔有古德', '昔有外道', '唐僧元晓者', '唐修雅法师', '僧文通慧者'],
  8: ['洪州百丈山怀海禅师', '池州南泉普愿禅师'],
  9: [['盐官海昌院齐安国师', '庐山归宗寺智常禅师', '明州大梅山法常禅师', '池州鲁祖山宝云禅师', '泐潭常兴和尚', '泐潭法会禅师', '洛京佛光如满禅师', '五泄山灵默禅师', '幽州宝积禅师', '麻谷宝彻禅师', '东寺如会禅师', '西堂智藏禅师', '越州大珠慧海禅师', '杉山智坚禅师', '水潦和尚问马祖', '澧州苕溪道行禅师', '抚州石巩慧藏禅师', '袁州南源道明禅师', '中邑洪恩禅师', '潭州三角山总印禅师', '汾州无业禅师', '信州鹅湖大义禅师', '京兆兴善惟宽禅师', '常州芙蓉太毓禅师', '利山和尚', '松山和尚', '唐州紫玉山道通禅师', '五台山隐峰禅师', '龟洋无了禅师', '南岳西园昙藏禅师', '磁州马头峰神藏禅师', '潭州华林善觉禅师', '乌臼和尚', '石臼和尚', '镇州金牛和尚', '亮座主', '百灵和尚', '则川和尚', '忻州打地和尚', '潭州秀溪和尚', '江西椑树和尚', '浮杯和尚', '潭州龙山和尚', '漾溪和尚', '襄州居士庞蕴者', '澧州药山惟俨禅师', '邓州丹霞天然禅师', '潭州大川禅师', '潮州灵山大颠宝通禅师', '潭州长髭旷禅师', '潭州招提寺慧朗禅师', '长沙兴国寺振朗禅师', '汾州石楼禅师', '凤翔府法门寺佛陀禅师', '澧州大同济禅师'], ['荆州天皇道悟禅师', '天王道悟禅师']],
  10: ['洪州黄檗希运禅师'],
  11: ['福州长庆大安禅师', '福州古灵神赞禅师', '大慈寰中禅师', '天台平田普岸禅师', '瑞州五峰常观禅师', '潭州石霜山性空禅师', '广州和安寺通禅师', '洪州东山慧禅师', '百丈山涅槃和尚', '赵州观音院真际从谂禅师', '湖南长沙景岑招贤禅师', '鄂州茱萸山和尚', '衢州子湖岩利踪禅师', '荆南白马昙照禅师', '终南山云际师祖禅师', '邓州香严下堂义端禅师', '池州灵鷲闲禅师', '日子和尚', '苏州西禅和尚', '池州甘贽行者', '洪州双岭玄真禅师', '福州芙蓉山灵训禅师', '汉南高亭和尚', '新罗大茅和尚', '五台山智通禅师', '镇州普化和尚者', '寿州良遂禅师', '虔州处微禅师', '金州操禅师', '湖南上林戒灵禅师', '五台山秘魔岩和尚', '湖南祇林和尚'],
  12: ['潭州沩山灵祐禅师', '潭州道吾山宗智禅师', '潭州云岩昙晟禅师', '秀州华亭船子德诚禅师', '宣州椑树慧省禅师', '鄂州百岩明哲禅师', '澧州高沙弥', '京兆府翠微无学禅师', '吉州孝义寺性空禅师', '仙天禅师', '漳州三平义忠禅师', '马颊山本空禅师', '本生禅师', '潭州石室善道禅师', '澧州龙潭崇信禅师'],
  13: ['陈睦州尊宿', '福州乌石山灵观禅师', '益州大随法真禅师', '福州灵云志勤禅师', '洪州新兴严阳尊者', '扬州光孝院慧觉禅师', '婺州木陈从朗禅师', '婺州新建禅师', '杭州多福和尚', '益州西睦和尚', '明州雪窦常通禅师', '石梯和尚', '紫桐和尚', '日容远和尚', '襄州关南道吾和尚', '漳州罗汉和尚', '瑞州未山尼了然禅师', '婺州金华山俱胝和尚', '袁州仰山慧寂通智禅师', '邓州香严智闲禅师', '杭州径山洪诬禅师', '滁州定山神英禅师', '京兆府米和尚', '元康和尚', '襄州王敬初常侍', '郑十三娘'],
  14: ['镇州临济义玄禅师'],
  15: ['潭州石霜山庆诸禅师', '潭州渐源仲兴禅师', '僧密禅师', '澧州夹山善会禅师', '舒州投子山大同禅师', '鄂州清平山安乐院令遵禅师', '鼎州德山宣鉴禅师'],
  16: ['瑞州洞山良价悟本禅师'],
  17: ['睦州刺史陈操尚书', '袁州仰山南塔光涌禅师', '杭州无著文喜禅师', '福州双峰古禅师', '魏府兴化存奖禅师', '魏府大觉和尚', '镇州宝寿沼禅师', '镇州三圣院慧然禅师', '定州善崔禅师', '幽州谈空和尚', '虎溪庵主', '覆盆庵主', '桐峰庵主', '杉洋庵主', '定上座', '奯上座', '瑞州九峰道虔禅师', '台州涌泉景欣禅师', '邵武军龙湖普闻禅师', '潭州云盖山志元圆净禅师', '凤翔府石柱禅师', '张拙秀才', '澧州洛浦山元安禅师', '抚州黄山月轮禅师', '洛京韶山普寰禅师', '郓州四禅禅师', '凤翔府天盖山幽禅师', '鄂州岩头全轰禅师', '福州雪峰义存禅师', '泉州瓦棺和尚', '襄州高亭简禅师'],
  18: ['抚州曹山本寂禅师', '洪州云居道膺禅师', '抚州疏山匡仁禅师', '青林师虔禅师', '高安白水本仁禅师', '潭州龙牙山居遁证空禅师', '益州北院通禅师', '京兆府蚬子和尚', '越州乾峰和尚', '澧州钦山文邃禅师', '瑞州九峰通玄禅师'],
  19: ['吉州资福如宝禅师', '郢州芭蕉山慧清禅师', '汝州南院慧颙禅师', '守廓侍者', '汝州西院思明禅师', '宝寿和尚第二世', '洪州凤栖同安院常察禅师', '吉州禾山无殷禅师', '凤翔府青峰传楚禅师', '袁州木平山善道禅师', '郢州桐泉山禅师', '台州瑞岩师彦禅师', '福州罗山道闲禅师', '福州玄沙师备宗一禅师', '福州长庆慧棱禅师', '漳州保福院从展禅师', '福州鼓山神宴兴圣国师', '龙华照布衲', '明州翠岩令参永明禅师', '越州镜清寺道愆顺德禅师', '报恩怀岳禅师', '安国弘瑁襌师', '长生山皎然禅师', '越山师鼐禅师', '太原孚上座'],
  20: ['抚州金峰从志禅师', '处州广利容禅师', '洪州凤栖山同安丕禅师', '杭州佛日本空禅师', '池州稽山章禅师', '朱溪谦禅师', '南康军云居道简禅师', '护国守澄禅师', '黄檗山薏禅师', '伏龙山奉璘禅师', '襄州石门献蕴禅师', '京兆府重云智晖禅师', '杭州瑞龙院幼璋禅师', '报慈藏屿禅师', '韶州云门山光奉院文偃禅师'],
  21: ['吉州资福贞邃禅师', '郢州芭蕉山继彻禅师', '彭州承天院辞确禅师', '汝州风穴延沼禅师', '颖桥安禅师号铁胡', '郢州兴阳归静禅师', '鄂州黄龙山诲机超慧禅师', '婺州明招德谦禅师', '漳州罗汉院桂琛禅师', '安国慧球禅师', '福州大章山契如庵主', '天台国清寺师静上座', '泉州招庆院道匡禅师', '襄州鹫岭明远禅师', '太傅王延彬居士', '谷山行崇禅师', '漳州报恩院道熙禅师', '招庆省僵禅师', '鼓山智岳禅师', '报国照禅师', '衢州乌巨山仪晏开明禅师', '福州林阳瑞峰院志端禅师', '保福清豁禅师', '四祖山清皎禅师', '大龙智洪禅师', '同安志禅师', '庐山佛手岩行因禅师', '泉州龟洋慧忠禅师', '襄州广德义禅师', '襄州广德周禅师', '石门慧彻禅师', '益州青城香林院澄远禅师', '韶州白云子祥禅师', '鼎州德山缘密禅师', '岳州巴陵新开院颢鉴禅师', '随州双泉山师宽明教禅师', '襄州洞山守初宗慧禅师', '金陵奉先深禅师', '韶州双峰竟钦禅师', '洞山清禀禅师', '北禅寂禅师', '云门山朗上座'],
  22: ['汝州首山省念禅师', '广慧真禅师', '黑水和尚', '枣树第二世和尚', '吕岩真人', '襄州清溪山洪进禅师', '升州清凉院休复悟空禅师', '抚州龙济绍修禅师', '酒仙遇贤禅师', '鼎州梁山缘观禅师', '怀安军云顶德敷禅师', '随州智门光祚禅师', '韶州大历和尚', '连州宝华和尚', '蔪州五祖师戒禅师', '荆南福昌惟善禅师', '莲花峰祥庵主', '蓝田县真禅师', '金陵清凉院文益禅师'],
  23: ['汾州太子院善昭禅师', '并州承天院三交智嵩禅师', '汝州叶县广教院归省禅师', '潭州神鼎洪评禅师', '襄州谷隐山蘊聪慈照禅师', '汝州广慧院元琏禅师', '铁佛院智嵩禅师', '仁王院处评禅师', '智门罕迥禅师', '丞相王随居士', '庐州圆通缘德禅师', '郢州大阳山警玄禅师', '明州雪窦重显禅师', '瑞州洞山晓聪禅师', '洞山自宝禅师', '潭州北禅智贤禅师', '南安岩自严尊者', '天台山德韶国师', '金陵清凉泰钦法灯禅师', '杭州灵隐清耸禅师', '洪州百丈道恒禅师', '永明道潜禅师', '杭州报恩慧明禅师', '云居清锡禅师', '漳州罗汉智依禅师', '金陵报慈文邃禅师', '金陵报恩院玄则禅师', '归宗策真禅师', '同安绍显禅师', '观音从显禅师', '洛京兴善栖伦禅师', '古贤院谨禅师'],
  24: ['潭州石霜楚圆慈明禅师', '滁州琅邪山慧觉广照禅师', '瑞州大愚山守芝禅师', '舒州法华院全举禅师', '南岳芭蕉庵大道谷泉禅师', '安吉州天圣皓泰禅师', '舒州浮山法远圆鉴禅师', '润州金山昙颖达观禅师', '唐州大乘山德遵禅师', '景清居素禅师', '驸马李遵勖居士', '东京华严道隆禅师', '文公杨亿居士', '舒州投子义青禅师', '郢州兴阳清剖禅师', '惠州罗浮山显如禅师', '越州天衣义怀禅师', '宗道者', '修撰曾会居士', '南康军云居晓舜禅师', '杭州佛日契嵩禅师', '太守许式', '荆门军玉泉承皓禅师', '明州育王山怀琏大觉禅师', '庐山圆通居讷禅师', '潭州兴化绍铣禅师', '洪州法昌倚遇禅师', '南康军云居山了元佛印禅师', '杭州慧日永明延寿智觉禅师', '杭州五云山华严院志逢禅师', '杭州报恩永安禅师', '温州瑞鹿寺上方遇安禅师', '温州瑞鹿寺本先禅师', '温州雁荡愿齐禅师', '杭州兴教洪寿禅师', '洪州云居道齐禅师', '庐山栖贤澄湜禅师'],
  25: ['隆兴府黄龙慧南禅师', '袁州杨岐方会禅师', '洪州翠岩可真禅师', '金陵蒋山赞元禅师', '洪州大宁道宽禅师', '潭州道吾悟真禅师', '苏州定慧超信禅师', '越州姜山方禅师', '宣州兴教院坦禅师', '江州归宗可宣禅师', '秀州长水子璇讲师', '南岳云峰文悦禅师', '安吉州西余端师子', '东京天宁芙蓉道楷禅师', '随州大洪山报恩禅师', '东京慧林宗本圆照禅师', '东京法云寺法秀禅师', '延恩法安禅师', '礼部杨杰居士', '金陵蒋山法泉禅师', '明州大梅法英禅师', '邢州开元法明上座', '签判刘经臣居士', '杭州净土院惟政禅师'],
  26: ['隆兴府黄龙祖心晦堂宝觉禅师', '隆兴府宝峰克文云庵真净禅师', '潭州云盖守智禅师', '吉州隆庆院庆闲禅师'],
  27: ['隆与府泐潭洪英禅师', '袁州仰山行伟禅师', '黄龙恭首座', '安吉州报本慧元禅师', '景福顺禅师', '黄檗积翠永庵主', '延庆洪准禅师', '舒州白云守端禅师', '金陵保宁仁勇禅师', '比部孙居士', '潭州大沩慕喆真如禅师', '福州圣泉绍灯禅师', '邓州丹霞子淳禅师', '洪州宝峰阐提惟照禅师', '襄州石门元易禅师', '东京净因自觉禅师', '东京法云善本大通禅师', '投子修题禅师', '清献公赵排'],
  28: ['隆兴府黄龙死心悟新禅师', '隆兴府黄龙灵源惟清禅师', '龙兴府泐潭草堂善清禅师', '吉州青原惟信禅师', '漳州保福本权禅师', '太史山谷居士黄庭坚', '秘书吴恂居士', '隆兴府兜率从悦禅师', '东京法云佛照杲禅师', '隆兴府泐潭湛堂文准禅师', '瑞州清凉慧洪觉范禅师', '南岳石头怀志庵主', '庐山罗汉院系南禅师', '信州永丰慧日庵主', '泉州尊胜有朋讲师', '庆元府育王无竭净昙禅师', '蕲州五祖法演禅师', '提刑郭祥正', '安吉州上方日益禅师', '赣州显首座', '洪州泐潭景祥禅师', '和州光孝慧兰禅师', '真州长芦真歇清了禅师', '明州天童宏智正觉禅师', '江州圆通德止禅师', '衡州华药智朋禅师', '吉州青原齐禅师', '天台山如庵主', '平江府西竺寺尼法海禅师', '东京慧林怀深慈受禅师', '平江府万寿如瓒证悟禅师', '越州天衣如哲禅师', '大觉法庆禅师', '临安府广福院惟尚禅师'],
  29: ['吉州禾山超宗慧方禅师', '嘉兴府华亭性空妙普庵主', '空室道人智通者', '潭州上封佛心才禅师', '潭州法轮应端禅师', '东京天宁长灵守卓禅师', '隆兴府黄龙山堂道震禅师', '庆元府天童普交禅师', '江州圆通道旻禅师', '庆元府二灵知和庵主', '绍兴府慈氏瑞仙禅师', '丞相张商英居士', '西蜀銮法师', '隆兴府云岩天游典牛禅师', '法清祖鉴禅师', '眉州中岩慧目蕴能禅师', '怀安军云顶宝觉宗印禅师', '成都府信相宗显正觉禅师', '成都府昭觉寺克勤佛果禅师', '舒州太平慧勤佛鉴禅师', '舒州龙门清远佛眼禅师', '彭州大随南堂元静禅师', '汉州无为宗泰禅师', '蕲州五祖表自禅师', '嘉州九顶清素禅师', '元礼首座', '法閟上座', '金陵俞道婆', '东京净因继成禅师', '建宁府开善道琼首座', '杭州净慈慧晖禅师', '明州瑞岩法恭禅师', '舒州投子道宣禅师'],
  30: ['嘉兴府报恩法常首座', '左丞范冲居士', '临安府径山涂毒智策禅师', '平江府虎丘绍隆禅师', '庆元府育王端裕禅师', '台州护国景元禅师', '平江府南峰云辩禅师', '临安府灵隐慧远禅师', '建康府华藏安民禅师', '成都府昭觉道元禅师', '潭州大沩佛性法泰禅火', '眉州象耳山袁觉禅师', '临安府中天竺中仁禅火', '眉州中岩华严祖觉禅', '平江府明因昙玩禅师', '成都府昭觉道祖首座', '枢密徐俯', '郡王赵令衿', '侍郎李弥远普现居士', '成都范县君', '常德府文殊心道禅师', '潭州龙牙智才禅师', '安吉州何山佛灯守珣禅师', '温州龙翔士珪禅师', '南康军云居善悟禅师', '隆兴府黄龙法忠禅师', '衢州乌巨道行禅师', '南康军云居法如禅师', '南康军归宗正贤禅师', '安吉州道场明辩禅师', '世奇首座', '给事冯楫济川居士', '台州钓鱼台石头自回禅师', '常德府梁山师远禅师', '莫将尚书', '龙图王萧居士', '无为军冶父道川禅师'],
  31: ['临安府径山宗杲大慧普觉禅师语要上'],
  32: ['临安府径山宗杲大慧普觉禅师语要下']
}

function genFilesAndSummary() {
  let articleCount = 0
  let summary_temp = '# SUMMARY\n\n'

  for (let id = 0; id <= SCROLL_COUNT; id++) {
    let name = SCROLL_NAMES[id]
    let articles = ARTICLE_TITLES[id]

    let scrollLink = `book/scroll_${utils.numToStr(id, 2)}`
    let dir = path.join(ROOT_PATH, scrollLink)
    utils.checkAndCreateDir(dir)

    let scrollTitle = `卷${utils.numberToChinese(id)}·${name}`
    if (id === 0) {
      scrollTitle = name
    }
    summary_temp += utils.genSummary(scrollTitle, scrollLink, 0)

    if (id === 0) {
      for (let article of articles) {
        let link = `${scrollLink}/${article}.md`
        if (article == '水月斋指月录原序') {
          link = `${scrollLink}/${utils.genNumberedArticle(0, article)}.md`
        }

        let filepath = path.join(ROOT_PATH, link)
        utils.checkAndCreateFile(filepath)
        summary_temp += utils.genSummary(article, link, 1)
      }

      summary_temp += '\n'
      continue
    }

    let scroll_chapters = CHAPTERS[id]
    if (scroll_chapters) { // 包含子章节
      for (let i = 0; i < scroll_chapters.length; i++) {
        let chapter = scroll_chapters[i]
        let chapterTitle = `chapter_${utils.numToStr(i + 1, 2)}_${chapter}`
        let sublink = `${scrollLink}/${chapterTitle}`
        let subdir = path.join(dir, chapterTitle)
        utils.checkAndCreateDir(subdir)
        summary_temp += utils.genSummary(chapter, sublink, 1)

        if (scroll_chapters.length !== articles.length) {
          console.error(`scroll_${id}|${name} chapter length not match article`)
          process.exit(2)
        }

        let sub_articles = articles[i]
        for (let j = 0; j < sub_articles.length; j++) {
          articleCount++
          let article = sub_articles[j]
          let filename = utils.genNumberedArticle(articleCount, article)
          let articleLink = `${sublink}/${filename}.md`
          let articleFile = path.join(ROOT_PATH, articleLink)
          utils.checkAndCreateFile(articleFile)
          summary_temp += utils.genSummary(article, articleLink, 2)
        }

      }
    } else {
      for (let article of articles) {
        articleCount++
        let filename = utils.genNumberedArticle(articleCount, article)
        let articleLink = `${scrollLink}/${filename}.md`
        let articleFile = path.join(ROOT_PATH, articleLink)
        utils.checkAndCreateFile(articleFile)
        summary_temp += utils.genSummary(article, articleLink, 1)
      }
    }

    summary_temp += '\n'
  }

  fs.writeFileSync(SUMMARY_PATH, summary_temp)
}

// Status: ✖️ 🟢 ✅
function genReadmeSchedule() {
  let scheduleSection = '### Schedule\n---\n'

  // 状态
  scheduleSection += `\n> ✖️ 未开始\n`
  scheduleSection += `\n> 🟢 进行中\n`
  scheduleSection += `\n> ✅ 已完成\n\n`

  const totalFinish = function () {
    let count = 0
    for (let [i, v] of Object.entries(schedule)) {
      count += v.finished || 0
    }
    return count
  }()

  const totalArticle = function () {
    let count = 0
    for (let [i, v] of Object.entries(ARTICLE_TITLES)) {
      if (i == 0) { // 跳过序
        continue
      }
      const articles = v
      for (let article of articles) {
        if (Array.isArray(article)) {
          count += article.length
        } else {
          count++
        }
      }
    }
    return count
  }()

  scheduleSection += `\n #### 总进度：${totalFinish}/${totalArticle}\n\n`

  // 表头
  scheduleSection += `|卷|Progress|Status|Updated|\n`
  scheduleSection += `|---|---|---|---|\n`

  for (let [i, v] of Object.entries(SCROLL_NAMES)) {
    if (i == 0) { // 跳过序
      continue
    }

    const scrollName = utils.numberToChinese(i)
    const articleCount = function () {
      let count = 0
      const articles = ARTICLE_TITLES[i]
      for (let article of articles) {
        if (Array.isArray(article)) {
          count += article.length
        } else {
          count++
        }
      }
      return count
    }()

    let currSchedule = schedule[i] || { finished: 0 }
    const status = function () {
      if (currSchedule.finished === articleCount) {
        return '✅'
      } else if (currWorkSchedule == i) {
        return '🟢'
      } else {
        return '✖️'
      }
    }()
    const updated = currSchedule.updated || '-'
    scheduleSection += `|卷${scrollName}|${currSchedule.finished}/${articleCount}|${status}|${updated}|\n`
  }

  scheduleSection += '\n'

  const readmePath = path.join(ROOT_PATH, 'README.md')
  let fileContent = fs.readFileSync(readmePath, 'utf8');
  fileContent = fileContent.replace(/### Schedule[\s\S]*?### Book Log/, `${scheduleSection}\n### Book Log`);
  fs.writeFileSync(readmePath, fileContent, 'utf8');
}

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function (file) {
    const filePath = path.join(dirPath, file);

    if (fs.statSync(filePath).isDirectory()) {
      // 递归处理子文件夹
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else {
      // 添加文件路径
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

class Article {
  constructor() {
    this.desc = ''
    this.paras = []
  }

  print() {
    let str = `- DESC: ${this.desc}\n\n`
    for (let [i, para] of this.paras.entries()) {
      str += `- PARA-${i}:\n${para.toString()}\n`
    }
    return str
  }

  toLine() {
    let str = ``
    if (this.desc.length > 0) {
      str += `---\ndescription: ${this.desc}\n---\n`
    }

    for (let [i, para] of this.paras.entries()) {
      if (para.title1.length > 0) {
        str += `\n### ${para.title1}\n`
      }

      for (const [j, line] of para.content.entries()) {
        str += `\n${line}\n`
      }
    }

    return str
  }
}

const FOMRAT_HEADS = [/^译：/, /^释：/, /^注：/, /^>/, /^注\d+/]; // 全部替换为正则表达式

function isFormatHead(line) {
  // 遍历正则表达式数组，并使用 test() 方法进行匹配
  for (let regex of FOMRAT_HEADS) {
    if (regex.test(line)) {
      return true;
    }
  }
  return false;
}


class Paragraph {
  constructor() {
    this.title1 = ''
    this.content = []
  }

  toString() {
    let str = `  + TITLE: ${this.title1}\n`
    for (let [i, p] of this.content.entries()) {
      str += `  + LINE:${i}  ${p}\n`
    }
    return str
  }
}

function formattingMD(filecontent) {
  const article = new Article()

  const lines = filecontent.split('\n')
  let i = 0
  let hasDesc = false

  for (; i < lines.length; i++) {
    let line = lines[i].trim()
    if (line.startsWith('---')) {
      hasDesc = true
      continue
    }

    if (line.startsWith('description:')) {
      article.desc = line.split(':')[1].trim()
      i += 2
      break
    }
  }

  if (!hasDesc) {
    i = 0
  }

  let para = new Paragraph()
  for (; i < lines.length; i++) {
    let line = lines[i].trim()
    if (line.length == 0) {
      if (i == lines.length - 1) {
        article.paras.push(para)
        para = new Paragraph()
      }
      continue
    }

    if (line.startsWith('###')) {
      if (para.content.length > 0) {
        article.paras.push(para)
        para = new Paragraph()
      }

      para.title1 = line.split(' ')[1]
      continue
    }

    if (isFormatHead(line)) {
      para.content.push(line)
      continue
    }

    line = `> ${line}`
    para.content.push(line)
  }

  if (para.content.length > 0) {
    article.paras.push(para)
  }

  console.log(article.paras)
  return article.toLine()
}

function formatMarkdown() {
  const files = getAllFiles(path.join(ROOT_PATH, 'book'))
  for (let filepath of files) {
    if (path.extname(filepath) !== '.md') {
      continue
    }

    let fileContent = fs.readFileSync(filepath, 'utf8');
    const formattedContent = formattingMD(fileContent)
    fs.writeFileSync(filepath, formattedContent, 'utf8')
  }
}

function testFunction() {
  // --- Single file test...
  const filepath = path.join(__dirname, '000_test.md')
  let fileContent = fs.readFileSync(filepath, 'utf8');
  const formattedContent = formattingMD(fileContent)
  fs.writeFileSync(filepath, formattedContent, 'utf8')
  // --- test end.
}

function main() {
  const tasks = {
    genFiles: false,
    genReadme: false,
    formatMarkdown: false,
    isTest: false
  }

  const args = (process.argv || []).slice(2)


  for (let arg of args) {
    switch (arg) {
      case '--test':
      case '-t':
        tasks.isTest = true
        break
      case '--gen-files':
      case '-g':
        tasks.genFiles = true
        break
      case '--gen-readme':
      case '-r':
      case '--update-schedule':
      case '-s':
        tasks.genReadme = true
        break
      case '--format-markdown':
      case '-f':
        tasks.formatMarkdown = true
      default:
        break
    }
  }

  if (tasks.isTest) testFunction()

  if (tasks.genFiles) genFilesAndSummary()

  if (tasks.genReadme) genReadmeSchedule()

  if (tasks.formatMarkdown) formatMarkdown()

}

main();