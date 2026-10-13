КАК ЗАГРУЗИТЬ И ЗАПУСТИТЬ НА СЕРВЕРЕ (через Termius)

1. Скачайте эту папку целиком (3 файла: package.json, index.js, env-example.txt)

2. В Termius откройте нужный Host -> в правом/нижнем меню найдите SFTP
   (иконка папки рядом с терминалом, или свайп в сторону в мобильном приложении).
   Это отдельный файловый менеджер поверх того же SSH-подключения.

3. Через SFTP создайте на сервере папку, например:
   /root/smartsender-proxy

4. Перетащите/загрузите в неё 3 файла:
   - package.json
   - index.js
   - env-example.txt

5. Переименуйте env-example.txt в .env прямо в SFTP-менеджере Termius
   (или через терминал: mv env-example.txt .env)

6. Откройте .env и впишите ваш РЕАЛЬНЫЙ webhook URL от TheDinator
   вместо примера (без "?user_id=..." в конце, только часть до "?").

7. Вернитесь в терминал Termius, перейдите в папку и выполните команды:

   cd ~/smartsender-proxy
   sudo apt update
   sudo apt install -y nodejs npm
   npm install
   sudo npm install -g pm2
   pm2 start index.js --name smartsender-proxy
   pm2 save
   pm2 startup
   (выполните команду, которую выведет pm2 startup)

8. Проверка:
   curl http://localhost:3000/
   -> должно вернуть "Server running"

9. Откройте порт наружу (если нужно):
   sudo ufw allow 3000
   sudo ufw status

10. Тест запроса:
    curl -X POST http://ВАШ_СЕРВЕР:3000/api/smartsender-hook \
      -H "Content-Type: application/json" \
      -d '{"telegramId": "111222333", "subscriberId": "test-value"}'

11. Смотреть логи:
    pm2 logs smartsender-proxy --lines 30

В SmartSender, в блоке "Внешний запрос", указывайте URL:
http://ВАШ_СЕРВЕР:3000/api/smartsender-hook
(или https://ВАШ_СЕРВЕР/api/smartsender-hook, если настроен Nginx + SSL)
