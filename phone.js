/* Kani Life - 連絡（スマホ）・オフシーズン・試合後のメッセージ・周りの人の人生
   ・連絡できる回数：恋人（配偶者）は月1回（半年で6回）、それ以外は半年に3回
   ・海外にいるときは通話かメッセージ。国内・オフで帰省中なら会える
   ・オフシーズン（夏・年末年始）は、私生活の場面がまとまって起きる */
(function () {
  'use strict';
  var KL = window.KL, U = KL.U, ST = KL.Story, H = KL.Hero;
  var P = KL.Phone = {};
  function age(S) { return KL.age(S); }
  function first(n) { return ST.first(n); }
  function pro(S) { return S.stage === 'pro' && S.soccer && S.soccer.club && !S.soccer.retired; }
  function abroad(S) { return pro(S) && !KL.LEAGUES[KL.Soccer.club(S).l].japan; }
  function homeOff(S) { return !!(S.off && S.off.t === S.t && S.off.home); }
  P.far = function (S) { return abroad(S) && !homeOff(S); };
  P.minAge = 10;

  // ---------- 回数 ----------
  function hasLove(S) { var p = KL.partner(S); return !!p && !p.dead; }
  P.credits = function (S) {
    if (!S.ph || S.ph.t !== S.t) S.ph = { t: S.t, p: 6, o: 3 };
    return S.ph;
  };
  function use(S, c) { var cr = P.credits(S); if (cr[c] > 0) { cr[c]--; return true; } return false; }

  // ---------- 声（ヒロイン） ----------
  var HV = {
    chisa: {
      s0: ['「……なに？」', '「……{mei}くん。……どうしたの」', '「……うん。元気」'],
      s1: ['「……今日、図書館で{mei}くんが好きそうな本、見つけた」', '「……うん。……話すの、ひさしぶり」', '「……元気そうで、よかった」'],
      s2: ['「……声、聞きたかった。……なんでもない」', '「……最近、手紙、書いてない。……書いたけど、出してない」', '「……{mei}くんの話、もっと聞かせて」'],
      s3: ['「……会いたい。……言ってみただけ」', '「……ずっと、待ってる。……なにを、とは言わない」', '「……{mei}くんの電話だけ、着信音、変えてる」'],
      gf: ['「……{pname}さんとは、順調？ ……聞いてみただけ」', '「……楽しそうで、よかった。……よかった」', '「……わたしに電話してていいの。……いいなら、いいけど」'],
      hbf: ['「……{hbf}さん？ ……うん、普通。……普通だよ」', '「……{mei}くんと話してるほうが、楽」', '「……今の、聞かなかったことにして」'],
      date: ['「……会いたかった。……すごく」', '「……今日、何してたか、全部教えて」', '「……おやすみ。……もう一回、言って」'],
      wife: ['「……ごはん、できてる。……早く帰ってきて」', '「……今日の試合、テレビの前で正座して見てた」', '「……{mei}くん。……なんでもない。呼んでみただけ」']
    },
    miyako: {
      s0: ['「お疲れさまです、先輩。ご用件は」', '「了解しました。……あの、それだけですか」', '「……はい、先輩。問題ありません」'],
      s1: ['「先輩、今日の体調は良好そうですね。声でわかります」', '「……先輩からの連絡、記録しておきます」', '「新しい分析ソフトの話、聞きますか。……十分ほどかかります」'],
      s2: ['「……先輩。用件がないのに連絡するのは、非合理的です。……嬉しいですが」', '「先輩の声のデータが、不足していました。……補充、ありがとうございます」', '「……うさぎの動画、送ります。先輩に似ている子がいました」'],
      s3: ['「……先輩。会いたい、というのは、データではなく感情です。……報告まで」', '「先輩からの連絡を待つ時間が、最近は一番長いです」', '「……先輩。今日も、好き……な、分析対象です。訂正します」'],
      gf: ['「……{pname}さんとは、順調ですか。……すみません。聞くべきではありませんでした」', '「先輩の自由です。……私に連絡するのも、先輩の自由です。……ありがとうございます」', '「……報告は、不要です。……いえ、やはり、してください」'],
      hbf: ['「{hbf}さんですか。……データ上は、問題ありません。データ上は」', '「……先輩と話していると、時間の計測を忘れます。{hbf}さんのときは、忘れません」', '「……今のは、記録しないでください」'],
      date: ['「先輩。本日の会話量、目標値を達成しました。……もう少し、話しませんか」', '「……先輩。おやすみなさいの前に、名前を呼んでください」', '「了解しました。……今日も、大好きです。誤差はありません」'],
      wife: ['「{mei}さん。今夜の献立は最適化済みです。早く帰ってきてください」', '「{mei}さん、睡眠時間の確保を。……それと、ぎゅっとしてください」', '「うさぎの『先輩』が、{mei}さんを待っています。……私もです」']
    },
    hoshino: {
      s0: ['「うへ〜、どうしたの〜？」', '「ん〜、元気だよ〜。適当にね〜」', '「うへ〜、めずらしいねぇ〜」'],
      s1: ['「うへ〜、昼寝してたのに〜。……まぁ、いっか〜」', '「最近どう〜？ おじさんは、相変わらず眠いよ〜」', '「うへへ〜、連絡くれるの、ちょっとうれしいかも〜」'],
      s2: ['「うへ〜……声聞いたら、眠気とんじゃった〜。責任とってね〜？」', '「……なんかさ〜、きみと話してると、適当にできないんだよね〜」', '「うへ〜、また連絡してね〜。……ほんとだよ？」'],
      s3: ['「……会いたいな〜。……うへ〜、今の、なし〜」', '「おじさんね、最近きみからの通知だけ、すぐ見ちゃうんだよね〜」', '「……ねぇ。いつまで、先輩と後輩なのかな〜」'],
      gf: ['「うへ〜、{pname}ちゃんとは仲良くやってる〜？ ……そっか〜。よかったね〜」', '「……おじさんに連絡してて、怒られない〜？ ……ならいいけど〜」', '「うへ〜、青春だねぇ〜。……ちょっとだけ、うらやましいな〜」'],
      hbf: ['「{hbf}くん〜？ うへ〜、ふつうだよ〜。ふつう〜」', '「……きみと話してるほうが、楽しいかも〜。……内緒ね〜」', '「うへ〜、今の聞かなかったことにして〜」'],
      date: ['「うへへ〜、今日もかっこよかったよ〜」', '「……早く会いたいな〜。……適当じゃないよ？」', '「おやすみ〜。……夢でも会おうね〜。うへ〜、恥ずかしい〜」'],
      wife: ['「うへ〜、おかえり〜。ソファ、半分あけて待ってるよ〜」', '「今日はおじさんがごはん作ったよ〜。……カップ麺だけど〜」', '「{mei}〜。うへへ〜、呼んでみただけ〜」']
    },
    miyabi: {
      s0: ['「……何用だ」', '「うむ。息災だ」', '「……用件は手短に頼む」'],
      s1: ['「稽古は続けているか。……そうか、ならいい」', '「団子屋の新作が出た。……いや、それだけだ」', '「……声に張りがあるな。良いことだ」'],
      s2: ['「……用がなくとも、連絡してよい。……許可する」', '「お前の試合を見た。……いや、たまたまだ」', '「……最近、稽古中に雑念が入る。……原因は、わかっている」'],
      s3: ['「……会いたい。……武士にあるまじき言葉だな」', '「お前の声を聞くと、心が凪ぐ。……不思議なものだ」', '「……{mei}。……いや、名前を呼んでみたかっただけだ」'],
      gf: ['「……{pname}殿とは、うまくいっているのか。……ならば、良い」', '「……私に連絡していて、良いのか。……良いなら、良いが」', '「……そうか。……幸せなら、それでいい」'],
      hbf: ['「{hbf}殿か。……悪い人ではない。……悪い人では、ないのだがな」', '「……お前と話すほうが、気が休まる。……聞かなかったことにしろ」', '「……父が喜んでいる。……父が、な」'],
      date: ['「……会いたい。……二度は言わん」', '「明日の朝、稽古をつけてやる。……ついでに、朝食も作る」', '「……おやすみ。……もう少しだけ、話していろ」'],
      wife: ['「早く帰れ。団子を、二本残してある。……一本は、もう食べた」', '「今日の試合、良い足運びだった。……帰ったら、褒めてやる」', '「……{mei}。……月がきれいだ。……早く帰ってこい」']
    }
  };
  function heroKey(S) {
    if (H.married(S)) return 'wife'; if (H.dating(S)) return 'date';
    if (S.hero.hbf) return 'hbf';
    if (H.gf(S) && H.stage(S) >= 2) return 'gf';
    return 's' + H.stage(S);
  }
  var GEN = {
    partner: ['「声聞けてうれしい！」', '「今日なにしてたの？ ぜんぶ教えて」', '「会いたいなー。次いつ会える？」', '「ちゃんとご飯食べてる？」'],
    spouse: ['「お疲れさま。今日は早く帰れそう？」', '「子どもたちが、テレビの前で応援してたよ」', '「無理しないでね。いつでも待ってるから」', '「今日の晩ごはん、何がいい？」'],
    mom: ['「ちゃんと寝てる？ 野菜も食べなさいよ」', '「近所の人が、みんなあんたの話してるわよ」', '「お父さん、新聞の切り抜き集めてるのよ。内緒ね」', '「たまには帰ってきなさいよ」'],
    dad: ['「……おう。元気か」', '「試合、見たぞ。……まあ、よかった」', '「無理はするなよ。……それだけだ」'],
    sib: ['「おー、生きてたか」', '「職場であんたの話ばっかりされて困るわ」', '「親のことは任せとき。あんたは自分のことやり」'],
    best: ['「おう！ 久しぶりやん！」', '「今度帰ってきたら飲もうや」', '「地元のみんな、お前の話ばっかりしてるで」', '「最近仕事きついわー。お前は？」'],
    friend: ['「わー、久しぶり！」', '「元気にしてた？」', '「今度みんなで集まろうよ」']
  };

  // ---------- 連絡できる相手 ----------
  P.list = function (S) {
    if (age(S) < P.minAge || S.dead) return [];
    var out = [], far = P.far(S), hn = H && H.npc(S);
    var modes = function (o) { return far ? [{ k: 'call', n: '通話', i: '📞' }, { k: 'msg', n: 'メッセージ', i: '💬' }] : [{ k: 'meet', n: o || '会う', i: '☕' }, { k: 'msg', n: 'メッセージ', i: '💬' }]; };
    if (hn && S.hero.met && !S.hero.gone && !S.hero.ended && !hn.dead) {
      var tg = H.together(S), ms = modes(H.dating(S) ? 'デート' : '会う');
      var canConf = !tg && hn.like >= 50 && age(S) >= 13 && S.t - (S.hero.confT || -99) >= 1 && !S.spouseId;
      if (canConf) ms.push({ k: 'conf', n: H.gf(S) ? '気持ちを伝える（' + first(H.gf(S)) + 'とは別れる）' : '気持ちを伝える', i: '💌' });
      out.push({ id: 'hero', npc: hn.id, name: hn.name, sub: H.roleOf(S), credit: tg ? 'p' : 'o', modes: ms });
    }
    var pt = KL.partner(S);
    if (pt && !pt.hero && !pt.dead) out.push({ id: 'n' + pt.id, npc: pt.id, name: pt.name, sub: S.spouseId ? '配偶者' : '恋人', credit: 'p', modes: modes(S.spouseId ? '一緒に過ごす' : 'デート') });
    if (!S.done.w_parent_bye) {
      S.family_members.forEach(function (f, i) { if (age(S) < 18) return; out.push({ id: 'f' + i, name: f.name, sub: f.rel, credit: 'o', modes: modes('実家に顔を出す') }); });
    }
    var fr = S.npcs.filter(function (n) { return !n.dead && !n.hero && !n.hidden && ['best', 'friend', 'oldfriend'].indexOf(n.rel) >= 0 && n.id !== S.partnerId; }).sort(function (a, b) { return (b.rel === 'best') - (a.rel === 'best') || b.like - a.like; }).slice(0, 3);
    fr.forEach(function (n) { out.push({ id: 'n' + n.id, npc: n.id, name: n.name, sub: KL.relLabel(n), credit: 'o', modes: modes('飲みに行く') }); });
    return out;
  };

  // ---------- 連絡する ----------
  P.act = function (S, id, k) {
    var c = P.list(S).filter(function (x) { return x.id === id; })[0];
    if (!c) return { text: 'つながらなかった。', ok: false };
    if (!use(S, c.credit)) return { text: '今は、これ以上連絡できない（' + (c.credit === 'p' ? '恋人' : 'ほかの人') + 'への連絡回数を使い切った）。', ok: false };
    var far = P.far(S), frame = k === 'meet' ? '' : k === 'call' ? (far ? '時差を計算して、電話をかけた。\n' : '電話をかけた。\n') : 'メッセージを送った。返事が来た。\n';
    if (id === 'hero') {
      var n = H.npc(S), hk = heroKey(S);
      if (k === 'conf') {
        var ok = H.tryConfess(S, far ? 0 : 6, far ? '電話で告白' : '告白');
        var R = ok ? { chisa: '「……遅い。……ばか。……うん」\n千咲の声が、少しだけ震えていた。', miyako: '「……っ。……了解、しました。……了解しました」\n二回言った。', hoshino: '「……うへ〜。……先に言われちゃった〜。……うん、いいよ。よろしくね」', miyabi: '「……不意打ちは、卑怯だぞ。……承知した」' }
          : (S.hero.hbf ? { chisa: '「……今は、{hbf}さんがいるから。……ごめん。……ごめんね」', miyako: '「……先輩。今の私には、お付き合いしている方がいます。……すみません」', hoshino: '「うへ〜……今は、{hbf}くんがいるからさ〜。……ずるいよ、今言うの」', miyabi: '「……今は、縁談の最中だ。……すまない」' }
            : { chisa: '「……ずるい。……今は、まだ、わからない」', miyako: '「……すみません。データが、まだ足りません」', hoshino: '「……うへ〜。……ごめんね〜。今は、まだかな〜」', miyabi: '「……すまない。まだ、心の準備ができていない」' });
        return { title: '💌 ' + H.D[S.hero.cur].mei, text: KL.fill(S, (far ? '電話で、' : '会って、') + '気持ちを伝えた。\n\n' + R[S.hero.cur]), ok: true, big: ok };
      }
      var v = k === 'meet' ? (H.dating(S) ? 8 : 6) : k === 'call' ? 5 : 3;
      H.aff(S, v);
      if (k === 'meet') { KL.fatAdd(S, -4); KL.add(S, 'men', 1); }
      if (k === 'meet' && H.dating(S)) KL.moneyAdd(S, -8000);
      var line = ST.pick(S, 'phh_' + S.hero.cur + hk, HV[S.hero.cur][hk]);
      var scene = k === 'meet' ? (H.together(S) ? H.D[S.hero.cur].mei + 'と過ごした。\n' : H.D[S.hero.cur].mei + 'と会った。\n') : frame;
      return { title: (k === 'meet' ? '☕ ' : k === 'call' ? '📞 ' : '💬 ') + H.D[S.hero.cur].mei, text: KL.fill(S, scene + line), ok: true };
    }
    var npc = c.npc ? KL.npc(S, c.npc) : null, pool, nm = c.name;
    if (npc && (npc.id === S.partnerId || npc.id === S.spouseId)) {
      pool = S.spouseId ? GEN.spouse : GEN.partner; KL.likeAdd(npc, k === 'meet' ? 6 : k === 'call' ? 4 : 2);
      if (k === 'meet') { KL.fatAdd(S, -5); KL.moneyAdd(S, -8000); }
    } else if (npc) {
      pool = npc.rel === 'best' ? GEN.best : GEN.friend; KL.likeAdd(npc, k === 'meet' ? 6 : k === 'call' ? 4 : 2); KL.add(S, 'men', k === 'meet' ? 1 : 0.5);
      if (k === 'meet') { KL.fatAdd(S, -3); KL.moneyAdd(S, -5000); }
    } else {
      var f = S.family_members[+id.slice(1)] || {}; pool = f.rel === '母' ? GEN.mom : f.rel === '父' ? GEN.dad : GEN.sib;
      KL.add(S, 'men', k === 'meet' ? 1.5 : 0.7); if (k === 'meet') KL.fatAdd(S, -6);
    }
    return { title: (k === 'meet' ? '☕ ' : k === 'call' ? '📞 ' : '💬 ') + first({ name: nm }), text: KL.fill(S, (k === 'meet' ? nm + 'と会った。\n' : frame) + ST.pick(S, 'phg_' + id + k, pool)), ok: true };
  };

  // ======================================================
  //  試合のあとのメッセージ（大事な試合のとき）
  // ======================================================
  var HM = {
    chisa: { w: ['「……見てた。……すごかった」', '「……おめでとう。……テレビの前で、ちょっと泣いた」', '「……かっこよかった。……言いたかっただけ」'], l: ['「……おつかれさま。……次、また見る」', '「……負けても、かっこよかった。……ほんと」', '「……ちゃんと寝て。……それだけ」'] },
    miyako: { w: ['「勝利、おめでとうございます。走行距離、チーム最多でした」', '「先輩。……データ以上の試合でした。おめでとうございます」', '「……先輩。今日のゴール、百回見ました。まだ見ます」'], l: ['「お疲れさまでした。敗因の分析、送ります。……先輩のせいではありません」', '「先輩。……今日は、データの話はしません。ゆっくり休んでください」', '「……そばにいたら、何か言えたのに。……お疲れさまでした」'] },
    hoshino: { w: ['「うへ〜、勝ったね〜！ おめでと〜」', '「うへへ〜、見てたよ〜。寝ないで見てた〜」', '「……かっこよかった。……適当じゃなくて、ほんとに」'], l: ['「うへ〜、おつかれ〜。また次があるよ〜」', '「……今日は、おじさんが慰めてあげよっか〜？」', '「……悔しいね。……でも、きみは悪くないよ」'] },
    miyabi: { w: ['「見事だった」', '「良い足運びだった。……鍛錬の成果だな」', '「……誇らしい。……それだけだ」'], l: ['「……負けから学べ。それが武だ」', '「下を向くな。……背筋を伸ばせ」', '「……今夜は、団子でも食べに行くか。……付き合ってやる」'] }
  };
  P.matchMsgs = function (S, ctx, res) {
    if (!res || !res.my || !res.my.min) return [];
    var big = ctx && (ctx.big || ctx.final), goals = res.my.g || 0;
    if (!big && goals < 2) return [];
    var out = [], win = res.win === true, hn = H && H.npc(S);
    if (hn && S.hero.met && !S.hero.gone && !S.hero.ended && (H.together(S) || H.stage(S) >= 1)) {
      var st = H.together(S) ? 2 : Math.max(0, H.stage(S) - 1);
      out.push({ who: hn.name.split(' ')[1] || hn.name, npc: hn.id, text: KL.fill(S, HM[S.hero.cur][win || goals ? 'w' : 'l'][Math.min(2, st)]) });
    }
    var pt = KL.partner(S); if (pt && !pt.hero && !pt.dead) out.push({ who: first(pt), npc: pt.id, text: ST.say(S, 'pmp' + (win ? 'w' : 'l'), win || goals ? ['「最高だった！ 今日はお祝いしよ」', '「テレビの前で叫んじゃった」', '「かっこよすぎ。惚れ直した」'] : ['「おつかれさま。今日はゆっくり休んでね」', '「負けても、ずっと応援してるよ」', '「帰ったら、好きなもの作るね」']) });
    if (!S.done.w_parent_bye && U.chance(0.6)) out.push({ who: '母', text: ST.say(S, 'pmm' + (win ? 'w' : 'l'), win || goals ? ['「見たわよ！ お父さん、立ち上がって叫んでたわ」', '「近所の人から電話が鳴りやまないのよ」', '「おめでとう。ちゃんとご飯食べなさいよ」'] : ['「怪我はない？ それだけが心配」', '「よく頑張ったわね。ゆっくり休みなさい」', '「お父さんが『次は勝つ』って言ってたわよ」']) });
    var best = ST.who(S, 'best'); if (best && !best.dead && U.chance(0.6)) out.push({ who: first(best), npc: best.id, text: ST.say(S, 'pmb' + (win ? 'w' : 'l'), win || goals ? ['「やばすぎ！！ 地元の居酒屋、大騒ぎやで」', '「スクショして待ち受けにしたわ」', '「お前ほんまにすごいな。今度おごれよ」'] : ['「どんまい！ 次や次！」', '「お前が下向いてたら、みんな下向くで」', '「今度帰ってきたら、飲みに行こや」']) });
    if (out.length) { S.msgs = S.msgs || []; S.msgs.push({ t: S.t, kind: 'match', list: out }); if (S.msgs.length > 30) S.msgs.shift(); }
    return out.slice(0, 4);
  };

  // ======================================================
  //  オフシーズン（夏：6〜7月／年末年始）
  // ======================================================
  var SE = KL.Season;
  if (SE) {
    var hs1 = SE.halfStart;
    SE.halfStart = function (S) {
      hs1(S);
      if (!SE.active(S) || !S.sea) return;
      if (KL.isB(S)) S.sea.plan.push({ atD: SE.wcYear(S.sea.y + 1) ? 357 : 322, fn: 'offSummer' });
      else S.sea.plan.push({ atD: 150, fn: 'offWinter' });
      S.sea.plan.sort(function (a, b) { return a.atD - b.atD; });
    };
    SE.FN.offSummer = function (S) {
      var far = abroad(S), pt = KL.partner(S);
      KL.push(S, KL.evInstance(S, { id: 'off_summer', cat: 'life', imp: 1, title: 'シーズンオフ', icon: '🏖️',
        text: function (S) { return 'シーズンが終わった。' + (far ? '{city}の街は、もう夏の色だった。' : '') + '\n次のシーズンまで、一か月ほど休みがある。どう過ごそう？'; },
        choices: [
          { t: far ? '日本に帰る（地元でゆっくり）' : '地元に帰る', fx: function (S) { S.off = { t: S.t, home: true }; KL.add(S, 'men', 3); KL.fatAdd(S, -30); KL.moneyAdd(S, far ? -400000 : -80000); return far ? '十数時間のフライトのあと、地元の駅に降りた。\n母の作った味噌汁が、異様においしかった。' : '実家の自分の部屋は、昔のままだった。\n母が「痩せた？」と三回聞いた。'; } },
          { t: function (S) { return pt && !pt.dead ? first(pt) + 'と旅行に行く' : ''; }, req: function () { return !!pt && !pt.dead; }, fx: function (S) { var p = KL.partner(S); if (p) KL.likeAdd(p, p.hero ? Math.round(10 * (H ? H.likeMul(S) : 1)) : 10); S.off = { t: S.t, home: false, trip: true }; KL.fatAdd(S, -35); KL.moneyAdd(S, -800000); return U.pick(['南の島のビーチで、何もしない一週間を過ごした。', '北欧の小さな港町。白夜の空の下を、ずっと歩いた。', '京都の古い旅館。縁側で、ふたりで夕立を眺めた。']); } },
          { t: '自主トレを続ける', fx: function (S) { S.off = { t: S.t, home: false }; var so = S.soccer; ['phy', 'spd'].forEach(function (k) { if (so.sk[k] !== undefined) so.sk[k] = Math.min(99, so.sk[k] + 0.6); }); KL.fatAdd(S, -10); return '休みの間も、毎朝走った。\n体が、次のシーズンを待っていた。'; } }
        ] }));
      // オフの間の出来事（私生活とヒロイン）
      var evs = KL.pickEvents(S, { cats: ['life'], quota: { life: 2 } });
      evs.forEach(function (ev) { KL.push(S, { ev: ev }); });
      if (H) H.tick(S, 1, { view: false }).forEach(function (ev) { KL.push(S, { ev: ev }); });
    };
    SE.FN.offWinter = function (S) {
      var far = abroad(S), pt = KL.partner(S);
      KL.push(S, KL.evInstance(S, { id: 'off_winter', cat: 'life', imp: 0, title: '年末年始', icon: '🎍',
        text: far ? 'クリスマス休暇。街はイルミネーションで光っている。\n数日だけ、休みがある。' : '年末年始の短い休み。',
        choices: [
          { t: far ? '日本に一時帰国する' : '実家で年を越す', fx: function (S) { S.off = { t: S.t, home: true }; KL.add(S, 'men', 2); KL.fatAdd(S, -15); if (far) KL.moneyAdd(S, -300000); return U.pick(['こたつで、家族と紅白を見た。父が途中で寝た。', '初詣の帰り、昔の同級生に「サインして」と言われた。', '母のおせちを、三段とも食べきった。']); }, pol: 'life' },
          { t: function (S) { return pt && !pt.dead ? first(pt) + 'と過ごす' : ''; }, req: function () { return !!pt && !pt.dead; }, fx: function (S) { var p = KL.partner(S); if (p) KL.likeAdd(p, 8); KL.fatAdd(S, -15); return '年越しの瞬間、' + first(p) + 'が「今年もよろしく」と笑った。'; }, pol: 'life' },
          { t: '休まずに体を動かす', fx: function (S) { KL.fatAdd(S, -6); KL.add(S, 'men', 1); return '誰もいない練習場で、ひとりボールを蹴った。'; }, pol: 'soccer' }
        ] }));
      var evs = KL.pickEvents(S, { cats: ['life'], quota: { life: 1 } });
      evs.forEach(function (ev) { KL.push(S, { ev: ev }); });
    };
  }

  // ======================================================
  //  おまかせの範囲：ヒロイン・家族・友達の場面は、自分で選ぶ
  // ======================================================
  var sa0 = KL.shouldAuto;
  KL.shouldAuto = function (S, inst) {
    if (!inst) return false;
    if ((S.cfg && S.cfg.auto) !== 'all' && (inst.cat === 'hero' || /^(f_|fam_|fr_|sib_|off_|sep_)/.test(inst.id || ''))) return false;
    return sa0(S, inst);
  };

  // ======================================================
  //  周りの人の人生（友達・兄弟・家族）
  // ======================================================
  var sc = KL.sc;
  function best(S) { return ST.who(S, 'best'); }
  function sib(S) { return S.family_members.filter(function (f) { return f.rel === '兄' || f.rel === '姉'; })[0]; }
  function star(S) { return S.rep.nat >= 45; }
  function bn(S) { var b = best(S); return b ? first(b) : '親友'; }
  KL.PH.best = function (S) { return bn(S); };
  KL.PH.sib = function (S) { var s = sib(S); return s ? s.rel : ''; };
  sc('fr_job', { cat: 'life', w: 1.5, people: function (S) { var b = best(S); return b ? [b.id] : []; }, cond: function (S) { var b = best(S); return !!b && age(S) >= 23 && age(S) <= 32; } }, '{best}の相談', '🍺',
    '久しぶりに{best}から連絡が来た。\n「……仕事、辞めようか迷ってる。お前みたいに、好きなことで生きてる奴に聞きたくて」',
    [['じっくり話を聞く', function (S) { var b = best(S); if (b) KL.likeAdd(b, 10); return { men: 1, com: 1 }; }, '朝まで話した。\n「……ありがとな。お前に話してよかった」\n{best}は、もう少しだけ今の職場で頑張ってみるらしい。', 'life'],
     ['「やりたいことやれよ」と背中を押す', function (S) { var b = best(S); if (b) { KL.likeAdd(b, 8); b.job = '経営者'; } return {}; }, '半年後、{best}は小さな店を開いた。\n開店祝いの花には、自分の名前で一番大きいのを贈った。', 'b'],
     ['「忙しいから、また今度」', function (S) { var b = best(S); if (b) KL.likeAdd(b, -8); return {}; }, '「……そっか。そうやな」\n{best}からの連絡は、それから少し減った。', 'soccer']]);
  sc('fr_far', { cat: 'life', w: 1.5, cond: function (S) { return !!best(S) && star(S) && age(S) >= 20 && age(S) <= 40; } }, '遠い人', '🌉',
    '地元の友達のグループLINE。自分の名前が出ると、会話が少しだけ止まるようになった。\n{best}から個別にメッセージが来た。\n「……なんか、みんなお前に気ぃ使ってるわ。遠い人になったなぁって」',
    [['「今度帰ったら、みんなで飲もう」と返す', function (S) { var b = best(S); if (b) KL.likeAdd(b, 10); return { men: 2 }; }, '次の帰省で、昔の仲間と居酒屋に集まった。\n最初はぎこちなかったけど、三杯目には、昔と同じバカ話をしていた。\n「お前、なんも変わってへんな」と言われたのが、一番嬉しかった。', 'life'],
     ['「しゃあないやろ」と返す', function (S) { var b = best(S); if (b) KL.likeAdd(b, -6); return { ego: 2 }; }, '既読がついたまま、返事は来なかった。', 'soccer']]);
  sc('fr_visit', { cat: 'life', w: 1.5, cond: function (S) { return !!best(S) && abroad(S); } }, '{best}が来た', '🧳',
    '{best}が、有給をまとめて取って{city}まで来た。\n「飛行機、十四時間。ケツ割れたわ」\nスタジアムの前で、{best}はユニフォームを着て写真を撮りまくっていた。',
    [['街を案内して、試合のチケットも用意する', function (S) { var b = best(S); if (b) KL.likeAdd(b, 12); return { men: 2, money: -200000 }; }, '試合のあと、{best}はスタンドで泣いていた。\n「……お前、ほんまにここで戦ってるんやな」', 'life'],
     ['練習で忙しく、少ししか会えない', function (S) { var b = best(S); if (b) KL.likeAdd(b, -3); return {}; }, '「気にすんな。顔見れただけでええわ」\n{best}は笑って、空港に向かった。', 'soccer']]);
  sc('fr_kid', { cat: 'life', w: 1.2, cond: function (S) { var b = best(S); return !!b && b.kidsN >= 1 && S.track === 'soccer' && S.soccer && S.soccer.proYears && age(S) >= 25; } }, '小さなファン', '⚽',
    '{best}の子どもが、ユニフォームを着て待っていた。背番号は、自分と同じ番号だった。\n「……パパが、おにいちゃんと友達って、ほんと？」',
    [['ボールにサインして、一緒にボールを蹴る', function (S) { var b = best(S); if (b) KL.likeAdd(b, 8); return { men: 2 }; }, '子どもは、そのボールを抱いて寝たらしい。\n{best}から「一生自慢するって言うてるわ」とメッセージが来た。', 'life'],
     ['サインだけして、急いで帰る', {}, '「ありがと……」\n子どもは、少しだけ寂しそうだった。', 'soccer']]);
  sc('sib_wed', { cat: 'life', w: 2, cond: function (S) { return !!sib(S) && age(S) >= 22 && age(S) <= 36 && !S.flags.sibWed; } }, '{sib}の結婚', '💒',
    function (S) { S.flags.sibWed = true; return sib(S).rel + 'が結婚することになった。\n「式で、なんか一言しゃべってや。……あんたが一番目立つけど、今日だけは主役譲ってな」'; },
    [['心を込めてスピーチする', { com: 2, men: 1 }, '昔の兄弟げんかの話で、会場がどっと笑った。\n最後に「幸せになってな」と言ったら、' + '新郎新婦より先に、母が泣いた。', 'life'],
     ['短く「おめでとう」とだけ言う', { men: 1 }, '短いスピーチだったけど、{sib}は「あんたらしいわ」と笑っていた。', 'b']]);
  sc('sib_kid', { cat: 'life', w: 1.5, cond: function (S) { return !!S.flags.sibWed && !S.flags.sibKid && age(S) >= 24; } }, 'おじさんになった', '👶',
    function (S) { S.flags.sibKid = true; return sib(S).rel + 'に子どもが生まれた。\n写真の中の赤ちゃんは、小さな手をぎゅっと握っていた。\n「……あんたも、とうとう『おじさん』やな」'; },
    [['会いに行って、抱っこする', { men: 3, fat: -5 }, '赤ちゃんは、自分の指を握ったまま離さなかった。\n「サッカーやらせるわ」と{sib}が笑った。', 'life'],
     ['お祝いを送る', { money: -100000, men: 1 }, '「高すぎるわ！」と{sib}から電話が来た。嬉しそうだった。', 'b']]);
  sc('sib_money', { cat: 'life', w: 1, cond: function (S) { return !!sib(S) && S.money >= 3e7 && age(S) >= 26 && !S.flags.sibMoney; } }, '{sib}からの電話', '📞',
    function (S) { S.flags.sibMoney = true; return '珍しく、' + sib(S).rel + 'から電話がかかってきた。\n「……ごめん。こんなこと、あんたに頼みたくなかったんやけど」\n家のローンで、困っているらしい。'; },
    [['黙って援助する', { money: -5000000, men: 2 }, '「……絶対、返すから」\n{sib}の声が、少し震えていた。\n数年後、本当に全額返ってきた。手紙が一枚、添えてあった。', 'life'],
     ['「一緒に計画を立てよう」と相談に乗る', { int: 1, com: 1 }, '二人で家計簿を見直した。\n「……あんた、いつの間にこんなしっかりしたん」', 'b']]);
  sc('fam_watch', { cat: 'life', w: 2, cond: function (S) { return abroad(S) && !S.done.w_parent_bye && !S.flags.famWatch; } }, '両親が来た', '✈️',
    function (S) { S.flags.famWatch = true; return '両親が、初めて海外に来た。\n父は空港で、なぜか日本代表のマフラーを巻いていた。\n「……どこ行っても、お前の応援はこれやろ」'; },
    [['ホームの試合に招待する', { men: 4 }, 'スタンドの両親は、周りの現地サポーターと肩を組んで歌っていた。\n試合のあと、父が珍しく泣いていた。\n「……あの小さかったお前がなぁ」', 'life'],
     ['街を案内する', { men: 2, fat: 5 }, '母は、どの店でも日本語で値切ろうとしていた。', 'b']]);
  sc('tm_old', { cat: 'life', w: 1.5, cond: function (S) { return S.track === 'soccer' && S.soccer && S.soccer.proYears >= 2 && age(S) >= 22 && age(S) <= 30 && !S.flags.tmOld; } }, '昔のチームメイト', '🧢',
    function (S) { S.flags.tmOld = true; return '少年団のころのチームメイトから、メッセージが来た。\n「おれ、サッカーやめて、今は営業やってる。……お前の試合、毎週見てるで」\n「昔、一緒にボール蹴ってたの、自慢してええか？」'; },
    [['「当たり前や。今度一緒に蹴ろう」', { men: 2 }, 'オフに、昔のグラウンドで一緒にボールを蹴った。\n「……やっぱ、うまいなぁ、お前」\n夕焼けの中で、二人とも子どもみたいに笑った。', 'life'],
     ['「ありがとう」と返す', { men: 1 }, '「こっちこそな」と返ってきた。', 'b']]);
  sc('fam_mom_call', { cat: 'life', w: 2, repeat: true, max: 2, cool: 8, cond: function (S) { return pro(S) && S.soccer.injDays > 20 && !S.done.w_parent_bye; } }, '母からの電話', '📞',
    '怪我のニュースが出た日の夜。母から電話がかかってきた。\n「……ニュースで見たわ。痛くないの？」\n「……あんたは昔から、痛いって言わん子やったからね」',
    [['「……ほんまは、ちょっと痛い」と言う', { men: 3 }, '「……そう。ちゃんと言えたやん」\n母の声を聞いたら、なぜか少し楽になった。', 'life'],
     ['「大丈夫やって」と笑う', { men: 1 }, '「……そう。大丈夫ならええけど」\n電話を切ったあと、母から「ちゃんと寝なさい」とだけメッセージが来た。', 'b']]);
  sc('fr_off_reunion', { cat: 'life', w: 3, cond: function (S) { return homeOff(S) && age(S) >= 19; } }, '地元の夜', '🏮',
    '帰省中、地元の友達が集まってくれた。\n昔よく行ったお好み焼き屋。店のおばちゃんが、壁に貼った自分の写真を指さして笑っている。\n「サイン、もう一枚書いてってや。前のは日焼けしてもうたわ」',
    [['朝まで昔話をする', { men: 3, fat: 10 }, '誰かが、小学生のころの失敗談を持ち出した。\n全員が、腹を抱えて笑った。\n帰り道、少しだけ泣きそうになった。', 'life'],
     ['一次会で帰って休む', { fat: -5 }, '「また帰ってきたら呼べよ」\nみんなが手を振って見送ってくれた。', 'soccer']]);

  // ======================================================
  //  進路の分かれ目（学生時代の恋人は、ここで終わりやすい）
  // ======================================================
  sc('sep_path', { cat: 'life', sched: true, pri: 6, repeat: true, imp: 1, people: function (S) { return S.partnerId ? [S.partnerId] : []; }, cond: function (S) { var p = H.gf(S), a = age(S); return !!p && KL.isB(S) && (a === 12 || a === 15 || a === 18) && p.since < S.t - 1 && !S.flags['sep' + a] && !S.spouseId; } }, '進路の分かれ目', '🚉',
    function (S) { var a = age(S); S.flags['sep' + a] = true; return ({ 12: '卒業式のあと、{pname}が言った。\n「……中学、別々になるね」', 15: '{pname}とは、高校が別々になる。\n「……毎日は、会えなくなるね」', 18: '卒業。{pname}は' + U.pick(['東京の大学', '地元の専門学校', '遠くの街の大学']) + 'に行く。\n「……これから、どうする？」' })[a]; },
    [['「離れても続けよう」', {}, function (S) { var p = H.gf(S); if (!p) return 'その話は、いつの間にか立ち消えになった。'; if (p.like >= 60 && U.chance(0.6)) { KL.likeAdd(p, 6); return '「……うん。ちゃんと連絡してね」\n{pname}は、少しだけ泣いていた。'; } p.rel = 'ex'; S.partnerId = null; S.exCount++; KL.log(S, p.name + 'と別れた（進路）。', 1); return '最初は毎日連絡していた。\nでも、少しずつ間が空いていった。\n夏が来る前に、{pname}から「……ごめんね」とメッセージが来た。'; }, 'life'],
     ['「……お互いのために、ここで終わりにしよう」', {}, function (S) { var p = H.gf(S); if (!p) return 'その話は、いつの間にか立ち消えになった。'; p.rel = 'ex'; S.partnerId = null; S.exCount++; KL.log(S, p.name + 'と別れた（進路）。', 1); return '「……そっか。そうだよね」\n{pname}は笑ってくれた。\n最後に、ちゃんと「ありがとう」と言えた。'; }, 'b']]);
})();
