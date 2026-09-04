// Эта серверная функция запускается на Vercel, а не в браузере — поэтому
// сюда можно безопасно положить секретные ключи (через переменные окружения),
// и покупатель никогда их не увидит.
//
// СЕЙЧАС: функция просто подтверждает получение заказа (заглушка).
// СЛЕДУЮЩИЙ ШАГ (когда будут готовы ключи ЮKassa):
//   1. Здесь будет вызов ЮKassa API для создания платежа
//   2. ЮKassa вернёт ссылку на оплату (confirmationUrl)
//   3. Мы отправим её обратно в приложение, и покупателя перекинет на оплату
//   4. Отдельным вебхуком ЮKassa сообщит нам, что оплата прошла —
//      тогда мы обновим статус заказа в Supabase и пришлём уведомление в Telegram

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const order = req.body;

  // TODO: сохранить order в Supabase (таблица orders)
  // TODO: создать платёж в ЮKassa, используя process.env.YOOKASSA_SHOP_ID и process.env.YOOKASSA_SECRET_KEY
  // TODO: отправить уведомление о новом заказе в Telegram через process.env.TELEGRAM_BOT_TOKEN

  console.log('Новый заказ (заглушка, ещё не сохраняется):', order);

  return res.status(200).json({
    ok: true,
    message: 'Заказ получен (тестовый режим, оплата ещё не подключена)',
    // confirmationUrl: 'https://...' // появится после подключения ЮKassa
  });
}
