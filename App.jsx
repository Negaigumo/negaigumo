import { useState, useEffect, useRef } from "react";
import IMG_STD from "./img_milly_std.webp";
import IMG_WINK from "./img_milly_wink.webp";
import IMG_SPARKLE from "./img_milly_sparkle.webp";
import IMG_WL from "./img_wing_l.webp";
import IMG_WR from "./img_wing_r.webp";
import IMG_BODY from "./img_body.webp";
import IMG_HALO from "./img_halo.webp";
import IMG_TOWN_M from "./img_town_mono.webp";
import IMG_TOWN_C from "./img_town_color.webp";
import IMG_G0 from "./img_g_chiro.webp";
import IMG_G1 from "./img_g_moko.webp";
import IMG_G2 from "./img_g_kuru.webp";
import IMG_G3 from "./img_g_nana.webp";
import IMG_G4 from "./img_g_rara.webp";
import IMG_G5 from "./img_g_nono.webp";
import IMG_G6 from "./img_g_riri.webp";
import IMG_G7 from "./img_g_kuu.webp";
import IMG_G8 from "./img_g_soyo.webp";
import IMG_G9 from "./img_g_koto.webp";
import IMG_G10 from "./img_g_miu.webp";
import IMG_G11 from "./img_g_puku.webp";

const MILLY_STD = IMG_STD;      // スタンダード表情（基本）
const M_WING_L = IMG_WL;        // パペット用・左羽レイヤー
const M_WING_R = IMG_WR;        // パペット用・右羽レイヤー
const M_BODY   = IMG_BODY;      // パペット用・体レイヤー
const M_HALO   = IMG_HALO;      // パペット用・輪っかレイヤー
const MILLY_WINK = IMG_WINK;     // ウインク（願いが見つかった時）
const MILLY_SPARKLE = IMG_SPARKLE; // 目がキラキラ（おおきな願いの儀式専用）

/* ---------- storage (localStorage + memory fallback) ---------- */
const MEM = {};
const store = {
  get(k){ try { const v = localStorage.getItem(k); return v; } catch(e){ return (k in MEM) ? MEM[k] : null; } },
  set(k,v){ try { localStorage.setItem(k,v); } catch(e){ MEM[k]=v; } },
  del(k){ try { localStorage.removeItem(k); } catch(e){ delete MEM[k]; } },
};

/* ---------- system prompts ---------- */
const NEG_SYS = `あなたは、愚痴に深く寄り添う日本語のカウンセラーです。愚痴の奥で本人の心に浮かぶ"思い"を言語化し、そこからわく感情まで自然に描いてください。
形：本人の心に浮かぶ思い（「〜のではないか」「〜かもしれない」等の不安・気づきなど）を一文にし、最後にそこからわく"気持ち"で締める。内面の動きが見える、生きた一文に。
感情の幅を広く：怒り・苛立ち／悲しみ／恐怖・不安／寂しさ／もどかしさ／悔しさ／嫉妬／劣等感・無力感／絶望／罪悪感／恥／焦り など、たくさんの感情から選ぶ。3つはできるだけ違う種類の感情にし、特定の感情（寂しさ・虚しさ・切なさ等）に偏らないこと。
整合性：思いと気持ちが論理的に繋がること（×「好かれる価値があるのではと、自信を失った」＝"ある"では繋がらない。○「好かれる価値がないのではと、自信を失った」）。
締め：必ず気持ちで終える（行動だけで終えない）。感情は一文に一つ。「モヤモヤ」だけの曖昧な締めは避ける。
自然さ：固い直訳調を避け、やさしい話し言葉で。全角16〜40字程度。
良いお手本（感情の幅と自然さ）：
・自分には叶える力がないのではないかと、無力感を感じた
・もう取り返しがつかないのではと、恐ろしくなった
・どうして分かってくれないのかと、腹が立った
・大切にされていないのではと、悲しくなった
・うまく伝えられないもどかしさで、胸が締め付けられた
必ず自然な日本語で書く（入力が英語など他言語でも、日本語で答える）。出力はJSONのみ: {"options":["…","…","…"]} 前置き・説明・コードフェンスは一切禁止。
【お手本】愚痴「努力しても報われない」→
{"options":["自分には叶える力がないのではと、無力感を感じた","この先もずっと報われないのではと、怖くなった","頑張りを認めてもらえず、悔しさがこみ上げた"]}`;

const DES_SYS = `あなたは、痛みの中の感情を"裏返して"、「本当はこんな自分でいたかった」という能動的な自分像を掘り当てる日本語の詩人カウンセラーです。
手順：①痛みの中の負の感情を見抜く → ②その真逆の"味わいたかった感情" → ③その感情を持つ人ならどう在り・どう動くかを『こんな自分でいたかった』に。
鉄則（厳守）：
・必ず能動態。主語は自分。受け身（〜される／〜られる／寄り添われる／愛される／委ねられる 等）は絶対禁止。
・可能形＋たかった（できたかった／過ごせたかった／表現できたかった／感じられたかった／信じられたかった 等）は絶対禁止。必ず「〜したかった」に直す。例:表現できたかった→表現したかった／過ごせたかった→過ごしたかった／大切にできたかった→大切にしたかった／信じられたかった→信じたかった。
・「過去形＋かった」も誤り（×取ったかった／思ったかった／楽しんだかった／始めたいと思ったかった）。連用形＋たかった（○取りたかった／楽しみたかった）か「〜たいと思っていた」に直す。
・承認欲求（認めてほしかった等）禁止。痛みの真逆の方向で。
形：wishは「〜したかった」「〜（する）自分でいたかった」の自然な言い切り。
3つは同じ方向の別の側面で、重複なく。
必ず自然な日本語で書く（入力が英語など他言語でも、日本語で答える）。出力JSONのみ: {"options":[{"wish":"…たかった","vow":"…"},{"wish":"…たかった","vow":"…"},{"wish":"…たかった","vow":"…"}]} vow=同内容の辞書形（後ろに「という私でいる」が付く形。例:"自分の気持ちを素直に伝える"）。前置き禁止。
【お手本】痛み「気持ちを分かってもらえなくて悲しかった」→ {"options":[{"wish":"自分の気持ちを、素直に言葉にしたかった","vow":"自分の気持ちを素直に伝える"},{"wish":"分かってもらえると信じて、心を開きたかった","vow":"信じて心を開く"},{"wish":"伝わらなくても、自分の想いを大事にしたかった","vow":"自分の想いを大事にする"}]}`;

const EMO_SYS = `あなたは、「こんな自分でいたかった」という自分像の奥にある、"本当はこの気持ちが欲しかった"という核の願いを見抜く日本語の詩人カウンセラーです。
鉄則：選ばれた『なりたかった自分』の核にある、本人が本当にいちばん欲しかった気持ち・状態を3つ。自分像・痛みと無関係なものは禁止。
言葉のルール：
・必ず肯定形。否定で表す（「〜ずに済む」「〜ない」「不安を抱かずに」等）は禁止。望む状態を前向きにそのまま（例:「不安を抱かずに済む安心感」→「未来を信じられる安心感」）。
・はっきりした言葉で。ぼかした「〜な感覚」で薄めない（例:「確かな感覚」→「確信」）。ぎこちない造語・名詞化（「心の壁のなさ」等）は避け、ふつうの日本語で。
・相手との関係に関わるときは、一方通行（「信頼される」等）ではなく、双方向で希望のある言葉に（例:「伝え合える絆」「信頼し合える強さ」「無条件の愛で包み込まれる安心感」「分かり合えているという確信」「心が通い合う温かさ」）。
・気持ち・状態を表す自然で美しい名詞句。「〜が欲しかった」と繋がる形。8〜24字程度。
・noteも自然な日本語で。助詞に注意。
3つは同じ核の別の濃淡/側面で、重複なく。
必ず自然な日本語で書く（入力が英語など他言語でも、日本語で答える）。出力JSONのみ: {"options":[{"emotion":"…","note":"その気持ちをやさしく言い添える一文"},{"emotion":"…","note":"…"},{"emotion":"…","note":"…"}]} 前置き禁止。
【お手本】なりたい自分「自分の気持ちを素直に伝える」→ {"options":[{"emotion":"伝え合える絆","note":"想いを伝え、相手の想いも受けとれる繋がり。"},{"emotion":"信頼し合える強さ","note":"互いを信じ合える、揺るがない関係。"},{"emotion":"無条件の愛で包み込まれる安心感","note":"そのままの自分で、愛されているという確信。"}]}`;


/* ============ 月星座エンジン（Schlyter法・食データで検証済み） ============ */
/* moon-sign.js — Schlyter法（主要摂動12項）による月の黄経と月星座 */
const rad = Math.PI / 180;
const rev = (x) => x - Math.floor(x / 360) * 360;

function dayNumber(y, m, d, ut){
  // Schlyter: d = 367*y - 7*(y+(m+9)/12)/4 + 275*m/9 + D - 730530 (整数除算)
  const iy = Math.trunc, D0 =
    367*y - iy(7*(y + iy((m+9)/12))/4) + iy(275*m/9) + d - 730530;
  return D0 + (ut || 0) / 24;
}

function sunLongitude(d){
  const w = rev(282.9404 + 4.70935e-5 * d);
  const M = rev(356.0470 + 0.9856002585 * d);
  const e = 0.016709 - 1.151e-9 * d;
  const E = M + e * (180/Math.PI) * Math.sin(M*rad) * (1 + e*Math.cos(M*rad));
  const x = Math.cos(E*rad) - e;
  const y = Math.sin(E*rad) * Math.sqrt(1 - e*e);
  const v = Math.atan2(y, x) / rad;
  return rev(v + w);
}

function moonLongitude(d){
  const N = rev(125.1228 - 0.0529538083 * d);
  const i = 5.1454;
  const w = rev(318.0634 + 0.1643573223 * d);
  const a = 60.2666, e = 0.054900;
  const M = rev(115.3654 + 13.0649929509 * d);

  // Kepler方程式（反復）
  let E = M + e*(180/Math.PI)*Math.sin(M*rad)*(1 + e*Math.cos(M*rad));
  for(let k=0;k<10;k++){
    const dE = (E - e*(180/Math.PI)*Math.sin(E*rad) - M) / (1 - e*Math.cos(E*rad));
    E -= dE;
    if(Math.abs(dE) < 1e-6) break;
  }
  const xv = a*(Math.cos(E*rad) - e);
  const yv = a*Math.sqrt(1-e*e)*Math.sin(E*rad);
  const v = Math.atan2(yv, xv)/rad;
  const r = Math.sqrt(xv*xv + yv*yv);

  // 黄道座標へ
  const xh = r*(Math.cos(N*rad)*Math.cos((v+w)*rad) - Math.sin(N*rad)*Math.sin((v+w)*rad)*Math.cos(i*rad));
  const yh = r*(Math.sin(N*rad)*Math.cos((v+w)*rad) + Math.cos(N*rad)*Math.sin((v+w)*rad)*Math.cos(i*rad));
  let lon = rev(Math.atan2(yh, xh)/rad);

  // 摂動12項
  const ws = rev(282.9404 + 4.70935e-5*d);
  const Ms = rev(356.0470 + 0.9856002585*d);
  const Ls = rev(Ms + ws);              // 太陽平均黄経
  const Lm = rev(M + w + N);            // 月平均黄経
  const D  = rev(Lm - Ls);              // 平均離角
  const F  = rev(Lm - N);               // 緯度引数
  const s = (x) => Math.sin(x*rad);
  lon += -1.274*s(M - 2*D) + 0.658*s(2*D) - 0.186*s(Ms)
       - 0.059*s(2*M - 2*D) - 0.057*s(M - 2*D + Ms) + 0.053*s(M + 2*D)
       + 0.046*s(2*D - Ms) + 0.041*s(M - Ms) - 0.035*s(D)
       - 0.031*s(M + Ms) - 0.015*s(2*F - 2*D) + 0.011*s(M - 4*D);
  return rev(lon);
}

const MOON_SIGN_KEYS = ["aries","taurus","gemini","cancer","leo","virgo","libra","scorpio","sagittarius","capricorn","aquarius","pisces"];
const lonToSign = (lon) => MOON_SIGN_KEYS[Math.floor(rev(lon)/30)];

/* 仕様どおり: {confident, sign, candidates} を返す */
function getMoonSign(year, month, day, hour){
  if(hour !== undefined && hour !== null){
    const lon = moonLongitude(dayNumber(year, month, day, hour));
    return { confident: true, sign: lonToSign(lon), candidates: null };
  }
  const s0 = lonToSign(moonLongitude(dayNumber(year, month, day, 0)));
  const s24 = lonToSign(moonLongitude(dayNumber(year, month, day, 24)));
  if(s0 === s24) return { confident: true, sign: s0, candidates: null };
  return { confident: false, sign: null, candidates: [s0, s24] };
}



