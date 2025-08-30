// src/app/mat-iland/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { TECHNIQUES, type Technique } from "../_data/techniques";
import HUD from "../components/HUD";

/** 3島共通の型 */
type StageKey = "netspring" | "headspring" | "vault";
type MatProgress = Record<StageKey, string[]>;

/* ===== storage utils（マージ保存・名前＋キャラで名前空間） ===== */
const ensureProgress = (p?: Partial<MatProgress>): MatProgress => ({
    netspring: Array.isArray(p?.netspring) ? p!.netspring! : [],
    headspring: Array.isArray(p?.headspring) ? p!.headspring! : [],
    vault: Array.isArray(p?.vault) ? p!.vault! : [],
});

const loadProgress = (profileKey: string): MatProgress => {
    try {
        const raw = localStorage.getItem(`matProgress_${profileKey}`);
        if (raw) return ensureProgress(JSON.parse(raw) as Partial<MatProgress>);
    } catch { }
    return { netspring: [], headspring: [], vault: [] };
};

/** 既存を壊さずパッチ適用 */
const mergeSaveProgress = (profileKey: string, patch: Partial<MatProgress>) => {
    const cur = loadProgress(profileKey);
    const merged: MatProgress = {
        netspring: patch.netspring ?? cur.netspring,
        headspring: patch.headspring ?? cur.headspring,
        vault: patch.vault ?? cur.vault,
    };
    localStorage.setItem(`matProgress_${profileKey}`, JSON.stringify(merged));
};

const loadLevel = (profileKey: string): number => {
    const raw = localStorage.getItem(`matLevel_${profileKey}`);
    const n = raw ? parseInt(raw, 10) : 1;
    return Number.isFinite(n) && n > 0 ? n : 1;
};
const saveLevel = (profileKey: string, n: number) => {
    localStorage.setItem(`matLevel_${profileKey}`, String(n));
};

/** ステージ定義（このページはマット系2ステージのみ表示） */
const STAGES: Record<
    "netspring" | "headspring",
    { title: string; color: string; techniques: Technique[]; bg?: string }
> = {
    netspring: {
        title: "ネットスプリング（首はね系）",
        color: "#7dd3fc",
        techniques: TECHNIQUES.filter((t) => t.stage === "netspring").sort((a, b) => a.order - b.order),
        bg: "/images/stage-netspring.jpg",
    },
    headspring: {
        title: "ヘッドスプリング（頭はね系）",
        color: "#a78bfa",
        techniques: TECHNIQUES.filter((t) => t.stage === "headspring").sort((a, b) => a.order - b.order),
        bg: "/images/stage-headspring.jpg",
    },
};

export default function MatIlandPage() {
    const router = useRouter();

    // 入場ガード＆プロフィールキー（名前＋キャラ）
    const [playerName, setPlayerName] = useState("");
    const [selectedChar, setSelectedChar] = useState<string | null>(null);
    const [profileKey, setProfileKey] = useState("default__default");
    const [ready, setReady] = useState(false);

    // 進捗＆レベル（vault も保持する）
    const [progress, setProgress] = useState<MatProgress>({ netspring: [], headspring: [], vault: [] });
    const [level, setLevel] = useState<number>(1);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const name = localStorage.getItem("matRpgPlayerName") ?? "";
        const char = localStorage.getItem("matRpgSelectedChar");
        setPlayerName(name);
        setSelectedChar(char);

        const pk = `${name || "default"}__${char || "default"}`;
        setProfileKey(pk);

        setProgress(loadProgress(pk));
        setLevel(loadLevel(pk));
        setReady(true);
    }, []);

    const canEnter = useMemo(() => playerName.trim().length > 0 && !!selectedChar, [playerName, selectedChar]);

    useEffect(() => {
        if (ready && !canEnter) router.replace("/character-select");
    }, [ready, canEnter, router]);


    /** このページに出ている2島のみ全消し（vault は保持）※必要ならボタンを有効化 */
    const resetShownStages = () => {
        const cleared: MatProgress = { netspring: [], headspring: [], vault: progress.vault };
        setProgress(cleared);
        mergeSaveProgress(profileKey, { netspring: [], headspring: [] });
        setLevel(1);
        saveLevel(profileKey, 1);
    };

    return (
        <main className={styles.page}>
            {/* 共通HUD（名前・キャラ・レベル・仲間/メダルなど） */}
            <HUD />

            <div className={styles.bubbles}>
                <span />
                <span />
                <span />
            </div>
            <div className={styles.bg} />

            <section className={styles.card}>
                <div className={styles.cardHeader}>
                    <div>
                        <h1 className={styles.title}>マットアイランド</h1>
                        <p className={styles.subtitle}>技をクリアして次のチャレンジを解放しよう！</p>
                    </div>
                    <div className={styles.headerActions}>
                        <button type="button" className={styles.navBtn} onClick={() => router.push("/iland-select")}>
                            島選択へ戻る
                        </button>
                    </div>
                </div>

                <div className={styles.stageGrid}>
                    {(Object.keys(STAGES) as Array<"netspring" | "headspring">).map((stageKey) => {
                        const stage = STAGES[stageKey];
                        const clearedCount = progress[stageKey].length;
                        const total = stage.techniques.length;
                        const visibleCount = Math.min(clearedCount + 1, total);
                        const percent = Math.round((clearedCount / total) * 100);

                        return (
                            <article key={stageKey} className={styles.stageCard}>
                                <div className={styles.stageHead}>
                                    <div className={styles.stageTitles}>
                                        <h2 className={styles.stageTitle} style={{ color: stage.color }}>
                                            {stage.title}
                                        </h2>
                                        <p className={styles.stageMeta}>
                                            進捗 {clearedCount}/{total}
                                        </p>
                                    </div>

                                    <div className={styles.stageTools}>
                                        <div className={styles.progressBar} aria-label="進捗">
                                            <span className={styles.progressFill} style={{ width: `${percent}%`, background: stage.color }} />
                                        </div>
                                    </div>
                                </div>

                                {stage.bg && <div className={styles.stageBg} style={{ backgroundImage: `url(${stage.bg})` }} />}

                                <ol className={styles.techList}>
                                    {stage.techniques.slice(0, visibleCount).map((t, idx) => {
                                        const cleared = progress[stageKey].includes(t.id);
                                        const isNewest = idx === clearedCount && !cleared;
                                        const status = cleared ? "CLEARED" : isNewest ? "NEW" : "OPEN";

                                        return (
                                            <li key={t.id} className={styles.techRow}>
                                                <div className={`${styles.techItem} ${cleared ? styles.cleared : ""} ${isNewest ? styles.appear : ""}`}>
                                                    <div className={styles.techMain}>
                                                        <span className={styles.techIcon} aria-hidden>
                                                            {cleared ? "✅" : isNewest ? "✨" : "⚔️"}
                                                        </span>
                                                        <span className={styles.techTitle}>{t.title}</span>
                                                    </div>

                                                    <div className={styles.techRight}>
                                                        <span className={`${styles.status} ${cleared ? styles.stCleared : isNewest ? styles.stNew : styles.stOpen}`}>
                                                            {status}
                                                        </span>
                                                        <div className={styles.actions}>
                                                            <Link className={styles.detailBtn} href={`/technique/${t.id}`}>
                                                                お手本・チェック
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ol>
                            </article>
                        );
                    })}
                </div>

                {/* 必要なら全消しボタン（このページの2島のみ） */}
                {/* <div className={styles.centerRow}>
          <button className={styles.toolBtn} onClick={resetShownStages}>全部リセット（このページ）</button>
        </div> */}
            </section>
        </main>
    );
}
