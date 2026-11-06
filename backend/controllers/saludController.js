function salud(req, res) {
  res.json({
    estado: 'correcto',
    proyecto: 'JuegaprendeUMG',
    mensaje: 'Servidor funcionando correctamente'
  });
}

module.exports = { salud };
