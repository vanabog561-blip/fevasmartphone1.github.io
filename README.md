# FeraPhone — учебный магазин телефонов

Vanilla HTML/CSS/JS + Firebase Authentication + Firestore. Структура проекта сохранена: index.html, auth.html, detail.html, cabinet.html, admin.html, css/, js/, firestore.rules.

## Firebase через обычные script
Во всех HTML Firebase подключён через CDN compat:
- firebase-app-compat.js
- firebase-auth-compat.js
- firebase-firestore-compat.js

В `js/firebase.js` вставьте конфигурацию своего Web App.

## Firestore
Коллекции:
- `users` — профили и роли
- `products` — телефоны
- `users/{uid}/saved` — избранное
- `products/{productId}/reviews` — оценки
- `history` — история действий и покупок

## Администратор
После регистрации откройте Firestore → users → документ своего UID и измените `role` с `user` на `admin`.

## Запуск
Откройте `index.html` через Live Server в VS Code.

## Каталог
Поиск работает через `searchTokens`, фильтрация по бренду, сортировка по дате/рейтингу/цене, пагинация и real-time блок новых поступлений.
