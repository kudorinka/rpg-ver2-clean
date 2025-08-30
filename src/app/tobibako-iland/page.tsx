"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import { TECHNIQUES } from "../_data/techniques";
import HUD from "../components/HUD";

/** ステージID（3島共通型） */
type StageKey = "netspring" | "headspring" | "vault";
type MatProgress = Record<StageKey, string[]>;

/* ===== storage utils（マージ保存で他島を壊さない） ===== */
const ensureProgress = (p?: Partial<MatProgress>): MatProgress => ({
    netspring: Array.isArray(p?.netspring) ? p!.netspring! : [],
    headspring: Array.isArray(p?.headspring) ? p!.headspring! : [],
    vault: Array.isArray(p?.vault) ? p!.vault! : [],
});

const loadProgress = (key: string): MatProgress => {
    try {
        const raw = localStorage.getItem(`matProgress_${key}`);
        if (raw) return ensureProgress(JSON.parse(raw) as Partial<MatProgress>);
    } catch { }
    return { netspring: [], headspring: [], vault: [] };
};

/** 既存を壊さずにパッチ保存 */
const mergeSaveProgress = (key: string, patch: Partial<MatProgress>) => {
    const cur = loadProgress(key);
    const merged: MatProgress = {
        netspring: patch.netspring ?? cur.netspring,
        headspring: patch.headspring ?? cur.headspring,
        vault: patch.vault ?? cur.vault,
    };
    localStorage.setItem(`matProgress_${key}`, JSON.stringify(merged));
};

export default function TobibakoIlandPage() {
    const router = useRouter();

    const [playerName, setPlayerName] = useState("");
    const [selectedChar, setSelectedChar] = useState<string | null>(null);
    const [profileKey, setProfileKey] = useState("default__default");
    const [ready, setReady] = useState(false);

    const [progress, setProgress] = useState<MatProgress>({
        netspring: [],
        headspring: [],
        vault: [],
    });

    useEffect(() => {
        if (typeof window === "undefined") return;
        const name = localStorage.getItem("matRpgPlayerName") ?? "";
        const char = localStorage.getItem("matRpgSelectedChar");
        setPlayerName(name);
        setSelectedChar(char);

        const pk = `${name || "default"}__${char || "default"}`;
        setProfileKey(pk);
        setProgress(loadProgress(pk));
        setReady(true);
    }, []);

    const canEnter = useMemo(
        () => playerName.trim().length > 0 && !!selectedChar,
        [playerName, selectedChar]
    );

    useEffect(() => {
        if (ready && !canEnter) router.replace("/character-select");
    }, [ready, canEnter, router]);

    const VAULT_STAGE = useMemo(() => {
        const techniques = TECHNIQUES
            .filter((t) => t.stage === "vault")
            .sort((a, b) => a.order - b.order);
        return { techniques, cleared: progress.vault };
    }, [progress.vault]);

    const clearedCount = VAULT_STAGE.cleared.length;
    const total = VAULT_STAGE.techniques.length;
    const bigCleared = VAULT_STAGE.cleared.includes("vault-big-front-roll");

    const visibleTechs = useMemo(() => {
        const base = VAULT_STAGE.techniques;
        let count = Math.min(clearedCount + 1, total);
        if (bigCleared) count = Math.max(count, 4);
        return base.slice(0, count);
    }, [VAULT_STAGE.techniques, clearedCount, total, bigCleared]);

    const percent = Math.round((VAULT_STAGE.cleared.length / total) * 100);

    const resetVaultProgress = () => {
        const updated = { ...progress, vault: [] as string[] };
        setProgress(updated);
        mergeSaveProgress(profileKey, { vault: [] });
    };

    return (
        <main className={styles.page}>
            <HUD /> {/* ★ HUDを最上部に配置 */}

            {/* 飾りバブル */}
            <div className={styles.bubbles}>
                <span />
                <span />
                <span />
            </div>

            {/* 背景 */}
            <div className={styles.bg} />

            {/* カード */}
            <section className={styles.card}>
                <div className={styles.cardHeader}>
                    <div>
                        <h1 className={styles.title}>跳び箱アイランド</h1>
                        <p className={styles.subtitle}>
                            技をクリアして次のチャレンジを解放しよう！
                        </p>
                    </div>
                    <div className={styles.headerActions}>
                        <button
                            type="button"
                            className={styles.navBtn}
                            onClick={() => router.push("/iland-select")}
                        >
                            島選択へ戻る
                        </button>
                    </div>
                </div>

                <article className={styles.stageCard}>
                    <div className={styles.stageHead}>
                        <div className={styles.stageTitles}>
                            <p className={styles.stageMeta}>
                                進捗 {VAULT_STAGE.cleared.length}/{total}
                            </p>
                        </div>

                        <div className={styles.stageTools}>
                            <div className={styles.progressBar} aria-label="進捗">
                                <span
                                    className={styles.progressFill}
                                    style={{ width: `${percent}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <ol className={styles.techList}>
                        {visibleTechs.map((t) => {
                            const cleared = VAULT_STAGE.cleared.includes(t.id);
                            const isNextOneNormally =
                                !bigCleared &&
                                !cleared &&
                                t.id ===
                                VAULT_STAGE.techniques[Math.min(clearedCount, total - 1)]?.id;
                            const isNewByBigClear = bigCleared && !cleared && t.order >= 3;
                            const isNewest = isNextOneNormally || isNewByBigClear;
                            const status = cleared ? "CLEARED" : isNewest ? "NEW" : "OPEN";

                            return (
                                <li key={t.id} className={styles.techRow}>
                                    <div
                                        className={`${styles.techItem} ${cleared ? styles.cleared : ""
                                            } ${isNewest ? styles.appear : ""}`}
                                    >
                                        <div className={styles.techMain}>
                                            <span className={styles.techIcon} aria-hidden>
                                                {cleared ? "✅" : isNewest ? "✨" : "⚔️"}
                                            </span>
                                            <span className={styles.techTitle}>{t.title}</span>
                                        </div>

                                        <div className={styles.techRight}>
                                            <span
                                                className={`${styles.status} ${cleared
                                                    ? styles.stCleared
                                                    : isNewest
                                                        ? styles.stNew
                                                        : styles.stOpen
                                                    }`}
                                            >
                                                {status}
                                            </span>
                                            <div className={styles.actions}>
                                                <Link
                                                    className={styles.detailBtn}
                                                    href={`/technique/${t.id}`}
                                                >
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
            </section>
        </main>
    );
}
