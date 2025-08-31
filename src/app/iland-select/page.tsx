"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

type IslandKey = "mat" | "tobi";

const ISLANDS: Record<
  IslandKey,
  {
    title: string;
    img: string;
    route: string;
  }
> = {
  mat: {
    title: "マットアイランド",
    img: "/images/matiland.jpeg",
    route: "/mat-iland",
  },
  tobi: {
    title: "跳び箱アイランド",
    img: "/images/tobiiland.jpeg",
    route: "/tobibako-iland",
  },
};

export default function SelectTechniqueTop() {
  const router = useRouter();
  const [playerName, setPlayerName] = useState<string>("");
  const [selectedChar, setSelectedChar] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const name = localStorage.getItem("matRpgPlayerName") ?? "";
    const char = localStorage.getItem("matRpgSelectedChar");
    setPlayerName(name);
    setSelectedChar(char);
    setIsLoaded(true);
  }, []);

  const canProceed = useMemo(
    () => playerName.trim().length > 0 && !!selectedChar,
    [playerName, selectedChar]
  );

  useEffect(() => {
    if (isLoaded && !canProceed) router.replace("/");
  }, [canProceed, isLoaded, router]);

  const enterIsland = (key: IslandKey) => {
    router.push(ISLANDS[key].route);
  };

  return (
    <main className={styles.page}>
      {/* 背景動画 */}
      <div className={styles.bg}>
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className={styles.video}
          aria-hidden="true"
        >
          <source src="https://rnzvo6xhryv0fkxz.public.blob.vercel-storage.com/cloud.mp4" type="video/mp4" />
        </video>
        <div className={styles.bgShade} aria-hidden="true" />
      </div>

      <section className={styles.card}>
        <header className={styles.header}>
          <div className={styles.titles}>
            <h1 className={styles.title}>島を選ぼう</h1>
          </div>
        </header>

        <div className={styles.grid}>
          {Object.entries(ISLANDS).map(([key, island]) => {
            const k = key as IslandKey;
            return (
              <button
                key={k}
                type="button"
                className={styles.island}
                onClick={() => enterIsland(k)}
                aria-label={`${island.title} を選ぶ`}
              >
                <div className={styles.imageWrap}>
                  <div className={styles.nameRibbon}>{island.title}</div>
                  <img src={island.img} alt={island.title} className={styles.image} />
                </div>
              </button>
            );
          })}
        </div>

        <footer className={styles.footer}>
          <button className={styles.backBtn} onClick={() => router.push("/character-select")}>
            ← キャラ選択に戻る
          </button>
        </footer>
      </section>
    </main>
  );
}
