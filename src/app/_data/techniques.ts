// _data/techniques.ts

/** ステージ種別 */
export type StageKey = "netspring" | "headspring" | "vault";

/** 技データ型 */
export type Technique = {
    id: string;
    title: string;
    stage: StageKey;
    order: number;               // ステージ内の並び順（小さいほど先）
    video?: string | null;       // 動画URL（なければ null/未定義）
    checkPointsLabel?: string;   // 「ポイント」など、ラベルを差し替えたい時に任意で使用
    checkpoints: string[];       // クリア条件のテキスト一覧
};

/** 一覧 */
export const TECHNIQUES: Technique[] = [
    // =========================
    // ネットスプリング（首はね系）
    // =========================
    {
        id: "front-roll",
        title: "前転",
        stage: "netspring",
        order: 1,
        video: "/videos/maeten.mp4",
        checkpoints: [
            "こしを高くしてスタートできている",
            "頭の後ろ→背中→おしりの順番でマットについている",
            "かかとをおしりに近づけて、しゃがみ立ちできている",
        ],
    },
    {
        id: "big-front-roll",
        title: "大きな前転",
        stage: "netspring",
        order: 2,
        video: "/videos/ookinazenten.mp4",
        checkpoints: [
            "ひざを曲げて強くふみ切れている",
            "頭よりこしが高い位置にある",
            "ひざがのびている",
            "立ち上がる直前にひざをたたんでいる",
        ],
    },
    {
        id: "front-roll-bridge",
        title: "前転ブリッジ",
        stage: "netspring",
        order: 3,
        video: "/videos/zentenburige.mp4",
        checkpoints: [
            "大きな前転をしている",
            "背中がついたらいっきに背中をそらしている",
            "足がついたらうででマットをおしてブリッジができている",
        ],
    },
    {
        id: "stage-front-roll-bridge",
        title: "ステージからの前転ブリッジ",
        stage: "netspring",
        order: 4,
        video: "/videos/stagekaranozentenburizzi.mp4",
        checkpoints: [
            "大きな前転をしている",
            "背中がついたらいっきに背中をそらしている",
            "ステージからバランスボール一個分のスペースが空いている",
        ],
    },

    // =========================
    // ヘッドスプリング（頭はね系）
    // =========================
    {
        id: "tripod",
        title: "三点倒立",
        stage: "headspring",
        order: 1,
        video: "/videos/santentouritu.mp4",
        checkpoints: [
            "頭と両手で三角形をつくるようにしてマットに着けている",
            "マットからゆっくり足をはなし、こしを上げている",
            "両足をゆっくり上にのばしている",
            "頭と両手の三点で立つことができている",
        ],
    },
    {
        id: "tripod-bridge",
        title: "三点倒立ブリッジ",
        stage: "headspring",
        order: 2,
        video: "/videos/santentourituburizzi.mp4",
        checkpoints: [
            "頭と両手で三角形をつくるようにしてマットに着けている",
            "マットからゆっくり足をはなし、こしを上げている",
            "おしりが向こうがわにいった時に体がくの字になっている",
            "足を大きくふりあげ、背中をそらしている",
            "足がついたらうででマットをおしてブリッジしている"
        ],
    },
    {
        id: "stage-tripod-bridge",
        title: "ステージからの三点倒立ブリッジ",
        stage: "headspring",
        order: 3,
        video: "/videos/stagekaranosantentouritsuburizzi.mp4",
        checkpoints: [
            "頭と両手で三角形をつくるようにしてマットに着けている",
            "マットからゆっくり足をはなし、こしを上げている",
            "おしりが向こうがわにいった時に体がくの字になっている",
            "足を大きくふりあげ、背中をそらしている",
            "ステージからバランスボール一個分のスペースが空いている"
        ],
    },

    // =========================
    // 跳び箱（Vault）
    // =========================
    {
        id: "vault-front-roll",              // ① 台上前転
        title: "台上前転",
        stage: "vault",
        order: 1,
        video: "/videos/daizyozenten.mp4",
        checkpoints: [
            "両足をそろえて強くふみきっている",
            "とび箱の手前に手をつき、ひざをのばしてこしを高く上げている",
            "あごをひき背中を丸めて回っている",
            "ひざをまげてフワリと止まっている",
        ],
    },
    {
        id: "vault-big-front-roll",          // ② 大きな台上前転
        title: "大きな台上前転",
        stage: "vault",
        order: 2,
        video: "/videos/ookinadaizyouzenten.mp4",
        checkpoints: [
            "両足をそろえて強くふみきっている",
            "とび箱の手前に手をつき、ひざをのばしてこしを高く上げている",
            "ひざとつま先をのばしたままゆっくり回る",
            "ひざを曲げてフワリと止まっている",
        ],
    },
    {
        id: "vault-neck-spring",             // ③ 首はねとび
        title: "首はねとび",
        stage: "vault",
        order: 3,
        video: "/videos/kubihanetobi.mp4",
        checkpoints: [
            "両足をそろえて強くふみきっている",
            "とび箱の中央に手をつき、ひざをのばしている",
            "ひざをのばしたまま足を残してためをつくることができている",
            "足をふりだすと同時に両手で強くとび箱をおしてひじをのばしている",
            "ひざを曲げてフワリと止まっている",
        ],
    },
    {
        id: "vault-head-spring",             // ④ 頭はねとび
        title: "頭はねとび",
        stage: "vault",
        order: 4,
        video: "/videos/atamahanetobi.mp4",
        checkpoints: [
            "両足をそろえて強くふみきっている",
            "とび箱の中央にうでで支えながら頭の前のあたりをつけて、ひざをのばしている",
            "こしが頭の真上にきたら足をふり出している",
            "両手で強くとび箱をおしてひじをのばしている",
            "ひざを曲げてピタリと止まっている",
        ],
    },
];

/** id から Technique を返すヘルパー */
export const byId = (id: string) => TECHNIQUES.find(t => t.id === id) ?? null;
