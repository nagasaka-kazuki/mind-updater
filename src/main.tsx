// src/index.tsx
import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import migrations from './db/migration.json'
import { db } from './lib/db'
import { Provider } from 'jotai'

async function migrateAndRender() {
  try {
    // マイグレーションを実行
    await (db as any).dialect.migrate(migrations, (db as any).session, {
      migrationsTable: 'drizzle_migrations',
    })

    // ルート要素取得
    const container = document.getElementById('root')
    if (!container) {
      throw new Error('Root element not found')
    }

    // React アプリをレンダリング
    const root = createRoot(container)
    root.render(
      <React.StrictMode>
        <Provider>
        <App />
        </Provider>
      </React.StrictMode>
    )
  } catch (error) {
    console.error('Failed to migrate or render app:', error)
  }
}

// エントリポイント実行
migrateAndRender()
