// src/components/HUD.tsx
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import styles from "./HUD.module.css";

type StageKey = "netspring" | "headspring" | "vault";
type MatProgress = Record<StageKey, string[]>;
type PetId =
    | "pink-cat" | "green-cat" | "purple-biped" | "orange-biped"
    | "hat-biped" | "yellow-biped" | "purple-bird"
    | "vault-medal1" | "vault-medal2" | "vault-medal3" | "vault-medal4";

const ensureProgress = (p?: Partial<MatProgress>): MatProgress => ({
    netspring: Array.isArray(p?.netspring) ? p!.netspring! : [],
    headspring: Array.isArray(p?.headspring) ? p!.headspring! : [],
    vault: Array.isArray(p?.vault) ? p!.vault! : [],
});

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

// 例: キャラID→画像（ID保存のみの場合のフォールバック）
const CHAR_IMAGE: Record<string, string> = {
    boy: "/images/char-boy.png",
    girl: "/images/char-girl.png",
    cat: "/images/char-cat.png",
};

export default function HUD() {
    const pathname = usePathname();
    const [name, setName] = useState("");
    const [char, setChar] = useState(""); // 画像パス or キャラID
    const [level, setLevel] = useState(1);
    const [pets, setPets] = useState<PetId[]>([]);
    const [progress, setProgress] = useState<MatProgress>({ netspring: [], headspring: [], vault: [] });

    const reloadFromStorage = useCallback(() => {
        const n = localStorage.getItem("matRpgPlayerName") ?? "";
        const c = localStorage.getItem("matRpgSelectedChar") ?? "";
        const charImgSaved = localStorage.getItem("matRpgSelectedCharImg"); // ← 最優先

        const pk = `${n || "default"}__${c || "default"}`;

        setName(n);
        setChar(charImgSaved || c);
        setLevel(parseInt(localStorage.getItem(`matLevel_${pk}`) ?? "1", 10) || 1);

        try {
            const rawP = localStorage.getItem(`matProgress_${pk}`);
            setProgress(ensureProgress(rawP ? JSON.parse(rawP) : undefined));
        } catch { }

        try {
            const rawPets = localStorage.getItem(`matPets_${pk}`);
            setPets(rawPets ? (JSON.parse(rawPets) as PetId[]) : []);
        } catch { }
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;
        reloadFromStorage();
    }, [reloadFromStorage, pathname]);

    useEffect(() => {
        const onStorage = () => reloadFromStorage();
        const onFocus = () => reloadFromStorage();
        window.addEventListener("storage", onStorage);
        window.addEventListener("visibilitychange", onFocus);
        window.addEventListener("focus", onFocus);
        return () => {
            window.removeEventListener("storage", onStorage);
            window.removeEventListener("visibilitychange", onFocus);
            window.removeEventListener("focus", onFocus);
        };
    }, [reloadFromStorage]);

    const avatarSrc = useMemo(() => {
        if (char.startsWith("/images/")) return char;
        if (CHAR_IMAGE[char]) return CHAR_IMAGE[char];
        return `/images/char-${char || "default"}.png`;
    }, [char]);

    const petCount = pets.filter((p) => !p.startsWith("vault-")).length;
    const medalCount = pets.filter((p) => p.startsWith("vault-")).length;
    const clearedTotal = useMemo(
        () => progress.netspring.length + progress.headspring.length + progress.vault.length,
        [progress]
    );

    return (
        <div className={styles.hud}>
            {/* バブル装飾 */}
            <div className={styles.bubbles} aria-hidden="true">
                <span /><span /><span />
            </div>

            <div className={styles.left}>
                <div className={styles.avatarWrap}>
                    <img className={styles.avatar} src={avatarSrc} alt="avatar" />
                    <span className={styles.levelBadge}>Lv {level}</span>
                </div>
                <div className={styles.meta}>
                    <div className={styles.name}>{name || "ななし"}</div>
                </div>
            </div>

            <div className={styles.center}>
                <span className={`${styles.pill} ${styles.pillPets}`}>🐾 仲間 {petCount}</span>
                <span className={`${styles.pill} ${styles.pillMedals}`}>🏅 メダル {medalCount}</span>
            </div>

            <div className={styles.right}>
                <div className={styles.thumbStrip} aria-label="仲間・メダル">
                    {pets.slice(0, 12).map((p) => {
                        const meta = PET_META[p];
                        const src = meta?.img || "/images/missing.png";
                        return (
                            <img
                                key={p}
                                className={`${styles.thumb} ${p.startsWith("vault-") ? styles.medal : styles.pet}`}
                                src={src}
                                alt={meta?.label || p}
                                title={meta?.label || p}
                            />
                        );
                    })}
                    {pets.length > 12 && <div className={styles.more}>+{pets.length - 12}</div>}
                </div>
            </div>
        </div>
    );
}
