export default async (req, res) => {
  const { callback_query } = req.body;
  console.log('Botón pulsado:', callback_query.data);
  // Lógica para aprobar/rechazar
  res.status(200).end();
};
