const router = require('express').Router();
const {postHorario,
       postDiaHorario,
       deleteHorarioById,
       getDiasHorarioByUserId} = require('../controladores/horarios');

router.get('/', (req, res) => {
    res.send('Hello World')
}
);

router.post('/postHorario', postHorario);
router.post('/postDiaHorario', postDiaHorario);
router.delete('/deleteHorarioById/:id', deleteHorarioById);
router.get('/getDiasHorarioByUserId/:id', getDiasHorarioByUserId);

module.exports = router;

