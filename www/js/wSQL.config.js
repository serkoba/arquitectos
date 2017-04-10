//http://igorizr1.github.io/wSQL/
angular.module('wSQL.config', [])
.constant("W_SQL_CONFIG", {
    PARAMS: {
        name: "documentos",
        version: "0.0.1",
        sub_name: "documentos",
        size: -1
    },
    TABLES_SQL: {
        "caratulas"    :   [
            "id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL",
            'direccion_obra VARCHAR(255) NOT NULL',
            'localidad_obra VARCHAR(255) NOT NULL',
            'expediente_municipal VARCHAR(255) NOT NULL',
            'municipalidad_obra VARCHAR(255) NOT NULL',
            'expdiente_capba INTEGER NOT NULL',
            'duracion VARCHAR(255) NOT NULL',
            'superficie VARCHAR(255) NOT NULL',
            'superficie_semi VARCHAR(255) NOT NULL',
            'tarea INTEGER NOT NULL',
            'pdf VARCHAR(255) NULL'
        ],
        "actas_inicio_obra"    :   [
            "id INTEGER PRIMARY KEY NOT NULL", /* Mismo Id que caratula */
            "fecha VARCHAR(255) NOT NULL",
            "obra VARCHAR(255) NOT NULL",
            "ubicacion VARCHAR(255) NOT NULL",
            "CIRC VARCHAR(255) NOT NULL",
            "SECC VARCHAR(255) NOT NULL",
            "MZ VARCHAR(255) NOT NULL",
            "parcela VARCHAR(255) NOT NULL",
            "partida VARCHAR(255) NOT NULL",
            "expediente VARCHAR(255) NOT NULL",
            "contratista VARCHAR(255) NOT NULL",
            "director VARCHAR(255) NOT NULL",
        ],
        "datos_personales"    :   [
            "id INTEGER PRIMARY KEY NOT NULL", /* Mismo Id que caratula */
            "profesional VARCHAR(255) NOT NULL",
            'matricula INTEGER NOT NULL',
            'calle VARCHAR(255) NOT NULL',
            'altura INTEGER NOT NULL',
            'departamento VARCHAR(255) NULL',
            'localidad VARCHAR(255) NOT NULL',
            'telefono INTEGER NOT NULL',
            'email VARCHAR(255) NOT NULL',            
        ],
         "ordenes_de_servicios"    :   [
            "id INTEGER PRIMARY KEY AUTOINCREMENT",
            "estado VARCHAR(255) NULL DEFAULT 'true'",
            "n_orden INTEGER NOT NULL",
            "id_caratula INTEGER NOT NULL",
            /*"libro INTEGER NOT NULL",*/
            "fecha VARCHAR(255) NOT NULL",
            /*"obra VARCHAR(255) NOT NULL",*/
            /*"contratista VARCHAR(255) NOT NULL",*/
            "descripcion TEXT NOT NULL",
            "fotos TEXT NOT NULL",
        ]
    },
    /**
     * DEBUG_LEVELs
     *    0 - nothing
     *    1 - console.error
     *    2 - console.warn &
     *    3 - console.info &
     *    4 - console.log, debug
     */
    DEBUG_LEVEL: 1,
    CLEAR:false
});



