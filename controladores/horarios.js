//Controlador para las peticiónes de horario y diaHorario
const {Horario} = require('../modelos/Horario');
const {DiaHorario} = require('../modelos/Horario');

//Crear horario
const postHorario = async (req, res) => {
    try {
        const { user_id, nombre, dias, tramoHorario } = req.body;

        // Crea el horario
        const horario = await Horario.create({
            user_id,
            nombre,
            dias: [],
            tramoHorario
        });

        // Agrega los días al horario
        const diasHorario = await Promise.all(
            dias.map(async (dia) => {
                const { diaSemana, activo, tramoHorario } = dia;
                const nuevoDia = await DiaHorario.create({
                    diaSemana,
                    activo,
                    tramoHorario,
                    horario: horario._id
                });
                // Agrega el día al horario
                horario.dias.push(nuevoDia._id);
                return nuevoDia;
            })
        );

        // Guarda el horario con los días
        await horario.save();

        res.status(201).json({
            success: true,
            horario,
            diasHorario
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error al crear el horario y sus días correspondientes'
        });
    }
};
//Crear diaHorario

const postDiaHorario = async (req, res) => {
    const { diaSemana, activo, tramoHorario } = req.body;
    const userId = req.headers['user-id']; // obtenemos el user_id de la cabecera
    console.log("--------------------------------------------")
    console.log(req.headers)
    try {
        const nuevoDiaHorario = new DiaHorario({
            diaSemana,
            activo,
            tramoHorario,
            userId // incluimos el user_id en el objeto a guardar
        });

        await nuevoDiaHorario.save();

        res.status(201).json({ mensaje: 'Registro de día y horario creado con éxito.' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ mensaje: 'Hubo un error al crear el registro de día y horario.' });
    }
};

// Delete Horario
const deleteHorarioById = async (req, res) => {
    const horarioId = req.params.id;

    try {
        // Busca el horario a eliminar
        const horario = await Horario.findById(horarioId);

        if (!horario) {
            return res.status(404).json({ mensaje: 'Horario no encontrado' });
        }

        // Elimina los días de horario asociados
        await DiaHorario.deleteMany({ horario: horarioId });

        // Elimina el horario
        await horario.remove();

        res.status(200).json({ mensaje: 'Horario eliminado con éxito' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al eliminar el horario' });
    }
};

// Get Dias Horario By User Id
const getDiasHorarioByUserId = async (req, res) => {
    const usuarioId = req.params.id; // asumiendo que el id del usuario se recibe como parámetro en la ruta
    try {
        const horarios = await Horario.find({ usuario: usuarioId }); // obtener los horarios del usuario
        let diasHorario = []; // arreglo donde se guardarán los días de horario

        // para cada horario encontrado, buscar sus días de horario y agregarlos al arreglo
        for (let horario of horarios) {
            const dias = await DiaHorario.find({ horario: horario._id });
            diasHorario.push({
                horario: horario,
                dias: dias,
            });
        }

        // buscar los días de horario que no pertenecen a ningún horario y agregarlos al arreglo
        const diasSinHorario = await DiaHorario.find({ horario: null });
        diasHorario.push({

            diasSueltos: diasSinHorario,
        });

        res.status(200).json({
            ok: true,
            diasHorario: diasHorario,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            mensaje: "Error al obtener los días de horario del usuario",
        });
    }
};


//exportamos las funciones
module.exports = {
    postHorario,
    postDiaHorario,
    deleteHorarioById,
    getDiasHorarioByUserId
}


