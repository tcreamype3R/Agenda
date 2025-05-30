export default async (req, res) => {
  // 1. Validación de seguridad
  if (req.headers.authorization !== `Bearer ${process.env.API_SECRET}`) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { user, changes, actionType } = req.body;

    // 2. Formateo avanzado del mensaje
    const message = `📅 *${actionType === 'edit' ? 'Edición' : 'Nueva entrada'} en Agenda*\n\n` +
                   `• *Usuario:* ${user || 'Anónimo'}\n` +
                   `• *Cambios:* \`\`\`${changes}\`\`\``;

    // 3. Configuración de botones (solo para acciones que requieran aprobación)
    const replyMarkup = actionType === 'edit' ? {
      reply_markup: {
        inline_keyboard: [[
          { text: "✅ Aprobar", callback_data: "approve" },
          { text: "❌ Rechazar", callback_data: "reject" }
        ]]
      }
    } : {};

    // 4. Envío a Telegram
    const response = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: process.env.CHAT_ID,
          text: message,
          parse_mode: 'MarkdownV2',
          ...replyMarkup
        }),
      }
    );

    if (!response.ok) throw new Error(await response.text());
    res.status(200).json({ success: true });

  } catch (error) {
    console.error('Error en Telegram API:', error);
    res.status(500).json({ error: 'Error al notificar' });
  }
};
