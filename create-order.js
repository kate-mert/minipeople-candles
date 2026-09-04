// Эта серверная функция запускается на Vercel, а не в браузере — поэтому
// сюда можно безопасно положить секретные ключи (через переменные окружения),
// и покупатель никогда их не увидит.
//
// СЕЙЧАС: при каждом заказе бот присылает тебе сообщение в Telegram со всеми деталями.
// СЛЕДУЮЩИЙ ШАГ (когда будут готовы ключи ЮKassa):
//   1. Здесь появится вызов ЮKassa API для создания платежа
//   2. ЮKassa вернёт ссылку на оплату (confirmationUrl)
//   3. Мы отправим её обратно в приложение, и покупателя перекинет на оплату
//   4. Отдельным вебхуком ЮKassa сообщит нам, что оплата прошла —
//      тогда обновим статус заказа и, возможно, продублируем уведомление

// Словарь id → название, чтобы уведомление было читаемым, а не «white», «moroccan-cashmere» и т.п.
// Если добавляешь новый цвет/аромат/деталь в index.html — продублируй название и сюда.
const NAMES = {
  minipeople: 'Свеча MiniPeople', notnormal: 'Свеча NotNorMal',
  white: 'Белый', sand: 'Песочный', 'neon-yellow': 'Неоновый жёлтый', pink: 'Розовый',
  red: 'Красный', periwinkle: 'Васильковый', blue: 'Синий', green: 'Зелёный',
  grey: 'Серый', charcoal: 'Графит',
  chrome: 'Хромированные детали', mono: 'Моноцвет',
  wood: 'Деревянный фитиль', cotton: 'Хлопковый фитиль',
  'moroccan-cashmere':'Moroccan Cashmere', 'green-route':'Green Route', 'macaron-shop':'Macaron Shop',
  'christmas-bakeshop':'Christmas Bakeshop', 'spritz-mode':'Spritz Mode', 'fijian-pineapple':'Fijian Pineapple',
  'orange-blossom-marshmallow':'Orange Blossom Marshmallow', 'jamaica-me-crazy':'Jamaica Me Crazy',
  'day-at-the-spa':'Day at the Spa', 'royal-melon-fizz':'Royal Melon Fizz', 'cozy-cashmere':'Cozy Cashmere',
  'coconut-lime':'Coconut Lime', 'peach-nectar':'Peach Nectar', 'rice-milk-and-oats':'Rice Milk And Oats',
  'moonlit-silk':'Moonlit Silk', 'pink-watermelon-lemonade':'Pink Watermelon Lemonade',
  'chamomile-tea':'Chamomile Tea', 'japanese-cherry-blossom':'Japanese Cherry Blossom',
};
const nm = id => NAMES[id] || id || '—';

function formatOrderMessage(order){
  const lines = [`🕯 Новый заказ!`, ``];

  if(order.branch === 'candle'){
    lines.push(`Тип: Свеча`);
    lines.push(`Модель: ${nm(order.container)}`);
    lines.push(`Цвет: ${nm(order.color)}`);
    lines.push(`Детали: ${nm(order.finish)}`);
    lines.push(`Аромат: ${nm(order.fragrance)}`);
    lines.push(`Фитиль: ${nm(order.wick)}`);
  } else {
    lines.push(`Тип: Подсвечник + набор из 5 ароматов`);
    lines.push(`Цвет подсвечника: ${nm(order.holderColor)}`);
    lines.push(`Ароматы: ${(order.holderFragrances || []).map(nm).join(', ') || '—'}`);
  }

  lines.push(``);
  lines.push(`Итого: ${order.price || '—'}₽`);
  lines.push(``);
  lines.push(`Имя: ${order.name || '—'}`);
  lines.push(`Телефон: ${order.phone || '—'}`);
  lines.push(`Почта: ${order.email || '—'}`);

  return lines.join('\n');
}

async function sendTelegramNotification(order){
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if(!token || !chatId){
    console.warn('TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID не заданы в Environment Variables на Vercel — уведомление не отправлено');
    return;
  }
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  await fetch(url, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({
      chat_id: chatId,
      text: formatOrderMessage(order),
    }),
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const order = req.body;

  // TODO: сохранить order в Supabase (таблица orders) — следующий этап
  // TODO: создать платёж в ЮKassa, используя process.env.YOOKASSA_SHOP_ID и process.env.YOOKASSA_SECRET_KEY

  try{
    await sendTelegramNotification(order);
  }catch(e){
    console.error('Не удалось отправить уведомление в Telegram:', e);
  }

  return res.status(200).json({
    ok: true,
    message: 'Заказ получен, уведомление отправлено (оплата пока в тестовом режиме)',
    // confirmationUrl: 'https://...' // появится после подключения ЮKassa
  });
}
