const TelegramBot = require('node-telegram-bot-api');
const { google } = require('googleapis');
const readline = require('readline');
const moment = require('moment-timezone');
require('dotenv').config();

moment.tz.setDefault('Asia/Jakarta');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let telegramAPIKey = process.env.TELEGRAM_API_KEY || '';
let spreadsheetId = process.env.SPREADSHEET_ID || '';
let sheetName = process.env.SHEET_NAME || '';
let targetTelegramID = process.env.TARGET_TELEGRAM_ID || '';
let intervalwaktukirim = process.env.INTERVAL_WAKTU_KIRIM || '';
let intervalnotif = process.env.INTERVAL_NOTIF || '';
let telegramnotif = process.env.TELEGRAM_NOTIF || '';
let infokolomgambar= '';
let waktusekarang = '';

const author = {
  name: 'AknalRe',
  description: 'Open Source, Silakan Berkreasi',
};

console.log('\nInformasi AUTHOR:');
console.log(`Nama: \x1b[31m${author.name}\x1b[0m`);
console.log(`Deskripsi: ${author.description}`);
console.log(`\nCopy dan Atur File .env agar tidak melakukan input data setiap menjalankan program`);

console.log(`\n\x1b[31mPenyiapan/Pembuatan Bot :\n1.\tBuka Telegrammu dan cari username @BotFather.\n2.\tLalu Kirimkan /start.\n3.\tLalu ikuti informasi dan intruksi yang tertera.\x1b[0m\n`)

if (
  !telegramAPIKey || !spreadsheetId || !sheetName || !targetTelegramID || !intervalwaktukirim || !intervalnotif || !telegramnotif
) {
  rl.question('Masukkan API Telegram: ', (api) => {
    telegramAPIKey = api;
    console.log(`\n(Spreadsheet ID Setelah https://docs.google.com/spreadsheets/d/ dan Sebelum /edit#gid)\n\x1b[31mPetunjuk Spreadsheet :\n1.\tAtur Spreadsheet yang digunakan dapat di akses oleh semua orang yang memiliki link\n2.\tAtur Mulai Kolom A2 dengan data contoh 01:30 sebagai acuan waktu pengiriman pesan broadcast telegram.\n3.\tAtur Mulai Kolom B2 dengan data link gambar dengan link akhir terdapat ekstensi file gambarnya dan dapat diakses secara publik.\n\tcontoh :\thttps://png.pngtree.com/png-vector/20230531/ourlarge/pngtree-cute-sunflower-coloring-page-vector-png-image_6788876.png\n4.\tAtur mulai dari kolom C2 dengan data pesan yang dikirimkan.\n4.\tSediakan Kolom D dengan nilai kosong atau tidak ada nilai.\x1b[0m\n\nContoh Spreadsheet :\thttps://docs.google.com/spreadsheets/d/1SqAsy1XOmhHELEW0RuNIDML_ZGERxs0GYy_nxfAoB-E/edit?usp=sharing\n`);
    console.log(`\n\x1b[31mLangka Penyiapan Bot Agar Dapat Mengirimkan Pesan ke Channel :\n1.\tTambahkan Bot Telegram ke Channel.\n2.\tAtur Bot Telegram menjadi Role ADMIN.\n3.\tAtur Privilage Bot Agar dapat mengirimkan Pesan\x1b[0m\n`);
    rl.question('Masukkan Spreadsheet ID: ', (id) => {
      spreadsheetId = id;
      rl.question('Masukkan Sheet Name: ', (name) => {
        sheetName = name;
        rl.question('Masukkan Target Broadcast ID Telegram atau Channel Link(Contoh : @TestAutoUpdate) : ', (target) => {
          targetTelegramID = target;
          rl.question('Masukkan Target Telegram Yang Akan dikirimkan Notif Gagal Atau Kesalahan : ', (targetnotif) => {
            telegramnotif = targetnotif;
            rl.question('Masukkan Interval Waktu Pengecekan Data Broadcast (1 untuk 1 menit): ', (interval) => {
              intervalwaktukirim = interval;
              rl.question('Masukkan Interval Notif Untuk Perbarui Bank Data Harga (1 untuk 1 menit): ', (notifinterval) => {
                intervalnotif = notifinterval;
                rl.question('\n\n\x1b[31mSudah terkonfigurasi semua? (ya atau tidak): \x1b[0m', (konfigurasi) => {
                  if (konfigurasi.toLowerCase() === 'ya' || konfigurasi.toLowerCase() === 'y') {
                    startBot();
                  } else {
                    console.log('\x1b[31mLengkapi dan ikuti instruksi yang tertera agar program berjalan dengan normal. Program ditutup.\x1b[0m');
                    rl.close();
                  }
                });
              });
            });
          });
        });
      });
    });
  });
} else {
  console.log(`Data Di ENV :\n- telegramAPIKey\t: ${telegramAPIKey}\n- spreadsheetId\t: ${spreadsheetId}\n- sheetName\t: ${sheetName}\n- targetTelegramID\t: ${targetTelegramID}\n- telegramnotif\t: ${telegramnotif}\n- intervalwaktukirim\t: ${intervalwaktukirim} Menit\n- intervalnotif\t: ${intervalnotif} Menit`);
  startBot();
}