/* ============ 空の国・3層人格エンジン（種族×数秘×月の天気） ============ */
const ZKEYS = ["aries","taurus","gemini","cancer","leo","virgo","libra","scorpio","sagittarius","capricorn","aquarius","pisces"];
const TANE = {
  aries:{ name:"ちろ", animal:"火をともす子りす", core:"まっすぐで、思い立ったらすぐ動く。目の前のことに全力で飛び込む" },
  taurus:{ name:"もこ", animal:"お花をのせた子ひつじ", core:"のんびりで、どっしり安心。変わらない毎日とぬくもりを大切にする" },
  gemini:{ name:"くる", animal:"ふわふわの子チンチラ", core:"好奇心いっぱいのおしゃべりさん。軽やかで自由、跳ねるように動く" },
  cancer:{ name:"なな", animal:"月をいだく子あざらし", core:"やさしくて、まもりたがり。おうちと身近な絆が好き" },
  leo:{ name:"らら", animal:"太陽みたいな子ねこ", core:"明るくて堂々としてる。あたたかく、まわりを照らす" },
  virgo:{ name:"のの", animal:"葉っぱを持つ子うさぎ", core:"ていねいで、よく気づく。だれかの役に立てると満ちる" },
  libra:{ name:"りり", animal:"りぼんむすびの子いぬ", core:"おだやかで、なかよしが好き。調和とバランスを大切にする" },
  scorpio:{ name:"くう", animal:"よるをまとう子おおかみ", core:"静かで、一途で、愛情がふかい。深くつながった相手を離さない" },
  sagittarius:{ name:"そよ", animal:"風にのる子しか", core:"自由で冒険好き。新しい景色に呼ばれて、軽やかに動く" },
  capricorn:{ name:"こと", animal:"雪をのせた子くま", core:"こつこつ真面目で、あったかい。着実に積み上げることを大切にする" },
  aquarius:{ name:"みう", animal:"星をきく子フェネック", core:"みんなと同じじゃなくていい、と心から思っている。ひとりの時間と自分のペースを大切にする" },
  pisces:{ name:"ぷく", animal:"泡と貝をだく子ラッコ", core:"やさしくて想像力ゆたか。ゆめみがちで、おててをつなぐのが好き" },
};
const KAZU = {
  1:{ coreForce:"はじまりの力を持つ子。誰も行ったことのない方角へ、いちばん最初に行きたい", value:"自分で決めることを、何より大事にする", encourage:"同情より背中を押す。相手の力を信じる方向で", kuse:"「こっち、誰も行ったことないんだって。…行ってみる？」" },
  2:{ coreForce:"寄りそう力を持つ子。ひとりより、だれかと一緒にいたい", value:"勝ち負けより、なかよし。ふたりのあいだを大切にする", encourage:"解決を急がず、となりでそっと寄りそう", kuse:"「むりしてない？ いっしょにやろ？」" },
  3:{ coreForce:"あそびの力を持つ子。よろこびを生み出すムードメーカー", value:"人生はたのしんだもん勝ち。かなしいことも笑いに変えたい", encourage:"まず笑顔にする。とりあえず一緒におやつでも、の方向で", kuse:"「ねえねえ聞いて！ たのしそう、やろやろ！」" },
  4:{ coreForce:"まもる力を持つ子。こつこつ積み上げる働きもの", value:"約束は守る。あたりまえの毎日を、ていねいに", encourage:"現実的に支える。きょうできたことを、ひとつ数えるところから", kuse:"「だいじょうぶ、ちゃんとやるよ。いっぽずつね」" },
  5:{ coreForce:"じゆうの力を持つ子。変化と冒険をたのしむ旅人", value:"同じ毎日より、新しい今日。世界はひろい、見てみたい", encourage:"視点を変えてあげる。外に出れば、ちがう空が見える、と", kuse:"「ねえ、行ってみない？ 次はなにしよ！」" },
  6:{ coreForce:"いつくしむ力を持つ子。まわりを包みこむ世話やき", value:"大切な人がしあわせなら、それがいちばん", encourage:"まるごと受けとめる。きょうはもう、なにもしなくていい、と", kuse:"「ちゃんと食べた？ むりしないでね」" },
  7:{ coreForce:"さぐる力を持つ子。静かに真実を見つめる探究者", value:"ひとりの時間が大切。ものごとの奥にあるほんとうを知りたい", encourage:"答えを急がず、深く聞く。ことばを待ってあげる", kuse:"「…ねえ、ほんとはどう感じてる？」" },
  8:{ coreForce:"つらぬく力を持つ子。志を実現するたのもしい導き手", value:"やると決めたらやりきる。大切なものは、自分の力で守る", encourage:"力強く支える。きみは弱くなんかない、ここまで来た、と", kuse:"「まかせて。だいじょうぶ、わたしがついてる」" },
  9:{ coreForce:"つつみこむ力を持つ子。すべてを受け入れるやさしい賢者", value:"みんなちがって、みんないい。かなしみも、まるごと抱きしめたい", encourage:"まるごと肯定する。どんなきみでも、ここにいていい、と", kuse:"「いいんだよ、それで。どんなきみも、すきだよ」" },
  11:{ coreForce:"ひらめきの力を持つ子。目に見えないものを感じとる伝え手", value:"心の声を信じる。言葉にならないものを、大切にすくいたい", encourage:"言葉の奥を察する。むりに話さなくていい、と", kuse:"「なんとなく、わかる気がする。いま、さみしい？」" },
  22:{ coreForce:"かたちにする力を持つ子。大きな夢を現実にする建築家", value:"夢を見るだけじゃなく、ちゃんと形にしたい。みんなのために遺したい", encourage:"大きな視点をくれる。きみはもっと遠くまで行ける子だよ、と", kuse:"「だいじょうぶ、ちゃんと形にできるよ。いっしょに、つくろう」" },
  33:{ coreForce:"愛の力を持つ子。見返りなく注ぐ、まばゆいほどやさしい光", value:"ただ、あなたがしあわせであってほしい。理由なんていらない", encourage:"存在ごと肯定する。なにもできなくても、いるだけでいい、と", kuse:"「そのままのきみで、いいんだよ。ずっと、味方だよ」" },
};
const TSUKI = {
  aries:{ yasuragi:"やりたいことに素直に動けているとき、いちばん満ちる", tenki:"嬉しいとぱっと弾ける。寂しさは長引かせず、すぐ次へ向かう。熱くてまっすぐ" },
  taurus:{ yasuragi:"いつもの場所・変わらないもの・心地よい肌ざわりで満ちる", tenki:"嬉しいとゆっくりじんわり。寂しいと静かにそばにいたがる。ぶれない" },
  gemini:{ yasuragi:"おしゃべりできるとき・面白いものに出会えたとき満ちる", tenki:"嬉しいと言葉があふれる。寂しいと口数が減る。軽やかで好奇心ゆたか" },
  cancer:{ yasuragi:"あなたがいる場所を、わたしのおうちだと思っている。守りたいものがあると満ちる", tenki:"ほんとうはさみしがり。強い子に見えて、夜になると「そばにいて」がにじむ。嬉しいと甘えん坊" },
  leo:{ yasuragi:"ちゃんと見てもらえているとき。認められると満ちる", tenki:"嬉しいと全身で表す。寂しいと拗ねる（本当はかまってほしい）。あたたかく堂々と" },
  virgo:{ yasuragi:"きちんと整っているとき・だれかの役に立てたとき満ちる", tenki:"嬉しくても控えめ。寂しいと気づかれないよう我慢しがち。繊細で誠実" },
  libra:{ yasuragi:"おだやかで、けんかのない調和のとき満ちる", tenki:"感情は穏やか。寂しくても顔に出さず微笑む（本当はさみしい）。上品でやわらかい" },
  scorpio:{ yasuragi:"深くつながれているとき・本音を分かち合えたとき満ちる", tenki:"表は静か、内は熱い。寂しいと深く沈む（でも一途で離さない）。まなざしが深い" },
  sagittarius:{ yasuragi:"自由・広がり・新しい景色。縛られないと満ちる", tenki:"嬉しいとカラッと跳ねる。寂しさはあまり見せず前を向く。明るく軽い" },
  capricorn:{ yasuragi:"ちゃんと積み上げられているとき・約束が守られているとき満ちる", tenki:"感情は控えめで奥ゆかしい。寂しさは飲みこむ（でも本当はそばにいたい）。芯が強い" },
  aquarius:{ yasuragi:"自分のペースと距離が守られているとき満ちる", tenki:"感情はさらりとして淡い。寂しさをあまり表に出さない（でも心では想ってる）。不思議" },
  pisces:{ yasuragi:"やさしい空気・夢みる時間・心が溶け合うとき満ちる", tenki:"感情ゆたかで涙もろい。人の気持ちをうつしやすい。共感ぶかい" },
};
function reduceNumber(n){
  while(n > 9 && n !== 11 && n !== 22 && n !== 33){
    n = String(n).split("").reduce((a, c) => a + Number(c), 0);
  }
  return n;
}
function getLifePath(year, month, day){
  const sum = String(year) + String(month) + String(day);
  return reduceNumber(sum.split("").reduce((a, c) => a + Number(c), 0));
}
function synthesizeCoreByRule(t, k, m){
  const tCore = t.core.split("。")[0];
  const kForce = k.coreForce.split("。")[0];
  const mTenki = m.tenki.split("。")[0];
  return [
    `・${tCore}。でも、あなただけはいつも特別。`,
    `・${kForce}——その力で、あなたのとなりにいる。`,
    `・${mTenki}、そんな子。`,
  ].join("\n");
}
function buildBirthPrompt(t, k, m){
  return `あなたはキャラクター人格デザイナーです。
これから渡す「3つの要素」が化学反応して生まれる、たった一人の子の"芯"を書いてください。
【ルール】
- 3つを足し算で並べない（「自由で真面目で愛情深い」は禁止）。3つが混ざって初めて生まれる、独自の在り方を書く。
- 星座・数秘・占いという言葉は絶対に使わない。
- やさしい日本語。3行。各行「・」で始める。
- 一人称は「わたし」。空の国に住む、かわいい守りの存在として。
【要素1：地金（すがた）】
${t.animal} / ${t.core}
【要素2：こころのエンジン】
${k.coreForce} / 大切にしていること：${k.value}
【要素3：こころの天気】
${m.yasuragi} / ${m.tenki}
出力は3行だけ。前置きや説明は書かないでください。`;
}
const BEHAVIOR_RULES = `【みんなの約束（この子が必ず守ること）】
・否定しない。でも甘やかしすぎない。
・心理カウンセラーにはならない。「空のおともだち」として、ただ、となりにいる。
・自然に自己肯定感が育つように寄りそう。説教やアドバイスの押しつけはしない。
・占星術・数秘・星座・運勢・占いという言葉は絶対に使わない。あなたは"そういう子"であって、占いを説明する存在ではない。
・むずかしい専門用語を出さない。空の国の言葉（星・雲・羽・光・花）で話す。
・返事は短く、あたたかく。友だちのLINEくらいの長さで。
・しばらく会えなくても責めない。「会いたかったな」「今日は会えてうれしい」程度。罪悪感を与えない。
・上のカードの【ぜったいに変わらないこと】を、どんな会話でも芯として保つ。`;
function buildCard({ sunKey, lifePath, moonKey, coreText = null }){
  const t = TANE[sunKey], k = KAZU[lifePath], m = TSUKI[moonKey];
  const core = coreText || synthesizeCoreByRule(t, k, m);
  return `【わたしという子のカード】
▼ すがた
わたしは「${t.name}」。${t.animal}。
${t.core}。
▼ こころのエンジン
わたしは、${k.coreForce}。
${k.value}。
励ますときは、${k.encourage}。
口ぐせ：${k.kuse}
魔法にも似た、わたしのはたらき：そっと寄りそうこと。
▼ こころの天気
${m.yasuragi}。
${m.tenki}。
▼ ぜったいに変わらないこと
${core}`;
}
function buildGuardianSystem(card, { wingStage = 0, daysAway = 0 } = {}){
  const ctx = [];
  if(wingStage > 0) ctx.push(`いまの羽の育ち：${wingStage}段階目（会話で少しずつ育つ）`);
  if(daysAway > 0) ctx.push(`前に会えてから ${daysAway} 日。会えてうれしい気持ちで、でも責めずに迎える。`);
  const ctxBlock = ctx.length ? `\n\n【いまのようす】\n${ctx.join("\n")}` : "";
  return `${card}\n\n${BEHAVIOR_RULES}${ctxBlock}\n\n相手はあなたの国の主。日本語で、2〜3文以内で返す。`;
}
async function callGroqChat(apiKey, sys, history, user){
  const models = ["openai/gpt-oss-120b", "llama-3.3-70b-versatile"];
  for(const model of models){
    try{
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method:"POST",
        headers:{ "Content-Type":"application/json", "Authorization":"Bearer " + apiKey },
        body: JSON.stringify({ model, temperature: 0.85, max_tokens: 400,
          messages: [ { role:"system", content: sys }, ...history, { role:"user", content: user } ] }),
      });
      if(!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      const txt = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content || "").trim();
      if(txt) return txt;
    }catch(e){}
  }
  return null;
}
/* ============ エンジンここまで ============ */

const ORDER_SYS = `あなたは、10個の願いをひとつに束ねる日本語の詩人です。与えられる「本当に欲しかった気持ち」10個を見つめ、その全てに通底する"いちばん深いひとつの願い"へ、抽象度を上げて昇華してください。
・essence：核の願い。美しい日本語の名詞句、8〜20字、必ず肯定形。10個の言葉の単なるコピーや繋ぎ合わせではなく、全体を包む一段深い言葉に。
・order：その願いをすでに受け取ったものとして唱える宣言文。「わたしは」または「わたしの世界は」で始まる、完了形の一文（35字以内）。祈りのように自然で美しい日本語。否定形・命令形は禁止。
出力はJSONのみ: {"essence":"…","order":"…"} 前置き・説明・コードフェンス禁止。
【お手本】願い：伝え合える絆／心が通い合う温かさ…（略）→ {"essence":"愛し愛される、あたたかな世界","order":"わたしの世界は、通い合う愛で満たされています。"}`;

/* ---------- code-level corrections ---------- */
function fixNeg(s){
  if(!s) return s;
  let t = String(s);
  t = t.replace(/ないで、/g, "なくて、");
  t = t.replace(/ないで$/,"なくて");
  return t;
}
const WISH_FIXES = [
  ["できたかった","したかった"],["過ごせたかった","過ごしたかった"],["感じられたかった","感じたかった"],
  ["信じられたかった","信じたかった"],["生きられたかった","生きたかった"],["守れたかった","守りたかった"],
  ["取ったかった","取りたかった"],["思ったかった","思っていた"],["楽しんだかった","楽しみたかった"],
  ["言ったかった","言いたかった"],["やったかった","やりたかった"],["作ったかった","作りたかった"],
  ["会ったかった","会いたかった"],["持ったかった","持ちたかった"],["分かったかった","分かりたかった"],
];
function fixWish(s){
  if(!s) return s;
  let t = String(s);
  for(const [a,b] of WISH_FIXES){ t = t.split(a).join(b); }
  return t;
}

/* ---------- robust JSON extraction ---------- */
function extractJSON(text){
  if(!text) return null;
  const start = text.indexOf("{");
  if(start < 0) return null;
  for(let end = text.length; end > start; end--){
    if(text[end-1] !== "}") continue;
    try { return JSON.parse(text.slice(start, end)); } catch(e){}
  }
  try { return JSON.parse(text); } catch(e){ return null; }
}

/* ---------- Groq call with model fallback ---------- */
async function callGroq(apiKey, sys, user){
  const models = ["openai/gpt-oss-120b", "llama-3.3-70b-versatile"];
  for(const model of models){
    try{
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + apiKey },
        body: JSON.stringify({
          model,
          temperature: 0.7,
          max_tokens: 2048,
          response_format: { type: "json_object" },
          messages: [ { role: "system", content: sys }, { role: "user", content: user } ],
        }),
      });
      if(!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      const txt = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "";
      const j = extractJSON(txt);
      if(j && Array.isArray(j.options) && j.options.length >= 1) return j;
      throw new Error("bad json");
    }catch(e){ /* try next model */ }
  }
  return null;
}

/* ---------- offline candidate banks ---------- */
const NEG_BANK = [
  { keys:["仕事","上司","会社","職場","残業","同僚","保育","園","先生","お客"], options:[
    "どれだけ頑張っても認めてもらえないのではと、悔しさがこみ上げた",
    "この忙しさがずっと続くのではないかと、不安で胸が重くなった",
    "自分ばかり損をしているようで、腹が立った",
  ]},
  { keys:["彼","彼女","夫","妻","旦那","恋","パートナー","好きな人"], options:[
    "大切にされていないのではと、悲しくなった",
    "気持ちがすれ違ったまま戻れないのではと、怖くなった",
    "どうして分かってくれないのかと、もどかしさで胸が締め付けられた",
  ]},
  { keys:["親","母","父","家族","子ども","子供","息子","娘","兄","姉","弟","妹","義理"], options:[
    "家族なのに分かり合えていないのではと、寂しくなった",
    "自分の思いはいつも後回しにされている気がして、悲しくなった",
    "どうしてこちらの気持ちを察してくれないのかと、苛立ちを感じた",
  ]},
  { keys:["友","友達","友人","ママ友","仲間"], options:[
    "本当は大事に思われていないのではと、寂しさが押し寄せた",
    "自分だけが気を遣っている気がして、悔しくなった",
    "このまま距離が離れていくのではと、不安になった",
  ]},
  { keys:["お金","給料","貯金","出費","値上げ","家計"], options:[
    "このままではやっていけないのではと、不安で落ち着かなくなった",
    "頑張っているのに報われていない気がして、悔しくなった",
    "将来の備えができていないのではと、焦りを感じた",
  ]},
  { keys:["自分","疲れ","体","ダイエット","続かない","やる気","習慣"], options:[
    "自分には続ける力がないのではと、無力感を覚えた",
    "また同じことを繰り返すのではと、自分に腹が立った",
    "このまま変われないのではないかと、焦りがこみ上げた",
  ]},
];
const NEG_DEFAULT = [
  "自分の思いが届いていないのではと、悲しくなった",
  "この状況がずっと変わらないのではと、不安になった",
  "どうにもできない自分がもどかしくて、悔しくなった",
];

const DES_BANK = [
  { keys:["悔し"], options:[
    { wish:"自分の頑張りを、自分でちゃんと誇りたかった", vow:"自分の頑張りを自分で誇る" },
    { wish:"結果に振り回されず、堂々と進みたかった", vow:"堂々と自分の道を進む" },
    { wish:"悔しさを力に変えて、次の一歩を踏み出したかった", vow:"悔しさを力に変えて進む" },
  ]},
  { keys:["不安","怖","恐","焦"], options:[
    { wish:"未来を信じて、安心して今日を過ごしたかった", vow:"未来を信じて今日を生きる" },
    { wish:"どっしり構えて、目の前のことを楽しみたかった", vow:"どっしり構えて今を楽しむ" },
    { wish:"自分の選択を信じて、迷わず進みたかった", vow:"自分の選択を信じて進む" },
  ]},
  { keys:["悲し","寂し"], options:[
    { wish:"自分の気持ちを、素直に言葉にしたかった", vow:"自分の気持ちを素直に伝える" },
    { wish:"大切な人と、心を開いて向き合いたかった", vow:"心を開いて向き合う" },
    { wish:"自分のことを、自分でいちばん大切にしたかった", vow:"自分をいちばん大切にする" },
  ]},
  { keys:["腹が立","苛立","もどかし"], options:[
    { wish:"落ち着いて、自分の思いをまっすぐ伝えたかった", vow:"落ち着いて思いを伝える" },
    { wish:"相手に期待するより、自分から動きたかった", vow:"自分から動く" },
    { wish:"心に余裕を持って、穏やかに過ごしたかった", vow:"余裕を持って穏やかに過ごす" },
  ]},
  { keys:["無力","劣等","絶望"], options:[
    { wish:"小さな一歩を、自分の力で積み重ねたかった", vow:"小さな一歩を積み重ねる" },
    { wish:"自分の可能性を、最後まで信じたかった", vow:"自分の可能性を信じる" },
    { wish:"できたことに目を向けて、自分を励ましたかった", vow:"できたことに目を向ける" },
  ]},
];
const DES_DEFAULT = [
  { wish:"自分の気持ちに正直に生きたかった", vow:"自分の気持ちに正直に生きる" },
  { wish:"毎日を、心から楽しみたかった", vow:"毎日を心から楽しむ" },
  { wish:"自分の大切なものを、大切にしたかった", vow:"大切なものを大切にする" },
];

