"use client";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function TitlePage() {
  const router = useRouter();
  const handleStart = () => {
    router.push("/character-select");
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.mainTitle}>フワクルアドベンチャー</h1>
      <h2 className={styles.subTitle}>
        友達とアドバイスし合ってレベルアップを目指せ！
      </h2>
      <button className={styles.startBtn} onClick={handleStart}>
        スタート
      </button>
    </div>
  );
}