function startBot() {
  intervalwaktukirim = (intervalwaktukirim * 60 * 1000).toString();
  intervalnotif = (intervalnotif * 60 * 1000).toString();
  console.log(`\n\x1b[31mProgram Broadcast Telegram Berjalan\x1b[0m\n`);

  const bot = new TelegramBot(telegramAPIKey, {
    polling: true,
  });

  const sheets = google.sheets('v4');
  const sheetsAuth = new google.auth.GoogleAuth({
    keyFile: './credentials.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  function kirimPesan(chatId, pesan) {
    bot.sendMessage(chatId, pesan);
  }

  function kirimPesanGambar(chatId, pesan, gambar, infokolomgambar) {
    bot.sendPhoto(chatId, gambar, { caption: pesan })
      .then(() => {
      })
      .catch((error) => {
        let waktusekarang = moment().format('DD:MM:YYYY HH:mm:ss', { locale: 'id' });
        let pesaninfo = `${waktusekarang}\nNotif Broadcast Telegram\n\nTerjadi kesalahan saat mengirim pesan dengan gambar ${infokolomgambar}:\n${error}\n\nTerimakasih`
        kirimPesan(telegramnotif, pesaninfo);
        console.error(`${waktusekarang} ---- Terjadi kesalahan saat mengirim pesan dengan gambar:`);
      });
  }
  
  kirimPesan(telegramnotif, "Program Broadcast Telegram Berjalan");

  async function bacaDataSpreadsheet() {
    try {
      const waktuSaatIni = moment().format('DD:MM:YYYY HH:mm:ss', { locale: 'id' });
      console.log(`${waktuSaatIni} ---- \x1b[32mPengecekan Data Waktu Kirim Berjalan\x1b[0m`);
      const authClient = await sheetsAuth.getClient();
      const sheetsInstance = google.sheets({ version: 'v4', auth: authClient });
      const rangeJamMenit = `${sheetName}`;
      const Data = await sheetsInstance.spreadsheets.values.get({
        spreadsheetId,
        range: rangeJamMenit,
      });

      const DataValues = Data.data.values;

      if (DataValues.length) {
        for (let i = 1; i < DataValues.length; i++) {
          waktusekarang = moment().format('DD:MM:YYYY HH:mm:ss', { locale: 'id' });
          const jamMenit = DataValues[i][0];
          if (jamMenit && jamMenit !== 'undefined') {
            const [jamKolom, menitKolom] = jamMenit.split(':');
            const gambar = DataValues[i][1];
            const pesan = DataValues[i][2];

            const jamKolomInt = parseInt(jamKolom, 10);
            const menitKolomInt = parseInt(menitKolom, 10);

            const waktuSaatIni = new Date();
            const jamSaatIni = waktuSaatIni.getHours();
            const menitSaatIni = waktuSaatIni.getMinutes();

            if (jamKolomInt === jamSaatIni && menitKolomInt === menitSaatIni) {
              console.log(`${waktusekarang} ---- \x1b[33mData Waktu Sama Berhasil Ditemukan\x1b[0m`);
              
              if (pesan.length < 1024) {
                if (!gambar || gambar === '') {
                  await kirimPesan(targetTelegramID, pesan);
                } else {
                  infokolomgambar = `Kolom B${i + 1}`
                  await kirimPesanGambar(targetTelegramID, pesan, gambar, infokolomgambar);
                }
              } else {
                if (!gambar || gambar === '') {
                  console.log(`\x1b[31mPesan Lebih dari 1024 karakter, mencoba mengirimkan pesan tanpa gambar.\x1b[0m`);
                  await kirimPesan(targetTelegramID, pesan);
                } else {
                  console.log(`\x1b[31mPesan Lebih dari 1024 karakter, mencoba mengirimkan pesan tanpa gambar.\x1b[0m`);
                  await kirimPesan(targetTelegramID, pesan);
                }
                let pesaninfo = `${waktusekarang}\nNotif Broadcast Telegram\n\nLink Spreadsheet : https://docs.google.com/spreadsheets/d/${spreadsheetId}/ \n\nSheetName : ${sheetName}\n\nData Pada Kolom C${i + 1} Pesan Terlalu panjang, Jika pesan tidak berhasil dikirimkan. Silakan kirimkan secara manual\n\nTerimakasih`;
                await kirimPesan(telegramnotif, pesaninfo);
                // console.log('Update: ' + moment().format('DD-MM-YYYY HH:mm:ss', { locale: 'id' }));
                // await sheetsInstance.spreadsheets.values.update({
                //     spreadsheetId,
                //     range: `${sheetName}!D${i + 1}`,
                //     valueInputOption: 'RAW',
                //     resource: { values: [['Sudah Dikirimkan']] },
                // });
              }
            } else {
              // console.log(`${waktusekarang} ---- Data Waktu Sama Tidak Ditemukan`);
            }
          } else {
            console.log(`${waktusekarang} ---- Tidak Ada Data untuk Waktu Kirim pada Kolom A${i + 1}`)
          }
        }
      }
      const waktuSaatIni2 = moment().format('DD:MM:YYYY HH:mm:ss', { locale: 'id' });
      console.log(`${waktuSaatIni2} ---- \x1b[31mPengecekan Data Waktu Kirim Berhenti\x1b[0m`);
    } catch (error) {
      const waktuSaatIni3 = moment().format('DD:MM:YYYY HH:mm:ss', { locale: 'id' });
      let pesaninfo = `${waktuSaatIni3}\nNotif Broadcast Telegram\n\nGagal membaca data dari spreadsheet: ${error}\n\nTerimakasih`
      kirimPesan(telegramnotif, pesaninfo);
      console.error('Gagal membaca data dari spreadsheet:', error);
      console.log(`${waktuSaatIni3} ---- \x1b[31mPengecekan Data Waktu Kirim Berhenti\x1b[0m`);
    }
  }

  bacaDataSpreadsheet();
  setInterval(bacaDataSpreadsheet, intervalwaktukirim);

  async function notif() {
    try {
      const waktuSaatIni3 = moment().format('DD:MM:YYYY HH:mm:ss', { locale: 'id' });
      console.log(`${waktuSaatIni3} ---- \x1b[34mNotif Telegram di kirimkan\x1b[0m`)
      let waktusekarang = moment().format('DD:MM:YYYY HH:mm:ss', { locale: 'id' });
      let pesaninfo = `${waktusekarang}\nNotif Broadcast Telegram\n\nLink Spreadsheet : https://docs.google.com/spreadsheets/d/${spreadsheetId}/ \n\nSilakan lakukan pembaruan bank data harga agar data broadcast valid dengan data baru\n\nTerimakasih`
      await kirimPesan(telegramnotif, pesaninfo);
    } catch (error) {
      console.error('Terjadi kesalahan dalam mengirim notifikasi:', error);
    }
  }

  setInterval(notif, intervalnotif);
}

process.on('SIGINT', () => {
  // bot.sendMessage(telegramnotif, "Program Broadcast Telegram Dihentikan");
  console.log('\n\x1b[31mProgram Broadcast Telegram Dihentikan\x1b[0m');
  process.exit(0);
});