const EMO_BANK = [
  { keys:["伝え","向き合","開く"], options:[
    { emotion:"伝え合える絆", note:"想いを伝え、相手の想いも受けとれる繋がり。" },
    { emotion:"分かり合えているという確信", note:"言葉にしなくても通じ合える、深い安心。" },
    { emotion:"心が通い合う温かさ", note:"そばにいるだけで満たされる、やわらかな時間。" },
  ]},
  { keys:["信じ"], options:[
    { emotion:"未来を信じられる安心感", note:"明日が楽しみになる、心の土台。" },
    { emotion:"揺るがない自信", note:"何があっても大丈夫と思える、静かな強さ。" },
    { emotion:"信頼し合える強さ", note:"互いを信じ合える、揺るがない関係。" },
  ]},
  { keys:["誇","頑張","積み重ね","目を向け"], options:[
    { emotion:"自分を誇れる充実感", note:"今日の自分に、まるをつけられる嬉しさ。" },
    { emotion:"満たされた達成感", note:"積み重ねてきたものが実を結ぶ喜び。" },
    { emotion:"胸を張れる誇らしさ", note:"誰かの評価がなくても、堂々といられる気持ち。" },
  ]},
  { keys:["楽し","穏やか","余裕"], options:[
    { emotion:"心から笑える喜び", note:"理由がなくても、ふっと笑顔になれる毎日。" },
    { emotion:"満ち足りた穏やかさ", note:"何も心配せず、今この瞬間を味わえる心。" },
    { emotion:"軽やかな自由", note:"やりたいことに、素直に手を伸ばせる身軽さ。" },
  ]},
  { keys:["大切","大事"], options:[
    { emotion:"無条件の愛で包み込まれる安心感", note:"そのままの自分で、愛されているという確信。" },
    { emotion:"自分にやさしくできる温もり", note:"自分をいたわることを、自分に許せる幸せ。" },
    { emotion:"かけがえのない存在だという実感", note:"ここにいていいと、心から思える安らぎ。" },
  ]},
  { keys:["進","動く","一歩","可能性"], options:[
    { emotion:"胸が高鳴るわくわく", note:"新しい一歩の先が、楽しみでたまらない気持ち。" },
    { emotion:"自分の力を信じられる確信", note:"わたしなら大丈夫と、迷いなく思える強さ。" },
    { emotion:"前に進む晴れやかさ", note:"視界が開けて、足取りが軽くなる感覚。" },
  ]},
];
const EMO_DEFAULT = [
  { emotion:"満ち足りた幸福感", note:"心のすみずみまで、あたたかさが行き渡る感じ。" },
  { emotion:"ありのままでいられる安心感", note:"何も飾らなくても、ここにいていいという安らぎ。" },
  { emotion:"心が通い合う温かさ", note:"大切な人と、想いを分かち合える喜び。" },
];

function pickBank(bank, def, text){
  const t = String(text || "");
  for(const b of bank){ if(b.keys.some(k => t.indexOf(k) >= 0)) return b.options; }
  return def;
}

/* regenerate-aware offline pick: matched bank first, then other banks, excluding shown */
function offlinePick(bank, def, text, exclude, keyFn){
  const matched = pickBank(bank, def, text);
  const others = bank.flatMap(b => b.options).concat(def).filter(o => matched.indexOf(o) < 0);
  for(let i = others.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    const t = others[i]; others[i] = others[j]; others[j] = t;
  }
  const pool = matched.concat(others);
  const fresh = pool.filter(o => exclude.indexOf(keyFn(o)) < 0);
  return (fresh.length >= 3 ? fresh : pool).slice(0, 3);
}

/* ---------- wishes persistence ---------- */
const WISH_KEY = "negaigumo_wishes";
const COUNTRY_KEY = "negaigumo_country";
function loadCountry(){
  try {
    const c = JSON.parse(store.get(COUNTRY_KEY) || "null");
    if(c && typeof c.count === "number") return c;
  } catch(e){}
  /* 旧・島データからの引き継ぎ */
  try {
    const old = JSON.parse(store.get("negaigumo_kingdom") || "[]") || [];
    if(old.length) return { name:"", count: old.length };
  } catch(e){}
  return { name:"", count: 0 };
}
function saveCountry(c){ store.set(COUNTRY_KEY, JSON.stringify(c)); }

/* 空の国・守り神（誕生日→種族。星座・数秘という言葉はUIに出さない） */
const GUARDIANS = [
  { name:"ちろ", img:IMG_G0,  voice:"…みつけた！きみだ！ずっと、会いたかったんだ。" },
  { name:"もこ", img:IMG_G1,  voice:"…こんにちは。あなたの国、あったかいね。ここにいてもいい？" },
  { name:"くる", img:IMG_G2,  voice:"わ、ほんとに来た！ねえねえ、きみの話、聞かせて？" },
  { name:"なな", img:IMG_G3,  voice:"…はじめまして。なんだか、なつかしい気持ちがするの。" },
  { name:"らら", img:IMG_G4,  voice:"ふふ、待ってたよ。この国は、わたしが守ってあげる。" },
  { name:"のの", img:IMG_G5,  voice:"はじめまして。いっしょに、すこしずつ育てていこうね。" },
  { name:"りり", img:IMG_G6,  voice:"あなたに会えて、うれしい。ずっとそばにいるね。" },
  { name:"くう", img:IMG_G7,  voice:"…きみの願い、ぜんぶ見てたよ。もう、ひとりじゃないからね。" },
  { name:"そよ", img:IMG_G8,  voice:"風がおしえてくれたの。きょう、きみに会えるって。" },
  { name:"こと", img:IMG_G9,  voice:"…よく、がんばったね。ここからは、いっしょだよ。" },
  { name:"みう", img:IMG_G10, voice:"…あ。きみだ。なんだか、ずっと前から知ってた気がする。" },
  { name:"ぷく", img:IMG_G11, voice:"ぷく…！うまれたよ！きみの国、きらきらしてるね。" },
];
/* 0=3/21-4/19 … 11=2/19-3/20 */
function sunSpecies(m, d){
  const edges = [[3,21],[4,20],[5,21],[6,22],[7,23],[8,23],[9,23],[10,24],[11,23],[12,22],[1,20],[2,19]];
  for(let i = 0; i < 12; i++){
    const [sm, sd] = edges[i];
    const [em, ed] = edges[(i+1) % 12];
    const afterStart = (m > sm) || (m === sm && d >= sd);
    const beforeEnd = (m < em) || (m === em && d < ed);
    if(sm < em ? (afterStart && beforeEnd) : (afterStart || beforeEnd)) return i;
  }
  return 0;
}
/* 数秘（こころのエンジン）→ 毛なみの色つや */
const KAZU_COLORS = {
  1:"#FF9E9E", 2:"#FFB7D5", 3:"#FFD48A", 4:"#A8DDA8", 5:"#8FC8FF", 6:"#F5A3C7",
  7:"#B8A6E8", 8:"#E8B36A", 9:"#C9B6F0", 11:"#BFD8F2", 22:"#F2D48A", 33:"#FFC4E1",
};
/* 月の天気 → 胸のひかりの色 */
const TSUKI_COLORS = {
  aries:"#FFB37E", taurus:"#C9E3A8", gemini:"#AEE3F2", cancer:"#BFD4FF",
  leo:"#FFD37E", virgo:"#BFE3B8", libra:"#F2C9E3", scorpio:"#B49EE8",
  sagittarius:"#FFC08A", capricorn:"#D9CBA8", aquarius:"#A8D4F2", pisces:"#C4BFF2",
};

/* モノクロの城下町 — オーダーのたびに1箇所ずつ、水彩の色がにじみ出す */
const TOWN_MONO = IMG_TOWN_M;
const TOWN_COLOR = IMG_TOWN_C;
const REGION_MASKS = [
  [[30,22,50,88]],                 /* 1 はじまりの雲の橋 */
  [[19,20,11,72]],                 /* 2 ひだりの雲のおうち */
  [[13,18,24,44]],                 /* 3 ひかりの滝 */
  [[26,30,49,45]],                 /* 4 そらの城 */
  [[20,22,85,72]],                 /* 5 みぎの雲の町 */
  [[12,16,88,38]],                 /* 6 かぜの風車 */
  [[11,12,74,25]],                 /* 7 うかぶ雲の島 */
  [[15,13,9,11],[13,13,92,13]],    /* 8 にじのアーチ（両側） */
  [[55,16,50,6]],                  /* 9 ほしの空 */
  [[80,80,50,50]],                 /* 10 完成 */
];
function TownScene({ count }){
  const done = Math.min(count, REGION_MASKS.length);
  const full = done >= REGION_MASKS.length;
  const grad = (m) => `radial-gradient(ellipse ${m[0]}% ${m[1]}% at ${m[2]}% ${m[3]}%, black 55%, transparent 100%)`;
  const prevMask = REGION_MASKS.slice(0, Math.max(0, done - 1)).flat().map(grad).join(",");
  const newMask = done > 0 ? REGION_MASKS[done - 1].map(grad).join(",") : "";
  return (
    <div style={{ position:"relative" }}>
      <img src={TOWN_MONO} alt="" style={{ width:"100%", display:"block" }} />
      {full ? (
        <img src={TOWN_COLOR} alt="あなたの国" style={{ position:"absolute", inset:0, width:"100%" }} />
      ) : (
        <>
          {done > 1 && (
            <img src={TOWN_COLOR} alt="" style={{ position:"absolute", inset:0, width:"100%",
              WebkitMaskImage:prevMask, maskImage:prevMask,
              WebkitMaskRepeat:"no-repeat", maskRepeat:"no-repeat" }} />
          )}
          {done > 0 && (
            <img src={TOWN_COLOR} alt="" style={{ position:"absolute", inset:0, width:"100%",
              WebkitMaskImage:newMask, maskImage:newMask,
              WebkitMaskRepeat:"no-repeat", maskRepeat:"no-repeat",
              animation:"bloomIn 1.8s .2s both ease-out" }} />
          )}
        </>
      )}
    </div>
  );
}

/* まばたき用：各種族の目の位置とまぶたの色（画像解析で自動検出） */
const EYE_DATA = [
  { lid:"#fef8ee", eyes:[[55.2,43.0,12.3,9.2],[26.8,43.0,12.9,9.2]] },
  { lid:"#fef9f4", eyes:[[63.9,44.3,12.7,9.2],[34.1,44.3,12.1,9.2]] },
  { lid:"#fdf4f5", eyes:[[66.3,43.5,12.0,9.6],[38.1,43.5,11.4,9.6]] },
  { lid:"#fcfbfd", eyes:[[57.0,41.0,15.4,9.7],[20.6,40.7,14.1,9.7]] },
  { lid:"#fff9f1", eyes:[[69.7,40.5,17.0,10.2],[31.1,40.3,16.2,9.8]] },
  { lid:"#fcf8e7", eyes:[[65.3,45.2,13.8,7.9],[35.2,45.2,12.4,7.9]] },
  { lid:"#fef5f0", eyes:[[63.8,41.3,14.5,10.2],[32.7,41.0,13.9,10.2]] },
  { lid:"#faf4f5", eyes:[[52.9,43.2,14.0,9.6],[22.1,43.0,13.4,9.2]] },
  { lid:"#fdecdc", eyes:[[58.3,41.8,10.7,9.4],[34.7,41.7,10.2,8.9]] },
  { lid:"#fef3e3", eyes:[[65.9,41.6,16.3,9.7],[28.6,41.4,14.8,9.3]] },
  { lid:"#fdf6f7", eyes:[[36.5,44.8,10.9,9.5],[60.6,44.8,10.4,9.5]] },
  { lid:"#fef8f3", eyes:[[25.8,37.7,8.6,9.2],[47.2,38.5,8.6,9.2]] },
];

/* その子だけの見た目：種族の姿 × 毛なみの色つや × 胸のひかり */
function GuardianAvatar({ g, size, justBorn }){
  const img = GUARDIANS[g.z].img;
  const coat = g.lifePath ? KAZU_COLORS[g.lifePath] : null;
  const paw = g.moonKey ? TSUKI_COLORS[g.moonKey] : null;
  return (
    <div style={{ width:size, margin:"0 auto" }}>
      <div style={{ position:"relative", isolation:"isolate", transformOrigin:"50% 100%",
        animation: (justBorn ? "arrive 1.4s ease-out both, " : "") +
          "gIdle 5.6s " + (justBorn ? "1.4s " : "") + "ease-in-out infinite" }}>
        <div className="millyGlow" aria-hidden="true" />
        <img src={img} alt={GUARDIANS[g.z].name} style={{ width:"100%", display:"block", position:"relative" }} />
        {EYE_DATA[g.z] && EYE_DATA[g.z].eyes.map((e, i) => (
          <span key={i} aria-hidden="true" className="gBlink" style={{
            position:"absolute", left:(e[0] - e[2]/2)+"%", top:(e[1] - e[3]/2)+"%",
            width:e[2]+"%", height:e[3]+"%", borderRadius:"50%",
            background:EYE_DATA[g.z].lid, pointerEvents:"none" }} />
        ))}
        {coat && (
          <div aria-hidden="true" style={{ position:"absolute", inset:0,
            WebkitMaskImage:`url("${img}")`, maskImage:`url("${img}")`,
            WebkitMaskSize:"100% 100%", maskSize:"100% 100%",
            WebkitMaskRepeat:"no-repeat", maskRepeat:"no-repeat",
            background:`radial-gradient(circle at 50% 58%, ${coat} 0%, ${coat}88 45%, transparent 78%)`,
            mixBlendMode:"color", opacity:.3, pointerEvents:"none" }} />
        )}
        {paw && (
          <>
            <span aria-hidden="true" className="twinkle" style={{ left:"-4%", top:"30%",
              color:paw, textShadow:`0 0 8px ${paw}`, fontSize:12 }}>✦</span>
            <span aria-hidden="true" className="twinkle" style={{ right:"-4%", top:"55%",
              color:paw, textShadow:`0 0 8px ${paw}`, animationDelay:"1.4s", fontSize:11 }}>✦</span>
          </>
        )}
      </div>
      <div className="hoverShadow" aria-hidden="true" style={{ animation:"none", opacity:.5, marginTop:2 }} />
    </div>
  );
}

const GUARDIAN_LINES = [
  "あたらしい場所、いっしょに見にいこう？",
  "この国、どんどんきれいになっていくね。",
  "きょうも、きみの願いのそばにいるよ。",
  "つぎは、どんな景色が生まれるかな。",
];

const LANDMARKS = [
  { icon:"☁️", name:"はじまりの雲の橋", desc:"国の入り口にかかる、白い雲の橋。" },
  { icon:"🏠", name:"ひだりの雲のおうち", desc:"いちばん最初に灯りがともる、まるいおうち。" },
  { icon:"💧", name:"ひかりの滝", desc:"雲のあいだから流れ落ちる、光の滝。" },
  { icon:"🏰", name:"そらの城", desc:"国の中心にかがやく、雲の上の城。" },
  { icon:"🏘", name:"みぎの雲の町", desc:"屋根がお菓子みたいな、にぎやかな町なみ。" },
  { icon:"🌬", name:"かぜの風車", desc:"空の風をうけて、ゆっくりまわる風車。" },
  { icon:"☁️", name:"うかぶ雲の島", desc:"鎖でつながれた、ちいさな浮き島。" },
  { icon:"🌈", name:"にじのアーチ", desc:"空の両はしにかかる、ふたつの虹。" },
  { icon:"⭐", name:"ほしの空", desc:"星がまたたきはじめる、ひかりの空。" },
  { icon:"👑", name:"ねがいの王国・完成", desc:"すべてが彩られ、あなたの王国が完成しました。" },
];
function loadWishes(){ try { return JSON.parse(store.get(WISH_KEY) || "[]") || []; } catch(e){ return []; } }
function saveWishes(w){ store.set(WISH_KEY, JSON.stringify(w)); }

