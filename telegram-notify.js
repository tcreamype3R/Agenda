// 1. FUNCIÓN PARA ESCAPAR MARKDOWN (al inicio del archivo)
const escapeMarkdown = (text) => text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');

// 2. ICONOS POR ACCIÓN (constante global)
const actionIcons = {
  edit: '✏️',
  create: '🆕',
  delete: '❌',
  default: '📢'
};

export default async (req, res) => {
  // 3. VALIDACIONES INICIALES
  if (req.headers.authorization !== `Bearer ${process.env.API_SECRET}`) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { user, changes, actionType = 'default' } = req.body;

    // 4. PREPARACIÓN DEL MENSAJE CON FORMATO
    const icon = actionIcons[actionType] || actionIcons.default;
    const safeChanges = escapeMarkdown(changes);
    const safeUser = escapeMarkdown(user || 'Anónimo');

    const message = `${icon} *${actionType.toUpperCase()} en Agenda*\n\n` +
                   `• *Usuario:* ${safeUser}\n` +
                   `• *Cambios:* \`\`\`${safeChanges}\`\`\``;

    // 5. LOGS DE DEPURACIÓN (útil en desarrollo)
    console.log('Enviando a Telegram:', {
      chat_id: process.env.CHAT_ID,
      text: message.substring(0, 50) + '...',
      actionType
    });

    // 6. ENVÍO A TELEGRAM
    const response = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: process.env.CHAT_ID,
          text: message,
          parse_mode: 'MarkdownV2',
          ...(actionType === 'edit' && {
            reply_markup: {
              inline_keyboard: [[
                { text: "✅ Aprobar", callback_data: "approve" },
                { text: "❌ Rechazar", callback_data: "reject" }
              ]]
            }
          })
        }),
      }
    );

    if (!response.ok) throw new Error(await response.text());
    res.status(200).json({ success: true });

  } catch (error) {
    console.error('Error en Telegram API:', error);
    res.status(500).json({ 
      error: 'Error al notificar',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
