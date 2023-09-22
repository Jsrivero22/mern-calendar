const { request, response } = require("express");
const Evento = require("../models/Evento");


const getEventos = async ( req = request, resp = response ) => {

    const eventos = await Evento.find()
                                .populate('user', 'name')

    resp.status(200).json({
        ok: true,
        eventos
    });
}

const crearEvento = async ( req = request, resp = response ) => {

    const evento = await new Evento( req.body );

    try {

        evento.user = req.uid;

        const newCreated = await evento.save()

        resp.status(200).json({
            ok: true,
            evento: newCreated
        });

    } catch (error) {
        console.log(error);
        resp.status(500).json({
            ok: false,
            message: 'Hable con el administrador'
        });
    }
}

const actualizarEvento = async ( req = request, resp = response ) => {

    const eventoId = req.params.id;
    const uid = req.uid;

    let evento;
    try {
        evento = await Evento.findById(eventoId);
    } catch (err) {
        evento = null;
    }

    try {

        if ( !evento ) {
            resp.status(404).json({
                ok: false,
                message: 'Evento no existe por ese id'
            });
        }

        if ( evento.user.toString() !== uid ) {
            return resp.status(404).json({
                ok: false,
                message: 'No tiene privilegios para editar el evento'
            });
        }

        const nuevoEvento = {
            ...req.body,
            user: uid
        }

        const eventoUpdated = await Evento.findByIdAndUpdate( eventoId, nuevoEvento, { new: true});

        resp.json({
            ok: true,
            evento: eventoUpdated
        });

    } catch (error) {
        console.log(error);
        resp.status(500).json({
            ok: false,
            message: 'Hable con el administrador'
        });
    }
}

const eliminarEvento = async ( req = request, resp = response ) => {

    const eventoId = req.params.id;
    const uid = req.uid;

    let event;
    try {
        event = await evento.findById(eventoId);
    } catch (err) {
        event = null;
    }

    try {

        if ( !event ) {
            resp.status(404).json({
                ok: false,
                message: 'Evento no existe por ese id'
            });
        }

        if ( evento.user.toString() !== uid ) {
            return resp.status(404).json({
                ok: false,
                message: 'No tiene privilegios para eliminar el evento'
            });
        }

        await Evento.findByIdAndDelete( eventoId );

        resp.json({
            ok: true,
        });

    } catch (error) {
        console.log(error);
        resp.status(500).json({
            ok: false,
            message: 'Hable con el administrador'
        });
    }
}

module.exports = {
    getEventos,
    crearEvento,
    actualizarEvento,
    eliminarEvento
}