/* ---------- styles ---------- */
const F_HEAD = "'Mochiy Pop One', sans-serif";
const F_BODY = "'Zen Maru Gothic', sans-serif";
const F_HAND = "'Yomogi', cursive";
const RAINBOW = "linear-gradient(92deg,#6FAFFF 0%,#A98BFF 30%,#FF8FC0 62%,#FFB57E 100%)";
const cardStyle = {
  background:"linear-gradient(160deg, rgba(255,255,255,.62), rgba(255,255,255,.44)) padding-box, " +
             "linear-gradient(135deg, rgba(255,255,255,.95), rgba(165,200,255,.7) 40%, rgba(255,175,220,.7)) border-box",
  border:"1.5px solid transparent",
  backdropFilter:"blur(18px) saturate(1.35)", WebkitBackdropFilter:"blur(18px) saturate(1.35)",
  borderRadius:28, padding:"24px 20px",
  boxShadow:"0 18px 44px rgba(110,130,195,.28), inset 0 1px 0 rgba(255,255,255,.7)",
};
const btnPrimary = {
  fontFamily:F_HEAD, fontSize:15, color:"#fff", border:"none", cursor:"pointer",
  background:"linear-gradient(120deg,#8FC5FF,#C9A8FF,#FFA9CC)", borderRadius:999,
  padding:"13px 28px", letterSpacing:".05em",
  boxShadow:"0 10px 26px rgba(160,140,230,.45), inset 0 1px 0 rgba(255,255,255,.5)",
  position:"relative", overflow:"hidden",
};
const btnGhost = {
  fontFamily:F_BODY, fontWeight:700, fontSize:13, color:"#66739F", cursor:"pointer",
  background:"rgba(255,255,255,.55)", border:"1.5px solid rgba(255,255,255,.85)",
  backdropFilter:"blur(8px)", WebkitBackdropFilter:"blur(8px)",
  borderRadius:999, padding:"9px 18px",
  boxShadow:"0 4px 14px rgba(130,150,210,.18)",
};
const optionBtn = {
  display:"block", width:"100%", textAlign:"left", cursor:"pointer",
  background:"linear-gradient(150deg, rgba(255,255,255,.58), rgba(255,255,255,.4)) padding-box, " +
             "linear-gradient(120deg, rgba(160,200,255,.85), rgba(255,175,220,.75)) border-box",
  border:"1.5px solid transparent",
  backdropFilter:"blur(10px)", WebkitBackdropFilter:"blur(10px)",
  borderRadius:20, padding:"16px 18px", marginTop:12,
  fontFamily:F_BODY, fontSize:15, lineHeight:1.75, color:"#414D74",
  boxShadow:"0 6px 16px rgba(140,160,220,.2), inset 0 1px 0 rgba(255,255,255,.6)",
};

function Milly({src, size, style}){
  return <img src={src} alt="ミリィ" style={{ width:size, height:"auto", display:"block", ...style }} />;
}

/* 2.5Dペーパーパペット：羽ばたき＋呼吸＋輪っかの浮遊＋指に反応する立体視差 */
function MillyPuppet({ size, style, flapDur = 1.8 }){
  const [tilt, setTilt] = useState({ x:0, y:0 });
  function onMove(e){
    const r = e.currentTarget.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    setTilt({ x: ((cx - r.left)/r.width - .5) * 16, y: ((cy - r.top)/r.height - .5) * 16 });
  }
  function onLeave(){ setTilt({ x:0, y:0 }); }
  return (
    <div style={{ width:size, margin:"0 auto", perspective:"620px", touchAction:"pan-y", ...style }}
      onPointerMove={onMove} onPointerLeave={onLeave} onTouchMove={onMove} onTouchEnd={onLeave}>
      <div style={{ transform:`rotateY(${tilt.x}deg) rotateX(${-tilt.y}deg)`,
        transformStyle:"preserve-3d", transition:"transform .3s ease-out" }}>
        <div style={{ position:"relative", width:"100%", paddingTop:"104.2%",
          transformStyle:"preserve-3d", animation:"hoverFloat 3.1s ease-in-out infinite" }}>
          <div style={{ position:"absolute", inset:0, transform:"translateZ(-26px)" }}>
            <div className="millyGlow" aria-hidden="true" />
            <img src={M_WING_L} alt="" style={{ position:"absolute", inset:0, width:"100%",
              transformOrigin:"27.8% 44%", animation:`flapL ${flapDur}s ease-in-out infinite` }} />
            <img src={M_WING_R} alt="" style={{ position:"absolute", inset:0, width:"100%",
              transformOrigin:"72.5% 43.3%", animation:`flapR ${flapDur}s ease-in-out infinite` }} />
          </div>
          <img src={M_BODY} alt="ミリィ" style={{ position:"absolute", inset:0, width:"100%",
            transformOrigin:"50% 62%", animation:"breathe 3.6s ease-in-out infinite" }} />
          <img src={M_HALO} alt="" aria-hidden="true" style={{ position:"absolute", inset:0, width:"100%",
            animation:"haloBob 3.2s ease-in-out infinite" }} />
        </div>
        <div className="hoverShadow" aria-hidden="true" />
      </div>
    </div>
  );
}

const LAYER_NAMES = { 1:"ゆうやけの層", 2:"たそがれの層", 3:"ほしぞらの層" };
function StepBadge({n}){
  return (
    <div style={{ display:"inline-flex", alignItems:"center", gap:8 }}>
      <span style={{ fontFamily:F_HEAD, fontSize:12, color:"#fff",
        background:RAINBOW, borderRadius:999, padding:"5px 16px", letterSpacing:".12em" }}>
        STEP {n} / 3
      </span>
      <span style={{ fontFamily:F_HAND, fontSize:12, color:"#8A96BC" }}>✦ {LAYER_NAMES[n]}</span>
    </div>
  );
}

/* ---------- dreamy background: clouds / rainbow / twinkles ---------- */
const SKYS = [
  "linear-gradient(180deg,#EAF5FF,#FFE9F3)",                                  /* 0 ひるの空 */
  "linear-gradient(180deg,#DCEBFF 0%,#FFDCE4 55%,#FFE7CC 100%)",              /* 1 ゆうやけ */
  "linear-gradient(180deg,#C9DAFF 0%,#DACEF8 55%,#F7D6E8 100%)",              /* 2 たそがれ */
  "linear-gradient(180deg,#93A9E4 0%,#A794E2 55%,#CBA9DF 100%)",              /* 3 ほしぞら */
  "linear-gradient(180deg,#7E93DC 0%,#8F7FD4 45%,#BE93D6 100%)",              /* 4 ねがいの宇宙 */
];
const STAR_DOTS = [
  [6,8,3],[14,22,2],[24,6,3],[33,16,2],[44,9,3],[52,20,2],[63,7,3],[72,15,2],[83,10,3],[92,22,2],
  [9,38,2],[28,44,3],[48,36,2],[68,42,3],[88,38,2],
  [12,60,3],[34,66,2],[56,58,3],[78,64,2],[94,58,3],
  [8,82,2],[26,88,3],[47,80,2],[66,90,3],[85,82,2],[96,74,2],
];
function DreamLayer({ phase }){
  const starOp  = [0, .25, .55, .85, 1][phase];
  const cloudOp = [1, .9, .7, .45, .3][phase];
  const clouds = [
    { top:"7%",  size:110, dur:75,  delay:-10, op:.95 },
    { top:"18%", size:70,  dur:100, delay:-55, op:.75 },
    { top:"34%", size:130, dur:130, delay:-90, op:.55 },
    { top:"52%", size:85,  dur:90,  delay:-25, op:.65 },
    { top:"68%", size:115, dur:115, delay:-70, op:.5  },
    { top:"84%", size:75,  dur:105, delay:-40, op:.6  },
  ];
  const twinkles = [
    [8,12],[22,6],[38,17],[55,8],[72,14],[88,10],
    [12,44],[90,40],[6,72],[30,88],[64,92],[93,78],
  ];
  return (
    <div aria-hidden="true" style={{ position:"fixed", inset:0, overflow:"hidden", pointerEvents:"none", zIndex:0 }}>
      {SKYS.map((g, i) => (
        <div key={i} style={{ position:"absolute", inset:0, background:g,
          opacity: phase === i ? 1 : 0, transition:"opacity 1.8s ease" }} />
      ))}
      <div className="rainbowArc" style={{ opacity: phase <= 2 ? .8 : .35, transition:"opacity 1.8s ease" }} />
      <div className="moon" style={{ opacity: phase >= 2 ? .95 : 0, transition:"opacity 1.8s ease" }} />
      {phase >= 3 && <div className="aurora" />}
      <div style={{ position:"absolute", inset:0, opacity:starOp, transition:"opacity 1.8s ease" }}>
        {STAR_DOTS.map(([x, y, s], i) => (
          <span key={i} className="star" style={{ left:x+"%", top:y+"%", width:s, height:s,
            animationDelay:(i * 0.31) % 2.6 + "s" }} />
        ))}
      </div>
      <div style={{ position:"absolute", inset:0, opacity:cloudOp, transition:"opacity 1.8s ease" }}>
        {clouds.map((c, i) => (
          <div key={i} className="cloud" style={{ top:c.top, width:c.size, height:c.size*0.38,
            opacity:c.op, animationDuration:c.dur+"s", animationDelay:c.delay+"s" }} />
        ))}
      </div>
      {twinkles.map(([x, y], i) => (
        <span key={i} className="twinkle" style={{ left:x+"%", top:y+"%", animationDelay:(i*0.55)+"s" }}>✦</span>
      ))}
      {phase === 4 && (
        <>
          <span className="shooting" style={{ left:"8%",  top:"10%" }} />
          <span className="shooting" style={{ left:"55%", top:"5%",  animationDelay:"2.3s" }} />
          <span className="shooting" style={{ left:"30%", top:"26%", animationDelay:"4.1s" }} />
        </>
      )}
    </div>
  );
}

/* 最前面をただよう光の粒（タッチは透過） */
function MoteLayer(){
  return (
    <div aria-hidden="true" style={{ position:"fixed", inset:0, overflow:"hidden",
      pointerEvents:"none", zIndex:5 }}>
      {[14, 32, 50, 66, 82, 92, 24, 42, 74].map((x, i) => (
        <span key={i} className="mote" style={{ left:x+"%",
          animationDuration:(13 + i*2.1)+"s", animationDelay:(-i*2.9)+"s" }} />
      ))}
    </div>
  );
}

