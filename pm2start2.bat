ECHO OFF
pm2 start app-v4.js --no-daemon
pm2 logs app-v4
echo Program dijalankan
echo Tekan tombol apa saja untuk menutup aplikasi...
PAUSE
pm2 delete app-v4
