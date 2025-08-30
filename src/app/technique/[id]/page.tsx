"use client";

import { use as useUnwrap } from "react"; // Next.js 15 params unwrap
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./page.module.css";
import { byId, TECHNIQUES } from "../../_data/techniques";
import HUD from "../../components/HUD";

/** 型 */
type StageKey = "netspring" | "headspring" | "vault";
type MatProgress = { netspring: string[]; headspring: string[]; vault: string[] };
type CheckpointState = Record<string, boolean[]>;

// ペット（メダル含む）
type PetId =
    | "pink-cat"
    | "green-cat"
    | "purple-biped"
    | "orange-biped"
    | "hat-biped"
    | "yellow-biped"
    | "purple-bird"
    | "vault-medal1"
    | "vault-medal2"
    | "vault-medal3"
    | "vault-medal4";
type PetsState = PetId[];

/** 共通LSキー（チェックポイントのプレフィックス） */
const LS_CHECKPOINTS = "matCheckpoints";

/* ===== localStorage セーフユーティリティ ===== */
const isBrowser = () => typeof window !== "undefined";
const safeGet = (key: string) => {
    if (!isBrowser()) return null;
    try {
        return window.localStorage.getItem(key);
    } catch {
        return null;
    }
};
const safeSet = (key: string, value: string) => {
    if (!isBrowser()) return;
    try {
        window.localStorage.setItem(key, value);
    } catch {
        /* ignore */
    }
};

const ensureProgress = (p: Partial<MatProgress> | undefined): MatProgress => ({
    netspring: Array.isArray(p?.netspring) ? p!.netspring : [],
    headspring: Array.isArray(p?.headspring) ? p!.headspring : [],
    vault: Array.isArray(p?.vault) ? p!.vault : [],
});

/** すべて profileKey（name__char）で名前空間化 */
function loadLevel(profileKey: string): number {
    const raw = safeGet(`matLevel_${profileKey}`);
    const n = raw ? parseInt(raw, 10) : 1;
    return Number.isFinite(n) && n > 0 ? n : 1;
}
function saveLevel(profileKey: string, n: number) {
    safeSet(`matLevel_${profileKey}`, String(n));
}
function loadProgress(profileKey: string): MatProgress {
    const raw = safeGet(`matProgress_${profileKey}`);
    if (!raw) return { netspring: [], headspring: [], vault: [] };
    try {
        return ensureProgress(JSON.parse(raw) as Partial<MatProgress>);
    } catch {
        return { netspring: [], headspring: [], vault: [] };
    }
}
function saveProgress(profileKey: string, p: MatProgress) {
    safeSet(`matProgress_${profileKey}`, JSON.stringify(p));
}
/** チェックポイントも profileKey で分離 */
const checkpointsKey = (profileKey: string) => `${LS_CHECKPOINTS}_${profileKey}`;
function loadCheckpoints(profileKey: string): CheckpointState {
    const raw = safeGet(checkpointsKey(profileKey));
    if (!raw) return {};
    try {
        return JSON.parse(raw) as CheckpointState;
    } catch {
        return {};
    }
}
function saveCheckpoints(profileKey: string, s: CheckpointState) {
    safeSet(checkpointsKey(profileKey), JSON.stringify(s));
}
function loadPets(profileKey: string): PetsState {
    const raw = safeGet(`matPets_${profileKey}`);
    if (!raw) return [];
    try {
        return JSON.parse(raw) as PetsState;
    } catch {
        return [];
    }
}
function savePets(profileKey: string, pets: PetsState) {
    safeSet(`matPets_${profileKey}`, JSON.stringify(pets));
}

/** ペット画像メタ */
const PET_META: Record<PetId, { label: string; img: string }> = {
    "pink-cat": { label: "ピンキー", img: "/images/pet1.jpeg" },
    "green-cat": { label: "グリーンキャット", img: "/images/pet2.jpeg" },
    "purple-biped": { label: "パープルキツネ", img: "/images/pet3.jpeg" },
    "orange-biped": { label: "キツネ", img: "/images/pet4.jpeg" },
    "hat-biped": { label: "キャップ", img: "/images/pet5.jpeg" },
    "yellow-biped": { label: "イエローキツネ", img: "/images/pet6.jpeg" },
    "purple-bird": { label: "パープルバード", img: "/images/pet7.jpeg" },
    "vault-medal1": { label: "台上前転メダル", img: "/images/medal1.png" },
    "vault-medal2": { label: "大きな台上前転メダル", img: "/images/medal2.png" },
    "vault-medal3": { label: "首はね跳びメダル", img: "/images/medal3.png" },
    "vault-medal4": { label: "頭はね跳びメダル", img: "/images/medal4.png" },
};