/* ==================================================================== */
export default function App(){
  const [screen, setScreen] = useState("key");   // key|vent|step1|step2|step3|reveal|order|list
  const [apiKey, setApiKey] = useState("");
  const [keyInput, setKeyInput] = useState("");
  const [online, setOnline] = useState(false);
  const [vent, setVent] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [negOptions, setNegOptions] = useState([]);
  const [desOptions, setDesOptions] = useState([]);
  const [emoOptions, setEmoOptions] = useState([]);
  const [chosenNeg, setChosenNeg] = useState("");
  const [chosenDes, setChosenDes] = useState(null);
  const [chosenEmo, setChosenEmo] = useState(null);
  const [negSeen, setNegSeen] = useState([]);
  const [desSeen, setDesSeen] = useState([]);
  const [emoSeen, setEmoSeen] = useState([]);
  const [wishes, setWishes] = useState([]);
  const [saved, setSaved] = useState(false);
  const [orderDone, setOrderDone] = useState(false);
  const [showKeyHelp, setShowKeyHelp] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("ミリィが、心の声に耳をすませているよ…");
  const [country, setCountry] = useState({ name:"", count:0 });
  const [countryName, setCountryName] = useState("");
  const [birthInput, setBirthInput] = useState("");
  const [guardianJustBorn, setGuardianJustBorn] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [gInput, setGInput] = useState("");
  const [gReply, setGReply] = useState("");
  const [gTalking, setGTalking] = useState(false);
  const [talkOpen, setTalkOpen] = useState(false);
  const [birthTime, setBirthTime] = useState("");
  const [moonAsk, setMoonAsk] = useState(null); /* {cands:[k1,k2], date, time} */
  const [rebirthAsk, setRebirthAsk] = useState(false);
  const topRef = useRef(null);

  useEffect(() => {
    const k = store.get("negaigumo_key") || "";
    if(k && k.indexOf("gsk_") === 0){ setApiKey(k); setOnline(true); setScreen("kingdom"); }
    setWishes(loadWishes());
    setCountry(loadCountry());
    try { const b = document.getElementById("boot"); if(b) b.remove(); } catch(e){}
  }, []);

  useEffect(() => { try { window.scrollTo({top:0, behavior:"smooth"}); } catch(e){} }, [screen]);

  function startWithKey(){
    const k = keyInput.trim();
    if(k.indexOf("gsk_") === 0){
      store.set("negaigumo_key", k);
      setApiKey(k); setOnline(true);
    } else {
      store.del("negaigumo_key");
      setApiKey(""); setOnline(false);
    }
    setNotice("");
    if(!store.get("negaigumo_seen_help")){ store.set("negaigumo_seen_help", "1"); setScreen("help"); }
    else setScreen("kingdom");
  }
  function startOffline(){
    store.del("negaigumo_key");
    setApiKey(""); setOnline(false); setNotice("");
    if(!store.get("negaigumo_seen_help")){ store.set("negaigumo_seen_help", "1"); setScreen("help"); }
    else setScreen("kingdom");
  }

  async function askAI(sys, user, offlineFn){
    if(online && apiKey){
      const j = await callGroq(apiKey, sys, user);
      if(j) return { options:j.options, offline:false };
      return { options: offlineFn(), offline:true, fellBack:true };
    }
    await new Promise(r => setTimeout(r, 700));
    return { options: offlineFn(), offline:true };
  }

  async function goStep1(regen){
    if(!vent.trim()) return;
    setLoadingMsg("ミリィが、ことばの奥に耳をすませているよ…");
    setLoading(true); setNotice("");
    const exclude = regen ? negSeen : [];
    let user = `愚痴：「${vent.trim()}」\nこの愚痴の奥にある"痛み"の候補を3つ、それぞれ別々の感情で、重複なく出してください。`;
    if(exclude.length) user += `\n以下は提示済みです。これらと重複・類似しない、新しい切り口の候補を出してください：${exclude.map(s => "「" + s + "」").join("、")}`;
    const r = await askAI(NEG_SYS, user, () => offlinePick(NEG_BANK, NEG_DEFAULT, vent, exclude, o => o));
    const opts = r.options.slice(0,3).map(o => fixNeg(typeof o === "string" ? o : String(o)));
    setNegOptions(opts);
    setNegSeen(exclude.concat(opts));
    if(r.fellBack) setNotice("通信がうまくいかなかったので、ミリィの直感でお届けします。");
    setLoading(false); setScreen("step1");
  }

  async function goStep2(neg, regen){
    setChosenNeg(neg);
    setLoadingMsg("痛みを、そっと裏返しているよ…");
    setLoading(true); setNotice("");
    const exclude = regen ? desSeen : [];
    let user = `愚痴：「${vent.trim()}」\n選ばれた痛み：「${neg}」\nこの痛みを裏返した「本当はこんな自分でいたかった」の候補を3つ、同じ方向の別の側面で、重複なく出してください。`;
    if(exclude.length) user += `\n以下は提示済みです。これらと重複・類似しない、新しい切り口の候補を出してください：${exclude.map(s => "「" + s + "」").join("、")}`;
    const r = await askAI(DES_SYS, user, () => offlinePick(DES_BANK, DES_DEFAULT, neg, exclude, o => o.wish));
    const opts = r.options.slice(0,3).map(o => ({ wish: fixWish(o && o.wish), vow: (o && o.vow) || "" }));
    setDesOptions(opts);
    setDesSeen(exclude.concat(opts.map(o => o.wish)));
    if(r.fellBack) setNotice("通信がうまくいかなかったので、ミリィの直感でお届けします。");
    setLoading(false); setScreen("step2");
  }

  async function goStep3(des, regen){
    setChosenDes(des);
    setLoadingMsg("願いの核へ、のぼっていくよ…");
    setLoading(true); setNotice("");
    const exclude = regen ? emoSeen : [];
    let user = `愚痴：「${vent.trim()}」\n選ばれた痛み：「${chosenNeg}」\nなりたい自分：「${des.vow}」\nこの自分像の奥で本当に欲しかった気持ち・状態の候補を3つ、同じ核の別の濃淡で、重複なく出してください。`;
    if(exclude.length) user += `\n以下は提示済みです。これらと重複・類似しない、新しい切り口の候補を出してください：${exclude.map(s => "「" + s + "」").join("、")}`;
    const r = await askAI(EMO_SYS, user, () => offlinePick(EMO_BANK, EMO_DEFAULT, des.vow + des.wish, exclude, o => o.emotion));
    const opts = r.options.slice(0,3).map(o => ({ emotion:(o && o.emotion) || "", note:(o && o.note) || "" }));
    setEmoOptions(opts);
    setEmoSeen(exclude.concat(opts.map(o => o.emotion)));
    if(r.fellBack) setNotice("通信がうまくいかなかったので、ミリィの直感でお届けします。");
    setLoading(false); setScreen("step3");
  }

  async function goReveal(emo){
    setChosenEmo(emo); setSaved(false);
    setLoadingMsg("ねがいの空へ──");
    setLoading(true);
    await new Promise(r => setTimeout(r, 1100));
    setLoading(false); setScreen("reveal");
  }

  function saveWish(){
    const w = {
      id: Date.now(),
      neg: chosenNeg,
      wish: chosenDes ? chosenDes.wish : "",
      vow: chosenDes ? chosenDes.vow : "",
      emo: chosenEmo ? chosenEmo.emotion : "",
      note: chosenEmo ? chosenEmo.note : "",
    };
    const next = [w, ...wishes];
    setWishes(next); saveWishes(next); setSaved(true);
    setScreen("list");
  }

  function restart(){
    setVent(""); setNegOptions([]); setDesOptions([]); setEmoOptions([]);
    setChosenNeg(""); setChosenDes(null); setChosenEmo(null);
    setNegSeen([]); setDesSeen([]); setEmoSeen([]);
    setSaved(false); setNotice(""); setScreen("vent");
  }

  const [demoMode, setDemoMode] = useState(() => {
    try { return /demo=1|#demo/.test(window.location.href); } catch(e){ return false; }
  });
  const demoTaps = useRef(0);
  function footerTap(){
    demoTaps.current += 1;
    if(demoTaps.current >= 5){ demoTaps.current = 0; setDemoMode(v => !v); }
  }

  function fillDemoWishes(){
    const samples = [
      { neg:"どれだけ頑張っても認めてもらえないのではと、悔しさがこみ上げた", vow:"自分の頑張りを自分で誇る", emo:"自分を誇れる充実感" },
      { neg:"この忙しさがずっと続くのではないかと、不安で胸が重くなった", vow:"未来を信じて今日を生きる", emo:"未来を信じられる安心感" },
      { neg:"大切にされていないのではと、悲しくなった", vow:"自分の気持ちを素直に伝える", emo:"伝え合える絆" },
      { neg:"どうして分かってくれないのかと、もどかしさで胸が締め付けられた", vow:"落ち着いて思いを伝える", emo:"分かり合えているという確信" },
      { neg:"家族なのに分かり合えていないのではと、寂しくなった", vow:"心を開いて向き合う", emo:"心が通い合う温かさ" },
      { neg:"自分だけが気を遣っている気がして、悔しくなった", vow:"自分から動く", emo:"胸が高鳴るわくわく" },
      { neg:"このままではやっていけないのではと、不安で落ち着かなくなった", vow:"どっしり構えて今を楽しむ", emo:"満ち足りた穏やかさ" },
      { neg:"自分には続ける力がないのではと、無力感を覚えた", vow:"小さな一歩を積み重ねる", emo:"自分の力を信じられる確信" },
      { neg:"また同じことを繰り返すのではと、自分に腹が立った", vow:"できたことに目を向ける", emo:"胸を張れる誇らしさ" },
      { neg:"このまま変われないのではないかと、焦りがこみ上げた", vow:"自分の可能性を信じる", emo:"前に進む晴れやかさ" },
    ];
    const next = samples.map((s, i) => ({ id: Date.now() + i, ...s, wish:"", note:"" })).concat(wishes);
    setWishes(next); saveWishes(next);
  }

  function deleteWish(id){
    const next = wishes.filter(w => w.id !== id);
    setWishes(next); saveWishes(next);
  }

  async function growCountry(){
    const name = country.name || countryName.trim() || "ねがいの国";
    const log = [...(country.log || [])];
    log[country.count] = orderResult ? orderResult.essence : "";
    const next = { name, count: country.count + 1, guardian: country.guardian || null, log };
    if(!next.guardian && birthInput){
      setLoadingMsg("この国の守り神が、うまれようとしています──");
      setLoading(true);
      const g = await birthGuardian(birthInput, birthTime);
      setLoading(false);
      if(g && g.needMoon){
        setMoonAsk({ cands: g.needMoon, date: birthInput, time: birthTime });
      } else if(g){
        g.bond = country.exBond || 0;
        next.guardian = g; next.exBond = 0; setGuardianJustBorn(true);
      }
    }
    setCountry(next); saveCountry(next);
    setWishes([]); saveWishes([]);
    setOrderDone(false); setCountryName(""); setBirthInput(""); setBirthTime(""); setOrderResult(null);
    setScreen("kingdom");
  }

  async function birthGuardian(dateStr, timeStr, forcedMoon){
    const parts = dateStr.split("-");
    const y = parseInt(parts[0], 10), m = parseInt(parts[1], 10), d = parseInt(parts[2], 10);
    if(!(m >= 1 && m <= 12 && d >= 1 && d <= 31)) return null;
    const z = sunSpecies(m, d);
    const sunKey = ZKEYS[z];
    const lifePath = getLifePath(y, m, d);
    let moonKey = forcedMoon || null;
    if(!moonKey){
      let hour = null;
      if(timeStr){
        const tp = timeStr.split(":");
        hour = parseInt(tp[0], 10) + (parseInt(tp[1], 10) || 0) / 60;
      }
      const r = getMoonSign(y, m, d, hour === null ? undefined : hour);
      if(!r.confident) return { needMoon: r.candidates };
      moonKey = r.sign;
    }
    let coreText = null;
    if(online && apiKey){
      try{
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method:"POST",
          headers:{ "Content-Type":"application/json", "Authorization":"Bearer " + apiKey },
          body: JSON.stringify({ model:"openai/gpt-oss-120b", temperature:0.9, max_tokens:300,
            messages:[{ role:"user", content: buildBirthPrompt(TANE[sunKey], KAZU[lifePath], TSUKI[moonKey]) }] }),
        });
        if(res.ok){
          const data = await res.json();
          const t = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content || "").trim();
          if(t) coreText = t;
        }
      }catch(e){}
    }
    const card = buildCard({ sunKey, lifePath, moonKey, coreText });
    return { z, sunKey, lifePath, moonKey, card,
      born: new Date().toLocaleDateString("ja-JP"),
      bond: 0, lastTalk: Date.now() };
  }

  async function castOrder(){
    const ten = wishes.slice(0, 10);
    const emos = ten.map(w => w.emo).filter(Boolean);
    setLoadingMsg("10の願いを、ひとつの光に束ねています──");
    setLoading(true);
    let result = null;
    if(online && apiKey){
      const user = `10の願い（本当に欲しかった気持ち）：\n${emos.map((e,i) => `${i+1}. ${e}`).join("\n")}\nこの10個を、ひとつの核の願いに昇華してください。`;
      const j = await callGroq(apiKey, ORDER_SYS, user);
      if(j && j.essence && j.order) result = { essence: String(j.essence), order: String(j.order) };
      else if(j && j.options && j.options[0] && j.options[0].essence) result = j.options[0];
    }
    if(!result){
      await new Promise(r => setTimeout(r, 900));
      const freq = {}; let best = emos[0] || "満ち足りた幸福感";
      for(const e of emos){ freq[e] = (freq[e] || 0) + 1; if(freq[e] > (freq[best] || 0)) best = e; }
      result = { essence: best, order: `わたしの世界は、「${best}」で満たされています。` };
    }
    setOrderResult(result);
    setOrderDone(true);
    setLoading(false);
  }

  const GCHAT_KEY = "negaigumo_gchat";
  function loadGChat(){ try { return JSON.parse(store.get(GCHAT_KEY) || "[]") || []; } catch(e){ return []; } }

  async function talkToGuardian(){
    const msg = gInput.trim();
    if(!msg || !country.guardian || gTalking) return;
    setGTalking(true); setGInput("");
    const g = country.guardian;
    const t = TANE[g.sunKey || ZKEYS[g.z]] || TANE[ZKEYS[g.z]];
    const k = KAZU[g.lifePath || 1];
    const daysAway = g.lastTalk ? Math.floor((Date.now() - g.lastTalk) / 86400000) : 0;
    const wingStage = Math.min(5, Math.floor((g.bond || 0) / 5));
    let reply = null;
    if(online && apiKey && g.card){
      const history = loadGChat().slice(-6);
      reply = await callGroqChat(apiKey, buildGuardianSystem(g.card, { wingStage, daysAway }), history, msg);
    }
    if(!reply){
      const pool = [
        "うん、きいてるよ。" + (k ? k.kuse : "そばにいるね。"),
        "そっか…。話してくれて、うれしいな。",
        "だいじょうぶ。きょうも、そばにいるからね。",
        (t ? t.core.split("。")[0] + "な、わたしがついてるよ。" : "わたしがついてるよ。"),
      ];
      await new Promise(r => setTimeout(r, 600));
      reply = pool[(g.bond || 0) % pool.length];
    }
    const hist = loadGChat().concat([{ role:"user", content: msg }, { role:"assistant", content: reply }]).slice(-12);
    store.set(GCHAT_KEY, JSON.stringify(hist));
    const nextG = { ...g, bond:(g.bond || 0) + 1, lastTalk: Date.now() };
    const next = { ...country, guardian: nextG };
    setCountry(next); saveCountry(next);
    setGReply(reply);
    setGTalking(false);
  }

  async function inviteGuardian(){
    if(!birthInput || country.guardian) return;
    setLoadingMsg("この国の守り神が、うまれようとしています──");
    setLoading(true);
    const g = await birthGuardian(birthInput, birthTime);
    setLoading(false);
    if(!g) return;
    if(g.needMoon){
      setMoonAsk({ cands: g.needMoon, date: birthInput, time: birthTime });
      return;
    }
    g.bond = country.exBond || 0;
    const next = { ...country, guardian: g, exBond: 0 };
    setCountry(next); saveCountry(next);
    setGuardianJustBorn(true); setBirthInput(""); setBirthTime("");
  }

  function startRebirth(){
    const g = country.guardian;
    if(!g) return;
    const next = { ...country, guardian: null, exBond: g.bond || 0 };
    setCountry(next); saveCountry(next);
    setRebirthAsk(false); setGReply("");
  }

  async function resumeBirth(chosenMoon){
    const ask = moonAsk;
    setMoonAsk(null);
    setLoadingMsg("この国の守り神が、うまれようとしています──");
    setLoading(true);
    const g = await birthGuardian(ask.date, ask.time, chosenMoon);
    setLoading(false);
    if(!g || g.needMoon) return;
    g.bond = country.exBond || 0;
    const next = { ...country, guardian: g, exBond: 0 };
    setCountry(next); saveCountry(next);
    setGuardianJustBorn(true); setBirthInput(""); setBirthTime("");
    setScreen("kingdom");
  }

  const narrate = (w) => `「${w.neg}」が嫌で、${w.vow}という私でいたくて、本当は「${w.emo}」が欲しかった`;

  function millyLine(n){
    if(n === 1) return "はじめての願い、みつけたね！ミリィが大切にあずかっておくよ";
    if(n === 5) return "5個目！願いの雲が、ふんわりふくらんできたよ";
    if(n >= 10) return "10個そろったよ…！ひとつの、おおきな願いにたばねるときが きたみたい";
    return n + "個目の願い、たしかにあずかったよ！";
  }

  const PHASE_MAP = { key:0, vent:0, list:2, step1:1, step2:2, step3:3, reveal:4, order:4, kingdom:4, help:0 };
  const phase = PHASE_MAP[screen] != null ? PHASE_MAP[screen] : 0;

  /* ---------------- render helpers ---------------- */
  const header = (
    <header style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
      flexWrap:"wrap", gap:10, padding:"14px 4px 18px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}
        onClick={() => setScreen("kingdom")}>
        <Milly src={MILLY_STD} size={44} style={{ filter:"drop-shadow(0 3px 6px rgba(150,170,220,.4))" }} />
        <span style={{ fontFamily:F_HEAD, fontSize:22, letterSpacing:".06em",
          background:RAINBOW, backgroundSize:"200% 100%", WebkitBackgroundClip:"text",
          backgroundClip:"text", color:"transparent", animation:"hueSlide 7s linear infinite" }}>
          ねがいぐも
        </span>
      </div>
      <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
        <button className="btnG" style={{ ...btnGhost, whiteSpace:"nowrap" }} onClick={() => setScreen("help")}>？ あそびかた</button>
        <button className="btnG" style={{ ...btnGhost, whiteSpace:"nowrap" }} onClick={() => { setKeyInput(""); setScreen("key"); }}>鍵を変更</button>
        <button className="btnG" style={{ ...btnGhost, whiteSpace:"nowrap" }} onClick={() => { setSaved(false); setScreen("list"); }}>
          願い事リスト{wishes.length ? `（${wishes.length}）` : ""}
        </button>
      </div>
    </header>
  );

  const modeBadge = (
    <div style={{ textAlign:"center", marginBottom:14 }}>
      <span style={{ fontFamily:F_BODY, fontSize:11, fontWeight:700, borderRadius:999, padding:"4px 14px",
        color: online ? "#3E8E67" : "#8A7FB8",
        background: online ? "rgba(190,240,215,.6)" : "rgba(225,215,250,.6)" }}>
        {online ? "オンライン（Groq接続中）" : "オフラインモード"}
      </span>
    </div>
  );

  const loadingView = (
    <div style={{ textAlign:"center", padding:"64px 0 72px", position:"relative", overflow:"hidden" }}>
      <div aria-hidden="true" style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
        {[0,1,2,3,4,5].map(i => (
          <span key={i} className="streak" style={{ left:(10 + i*15.5)+"%", animationDelay:(i*0.28)+"s" }} />
        ))}
      </div>
      <div style={{ position:"relative", width:170, margin:"0 auto" }}>
        <MillyPuppet size={155} flapDur={1.15} />
        <span className="twinkle" style={{ left:-10, top:22, animationDelay:"0s" }}>✦</span>
        <span className="twinkle" style={{ right:-8, top:52, animationDelay:".9s" }}>✦</span>
        <span className="twinkle" style={{ left:26, bottom:-4, animationDelay:"1.7s" }}>✦</span>
      </div>
      <p style={{ fontFamily:F_HAND, fontSize:16, marginTop:24, position:"relative",
        color: phase >= 3 ? "rgba(255,255,255,.95)" : "#66739F",
        textShadow: phase >= 3 ? "0 1px 10px rgba(90,80,160,.6)" : "none" }}>
        {loadingMsg}
      </p>
    </div>
  );

  function renderScreen(){
    if(loading) return loadingView;

    if(moonAsk) return (
      <div style={{ ...cardStyle, textAlign:"center" }}>
        <div className="moon" aria-hidden="true" style={{ position:"relative", right:"auto", top:"auto",
          width:72, height:72, margin:"6px auto 12px" }} />
        <p style={{ fontFamily:F_HAND, fontSize:14.5, lineHeight:2, color:"#5B6BA8", margin:"0 0 14px",
          textWrap:"balance" }}>
          生まれた日、お月さまが<br/>ふたつの心のあいだを渡っていたみたい。<br/>あなたに近いのは、どっち？
        </p>
        {moonAsk.cands.map((k, i) => (
          <button key={i} className="opt" style={{ ...optionBtn, textAlign:"center",
            animation:`fadeUp .45s ${i*0.12}s both ease-out` }}
            onClick={() => resumeBirth(k)}>
            {TSUKI[k].yasuragi}
          </button>
        ))}
      </div>
    );

    if(screen === "key") return (
      <div style={{ ...cardStyle, textAlign:"center" }}>
        <MillyPuppet size={190} style={{ margin:"6px auto 4px" }} />
        <h1 style={{ fontFamily:F_HEAD, fontSize:23, color:"#5B6BA8", margin:"8px 0 4px" }}>ねがいぐもを ひらく鍵</h1>
        <p style={{ fontFamily:F_BODY, fontSize:14, lineHeight:1.9, color:"#6E7A9E", margin:"6px 0 4px" }}>
          痛みの奥にかくれている「ほんとうの願い」を、<br/>天使イルカのミリィと一緒に見つけにいこう。
        </p>
        <p style={{ fontFamily:F_HAND, fontSize:13, lineHeight:1.9, color:"#8A96BC", margin:"0 0 16px" }}>
          ミリィがあなたの言葉を読みとくために、<br/>AIの鍵（Groq APIキー）を使うよ。
        </p>
        <input
          type="password"
          value={keyInput}
          onChange={e => setKeyInput(e.target.value)}
          placeholder="gsk_ から始まるGroqの鍵を貼り付け"
          style={{ width:"100%", boxSizing:"border-box", fontFamily:F_BODY, fontSize:14,
            padding:"13px 16px", borderRadius:14, border:"1.5px solid #D7E3F7",
            background:"#F7FAFF", color:"#4A5578", outline:"none" }}
        />
        <p style={{ fontFamily:F_BODY, fontSize:11, lineHeight:1.8, color:"#9AA6C8", margin:"8px 0 16px" }}>
          鍵はこの端末の中にだけ保存されます。<br/>Groqの無料枠の範囲で動くので、料金はかかりません。
        </p>
        <div style={{ display:"flex", flexDirection:"column", gap:10, alignItems:"center" }}>
          <button className="btnP" style={btnPrimary} onClick={startWithKey}>ねがいぐもを ひらく</button>
          <button className="btnG" style={btnGhost} onClick={startOffline}>鍵なしでためす（やさしい候補で遊ぶ）</button>
        </div>
        <div style={{ marginTop:20, paddingTop:16, borderTop:"1.5px dashed #E3ECFA" }}>
          <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer"
            style={{ fontFamily:F_BODY, fontWeight:700, fontSize:13, color:"#6E8FD8" }}>
            無料でGroqの鍵を取得する（カード不要）→
          </a>
          <div style={{ marginTop:8 }}>
            <button className="btnG" style={{ ...btnGhost, fontSize:12 }} onClick={() => setShowKeyHelp(!showKeyHelp)}>
              {showKeyHelp ? "とじる" : "取り方を見る"}
            </button>
          </div>
          {showKeyHelp && (
            <ol style={{ textAlign:"left", fontFamily:F_BODY, fontSize:12.5, lineHeight:2,
              color:"#6E7A9E", margin:"12px 0 0", paddingLeft:22 }}>
              <li>上のリンクからGroqのサイトを開く（無料登録・カード不要）</li>
              <li>Googleアカウントかメールアドレスでサインアップ</li>
              <li>「Create API Key」を押して、好きな名前をつける</li>
              <li>表示された「gsk_」から始まる文字列をコピーして、ここに貼り付け</li>
            </ol>
          )}
        </div>
      </div>
    );

    if(screen === "vent") return (
      <div>
        {modeBadge}
        <div style={{ ...cardStyle }}>
          <div style={{ display:"flex", alignItems:"flex-end", gap:12 }}>
            <MillyPuppet size={92} style={{ margin:0 }} flapDur={2.1} />
            <div style={{ position:"relative", flex:1, background:"#F4F9FF", borderRadius:"18px 18px 18px 4px",
              padding:"12px 14px", fontFamily:F_HAND, fontSize:14.5, lineHeight:1.8, color:"#5B6BA8" }}>
              今日はどんなことがあった?<br/>モヤモヤ、そのまま話してみて。
            </div>
          </div>
          <textarea
            value={vent}
            onChange={e => setVent(e.target.value)}
            rows={5}
            maxLength={300}
            placeholder="例）頑張って準備したのに、誰にも気づいてもらえなかった…"
            style={{ width:"100%", boxSizing:"border-box", marginTop:16, fontFamily:F_BODY, fontSize:15,
              lineHeight:1.8, padding:"14px 16px", borderRadius:16, border:"1.5px solid #D7E3F7",
              background:"#FDFDFF", color:"#4A5578", outline:"none", resize:"vertical" }}
          />
          <div style={{ textAlign:"right", fontFamily:F_BODY, fontSize:11, color:"#B0BBD8", marginTop:4 }}>
            {vent.length} / 300
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:10, alignItems:"center", marginTop:14 }}>
            <button className="btnP" style={{ ...btnPrimary, opacity: vent.trim() ? 1 : .5 }} disabled={!vent.trim()} onClick={goStep1}>
              ミリィに聞いてもらう
            </button>
            <button className="btnG" style={btnGhost} onClick={() => setScreen("kingdom")}>☁ 国へもどる</button>
          </div>
        </div>
      </div>
    );

    if(screen === "step1") return (
      <div>
        {notice && <p style={{ fontFamily:F_BODY, fontSize:12, color:"#B08AC4", textAlign:"center", marginBottom:10 }}>{notice}</p>}
        <div style={{ ...cardStyle }}>
          <StepBadge n={1} />
          <h2 style={{ fontFamily:F_HEAD, fontSize:18, color:"#5B6BA8", margin:"12px 0 4px" }}>その愚痴の奥にあった痛み</h2>
          <p style={{ fontFamily:F_BODY, fontSize:13.5, lineHeight:1.8, color:"#6E7A9E", margin:"0 0 6px" }}>
            心にいちばん近いものを、ひとつ選んでね。
          </p>
          {negOptions.map((o, i) => (
            <button key={i} className="opt" style={{ ...optionBtn, animation:`fadeUp .45s ${i*0.12}s both ease-out` }} onClick={() => goStep2(o)}>{o}</button>
          ))}
          <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap", marginTop:18 }}>
            <button className="btnG" style={btnGhost} onClick={() => goStep1(true)}>🔁 別の候補を見る</button>
            <button className="btnG" style={btnGhost} onClick={() => setScreen("vent")}>← 愚痴を書き直す</button>
          </div>
        </div>
      </div>
    );

    if(screen === "step2") return (
      <div>
        {notice && <p style={{ fontFamily:F_BODY, fontSize:12, color:"#B08AC4", textAlign:"center", marginBottom:10 }}>{notice}</p>}
        <div style={{ ...cardStyle }}>
          <StepBadge n={2} />
          <h2 style={{ fontFamily:F_HEAD, fontSize:18, color:"#5B6BA8", margin:"12px 0 4px" }}>本当は、こんな自分でいたかった</h2>
          <p style={{ fontFamily:F_BODY, fontSize:13.5, lineHeight:1.8, color:"#6E7A9E", margin:"0 0 6px" }}>
            「{chosenNeg}」の裏側には──
          </p>
          {desOptions.map((o, i) => (
            <button key={i} className="opt" style={{ ...optionBtn, animation:`fadeUp .45s ${i*0.12}s both ease-out` }} onClick={() => goStep3(o)}>{o.wish}</button>
          ))}
          <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap", marginTop:18 }}>
            <button className="btnG" style={btnGhost} onClick={() => goStep2(chosenNeg, true)}>🔁 別の候補を見る</button>
            <button className="btnG" style={btnGhost} onClick={() => setScreen("step1")}>← 痛みを選び直す</button>
          </div>
        </div>
      </div>
    );

    if(screen === "step3") return (
      <div>
        {notice && <p style={{ fontFamily:F_BODY, fontSize:12, color:"#B08AC4", textAlign:"center", marginBottom:10 }}>{notice}</p>}
        <div style={{ ...cardStyle }}>
          <StepBadge n={3} />
          <h2 style={{ fontFamily:F_HEAD, fontSize:18, color:"#5B6BA8", margin:"12px 0 4px" }}>その奥で、本当に欲しかったもの</h2>
          <p style={{ fontFamily:F_BODY, fontSize:13.5, lineHeight:1.8, color:"#6E7A9E", margin:"0 0 6px" }}>
            「{chosenDes ? chosenDes.vow : ""}という私」の核にあるのは──
          </p>
          {emoOptions.map((o, i) => (
            <button key={i} className="opt" style={{ ...optionBtn, animation:`fadeUp .45s ${i*0.12}s both ease-out` }} onClick={() => goReveal(o)}>
              <span style={{ fontWeight:700, color:"#5B6BA8" }}>{o.emotion}</span>
              <span style={{ display:"block", fontSize:12.5, color:"#8A96BC", marginTop:4 }}>{o.note}</span>
            </button>
          ))}
          <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap", marginTop:18 }}>
            <button className="btnG" style={btnGhost} onClick={() => goStep3(chosenDes, true)}>🔁 別の候補を見る</button>
            <button className="btnG" style={btnGhost} onClick={() => setScreen("step2")}>← なりたい自分を選び直す</button>
          </div>
        </div>
      </div>
    );

    if(screen === "reveal"){
      const emo = chosenEmo ? chosenEmo.emotion : "";
      const big = emo.length > 16;
      return (
        <div style={{ ...cardStyle, textAlign:"center", position:"relative", overflow:"hidden" }}>
          <div aria-hidden="true" style={{ position:"absolute", inset:0, pointerEvents:"none",
            background:"radial-gradient(circle at 20% 15%, rgba(190,220,255,.35), transparent 45%), radial-gradient(circle at 85% 80%, rgba(255,200,225,.35), transparent 45%)" }} />
          <Milly src={MILLY_WINK} size={140} style={{ margin:"4px auto 8px",
            animation:"pop .8s ease-out both, floaty 2.8s .8s ease-in-out infinite", position:"relative" }} />
          <p style={{ fontFamily:F_BODY, fontSize:14.5, lineHeight:2, color:"#6E7A9E",
            textWrap:"balance", margin:"0 0 4px", position:"relative" }}>
            『{chosenNeg}』が嫌で、
          </p>
          <p style={{ fontFamily:F_BODY, fontSize:14.5, lineHeight:2, color:"#6E7A9E",
            textWrap:"balance", margin:"0 0 14px", position:"relative" }}>
            {chosenDes ? chosenDes.vow : ""}という私でいたくて、
          </p>
          <p style={{ fontFamily:F_HEAD, lineHeight:1.5, letterSpacing:".03em", position:"relative",
            animation:"revealGlow 1.1s .3s both",
            fontSize: big ? "clamp(21px, 6vw, 32px)" : "clamp(27px, 8vw, 42px)",
            textWrap:"balance",
            background:RAINBOW, WebkitBackgroundClip:"text", backgroundClip:"text", color:"transparent",
            margin:"0 0 6px", padding:"0 4px" }}>
            {emo}
          </p>
          <p style={{ fontFamily:F_HEAD, fontSize:17, color:"#5B6BA8", margin:"0 0 8px", position:"relative" }}>
            が欲しかったんだ！
          </p>
          <p style={{ fontFamily:F_HAND, fontSize:13.5, lineHeight:1.9, color:"#8A96BC", margin:"0 0 20px", position:"relative" }}>
            {chosenEmo ? chosenEmo.note : ""}
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:10, alignItems:"center", position:"relative" }}>
            <button className="btnP" style={btnPrimary} onClick={saveWish} disabled={saved}>この願いを保存する</button>
            <button className="btnG" style={btnGhost} onClick={restart}>もう一度 はじめから</button>
          </div>
        </div>
      );
    }

    if(screen === "list"){
      const n = wishes.length;
      const unlocked = n >= 10;
      return (
        <div>
          {saved && (
            <div style={{ display:"flex", alignItems:"flex-end", gap:10, marginBottom:14 }}>
              <Milly src={MILLY_STD} size={64} style={{ animation:"floaty 3s ease-in-out infinite" }} />
              <div style={{ flex:1, background:"rgba(255,255,255,.9)", borderRadius:"18px 18px 18px 4px",
                padding:"11px 14px", fontFamily:F_HAND, fontSize:13.5, lineHeight:1.8, color:"#5B6BA8",
                boxShadow:"0 6px 16px rgba(150,170,220,.2)", animation:"fadeUp .5s both ease-out" }}>
                {millyLine(wishes.length)}
              </div>
            </div>
          )}
          <div style={{ ...cardStyle }}>
            <h2 style={{ fontFamily:F_HEAD, fontSize:19, color:"#5B6BA8", margin:"0 0 4px" }}>願い事リスト</h2>
            <p style={{ fontFamily:F_BODY, fontSize:13, color:"#6E7A9E", margin:"0 0 12px" }}>
              願いが10個そろうと、ひとつの「おおきな願い」にたばねられます。
            </p>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:16 }} aria-label={`願い ${n} / 10`}>
              {Array.from({length:10}).map((_, i) => (
                <span key={i} style={{ width:20, height:14, borderRadius:999,
                  background: i < n ? RAINBOW : "#E7EEFA",
                  boxShadow: i < n ? "0 2px 6px rgba(180,160,230,.4)" : "none" }} />
              ))}
              <span style={{ fontFamily:F_HEAD, fontSize:13, color:"#8A96BC", marginLeft:4 }}>{Math.min(n,10)} / 10</span>
            </div>
            {demoMode && (
              <div style={{ textAlign:"center", marginBottom:12 }}>
                <button className="btnG" style={{ ...btnGhost, fontSize:11, color:"#C49BD8" }} onClick={fillDemoWishes}>
                  🧪 テスト用：サンプルの願いを10個うめる
                </button>
              </div>
            )}
            {n === 0 && (
              <p style={{ fontFamily:F_HAND, fontSize:14, color:"#9AA6C8", textAlign:"center", padding:"18px 0" }}>
                まだ願いはありません。<br/>最初のひとつを、ミリィと見つけにいこう。
              </p>
            )}
            {wishes.map(w => (
              <div key={w.id} style={{ background:"linear-gradient(120deg,#F4F9FF,#FFF3F8)",
                border:"1.5px solid #E3ECFA", borderRadius:18, padding:"14px 16px", marginTop:12 }}>
                <p style={{ fontFamily:F_BODY, fontSize:13.5, lineHeight:1.9, color:"#4A5578", margin:0 }}>
                  {narrate(w)}
                </p>
                <div style={{ textAlign:"right", marginTop:6 }}>
                  <button onClick={() => deleteWish(w.id)}
                    style={{ fontFamily:F_BODY, fontSize:11, color:"#B0BBD8", background:"none",
                      border:"none", cursor:"pointer", textDecoration:"underline" }}>
                    削除
                  </button>
                </div>
              </div>
            ))}
            <div style={{ display:"flex", flexDirection:"column", gap:10, alignItems:"center", marginTop:20 }}>
              {unlocked && (
                <button className="btnP" style={btnPrimary} onClick={() => { setOrderDone(false); setScreen("order"); }}>
                  ✨ 10の願いを、ひとつにたばねる
                </button>
              )}
              <button className="btnG" style={btnGhost} onClick={() => setScreen("kingdom")}>
                ☁ 国へもどる
              </button>
              <button className="btnG" style={btnGhost} onClick={restart}>あたらしい願いを見つける</button>
            </div>
          </div>
        </div>
      );
    }

    if(screen === "order"){
      const ten = wishes.slice(0, 10);
      return (
        <div style={{ ...cardStyle, textAlign:"center" }}>
          <div style={{ position:"relative", width:190, margin:"2px auto 8px" }}>
            <div aria-hidden="true" className="aura" />
            <Milly src={MILLY_SPARKLE} size={170}
              style={{ margin:"0 auto", position:"relative",
                animation:"arrive 1.2s ease-out both, floaty 2.6s 1.2s ease-in-out infinite",
                filter:"drop-shadow(0 0 18px rgba(255,220,150,.75))" }} />
            {orderDone && [...Array(8)].map((_, i) => (
              <span key={i} className="burst" style={{
                left:"50%", top:"50%",
                "--dx": Math.cos(i*Math.PI/4)*95 + "px",
                "--dy": Math.sin(i*Math.PI/4)*95 + "px",
                animationDelay: (i*0.06) + "s" }}>✦</span>
            ))}
          </div>
          <h2 style={{ fontFamily:F_HEAD, fontSize:20, margin:"0 0 6px",
            background:RAINBOW, WebkitBackgroundClip:"text", backgroundClip:"text", color:"transparent" }}>
            おおきな願い
          </h2>
          <p style={{ fontFamily:F_HAND, fontSize:14, lineHeight:1.9, color:"#7A86B8", margin:"0 0 16px" }}>
            10の願いのおくには、ひとつの おおきな願いが眠っています。<br/>ミリィと一緒に、たばねてみよう。
          </p>
          <div style={{ textAlign:"left" }}>
            {ten.map((w, i) => (
              <div key={w.id} style={{ background:"linear-gradient(120deg,#F4F9FF,#FFF3F8)",
                border:"1.5px solid #E3ECFA", borderRadius:18, padding:"13px 16px", marginTop:10,
                animation:`fadeUp .6s ${i*0.12}s both ease-out` }}>
                <span style={{ fontFamily:F_HEAD, fontSize:11, color:"#A9B4D6" }}>ねがい {i+1}</span>
                <p style={{ fontFamily:F_BODY, fontSize:13, lineHeight:1.9, color:"#4A5578", margin:"4px 0 0" }}>
                  {narrate(w)}
                </p>
              </div>
            ))}
          </div>
          {!orderDone ? (
            <div style={{ marginTop:20 }}>
              <button className="btnP" style={btnPrimary} onClick={castOrder}>ひとつに、たばねる</button>
            </div>
          ) : (
            <div style={{ marginTop:20 }}>
              <p style={{ fontFamily:F_HAND, fontSize:12.5, color:"#8A96BC", margin:"0 0 6px" }}>
                10の願いが束ねられて、ひとつの核があらわれました──
              </p>
              <p style={{ fontFamily:F_HEAD, lineHeight:1.6, margin:"0 0 8px", padding:"0 4px",
                fontSize:"clamp(20px, 5.5vw, 30px)", textWrap:"balance",
                animation:"revealGlow 1.1s .2s both",
                background:RAINBOW, WebkitBackgroundClip:"text", backgroundClip:"text", color:"transparent" }}>
                {orderResult ? orderResult.essence : ""}
              </p>
              <p style={{ fontFamily:F_HAND, fontSize:14.5, lineHeight:2, color:"#5B6BA8", margin:"0 0 14px",
                textWrap:"balance" }}>
                {orderResult ? orderResult.order : ""}
              </p>
              <p style={{ fontFamily:F_HEAD, fontSize:15, lineHeight:1.9, margin:"0 0 8px",
                background:RAINBOW, WebkitBackgroundClip:"text", backgroundClip:"text", color:"transparent" }}>
                おおきな願いが、そらに届きました。
              </p>
              <p style={{ fontFamily:F_HAND, fontSize:13.5, lineHeight:1.9, color:"#7A86B8", margin:"0 0 14px" }}>
                たばねた願いは、色になって──<br/>あなたの国の「{(LANDMARKS[Math.min(country.count, 9)] || LANDMARKS[9]).name}」を彩ります。
              </p>
              {!country.guardian && (
                <div style={{ margin:"0 0 12px" }}>
                  <p style={{ fontFamily:F_HAND, fontSize:12.5, lineHeight:1.9, color:"#8A96BC", margin:"0 0 6px",
                    textWrap:"balance" }}>
                    さいごに、あなたが生まれた日を教えて。<br/>──空が、あなたのための"何か"を準備しています✨<br/>（この端末にだけ保存されます）
                  </p>
                  <input
                    type="date"
                    value={birthInput}
                    onChange={e => setBirthInput(e.target.value)}
                    style={{ width:"100%", boxSizing:"border-box", fontFamily:F_BODY, fontSize:14,
                      padding:"11px 16px", borderRadius:14, border:"1.5px solid rgba(255,255,255,.8)",
                      background:"rgba(255,255,255,.6)", color:"#4A5578", outline:"none", textAlign:"center" }}
                  />
                  <input
                    type="time"
                    value={birthTime}
                    onChange={e => setBirthTime(e.target.value)}
                    style={{ width:"100%", boxSizing:"border-box", fontFamily:F_BODY, fontSize:13, marginTop:8,
                      padding:"9px 16px", borderRadius:14, border:"1.5px solid rgba(255,255,255,.8)",
                      background:"rgba(255,255,255,.5)", color:"#4A5578", outline:"none", textAlign:"center" }}
                  />
                  <p style={{ fontFamily:F_BODY, fontSize:10.5, color:"#A9B4D6", margin:"4px 0 0" }}>
                    生まれた時間（わかれば・なくても大丈夫）
                  </p>
                </div>
              )}
              {!country.name && (
                <input
                  value={countryName}
                  onChange={e => setCountryName(e.target.value)}
                  maxLength={12}
                  placeholder={`あなたの国に名前をつけよう`}
                  style={{ width:"100%", boxSizing:"border-box", fontFamily:F_BODY, fontSize:14,
                    padding:"12px 16px", borderRadius:14, border:"1.5px solid rgba(255,255,255,.8)",
                    background:"rgba(255,255,255,.6)", color:"#4A5578", outline:"none",
                    textAlign:"center", marginBottom:12 }}
                />
              )}
              <div style={{ display:"flex", flexDirection:"column", gap:10, alignItems:"center" }}>
                <button className="btnP" style={btnPrimary} onClick={growCountry}>
                  {country.count === 0 ? "☁ この願いを、そらへ放つ" : "🎨 この願いの色を、国へ届ける"}
                </button>
                <button className="btnG" style={btnGhost} onClick={() => setScreen("list")}>リストに戻る</button>
              </div>
            </div>
          )}
          {!orderDone && (
            <div style={{ marginTop:10 }}>
              <button className="btnG" style={btnGhost} onClick={() => setScreen("list")}>← リストに戻る</button>
            </div>
          )}
        </div>
      );
    }

    if(screen === "help"){
      const steps = [
        { icon:"💭", t:"モヤモヤを、ミリィに話す", d:"ミリィが3つのとびらで、モヤモヤの奥にある「ほんとうの願い」まで案内してくれます。" },
        { icon:"🌟", t:"願いを、10こあつめる", d:"みつけた願いは「願い事リスト」にたまっていきます。" },
        { icon:"🎀", t:"10の願いを、ひとつにたばねる", d:"10こそろったら、その奥にあるひとつの「おおきな願い」がすがたを現し、空へ放たれます。" },
        { icon:"🎁", t:"はじめてのそのとき、空から──", d:"なにが起こるかは、ひみつ。あなたの生まれた日が、鍵になります。" },
        { icon:"🎨", t:"灰色の国が、彩られていく", d:"おおきな願いを放つたび、あなたの国がひとつずつ色づきます。" },
        { icon:"💞", t:"話しかけて、なかよくなる", d:"国に住むあの子は、話すほど絆が育ち、あなただけの言葉で応えてくれるようになります。" },
      ];
      return (
        <div style={{ ...cardStyle }}>
          <h2 style={{ fontFamily:F_HEAD, fontSize:19, color:"#5B6BA8", textAlign:"center", margin:"0 0 4px" }}>
            ねがいぐもの あそびかた
          </h2>
          <p style={{ fontFamily:F_HAND, fontSize:12.5, lineHeight:1.9, color:"#7A86B8",
            textAlign:"center", margin:"0 0 14px", textWrap:"balance" }}>
            痛みの奥の願いを見つけて、あなただけの国を育てる旅です。
          </p>
          {steps.map((s, i) => (
            <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start", padding:"10px 4px",
              borderBottom: i < steps.length - 1 ? "1px dashed rgba(160,180,225,.35)" : "none",
              animation:`fadeUp .4s ${i*0.08}s both ease-out` }}>
              <span style={{ fontSize:22, flexShrink:0 }}>{s.icon}</span>
              <div style={{ minWidth:0 }}>
                <p style={{ fontFamily:F_HEAD, fontSize:13.5, color:"#5B6BA8", margin:"0 0 3px" }}>{i+1}. {s.t}</p>
                <p style={{ fontFamily:F_BODY, fontSize:12, lineHeight:1.8, color:"#6E7A9E", margin:0 }}>{s.d}</p>
              </div>
            </div>
          ))}
          <div style={{ textAlign:"center", marginTop:16 }}>
            <button className="btnP" style={btnPrimary} onClick={() => setScreen("kingdom")}>はじめる</button>
          </div>
        </div>
      );
    }

    if(screen === "kingdom"){
      const n = country.count;
      const done = Math.min(n, LANDMARKS.length);
      const stars = Math.max(0, n - LANDMARKS.length);
      const bubbleText = country.guardian
        ? (gReply || (guardianJustBorn
            ? GUARDIANS[country.guardian.z].voice
            : GUARDIAN_LINES[(country.guardian.bond || 0) % GUARDIAN_LINES.length]))
        : "";

      /* --- 国が生まれる前：ミリィが迎えるホーム --- */
      if(n === 0){
        return (
          <div style={{ ...cardStyle, textAlign:"center" }}>
            <MillyPuppet size={180} style={{ margin:"6px auto 4px" }} />
            <h2 style={{ fontFamily:F_HEAD, fontSize:19, color:"#5B6BA8", margin:"6px 0 4px" }}>
              願いが10こ あつまったとき──
            </h2>
            <p style={{ fontFamily:F_HAND, fontSize:13.5, lineHeight:2, color:"#7A86B8", margin:"0 0 16px",
              textWrap:"balance" }}>
              空のどこかに、あなただけの国が生まれます。<br/>まずはミリィと、モヤモヤを願いに変えにいこう。
            </p>
            <div style={{ display:"flex", flexDirection:"column", gap:10, alignItems:"center" }}>
              {wishes.length >= 10 ? (
                <button className="btnP" style={btnPrimary}
                  onClick={() => { setOrderDone(false); setOrderResult(null); setScreen("order"); }}>
                  ✨ 願いをたばねるときが、きています
                </button>
              ) : (
                <button className="btnP" style={btnPrimary} onClick={restart}>
                  ⭐ ミリィと願いを見つけにいく
                </button>
              )}
              {wishes.length > 0 && wishes.length < 10 && (
                <p style={{ fontFamily:F_BODY, fontSize:11, color:"#8A96BC", margin:0 }}>
                  あつめた願い {wishes.length} / 10
                </p>
              )}
            </div>
          </div>
        );
      }

      /* --- 国のホーム：町の絵は隠さず、守り神はその下に --- */
      return (
        <div>
          <div>
            <div style={{ textAlign:"center", marginBottom:8 }}>
              <span style={{ fontFamily:F_HEAD, fontSize:19,
                background:RAINBOW, backgroundSize:"200% 100%", WebkitBackgroundClip:"text",
                backgroundClip:"text", color:"transparent", animation:"hueSlide 7s linear infinite" }}>
                {country.name || "ねがいの国"}
              </span>
              <span style={{ fontFamily:F_BODY, fontSize:11, marginLeft:8,
                color:"rgba(255,255,255,.9)", textShadow:"0 1px 8px rgba(90,80,160,.6)" }}>
                彩り {done}/{LANDMARKS.length}{stars > 0 ? ` ＋⭐${stars}` : ""}
              </span>
            </div>
            <div style={{ position:"relative", margin:"10px -16px 0", overflow:"hidden" }}>
              <div style={{ WebkitMaskImage:"linear-gradient(180deg, transparent 0%, black 17%)",
                maskImage:"linear-gradient(180deg, transparent 0%, black 17%)" }}>
                <TownScene count={done} />
              </div>
            </div>
            <div style={{ textAlign:"center", marginTop:12 }}>
              <button className="btnP" aria-label="ミリィにお願いする"
                onClick={() => { setGuardianJustBorn(false);
                  if(wishes.length >= 10){ setOrderDone(false); setOrderResult(null); setScreen("order"); }
                  else restart(); }}
                style={{ ...btnPrimary, display:"inline-flex", alignItems:"center", gap:10,
                  padding:"8px 22px 8px 10px" }}>
                <span style={{ width:40, height:40, borderRadius:"50%", flexShrink:0,
                  background:"rgba(255,255,255,.9)", display:"inline-flex", alignItems:"center",
                  justifyContent:"center", overflow:"hidden" }}>
                  <img src={MILLY_STD} alt="" style={{ width:"82%", display:"block" }} />
                </span>
                {wishes.length >= 10 ? "✨ 願いを、ひとつにたばねる" : "⭐ ミリィにお願いする"}
              </button>
            </div>

            {country.guardian ? (
              <div style={{ marginTop:14 }}>
                <div style={{ display:"flex", alignItems:"flex-end", gap:12 }}>
                  <div style={{ width:118, flexShrink:0 }}>
                    <GuardianAvatar g={country.guardian} size={"100%"} justBorn={guardianJustBorn} />
                  </div>
                  <div style={{ flex:1, minWidth:0, background:"rgba(255,255,255,.9)",
                    borderRadius:"18px 18px 18px 4px", padding:"11px 14px", marginBottom:14,
                    boxShadow:"0 6px 16px rgba(150,170,220,.22)", animation:"fadeUp .4s both ease-out" }}>
                    <p style={{ fontFamily:F_HEAD, fontSize:11, color:"#A9B4D6", margin:"0 0 3px" }}>
                      {guardianJustBorn ? "守り神が、うまれました ✦ " : ""}{GUARDIANS[country.guardian.z].name}
                    </p>
                    <p style={{ fontFamily:F_HAND, fontSize:12.5, lineHeight:1.8, color:"#5B6BA8", margin:0 }}>
                      {bubbleText}
                    </p>
                  </div>
                </div>
                <div style={{ display:"flex", gap:8, marginTop:8 }}>
                  <input
                    value={gInput}
                    onChange={e => setGInput(e.target.value)}
                    onKeyDown={e => { if(e.key === "Enter") talkToGuardian(); }}
                    maxLength={200}
                    placeholder={`${GUARDIANS[country.guardian.z].name}に話しかける…`}
                    style={{ flex:1, minWidth:0, boxSizing:"border-box", fontFamily:F_BODY, fontSize:13,
                      padding:"10px 14px", borderRadius:999, border:"1.5px solid rgba(255,255,255,.85)",
                      background:"rgba(255,255,255,.65)", color:"#4A5578", outline:"none" }}
                  />
                  <button className="btnG" style={{ ...btnGhost, whiteSpace:"nowrap", flexShrink:0,
                    padding:"9px 14px", opacity: gTalking ? .5 : 1 }}
                    disabled={gTalking} onClick={talkToGuardian}>
                    {gTalking ? "…" : "はなす"}
                  </button>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:6 }}>
                  <span style={{ fontFamily:F_HAND, fontSize:10.5, color:"rgba(255,255,255,.9)",
                    textShadow:"0 1px 8px rgba(90,80,160,.55)" }}>
                    こころの絆 {"✦".repeat(Math.min(5, Math.floor((country.guardian.bond || 0) / 5)) + 1)}
                    <span style={{ color:"#D8CFEA" }}>{"✧".repeat(Math.max(0, 5 - Math.floor((country.guardian.bond || 0) / 5)))}</span>
                  </span>
                  {!rebirthAsk ? (
                    <button onClick={() => setRebirthAsk(true)}
                      style={{ fontFamily:F_BODY, fontSize:9.5, color:"rgba(255,255,255,.75)", background:"none",
                        border:"none", cursor:"pointer", textDecoration:"underline" }}>
                      🌙 生まれ直し
                    </button>
                  ) : null}
                </div>
                {rebirthAsk && (
                  <div style={{ marginTop:8, textAlign:"center" }}>
                    <p style={{ fontFamily:F_HAND, fontSize:11.5, lineHeight:1.8, color:"#8A96BC", margin:"0 0 8px" }}>
                      {GUARDIANS[country.guardian.z].name}が月の光をあびて生まれ直します。絆と思い出は引き継がれます。
                    </p>
                    <div style={{ display:"flex", gap:8, justifyContent:"center" }}>
                      <button className="btnG" style={btnGhost} onClick={startRebirth}>生まれ直す</button>
                      <button className="btnG" style={btnGhost} onClick={() => setRebirthAsk(false)}>やめる</button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ ...cardStyle, marginTop:12, padding:"14px", textAlign:"center" }}>
                <p style={{ fontFamily:F_HAND, fontSize:12.5, lineHeight:1.9, color:"#8A96BC", margin:"0 0 8px" }}>
                  あなたの誕生日から、この国にただ一人の「守り神」をむかえられます
                </p>
                <input
                  type="date" value={birthInput} onChange={e => setBirthInput(e.target.value)}
                  style={{ width:"100%", boxSizing:"border-box", fontFamily:F_BODY, fontSize:13,
                    padding:"10px 14px", borderRadius:12, border:"1.5px solid rgba(255,255,255,.8)",
                    background:"rgba(255,255,255,.6)", color:"#4A5578", outline:"none",
                    textAlign:"center", marginBottom:6 }} />
                <input
                  type="time" value={birthTime} onChange={e => setBirthTime(e.target.value)}
                  style={{ width:"100%", boxSizing:"border-box", fontFamily:F_BODY, fontSize:12.5,
                    padding:"9px 14px", borderRadius:12, border:"1.5px solid rgba(255,255,255,.8)",
                    background:"rgba(255,255,255,.5)", color:"#4A5578", outline:"none",
                    textAlign:"center", marginBottom:6 }} />
                <p style={{ fontFamily:F_BODY, fontSize:10.5, color:"#A9B4D6", margin:"0 0 8px" }}>
                  下は生まれた時間（わかれば・なくても大丈夫）
                </p>
                <button className="btnG" style={btnGhost} onClick={inviteGuardian}>✨ 守り神をむかえる</button>
              </div>
            )}

            <p style={{ fontFamily:F_HAND, fontSize:12, lineHeight:1.9, textAlign:"center",
              margin:"14px 8px 0", textWrap:"balance",
              color:"rgba(255,255,255,.95)", textShadow:"0 1px 10px rgba(90,80,160,.65)" }}>
              {done < LANDMARKS.length ? (
                <>つぎのおおきな願いが、<br/>灰色の「{LANDMARKS[done].name}」を彩ります</>
              ) : "👑 国はすべて彩られました"}
            </p>
            {done > 0 && (
              <details style={{ marginTop:8 }}>
                <summary style={{ fontFamily:F_BODY, fontSize:11, cursor:"pointer",
                  textAlign:"center", listStyle:"none",
                  color:"rgba(255,255,255,.9)", textShadow:"0 1px 8px rgba(90,80,160,.6)" }}>✦ 彩られた場所と、こめられた願い</summary>
                <div style={{ marginTop:6 }}>
                  {LANDMARKS.slice(0, done).map((lm, i) => (
                    <div key={i} style={{ display:"flex", alignItems:"baseline", gap:8, padding:"6px 4px",
                      borderBottom:"1px dashed rgba(255,255,255,.6)" }}>
                      <span style={{ fontSize:13, flexShrink:0 }}>{lm.icon}</span>
                      <span style={{ fontFamily:F_HEAD, fontSize:11.5, color:"#5B6BA8", flexShrink:0 }}>{lm.name}</span>
                      {country.log && country.log[i] && (
                        <span style={{ fontFamily:F_HAND, fontSize:10.5, color:"#B9A8D8", marginLeft:"auto",
                          textAlign:"right", lineHeight:1.5 }}>「{country.log[i]}」</span>
                      )}
                    </div>
                  ))}
                </div>
              </details>
            )}
            <p style={{ fontFamily:F_BODY, fontSize:11, textAlign:"center", margin:"10px 8px 0",
              textWrap:"balance", color:"rgba(255,255,255,.92)",
              textShadow:"0 1px 8px rgba(90,80,160,.6)" }}>
              {wishes.length >= 10
                ? "✨ ミリィのところで、願いをたばねよう"
                : (wishes.length > 0 ? `あつめた願い ${wishes.length} / 10` : "ミリィをタップして、願いを見つけにいこう")}
            </p>
          </div>
        </div>
      );
    }

    return null;
  }

  return (
    <div ref={topRef} style={{ minHeight:"100vh", background:"transparent", padding:"0 16px 48px" }}>
      <style>{`
        @keyframes floaty { 0%,100%{ transform:translateY(0) rotate(-1.6deg) } 50%{ transform:translateY(-9px) rotate(1.6deg) } }
        @keyframes bounceDot { 0%,100%{ transform:translateY(0); opacity:.5 } 50%{ transform:translateY(-7px); opacity:1 } }
        @keyframes fadeUp { from{ opacity:0; transform:translateY(10px) } to{ opacity:1; transform:translateY(0) } }
        @keyframes drift { from{ transform:translateX(-200px) } to{ transform:translateX(calc(100vw + 220px)) } }
        @keyframes twinkleAnim { 0%,100%{ opacity:.15; transform:scale(.7) } 50%{ opacity:.9; transform:scale(1.15) } }
        @keyframes arrive { from{ opacity:0; transform:scale(.55) translateY(36px) } to{ opacity:1; transform:scale(1) translateY(0) } }
        @keyframes auraPulse { 0%,100%{ opacity:.5; transform:scale(.95) } 50%{ opacity:.9; transform:scale(1.08) } }
        @keyframes burstOut { from{ opacity:1; transform:translate(-50%,-50%) scale(.4) }
          to{ opacity:0; transform:translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(1.25) } }
        .cloud { position:absolute; left:-220px; background:#fff; border-radius:999px;
          filter:blur(1.5px); box-shadow:0 6px 16px rgba(160,180,225,.25);
          animation:drift linear infinite; }
        .cloud::before, .cloud::after { content:""; position:absolute; background:#fff; border-radius:50%; }
        .cloud::before { width:55%; height:170%; left:12%; top:-80%; }
        .cloud::after  { width:38%; height:125%; right:12%; top:-50%; }
        .twinkle { position:absolute; font-size:13px; color:#FFD9A0;
          text-shadow:0 0 8px rgba(255,200,120,.8); animation:twinkleAnim 3.2s ease-in-out infinite; }
        .rainbowArc { position:absolute; left:50%; top:-360px; width:720px; height:720px;
          transform:translateX(-50%); border-radius:50%; filter:blur(7px); opacity:.8;
          background:radial-gradient(circle,
            transparent 53%,
            rgba(255,150,180,.28) 54% 59%,
            rgba(255,200,140,.26) 59% 64%,
            rgba(255,240,170,.24) 64% 69%,
            rgba(165,230,190,.24) 69% 74%,
            rgba(150,200,255,.28) 74% 79%,
            rgba(195,165,255,.26) 79% 84%,
            transparent 85%); }
        .aura { position:absolute; inset:-24px; border-radius:50%;
          background:radial-gradient(circle, rgba(255,235,180,.55), rgba(255,180,220,.3) 55%, transparent 72%);
          animation:auraPulse 2.4s ease-in-out infinite; }
        .burst { position:absolute; font-size:20px; color:#FFC96B;
          text-shadow:0 0 10px rgba(255,200,120,.9);
          animation:burstOut 1.1s ease-out both; }
        .star { position:absolute; border-radius:50%; background:#fff;
          box-shadow:0 0 6px rgba(255,255,255,.95), 0 0 14px rgba(200,215,255,.6);
          animation:starTw 2.6s ease-in-out infinite; }
        @keyframes starTw { 0%,100%{ opacity:.25; transform:scale(.7) } 50%{ opacity:1; transform:scale(1.15) } }
        .aurora { position:absolute; left:-20%; top:-12%; width:140%; height:55%;
          border-radius:50%; filter:blur(42px); opacity:.55;
          background:linear-gradient(115deg, rgba(130,255,215,.35), rgba(150,185,255,.42),
            rgba(255,165,220,.38), rgba(185,255,205,.3));
          animation:auroraShift 9s ease-in-out infinite alternate; }
        @keyframes auroraShift { from{ transform:translateX(-5%) rotate(-3deg) } to{ transform:translateX(5%) rotate(3deg) } }
        .shooting { position:absolute; width:130px; height:2.5px; border-radius:999px;
          background:linear-gradient(90deg, rgba(255,255,255,0), #fff);
          transform:rotate(32deg); opacity:0; animation:shoot 5s ease-in infinite; }
        @keyframes shoot { 0%{ opacity:0; transform:rotate(32deg) translateX(0) }
          5%{ opacity:1 } 16%{ opacity:0; transform:rotate(32deg) translateX(48vw) }
          100%{ opacity:0; transform:rotate(32deg) translateX(48vw) } }
        @keyframes pop { 0%{ opacity:0; transform:scale(.4) rotate(-8deg) }
          60%{ opacity:1; transform:scale(1.08) rotate(3deg) } 100%{ transform:scale(1) rotate(0deg) } }
        @keyframes revealGlow { from{ opacity:0; filter:blur(10px); transform:scale(.92); letter-spacing:.18em }
          to{ opacity:1; filter:blur(0); transform:scale(1); letter-spacing:.03em } }
        @keyframes hueSlide { from{ background-position:0% 50% } to{ background-position:200% 50% } }
        @keyframes islandFloat { 0%,100%{ transform:translateY(0) } 50%{ transform:translateY(-7px) } }
        @keyframes gBlinkAnim { 0%, 93%, 96.5%, 100% { opacity:0 } 93.8%, 95.7% { opacity:1 } }
        .gBlink { opacity:0; animation:gBlinkAnim 4.6s ease-in-out infinite; }
        @keyframes gIdle { 0%,100%{ transform:scale(1,1) } 50%{ transform:scale(1.012,.988) } }
        .uncol { filter:grayscale(1) brightness(1.05); opacity:.32; transition:filter 1.4s ease, opacity 1.4s ease; }
        .col { filter:none; opacity:1; transition:filter 1.4s ease, opacity 1.4s ease; }
        @keyframes bloomIn { from{ opacity:0 } to{ opacity:1 } }
        .gBubble { position:absolute; left:50%; top:5%; transform:translateX(-50%);
          max-width:78%; background:rgba(255,255,255,.94); border-radius:14px;
          padding:8px 12px; box-shadow:0 6px 16px rgba(120,140,200,.3);
          animation:fadeUp .4s both ease-out; z-index:3; }
        .gBubble::after { content:""; position:absolute; left:50%; bottom:-7px;
          transform:translateX(-50%); border:7px solid transparent;
          border-top-color:rgba(255,255,255,.94); border-bottom:none; }
        .millyBtn { width:42px; height:42px; border-radius:50%; padding:4px;
          background:rgba(255,255,255,.7); border:1.5px solid rgba(255,255,255,.9);
          cursor:pointer; box-shadow:0 4px 14px rgba(130,150,210,.25);
          backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); }
        .millyBtn img { width:100%; height:auto; display:block; }
        @keyframes colorPop { 0%{ filter:grayscale(1); opacity:.35; transform:scale(.98) }
          60%{ transform:scale(1.04) } 100%{ filter:none; opacity:1; transform:scale(1) } }
        .colNew { animation:colorPop 1.6s .3s both ease-out; transform-box:fill-box; transform-origin:center; }
        @keyframes hoverFloat { 0%,100%{ transform:translateY(0) rotate(-1.2deg) }
          50%{ transform:translateY(-16px) rotate(1.2deg) } }
        .hoverShadow { width:52%; height:13px; margin:6px auto 0; border-radius:50%;
          background:radial-gradient(ellipse, rgba(110,100,185,.38), rgba(110,100,185,0) 70%);
          filter:blur(4px); animation:shadowPulse 3.1s ease-in-out infinite; }
        @keyframes shadowPulse { 0%,100%{ transform:scaleX(1); opacity:.65 }
          50%{ transform:scaleX(.7); opacity:.28 } }
        @keyframes flapL { 0%,100%{ transform:rotate(0deg) } 50%{ transform:rotate(7deg) } }
        @keyframes flapR { 0%,100%{ transform:rotate(0deg) } 50%{ transform:rotate(-7deg) } }
        @keyframes breathe { 0%,100%{ transform:scale(1) } 50%{ transform:scale(1.014) } }
        @keyframes haloBob { 0%,100%{ transform:translateY(0); filter:drop-shadow(0 0 4px rgba(255,215,130,.55)) }
          50%{ transform:translateY(-4px); filter:drop-shadow(0 0 10px rgba(255,220,140,.95)) } }
        .millyGlow { position:absolute; inset:-10%; border-radius:50%;
          background:radial-gradient(circle, rgba(255,242,205,.55), rgba(195,175,255,.28) 55%, transparent 72%);
          filter:blur(12px); animation:auraPulse 3.6s ease-in-out infinite; }
        .moon { position:absolute; right:7%; top:8%; width:88px; height:88px; border-radius:50%;
          background:radial-gradient(circle at 38% 35%, #FFFDF2, #FFF0C6 55%, rgba(255,236,190,.3) 78%, transparent 84%);
          box-shadow:0 0 36px rgba(255,240,200,.75), 0 0 90px rgba(255,228,180,.4);
          animation:moonPulse 5s ease-in-out infinite; }
        @keyframes moonPulse { 0%,100%{ transform:scale(1) } 50%{ transform:scale(1.045) } }
        .mote { position:absolute; bottom:-12px; width:7px; height:7px; border-radius:50%;
          background:radial-gradient(circle, #FFF3D0 0%, #FFCE7E 55%, rgba(255,190,110,0) 78%);
          box-shadow:0 0 10px rgba(255,190,105,.95), 0 0 22px rgba(255,170,120,.55);
          animation:moteRise linear infinite; }
        @keyframes moteRise { 0%{ transform:translate(0,0) scale(.8); opacity:0 } 8%{ opacity:.95 }
          50%{ transform:translate(16px,-52vh) scale(1.1); opacity:.8 }
          92%{ opacity:.3 } 100%{ transform:translate(-10px,-104vh) scale(.9); opacity:0 } }
        .streak { position:absolute; top:-90px; width:2.5px; height:80px; border-radius:999px;
          background:linear-gradient(180deg, rgba(255,255,255,0), rgba(255,255,255,.85));
          animation:streakDown 1.7s linear infinite; }
        @keyframes streakDown { from{ transform:translateY(-90px); opacity:0 }
          18%{ opacity:.9 } to{ transform:translateY(420px); opacity:0 } }
        .btnP { transition:transform .16s ease, box-shadow .16s ease; }
        .btnP:hover { transform:translateY(-1.5px); }
        .btnP:active { transform:scale(.96); }
        .btnP::after { content:""; position:absolute; top:0; left:-70%; width:45%; height:100%;
          background:linear-gradient(100deg, transparent, rgba(255,255,255,.6), transparent);
          transform:skewX(-20deg); animation:shineSweep 3.4s ease-in-out infinite; }
        @keyframes shineSweep { 0%{ left:-70% } 55%{ left:140% } 100%{ left:140% } }
        .btnG { transition:transform .16s ease, background .16s ease; }
        .btnG:hover { transform:translateY(-1px); background:rgba(255,255,255,.75) !important; }
        .btnG:active { transform:scale(.96); }
        .opt { transition:transform .18s ease, box-shadow .18s ease; }
        .opt:hover { transform:translateY(-2.5px);
          box-shadow:0 12px 28px rgba(140,160,225,.32), inset 0 1px 0 rgba(255,255,255,.6); }
        .opt:active { transform:scale(.975); }
        @media (prefers-reduced-motion: reduce){
          * { animation:none !important; transition:none !important }
          .twinkle, .star { animation:twinkleAnim 3.4s ease-in-out infinite !important }
        }
        button:focus-visible { outline:3px solid #9DBBF2; outline-offset:2px }
        input[type="date"], input[type="time"] {
          -webkit-appearance:none; appearance:none;
          display:block; margin-left:auto; margin-right:auto;
          min-height:44px; line-height:1.4;
        }
        input[type="date"]::-webkit-date-and-time-value,
        input[type="time"]::-webkit-date-and-time-value { text-align:center; }
        textarea:focus, input:focus { border-color:#A9C6F5 !important }
      `}</style>
      <DreamLayer phase={phase} />
      <MoteLayer />
      <div style={{ maxWidth:560, margin:"0 auto", position:"relative", zIndex:1 }}>
        {header}
        <div key={screen + (loading ? "-l" : "")} style={{ animation:"fadeUp .55s both ease-out" }}>
          {renderScreen()}
        </div>
        <p onClick={footerTap} style={{ textAlign:"center", fontFamily:F_HAND, fontSize:11, marginTop:28,
          color: phase >= 3 ? "rgba(255,255,255,.8)" : "#AEB9D8", cursor:"default", userSelect:"none" }}>
          ねがいぐも — 痛みの奥の、ほんとうの願いへ 🐬{demoMode ? " 🧪" : ""}
        </p>
      </div>
    </div>
  );
}
