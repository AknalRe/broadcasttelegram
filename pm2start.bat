@ECHO OFF
SET /P NamaFileJS=Masukkan nama file JavaScript (tanpa ekstensi .js): 
pm2 start %NamaFileJS%.js --no-daemon

REM Menunggu input dari pengguna sebelum melanjutkan
pause

REM Menjalankan pm2 logs
start pm2 logs %NamaFileJS%

echo Program dijalankan
echo Tekan tombol apa saja untuk menutup aplikasi...

pause

REM Menghentikan aplikasi dengan pm2 delete
pm2 delete all

pause