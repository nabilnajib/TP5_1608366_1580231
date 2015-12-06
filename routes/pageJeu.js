var express = require('express');
var jade = require('jade');
var fs = require('fs')
var path = require('path');
var u = require('underscore');
var rest = require('restler');
var pagesJeu = require('../lib/pagesJeu.js');
var decisionJs = require('../lib/decision.js');
var decisionsAleatoire = require('../lib/decisionsAleatoire.js');
var router = express.Router();
var JoueurModel = require('../models/joueur');
var AvancementModel = require('../models/avancement');


//http://stackoverflow.com/questions/3393854/get-and-set-a-single-cookie-with-node-js-http-server
function parseCookies (request) {
    var list = {},
        rc = request.headers.cookie;

    rc && rc.split(';').forEach(function( cookie ) {
        var parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
    });

    return list;
}
router.get('/jeu/:joueurId', function(req, res) {
        var joueurId = req.params.joueurId;
        console.log(joueurId);
        console.log('========= *** ++++++++++++');
        res.render('page/pageTemp');
});

/**
 * On envoie le HTML de la page complète désirée au client.
 * Le HTML des sous-sections de la page demandée sont combinées.
 *
 */
//router.get('/jeu/:pageId', function(req, res, next) {
//    var id = req.params.pageId;
//    var htmlPage = u.chain(fs.readdirSync('views/page'))
//        // On récupère les sous-sections de la page
//        .filter(function(file) {
//            return file.indexOf(id + '_') == 0;
//        })
//        // Pour chaque sous-section, on compile son Jade pour obtenir du HTML.
//        .map(function(file) {
//            var fn = jade.compile(fs.readFileSync('views/page/' + file, 'utf8'), {
//                filename: path.join('views/page/', file)
//            });
//            return fn({name:'Oleg'}).trim();
//        })
//        // On combine chaque HTML obtenu un à la suite de l'autre.
//        .join("");
//
//    res.render('page/pageJeu', {
//        numeroPage: req.params.pageId,
//        htmlPage: htmlPage
//    });
//});

router.get('/page', function(req, res, next) {
//    var id = 1;
//    var section = 1;
//    var i, contentHtml ='', contentImg='';
//    var page = u.find(pagesJeu.pages, function(page) {
//        return page.id == id && page.section == section;
//    });
//
//    for(i=0; i< page.contenu.length; i++){
//        contentHtml += page.contenu[i].text;
//        contentImg = page.contenu[i].img;
//    }
//    ajouterObjets = page.ajouterObjets;

//    res.json({
//        id: page.id,
//        section: page.section,
//        img: contentImg,
//        contenu: contentHtml,
//        decisionLien: page.decisionLien,
//        confirmation: page.confirmation,
//        decision: page.decision,
//        combat: page.combat
//
//    });
   res.render('page/pageTemp');
});

/**
 * Ce service web envoie la représentation d'une sous-section d'une page
 * de jeu.
 */
router.get('/page/:pageId/:sectionId', function(req, res) {
    var id = req.params.pageId;
    var section = req.params.sectionId;
    var i, contentHtml ='', contentImg='';
    var page = u.find(pagesJeu.pages, function(page) {
        return page.id == id;
    });
//    console.log(JSON.stringify(page));
    for(i=0; i< page.contenu.length; i++){
        if(page.contenu[i].text){
            contentHtml += "<p>" + page.contenu[i].text + "</p>";
        }
        if(page.contenu[i].img){
            contentHtml += "<img src=" + page.contenu[i].img + ">";
        }
    }
    if(page.ajouterObjets){
        var choiceObject = page.ajouterObjets;
        contentHtml += '<div id=ajouterObjets>' +
            '<fieldset><legend>' + choiceObject.text + '</legend>';
        for(var i =0; i < choiceObject.items.length; i++){
            contentHtml += '<div><label>' + choiceObject.items[i] + '</label>' +
                '<input type="checkbox" value="' + choiceObject.items[i] + '"></div>';
        }
        contentHtml += '</fieldset><input type="button" class ="button" ng-click="" value="Ajouter!"/></div>';
    }
    if(page.confirmation){
        contentHtml += '<input type="button" class ="button" value="Confirmer!" ng-click="confirmBtn()"/>';
    }
    if(page.decision){
        contentHtml += '<div id="decision"> <img src="/images/decision.jpg"><div>';
        if(page.decision == "/page/choixPossible"){
            var decis = u.find(decisionJs.decisions, function(decis) {
                return decis.id == id;
            });
//            console.log(decis);
            for( i = 0; i < decis.decision.length; i++){
                var decisionE = decis.decision;
                contentHtml += "<p>";
                if(decisionE[i].text){
                    contentHtml += "<p>" + decisionE[i].text + "</p>";
                }
                if(decisionE[i].page){
                    contentHtml += '<a ng-click=\'goToPage($event)\' data-id="'+decisionE[i].page+'"> rendez-vous à la page ' + decisionE[i].page.split('/')[2] + '</a>';
                }
            }
//            console.log(page.decision+"===========>"+decis.decision[0].page);
        }
        else if(page.decision == "/page/choixAleatoire"){
            var decisAlea = u.find(decisionsAleatoire.decisionsAleatoire, function(decisAlea) {
                return decisAlea.id == id;
            });
            for( i = 0; i < decisAlea.decision.length; i++){
                var decisionA = decisAlea.decision;
                contentHtml += "<p>";
                if(decisionA[i].text){
                    contentHtml += "<p>" + decisionA[i].text + "</p>";
                }
                if(decisionA[i].page){
                    contentHtml += '<a ng-click=\'goToPage($event)\' data-id="'+decisionA[i].page+'"> rendez-vous à la page ' + decisionA[i].page.split('/')[2] + '</a>';
                }
            }
        }
        contentHtml += '</div></div>';
    }

    ajouterObjets = page.ajouterObjets;
    //res.render('page/pageTemp', {
    res.json({
        id: page.id,
        section: page.section,
        img: contentImg,
        contenu: contentHtml,
        decisionLien: page.decisionLien,
        confirmation: page.confirmation,
        decision: page.decision,
        combat: page.combat,
        ajouterObjets: ajouterObjets

    });

//    console.log('================== ======= ==================     '+ contentHtml);
//    var nextSectionNum = parseInt(section) + 1;
//
//    var nextSectionPage = 'views/page/' + id + "_" + nextSectionNum + ".jade";
//    var nextSection = fs.existsSync(nextSectionPage) ? "/page/" + id + "/" + nextSectionNum : "";
//
//    res.render('page/' + id + "_" + section, function (err, html) {
//        res.json({
//            id: id,
//            section: section,
//            content: html,
//            next: nextSection
//        });
//    });
});

module.exports = router;

