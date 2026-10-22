/* Kani Life - ヒロイン（1回の人生に1人だけ）
   ・誰になるかは生まれたときにランダム（画面には出さない）
   ・最初は「昔ちょっと会った」くらいの浅い関係。出来事と連絡で少しずつ好かれていく
   ・あっちだけが気づいている「すれ違い」が何度かある（主人公はほぼ無意識）
   ・こっちが他の子と付き合っていても、あっちは好きになっていく（嫉妬がにじむ）
   ・好感度が育たないまま大人になると、あっちに彼氏ができることがある（あまり好きではない）
   ・ルートが終わるのは「自分から2回はっきり断った」か「他の人と結婚した」ときだけ
   ・別れても、復縁のチャンスは1回ある
   ※名前・口調・画像はこのファイルだけで差し替えられます */
(function () {
  'use strict';
  var KL = window.KL, U = KL.U, ST = KL.Story;
  var H = KL.Hero = {};

  H.D = {
    chisa: { sei: '朽葉', mei: '千咲', ad: 2, role: '幼なじみ', vt: '黒髪ロングに赤いリボン', pers: '無口だけど、まっすぐ', hobby: '読書と、手紙を書くこと', ht: 158, pref: 'men', hint: '黒髪に赤いリボンの女の子',
      img: { base: 'chisa-festival', school: 'chisa-school', serious: 'chisa-serious', dark: 'chisa-festival-dark', adult: 'chisa-festival' } },
    miyako: { sei: '月雪', mei: 'ミヤコ', ad: -1, role: '後輩', vt: '白い髪のポニーテール', pers: '冷静で真面目。でも本当は寂しがり', hobby: 'データ分析と、うさぎの動画', ht: 152, pref: 'ath', hint: '白い髪の、年下の女の子',
      img: { base: 'miyako-casual', school: 'miyako-uniform', summer: 'miyako-summer', dark: 'miyako-summer-dark', closed: 'miyako-summer-closed', adult: 'miyako-dress' } },
    hoshino: { sei: '小鳥遊', mei: 'ホシノ', ad: 1, role: '先輩', vt: 'ピンクの長い髪、オッドアイ', pers: 'のんびり気だるげ。本気の時は誰より真剣', hobby: '昼寝', ht: 145, pref: 'men', hint: 'ピンクの髪の、眠そうな女の子',
      img: { base: 'hoshino-school', school: 'hoshino-school', spring: 'hoshino-spring', resort: 'hoshino-resort', closed: 'hoshino-resort-closed', dark: 'hoshino-resort-dark' } },
    miyabi: { sei: '星見', mei: '雅', ad: 5, role: '師範代', vt: '黒髪の姫カット、凛とした目', pers: '簡潔で威厳がある。普段は少し天然', hobby: '刀の手入れと、団子', ht: 166, pref: 'ath', hint: '背筋の伸びた、黒髪のお姉さん',
      img: { base: 'miyabi-work', work: 'miyabi-work', sword: 'miyabi-sword', formal: 'miyabi-formal', dark: 'miyabi-work-close' } }
  };
  // 才能は「出会ったあと」に効く：相性の才能が高いほど距離が縮まりやすい
  H.TAL = { look: 'chisa', art: 'chisa', men: 'miyako', int: 'miyako', com: 'hoshino', ath: 'miyabi', hp: 'miyabi' };
  H.full = function (id) { var d = H.D[id]; return d.sei + ' ' + d.mei; };
  H.STG = ['知り合い', '友達', '気になる', '好き'];

  // ======================================================
  //  状態
  // ======================================================
  H.init = function (S) {
    if (S.hero) { var h0 = S.hero; h0.done = h0.done || {}; h0.doneT = h0.doneT || {}; h0.qT = h0.qT || {}; h0.mem = h0.mem || []; h0.f = h0.f || {}; return h0; }
    var order = U.shuffle(Object.keys(H.D));
    S.hero = { order: order, cur: order[0], main: order[0], mode: 'main', met: false, npc: null, lastT: -99, pre: 0, peek: 0,
      done: {}, doneT: {}, qT: {}, mem: [], f: {}, dec: 0, ended: false, gone: false, reunion: false, hbf: null, hbfDone: false, touchT: -99, confT: -99 };
    return S.hero;
  };
  H.MUL = [0, 0.8, 0.9, 1, 1.1, 1.2, 1.35];
  H.likeMul = function (S) {
    var h = S.hero; if (!h || !S.tal) return 1; var best = 0;
    Object.keys(H.TAL).forEach(function (k) { if (H.TAL[k] === h.cur) best = Math.max(best, S.tal[k] || 3); });
    return H.MUL[best] || 1;
  };
  H.npc = function (S) { return S.hero && S.hero.npc ? KL.npc(S, S.hero.npc) : null; };
  H.is = function (S, id) { return !!S.hero && S.hero.cur === id; };
  H.on = function (S, id) { var n = H.npc(S); return H.is(S, id) && S.hero.met && !S.hero.gone && !!n && !n.dead; };
  H.gap = function (S, n) { return S.t - (S.hero ? S.hero.lastT : -99) >= n; };
  H.like = function (S) { var n = H.npc(S); return n ? n.like : 0; };
  H.stage = function (S) { var l = H.like(S); return l >= 70 ? 3 : l >= 50 ? 2 : l >= 30 ? 1 : 0; };
  H.stageLabel = function (S) { return H.STG[H.stage(S)]; };
  H.dating = function (S) { var n = H.npc(S); return !!n && (S.partnerId === n.id); };
  H.married = function (S) { var n = H.npc(S); return !!n && S.spouseId === n.id; };
  H.together = function (S) { return H.dating(S) || H.married(S); };
  H.single = function (S) { return !S.partnerId && !S.spouseId; };
  H.touch = function (S) { if (S.hero) S.hero.touchT = S.t; };
  H.aff = function (S, v) { var n = H.npc(S); if (n) { KL.likeAdd(n, v > 0 ? Math.round(v * H.likeMul(S)) : v); H.touch(S); } };
  // 付き合っている「ヒロイン以外の」恋人
  H.gf = function (S) { var p = KL.npc(S, S.partnerId); return p && !p.hero && !p.dead ? p : null; };
  KL.PH.pname = function (S) { var p = H.gf(S) || KL.partner(S); return p ? ST.first(p) : ''; };
  KL.PH.hbf = function (S) { return S.hero && S.hero.hbf ? S.hero.hbf.name : ''; };

  // 呼び方
  H.call = function (S) {
    var h = S.hero; if (!h) return S.mei + 'くん';
    var m = H.married(S);
    if (h.cur === 'chisa') return S.mei + 'くん';
    if (h.cur === 'miyako') return m ? S.mei + 'さん' : '先輩';
    if (h.cur === 'hoshino') return m ? S.mei : (Math.random() < 0.3 ? S.mei + 'ちゃん' : S.mei + 'くん');
    if (h.cur === 'miyabi') return S.mei;
    return S.mei;
  };
  KL.PH.call = function (S) { return H.call(S); };
  KL.PH.hn = function (S) { return S.hero ? H.D[S.hero.cur].mei : ''; };
  KL.PH.hfull = function (S) { return S.hero ? H.full(S.hero.cur) : ''; };
  // 画像（年齢でふさわしいものを選ぶ）
  H.img = function (S, mood) {
    var h = S.hero; if (!h) return '';
    var d = H.D[h.cur], a = KL.age(S), ha = a + d.ad, im = d.img;
    if (h.cur === 'hoshino') {
      if (ha < 21 && (mood === 'resort' || mood === 'closed' || mood === 'dark')) mood = mood === 'dark' ? '' : 'spring';
      if (!mood) return '';
    }
    if (h.cur === 'miyako' && mood === 'adult' && ha < 20) mood = 'summer';
    if (h.cur === 'chisa' && mood === 'school' && ha >= 19) mood = 'base';
    var f = im[mood] || im.base;
    return f ? 'hero-' + f + '.jpg' : '';
  };
  H.face = function (S, n) { if (!n || !n.hero || !S.hero) return ''; var mood = n.like < 25 && H.together(S) ? 'dark' : KL.age(S) + H.D[n.hero].ad < 18 ? 'school' : 'base'; return H.img(S, mood) || H.img(S, 'base'); };

  // 出会う（ヒロインの人物を作る）
  H.meet = function (S, how) {
    var h = S.hero, d = H.D[h.cur];
    if (h.met) return H.npc(S);
    var start = 12 + Math.min(20, h.pre || 0) + (h.kindA ? 4 : 0);
    var n = KL.newNPC(S, 'crush', 'f', { name: d.sei + ' ' + d.mei, hero: h.cur, ad: d.ad, look: 96, vt: d.vt, pers: d.pers, hobby: d.hobby, ht: d.ht, pref: d.pref, like: start, met: how || d.role, rel: 'hero' });
    n.role = 'heroine';
    h.met = true; h.npc = n.id; h.metAge = KL.age(S); h.how = how || d.role; h.touchT = S.t;
    KL.log(S, H.full(h.cur) + '（' + (how || d.role) + '）と出会った。', 2);
    return n;
  };
  H.mark = function (S, title, img) {
    var h = S.hero; if (!h) return;
    S.album = S.album || []; S.album.push({ t: S.t, y: KL.year(S), age: KL.age(S), title: title, img: img || '' }); if (S.album.length > 80) S.album.shift();
  };
  H.memo = function (S, text) { var h = S.hero; if (!h || h.met) return; h.mem.push(text); if (h.mem.length > 8) h.mem.shift(); };
  // 付き合う・結婚・別れ
  H.date = function (S, how) {
    var n = H.npc(S); if (!n) return;
    var old = H.gf(S);
    if (old) { old.rel = 'ex'; S.exCount++; S.hero.leftFor = old.name; KL.log(S, old.name + 'と別れた。', 1); S.partnerId = null; }
    if (S.hero.hbf) { S.hero.hbf = null; S.hero.hbfDone = true; }
    KL.startDating(S, n, how); n.rel = 'partner'; S.hero.st = 3; S.hero.dateT = S.t; S.hero.gone = false; n.hidden = false;
    KL.likeAdd(n, 6); H.touch(S);
  };
  H.marry = function (S) {
    var n = H.npc(S); if (!n) return;
    n.rel = 'spouse'; S.spouseId = n.id; S.partnerId = null; S.marriedT = S.t; S.hero.st = 5; KL.likeAdd(n, 10);
    KL.title(S, H.full(S.hero.cur) + 'と結婚'); KL.log(S, H.full(S.hero.cur) + 'と結婚した。', 3);
  };
  H.part = function (S, why) {
    var n = H.npc(S); if (!n) return;
    if (S.partnerId === n.id) { S.partnerId = null; S.exCount++; }
    if (S.spouseId === n.id) { S.spouseId = null; S.flags.divorced = (S.flags.divorced || 0) + 1; }
    n.rel = 'ex'; n.hidden = true; S.hero.gone = true; S.hero.goneT = S.t; S.hero.reT = U.ri(2, 4); S.hero.st = -1;
    KL.log(S, H.full(S.hero.cur) + 'と別れた' + (why ? '（' + why + '）' : '') + '。', 2);
  };
  // ルートの終わり（人生から退場）
  H.end = function (S, why) {
    var h = S.hero, n = H.npc(S); if (!h) return;
    h.ended = true; h.gone = true; h.goneT = S.t;
    if (n) { n.hidden = true; if (n.rel !== 'ex') n.rel = 'old'; }
    if (why) KL.log(S, H.full(h.cur) + '：' + why, 1);
  };
  // 自分から断る（2回で終わり）
  H.decline = function (S) {
    var h = S.hero; h.dec = (h.dec || 0) + 1; H.aff(S, -15); h.confT = S.t;
    if (h.dec >= 2) { H.end(S, 'それきり、会うことはなくなった。'); return true; }
    return false;
  };
  // 告白の判定（成功で付き合う）
  H.tryConfess = function (S, bonus, how) {
    var h = S.hero, n = H.npc(S); if (!n) return false;
    h.confT = S.t;
    if (h.hbf && n.like < 70) return false;
    var ok = n.like >= 70 || KL.chk(S, n.like + S.st.com / 5 + (bonus || 0), 60, 7);
    if (ok) { H.date(S, how || '告白'); return true; }
    H.aff(S, -4);
    return false;
  };
  // 外で起きた変化（一般の出来事で別れた・離婚した等）を拾う
  H.sync = function (S) {
    var h = S.hero, n = H.npc(S); if (!h || !h.met || !n) return;
    if ((h.st === 3 || h.st === 5) && !H.together(S) && !h.gone) { n.rel = 'ex'; n.hidden = true; h.gone = true; h.goneT = S.t; h.reT = U.ri(2, 4); h.st = -1; }
    if (n.dead && !h.ended) h.ended = true;
  };

  // ---------- 口調の素材 ----------
  H.V = {
    chisa: { yes: ['……うん', '……そう', '……いいよ'], miss: ['……別に、待ってないけど', '……来ないと思ってた'], happy: ['……ふふ', '……よかった'], jeal: ['……さっきの人、誰', '……楽しそうだったね', '…………'] },
    miyako: { yes: ['了解しました', '……はい、先輩', 'わかりました'], miss: ['……先輩、遅いです', '連絡が3時間ありませんでした。……データ上、異常値です'], happy: ['……悪くない、と思います', 'ありがとうございます、先輩'], jeal: ['……先輩。今の方とは、どういったご関係ですか', '別に、気にしていません。……気にしていません', '先輩の自由です。……ですが、報告はしてください'] },
    hoshino: { yes: ['うへ〜、いいよ〜', 'しょうがないなぁ〜', 'おじさんに任せなさい〜'], miss: ['うへ〜、おそいよ〜', 'おじさん、待ちくたびれちゃった〜'], happy: ['うへへ〜', 'いやぁ、うれしいねぇ〜'], jeal: ['うへ〜、モテモテだねぇ〜……。……で、あの子だれ？', 'ふ〜ん、楽しそうだったねぇ〜。……ねぇ。次はないよ？', 'おじさん、そういうの見なかったことにできるほど大人じゃないんだよね〜'] },
    miyabi: { yes: ['承知した', 'よかろう', 'うむ'], miss: ['……遅い', '待っていた。……三時間ほど'], happy: ['……悪くない', '……そうか。嬉しいものだな'], jeal: ['……あの者は誰だ', '楽しそうだったな。……別に、構わんが', '次に同じことがあれば、手合わせで話をつける'] }
  };
  H.v = function (S, k) { var h = S.hero; return h ? ST.pick(S, 'hv_' + h.cur + k, H.V[h.cur][k]) : ''; };
  // 節目のメッセージ（付き合っているとき・story.js から呼ばれる）
  H.MSG = {
    chisa: { join: '……おめでとう。ずっと、知ってた', debut: '……見てた。かっこよかった', firstgoal: '……泣いた。内緒', title: '……おめでとう。今日は、ちゃんと寝てね', nt: '……昔、公園で言ってたこと。ほんとになったね', ballon: '……{mei}くんは、世界一。わたしは、ずっと前から知ってたけど', injury: '……そばにいる。何もしないけど、いる', transfer: '……さみしい。でも、行って' },
    miyako: { join: '先輩、プロ契約おめでとうございます。……データ通りです。でも、嬉しいです', debut: '出場時間、走行距離、全部記録しました。……先輩、おめでとうございます', firstgoal: '……先輩。ゴール、です。……すみません、うまく言えません', title: '優勝、おめでとうございます。了解しました、今日は先輩を甘やかします', nt: '日本代表……。先輩、私の分析は間違っていませんでした', ballon: 'ウサギは月まで跳べないそうです。……でも先輩は、跳びました', injury: '了解しました。リハビリの計画、もう作ってあります', transfer: '……ウサギは寂しくても生きていけるそうです。でも私は、ウサギではないので' },
    hoshino: { join: 'うへ〜、すごいじゃん〜！ おじさん鼻が高いよ〜', debut: '見てたよ〜。……ちょっと泣いたのは内緒ね〜', firstgoal: 'うへ〜！ やったね〜！ 今日はおじさんがごはん作るよ〜', title: '優勝かぁ〜。……ほんとに、よく頑張ったね', nt: '日本代表かぁ〜。遠くに行っちゃうなぁ〜……なんてね〜', ballon: '世界一だって〜。……うん。おじさんは、最初から知ってたよ', injury: '……大丈夫。おじさんがそばにいるから。適当に、ゆっくり治そ？', transfer: 'うへ〜、海外かぁ〜。……ちゃんと連絡してね。ほんとに' },
    miyabi: { join: '契約か。……鍛え方を変えねばな', debut: '見ていた。足の運びが良かった', firstgoal: '……よくやった。今夜は好きなものを作ってやろう', title: '優勝、見事だ。……だが慢心するな', nt: '国を背負うか。……誇りに思う', ballon: '世界一、か。……私の目に狂いはなかった', injury: '焦るな。体は嘘をつかん。治す計画は私が立てる', transfer: '……行け。私もいずれ追いかける' }
  };
  // 付き合っていないときの「節目」の一言（好感度の段階ごと）
  H.MSG0 = {
    chisa: ['……おめでとう。……ニュースで見た', '……すごいね。……昔から、知ってたけど', '……おめでとう。……今度、ちゃんと言いたい', '……{mei}くん。……おめでとう。……ほんとに、おめでとう'],
    miyako: ['おめでとうございます、先輩', 'おめでとうございます。……記録、更新しておきます', '先輩。……おめでとうございます。少しだけ、泣きました', '……先輩。おめでとうございます。……私、ずっと見ていました'],
    hoshino: ['うへ〜、おめでと〜', 'うへ〜、やるじゃん〜。おじさん、ちょっと鼻が高いよ〜', 'うへ〜……かっこよかったよ〜。……ほんとだよ？', '……おめでと。……今のは、適当じゃないからね'],
    miyabi: ['見事だ', 'よくやった。……鍛錬の成果だな', '……見ていた。良い顔をしていた', '……誇らしい。……お前のことが'] };
  H.msg = function (S, n, kind) {
    if (H.together(S)) { var m = H.MSG[n.hero] || {}; return m[kind] || H.v(S, 'happy'); }
    return (H.MSG0[n.hero] || [])[H.stage(S)] || '';
  };
  // 嫉妬・誘惑への反応（付き合っているとき／life.js から呼ばれる）
  H.react = function (S, kind) {
    var h = S.hero; if (!h || !H.together(S)) return '';
    var id = h.cur;
    var R = {
      jealous: {
        chisa: '家に帰ると、千咲が玄関で待っていた。何も言わない。\nテーブルの上に、一枚の手紙。\n「……さっきの人、誰。わたしは、ちゃんと聞きたい」',
        miyako: 'ミヤコの返事が、急に敬語の温度を下げた。\n「……先輩。今の方とは、どういったご関係ですか」\n「別に、気にしていません。……気にしていません」',
        hoshino: '「うへ〜、モテモテだねぇ〜」\nホシノはいつもの調子で笑っていた。……途中までは。\n「……で、あの子だれ？」\n笑顔のまま、目だけが笑っていなかった。',
        miyabi: '雅は無言で刀の手入れをしていた。\n「……楽しそうだったな」\n「別に、構わん。……構わんが」\n刃を拭く手が、いつもより少しだけ速い。'
      },
      resist: {
        chisa: '帰って正直に話すと、千咲は少しだけ黙って、それから小さく笑った。\n「……ばか。でも、ありがとう」',
        miyako: '「……報告、ありがとうございます、先輩」\nミヤコは少しだけ目をそらした。\n「ウサギは浮気をしない動物だそうです。……先輩は、ウサギみたいですね」',
        hoshino: '「うへ〜、断ったんだ〜。えらいえらい〜」\nホシノは頭をぽんぽんしてきた。\n「……ほんとはね、ちょっとだけ心配してた。ちょっとだけね〜」',
        miyabi: '「そうか」\n雅は短く頷いた。\n「……お前を信じていた。だが、言葉にされると、存外嬉しいものだな」'
      },
      caught: {
        chisa: '週刊誌の記事を見た千咲は、何も言わなかった。\n次の日、ポストに手紙が一通。\n「……さよなら、とは書けなかった。でも、少しだけ、離れる」',
        miyako: '「……了解しました」\nミヤコの声は、聞いたことがないほど静かだった。\n「ウサギは寂しくても、一匹で生きていけるそうです。……私も、そうしてみます」',
        hoshino: '「……ねぇ」\nホシノはもう笑っていなかった。\n「おじさんね、怒るとほんとに怖いんだよ。……でも今は、怒る気力もないや」',
        miyabi: '雅は記事を一度だけ読み、静かに畳んだ。\n「……弁明は聞かん。少し、時間をくれ」\nその夜、道場の灯りは朝まで消えなかった。'
      }
    };
    return (R[kind] || R.jealous)[id] || '';
  };

  // ======================================================
  //  出来事（ヒロイン専用の場面）の仕組み
  //  ・一般の出来事の山とは別に持つ（取りこぼしても、また出る）
  //  ・o: { c: 条件, meet: 出会い, how: 出会い方, pre: 出会う前, view: 彼女の視点（間隔を消費しない）,
  //         need: 先に起きているべき場面, gap: 前の場面からの半年数, pri: 優先度, imp: 大事さ, repeat/max/cool, gone: 別れた後でも }
  // ======================================================
  var BEATS = H.BEATS = [];
  function mkChoice(id, c, i) {
    return { t: c[0], pol: c[3], req: c[4], aw: c[5], fx: function (S) {
      ST.apply(S, typeof c[1] === 'function' ? c[1](S) : (c[1] || {}));
      var r = typeof c[2] === 'function' ? c[2](S) : Array.isArray(c[2]) ? ST.pick(S, 'br_' + id + i, c[2]) : c[2];
      if (S.hero) S.hero.touchT = S.t;
      return KL.fill(S, r || '');
    } };
  }
  function Bt(id, hid, o, title, icon, text, choices, img) {
    var def = { id: id, hid: hid, o: o || {} };
    def.ev = {
      id: id, cat: 'hero', hero: hid === '*' ? '' : hid, imp: def.o.imp === undefined ? (def.o.view ? 0 : 1) : def.o.imp,
      title: title, icon: icon,
      text: function (S) { var t = typeof text === 'function' ? text(S) : Array.isArray(text) ? ST.pick(S, 'bt_' + id, text) : text; return KL.fill(S, t || ''); },
      img: function (S) { var m = typeof img === 'function' ? img(S) : img; return m ? H.img(S, m) : ''; },
      cond: function (S) { return H.ok(S, def, true); },
      fx: function (S) { H.did(S, def, typeof title === 'function' ? title(S) : title, typeof img === 'function' ? img(S) : img); },
      choices: (choices || []).map(function (c, i) { return mkChoice(id, c, i); })
    };
    BEATS.push(def);
    return def;
  }
  H.Bt = Bt;
  H.ok = function (S, def, atRealize) {
    var h = S.hero; if (!h) return false;
    var o = def.o;
    if (h.ended && !o.any) return false;
    if (def.hid !== '*' && h.cur !== def.hid) return false;
    if (o.meet || o.pre) { if (h.met) return false; }
    else { if (!h.met || !h.npc) return false; if (h.gone && !o.gone) return false; var n = H.npc(S); if (!n || n.dead) return false; }
    var cnt = h.done[def.id] || 0;
    if (cnt && !o.repeat) return false;
    if (cnt && o.repeat) { if (cnt >= (o.max || 3)) return false; if (S.t - (h.doneT[def.id] === undefined ? -99 : h.doneT[def.id]) < (o.cool || 4)) return false; }
    if (o.need && !o.need.every(function (x) { return h.done[x]; })) return false;
    if (!atRealize && !o.view && !H.gap(S, o.gap === undefined ? 1 : o.gap)) return false;
    try { return !o.c || !!o.c(S); } catch (e) { return false; }
  };
  H.did = function (S, def, title, img) {
    var h = S.hero, o = def.o;
    h.done[def.id] = (h.done[def.id] || 0) + 1; h.doneT[def.id] = S.t;
    if (o.meet) H.meet(S, typeof o.how === 'function' ? o.how(S) : o.how);
    if (!o.view) h.lastT = S.t;
    h.touchT = S.t;
    if (!o.view && !o.pre && img !== false && title) H.mark(S, KL.fill(S, title), img ? H.img(S, img) : '');
    if (o.after) { try { o.after(S); } catch (e) { } }
  };
  // 次に起きる場面を選ぶ（n: 場面の数／opt.view: 視点の場面も1つ）
  H.tick = function (S, n, opt) {
    opt = opt || {};
    var h = H.init(S); H.sync(S);
    var main = [], view = [];
    BEATS.forEach(function (d) {
      if (h.qT[d.id] === S.t) return;
      if (opt.only && !opt.only(d)) return;
      if (!H.ok(S, d, false)) return;
      (d.o.view ? view : main).push(d);
    });
    main = U.shuffle(main).sort(function (a, b) { return (a.o.pri || 4) - (b.o.pri || 4); });
    var out = main.slice(0, n);
    if (view.length && (opt.view === true || (opt.view !== false && U.chance(0.55)))) out.push(U.pick(view));
    out.forEach(function (d) { h.qT[d.id] = S.t; });
    return out.map(function (d) { return d.ev; });
  };

  // ---------- 便利な条件 ----------
  var age = function (S) { return KL.age(S); };
  var soc = function (S) { return S.track === 'soccer' && S.soccer && !S.soccer.retired; };
  var pro = function (S) { return S.stage === 'pro' && S.soccer && S.soccer.club && !S.soccer.retired; };
  var abroad = function (S) { return pro(S) && !KL.LEAGUES[KL.Soccer.club(S).l].japan; };
  var stu = function (S) { return KL.isStudent(S); };
  var like = H.like, stg = H.stage, gf = H.gf, single = H.single, tog = H.together;
  var lv = function (S) { return S.soccer && !S.soccer.retired ? S.soccer.level : ''; };
  var her = function (S) { var n = H.npc(S); return n ? KL.npcAge(S, n) : age(S) + H.D[S.hero.cur].ad; };
  var free = function (S) { return !tog(S) && !S.hero.hbf; };            // ヒロインが「誰のものでもない」
  var club = function (S) { return pro(S) ? KL.Soccer.club(S).n : ''; };
  H.abroad = abroad; H.pro = pro;
  var V = function (t) { return '――――\n' + t; };                          // 彼女の視点の区切り
  var pre = function (S, v, memo) { S.hero.pre = (S.hero.pre || 0) + v; S.hero.peek = (S.hero.peek || 0) + 1; if (memo) H.memo(S, memo); };

  // ======================================================
  //  幼稚園のころ、一度だけ会う（千咲は隣の家なので無し）
  // ======================================================
  H.KINDER = {
    miyako: { title: 'うさぎのキーホルダー', icon: '🐰', memo: '公園で、うさぎのキーホルダーを拾ってあげた小さな女の子', text: '公園の砂場のそばで、小さな女の子が泣いていた。\n足もとに、うさぎのキーホルダーが落ちている。\n「……う、うさぎさん……」',
      a: ['拾って、手のひらにのせてあげる', '女の子は泣きやんで、キーホルダーをぎゅっと握った。\n「……ありがとう、ございます」\n小さいのに、ていねいな話し方をする子だった。名前は聞きそびれた。'],
      b: ['お母さんを呼んでくる', 'お母さんが来ると、女の子はうさぎを抱えて帰っていった。\n振り返って、小さく頭を下げていた。'],
      recall: '……ミヤコのカバンに、色のあせたうさぎのキーホルダーが揺れていた。\n「……それ」\n「……これは、昔、公園で拾っていただいたものです」\nミヤコは、少しだけ目を伏せた。\n「……やっぱり、先輩だったんですね」',
      more: '「運動会のときも。試合のときも。……記録、していました。先輩は、気づいていませんでしたが」' },
    hoshino: { title: '迷子のふたり', icon: '🎈', memo: 'ショッピングモールで、一緒に迷子になった眠そうな女の子', text: 'ショッピングモールで、お母さんとはぐれた。\nベンチに、ぼーっと座っている年上の女の子がいた。\n「うへ〜……きみも迷子〜？ おじさんもなんだよね〜」',
      a: ['となりに座って一緒に待つ', '女の子は、ずっとのんびり話してくれた。\n「だいじょうぶだよ〜。適当に待ってれば、だれか来るから〜」\n本当に、すぐにお母さんが来た。'],
      b: ['ひとりで探しに行く', '「あ〜、行っちゃうの〜？ 気をつけてね〜」\n振り返ると、女の子は手をひらひら振っていた。'],
      recall: '「……ねえ〜。きみ、昔ショッピングモールで迷子になってなかった〜？」\n先輩は、目を細めてこっちを見た。\n「うへ〜、やっぱり〜。……おじさん、覚えてたんだよね〜。ずっと」',
      more: '「公園の帽子も、廊下ですれ違ったのも……全部覚えてるよ〜。……きみは、ぜんぜん気づいてなかったけどね〜」' },
    miyabi: { title: '夏祭りのお姉さん', icon: '🏮', memo: '夏祭りでぶつかった、木刀を持ったお姉さん', text: '夏祭りの人混みで、走っていたら誰かにぶつかった。\n浴衣に木刀を下げた、背の高いお姉さんだった。\n「……走るな。危ないだろう」',
      a: ['「ごめんなさい」とちゃんと謝る', 'お姉さんは少しだけ目を丸くして、それから頭をぽんと叩いた。\n「……よし。素直なのはいいことだ」\nりんご飴を一本、くれた。'],
      b: ['びっくりして逃げ出す', '「おい、待て――」\n振り返ると、お姉さんは人混みの中で、ちょっと困った顔をしていた。'],
      recall: '「……待て。お前、昔、夏祭りでぶつかってきた子供か」\n雅は、まじまじとこっちの顔を見た。\n「……そうか。あの子供が、こうなったか」\n凛とした顔が、ほんの少しだけゆるんだ。',
      more: '「剣道の大会の日も、スタンドからも、見ていた。……お前は、一度も気づかなかったがな」' }
  };
  Bt('hero_kinder', '*', { pre: true, imp: 2, pri: 1, c: function (S) { var h = S.hero; return h.mode === 'main' && !!H.KINDER[h.cur] && age(S) >= 4 && age(S) <= 6; }, after: function (S) { S.hero.kinder = S.hero.cur; } },
    function (S) { return H.KINDER[S.hero.cur].title; }, '🌱',
    function (S) { return H.KINDER[S.hero.cur].text; },
    [[function (S) { return H.KINDER[S.hero.cur].a[0]; }, { com: 1 }, function (S) { S.hero.kindA = true; pre(S, 4, H.KINDER[S.hero.cur].memo); return H.KINDER[S.hero.cur].a[1]; }, 'life'],
     [function (S) { return H.KINDER[S.hero.cur].b[0]; }, {}, function (S) { pre(S, 1, H.KINDER[S.hero.cur].memo); return H.KINDER[S.hero.cur].b[1]; }, 'b']]);
  // 出会ったとき、昔の子と同じなら思い出す
  var meet0 = H.meet;
  H.meet = function (S, how) {
    var was = S.hero.met, n = meet0(S, how), id = S.hero.cur;
    if (!was && n && H.KINDER[id] && (S.hero.kinder === id || S.hero.peek >= 2)) {
      var txt = (S.hero.kinder === id ? H.KINDER[id].recall : '') + (S.hero.peek >= 2 ? (S.hero.kinder === id ? '\n\n' : '') + H.KINDER[id].more : '');
      KL.push(S, { id: 'hero_recall', cat: 'hero', imp: 2, title: 'あのときの', icon: H.KINDER[id].icon, text: KL.fill(S, txt), img: H.img(S, 'base'),
        choices: [{ t: '「……覚えてたんだ」', ok: true, fx: function (S) { H.aff(S, S.hero.kindA ? 10 : 5); H.mark(S, 'あのときの', H.img(S, 'base')); S.hero.mem = []; return KL.fill(S, ({ miyako: '「……忘れる理由が、ありませんでしたので」', hoshino: '「うへ〜……おじさん、記憶力だけはいいんだよね〜」', miyabi: '「……忘れるものか」' })[id] || '') + '\n\n不思議な縁だと思った。'; } }] });
    }
    return n;
  };

  // ======================================================
  //  朽葉 千咲（幼なじみ・2つ上・黒髪に赤いリボン・無口・手紙）
  // ======================================================
  Bt('ch_meet', 'chisa', { meet: true, how: '隣の家（幼なじみ）', imp: 2, pri: 1, c: function (S) { return S.hero.mode === 'main' && age(S) >= 3 && age(S) <= 5; } }, '隣の家のお姉ちゃん', '🎀',
    '隣の家に、新しい家族が越してきた。\nあいさつに来たのは、黒い髪に赤いリボンをつけた、2つ年上の女の子。\nお母さんの後ろに隠れて、こっちをじっと見ている。\n\n「……朽葉、千咲。……よろしく」',
    [['「いっしょにあそぼ！」と手を引っぱる', { like: { who: 'hero', v: 6 }, com: 1 }, '千咲は少しびっくりして、それから小さくうなずいた。\nその日から、ときどき一緒に遊ぶようになった。', 'life'],
     ['はずかしくて、お母さんの後ろに隠れる', { like: { who: 'hero', v: 2 } }, 'お互いにお母さんの後ろから、じーっと見つめ合った。\n帰り際、千咲が小さく手を振った。', 'b']]);
  Bt('ch_school', 'chisa', { c: function (S) { return age(S) >= 6 && age(S) <= 8; } }, '千咲と登校', '🎒',
    '小学校に上がった。2つ上の千咲は、ときどき家の前で待っていてくれる。\n「……{mei}くん、寝ぐせ」\n無言で、手ぐしで直してくれた。',
    [['「ありがとう、千咲ちゃん」', { like: { who: 'hero', v: 6 } }, '千咲は「……別に」と言って、少し早足になった。耳が赤かった。', 'life'],
     ['照れくさくて走って先に行く', { like: { who: 'hero', v: 2 }, ath: 1 }, '振り返ると、千咲はいつもの歩幅で、ゆっくりついてきていた。', 'soccer']], 'school');
  Bt('ch_v_window', 'chisa', { view: true, c: function (S) { return age(S) >= 7 && age(S) <= 12; } }, '隣の家の二階', '🪟',
    function (S) { return V('隣の家の二階。千咲は、カーテンの隙間から庭を見ていた。\n' + (soc(S) ? 'ボールを蹴る音が、今日も日が暮れるまで続いている。\n「……へたくそ。……でも、毎日やってる」' : '男の子が、ひとりで逆上がりの練習をしている。\n「……あ。……できた」') + '\n千咲は、読みかけの本に、しおりを挟むのを忘れていた。'); });
  Bt('ch_towel', 'chisa', { c: function (S) { return age(S) >= 8 && age(S) <= 11; } }, '観客席の千咲', '🏟️',
    function (S) { return (soc(S) ? 'サッカーの試合' : '運動会') + 'の日。観客席の端っこに、千咲がいた。\n終わったあと、無言でタオルとスポーツドリンクを差し出してくる。\n「……見てた。' + (S.st.ath >= 40 ? '速かった' : 'がんばってた') + '」'; },
    [['「来てくれたん！？」と素直に喜ぶ', { like: { who: 'hero', v: 8 }, men: 1 }, '千咲は「……たまたま、通りかかっただけ」と言った。\n家から3駅も離れたグラウンドだった。', 'life'],
     ['「次はもっとすごいとこ見せる」と宣言する', { like: { who: 'hero', v: 6 }, ego: 1 }, '「……うん。待ってる」\n千咲は小さく笑った。めずらしいことだった。', 'soccer'],
     ['「別に来なくてもいいのに」', { like: { who: 'hero', v: -5 } }, '千咲は何も言わずに、タオルだけ置いて帰っていった。', 'b']], 'school');
  Bt('ch_rain', 'chisa', { c: function (S) { return age(S) >= 9 && age(S) <= 13; } }, '夕立', '☔',
    '夕立。校門で立ち往生していると、黒い傘が差し出された。千咲だった。\n「……入る？」\n傘は小さくて、千咲の肩が濡れていた。',
    [['傘を、千咲のほうに傾ける', { like: { who: 'hero', v: 9 } }, '千咲は何も言わなかった。家に着くまで、ずっと前だけを見ていた。\n\n' + V('その夜、千咲の日記には、一行だけ書かれていた。\n「傘、こっちに傾けてくれた」'), 'life'],
     ['「走って帰る！」と飛び出す', { like: { who: 'hero', v: 2 }, ath: 1 }, '振り返ると、千咲は傘をさしたまま、ずっとこっちを見ていた。', 'soccer']], 'school');
  Bt('ch_jhs', 'chisa', { c: function (S) { return age(S) >= 10 && age(S) <= 12; } }, '先に行く千咲', '🌸',
    '千咲が中学生になった。紺の制服。急に大人っぽく見える。\n「……先に行くね。中学」\n帰り道、千咲がぽつりと言った。',
    [['「すぐ追いつくから」', { like: { who: 'hero', v: 7 } }, '「……うん。待ってないけど、待ってる」\n意味がよくわからなかったけど、なんだか嬉しかった。', 'life'],
     ['「中学って楽しい？」と聞く', { like: { who: 'hero', v: 4 }, com: 1 }, '「……わかんない。でも、{mei}くんがいないのは、ちょっと変」', 'b']], 'school');
  Bt('ch_festival', 'chisa', { c: function (S) { return age(S) >= 12 && age(S) <= 15 && KL.isB(S); } }, '夏祭り', '🎆',
    function (S) { return '地元の夏祭り。観覧車の前で、千咲が線香花火を持って立っていた。\n「……{mei}くんも、やる？」' + (gf(S) ? '\n「……今日は、ひとり？」\n千咲は、なぜか周りを見回していた。' : '') + '\n火花が、ぱちぱちと小さく弾ける。'; },
    [['隣にしゃがんで、一緒にやる', { like: { who: 'hero', v: 9 } }, '先に落ちたほうが、相手のお願いをひとつ聞く。\n千咲の玉が、少しだけ長く残った。\n「……じゃあ、お願い。……来年も、ここに来て」', 'life'],
     ['友達に呼ばれて、そっちに行く', { like: { who: 'hero', v: -4 }, com: 1 }, '振り返ると、千咲はひとりで最後の火花を見つめていた。', 'b']], 'base');
  Bt('ch_letter', 'chisa', { c: function (S) { return age(S) >= 13 && age(S) <= 17 && like(S) >= 35; } }, '一通の手紙', '✉️',
    function (S) { return '下駄箱に、白い封筒が入っていた。見慣れた、千咲の字。\n\n「' + (soc(S) ? 'この前の試合、見に行きました。ボールを持ったとき、{mei}くんだけ時間が止まってるみたいだった。' : '最近、あんまり話せてないね。') + '\nわたしは口で言うのが下手だから、手紙にします。\n……応援してる。ずっと。」'; },
    [['返事の手紙を書く', { like: { who: 'hero', v: 9 }, art: 1 }, '慣れない手紙を三回書き直して、千咲の家のポストに入れた。\n次の日、千咲は一日中、目を合わせてくれなかった。たぶん、照れていた。', 'life'],
     ['直接「ありがとう」と言いに行く', { like: { who: 'hero', v: 7 }, com: 1 }, '「……読んだの。……恥ずかしい」\n千咲は真っ赤になって、ドアを閉めた。', 'b'],
     ['忙しくて、そのままにしてしまう', { like: { who: 'hero', v: -6 } }, '手紙は、机の引き出しの奥にしまわれたままになった。', 'soccer']], 'serious');
  // 彼女といるところを、千咲に見られる
  Bt('ch_seen', 'chisa', { repeat: true, max: 2, cool: 4, pri: 3, c: function (S) { return !!gf(S) && age(S) >= 11 && age(S) <= 22 && like(S) >= 30 && !tog(S); } }, 'すれ違い', '🖤',
    function (S) { return '{pname}と並んで帰っていると、向こうから千咲が歩いてきた。\n「……こんにちは」\n千咲はこっちを見ないまま、{pname}にだけ小さく頭を下げた。' + (stg(S) >= 2 ? '\nすれ違ったあと、一度だけ振り返った気がした。' : ''); },
    [['「隣の家の千咲ちゃん」と紹介する', function (S) { return { like: { who: 'hero', v: stg(S) >= 2 ? -2 : 2 } }; }, function (S) { return stg(S) >= 2 ? '「……どうも」\n千咲は短く言って、早足で去っていった。\n\n' + V('その夜。千咲は、便箋を一枚だけ破いて捨てた。\n書き出しは「{mei}くんへ」だった。') : '「……どうも。……{mei}くんを、よろしく」\n千咲はそう言って、家に入っていった。'; }, 'b'],
     ['軽く手を振って、そのまま歩く', { like: { who: 'hero', v: -2 } }, function (S) { return '千咲は、手を振り返さなかった。' + (stg(S) >= 2 ? '\n\n' + V('「……楽しそうだったね」\n誰もいない部屋で、千咲は小さくつぶやいた。') : ''); }, 'b'],
     ['あとで、千咲の家にお土産を持っていく', { like: { who: 'hero', v: 5 } }, '「……なんで来たの」\nそう言いながら、千咲はお茶をいれてくれた。\n「……別に、いいのに。……気にしてないし」\n湯のみを持つ指が、少しだけ震えていた。', 'life']], 'dark');
  // 千咲の卒業式（主人公16〜17歳ごろ）
  Bt('ch_grad', 'chisa', { imp: 2, pri: 2, c: function (S) { return age(S) >= 16 && age(S) <= 17 && KL.isB(S) && !tog(S); } }, '千咲の卒業式', '🌸',
    function (S) {
      var l = like(S), far = abroad(S);
      if (l >= 70 && gf(S)) return '千咲の高校の卒業式の日。\n' + (far ? '短いメッセージが届いた。' : '家のポストに、白い封筒が入っていた。') + '\n\n「卒業しました。東京の大学に行きます。\n{mei}くんに言いたいことがあったけど、{pname}さんがいるから、書かない。\n……書かないけど、ずっと前から、です。」';
      if (l >= 70) return far ? '千咲の高校の卒業式の日。\n時差で真夜中の{city}に、ビデオ通話がかかってきた。画面の向こうは、満開の桜だった。\n\n「……{mei}くん。ずっと言えなかったこと、言う」\n「……好き、だった。ずっと。……今も」' : '千咲の高校の卒業式の日。\n校門の前で待っていたのは、黒髪に赤いリボンの千咲だった。\n\n「……{mei}くん。ずっと言えなかったこと、言う」\n「……好き、だった。ずっと。……今も」';
      if (l >= 50) return '千咲の高校の卒業式の日。\n千咲は東京の大学に進むらしい。校門の前で、千咲は何か言いかけて、やめた。\n「……ううん。……なんでもない」\n桜が、ちょうど満開だった。';
      return '千咲の高校の卒業式の日。\n千咲は東京の大学に進むらしい。\n「……元気でね、{mei}くん」\nそれだけ言って、千咲は桜の下を歩いていった。';
    },
    [[function (S) { return gf(S) ? '手紙を持って、千咲の家に走る（{pname}とは別れる）' : like(S) >= 70 ? '「おれも、ずっと好きやった」' : '「千咲。……好きや」と、引き止める'; }, {}, function (S) {
      if (like(S) >= 70) { H.date(S, '幼なじみの告白'); return '千咲は、泣きそうな顔で笑った。\n「……知ってた。……うそ。知らなかった」\n桜の下で、手をつないだ。'; }
      if (H.tryConfess(S, 6, '幼なじみに告白')) return '千咲が立ち止まった。振り返った顔は、真っ赤だった。\n「……遅い。……ばか」';
      return '千咲は少し困った顔で、首を振った。\n「……ごめん。今は、わからない。……東京で、考える」\n連絡先は、ちゃんと交換した。';
    }, 'life', function (S) { return like(S) >= 50; }],
     ['「元気でな。向こうでも連絡して」と見送る', {}, function (S) { H.aff(S, like(S) >= 70 ? -6 : 0); return '「……うん。……する」\n千咲の背中が、桜の向こうに消えた。\n連絡先は、ちゃんとスマホに残っている。'; }, 'soccer'],
     ['（はっきり断る）「ごめん。千咲は、姉ちゃんみたいなもんや」', {}, function (S) { return H.decline(S) ? '千咲は、少しだけ笑った。\n「……そっか。……知ってた」\nそれから隣の家は、静かに引っ越していった。' : '千咲は、少しだけ目を伏せた。\n「……そっか。……でも、手紙は書く。……勝手に」'; }, 'x', function (S) { return like(S) >= 70; }]], 'serious');
  Bt('ch_tokyo', 'chisa', { c: function (S) { return free(S) && her(S) >= 19 && age(S) <= 24 && like(S) >= 25; } }, '東京からの手紙', '✉️',
    function (S) { return '東京の千咲から、手紙が届いた。今どき、切手を貼って。\n\n「大学の図書館は、地元のより三倍広いです。\nでも、窓から見えるのは知らない街で、ちょっとだけ、つまらない。\n' + (pro(S) ? '{club}の試合は、全部見てます。' : '{mei}くんは、元気ですか。') + '\n……返事は、なくてもいいです。」'; },
    [['すぐに返事を書く', { like: { who: 'hero', v: 8 }, art: 1 }, '一週間後、また手紙が来た。前より一枚多かった。', 'life'],
     ['電話をかける', { like: { who: 'hero', v: 7 }, com: 1 }, '「……手紙の返事が、電話って」\n千咲の声は、少し笑っていた。\n「……でも、声。ひさしぶり」', 'b'],
     ['読んで、引き出しにしまう', { like: { who: 'hero', v: -3 } }, '手紙は、少しずつ引き出しにたまっていった。', 'soccer']], 'base');
  // 帰省・オフで地元に戻ったとき
  Bt('ch_home', 'chisa', { pri: 3, c: function (S) { return free(S) && age(S) >= 18 && age(S) <= 30 && like(S) >= 40 && KL.isB(S) && (!pro(S) || !abroad(S) || (S.off && S.off.t === S.t && S.off.home)); } }, '地元の夏祭り', '🎆',
    '何年ぶりかに、地元の夏祭りに来た。\n観覧車の前に、線香花火を持った人が立っていた。黒い髪に、赤いリボン。\n「……{mei}くん。……来ると、思った」\n「……約束、したから。小さい頃」',
    [['「千咲。おれ、千咲が好きや」', {}, function (S) { if (H.tryConfess(S, 10, '夏祭りの約束')) return '線香花火の玉が、ぽとりと落ちた。\n千咲は、それを見つめたまま言った。\n「……落ちたほうが、お願いを聞く。……だから、はい」'; return '千咲は線香花火を見つめたまま、首を振った。\n「……ずるい。……今、言うの」\n「……もうちょっとだけ、時間ちょうだい」'; }, 'life', function (S) { return like(S) >= 50 || !gf(S); }],
     ['並んで、線香花火をする', { like: { who: 'hero', v: 8 } }, '先に落ちたのは、こっちだった。\n「……じゃあ、お願い。……また、来年も」', 'b']], 'base');
  // 海外にいるとき、千咲が観に来る
  Bt('ch_second', 'chisa', { imp: 2, pri: 2, c: function (S) { return free(S) && abroad(S) && age(S) >= 18 && age(S) <= 26 && like(S) >= 45; } }, '観客席の赤いリボン', '🎀',
    function (S) { return '{city}のスタジアム。試合後、スタンドの端に見覚えのある赤いリボンが見えた。\n\n「……来ちゃった。' + (her(S) <= 23 ? '卒業旅行、ってことにして' : '有給、全部使った') + '」\n千咲は、昔と同じタオルを握りしめていた。小さい頃、観客席で振っていたやつだ。\n「……{mei}くん、遠くに行っちゃったね。……ずっと、見てた」' + (gf(S) ? '\n\n――{pname}のことは、千咲も知っているはずだった。' : ''); },
    [[function (S) { return gf(S) ? '「……会いたかった」（{pname}とは別れる）' : '「会いたかった。……付き合ってほしい」'; }, {}, function (S) { if (H.tryConfess(S, 12, '異国のスタジアムで')) { var n = H.npc(S); if (n) { n.city = KL.ph(S, 'city'); n.job = '翻訳の仕事（リモート）'; } S.hero.f.withMe = true; return '千咲は、タオルで顔を隠した。\n「……遅い。……ばか。……こっちで、仕事探す」\n知らない街の夜が、急に明るくなった。'; } return '千咲は、ゆっくり首を振った。\n「……今は、まだ。……でも、また来る」\n空港で、千咲は小さく手を振った。'; }, 'life'],
     ['「来てくれてありがとう」と、街を案内する', { like: { who: 'hero', v: 8 } }, '二人で{city}の旧市街を歩いた。千咲はずっと楽しそうだった。\n空港で、千咲は小さく手を振った。\n「……また、来ていい？」', 'soccer']], 'serious');
  Bt('ch_v_love', 'chisa', { view: true, repeat: true, max: 4, cool: 4, c: function (S) { return !tog(S) && stg(S) >= 2; } }, '千咲の便箋', '✉️',
    [V('夜中の一時。千咲は、便箋に三行だけ書いて、また丸めた。\n「{mei}くんへ。\n元気ですか。\nわたしは、」\n……その続きが、いつも書けない。'),
     V('千咲のスマホの写真フォルダには、テレビ画面を撮った写真が増えていく。\nぜんぶ、同じ人が写っていた。'),
     V('「……好きな人？」\n大学の友達に聞かれて、千咲は本から顔を上げなかった。\n「……いない。……たぶん」\nページは、さっきから一枚もめくられていなかった。')]);
  Bt('ch_v_gf', 'chisa', { view: true, repeat: true, max: 3, cool: 3, c: function (S) { return !!gf(S) && stg(S) >= 1 && !tog(S); } }, '図書室の窓', '🪟',
    [V('下校の時間。千咲は、図書室の窓から校門を見ていた。\n隣の家の男の子が、知らない女の子と並んで歩いていく。\n……読んでいた本の同じ行を、三回読んだ。'),
     V('「……彼女、できたんだって」\n母親の何気ない一言に、千咲は「……ふうん」とだけ答えた。\nその夜、赤いリボンをほどいて、しばらく見つめていた。'),
     V('千咲は、隣の家の窓に明かりがつくのを見ていた。\n電話をしているらしい。笑い声が、少しだけ聞こえる。\n……カーテンを、そっと閉めた。')]);
  // 付き合ってから
  Bt('ch_ldr', 'chisa', { need: [], c: function (S) { return H.dating(S) && her(S) >= 18 && her(S) <= 23 && !S.hero.f.withMe; } }, '東京と地元', '📱',
    '千咲は東京で一人暮らしをしている。夜、ビデオ通話がかかってくる。\n画面の向こうで、千咲は何も話さず、ただこっちを見ている。\n「……顔、見たかっただけ」',
    [['通話をつないだまま、眠るまで話す', { like: { who: 'hero', v: 10 }, fat: 3 }, '途中から千咲は寝息を立て始めた。\n画面を切るのが、少しもったいなかった。', 'life'],
     ['「明日早いから」と切り上げる', { like: { who: 'hero', v: -3 }, form: 1 }, '「……うん。がんばって」\n切ったあと、短いメッセージが届いた。「おやすみ」', 'soccer']], 'base');
  Bt('ch_jealous', 'chisa', { repeat: true, max: 3, cool: 6, c: function (S) { return tog(S) && KL.mote(S) >= 55; } }, '……さっきの人', '🖤',
    function (S) { return (pro(S) ? '試合のあと、出待ちの女の子たちに囲まれてサインをしていた。' : '帰り道、女の子に話しかけられていた。') + '\nふと見ると、少し離れたところに千咲がいた。\n\n' + H.react(S, 'jealous'); },
    [['「ファンの子やで。千咲だけやから」と正直に話す', { like: { who: 'hero', v: 8 } }, '千咲は長い間黙っていた。それから、手紙の端を小さく折った。\n「……知ってる。でも、言ってほしかった」', 'life'],
     ['「気にしすぎ」と笑ってごまかす', { like: { who: 'hero', v: -10 } }, '千咲はそれ以上、何も言わなかった。\nその夜、既読がつかなかった。', 'soccer']], 'dark');
  Bt('ch_support', 'chisa', { repeat: true, max: 2, cool: 8, c: function (S) { return tog(S) && S.soccer && (S.soccer.injDays > 0 || (S.form || 0) <= -4); } }, '何もしないけど、いる', '🍵',
    function (S) { return (S.soccer && S.soccer.injDays > 0 ? '怪我で練習に出られない日。' : '結果が出ない日が続いている。') + '\n部屋に、千咲が来た。何も聞かない。\nお茶をいれて、隣で本を読んでいる。\n「……そばにいる。何もしないけど、いる」'; },
    [['黙って隣に座る', { like: { who: 'hero', v: 8 }, men: 3, form: 2 }, 'ページをめくる音だけが聞こえる。\nそれだけで、少し息ができるようになった。', 'life'],
     ['「一人にしてほしい」', { like: { who: 'hero', v: -4 }, men: 1 }, '千咲は小さくうなずいて、お茶だけ置いて帰った。\n湯気の向こうに、ドアの閉まる音。', 'soccer']], 'serious');
  Bt('ch_abroad', 'chisa', { c: function (S) { return tog(S) && abroad(S) && !S.hero.f.withMe; } }, '海を越える', '✈️',
    function (S) { return '{club}への移籍が決まった。千咲に伝えると、しばらく黙っていた。\n「……行くんだね。遠いね」'; },
    [['「一緒に来てほしい」', { like: { who: 'hero', v: 12 } }, function (S) { var n = H.npc(S); if (n) { n.city = KL.ph(S, 'city'); n.job = '翻訳の仕事（リモート）'; } S.hero.f.withMe = true; return '千咲は、指先でリボンをいじりながら言った。\n「……仕事、向こうでもできる。……行く」'; }, 'life'],
     ['「待っててほしい」', { like: { who: 'hero', v: 4 } }, '「……待つの、得意。小さい頃から」\n空港で、千咲は最後まで手を振っていた。', 'soccer']], 'serious');
  Bt('ch_propose', 'chisa', { imp: 2, pri: 2, c: function (S) { return H.dating(S) && age(S) >= 21 && like(S) >= 65 && S.t - (S.hero.dateT || S.t) >= 4; } }, '観覧車', '💍',
    '地元の夏祭り。二人で観覧車に乗った。\nてっぺんに近づく。千咲は窓の外を見たまま言った。\n「……ここ、小さい頃に約束した場所」\n\nポケットの中の小さな箱が、急に重く感じた。',
    [['「結婚してください」', {}, function (S) { H.marry(S); return '千咲は長いこと何も言わなかった。\nそれから、一通の手紙をこっちに差し出した。\n「……返事。昨日、書いた。……読んで」\n\n便箋には、一行だけ。\n「はい。」'; }, 'life'],
     ['今はまだ言えない', { like: { who: 'hero', v: -6 } }, '観覧車が一周して、地上に戻った。\n千咲は「……きれいだったね」とだけ言った。', 'soccer']], 'base');
  Bt('ch_wed', 'chisa', { imp: 2, pri: 1, c: function (S) { return H.married(S); } }, '結婚式', '💒',
    '白いドレスの千咲は、いつもの赤いリボンをつけていた。\n「……これは、外したくない。{mei}くんが、最初に褒めてくれたから」\n\n誓いの言葉を、千咲は小さな声で、でもはっきり言った。',
    [['「一生、大事にする」', { like: { who: 'hero', v: 10 }, men: 3 }, '式のあと、千咲の父親に肩をたたかれた。\n「あの子が泣くの、初めて見たよ」\n\n' + V('式が終わった夜。千咲は、小学生のころからの手紙の束を、そっと箱にしまった。\n全部、出せなかった手紙だった。\n「……もう、出さなくていい。……ずっと、隣にいるから」'), 'life']], 'base');
  Bt('ch_life', 'chisa', { repeat: true, max: 4, cool: 6, c: function (S) { return H.married(S); } }, '千咲のいる毎日', '🏠',
    ['朝、テーブルに手紙が置いてあった。「いってらっしゃい。今日も見てる」', '千咲が新しいリボンを買ってきた。「……どっちがいい？」 どっちも赤い。', '夜、千咲が読んでいた本を閉じて言った。「……{mei}くんの話、聞かせて」', '雨の日、千咲は窓際でずっと外を見ていた。「……昔も、こうやって雨やむの待ってたね」'],
    [['一緒に過ごす', { like: { who: 'hero', v: 6 }, men: 2, fat: -5 }, ['なんでもない一日が、いちばん贅沢だと思った。', '千咲が、めずらしく声を出して笑った。', '並んで同じ本を読んだ。千咲のほうが三倍速かった。'], 'life']], 'base');
  Bt('ch_kid', 'chisa', { imp: 1, c: function (S) { return H.married(S) && S.kids.length >= 1; } }, '名前の手紙', '👶',
    function (S) { var k = S.kids[S.kids.length - 1]; return '子どもが生まれた。\n病室で、千咲は小さな封筒を差し出した。\n「……名前。手紙に、十個書いた。……一個だけ、選んで」\n\n十個目に書かれていたのは「' + (k ? k.name : '') + '」だった。'; },
    [['十個目を指さす', { like: { who: 'hero', v: 8 }, men: 2 }, '「……やっぱり。……それが、いちばん書くのに時間かかった」\n千咲は、赤ちゃんの手に、自分の指を握らせた。', 'life']], 'base');
  Bt('ch_box', 'chisa', { c: function (S) { return H.married(S) && S.t - (S.marriedT || S.t) >= 14; } }, '手紙の箱', '📦',
    '結婚して七年。押し入れの奥から、古い缶の箱が出てきた。\n中には、宛名だけ書かれた手紙が、何十通も入っていた。\n「{mei}くんへ」「{mei}くんへ」「{mei}くんへ」――\n\n振り返ると、千咲が真っ赤な顔で立っていた。',
    [['「……読んでいい？」', { like: { who: 'hero', v: 10 } }, '「……だめ。……でも、一通だけなら」\n小学生の字で、こう書いてあった。\n「おおきくなったら、となりにすみたいです」\n「……叶った」と、千咲は小さく言った。', 'life'],
     ['黙って、箱を元に戻す', { like: { who: 'hero', v: 6 } }, '千咲は、何も言わずに背中にくっついてきた。\nしばらく、そのままだった。', 'b']], 'base');
  Bt('ch_retire', 'chisa', { imp: 1, c: function (S) { return tog(S) && S.soccer && S.soccer.retired && S.soccer.proYears; } }, '最後の手紙', '🌅',
    '引退試合の夜。家に帰ると、テーブルに一通の手紙が置いてあった。\n\n「{mei}くんへ。\nおつかれさま。\n隣の家の二階から見ていた子が、世界まで行っちゃった。\nわたしは、最初から最後まで、ぜんぶ見てた。\nこれからは、隣で見る。」',
    [['千咲を抱きしめる', { like: { who: 'hero', v: 10 }, men: 4 }, '「……ん」\n千咲は、何も言わなかった。言わなくても、よかった。', 'life']], 'base');
  Bt('ch_old', 'chisa', { c: function (S) { return H.married(S) && age(S) >= 60; } }, '縁側', '🍵',
    '縁側で、千咲がお茶をいれてくれた。\n赤いリボンは、もう白髪にまじっている。\n「……ねえ。最初に会った日、覚えてる？」',
    [['「お母さんの後ろに隠れてた」', { like: { who: 'hero', v: 8 } }, '「……{mei}くんもでしょ」\n千咲は、昔と同じ顔で笑った。', 'life']], 'base');

  // ======================================================
  //  月雪 ミヤコ（後輩・1つ下・分析・うさぎ・ですます）
  // ======================================================
  Bt('my_p1', 'miyako', { pre: true, c: function (S) { return age(S) >= 7 && age(S) <= 9 && !KL.isB(S); } }, '運動会のリレー', '🏁',
    '運動会。リレーの待機列のそばで、小さな女の子が転んで泣いていた。\n白い髪の、下の学年の子だ。',
    [['手を貸して立たせる', {}, function (S) { pre(S, 5, '運動会で転んでいた、白い髪の下級生'); return '「……あ、ありがとう、ございます」\n女の子は、手のひらをじっと見ていた。\n\n' + V('列に戻ったあと、その子は誰にも聞こえない声で言った。\n「……' + (S.hero.kinder ? 'うさぎの' : 'やさしい') + '、人です」'); }, 'life'],
     ['先生を呼んでくる', {}, function (S) { pre(S, 2, '運動会で転んでいた、白い髪の下級生'); return '先生が来て、女の子は保健室に連れていかれた。\n途中で一度だけ、こっちを振り返っていた。'; }, 'b']]);
  Bt('my_p2', 'miyako', { pre: true, c: function (S) { return age(S) >= 9 && age(S) <= 12; } }, 'フェンスの向こう', '📓',
    function (S) { return (soc(S) ? '試合' : '体育の授業') + 'のあと、フェンスの向こうで、白い髪の女の子がノートに何か書いていた。\n目が合うと、すぐにそらされた。'; },
    [['手を振ってみる', {}, function (S) { pre(S, 4, 'フェンスの向こうで、ノートに何か書いていた女の子'); return '女の子は、ノートで顔を隠した。\n\n' + V('家に帰ると、女の子はノートの一ページ目に、ていねいな字で書いた。\n「観察記録 No.1」\n二行目には、こう書いてあった。\n「手をふられた。（心拍数：測定不能）」'); }, 'life'],
     ['気にせず帰る', {}, function (S) { pre(S, 2, 'フェンスの向こうで、ノートに何か書いていた女の子'); return '\n' + V('「……今日は、こっちを見ませんでした」\n女の子は、ノートに小さくそう書いた。'); }, 'soccer']]);
  Bt('my_p3', 'miyako', { pre: true, view: true, c: function (S) { return !!gf(S) && age(S) >= 11 && age(S) <= 16; }, after: function (S) { pre(S, 3, '彼女と帰る途中、どこかから感じた視線'); } }, '校門の視線', '🐰',
    function (S) { return '{pname}と下校していると、背中に視線を感じた。振り返っても、誰もいなかった。\n\n' + V('電柱の陰で、白い髪の女の子がノートを抱えていた。\n前を歩く二人は、手をつないでいた。\n「……データに、ない、です」\nノートを閉じる音が、少しだけ大きかった。'); });
  // 出会い（どの進路でも出会える）
  Bt('my_meet_club', 'miyako', { meet: true, how: 'サッカー部の後輩マネージャー', imp: 2, pri: 1, c: function (S) { return ['bukatsu', 'hs', 'hs_power'].indexOf(lv(S)) >= 0 && age(S) >= 13 && age(S) <= 17; } }, '新しいマネージャー', '📋',
    '新学期。サッカー部に、新しいマネージャーが入ってきた。\n白い髪をポニーテールにした、小柄な1年生。\n\n「月雪ミヤコです。データ分析を担当します。……先輩方、よろしくお願いします」\n\n練習が終わると、ミヤコはまっすぐこっちに来た。\n「……先輩の今日のスプリント回数、ほかの方の1.4倍でした。異常値です」',
    [['「よう見てるなぁ。よろしく、月雪」', { like: { who: 'hero', v: 6 }, com: 1 }, '「……ミヤコ、で結構です。先輩」\nミヤコはノートに何か書き込んだ。たぶん、自分のことだ。', 'life'],
     ['「異常値ってなんやねん」とツッコむ', { like: { who: 'hero', v: 4 } }, '「褒め言葉です。……たぶん」\nミヤコは少しだけ首をかしげた。', 'b'],
     ['軽く会釈して帰る', { like: { who: 'hero', v: 1 } }, '「……了解しました」\n背中に、ペンを走らせる音が聞こえた。', 'soccer']], 'school');
  Bt('my_meet_school', 'miyako', { meet: true, how: '同じ高校の後輩', imp: 2, pri: 1, c: function (S) { return S.stage === 'hs' && age(S) >= 16 && age(S) <= 17 && ['bukatsu', 'hs', 'hs_power'].indexOf(lv(S)) < 0; } }, '図書室の一年生', '📚',
    function (S) { return '放課後の図書室。白い髪の一年生が、タブレットで' + (soc(S) ? '試合の映像' : '体育祭のリレーの映像') + 'を止めては、ノートに書き込んでいた。\n映っていたのは、自分だった。\n\n「……あ」\n一年生は、ノートを胸に抱えて固まった。\n「……月雪ミヤコです。……これは、その。……研究です」'; },
    [['「何の研究？」と隣に座る', { like: { who: 'hero', v: 6 }, com: 1 }, '「……先輩の、加速の仕方です。……一歩目が、ほかの人と違います」\nミヤコは、少しだけ早口だった。', 'life'],
     ['「ほどほどにな」と笑って立ち去る', { like: { who: 'hero', v: 2 } }, '「……了解しました」\n振り返ると、ミヤコはまだこっちを見ていた。', 'b']], 'school');
  Bt('my_meet_univ', 'miyako', { meet: true, how: '大学の後輩', imp: 2, pri: 1, c: function (S) { return S.stage === 'univ' && age(S) >= 19 && age(S) <= 21; } }, 'ゼミの新入生', '📊',
    '新しくゼミに入ってきた一年生は、白い髪をポニーテールにしていた。\n自己紹介の最後に、こっちを見て言った。\n「月雪ミヤコです。……先輩のことは、存じ上げています。個人的に」\nゼミ室が、少しざわついた。',
    [['「どこかで会った？」と聞く', { like: { who: 'hero', v: 5 } }, '「……データ不足で、回答できません」\nミヤコはそっぽを向いた。耳が赤かった。', 'life'],
     ['軽く会釈する', { like: { who: 'hero', v: 2 } }, '「……了解しました」\nミヤコは、ノートを一ページめくった。', 'b']], 'school');
  Bt('my_meet_pro', 'miyako', { meet: true, how: 'クラブの分析スタッフ', imp: 2, pri: 1, c: function (S) { return pro(S) && age(S) >= 19 && age(S) <= 30; } }, '新しいアナリスト', '📋',
    function (S) { return '{club}の分析部門に、新しいスタッフが入った。白い髪の、小柄な女性だった。\n「本日付で配属されました、月雪ミヤコです。……担当は、先輩です」\n\n「先輩？」\n「……個人的な呼び方です。お気になさらず」\nミヤコは、分厚い資料を差し出した。表紙には、自分の名前と「観察記録・第14巻」。'; },
    [['「14巻！？」とページをめくる', { like: { who: 'hero', v: 6 }, sk: { iq: 1 } }, '中学生のころの試合から、全部あった。\n「……データは、積み重ねです。先輩」\nミヤコは、少しだけ誇らしげだった。', 'soccer'],
     ['「よろしく頼むわ」と握手する', { like: { who: 'hero', v: 4 } }, '「……はい。了解しました」\n握手した手を、ミヤコはしばらく見つめていた。', 'b']], 'work');
  Bt('my_meet_work', 'miyako', { meet: true, how: '職場の後輩', imp: 2, pri: 1, c: function (S) { return !pro(S) && !stu(S) && age(S) >= 19 && age(S) <= 30; } }, '新人研修', '💼',
    'その春の新人は、白い髪をポニーテールにした女性だった。\n「月雪ミヤコです。本日から、先輩の下につきます。……先輩、と呼んでも構いませんか」\n「……昔から、そう呼ぶと決めていたので」',
    [['「昔から？」と聞き返す', { like: { who: 'hero', v: 5 } }, '「……データ不足で、回答できません」\nミヤコはノートを開いて、何か書いた。', 'life'],
     ['「好きに呼んで」と笑う', { like: { who: 'hero', v: 4 } }, '「……了解しました、先輩」', 'b']], 'work');
  Bt('my_note', 'miyako', { c: function (S) { return true; } }, 'ミヤコのノート', '📓',
    '居残りのあと、ベンチにノートが置き忘れられていた。表紙には「先輩・観察記録」。\n中には、自分の癖、得意なこと、疲れると左足の踏み込みが浅くなること――びっしりと書かれている。\n\n息を切らしたミヤコが戻ってきた。\n「……見ましたか、先輩」',
    [['「すごいな。これ、使わせて」', { like: { who: 'hero', v: 8 }, sk: { iq: 1 } }, '「……了解しました。では、明日から一緒に映像を見ます」\nミヤコはノートを胸に抱えたまま、少しだけ笑った。', 'soccer'],
     ['「おれのファンなん？」とからかう', { like: { who: 'hero', v: 4 }, ego: 1 }, '「……違います。分析対象です」\n耳まで真っ赤だった。', 'life'],
     ['見なかったことにする', { like: { who: 'hero', v: -2 } }, '「……そうですか」\nミヤコは、どこか残念そうにノートをしまった。', 'b']], 'school');
  Bt('my_rabbit', 'miyako', { need: ['my_note'], c: function (S) { return KL.isB(S); } }, '星を見る夜', '🐇',
    function (S) { return (stu(S) ? '夏合宿の最終日の夜。宿舎の外で' : '遠征先のホテルの屋上で') + '、ミヤコがひとりで星を見ていた。\n\n「……先輩。ウサギは寂しいと死んでしまう、という話をご存じですか」\n「あれは俗説です。実際は、一匹でも生きていけるそうです」\n\n少し間があった。\n「……でも、私はウサギではないので」'; },
    [['「……じゃあ、一人にせんとくわ」と隣に座る', { like: { who: 'hero', v: 10 } }, 'ミヤコは何も言わなかった。\nただ、少しだけこっちに寄りかかってきた。\n「……了解、しました」', 'life'],
     ['「それ、どういう意味？」と聞く', { like: { who: 'hero', v: 4 } }, '「……データ不足で、回答できません」\nミヤコはそっぽを向いた。', 'b'],
     ['「冷えるで。もう寝え」と声をかけて戻る', { like: { who: 'hero', v: -2 } }, '「……はい。おやすみなさい、先輩」', 'soccer']], 'summer');
  Bt('my_late', 'miyako', { repeat: true, max: 2, cool: 6, c: function (S) { return !tog(S) && S.soccer && ((S.form || 0) <= -2 || S.soccer.injDays > 0); } }, '誰もいないグラウンド', '🌙',
    '結果が出なくて、日が暮れても一人でシュートを打っていた。\nボールを拾いに行くと、ゴール裏にミヤコが立っていた。\n「……先輩。今日の決定率、改善しています。あと17本で、いつもの数字に戻ります」',
    [['「じゃあ、あと17本付き合って」', { like: { who: 'hero', v: 8 }, sk: { sht: 1 }, form: 2 }, '17本目がネットを揺らすと、ミヤコは小さく拍手した。\n「……データ通りです」', 'soccer'],
     ['「もう帰り。遅いし」', { like: { who: 'hero', v: 2 } }, '「……先輩が帰るなら、帰ります」\nミヤコは最後まで、帰らなかった。', 'b']], 'school');
  Bt('my_seen', 'miyako', { repeat: true, max: 2, cool: 4, pri: 3, c: function (S) { return !!gf(S) && like(S) >= 30 && !tog(S); } }, '……どういったご関係ですか', '🖤',
    function (S) { return '{pname}が、差し入れを持って会いに来た。\n少し離れたところで、ミヤコがノートを閉じた。\n「……先輩。今の方とは、どういったご関係ですか」' + (stg(S) >= 2 ? '\nいつもより、声が平らだった。' : ''); },
    [['「彼女やで」と正直に言う', function (S) { return { like: { who: 'hero', v: stg(S) >= 2 ? -3 : 1 } }; }, function (S) { return '「……了解、しました」\nミヤコは深く頭を下げた。' + (stg(S) >= 2 ? '\n\n' + V('その日のノートは、白紙のままだった。\n最後のページにだけ、小さく書いてあった。\n「先輩の自由です。……ですが」\n続きは、消しゴムで消されていた。') : '\n「報告、ありがとうございます。……記録しておきます」'); }, 'b'],
     ['「ただの友達や」とごまかす', { like: { who: 'hero', v: 1 } }, '「……そうですか」\nミヤコは何も書かなかった。たぶん、全部わかっている。', 'b'],
     ['「ミヤコも一緒に食べる？」と誘う', { like: { who: 'hero', v: 4 } }, function (S) { var p = gf(S); if (p) KL.likeAdd(p, -4); return '「……では、少しだけ」\nミヤコは{pname}の差し入れを、一口だけ食べた。\n「……おいしいです。……おいしい、です」\n{pname}は、少し複雑な顔をしていた。'; }, 'life']], 'dark');
  // 卒業（主人公の卒業の日）
  Bt('my_grad', 'miyako', { imp: 2, pri: 2, c: function (S) { return !tog(S) && KL.isB(S) && ((S.stage === 'hs' && age(S) >= 17) || (S.stage === 'univ' && age(S) >= 21)) && S.hero.metAge <= age(S) - 1 && !/スタッフ|職場/.test(S.hero.how || ''); } }, '卒業の日', '🌸',
    function (S) {
      var l = like(S);
      if (l >= 70 && gf(S)) return '卒業式のあと。部室の前で、ミヤコが待っていた。\n「……先輩。卒業、おめでとうございます」\n「分析の結果を、報告するつもりでした。ですが、{pname}さんがいらっしゃるので」\n「……報告は、保留にします。……保留、です」\nミヤコはノートをぎゅっと握りしめていた。';
      if (l >= 70) return '卒業式のあと。部室の前で、ミヤコが待っていた。\n\n「……先輩。卒業、おめでとうございます」\n「分析の結果を報告します。……私は、先輩のことが好きです。誤差は、ありません」\n\nミヤコはノートをぎゅっと握りしめていた。';
      return '卒業式のあと。ミヤコが頭を下げた。\n「先輩、お疲れさまでした。……データは、引き継いでおきます」\n' + (l >= 50 ? '顔を上げたミヤコは、何か言いたそうだった。' : 'それだけ言って、ミヤコは戻っていった。');
    },
    [[function (S) { return gf(S) ? '「保留せんでええ」（{pname}とは別れる）' : like(S) >= 70 ? '「おれも好きや。付き合ってほしい」' : '「ミヤコ。……おれ、ミヤコが好きや」'; }, {}, function (S) {
      if (like(S) >= 70) { H.date(S, '後輩からの告白'); return 'ミヤコは、しばらく固まっていた。\n「……了解、しました。……了解しました」\n二回言った。たぶん、動揺している。'; }
      if (H.tryConfess(S, 6, '後輩に告白')) return 'ミヤコはノートを落とした。\n「……先輩。それは、反則です」\n拾い上げた手が、少し震えていた。';
      return '「……すみません、先輩。今は、まだ。……データが、足りません」\nミヤコは深く頭を下げた。連絡先は、ちゃんと交換した。';
    }, 'life', function (S) { return like(S) >= 50; }],
     ['「ありがとう。これからも連絡するわ」', {}, function (S) { return '「……はい。……待っています」\nノートの最後のページは、白紙のままだった。'; }, 'soccer'],
     ['（はっきり断る）「ごめん。ミヤコは、大事な後輩や」', {}, function (S) { return H.decline(S) ? '「……了解しました」\nミヤコは、聞いたことがないほど静かな声で言った。\nそれきり、ノートが届くことはなかった。' : '「……了解しました。……分析を、続けます」\nミヤコは、少しだけ笑った。強がりだった。'; }, 'x', function (S) { return like(S) >= 70; }]], 'school');
  Bt('my_v', 'miyako', { view: true, repeat: true, max: 5, cool: 3, c: function (S) { return !tog(S) && stg(S) >= 1; } }, '観察記録', '📓',
    [V('ミヤコの観察記録・今日の欄。\n「先輩が笑った回数：3。うち、私に向けられたもの：1」\nその「1」に、ミヤコは小さく丸をつけた。'),
     V('夜。ミヤコは、うさぎの動画を三本見てから、ノートを開いた。\n「先輩・観察記録」の、新しいページ。\n一行目に「好き」と書いて、すぐに消した。\n消しゴムの跡だけが、ページに残った。'),
     V('「ミヤコってさ、好きな人いるの？」\n友達に聞かれて、ミヤコは即答した。\n「いません。分析対象なら、います」\n「それ、好きな人って言うんだよ」\n……ミヤコは、しばらく返事ができなかった。')]);
  Bt('my_v_gf', 'miyako', { view: true, repeat: true, max: 3, cool: 3, c: function (S) { return !!gf(S) && stg(S) >= 2 && !tog(S); } }, '白紙のページ', '📓',
    [V('ミヤコは、{pname}という名前をノートに書きかけて、やめた。\n「……先輩の自由です」\n声に出して言うと、少しだけ楽になる気がした。ならなかった。'),
     V('うさぎカフェの隅の席。ミヤコは、膝の上のうさぎに話しかけていた。\n「……あなたは、寂しくても平気ですか」\n「……私は、ウサギではないので。……平気では、ありません」')]);
  Bt('my_date', 'miyako', { c: function (S) { return H.dating(S); } }, 'はじめてのデート', '🐇',
    '初めてのデート。待ち合わせ場所に、私服のミヤコがいた。\n「……15分前到着です。先輩は8分前。合格です」\n行き先は、ミヤコが決めた「うさぎカフェ」だった。',
    [['うさぎと戯れるミヤコを眺める', { like: { who: 'hero', v: 10 }, men: 2 }, 'うさぎを膝にのせたミヤコは、見たことのない顔で笑っていた。\n「……先輩、写真を撮るのは禁止です。……一枚だけなら、許可します」', 'life'],
     ['自分もうさぎに夢中になる', { like: { who: 'hero', v: 7 } }, '「……先輩、うさぎに好かれていますね。データにない結果です」\nミヤコが少しむくれていた。うさぎに嫉妬していた。', 'b']], 'base');
  Bt('my_staff', 'miyako', { c: function (S) { return tog(S) && age(S) >= 20 && pro(S) && !/スタッフ/.test(S.hero.how || ''); } }, 'ミヤコの進路', '💼',
    function (S) { return 'ミヤコはスポーツデータを学び、プロのクラブから分析スタッフの誘いを受けていた。\n「……先輩。{club}の分析部門にも、応募できます」\n「ですが、私情が入ると判断されるかもしれません」'; },
    [['「来てほしい。ミヤコの分析が一番信頼できる」', { like: { who: 'hero', v: 10 }, form: 2 }, function (S) { var n = H.npc(S); if (n) n.job = 'クラブの分析スタッフ'; return 'ミヤコは採用された。\n初日のミーティングで、ミヤコは誰よりも厳しく、自分のプレーを分析した。\n「……私情は、入れていません。入れていませんから」'; }, 'soccer'],
     ['「ミヤコのやりたいとこに行き」', { like: { who: 'hero', v: 6 } }, function (S) { var n = H.npc(S); if (n) n.job = 'Jクラブの分析スタッフ'; return '「……了解しました。では、敵として分析します。覚悟してください、先輩」'; }, 'life']], 'base');
  Bt('my_jealous', 'miyako', { repeat: true, max: 3, cool: 6, c: function (S) { return tog(S) && KL.mote(S) >= 55; } }, '……どういったご関係ですか', '🖤',
    function (S) { return (pro(S) ? '番組の収録で、女子アナと楽しそうに話している写真がネットに出回った。' : '他の女子に差し入れをもらった。') + '\n\n' + H.react(S, 'jealous'); },
    [['「ミヤコが一番やから」とまっすぐ言う', { like: { who: 'hero', v: 9 } }, '「……データとして、記録しておきます」\nミヤコはノートに何か書いて、それをこっそり見せてくれた。\n「先輩：言動に誤差なし」', 'life'],
     ['「仕事やから仕方ないやろ」', { like: { who: 'hero', v: -9 } }, '「……了解しました」\nその日の夜、ミヤコからの連絡は一言だけだった。', 'soccer']], 'dark');
  Bt('my_abroad', 'miyako', { c: function (S) { return tog(S) && abroad(S) && !S.hero.f.withMe; } }, '海外移籍', '✈️',
    function (S) { return '{club}への移籍が決まった夜。ミヤコは長いこと黙っていた。\n「……ウサギは、住む場所が変わると、しばらく食事をしなくなるそうです」\n「……先輩は、大丈夫ですか」'; },
    [['「ミヤコが一緒なら大丈夫」', { like: { who: 'hero', v: 12 } }, function (S) { var n = H.npc(S); if (n) { n.city = KL.ph(S, 'city'); n.job = '現地クラブのデータアナリスト'; } S.hero.f.withMe = true; return '「……了解しました。ついていきます」\n三日後、ミヤコは語学の教材を山ほど買ってきた。'; }, 'life'],
     ['「待っててくれるか」', { like: { who: 'hero', v: 2 } }, '「……ウサギは、待つのが得意ではありません」\n「でも、私はウサギではないので。……待ちます」', 'soccer']], 'closed');
  Bt('my_propose', 'miyako', { imp: 2, pri: 2, c: function (S) { return H.dating(S) && age(S) >= 21 && like(S) >= 65 && S.t - (S.hero.dateT || S.t) >= 4; } }, '夜景のレストラン', '💍',
    '大人になったミヤコは、ネイビーのドレスで現れた。\n夜景の見えるレストラン。ミヤコはずっと、指先で髪をいじっている。\n「……先輩。今日、なにか隠していますね。データで分かります」',
    [['「ミヤコ。結婚してください」', {}, function (S) { H.marry(S); return 'ミヤコは、指輪の箱を見つめたまま動かなかった。\n「……分析、できません。……想定外、です」\n頬を涙が伝った。\n「……了解しました。……喜んで、{mei}さん」\n\n初めて、名前で呼ばれた。'; }, 'life'],
     ['まだ言えなかった', { like: { who: 'hero', v: -6 } }, '「……そうですか。データは、保存しておきます」\nミヤコは少しだけ寂しそうに笑った。', 'soccer']], 'adult');
  Bt('my_wed', 'miyako', { imp: 2, pri: 1, c: function (S) { return H.married(S); } }, '結婚式', '💒',
    '結婚式の日。白いドレスのミヤコは、誓いの言葉の前に深呼吸をした。\n「……ウサギは、生涯ひとりのパートナーと添い遂げることも多いそうです」\n「私は、ウサギではありませんが。……そうします」',
    [['「おれもや」', { like: { who: 'hero', v: 10 }, men: 3 }, '式のあと、ミヤコは新しいノートを買っていた。表紙には「{mei}さん・観察記録（第2部）」。\n\n' + V('その夜、ミヤコは古いノートの一冊目を開いた。\n「観察記録 No.1　手をふられた。（心拍数：測定不能）」\n「……今も、測定不能です」'), 'life']], 'adult');
  Bt('my_life', 'miyako', { repeat: true, max: 4, cool: 6, c: function (S) { return H.married(S); } }, 'ミヤコのいる毎日', '🏠',
    ['「{mei}さん、今週の睡眠時間が規定値を下回っています。今夜は22時就寝です。異論は認めません」', 'ミヤコがうさぎを飼い始めた。名前は「先輩」。……紛らわしい。', '夜、ソファで隣に座ったミヤコが、小さな声で言った。「……今日は、甘える日です。データ上の根拠は、ありません」', 'ミヤコが資料を作ってくれた。最後のページに、小さく「いつも見ています」。'],
    [['一緒に過ごす', { like: { who: 'hero', v: 6 }, men: 2, care: 2 }, ['今日も、ミヤコの管理のおかげで体が軽い。', 'ミヤコは満足そうにノートを閉じた。', 'うさぎの「先輩」が、二人の間で丸くなって寝た。'], 'life']], 'base');
  Bt('my_kid', 'miyako', { c: function (S) { return H.married(S) && S.kids.length >= 1; } }, '新しい観察記録', '👶',
    '子どもが生まれた。\nミヤコは、新しいノートを三冊買ってきた。表紙には「観察記録・第3部」。\n「……{mei}さん。この子の最初の一歩は、私が記録します。譲りません」',
    [['「じゃあ、最初の言葉はおれが」', { like: { who: 'hero', v: 8 } }, '「……データ上、最初の言葉は『ママ』である確率が高いです」\nミヤコは、ほんの少し得意げだった。', 'life']], 'base');
  Bt('my_retire', 'miyako', { c: function (S) { return tog(S) && S.soccer && S.soccer.retired && S.soccer.proYears; } }, '最後の分析', '🌅',
    '引退した日の夜。ミヤコが、一冊の分厚いファイルを差し出した。\n「先輩・観察記録　完結編」\n最後のページには、こう書いてあった。\n「総評：誤差なし。私の人生で、いちばん美しいデータでした」',
    [['「ありがとう、ミヤコ」', { like: { who: 'hero', v: 10 }, men: 4 }, '「……{mei}さん。これからは、記録じゃなくて、思い出にします」\nミヤコは、ファイルを本棚の一番いい場所に置いた。', 'life']], 'base');

  // ======================================================
  //  小鳥遊 ホシノ（先輩・1つ上・うへ〜・のんびり→本気）
  // ======================================================
  Bt('ho_p1', 'hoshino', { pre: true, c: function (S) { return age(S) >= 7 && age(S) <= 10; } }, '飛んできた帽子', '👒',
    '公園。ベンチで寝ているピンクの髪の女の子の帽子が、風で飛んできた。',
    [['拾って、そっと顔にかけてあげる', {}, function (S) { pre(S, 5, '公園のベンチで寝ていた、ピンクの髪の女の子'); return '女の子は、寝たまま「ん〜」と言った。\n\n' + V('帽子の下で、女の子は片目を開けた。\n「うへ〜……' + (S.hero.kinder ? 'あのときの迷子くんだ〜' : 'やさしいねぇ〜') + '。……大きくなったねぇ〜」\n走っていく背中を、女の子はしばらく見ていた。'); }, 'life'],
     ['ベンチの横に置いておく', {}, function (S) { pre(S, 2, '公園のベンチで寝ていた、ピンクの髪の女の子'); return '帽子をベンチに置いて、友達のところに戻った。\n\n' + V('「……うへ〜。気づいてないなぁ〜」\n女の子は、帽子をかぶり直して、また目を閉じた。'); }, 'b']]);
  Bt('ho_p2', 'hoshino', { pre: true, c: function (S) { return S.stage === 'jhs' && age(S) >= 12 && age(S) <= 14; } }, '廊下の先輩', '🌸',
    '廊下で、ピンクの髪の先輩とすれ違った。\n眠そうな目のまま、小さく手を振られた気がした。',
    [['会釈する', {}, function (S) { pre(S, 4, '中学の廊下で手を振ってきた、ピンクの髪の先輩'); return '先輩は、あくびをしながら去っていった。\n\n' + V('「……うへ〜、会釈されちゃった〜」\n屋上へ続く階段で、先輩は少しだけ足を止めた。\n「……覚えてないよねぇ〜。……まぁ、いっか〜。適当に、適当に〜」'); }, 'life'],
     ['気のせいだと思う', {}, function (S) { pre(S, 1, '中学の廊下で手を振ってきた、ピンクの髪の先輩'); return '\n' + V('「……ちぇ〜」\n先輩は、振った手をポケットにしまった。'); }, 'b']]);
  Bt('ho_p3', 'hoshino', { pre: true, view: true, c: function (S) { return !!gf(S) && age(S) >= 12 && age(S) <= 15; }, after: function (S) { pre(S, 3, '彼女と話していると、上の階から聞こえたあくび'); } }, '屋上のあくび', '☁️',
    function (S) { return '{pname}と廊下で話していると、上の階から、大きなあくびの声が聞こえた。\n\n' + V('屋上のベンチ。ピンクの髪の先輩は、寝転がって空を見ていた。\n「うへ〜、彼女できたんだ〜。……ふ〜ん」\n「……ふ〜〜ん」\n今日は、なかなか眠れなかった。'); });
  Bt('ho_meet', 'hoshino', { meet: true, how: '高校の先輩', imp: 2, pri: 1, c: function (S) { return S.stage === 'hs' && age(S) >= 15 && age(S) <= 16; } }, '屋上の先輩', '🌸',
    '昼休み、静かな場所を探して屋上に出た。\nベンチに、ピンクの髪の小柄な先輩が寝転がっていた。\n\n「うへ〜……新入生くん？ ここ、おじさんの昼寝場所なんだけどな〜」\n\n先輩は片目だけ開けて、こっちを見た。左右で色の違う目だった。\n「……まぁいっか〜。適当に、適当に〜。隣、空いてるよ〜」',
    [['隣に座って、一緒にぼーっとする', { like: { who: 'hero', v: 6 }, men: 1 }, '「うへ〜、わかってるねぇ〜、新入生くん」\n小鳥遊ホシノ、2年生。それから昼休みは、ときどきここで過ごすようになった。', 'life'],
     ['「おじさんって……先輩、女の子ですよね？」', { like: { who: 'hero', v: 4 }, com: 1 }, '「うへへ〜、細かいことはいいんだよ〜」\n先輩はまた目を閉じた。口元が笑っていた。', 'b'],
     ['邪魔しないように戻る', { like: { who: 'hero', v: 1 } }, '「あれ〜、行っちゃうの〜？」\n振り返ると、先輩はもう寝ていた。', 'soccer']], 'school');
  Bt('ho_meet_univ', 'hoshino', { meet: true, how: '大学の先輩', imp: 2, pri: 1, c: function (S) { return S.stage === 'univ' && age(S) >= 18 && age(S) <= 21; } }, '中庭の先輩', '🌸',
    '大学の中庭。芝生で、ピンクの髪の人が寝転がっていた。\n「うへ〜……。……あれ〜？ きみ、同じ高校だったよね〜？」\n「おじさん、一個上の小鳥遊ホシノ〜。……覚えてないかぁ〜。だよね〜」',
    [['隣に寝転がる', { like: { who: 'hero', v: 6 } }, '「うへ〜、わかってるねぇ〜」\n空が、やけに高かった。', 'life'],
     ['「覚えてます」と嘘をつく', { like: { who: 'hero', v: 3 }, com: 1 }, '「うへ〜、嘘が下手だねぇ〜。……でも、ありがと〜」', 'b']], 'school');
  Bt('ho_meet_city', 'hoshino', { meet: true, how: '昔の高校の先輩', imp: 2, pri: 1, c: function (S) { return !stu(S) && age(S) >= 18 && age(S) <= 30; } }, '公園のベンチ', '☁️',
    function (S) { return (abroad(S) ? '{city}の公園。ベンチで、ピンクの髪の日本人が昼寝していた。\n「……うへ〜。日本語が聞こえたと思ったら〜」' : (pro(S) ? 'スタジアムの近くの公園。' : '会社の近くの公園。') + 'ベンチで、ピンクの髪の人が昼寝していた。\n「……うへ〜？」') + '\n片目だけ開けて、その人は笑った。\n「きみ、同じ高校だったよね〜？ おじさん、一個上の小鳥遊ホシノ〜」\n' + (pro(S) ? '「試合、ときどき見てるよ〜。……ときどきね〜」' : '「こんなとこで会うとはねぇ〜」'); },
    [['隣に座る', { like: { who: 'hero', v: 6 } }, '「うへ〜、昼寝の邪魔はしないでね〜」\nそう言いながら、ホシノは少しだけ端に寄った。', 'life'],
     ['軽く挨拶して行く', { like: { who: 'hero', v: 2 } }, '「うへ〜、またね〜」\n振り返ると、もう寝ていた。', 'b']], 'spring');
  Bt('ho_spring', 'hoshino', { c: function (S) { return true; } }, '休日の先輩', '🌸',
    '休日。駅前で私服のホシノ先輩とばったり会った。\n「うへっ！？ な、なんでここに〜！？」\nいつも眠そうな先輩が、めずらしく慌てている。手には、スポーツ用品店の袋。',
    [['「何買ったんですか？」と聞く', { like: { who: 'hero', v: 7 } }, '「……べ、別に〜？ きみが使ってるスパイクと同じやつとか、見てないよ〜？」\n袋の中身は、テーピングと、サッカーの雑誌だった。', 'life'],
     ['「先輩の私服、新鮮ですね」', { like: { who: 'hero', v: 8 }, com: 1 }, '「うへ〜……そういうこと、さらっと言うんだ〜……」\n先輩は帽子を目深にかぶって、そっぽを向いた。', 'life'],
     ['軽く会釈して通り過ぎる', { like: { who: 'hero', v: -2 } }, '「……ちぇ〜」\n背中で、小さな声が聞こえた気がした。', 'soccer']], 'spring');
  Bt('ho_watch', 'hoshino', { need: ['ho_spring'], c: function (S) { return true; } }, '見てないふり', '👀',
    function (S) { return (soc(S) ? (pro(S) ? '試合' : '練習試合') : '体育祭') + 'の日。スタンドの一番上で、ホシノ先輩が寝ていた。……ように見えた。\n終わったあと、先輩がふらっと近づいてきた。\n「うへ〜、さっきの' + (soc(S) ? '右に切り返したやつ' : 'リレー') + '、よかったよ〜。……あ、いや、寝てたけどね〜？」'; },
    [['「寝てたのに見てたんですか」とツッコむ', { like: { who: 'hero', v: 8 } }, '「うへっ……。……適当に、適当に〜」\n先輩は早足で去っていった。耳が真っ赤だった。', 'life'],
     ['「次も見ててください」', { like: { who: 'hero', v: 7 }, men: 1 }, '「……しょうがないなぁ〜。おじさん、暇だからね〜」\nそれから、先輩はいつもスタンドにいた。', 'soccer']], 'school');
  Bt('ho_serious', 'hoshino', { need: ['ho_watch'], c: function (S) { return true; } }, '本気のホシノ', '🛡️',
    '帰り道。面倒な連中に絡まれて、厄介なことになりかけた。\nその時、ホシノ先輩が間に入った。\nいつもの間延びした声じゃない。低くて、静かな声だった。\n\n「――その子、うちのなんだけど。何か用？」\n\n相手は、なぜか一歩下がった。',
    [['「先輩……かっこよかったです」', { like: { who: 'hero', v: 9 } }, '先輩はすぐにいつもの顔に戻った。\n「うへ〜、おじさん疲れちゃった〜。……アイス、おごってね〜？」', 'life'],
     ['「自分でなんとかできました」と強がる', { like: { who: 'hero', v: 3 }, ego: 2 }, '「うへ〜、知ってる知ってる〜」\n先輩は頭をぽんぽんとたたいた。……全部、見抜かれている気がした。', 'b']], 'spring');
  // 彼女がいるときのホシノ（回数を重ねるほど本気がにじむ）
  Bt('ho_seen', 'hoshino', { repeat: true, max: 3, cool: 3, pri: 3, c: function (S) { return !!gf(S) && like(S) >= 30 && !tog(S); } }, '……で、あの子だれ〜？', '🖤',
    function (S) { var k = S.hero.f.hoJ || 0; return ['{pname}と歩いているところに、ホシノ先輩が通りかかった。\n「うへ〜、青春だねぇ〜。いいねいいね〜」\n先輩は、いつもの調子でひらひら手を振った。', '{pname}と一緒にいるところを、また先輩に見られた。\n「うへ〜、仲いいねぇ〜。……で、あの子だれ〜？ あ、別に深い意味はないよ〜？」\n先輩は笑っていた。いつもより、少しだけ早口だった。', '{pname}と別れたあと、屋上に行くと、先輩が待っていた。寝ていなかった。\n「……ねぇ。おじさんさ、適当に生きてるけど」\n「……今のは、ちょっとやだったかな」\n笑っていなかった。'][Math.min(2, k)]; },
    [['「彼女です」と正直に言う', {}, function (S) { var k = S.hero.f.hoJ = (S.hero.f.hoJ || 0) + 1; H.aff(S, k >= 3 ? -3 : 1); return ['「うへ〜、そっかそっか〜。お幸せに〜」\n先輩は、いつもよりちょっとだけ長く伸びをした。', '「……うん、知ってた〜」\n先輩は空を見ていた。\n\n' + V('その夜、ホシノはベッドで丸くなっていた。\n「……適当に、適当に〜」\n言い聞かせるみたいに、三回つぶやいた。'), '「……そっか」\n先輩は、それ以上何も言わなかった。\n帰り道、先輩はいつもの「うへ〜」を一度も言わなかった。'][Math.min(2, k - 1)]; }, 'b'],
     ['「先輩こそ、彼氏いないんですか」と返す', {}, function (S) { var k = S.hero.f.hoJ = (S.hero.f.hoJ || 0) + 1; H.aff(S, 3); return k >= 3 ? '「……いないよ。……いるわけないじゃん」\n先輩は、まっすぐこっちを見た。\n「……きみが、いちばんわかってるくせに」' : '「うへ〜、おじさんモテないからね〜」\n先輩は笑った。……ほんの一瞬だけ、目をそらした。'; }, 'life']], 'dark');
  Bt('ho_grad', 'hoshino', { imp: 2, pri: 2, c: function (S) { return !tog(S) && KL.isB(S) && S.stage === 'hs' && age(S) >= 16 && age(S) <= 17 && /高校/.test(S.hero.how || ''); } }, '先輩の卒業', '🌸',
    function (S) {
      var l = like(S);
      if (l >= 70 && gf(S)) return '卒業式の日。屋上のベンチに、ホシノ先輩が寝転がっていた。\n「うへ〜、最後の昼寝〜」\n隣に座ると、先輩は目を閉じたまま言った。\n「……ねぇ。おじさんね、言いたいことあったんだけど〜」\n「……{pname}ちゃんに悪いから、やめとく〜。……適当に、ね」\n声が、少しだけ震えていた。';
      if (l >= 70) return '卒業式の日。屋上のベンチに、ホシノ先輩が寝転がっていた。\n「うへ〜、最後の昼寝〜」\n\n隣に座ると、先輩は目を閉じたまま言った。\n「……ねぇ、{mei}くん。おじさんね、適当に生きてきたんだけど」\n「……{mei}くんのことだけは、適当にできなかったんだよね〜」\n\n目を開けた先輩の顔は、見たことがないほど真剣だった。';
      return '卒業式の日。ホシノ先輩は、屋上のベンチで最後の昼寝をしていた。\n「うへ〜、元気でね〜、{mei}くん」\n' + (l >= 50 ? '手をひらひら振ったあと、先輩は少しだけ、何か言いたそうな顔をした。' : 'それだけ言って、先輩は手をひらひらと振った。');
    },
    [[function (S) { return gf(S) ? '「やめんといてください」（{pname}とは別れる）' : like(S) >= 70 ? '「先輩が好きです」' : '「先輩。……好きです」と伝える'; }, {}, function (S) {
      if (like(S) >= 70) { H.date(S, '屋上で'); return '「……うへ〜。言わせちゃった〜」\n先輩は顔を隠して、ベンチの上で丸くなった。\n「……よろしくね、{mei}くん。……ほんとに、よろしくね」'; }
      if (H.tryConfess(S, 6, '先輩に告白')) return '先輩は目を丸くした。\n「……うへ〜。おじさん、そういうの弱いんだよね〜……」\n小さな手が、袖をつかんだ。';
      return '「……ごめんね〜。今は、まだかな〜」\n先輩は困ったように笑った。\n「……でも、連絡はしてね。……ほんとに」';
    }, 'life', function (S) { return like(S) >= 50; }],
     ['「卒業おめでとうございます。連絡しますね」', {}, '「うへ〜、ありがと〜。……待ってるよ〜。適当にね〜」', 'soccer'],
     ['（はっきり断る）「先輩は、先輩です」', {}, function (S) { return H.decline(S) ? '「……うへ〜。そっか〜」\n先輩は、最後まで笑っていた。\nそれきり、屋上に来ることはなかった。' : '「……うへ〜。そっか〜。……知ってた〜」\n先輩は、空を見たまま言った。'; }, 'x', function (S) { return like(S) >= 70; }]], 'spring');
  Bt('ho_v', 'hoshino', { view: true, repeat: true, max: 5, cool: 3, c: function (S) { return !tog(S) && stg(S) >= 1; } }, 'ホシノの昼寝', '☁️',
    [V('ホシノのスマホのロック画面は、クジラのぬいぐるみの写真だった。\n……そのフォルダの一番奥に、一枚だけ、違う写真がある。\n誰にも見せたことはない。'),
     V('「ホシノ〜、また寝てんの？」\n「うへ〜、寝てないよ〜。目を閉じて考えごとしてるだけ〜」\n「なに考えてんの」\n「……ん〜。……ないしょ〜」'),
     V('夜中の二時。ホシノは、録画した試合を三回目の再生で止めた。\n画面の中で、背番号の選手がこっちに走ってくる。\n「……うへ〜。……かっこいいなぁ、もう」')]);
  Bt('ho_date', 'hoshino', { c: function (S) { return H.dating(S); } }, 'のんびりデート', '☁️',
    '「うへ〜、デートって何するの〜？」\nホシノの提案は「公園で昼寝」だった。\n芝生に寝転がると、ホシノはすぐに寝息を立てた。',
    [['自分も隣で昼寝する', { like: { who: 'hero', v: 9 }, fat: -8, men: 2 }, '目を覚ますと、夕方だった。ホシノがこっちの顔をのぞきこんでいた。\n「うへへ〜、よだれ出てたよ〜」', 'life'],
     ['こっそりボールを蹴って練習する', { like: { who: 'hero', v: 2 }, sk: { dri: 1 } }, '目を覚ましたホシノが、ぼそっと言った。\n「……デート中も練習とか、まじめだねぇ〜。……そういうとこ、好きだけどさ〜」', 'soccer']], 'spring');
  Bt('ho_jealous', 'hoshino', { repeat: true, max: 3, cool: 6, c: function (S) { return tog(S) && KL.mote(S) >= 55; } }, '……で、あの子だれ？', '🖤',
    function (S) { return (pro(S) ? 'パーティーで、モデルの女性と話しているところを撮られた。' : '後輩の女の子に写真をせがまれた。') + '\n\n' + H.react(S, 'jealous'); },
    [['正直に話して、ホシノだけだと伝える', { like: { who: 'hero', v: 9 } }, '「……うん。知ってるよ〜」\nホシノはいつもの顔に戻って、腕にしがみついてきた。\n「……でも、たまにはこうやって、ちゃんと言ってほしいんだよね〜」', 'life'],
     ['「ただの知り合いやって」と軽く流す', { like: { who: 'hero', v: -10 } }, '「ふ〜ん」\n笑顔のまま、ホシノは言った。\n「……ねぇ。次はないよ？」', 'soccer']], 'dark');
  Bt('ho_abroad', 'hoshino', { c: function (S) { return tog(S) && abroad(S) && !S.hero.f.withMe; } }, '海の向こう', '✈️',
    function (S) { return '{club}への移籍が決まった。\nホシノは、話を聞きながら、ずっとクッションを抱えていた。\n「うへ〜、海外かぁ〜。……すごいねぇ〜」\n「……ねぇ。おじさん、置いてかれちゃうのかな〜」\n最後のほうは、ほとんど聞こえなかった。'; },
    [['「一緒に来てください」', { like: { who: 'hero', v: 12 } }, function (S) { var n = H.npc(S); if (n) { n.city = KL.ph(S, 'city'); n.job = 'リモートワークの会社員'; } S.hero.f.withMe = true; return '「……うへ〜」\nホシノは、クッションに顔をうずめた。\n「……そういうの、ずるいよ〜。……行くに決まってるじゃん」'; }, 'life'],
     ['「毎日連絡します」', { like: { who: 'hero', v: 3 } }, '「うへ〜、言ったね〜？ 一日でも忘れたら、おじさん飛んでくからね〜」\n冗談みたいに言ったけど、目は笑っていなかった。', 'soccer']], 'spring');
  Bt('ho_resort', 'hoshino', { c: function (S) { return tog(S) && age(S) + 1 >= 21; } }, '南の島', '🌺',
    '二人で南の島に旅行した。ハンモックに揺られながら、ホシノがこっちを見て笑っている。\n「うへ〜、ここ天国だよ〜。……ねぇ、ずっとこうしてたいなぁ〜」',
    [['「ずっと、こうしてよう」', { like: { who: 'hero', v: 10 }, men: 3, fat: -15 }, 'ホシノは目を閉じて、小さくうなずいた。\n波の音だけが聞こえる。', 'life'],
     ['「次の試合が終わったらな」', { like: { who: 'hero', v: 2 }, form: 1 }, '「うへ〜、仕事人間〜。……まぁ、そういうとこも含めて、だけどね〜」', 'soccer']], 'resort');
  Bt('ho_propose', 'hoshino', { imp: 2, pri: 2, c: function (S) { return H.dating(S) && age(S) >= 21 && like(S) >= 65 && S.t - (S.hero.dateT || S.t) >= 4; } }, '屋上の約束', '💍',
    '久しぶりに、母校の屋上に来た。\nホシノは、昔と同じベンチに寝転がった。\n「うへ〜、懐かしいねぇ〜。……ここで、{mei}くんに会ったんだよねぇ〜」',
    [['「ホシノ。結婚しよう」', {}, function (S) { H.marry(S); return 'ホシノは起き上がって、指輪とこっちの顔を何度も見比べた。\n「……うへ〜。……うへぇ……」\n声が震えていた。\n「……適当に、なんて言えないよ、こんなの。……はい。よろしくね、{mei}」'; }, 'life'],
     ['昔話だけして帰る', { like: { who: 'hero', v: -6 } }, '「……うへ〜、そっか〜」\n帰り道、ホシノはいつもより少しだけ静かだった。', 'soccer']], 'closed');
  Bt('ho_wed', 'hoshino', { imp: 2, pri: 1, c: function (S) { return H.married(S); } }, '結婚式', '💒',
    '結婚式。ドレス姿のホシノは、ずっとそわそわしていた。\n「うへ〜、おじさんにドレスとか、似合わないって〜……」\n誓いの言葉で、ホシノは一度だけ、まっすぐこっちを見た。',
    [['「世界一似合ってる」', { like: { who: 'hero', v: 10 }, men: 3 }, '「……うへ〜。……ばか」\n披露宴の最後、ホシノは泣きすぎて言葉にならなかった。\n\n' + V('その夜。ホシノのスマホのフォルダの一番奥の写真が、ロック画面になっていた。\n高校の屋上で、こっそり撮った、横顔の写真だった。'), 'life']], 'closed');
  Bt('ho_life', 'hoshino', { repeat: true, max: 4, cool: 6, c: function (S) { return H.married(S); } }, 'ホシノのいる毎日', '🏠',
    ['休日の朝。ホシノはまだ布団の中だった。「うへ〜、あと5分〜……{mei}も、おいで〜」', '「今日はおじさんがごはん作るよ〜」。出てきたのは、カップ麺に高級な卵がのったものだった。', '夜、ホシノがぽつりと言った。「……ねぇ、{mei}。おじさんね、今が一番しあわせかも〜」', '帰ると、ホシノはソファで寝ていた。テレビには、試合のリプレイが流れたままだった。'],
    [['一緒に過ごす', { like: { who: 'hero', v: 6 }, men: 2, fat: -6 }, ['何もしない一日。でも、それがいい。', 'ホシノのいびきが、意外と大きかった。', 'ホシノが「うへへ〜」と笑うと、家の中が明るくなる。'], 'life']], 'closed');
  Bt('ho_kid', 'hoshino', { c: function (S) { return H.married(S) && S.kids.length >= 1; } }, 'ちいさな寝息', '👶',
    '子どもが生まれた。\nホシノは、赤ちゃんの隣で、同じかっこうで寝ていた。\n「うへ〜……この子、おじさんに似て、昼寝が上手だねぇ〜」\n「……ねぇ、{mei}。……守るものが、増えちゃったね」',
    [['二人まとめて、毛布をかける', { like: { who: 'hero', v: 9 }, men: 2 }, '「うへへ〜……あったか〜」\nホシノは、目を閉じたまま笑った。', 'life']], 'closed');
  Bt('ho_retire', 'hoshino', { c: function (S) { return tog(S) && S.soccer && S.soccer.retired && S.soccer.proYears; } }, 'おつかれさま', '🌅',
    '引退した日の夜。ホシノは、珍しく起きて待っていた。\n「……おつかれさま、{mei}」\n「うへ〜……ずっと、かっこよかったよ。……最初に屋上で会った日から、ずっとね」',
    [['「これからは、一緒に昼寝しよう」', { like: { who: 'hero', v: 10 }, men: 4 }, '「うへ〜……それ、プロポーズより嬉しいかも〜」\nホシノは、ソファの半分を空けてくれた。', 'life']], 'closed');

  // ======================================================
  //  星見 雅（5つ上・武家の娘・古武術の師範代・簡潔・少し天然）
  // ======================================================
  Bt('mb_p1', 'miyabi', { pre: true, c: function (S) { return age(S) >= 8 && age(S) <= 11; } }, '道着のお姉さん', '🥋',
    function (S) { return '体育館の隣のグラウンドで、ひとり' + (soc(S) ? 'リフティング' : '鉄棒') + 'をしていた。\n剣道大会の休憩中らしい、道着姿の背の高いお姉さんが、腕を組んでこっちを見ていた。'; },
    [['気にせず続ける', {}, function (S) { pre(S, 5, '剣道大会の日、腕を組んでこっちを見ていた道着のお姉さん'); return '気がつくと、お姉さんはいなくなっていた。\n\n' + V('「……' + (S.hero.kinder ? 'あの夏祭りの子供か' : '良い集中だ') + '」\n道着の少女は、小さくつぶやいた。\n「……軸がぶれていない。……名前くらい、聞いておけばよかったな」'); }, 'soccer'],
     ['恥ずかしくてやめる', {}, function (S) { pre(S, 2, '剣道大会の日、腕を組んでこっちを見ていた道着のお姉さん'); return '\n' + V('「……む。止めてしまったか」\n道着の少女は、少しだけ残念そうに体育館へ戻っていった。'); }, 'b']]);
  Bt('mb_p2', 'miyabi', { pre: true, c: function (S) { return age(S) >= 12 && age(S) <= 15; } }, 'スタンドの女の人', '👁️',
    function (S) { return (soc(S) ? '試合' : '体育祭') + 'のスタンドに、背筋のやけに伸びた女の人がいた。\n誰の家族でもなさそうだった。'; },
    [['いいところを見せようと張り切る', { ath: 1 }, function (S) { pre(S, 4, 'スタンドにいた、背筋のやけに伸びた女の人'); return '\n' + V('「……軸がぶれていない。……誰に習った」\n女子大生は、メモ帳に何か書いて、そっと席を立った。\nメモには、こう書いてあった。「夏祭りの子供。成長著しい」'); }, 'soccer'],
     ['気にしない', {}, function (S) { pre(S, 2, 'スタンドにいた、背筋のやけに伸びた女の人'); return '\n' + V('「……ふむ」\n女の人は、最後まで試合を見てから帰っていった。'); }, 'b']]);
  Bt('mb_p3', 'miyabi', { pre: true, view: true, c: function (S) { return !!gf(S) && age(S) >= 14 && age(S) <= 18; }, after: function (S) { pre(S, 3, '河川敷で、立ち止まってこっちを見ていたランナー'); } }, '河川敷', '🌇',
    function (S) { return '{pname}と河川敷を歩いていると、ランニング中の女性が足を止めた気がした。\n\n' + V('土手の上で、黒髪の女性は呼吸を整えていた。\n土手の下で、見覚えのある少年が、女の子と笑っていた。\n「……浮かれているな」\n「……私には、関係のないことだ。……関係、ない」\nその日のランニングは、いつもより十キロ長かった。'); });
  // 出会い
  Bt('mb_meet', 'miyabi', { meet: true, how: 'クラブのフィジカルコーチ', imp: 2, pri: 1, c: function (S) { return pro(S) && age(S) >= 18 && age(S) <= 32; },
    after: function (S) { if (U.chance(0.5)) S.hero.hbf = { name: U.pick(KL.NAMES.sei) + ' ' + U.pick(KL.NAMES.m), kind: '縁談の相手', since: S.t, end: S.t + U.ri(3, 6) }; } }, '新しいフィジカルコーチ', '⚔️',
    '新しく招かれたフィジカルコーチは、黒髪の若い女性だった。\n武家の流れをくむ「星見家」の娘で、古武術の師範代だという。\n\n「星見雅だ。今日から体の使い方を叩き直す。――全員、並べ」\n\n凛とした声に、ベテランまで背筋を伸ばした。',
    [['「よろしくお願いします、星見さん」と頭を下げる', { like: { who: 'hero', v: 6 }, men: 1 }, '「……うむ。良い返事だ」\n練習後、雅はなぜかチームバスではなく、自分の車に乗り込もうとしていた。逆方向の。', 'b'],
     ['「若いですね」と軽口をたたく', { like: { who: 'hero', v: 2 }, ego: 1 }, '「年は関係ない。……腕立て、50回追加だ」', 'soccer']], 'work');
  Bt('mb_meet_dojo', 'miyabi', { meet: true, how: '道場の師範代', imp: 2, pri: 1, c: function (S) { return !pro(S) && age(S) >= 18 && age(S) <= 32; },
    after: function (S) { if (U.chance(0.5)) S.hero.hbf = { name: U.pick(KL.NAMES.sei) + ' ' + U.pick(KL.NAMES.m), kind: '縁談の相手', since: S.t, end: S.t + U.ri(3, 6) }; } }, '道場の師範代', '⚔️',
    '運動不足を解消しようと、近所の古武術の道場をのぞいた。\n師範代は、黒髪の若い女性だった。\n「星見雅だ。……お前、良い体をしているな。何かやっていたか」',
    [['「よろしくお願いします」と入門する', { like: { who: 'hero', v: 6 }, ath: 1 }, '「……うむ。では、まず正座からだ」\n三十分後、足の感覚がなくなった。', 'life'],
     ['見学だけして帰る', { like: { who: 'hero', v: 2 } }, '「……また来い。お前は、筋がいい」\n雅は、なぜか門の外まで見送ってくれた。', 'b']], 'work');
  Bt('mb_spar', 'miyabi', { c: function (S) { return true; } }, '手合わせ', '🗡️',
    function (S) { return (pro(S) ? '居残りでトレーニングしていると、雅に呼び止められた。\n「お前の体幹は、まだ伸びる。……少し付き合え」\n連れて行かれたのは、クラブハウスの裏にある小さな道場だった。' : '稽古のあと、雅に呼び止められた。\n「……少し、付き合え」') + '\n雅は木刀を一本、こっちに放った。'; },
    [['本気で打ち込む', { like: { who: 'hero', v: 8 }, sk: { phy: 2 }, fat: 8 }, '十本打ち込んで、十本とも流された。\n「……悪くない。体の芯がぶれていない」\n雅はほんの少しだけ口元をゆるめた。', 'soccer'],
     ['動きをよく見て、真似をする', { like: { who: 'hero', v: 7 }, sk: { iq: 1, spd: 1 } }, '「……見て盗むか。それもまた武だ」\n雅は一つひとつの所作を、ゆっくりと見せてくれた。', 'b']], 'sword');
  Bt('mb_tennen', 'miyabi', { need: ['mb_spar'], c: function (S) { return true; } }, '天然の師範代', '🍵',
    function (S) { return (pro(S) ? '遠征先のホテル。ロビーで' : '駅前で') + '、雅が地図を逆さに持って立ち尽くしていた。\n「……この街は、地図と道が逆になっているな」\n「なっていません」\n「……そうか」'; },
    [['一緒に目的地まで行く', { like: { who: 'hero', v: 9 }, com: 1 }, '目的地は、すぐ向かいのカフェだった。\n「……助かった。礼に、団子をおごろう」\n雅は真剣な顔で、三本注文した。全部自分で食べた。', 'life'],
     ['笑いをこらえきれない', { like: { who: 'hero', v: 4 } }, '「……笑うな」\n雅は少し頬を赤くして、地図をきちんと持ち直した。', 'b']], 'work');
  Bt('mb_house', 'miyabi', { need: ['mb_spar'], c: function (S) { return like(S) >= 35; } }, '星見家', '🏯',
    function (S) { return '雅に誘われて、星見家の屋敷を訪れた。長い廊下、手入れされた庭。\n雅は着物姿で、静かに茶を点てていた。\n' + (S.hero.hbf ? '「……父が、縁談を進めている。相手は、' + S.hero.hbf.name + 'という。……悪い人ではない」\n「……悪い人では、ないのだがな」' : '「……我が家は、武を重んじる。だが、父は今、私の縁談のことばかり言う」'); },
    [['「雅さんは、どうしたいんですか」', { like: { who: 'hero', v: 9 } }, '雅は茶筅の手を止めた。\n「……自分で選んだ者と、生きたい。……それだけだ」\nその目が、こっちを見ていた気がした。', 'life'],
     ['「立派なお家ですね」と話をそらす', { like: { who: 'hero', v: 1 } }, '「……そうだな」\n雅は、それ以上何も言わなかった。', 'b']], 'formal');
  Bt('mb_seen', 'miyabi', { repeat: true, max: 2, cool: 4, pri: 3, c: function (S) { return !!gf(S) && like(S) >= 30 && !tog(S); } }, '妙に厳しい稽古', '🗡️',
    function (S) { return '{pname}が' + (pro(S) ? '練習場に差し入れを持ってきた' : '道場の前まで迎えに来た') + '日。\nその日の雅の稽古は、なぜか妙に厳しかった。\n「……もう一本だ」\n「……もう一本」' + (stg(S) >= 2 ? '\n「…………もう一本」' : ''); },
    [['最後まで付き合う', { like: { who: 'hero', v: 5 }, sk: { phy: 1 }, fat: 10 }, function (S) { return '最後の一本のあと、雅は木刀を下ろした。\n「……すまない。今日は、私の心が乱れていた」\n' + (stg(S) >= 2 ? '\n' + V('その夜、雅は道場でひとり正座していた。\n「……関係のないことだ」\n「……関係、ない」\n月が、やけに明るかった。') : '「理由は聞くな」'); }, 'soccer'],
     ['「何かあったんですか」と聞く', { like: { who: 'hero', v: 3 } }, '「……何もない」\n雅は、目をそらした。\n「……何もない、ことにしておけ」', 'b']], 'dark');
  Bt('mb_v', 'miyabi', { view: true, repeat: true, max: 5, cool: 3, c: function (S) { return !tog(S) && stg(S) >= 1; } }, '雅の夜', '🌙',
    [V('夜の道場。雅は、ひとりで素振りをしていた。\n千本を超えたところで、木刀を下ろした。\n「……雑念が、消えん」\n浮かんでいるのは、いつも同じ顔だった。'),
     V('団子屋の店先。雅は、二本目の団子を持ったまま固まっていた。\n「……あいつは、みたらしとあんこ、どちらが好きなのだろう」\n店主が、三本目を差し出すタイミングを失っていた。'),
     V('「お嬢様、最近よく笑われますね」\n使用人に言われて、雅は眉をひそめた。\n「……笑っていない」\n「……笑っていない、はずだ」')]);
  Bt('mb_date', 'miyabi', { c: function (S) { return H.dating(S); } }, '雅との初デート', '🍡',
    '初めてのデート。雅は待ち合わせ時間の二時間前に来ていたらしい。\n「……早く着きすぎた。団子を六本食べた」\n行き先は、雅の希望で「刀剣の博物館」だった。',
    [['雅の解説を真剣に聞く', { like: { who: 'hero', v: 10 }, int: 1 }, '雅は展示の前で一時間しゃべり続けた。普段の三倍は話していた。\n帰り道、雅が小さく言った。\n「……退屈ではなかったか」', 'life'],
     ['途中で雅を連れ出してカフェに行く', { like: { who: 'hero', v: 6 } }, '「……そうか、普通はこういう場所に来るのか」\n雅はパフェを前に、真剣な顔で作戦を練っていた。', 'b']], 'work');
  Bt('mb_jealous', 'miyabi', { repeat: true, max: 3, cool: 6, c: function (S) { return tog(S) && KL.mote(S) >= 55; } }, '……楽しそうだったな', '🖤',
    function (S) { return (pro(S) ? 'ファンイベントで、女性ファンに抱きつかれる写真が出回った。' : '飲み会で、女性の同僚と楽しそうに話しているところを見られた。') + '\n\n' + H.react(S, 'jealous'); },
    [['「雅さんしか見てへん」とまっすぐ伝える', { like: { who: 'hero', v: 9 } }, '「……そうか」\n刀を置いた雅は、こっちの肩に額を預けた。\n「……知っている。だが、言葉は、良いものだな」', 'life'],
     ['「しゃあないやろ」', { like: { who: 'hero', v: -10 } }, '「……」\nその夜、道場から竹刀の音が朝まで響いていた。', 'soccer']], 'dark');
  Bt('mb_father', 'miyabi', { imp: 2, pri: 2, c: function (S) { return H.dating(S) && like(S) >= 60 && S.t - (S.hero.dateT || S.t) >= 3; } }, '星見家当主', '🏯',
    '星見家の当主――雅の父に呼び出された。道場の中央。\n「娘をくれと言うなら、一本取ってみせよ」\n木刀を渡された。雅が、道場の隅で正座して見ている。',
    [['正面から打ち込む', { sk: { phy: 1 } }, function (S) { if (KL.chk(S, (S.st.ath + S.st.men) / 2, 55, 8)) { H.aff(S, 10); S.hero.f.father = 1; return '一瞬の隙に、木刀が当主の胴をかすめた。\n「……ほう」\n当主は、初めて笑った。\n「雅を、頼む」'; } H.aff(S, 6); S.hero.f.father = 1; return '十本、全部はじき返された。\nそれでも最後まで立っていた。\n当主は木刀を収めて言った。\n「……折れぬ心は、見せてもらった」'; }, 'soccer'],
     ['「一本は取れません。でも、雅さんを幸せにする覚悟はあります」', { like: { who: 'hero', v: 12 } }, function (S) { S.hero.f.father = 1; return '当主はしばらく黙っていた。\n「……武人に、口で勝負を挑むか」\n「……面白い。気に入った」\n雅が、隅でそっと目元をぬぐっていた。'; }, 'life']], 'formal');
  Bt('mb_abroad', 'miyabi', { c: function (S) { return tog(S) && abroad(S) && !S.hero.f.withMe; } }, '追いかける', '✈️',
    function (S) { return '{club}への移籍が決まった。\n雅は、黙って茶をすすっていた。\n「……行け」\n「……私も、いずれ追いかける」'; },
    [['「いずれじゃなくて、今来てほしい」', { like: { who: 'hero', v: 12 } }, function (S) { var n = H.npc(S); if (n) { n.city = KL.ph(S, 'city'); n.job = '現地クラブのフィジカルコーチ'; } S.hero.f.withMe = true; return '雅は、湯のみを置いた。\n「……承知した」\n一か月後、雅は現地クラブのフィジカルコーチの職を、自力で勝ち取ってきた。'; }, 'life'],
     ['「待っててください」', { like: { who: 'hero', v: 3 } }, '「……武士は、待つのも修行のうちだ」\n空港で、雅は一度も振り返らなかった。……耳だけ、赤かった。', 'soccer']], 'work');
  Bt('mb_propose', 'miyabi', { imp: 2, pri: 2, c: function (S) { return H.dating(S) && age(S) >= 21 && like(S) >= 65 && S.hero.f.father; } }, '月の夜', '💍',
    '星見家の庭。満月の夜。\n白い装いの雅が、縁側に座っていた。\n「……今宵の月は、美しいな」',
    [['「雅さん。結婚してください」', {}, function (S) { H.marry(S); return '雅は、指輪を両手で受け取った。\n「……承知した」\n「……いや。違うな。こういう時は――」\n雅は少しだけうつむいて、言い直した。\n「……喜んで、{mei}」'; }, 'life'],
     ['月を見上げて、何も言えなかった', { like: { who: 'hero', v: -6 } }, '「……そうだな。月が、きれいだ」\n雅は、それ以上何も言わなかった。', 'soccer']], 'formal');
  Bt('mb_wed', 'miyabi', { imp: 2, pri: 1, c: function (S) { return H.married(S); } }, '祝言', '💒',
    '星見家の伝統に従った祝言。白無垢の雅は、凛として美しかった。\n三々九度の盃を交わしたあと、雅が小さく言った。\n「……緊張で、団子が喉を通らん」',
    [['「あとで一緒に食べよう」', { like: { who: 'hero', v: 10 }, men: 3 }, '式のあと、二人で縁側に座って団子を食べた。\n雅は三本食べてから、ふっと笑った。\n「……良い日だ」\n\n' + V('雅の古いメモ帳の最後のページ。\n「夏祭りの子供。成長著しい」\nその下に、新しい字で一行書き足されていた。\n「――我が夫となる」'), 'life']], 'formal');
  Bt('mb_life', 'miyabi', { repeat: true, max: 4, cool: 6, c: function (S) { return H.married(S); } }, '雅のいる毎日', '🏠',
    ['朝5時。「起きろ、{mei}。稽古の時間だ」。……休日なのに。', '雅が料理に挑戦した。「……焦げた。だが、気合いは入っている」', '夜、雅が肩に頭をのせてきた。「……少し、このままでいさせろ」', '雅が、また逆方向の電車に乗った。迎えに行くと「……この線路が悪い」と言った。'],
    [['一緒に過ごす', { like: { who: 'hero', v: 6 }, men: 2, sk: { phy: 1 } }, ['雅の稽古のおかげで、体がよく動く。', '雅は真顔で「……悪くない一日だった」と言った。最大級の褒め言葉だ。', '二人で縁側に並んで、月を見た。'], 'life']], 'base');
  Bt('mb_kid', 'miyabi', { c: function (S) { return H.married(S) && S.kids.length >= 1; } }, '星見家の跡取り', '👶',
    '子どもが生まれた。\n雅の父が、小さな木刀を持って病院に来た。\n「……気が早いです、父上」\n雅はそう言いながら、赤ちゃんの小さな手を、そっと握っていた。\n「……強く、優しく育て。お前の父のように」',
    [['「雅みたいに、まっすぐにな」', { like: { who: 'hero', v: 9 } }, '「……むう」\n雅は、照れると黙る。今日は、ずっと黙っていた。', 'life']], 'formal');
  Bt('mb_retire', 'miyabi', { c: function (S) { return tog(S) && S.soccer && S.soccer.retired && S.soccer.proYears; } }, '残心', '🌅',
    '引退の日。雅は、道場で一礼してから言った。\n「……武には『残心』という言葉がある。技を終えたあとも、心を緩めぬことだ」\n「……だが今日くらいは、緩めてよい。……よく、戦った」',
    [['雅に深く一礼する', { like: { who: 'hero', v: 10 }, men: 4 }, '顔を上げると、雅が泣いていた。\n「……見るな。……これは、汗だ」', 'life']], 'formal');

  // ======================================================
  //  ヒロイン共通の場面（文章はそれぞれの口調）
  // ======================================================
  var W = function (m) { return function (S) { var v = m[S.hero.cur]; return typeof v === 'function' ? v(S) : v; }; };
  // あっちからの告白（好き＆こっちに恋人がいない）
  Bt('c_confess', '*', { imp: 2, pri: 2, repeat: true, max: 3, cool: 3, c: function (S) { return stg(S) >= 3 && single(S) && !tog(S) && !S.hero.hbf && age(S) >= 14 && S.t - S.hero.confT >= 2; } }, W({ chisa: '……言う', miyako: '分析結果の報告', hoshino: '適当じゃない話', miyabi: '単刀直入に' }), '💌',
    W({ chisa: '夜、千咲から電話がかかってきた。何も言わない時間が、しばらく続いた。\n「……{mei}くん。……もう、待たない」\n「……好き。ずっと前から。……返事、ちょうだい」',
       miyako: function (S) { return (pro(S) ? 'ミーティングのあと' : '帰り道') + '、ミヤコに呼び止められた。\n「先輩。分析結果を報告します」\n「……私は、先輩のことが好きです。誤差は、ありません」\nミヤコの手の中で、ノートがくしゃりと曲がった。'; },
       hoshino: '夕方の公園。ベンチで寝ていたホシノが、起き上がった。\n「……ねぇ、{mei}くん。おじさんね、ずっと適当にしてたんだけど」\n「……これだけは、適当にしたくないんだよね〜」\n「……好きだよ。……ほんとに」',
       miyabi: '稽古のあと。雅は木刀を置いて、まっすぐこっちを見た。\n「{mei}。単刀直入に言う」\n「お前を好いている。……返事は、急がない」\nそれだけ言って、雅は正座したまま動かなくなった。耳まで真っ赤だった。' }),
    [['「おれも、好きや」', {}, function (S) { H.date(S, '告白されて'); return ({ chisa: '電話の向こうで、千咲が小さく息をのんだ。\n「……知ってた。……うそ。……うれしい」', miyako: 'ミヤコは、しばらく固まっていた。\n「……了解、しました。……了解しました」\n二回言った。', hoshino: '「……うへ〜。……よかったぁ〜」\nホシノは、ベンチの上で丸くなった。顔は見せてくれなかった。', miyabi: '雅は、長いこと目を閉じていた。\n「……そうか。……嬉しいものだな」' })[S.hero.cur]; }, 'life'],
     ['「少しだけ、考えさせてほしい」', {}, function (S) { H.aff(S, -3); S.hero.confT = S.t; return ({ chisa: '「……うん。待つの、得意」', miyako: '「……了解しました。回答期限は、設けません」', hoshino: '「うへ〜、いいよ〜。……でも、あんまり待たせないでね〜？」', miyabi: '「承知した。……武士に、二言はない。待つ」' })[S.hero.cur]; }, 'b'],
     ['（はっきり断る）「ごめん。そういうふうには見られへん」', {}, function (S) { var end = H.decline(S); return end ? ({ chisa: '「……そっか」\n電話は、静かに切れた。それきり、手紙は来なくなった。', miyako: '「……了解しました」\nそれきり、ノートが届くことはなかった。', hoshino: '「……うへ〜。そっかぁ〜」\nホシノは最後まで笑っていた。それきり、会うことはなかった。', miyabi: '「……そうか」\n雅は深く一礼した。それが、最後だった。' })[S.hero.cur] : ({ chisa: '「……そっか。……でも、手紙は書く。勝手に」', miyako: '「……了解しました。データは、消去しません」', hoshino: '「うへ〜……そっか〜。……でも、友達ではいてね〜？」', miyabi: '「……そうか。……稽古は、続けるぞ」' })[S.hero.cur]; }, 'x']], 'serious');
  // こっちから告白できる場面（気になる段階）
  Bt('c_chance', '*', { pri: 3, repeat: true, max: 3, cool: 3, c: function (S) { return stg(S) === 2 && single(S) && !tog(S) && !S.hero.hbf && age(S) >= 13 && S.t - S.hero.confT >= 2; } }, W({ chisa: 'ふたりきりの帰り道', miyako: '二人だけの居残り', hoshino: '夕焼けのベンチ', miyabi: '月見の縁側' }), '🌙',
    W({ chisa: '帰り道、千咲と二人になった。\n千咲は、何か言いたそうにしては、やめる。\n夕焼けで、赤いリボンが余計に赤く見えた。',
       miyako: '気づけば、残っているのはミヤコと二人だけだった。\nミヤコはノートを閉じたまま、こっちを見ている。\n「……先輩。何か、言いたいことがあるのでは」',
       hoshino: '夕焼けの公園。ホシノは珍しく起きていて、ブランコをこいでいた。\n「うへ〜……ねぇ、{mei}くん。最近、なんか言いたそうな顔してるよね〜？」',
       miyabi: '雅に誘われて、縁側で月を見た。\n「……今宵の月は、きれいだな」\n雅は、それ以上何も言わない。……待っている、気がした。' }),
    [['気持ちを伝える', {}, function (S) { if (H.tryConfess(S, 4, '告白')) return ({ chisa: '千咲は立ち止まって、うつむいた。\n「……遅い。……ばか」\n手を、ぎゅっと握られた。', miyako: '「……っ」\nミヤコはノートを落とした。\n「……先輩。それは、反則です。……了解しました」', hoshino: 'ブランコが止まった。\n「……うへ〜。……先に言われちゃった〜」\nホシノは、両手で顔を隠した。', miyabi: '「……っ」\n雅は湯のみを取り落としかけた。\n「……不意打ちは、卑怯だぞ。……承知した」' })[S.hero.cur]; return ({ chisa: '千咲は、首を横に振った。\n「……ずるい。……今は、まだ、わからない」', miyako: '「……すみません。データが、まだ足りません」\nミヤコは深く頭を下げた。', hoshino: '「……うへ〜。……ごめんね〜。今は、まだかな〜」\nホシノは、困ったように笑った。', miyabi: '「……すまない。まだ、心の準備ができていない」\n雅は、月を見上げた。' })[S.hero.cur]; }, 'life'],
     ['今日は、言わずにおく', { like: { who: 'hero', v: 2 } }, W({ chisa: '「……なんでもない」と千咲は言った。\n二人とも、同じことを言った。', miyako: '「……そうですか。……では、記録はなしです」', hoshino: '「うへ〜、そっか〜。……じゃあ、また今度ね〜」', miyabi: '「……そうか。月が、きれいだ」' }), 'b']], 'base');
  // こっちに恋人がいて、あっちが「好き」になってしまったとき
  Bt('c_yure', '*', { imp: 2, pri: 2, repeat: true, max: 2, cool: 4, c: function (S) { return stg(S) >= 3 && !!gf(S) && !S.spouseId && !S.hero.hbf && age(S) >= 13; } }, W({ chisa: '出せなかった手紙', miyako: '保留中の報告', hoshino: 'おじさんの本音', miyabi: '乱れる心' }), '💔',
    W({ chisa: '夜、ポストに封筒が入っていた。\n「{mei}くんへ」とだけ書いて、中は空っぽだった。\n次の朝、千咲は目を合わせなかった。\n「……間違えて入れた。……忘れて」',
       miyako: '帰り際、ミヤコに呼び止められた。\n「先輩。……{pname}さんとは、順調ですか」\n「……すみません。私には関係のない質問でした」\n「……関係、ないです。……ないはず、なんです」\nミヤコの声が、少しだけ揺れた。',
       hoshino: '屋上で、ホシノが寝転がっていた。目は開いていた。\n「……ねぇ、{mei}くん。{pname}ちゃんと、うまくいってる〜？」\n「……そっか〜。……よかったね〜」\n「……おじさんさ、きみが幸せならいいって、思ってたんだけどね〜」\n「……思えなくなってきちゃった」',
       miyabi: '稽古の途中で、雅の木刀が止まった。\n「……すまない。今日は、ここまでだ」\n「……{pname}殿と、うまくいっているのか」\n「……いや、いい。聞くべきではなかった。……私は、どうかしている」' }),
    [['{pname}と別れて、気持ちを伝える', {}, function (S) { H.date(S, '想いが通じて'); return ({ chisa: '千咲の家の前で待った。\nドアが開いて、千咲が立ち尽くした。\n「……ばか。……手紙、ほんとは中身、あった。……書けなかっただけ」', miyako: '「……先輩。それは、非合理的な判断です」\nミヤコは泣いていた。\n「……でも、私が一番、望んでいたデータです」', hoshino: '「……うへ〜。……そういうの、ずるいって言ったじゃん〜」\nホシノは、袖で顔をごしごしこすった。\n「……もう、適当にしないから」', miyabi: '雅は、木刀を置いた。\n「……後悔は、させん」\n凛とした声が、震えていた。' })[S.hero.cur]; }, 'life'],
     ['気づかないふりをする', { like: { who: 'hero', v: -3 } }, W({ chisa: '千咲は、それ以上何も言わなかった。\n' + V('その夜。千咲は、空っぽの封筒をもう一枚、引き出しにしまった。'), miyako: '「……失礼しました、先輩」\n' + V('ノートの最後のページに、小さく書いた。「保留。……保留、です」'), hoshino: '「……うへ〜、なんでもないよ〜。適当に、適当に〜」\nホシノは、また目を閉じた。まぶたが、少しだけ震えていた。', miyabi: '「……忘れろ。今のは、稽古の続きだ」\n' + V('その夜、道場の灯りは朝まで消えなかった。') }), 'b'],
     ['（はっきり断る）「{pname}が大事なんや」', {}, function (S) { var end = H.decline(S); return end ? ({ chisa: '「……知ってた」\n千咲は、ほんの少しだけ笑った。\nそれから隣の家に、千咲の姿を見ることはなくなった。', miyako: '「……了解しました。……先輩の、自由です」\nそれきり、ミヤコからの連絡は来なくなった。', hoshino: '「……うへ〜。……うん、知ってる〜」\nそれきり、屋上でホシノを見ることはなかった。', miyabi: '「……それでいい。それが、正しい」\n雅は深く一礼した。それが、最後だった。' })[S.hero.cur] : ({ chisa: '「……そっか。……うん。……そうだよね」\n千咲は、ドアを静かに閉めた。', miyako: '「……了解しました。……失礼しました」\nミヤコは、ノートを抱えて走っていった。', hoshino: '「……うへ〜、そっかぁ〜。……ごめんね、変なこと言って〜」', miyabi: '「……すまなかった。忘れてくれ」' })[S.hero.cur]; }, 'x']], 'dark');
  // 恋人が、ヒロインに嫉妬する
  Bt('c_gfjeal', '*', { repeat: true, max: 2, cool: 6, pri: 4, c: function (S) { return !!gf(S) && stg(S) >= 2 && age(S) >= 13 && age(S) <= 40; } }, '{pname}のやきもち', '😤',
    function (S) { var hn = H.D[S.hero.cur].mei; return '{pname}が、急に聞いてきた。\n「……ねえ。' + hn + 'さんと、仲いいよね」\n「' + ({ chisa: '幼なじみなんだっけ。……手紙とか、もらってるの？', miyako: 'あの子、いつもこっちのこと見てるよね。ノート持って', hoshino: 'あの先輩、いつもあなたのこと見てるよね。寝たふりして', miyabi: 'あの人、あなたにだけ稽古厳しいよね。……なんで？' })[S.hero.cur] + '」'; },
    [['「ただの' + '昔からの知り合いやって」と安心させる', {}, function (S) { var p = gf(S); if (p) KL.likeAdd(p, KL.chk(S, 'com', 45, 8) ? 5 : -3); return '「……ふーん。ならいいけど」\n{pname}は、まだ少しだけ疑っている顔をしていた。'; }, 'b'],
     ['「……なんでやろな」と言葉に詰まる', {}, function (S) { var p = gf(S); if (p) KL.likeAdd(p, -8); H.aff(S, 2); return '{pname}は、しばらくこっちの顔を見ていた。\n「……そういうとこ、正直だよね」\nその日の帰り道は、ずっと静かだった。'; }, 'life']], 'dark');
  // あっちに彼氏ができる（好感度が育たないまま、大学生になったころ）
  Bt('c_hbf_start', '*', { pri: 3, c: function (S) { var h = S.hero; return h.hbfPend && !h.hbf && !tog(S); }, after: function (S) { var h = S.hero; h.hbfPend = false; h.hbf = { name: U.pick(KL.NAMES.sei) + ' ' + U.pick(KL.NAMES.m), kind: '彼氏', since: S.t, end: S.t + U.ri(3, 5) }; } }, '……報告', '📱',
    W({ chisa: '千咲から、短いメッセージが届いた。\n「……彼氏、できた。大学の、同じゼミの人」\n「……別に、報告しなくてもよかったけど。……一応」\n既読をつけてから、しばらくスマホを見つめていた。',
       miyako: 'ミヤコから、メッセージが届いた。\n「先輩。ご報告です。お付き合いしている方ができました」\n「……悪い方ではありません。データ上は、問題ありません」\n「……データ上は」',
       hoshino: 'ホシノから、ゆるい絵文字つきのメッセージが届いた。\n「うへ〜、おじさん、彼氏できちゃった〜（笑）」\n「サークルの人〜。まぁ、適当にね〜」\n……絵文字が、いつもより一つ少なかった。',
       miyabi: '雅から、一行だけのメッセージが届いた。\n「縁談を、受けることにした。……報告まで」' }),
    [['「おめでとう」と返す', {}, function (S) { return ({ chisa: '「……ありがとう」\nそれだけ返ってきた。', miyako: '「……ありがとうございます、先輩」\n少し間があって、もう一通。「……先輩は、何も思いませんか」', hoshino: '「うへ〜、ありがと〜」\n……そのあと、何も来なかった。', miyabi: '「……うむ」\nそれだけだった。' })[S.hero.cur]; }, 'b'],
     ['「……どんな人？」と聞く', { like: { who: 'hero', v: 3 } }, function (S) { return ({ chisa: '「……やさしい人。……たぶん」\n「……{mei}くんとは、ぜんぜん違う」', miyako: '「……真面目な方です。ただ、先輩のようなスプリントはしません」\n「……すみません。比較する意味は、ありませんでした」', hoshino: '「うへ〜、ふつうの人だよ〜。……ふつうに、いい人〜」\n「……ふつうに、ね」', miyabi: '「……良き家の者だ。父が喜んでいる」\n「……父が、な」' })[S.hero.cur]; }, 'life']], 'base');
  Bt('c_hbf_seen', '*', { repeat: true, max: 2, cool: 3, pri: 4, c: function (S) { return !!S.hero.hbf; } }, 'となりの誰か', '😶',
    W({ chisa: '駅前で、千咲を見かけた。隣に、背の高い男の人がいた。\n男の人は楽しそうに話していた。千咲は、ずっとリボンの端をいじっていた。\n目が合った。千咲は、すぐにそらした。',
       miyako: 'カフェで、ミヤコと{hbf}が向かい合っていた。\n{hbf}が何か話している。ミヤコはノートを開いて、何も書いていなかった。\nこっちに気づくと、ミヤコは小さく会釈した。',
       hoshino: '公園で、ホシノと{hbf}を見かけた。\n{hbf}は芝生に座っていた。ホシノは、ベンチで一人、寝ていた。\nこっちに気づくと、ホシノは片目を開けて、少しだけ手を振った。',
       miyabi: '料亭の前で、着物姿の雅と{hbf}を見かけた。\n{hbf}は楽しそうに話している。雅は、相づちを打っていた。……一度も、笑っていなかった。' }),
    [['声をかける', { like: { who: 'hero', v: 3 } }, W({ chisa: '「……{mei}くん」\n千咲は、小さく名前を呼んだ。それから、{hbf}のほうを見ずに言った。\n「……今度、手紙書く」', miyako: '「先輩。……偶然、ですね」\n「……偶然にしては、先輩を見つけるのが、私は早すぎます」', hoshino: '「うへ〜、{mei}くんだ〜」\nホシノは、なぜか少しだけ嬉しそうだった。', miyabi: '「……{mei}か」\n雅の表情が、少しだけゆるんだ。{hbf}が、それを不思議そうに見ていた。' }), 'life'],
     ['見なかったことにする', { men: 1 }, W({ chisa: '背中に、視線を感じた気がした。', miyako: '' + V('「……先輩、気づいていましたね」\nミヤコは、何も書いていないノートのページを、一枚めくった。'), hoshino: '' + V('「……うへ〜。行っちゃった〜」\nホシノは、また目を閉じた。'), miyabi: '' + V('「……あの者は、行ってしまったか」\n雅は、自分でも驚くほど、目で追っていた。') }), 'b']], 'base');
  Bt('c_hbf_v', '*', { view: true, repeat: true, max: 2, cool: 4, c: function (S) { return !!S.hero.hbf; } }, 'あまり、好きじゃない', '🌧️',
    W({ chisa: V('{hbf}からの「おやすみ」に、千咲は「おやすみ」と返した。\nそれから、別の人とのトーク画面を開いて、何も打たずに閉じた。\n「……ずるいのは、わたしだ」'),
       miyako: V('ミヤコは、{hbf}についての記録をつけていなかった。\n分析対象ではない、と思った。\n……では、何だろう。ノートは、白いままだった。'),
       hoshino: V('「ホシノってさ、俺のこと好き？」\n{hbf}に聞かれて、ホシノは「うへ〜、好きだよ〜」と答えた。\n帰り道、ホシノは自分の言葉を思い出して、少しだけ胸が痛くなった。\n……適当に、言っちゃった。'),
       miyabi: V('「雅さんは、何が好きなんですか」\n{hbf}に聞かれて、雅は少し考えた。\n「……団子と、刀と――」\n三つ目を言いかけて、雅は口をつぐんだ。') }));
  Bt('c_hbf_end', '*', { pri: 3, c: function (S) { var h = S.hero; return !!h.hbf && S.t >= h.hbf.end && like(S) < 70; }, after: function (S) { var h = S.hero; h.hbf = null; h.hbfDone = true; } }, '……終わった', '🍂',
    W({ chisa: '千咲から、メッセージが届いた。\n「……別れた。……向こうから。『千咲は、ほかの誰かを見てる』って言われた」\n「……当たってた」',
       miyako: 'ミヤコから、メッセージが届いた。\n「先輩。ご報告です。お別れしました」\n「理由は、分析中です。……嘘です。わかっています」',
       hoshino: 'ホシノから、短いメッセージが届いた。\n「うへ〜、振られちゃった〜（笑）」\n「……『いつも上の空』だって〜。……バレてたかぁ〜」',
       miyabi: '雅から、一行だけのメッセージが届いた。\n「縁談は、白紙に戻した。父には、叱られた」\n少しして、もう一行。\n「……後悔は、していない」' }),
    [['「大丈夫？」と電話する', { like: { who: 'hero', v: 7 } }, W({ chisa: '電話の向こうで、千咲はしばらく黙っていた。\n「……{mei}くんの声、聞いたら、平気になった」', miyako: '「……大丈夫です。……先輩の声を聞いたので、もう大丈夫です」', hoshino: '「うへ〜、大丈夫大丈夫〜。……でも、電話くれたのは、うれしいかな〜」', miyabi: '「……問題ない。……だが、声が聞けたのは、良かった」' }), 'life'],
     ['「そっか」と短く返す', { like: { who: 'hero', v: 1 } }, '既読が、すぐについた。', 'b']], 'base');
  Bt('c_hbf_break', '*', { imp: 2, pri: 2, c: function (S) { return !!S.hero.hbf && like(S) >= 70; }, after: function (S) { var h = S.hero; h.hbf = null; h.hbfDone = true; } }, W({ chisa: '……別れてきた', miyako: '……合理的では、ありません', hoshino: '適当にできなかった', miyabi: '白紙に' }), '💥',
    W({ chisa: '夜遅く、玄関のチャイムが鳴った。千咲が立っていた。息が切れていた。\n「……{hbf}さんと、別れてきた」\n「……{mei}くんのせい。……ぜんぶ、{mei}くんのせい」',
       miyako: '夜、ミヤコから電話がかかってきた。\n「先輩。……お付き合いしていた方と、お別れしました」\n「理由は、明確です。……先輩のデータしか、取りたくなかったからです」\n「……合理的では、ありません。わかっています」',
       hoshino: '夜中、ホシノから電話がかかってきた。\n「うへ〜……ねぇ、{mei}くん。おじさん、別れちゃった〜」\n「……だってさ〜。……きみのこと、適当にできなかったんだもん」',
       miyabi: '雅が、道場の前で待っていた。着物ではなく、稽古着だった。\n「……縁談は、断った。父と、三時間口論した」\n「……私は、自分で選んだ者と生きたい。……前に、そう言ったな」' }),
    [[function (S) { return gf(S) ? '{pname}と別れて、受け止める' : '「……おれも、ずっと好きやった」'; }, {}, function (S) { H.date(S, 'すべてを捨てて'); return ({ chisa: '千咲は、泣きながら笑った。\n「……遅い。……お互いに」', miyako: '「……了解、しました」\n電話の向こうで、ミヤコが泣いていた。', hoshino: '「……うへ〜。……よかったぁ〜」\nホシノの声が、ぐしゃぐしゃになった。', miyabi: '「……そうか」\n雅は、こっちの胸に額を押しつけた。\n「……少し、このままでいさせろ」' })[S.hero.cur]; }, 'life'],
     ['「……少し、時間がほしい」', { like: { who: 'hero', v: -4 } }, W({ chisa: '「……うん。……待つ。……いつまでも」', miyako: '「……了解しました。回答を、お待ちしています」', hoshino: '「うへ〜……うん。いいよ〜。……いいよ」', miyabi: '「……承知した。答えは、いつでもいい」' }), 'b']], 'serious');
  // 別れたあと、一度だけの復縁チャンス（恋人がいても来る）
  Bt('c_reunion', '*', { gone: true, imp: 2, pri: 1, c: function (S) { var h = S.hero; return h.gone && !h.ended && !h.reunion && h.goneT !== undefined && S.t - h.goneT >= (h.reT || 3) && !S.spouseId; }, after: function (S) { S.hero.reunion = true; } }, '再会', '🌙',
    function (S) { var id = S.hero.cur, d = H.D[id]; return 'あれから、' + Math.max(1, Math.round((S.t - S.hero.goneT) / 2)) + '年。' + ({ chisa: '地元の夏祭りで', miyako: (pro(S) ? 'スタジアムの通路で' : '駅のホームで'), hoshino: '昔の公園で', miyabi: '道場の前で' })[id] + '、' + d.mei + 'と再会した。\n\n' + ({ chisa: '「……{mei}くん。久しぶり」\n赤いリボンは、昔のままだった。', miyako: '「……先輩。お久しぶりです」\n手には、あの頃と同じノートを持っていた。', hoshino: '「うへ〜……久しぶりだねぇ〜」\nいつもの調子なのに、声が少しだけ震えていた。', miyabi: '「……{mei}か。……変わらんな」\n雅は、少しだけ視線をそらした。' })[id] + (gf(S) ? '\n\n――今は、{pname}がいる。' : ''); },
    [[function (S) { return gf(S) ? '「もう一度、やり直したい」（{pname}とは別れる）' : '「もう一度、やり直したい」'; }, {}, function (S) { var n = H.npc(S), h = S.hero; h.gone = false; if (n) { n.hidden = false; n.like = Math.max(n.like, 55); } if (KL.chk(S, (n ? n.like : 50) + S.st.com / 4, 54, 8)) { H.date(S, '再会して'); return KL.fill(S, H.v(S, 'yes')) + '\n\n止まっていた時間が、また動き出した。'; } H.end(S); return '「……ごめん。あの頃には、戻れない」\nそれでも、最後に笑ってくれた。'; }, 'life'],
     ['「元気そうでよかった」とだけ言う', {}, function (S) { H.end(S); return '少しだけ昔話をして、別れた。\nそれで、よかったのだと思う。'; }, 'soccer']], 'base');
  // 他の人と結婚した → ヒロインは人生から去る
  Bt('c_bye', '*', { imp: 1, pri: 1, gone: true, c: function (S) { var sp = KL.npc(S, S.spouseId); return !!sp && !sp.hero && !S.hero.ended; }, after: function (S) { H.end(S, '別の道を歩いていった。'); } }, 'おめでとう', '💐',
    function (S) { var l = like(S), id = S.hero.cur, sad = l >= 50; return ({ chisa: sad ? '結婚式の朝、ポストに手紙が一通。千咲の字だった。\n「おめでとう。\nほんとは、ずっと、隣にいたかった。\n……でも、おめでとう。ほんとに」' : '千咲から、短い手紙が届いた。「おめでとう。お幸せに」',
      miyako: sad ? 'ミヤコから、メッセージが届いた。\n「ご結婚、おめでとうございます、先輩」\n「観察記録は、本日をもって終了します。……長い間、ありがとうございました」' : 'ミヤコから、メッセージが届いた。「ご結婚おめでとうございます、先輩」',
      hoshino: sad ? 'ホシノから、メッセージが届いた。\n「うへ〜、結婚おめでと〜！」\n少しして、もう一通。\n「……幸せになってね。……おじさんの分まで」' : 'ホシノから「うへ〜、おめでと〜」とスタンプが届いた。',
      miyabi: sad ? '雅から、達筆な祝いの手紙が届いた。\n「御結婚、心よりお祝い申し上げる。\n……幸せであれ。それだけが、私の願いだ」' : '雅から、祝いの品が届いた。団子だった。' })[id]; },
    [['「ありがとう」と返す', {}, '画面を閉じても、しばらくその言葉が残っていた。', 'b']], 'base');
  // ヒロイン視点の場面（付き合ったあと）
  Bt('c_v_date', '*', { view: true, repeat: true, max: 4, cool: 4, c: function (S) { return tog(S); } }, W({ chisa: '千咲の日記', miyako: '観察記録・第2部', hoshino: 'ホシノのスマホ', miyabi: '雅の手帳' }), '📔',
    function (S) { return V(ST.pick(S, 'cvd_' + S.hero.cur, ({
      chisa: ['千咲の日記。\n「今日、手をつないだ。わたしからつないだ。……{mei}くんは、気づいてないと思う」', '千咲の日記。\n「試合、見た。点を取ったとき、こっちを見た気がした。……気のせいでもいい」', '千咲の日記。\n「出せなかった手紙が、もう百通を超えた。……でも、もう出さなくていいのかもしれない」'],
      miyako: ['ミヤコの観察記録・第2部。\n「先輩が私の名前を呼んだ回数：今日だけで11回。過去最高値」', 'ミヤコの観察記録・第2部。\n「先輩の寝顔：計測不能。理由：見とれていたため」', 'ミヤコの観察記録・第2部。\n「仮説：私は、先輩のことが好きすぎる。……検証の必要なし」'],
      hoshino: ['ホシノは、こっそり撮った寝顔の写真を、ロック画面にしようとして、やめた。\n「……うへ〜、バレたら恥ずかしすぎる〜」\n結局、ホーム画面にした。', 'ホシノは、ひとりでいるとき、ときどき「うへへ〜」と笑うようになった。\n友達に「何それ」と聞かれても、教えなかった。', '「ホシノ、最近ちゃんと起きてるじゃん」\n「うへ〜、だって〜。……寝てたら、もったいないんだもん」'],
      miyabi: ['雅の手帳。\n「本日の稽古：素振り千本。本日の{mei}：かわいい」\n書いてから、雅は三十分ほど顔を覆っていた。', '雅は、団子を二本買うようになった。\n一本は、自分の分。もう一本も、だいたい自分で食べる。', '雅の手帳。\n「父上に『最近、剣筋が柔らかくなった』と言われた。……心当たりは、ある」'] })[S.hero.cur])); });

  // ======================================================
  //  付き合っている間のデート（くり返し）
  // ======================================================
  H.DATE = {
    chisa: ['千咲と、古い喫茶店で向かい合って本を読んだ。会話は少ない。でも、それがいい。', '千咲が「……観たい映画がある」と言った。恋愛映画だった。終わったあと、千咲は少しだけ泣いていた。', '夜の公園。千咲が、小さい頃に二人で埋めたタイムカプセルの場所を覚えていた。', '千咲の手作りのお弁当。卵焼きが、ちょっとだけ甘かった。「……昔、甘いのが好きって言ってたから」'],
    miyako: ['ミヤコと水族館へ。ペンギンの前で、ミヤコが真剣にメモを取っていた。「……先輩、ペンギンの歩行効率についてですが」', 'ミヤコが手作りのスポーツドリンクを持ってきた。「配合比率は最適化済みです。……味の保証は、ありません」', '雨の日、ミヤコの部屋で一緒に試合映像を見た。いつの間にか、肩に頭がのっていた。', 'ミヤコがうさぎのぬいぐるみを買った。「……先輩が遠征でいない日の、代理です」'],
    hoshino: ['ホシノと河原で昼寝。目を覚ますと、ホシノがこっちの寝顔を撮っていた。「うへへ〜、保存〜」', 'ホシノとゲームセンターへ。クレーンゲームが異常にうまかった。「おじさん、昔取った杵柄だよ〜」', '夜、ホシノがふいに真面目な顔で言った。「……ねぇ。どこにも行かないでね」', 'ホシノの作ったカレー。具が全部大きかった。「適当に、適当に〜。……おいしい？」'],
    miyabi: ['雅と団子屋めぐり。五軒目で、雅が真剣な顔で言った。「……次で最後にする。たぶん」', '雅と夜の散歩。雅はなぜか、ずっと半歩前を歩いて周りを警戒していた。「……癖だ」', '雅が朝の稽古に誘ってくれた。日の出の中の素振りは、思ったより気持ちよかった。', '雅が手料理をふるまってくれた。焦げた魚を前に、「……気合いは入っている」と言い張った。']
  };
  Bt('hero_date', '*', { repeat: true, max: 12, cool: 2, pri: 5, c: function (S) { return H.dating(S); } }, 'デート', '💕',
    function (S) { return ST.pick(S, 'hdate_' + S.hero.cur, H.DATE[S.hero.cur]); },
    [['ゆっくり一緒に過ごす', { like: { who: 'hero', v: 8 }, men: 2, fat: -4 }, function (S) { return H.v(S, 'happy'); }, 'life'],
     ['次の試合の話をする', { like: { who: 'hero', v: 4 }, form: 1 }, function (S) { return H.v(S, 'yes'); }, 'soccer']], function (S) { return S.hero.cur === 'hoshino' ? 'resort' : S.hero.cur === 'miyabi' ? 'work' : 'base'; });

  // ======================================================
  //  ヒロインの「最近」・職業
  // ======================================================
  H.NOW = {
    chisa: { pre: ['図書館で、また分厚い本を借りていた', '最近、手紙用の便箋を集めているらしい', 'リボンの色を、ほんの少しだけ変えた'], date: ['{mei}くんの試合の日は、カレンダーに赤丸がついている', '新しい便箋で、また手紙を書いているらしい', '最近、料理を練習している。……味は、まだ秘密らしい'], wife: ['毎朝、玄関で「いってらっしゃい」の手紙をくれる', '庭に小さな花壇を作った', '{mei}くんの試合の切り抜きを、アルバムにしている'], hbf: ['彼氏がいるらしい。……あまり、その話はしない', '最近、手紙の返事が少しだけ遅い'] },
    miyako: { pre: ['新しい分析ソフトを使いこなしている', 'うさぎの動画を見て、こっそり和んでいるらしい', '「先輩のデータ」と書かれたファイルが、また増えた'], date: ['先輩の睡眠時間を、勝手に管理し始めた', '最近、うさぎの抱き枕を買ったらしい', '大事な日の前日は、必ず「了解しました」とだけ連絡が来る'], wife: ['家計簿まで分析している', '{mei}さんの体調を毎朝チェックしている', 'うさぎの「先輩」と、毎日昼寝している'], hbf: ['お付き合いしている人がいるらしい。……ノートには、何も書いていない', '最近、敬語がいつもより硬い'] },
    hoshino: { pre: ['今日もどこかで昼寝しているらしい', '最近、クジラのぬいぐるみを集めている', '「うへ〜、面倒くさいねぇ〜」が口ぐせ'], date: ['デートの行き先は、だいたい昼寝スポット', '{mei}くんの試合だけは、絶対に寝ないで見ている', '最近、料理を覚えようとしている。……カップ麺のアレンジから'], wife: ['休日は、ほぼ一日中ソファで丸くなっている', '{mei}の試合の日だけは、早起きする', '「うへへ〜、しあわせ〜」が口ぐせになった'], hbf: ['彼氏がいるらしい。「うへ〜、まぁ適当にね〜」とだけ言っていた', '最近、昼寝の時間が増えたらしい'] },
    miyabi: { pre: ['道場で、若い門下生を鍛えている', '団子屋の新作を、制覇しようとしている', 'また逆方向の電車に乗ったらしい'], date: ['刀の手入れの時間が、少しだけ減った。……連絡の時間が増えた', '{mei}のための栄養計画を、勝手に作っている', 'デートの行き先は、だいたい団子屋'], wife: ['毎朝5時に稽古をしている', '料理の腕が、少しずつ上がってきた', '夜、縁側で月を見るのが日課になった'], hbf: ['縁談の話が進んでいるらしい。……本人は、あまり話したがらない', '最近、稽古がいつもより厳しいらしい'] }
  };
  var nowOrig = KL.Love.nowOf;
  KL.Love.nowOf = function (S, n) {
    if (!n || !n.hero || !H.NOW[n.hero]) return nowOrig(S, n);
    var k = H.married(S) ? 'wife' : H.dating(S) ? 'date' : S.hero && S.hero.hbf ? 'hbf' : 'pre', arr = H.NOW[n.hero][k];
    var seed = Math.abs(Math.sin(S.t * 13 + 7)), job = KL.npcJob(S, n);
    return (KL.npcAge(S, n) >= 22 && job ? job + '。' : '') + KL.fill(S, arr[Math.floor(seed * arr.length)]);
  };
  var jobOrig = KL.npcJob;
  KL.npcJob = function (S, n) {
    if (n && n.hero && !n.job) {
      var a = KL.npcAge(S, n);
      if (n.hero === 'miyabi') return a >= 22 ? (S.stage === 'pro' ? 'クラブのフィジカルコーチ' : '古武術の師範代') : '大学生';
      if (a >= 22) return { chisa: '出版社の編集者', miyako: 'スポーツデータアナリスト', hoshino: 'のんびり働く会社員' }[n.hero];
    }
    return jobOrig(S, n);
  };
  // 関係の呼び名（人間関係の画面）
  H.roleOf = function (S) {
    var h = S.hero; if (!h) return '';
    if (H.married(S)) return '妻'; if (H.dating(S)) return '恋人';
    return (h.how || H.D[h.cur].role) + '・' + H.stageLabel(S) + (h.hbf ? '（' + h.hbf.kind + 'あり）' : '');
  };
  // 出会う前の「？？？」
  H.mystery = function (S) { var h = S.hero; if (!h || h.met || !h.mem || !h.mem.length) return null; return { hint: H.D[h.cur].hint, lines: h.mem.slice() }; };

  // ---------- 一般の恋愛イベントとかち合わないように ----------
  var BLOCK = ['l_date', 'l_bday', 'l_jealous', 'l_tempt', 'l_ldr', 'l_parents', 'r_propose', 'r_fight', 'r_breakup', 's_firstdate', 'ro_jealous'];
  H.patch = function () {
    (KL.EVENTS || []).forEach(function (e) {
      if (BLOCK.indexOf(e.id) < 0 || e._heroPatched) return;
      var c0 = e.cond; e._heroPatched = true;
      e.cond = function (S) { var p = KL.partner(S); if (p && p.hero) return false; return c0(S); };
    });
  };

  // ======================================================
  //  半年ごと（core.js の halfCommon から）
  // ======================================================
  H.half = function (S) {
    var h = H.init(S); H.sync(S);
    var n = H.npc(S), a = KL.age(S);
    if (h.met && n && !h.ended) {
      // 放っておくと少しずつ冷める（付き合っていないとき）
      if (!h.gone && !H.together(S) && S.t - (h.touchT || -99) >= 2 && n.like > 20) KL.likeAdd(n, -2);
      // 好感度が育たないまま大学生くらいになると、あっちに彼氏ができる（雅は出会いのときに縁談の相手がいることも）
      if (!h.gone && !H.together(S) && !h.hbf && !h.hbfDone && !h.hbfPend && h.cur !== 'miyabi') {
        var ha = KL.npcAge(S, n);
        if (ha >= 19 && ha <= 26 && n.like < 50 && U.chance(0.55)) h.hbfPend = true;
      }
      // 付き合っていて冷めきったら別れ
      if (H.together(S) && n.like < 12) {
        KL.push(S, { id: 'hero_break', cat: 'hero', imp: 2, title: '別れ', icon: '💔', text: KL.fill(S, H.react(S, 'caught') || '気づけば、すれ違ってばかりだった。'), img: H.img(S, 'dark'),
          choices: [{ t: '引き止める', ok: true, fx: function (S) { var n2 = H.npc(S); if (n2 && KL.chk(S, n2.like + S.st.com / 2, 40, 8)) { KL.likeAdd(n2, 15); return '何度も話し合って、もう一度だけ、と言ってもらえた。'; } H.part(S, 'すれ違い'); return '止められなかった。'; } },
            { t: '受け入れる', ok: true, fx: function (S) { H.part(S, 'すれ違い'); return '静かに、終わった。'; } }] });
      }
    }
    // 学生・社会人など（プロのシーズン中以外）は、ここで場面を選ぶ
    if (!(KL.Season && KL.Season.active(S))) {
      var evs = H.tick(S, a < 10 ? 1 : 2);
      evs.forEach(function (ev) { KL.push(S, { ev: ev }); });
    }
  };
  H.halfTurn = H.half;
  // プロのシーズン中は、日程の中に場面を散らす
  if (KL.Season) {
    var hs0 = KL.Season.halfStart;
    KL.Season.halfStart = function (S) {
      hs0(S);
      var SE = KL.Season;
      if (!SE.active(S) || !S.sea) return;
      var rg = SE.range(S), span = rg[1] - rg[0] - 40;
      H.tick(S, 3).forEach(function (ev, i) { S.sea.plan.push({ atD: rg[0] + 10 + Math.floor(Math.random() * span), ev: ev }); });
      S.sea.plan.sort(function (a, b) { return a.atD - b.atD; });
    };
  }
})();
