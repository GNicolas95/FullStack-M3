const express = require("express");

let publications = [];
let id = 1;

const server = express();

server.use(express.json());

server.post("/posts", (req, res) => {
    const {author, title, contents} = req.body;

    if(author && title && contents) {
        const publicación = {
            author,
            title,
            contents,
            id: id++,
        }
        publications.push(publicación);
        res.status(200).json(publicación)
        
    } else {
        return res.status(400).json({
            error: "No se recibieron los parámetros necesarios para crear la publicación",
        })
    }
});


server.get("/posts", (req, res) => {
    const {author, title} = req.query;

    if (author && title) {
        const filter = publications.filter(
            (publicacion) => 
            publicacion.author === author && 
            publicacion.title === title
        ); 

        filter.length 
            ? res.status(200).json(filter)
            : res.status(400).json({
                error: 
                "No existe ninguna publicación con dicho título y autor indicado",
            })
    } else {
        res.status(400).json({
            error: 
            "No existe ninguna publicación con dicho título y autor indicado",
        })
    }
});


server.get("/posts/:author", (req, res) => {
    const {author} = req.params;
    const filter = publications.filter(
        (publicacion) => publicacion.author === author
    )

    filter.length 
        ? res.status(200).json(filter)
        : res.status(400).json({
            error: 
                "No existe ninguna publicación del autor indicado",
        })
});


server.put("/posts/:id", (req, res) => {
    const {id} = req.params;
    const {title, contents} = req.body;

    if (title && contents && id) {
        let publiId = publications.find(
            (publicacion) => publicacion.id === Number(id)
        );
        
        if (publiId) {
            publiId = {...publiId, title, contents};
            res.status(200).json(publiId)
        } else {
            res.status(400).json({
                error: 
                    "No se recibió el id correcto necesario para modificar la publicación"
            })
        }        
    } else {
        res.status(400).json({
            error:
                "No se recibieron los parámetros necesarios para modificar la publicación",
        })
    }
});


server.delete("/posts/:id", (req, res) => {
    const { id } = req.params;
    const index = publications.findIndex((publicacion) => publicacion.id === Number(id));

    if (index === -1) {
        return res.status(404).json({
            error: "El post con el ID indicado no existe.",
        });
    }

    publications.splice(index, 1);

    res.status(200).json({ success: true });
});


//NO MODIFICAR EL CODIGO DE ABAJO. SE USA PARA EXPORTAR EL SERVIDOR Y CORRER LOS TESTS
module.exports = { publications, server };
