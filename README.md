# 독서 인물 관계도 창작 도구

학생이 직접 인물 카드를 만들고, 얼굴을 그리거나 사진을 올리고,
인물 간 관계선을 그어 설명을 적는 자기주도형 독서 활동 웹앱입니다.

## 로컬 실행
```bash
npm install
npm run dev
```

## GitHub Pages로 배포하기
1. GitHub에 새 저장소를 만듭니다 (예: book-character-map).
2. `vite.config.js`의 `base`를 저장소 이름으로 바꿉니다: `base: "/book-character-map/"`
3. 아래 명령을 실행합니다.
```bash
git init
git add .
git commit -m "첫 커밋: 인물 관계도 창작 도구"
git branch -M main
git remote add origin https://github.com/<사용자이름>/book-character-map.git
git push -u origin main

npm install --save-dev gh-pages
npm run build
npx gh-pages -d dist
```
4. GitHub 저장소 Settings → Pages에서 배포된 gh-pages 브랜치를 소스로 지정하면
   `https://<사용자이름>.github.io/book-character-map/` 주소로 접속할 수 있습니다.