/** 技 → ペット報酬 */
function petRewardForTechnique(techId: string): PetId | null {
    switch (techId) {
        // マット（首&頭）
        case "front-roll":
            return "pink-cat";
        case "big-front-roll":
            return "green-cat";
        case "front-roll-bridge":
            return "purple-biped";
        case "stage-front-roll-bridge":
            return "orange-biped";
        case "tripod":
            return "hat-biped";
        case "tripod-bridge":
            return "yellow-biped";
        case "stage-tripod-bridge":
            return "purple-bird";

        // 跳び箱（Vault）
        case "vault-front-roll":
            return "vault-medal1";
        case "vault-big-front-roll":
            return "vault-medal2";
        case "vault-neck-spring":
            return "vault-medal3";
        case "vault-head-spring":
            return "vault-medal4";

        default:
            return null;
    }
}

export default function TechniquePage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = useUnwrap(params);
    const tech = byId(id); // null の可能性あり

    // ---- Hooks（無条件宣言）----
    const [playerName, setPlayerName] = useState("");
    const [selectedChar, setSelectedChar] = useState("");
    const [profileKey, setProfileKey] = useState("default__default");

    const [nameReady, setNameReady] = useState(false);
    const [progress, setProgress] = useState<MatProgress>({ netspring: [], headspring: [], vault: [] });
    const [level, setLevel] = useState(1);
    const [checks, setChecks] = useState<CheckpointState>({});
    const [pets, setPets] = useState<PetsState>([]);
    const [petModal, setPetModal] = useState<{ pet: PetId } | null>(null);
    const [levelUpModal, setLevelUpModal] = useState(false);
    const seRef = useRef<{ pet?: HTMLAudioElement; level?: HTMLAudioElement }>({});

    // 初期ロード（プロフィールキー作成／ロード／SE）
    useEffect(() => {
        if (!isBrowser()) return;

        const name = window.localStorage.getItem("matRpgPlayerName") ?? "";
        const char = window.localStorage.getItem("matRpgSelectedChar") ?? "";
        setPlayerName(name);
        setSelectedChar(char);

        const pk = `${name || "default"}__${char || "default"}`;
        setProfileKey(pk);

        setProgress(loadProgress(pk));
        setLevel(loadLevel(pk));
        setChecks(loadCheckpoints(pk));
        setPets(loadPets(pk));

        const pet = new Audio("/sounds/pet.mp3");
        const levelup = new Audio("/sounds/levelup.mp3");
        if (pet.canPlayType("audio/mpeg")) {
            pet.preload = "auto";
            pet.volume = 1.0;
            seRef.current.pet = pet;
        }
        if (levelup.canPlayType("audio/mpeg")) {
            levelup.preload = "auto";
            levelup.volume = 0.9;
            seRef.current.level = levelup;
        }

        setNameReady(true);
    }, []);

    // tech が存在しない場合は 404 相当へ
    useEffect(() => {
        if (!tech) {
            router.replace("/404");
        }
    }, [tech, router]);

    const playSE = (kind: "pet" | "level") => {
        const a = seRef.current[kind];
        if (!a) return;
        try {
            a.currentTime = 0;
            a.play().catch(() => { });
        } catch { }
    };

    // チェック配列の長さは tech がある場合のみ参照
    const checkpointsLen = tech?.checkpoints.length ?? 0;

    /** この技のチェック状態（存在しない/長さ違いを自動補正） */
    const techChecks: boolean[] = useMemo(() => {
        if (!tech) return [];
        const current = checks[id];
        if (current && current.length === checkpointsLen) return current;

        const init = Array(checkpointsLen).fill(false);
        if (!current) {
            const merged = { ...checks, [id]: init };
            setChecks(merged);
            saveCheckpoints(profileKey, merged);
            return init;
        } else if (current.length !== checkpointsLen) {
            const fixed = [...init].map((_, i) => Boolean(current[i]));
            const merged = { ...checks, [id]: fixed };
            setChecks(merged);
            saveCheckpoints(profileKey, merged);
            return fixed;
        }
        return current ?? init;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [checks, id, checkpointsLen, tech, profileKey]);

    /** 解禁判定（前の技までクリア済みか） */
    const unlocked = useMemo(() => {
        if (!tech) return false;
        const same = TECHNIQUES.filter((t) => t.stage === tech.stage).sort((a, b) => a.order - b.order);
        const prevIds = same.filter((t) => t.order < tech.order).map((t) => t.id);
        const base = ensureProgress(progress);
        const stageKey = tech.stage as StageKey;
        return prevIds.every((pid) => (base[stageKey] ?? []).includes(pid));
    }, [tech, progress]);

    const baseProgress = ensureProgress(progress);
    const stageKey = (tech?.stage ?? "netspring") as StageKey;
    const techniqueCleared = tech ? (baseProgress[stageKey] ?? []).includes(tech.id) : false;
    const allCheckCleared = techChecks.every(Boolean);

    // 全チェック達成で progress に反映
    useEffect(() => {
        if (!nameReady || !tech) return;
        if (allCheckCleared && !techniqueCleared) {
            const base = ensureProgress(progress);
            const updated: MatProgress = {
                ...base,
                [stageKey]: [...(base[stageKey] ?? []), tech.id],
            };
            setProgress(updated);
            saveProgress(profileKey, updated);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allCheckCleared, techniqueCleared, nameReady, tech, profileKey]);

    /** チェックポイントのクリア */
    const clearCheckpoint = (idx: number) => {
        if (!tech) return;
        if (!unlocked) {
            alert("前の技をクリアしてから挑戦してね！");
            return;
        }
        const current = techChecks;
        if (current[idx]) return;

        const next = [...current];
        next[idx] = true;

        const nextChecks = { ...checks, [id]: next };
        setChecks(nextChecks);
        saveCheckpoints(profileKey, nextChecks);

        // レベルアップ
        const nextLv = level + 1;
        setLevel(nextLv);
        saveLevel(profileKey, nextLv);
        setLevelUpModal(true);
        playSE("level");

        // 全部達成 → 技クリア記録＋ペット付与
        const willAllClear = next.every(Boolean);
        if (willAllClear) {
            const base = ensureProgress(progress);
            if (!(base[stageKey] ?? []).includes(tech.id)) {
                const updated: MatProgress = {
                    ...base,
                    [stageKey]: [...(base[stageKey] ?? []), tech.id],
                };
                setProgress(updated);
                saveProgress(profileKey, updated);
            }

            const pet = petRewardForTechnique(id);
            if (pet && !pets.includes(pet)) {
                const newPets = [...pets, pet];
                setPets(newPets);
                savePets(profileKey, newPets);
                playSE("pet");
                setPetModal({ pet });
            }
        }
    };

    // ステージ別の戻り先
    const exitPath = tech?.stage === "vault" ? "/tobibako-iland" : "/mat-iland";

    // tech 未解決の間は描画しない
    if (!tech) return null;

    return (
        <main className={styles.page}>
            <HUD />
            <div className={styles.bubbles}>
                <span />
                <span />
                <span />
            </div>
            <div className={styles.bg} />

            <section className={styles.container}>
                <header className={styles.header}>
                    <div className={styles.titles}>
                        <h1 className={styles.title}>{tech.title}</h1>
                        <p className={styles.subtitle}>
                            {playerName ? `${playerName} の挑戦` : "挑戦"}
                            {selectedChar ? `（${selectedChar}）` : ""} ／ レベル：{level}
                        </p>
                    </div>
                    <div className={styles.actions}>
                        <button className={styles.back} onClick={() => router.back()}>
                            ← もどる
                        </button>
                    </div>
                </header>

                <div className={styles.content}>
                    {/* 左：動画 */}
                    <div className={styles.media}>
                        {tech.video ? (
                            <video className={styles.video} controls playsInline>
                                <source src={tech.video} type="video/mp4" />
                            </video>
                        ) : (
                            <div className={styles.videoPlaceholder}>動画は準備中です</div>
                        )}
                    </div>

                    {/* 右：チェックポイント */}
                    <div className={styles.panel}>
                        <h2 className={styles.h2}>チェックポイント</h2>
                        <ul className={styles.checklist}>
                            {tech.checkpoints.map((c, i) => {
                                const done = techChecks[i];
                                return (
                                    <li key={i} className={`${styles.checkRow} ${done ? styles.done : ""}`}>
                                        <div className={styles.checkText}>
                                            <span className={styles.pointBadge}>{String(i + 1)}</span>
                                            <span>{c}</span>
                                        </div>
                                        <button
                                            className={styles.checkBtn}
                                            onClick={() => clearCheckpoint(i)}
                                            disabled={!unlocked || done}
                                            title={!unlocked ? "まだ解禁されていません" : done ? "クリア済み" : "クリア"}
                                        >
                                            {done ? "✅ クリア済み" : "クリア"}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            </section>

            {/* ペット獲得モーダル */}
            {petModal && (
                <div className={styles.modalOverlay} role="dialog" aria-modal="true">
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>新しい仲間！</h3>
                            <button className={styles.modalClose} onClick={() => router.push(exitPath)} aria-label="閉じる">
                                ×
                            </button>
                        </div>
                        <div className={styles.modalBodyCenter}>
                            <img className={styles.petBig} src={PET_META[petModal.pet].img} alt={PET_META[petModal.pet].label} />
                            <p className={styles.modalText}>{PET_META[petModal.pet].label} が仲間になった！</p>
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={styles.primary} onClick={() => router.push(exitPath)}>
                                やった！
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* レベルアップモーダル */}
            {levelUpModal && (
                <div className={styles.modalOverlay} role="dialog" aria-modal="true">
                    <div className={styles.modal}>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>レベルアップ！</h3>
                            <button className={styles.modalClose} onClick={() => setLevelUpModal(false)} aria-label="閉じる">
                                ×
                            </button>
                        </div>
                        <div className={styles.modalBodyCenter}>
                            <p className={styles.modalText}>レベル {level} になりました！</p>
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={styles.primary} onClick={() => setLevelUpModal(false)}>
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
