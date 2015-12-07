var express = require('express');
var u = require("underscore");
var fs = require('fs');
var Joueur = require('../../models/joueur');
var Avancement = require('../../models/avancement');

var constantes = require('../../lib/constantes.js');
var pagesJeu = require('../../lib/pagesJeu.js');

var router = express.Router();

/**
 * Obtient la représentation du joueur.
 * @param id Id du joueur optionnel
 */
router.get('/:id?', function(req, res) {

    if (req.params.id) {
        Joueur.findById(req.params.id, function(err, joueur) {
            if (err) {
                res.send(err);
            } else if (joueur) {
                res.json(joueur);
            } else {
                res.json({});
            }
        });
    } else {
        Joueur.find({}, function(err, joueurs) {
            if (err) {
                res.send(err);
            } else {
                res.json(joueurs);
            }
        }).sort({time:-1});
    }
});

/**
 * Modifie la représentation du joueur.
 * @param id Id du joueur
 */
router.put('/:id', function(req, res) {

    var id = req.params.id;
    Joueur.findById(id, function(err, joueur) {
        if (err) {
            res.send(err);
        } else {
            joueur.pieceOr = req.body.pieceOr ? req.body.pieceOr : joueur.pieceOr;
            joueur.armes = req.body.armes ? req.body.armes : joueur.armes;
            joueur.objets = req.body.objets ? req.body.objets : joueur.objets;
            joueur.objetsSpeciaux = req.body.objectsSpeciaux ? req.body.objetsSpeciaux : joueur.objetsSpeciaux;
            joueur.save(function(err) {
                if (err) {
                    res.send(err);
                } else {
                    res.json({message: "Le joueur a été correctement mis à jour."});
                }
            });
        }
    });
});

/**
 * Modifie la représentation du joueur.
 * @param id Id du joueur
 */
router.put('/:id/:jr', function(req, res) {

    var id = req.params.id;
    var player = decodeURIComponent(req.params.jr);
    Joueur.findById(id, function(err, joueur) {

        if (err) {
            res.send(err);
        } else {
            joueur.pieceOr = player.pieceOr ? player.pieceOr : joueur.pieceOr;
            joueur.armes = player.armes ? player.armes : joueur.armes;
            joueur.objets = player.objets ? player.objets : joueur.objets;
            joueur.objetsSpeciaux = player.objectsSpeciaux ? player.objetsSpeciaux : joueur.objetsSpeciaux;
            joueur.enduranceBase = player.enduranceBase ? player.enduranceBase : joueur.enduranceBase;
            joueur.save(function(err) {
                if (err) {
                    res.send(err);
                } else {
                    res.json({message: "Le joueur a été correctement mis à jour."});
                }
            });
            console.log("+++++++++++++++++++++++++ "+joueur.enduranceBase + "+++++++++++++++++++++++++ "+JSON.stringify(player));
        }
    });
});

/**
 * Supprime un joueur de la BD selon l'ID.
 * @param id Id du joueur
 */
router.delete('/:id', function(req, res) {
    Joueur.remove({ _id: req.params.id }, function(err, joueur) {
        if (err) {
            res.send(err);
        } else {
            Avancement.remove({ joueurId: req.params.id }, function(err, avancement) {
                if (err) {
                    res.send(err);
                } else {
                    Joueur.find({}, function(err, joueurs) {
                        res.json({ message: "Le joueur et son avancement ont été correctement supprimé.", joueur: joueur });
                    });
                }
            });
        }
    });
});

/**
 * Obtient l'avancement d'un joueur.
 * @param id Id du joueur
 */
router.get('/avancement/:id', function(req, res) {
    Avancement.findOne({joueurId: req.params.id}, function(err, avancement) {
        if (err) {
            res.send(err);
        } else if (avancement) {
            res.json(avancement);
        } else {
            res.json({});
        }
    });
});

/**
 * Ajoute l'état initial du joueur au commencement de l'histoire.
 */
router.post('/avancement/:joueurId', function(req, res) {
    var avancement = new Avancement;
    avancement.pageId = 1;
    avancement.sectionId = 1;
    avancement.joueurId = req.params.joueurId;
    avancement.save(function(err) {
        if (err) {
            res.send(err);
        } else {
            res.send("L'avancement du joueur " + req.params.joueurId  + " a été correction sauvegardé.");
        }
    });
});

/**
 * Modifie l'état courant du joueur.
 */
router.put('/avancement/:joueurId', function(req, res) {
    Avancement.findOne({joueurId: req.params.joueurId}, function(err, avancement) {
        if (err) {
            res.send(err);
        } else {
            avancement.pageId = req.body.pageId ? req.body.pageId : avancement.pageId;
            avancement.sectionId = req.body.sectionId ? req.body.sectionId : avancement.sectionId;
            avancement.combat = req.body.combat ? req.body.combat : avancement.combat;
            avancement.save(function(err) {
                if (err) {
                    res.send(err);
                } else {
                    res.json({message: "L'avancement du joueur " + req.params.joueurId + " a été correctement mis à jour."});
                }
            });
        }
    });
});
/**
 * Modifie l'état courant du joueur.
 */
router.put('/avancement/:joueurId/:pageId/:sectionId', function(req, res) {
    Avancement.findOne({joueurId: req.params.joueurId}, function(err, avancement) {
        if (err) {
            res.send(err);
        } else {
            console.log(req.params.pageId+" =====  "+ req.params.sectionId);
            avancement.pageId = req.params.pageId ? req.params.pageId : avancement.pageId;
            avancement.sectionId = req.params.sectionId ? req.params.sectionId : avancement.sectionId;
            avancement.combat = req.body.combat ? req.body.combat : avancement.combat;
            avancement.save(function(err) {
                if (err) {
                    res.send(err);
                } else {
                    res.json({message: "L'avancement du joueur " + req.params.joueurId + " a été correctement mis à jour."});
                }
            });
        }
    });
});

/**
 * Supprime l'état courant du joueur.
 */
router.delete('/avancement/:id', function(req, res) {
    Joueur.remove({ _id: req.params.id }, function(err, joueur) {
        if (err) {
            res.send(err);
        } else {
            Avancement.remove({ joueurId: req.params.id }, function(err, avancement) {
                if (err) {
                    res.send(err);
                } else {
                    res.json({ message: "Le joueur et son avancement ont été correctement supprimé." });
                }
            });
        }
    });
});


module.exports = router;

