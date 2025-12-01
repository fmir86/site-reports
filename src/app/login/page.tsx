import { Suspense } from "react";
import LoginForm from "@/components/LoginForm";
import styles from "@/styles/pages/Login.module.scss";

function LoginLoading() {
  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <div className={styles.logo}>
          <h1 className={styles.logoText}>WP Site Reports</h1>
          <p className={styles.logoSubtext}>Loading...</p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <div className={styles.logo}>
          <h1 className={styles.logoText}>WP Site Reports</h1>
          <p className={styles.logoSubtext}>Enter password to continue</p>
        </div>

        <Suspense fallback={<LoginLoading />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
