// src/app/character-select/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

type Character = {
    id: string;
    name: string;
    furigana: string;
    img: string; // HUD でも使う画像パス
};

export default function CharacterSelectPage() {
    const router = useRouter();

    const [playerName, setPlayerName] = useState<string>('');
    const [selectedCharId, setSelectedCharId] = useState<string | null>(null);
    const [selectedCharImg, setSelectedCharImg] = useState<string>(''); // ★ 画像パスも保持
    const [isResetting, setIsResetting] = useState(false); // ★ 二重押し防止

    useEffect(() => {
        // 既存データの読み込み
        const savedName = localStorage.getItem('matRpgPlayerName') ?? '';
        const savedChar = localStorage.getItem('matRpgSelectedChar');
        const savedCharImg = localStorage.getItem('matRpgSelectedCharImg') ?? '';

        if (savedName) setPlayerName(savedName);
        if (savedChar) setSelectedCharId(savedChar);
        if (savedCharImg) setSelectedCharImg(savedCharImg);
    }, []);

    // ▼▼▼ リセット関連（取りこぼし防止の強化版）▼▼▼

    // 厳密一致で消すキー（古い互換用も含めておく）
    const MAT_EXACT_KEYS = [
        'matRpgPlayerName',
        'matRpgSelectedChar',
        'matRpgSelectedCharImg',
        'matProgress',
        'matClears',
    ] as const;

    // よく使うプレフィクス（プロフィール別など）
    const MAT_PREFIX_KEYS = [
        'matLevel_',
        'matProgress_',
        'matPets_',
        'matQuest_',
        'matExercise_',
        'matSkill_',
        'matBadge_',
        'matClear_',
        'matStage_',
        'matInventory_',
    ] as const;

    // 名前空間で広くマッチ（大文字小文字無視）
    const MAT_NAMESPACE_REGEX = /(matrpg|^mat)/i;

    // Cache Storage も掃除（静的アセットの再取得を強制したい場合）
    async function clearCacheStorageSafely() {
        try {
            if (typeof caches !== 'undefined' && caches.keys) {
                const keys = await caches.keys();
                await Promise.all(keys.map((k) => caches.delete(k)));
            }
        } catch {
            // 失敗しても致命ではないので無視
        }
    }

    // Service Worker のキャッシュも強制的に更新したい場合は、SW側実装に応じてメッセージ送信などを検討

    // RPG関連のストレージを一括削除（localStorage / sessionStorage）
    const resetAllRpgData = async () => {
        // まず localStorage のキー一覧を固定配列に（削除で index がズレないように）
        const localKeys: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k) localKeys.push(k);
        }

        const removed: string[] = [];

        for (const key of localKeys) {
            const matchExact = (MAT_EXACT_KEYS as readonly string[]).includes(key);
            const matchPrefix = MAT_PREFIX_KEYS.some((p) => key.startsWith(p));
            const matchNamespace = MAT_NAMESPACE_REGEX.test(key); // 広域

            if (matchExact || matchPrefix || matchNamespace) {
                localStorage.removeItem(key);
                removed.push(key);
            }
        }

        // sessionStorage も同様に（使っている場合のみ）
        try {
            const sessionKeys: string[] = [];
            for (let i = 0; i < sessionStorage.length; i++) {
                const k = sessionStorage.key(i);
                if (k) sessionKeys.push(k);
            }
            for (const key of sessionKeys) {
                if (
                    (MAT_EXACT_KEYS as readonly string[]).includes(key) ||
                    MAT_PREFIX_KEYS.some((p) => key.startsWith(p)) ||
                    MAT_NAMESPACE_REGEX.test(key)
                ) {
                    sessionStorage.removeItem(key);
                    removed.push(`session:${key}`);
                }
            }
        } catch {
            // Safari等での制限時は無視
        }

        // Cache Storage も削除（任意）
        await clearCacheStorageSafely();

        // 何を消したか見える化（デバッグ用）
        if (removed.length) {
            // eslint-disable-next-line no-console
            console.table(removed.map((k) => ({ removedKey: k })));
        }
        return removed.length;
    };

    const handleResetClick = async () => {
        if (isResetting) return;
        const ok = window.confirm(
            'RPGデータをすべてリセットします（名前・キャラ・レベル・進捗・バッジ等）。この操作は取り消せません。実行しますか？'
        );
        if (!ok) return;

        try {
            setIsResetting(true);
            const removed = await resetAllRpgData();

            // UIの状態もクリア
            setPlayerName('');
            setSelectedCharId(null);
            setSelectedCharImg('');

            alert(`データをリセットしました（削除 ${removed} 件）。`);

            // 強制リロードで完全初期化（メモリ上の状態や SW/Cache の揺れを排除）
            location.reload();
        } finally {
            setIsResetting(false);
        }
    };

    // ▲▲▲ リセット関連ここまで ▲▲▲

    // ★ 10キャラ（5×2で表示）
    const characters: Character[] = [
        { id: 'chara1', name: '少年', furigana: 'しょうねん', img: '/images/chara1.png' },
        { id: 'chara2', name: '勇者', furigana: 'ゆうしゃ', img: '/images/chara2.png' },
        { id: 'chara3', name: '戦士', furigana: 'せんし', img: '/images/chara3.png' },
        { id: 'chara4', name: '騎士', furigana: 'きし', img: '/images/chara4.png' },
        { id: 'chara5', name: '魔法使い', furigana: 'まほうつかい', img: '/images/chara5.png' },
        { id: 'chara6', name: '弓使い', furigana: 'ゆみつかい', img: '/images/chara6.png' },
        { id: 'chara7', name: '天使', furigana: 'てんし', img: '/images/chara7.png' },
        { id: 'chara8', name: '武闘家', furigana: 'ぶとうか', img: '/images/chara8.png' },
        { id: 'chara9', name: 'アイドル', furigana: '', img: '/images/chara9.png' },
        { id: 'chara10', name: 'ワンダーウーマン', furigana: '', img: '/images/chara10.png' },
    ];

    // ★ キャラ選択時に ID と画像パスの両方を保存（HUD が即座に反映できる）
    function chooseCharacter(charId: string, imgPath: string) {
        setSelectedCharId(charId);
        setSelectedCharImg(imgPath);

        // プレビュー用に即保存（任意）
        localStorage.setItem('matRpgSelectedChar', charId);
        localStorage.setItem('matRpgSelectedCharImg', imgPath);
    }

    // ★ 冒険開始：名前・ID・画像パスを保存し、プロフィールキーも確立
    const startAdventure = () => {
        if (!playerName.trim() || !selectedCharId || !selectedCharImg) {
            alert('名前とキャラクターを選んでください！');
            return;
        }

        const name = playerName.trim();
        localStorage.setItem('matRpgPlayerName', name);
        localStorage.setItem('matRpgSelectedChar', selectedCharId);
        localStorage.setItem('matRpgSelectedCharImg', selectedCharImg);

        // プロフィールキー（名前×キャラ）でデータを分ける
        const profileKey = `${name || 'default'}__${selectedCharId || 'default'}`;

        // 初回ならレベル初期化
        if (!localStorage.getItem(`matLevel_${profileKey}`)) {
            localStorage.setItem(`matLevel_${profileKey}`, '1');
        }
        // 進捗／ペットの器を初期化したい場合は必要に応じて（未設定なら空で作る）
        if (!localStorage.getItem(`matProgress_${profileKey}`)) {
            localStorage.setItem(
                `matProgress_${profileKey}`,
                JSON.stringify({ netspring: [], headspring: [], vault: [] })
            );
        }
        if (!localStorage.getItem(`matPets_${profileKey}`)) {
            localStorage.setItem(`matPets_${profileKey}`, JSON.stringify([]));
        }

        router.push('/iland-select');
    };

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <h1 className={styles.title}>キャラクター選択</h1>
                <p className={styles.subtitle}>名前を入力してキャラクターを選ぼう！</p>

                <input
                    type="text"
                    placeholder="名前を入力"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className={styles.nameInput}
                />

                <div className={styles.grid} role="list">
                    {characters.map((char) => {
                        const selected = selectedCharId === char.id;
                        return (
                            <button
                                type="button"
                                key={char.id}
                                onClick={() => chooseCharacter(char.id, char.img)} // ★ 修正ポイント
                                className={`${styles.charItem} ${selected ? styles.selected : ''}`}
                                aria-pressed={selected}
                                role="listitem"
                            >
                                <div className={styles.charImgWrap}>
                                    <img className={styles.charImg} src={char.img} alt={char.name} />
                                </div>
                                <div className={styles.charLabel}>
                                    <ruby>
                                        {char.name}
                                        <rt>{char.furigana}</rt>
                                    </ruby>
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div className={styles.actions}>
                    <button className={styles.startBtn} onClick={startAdventure}>
                        冒険を始める
                    </button>

                    {/* ★ 追加：一括リセットボタン（取りこぼし無しの完全版） */}
                    <button
                        type="button"
                        className={styles.resetBtn}
                        onClick={handleResetClick}
                        disabled={isResetting}
                        aria-busy={isResetting}
                        title="RPG関連データ（名前／キャラ／レベル／進捗／バッジ／ペット等）とキャッシュを削除します"
                    >
                        {isResetting ? 'リセット中…' : 'データをリセット'}
                    </button>
                </div>
            </div>
        </div>
    );
}
