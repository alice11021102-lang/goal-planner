# 💰 目標理財規劃器

以 PV／FV／PMT 為核心的理財目標試算網站：設定目標後，反推每月需投入金額、所需本金與報酬率，並提供建議。
純靜態網站（HTML + CSS + JavaScript），無需建置，無外部相依。

## 專案結構
```
goal-planner/
├── index.html   # 頁面
├── style.css    # 樣式（支援深色模式）
├── app.js       # 計算與渲染邏輯
├── README.md
└── .gitignore
```

## 本機預覽
直接用瀏覽器開啟 `index.html`，或執行 `python3 -m http.server 8000` 後開啟 http://localhost:8000

## 部署到 Cloudflare Pages（連結 GitHub）
1. 將此資料夾內容推上 GitHub repo（見下方指令）。
2. Cloudflare 後台 → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**。
3. 選擇該 repo，**Framework preset** 選 `None`。
4. **Build command** 留空；**Build output directory** 填 `/`（或留空）。
5. 按 **Save and Deploy**，完成後取得 `https://<專案名>.pages.dev`。
之後每次 `git push` 都會自動重新部署。

## 推上 GitHub
```bash
cd goal-planner
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<你的帳號>/<repo名稱>.git
git push -u origin main
```

## 公式
r = 年報酬率 ÷ 12，n = 年數 × 12，g = (1+r)^n
- FV = PV·g + PMT·(g−1)/r
- PMT = (FV − PV·g)·r/(g−1)
- PV = FV/g − PMT·(1−1/g)/r

> 本工具僅供試算與教育用途，不構成投資建議。
