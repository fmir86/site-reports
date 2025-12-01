"use client";

import { useRouter } from "next/navigation";
import styles from "@/styles/pages/Sites.module.scss";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button onClick={handleLogout} className={styles.logoutButton}>
      Sign Out
    </button>
  );
}
