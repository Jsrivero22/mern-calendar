const { request, response } = require('express');

const bcrypt = require('bcryptjs');

const Usuario = require('../models/Usuario');
const { generarJWT } = require('../helpers/jwt');


const crearUsuario = async ( req = request, resp = response ) => {

    const { email, password } = req.body;

    try {

        let usuario = await Usuario.findOne({ email })

        if ( usuario !== null ) {
            return resp.status(400).json({
                ok: false,
                message: 'un usuario ya existe con ese correo',
            });
        }

        usuario = new Usuario( req.body );

        // Encriptar contraseña
        const salt = bcrypt.genSaltSync();
        usuario.password = bcrypt.hashSync( password, salt );

        await usuario.save();

        // Generar JWT
        const token = await generarJWT( usuario.id, usuario.name );

        resp.status(201).json({
            ok: true,
            uid: usuario.id,
            name: usuario.name,
            token
        });

    } catch (error) {
        console.log(error);
        resp.status(500).json({
            ok: true,
            message: 'Hable con el administrador',
        });
    }
}

const loginUsuario = async ( req = request, resp = response ) => {

    const { email, password } = req.body;

    try {

        const usuario = await Usuario.findOne({ email })

        if ( !usuario ) {
            return resp.status(400).json({
                ok: false,
                message: 'un usuario no existe con ese correo',
            });
        }

        // Confirmar los password
        const validPassword = bcrypt.compareSync( password, usuario.password );

        if ( !validPassword ) {
            resp.status(400).json({
                ok: false,
                message: 'Password incorrecto',
            });
        }

        // Generar JWT
        const token = await generarJWT( usuario.id, usuario.name );

        resp.json({
            ok: true,
            uid: usuario.id,
            name: usuario.name,
            token
        });

    } catch (error) {
        console.log(error);
        resp.status(500).json({
            ok: true,
            message: 'Hable con el administrador',
        });
    }

}

const revalidarToken = async ( req = request, resp = response ) => {

    const { uid, name } = req;

    // Generar JWT
    const token = await generarJWT( uid, name );

    resp.json({
        ok: true,
        // message: 'renew'
        token
    });
}


module.exports = {
    crearUsuario,
    loginUsuario,
    revalidarToken
}