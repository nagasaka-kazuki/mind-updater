// src/index.tsx
import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import migrations from "./db/migration.json";
import { db } from "./lib/db";
import { Provider } from "jotai";

const MIGRATION_HASH_KEY = "drizzle_migration_hash";

// 最新のマイグレーションハッシュを取得
function getLatestMigrationHash() {
  if (!Array.isArray(migrations) || migrations.length === 0) {
    return null;
  }
  return migrations[migrations.length - 1].hash;
}

// ローカルストレージのハッシュと比較して、マイグレーションが必要かどうか
function isMigrationNeeded(): boolean {
  const latest = getLatestMigrationHash();
  const saved =
    typeof window !== "undefined"
      ? window.localStorage.getItem(MIGRATION_HASH_KEY)
      : null;
  return latest !== null && latest !== saved;
}

// マイグレーション実行＆ハッシュ保存
async function runMigrationIfNeeded(dbInstance: any) {
  const latest = getLatestMigrationHash();
  if (!latest) return;

  if (!isMigrationNeeded()) {
    console.log("[migrate] skip, hash matches:", latest);
    return;
  }

  console.log("[migrate] running migrations…");
  await dbInstance.dialect.migrate(migrations, (dbInstance as any).session, {
    migrationsTable: "drizzle_migrations",
  });

  // 成功したらローカルストレージに最新ハッシュを保存
  window.localStorage.setItem(MIGRATION_HASH_KEY, latest);
  console.log("[migrate] done, saved hash:", latest);
}

async function migrateAndRender() {
  try {
    // 必要ならマイグレーション実行
    console.time("migration");
    await runMigrationIfNeeded(db);
    console.timeEnd("migration");

    // React レンダリング
    console.time("render");
    const container = document.getElementById("root");
    if (!container) throw new Error("Root element not found");
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <Provider>
          <App />
        </Provider>
      </React.StrictMode>,
    );
    console.timeEnd("render");
  } catch (error) {
    console.error("Failed to migrate or render app:", error);
  }
}

migrateAndRender();
