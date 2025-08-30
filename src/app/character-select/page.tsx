// src/app/character-select/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

type Character = {
    id: string;
    name: string;
    furigana: string;
    img: string;            // HUD でも使う画像パス
};

export default function CharacterSelectPage() {
    const router = useRouter();

    const [playerName, setPlayerName] = useState<string>('');
    const [selectedCharId, setSelectedCharId] = useState<string | null>(null);
    const [selectedCharImg, setSelectedCharImg] = useState<string>(''); // ★ 画像パスも保持

    useEffect(() => {
        // 既存データの読み込み
        const savedName = localStorage.getItem('matRpgPlayerName') ?? '';
        const savedChar = localStorage.getItem('matRpgSelectedChar');
        const savedCharImg = localStorage.getItem('matRpgSelectedCharImg') ?? '';

        if (savedName) setPlayerName(savedName);
        if (savedChar) setSelectedCharId(savedChar);
        if (savedCharImg) setSelectedCharImg(savedCharImg);
    }, []);

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

        // プレビュー用に即保存しておく（任意）
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
                                onClick={() => chooseCharacter(char.id, char.img)}   // ★ 修正ポイント
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
                </div>
            </div>
        </div>
    );
}
