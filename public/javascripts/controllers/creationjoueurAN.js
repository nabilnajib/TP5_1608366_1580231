var myApp = angular.module('myApp', ['ngCookies', 'ngResource', 'ngRoute']);


//http://stackoverflow.com/questions/20358140/ng-click-doesnt-fire-when-added-post-load
myApp.directive('compileTemplate', function($compile, $parse){
    return {
        link: function(scope, element, attr){
            var parsed = $parse(attr.ngBindHtml);
            function getStringValue() { return (parsed(scope) || '').toString(); }

            //Recompile if the template changes
            scope.$watch(getStringValue, function() {
                $compile(element, null, -9999)(scope);  //The -9999 makes it skip directives so that we do not recompile ourselves
            });
        }
    }
});
/**
 * Controlleur du formulaire
 */
myApp.controller('verifierFormualire', ['$scope', '$http', '$cookies', function($scope, $http, $cookies){

    $scope.isValid = true;
    $scope.joueurName = '';
    $scope.joueurId = '';
    $scope.nbJoueur = [];
    $scope.joueurCounter=true;
    $http.get('/api/joueurs/').success(function(data) {
        $scope.joueurCounter= (data.length === 0) ? false : true;
        $scope.nbJoueur = data;
    });
    /**
     * Fonction invoquée pour la verification le nombre de checkbox
     */
    $scope.submitForm = function() {
        //alert('test');
        var countDiscip = 0;
        var countArm= 0;
        angular.forEach($scope.c.discipline, function(value, key)
        {
            if (value) countDiscip++;
        });
        angular.forEach($scope.c.arme, function(value, key)
        {
            if (value) countArm++;
        });
        $scope.isValid = (countDiscip == 5 && countArm == 2 && $scope.joueurName.length !== 0);
    }
    /**
     * Fonction invoquée lors du submit du formulaire
     */
    $scope.submitButton = function($event){
        if($scope.isValid && $scope.joueurName.length !== 0) {
            alert('Le joueur est ajouté');
            $cookies.remove('joueurId');
            $cookies.put('joueurId', '');
        }
        else{
            $event.preventDefault();
            alert('NOT GOOD!!!');
        }
    }
    /**
     * Permet de supprimer le joueur choisi
     * @param obj pour recevoir l'evenement de la page
     */
    $scope.supprimerJoueur = function(obj){
        var id = angular.element(obj.currentTarget).attr('data-id');
        if(confirm('Est ce que vous voulez supprimer le joueur?')){
            $http.delete('/api/joueurs/'+id, id).success(function (data, status) {
                $http.get('/api/joueurs/').success(function(joueur) {
                    $scope.nbJoueur = joueur;
                    $scope.joueurCounter= (joueur.length === 0) ? false : true;
                });
            });
        }
    }
    /**
     * Permet d'aller a la page dans l'avancement du joueur
     * @param obj  pour capter le id du joueur
     */
    $scope.goToPlayerPage = function(obj){
        //$scope.avancement = {};
        var id = angular.element(obj.currentTarget).attr('data-id');
        $cookies.put('joueurId', id);

        window.location.href = '/page';
    }
}]);
/**
 * Controlleur des pages de jeu
 */
myApp.controller('pagesCtrl', ['$scope', '$http', '$cookies','$sce',  function($scope, $http, $cookies, $sce){
    var id = $cookies.get('joueurId');

//Code invoquer lors d'un nouveau joueur
    if(!id){
        $http.get('/api/joueurs/').success(function(joueur) {
            $cookies.put('joueurId', joueur[0]._id);
            id = joueur[0]._id;
//                alert(joueur[0].name);
            $scope.nbJoueurName = joueur[0].name;
            $scope.nbJoueurHabileteBase = joueur[0].habileteBase;
            $scope.nbJoueurHabileteTot = parseInt(joueur[0].habileteBase)+parseInt(joueur[0].endurancePlus);
            $scope.nbJoueurEnduranceBase = joueur[0].enduranceBase;
            $scope.nbJoueurEnduranceTot = parseInt(joueur[0].enduranceBase)+parseInt(joueur[0].endurancePlus);
            $scope.pieceOr = joueur[0].pieceOr;
            $scope.disciplines = joueur[0].disciplines;
            $scope.armes = joueur[0].armes;
            $scope.objets = joueur[0].objets;
            $scope.objetsSpeciaux = joueur[0].objetsSpeciaux;
            $scope.possedeGuerison = false;

            $http.get('http://localhost:3000/api/joueurs/avancement/'+id).success(function(avancement) {
                var  pageid = avancement.pageId;
                var  sectionid = avancement.sectionId;
                if(pageid !== 1 && ($scope.nbJoueurEnduranceTot > $scope.nbJoueurEnduranceBase)){
                    joueur.disciplines.forEach(function(elem){
                        if(elem === 'guerison'){
                            $scope.possedeGuerison = true;
                        }
                    });
                }
                $http.get('/page/'+pageid+'/'+sectionid).success(function(pageJson) {
                    $scope.numeroPage = pageJson.id;
                    $scope.contenuPage = $sce.trustAsHtml(pageJson.contenu);
                    $scope.img = pageJson.img;
                    $scope.decision = pageJson.decision;

                });
            });

        });
//Code invoquer lorsqu'on choisi un joueur parmi la liste
    } else{

        $http.get('http://localhost:3000/api/joueurs/avancement/'+id).success(function(avancement) {
            var  pageid = avancement.pageId;
            var  sectionid = avancement.sectionId;
            $http.get('http://localhost:3000/api/joueurs/'+id).success(function(joueur) {
                $scope.nbJoueurName = joueur.name;
                $scope.nbJoueurHabileteBase = joueur.habileteBase;
                $scope.nbJoueurHabileteTot = parseInt(joueur.habileteBase)+parseInt(joueur.endurancePlus);
                $scope.nbJoueurEnduranceBase = joueur.enduranceBase;
                $scope.nbJoueurEnduranceTot = parseInt(joueur.enduranceBase)+parseInt(joueur.endurancePlus);
                $scope.pieceOr = joueur.pieceOr;
                $scope.disciplines = joueur.disciplines;
                $scope.armes = joueur.armes;
                $scope.objets = joueur.objets;
                $scope.objetsSpeciaux = joueur.objetsSpeciaux;
                $scope.possedeGuerison = false;
                if(pageid !== 1 && ($scope.nbJoueurEnduranceTot > $scope.nbJoueurEnduranceBase)){
                    joueur.disciplines.forEach(function(elem){
                        if(elem === 'guerison'){
                            $scope.possedeGuerison = true;
                        }
                    });
                }

            });
            $http.get('/page/'+pageid+'/'+sectionid).success(function(pageJson) {
                $scope.numeroPage = pageJson.id;
                $scope.contenuPage = $sce.trustAsHtml(pageJson.contenu);
                $scope.img = pageJson.img;
                $scope.decision = pageJson.decision;
            });
        });
    }
    /**
     * Permet de rediriger vers la page de decision
     * @param obj Pour capter l'evenemnt de la page et d'identifier les ids de la page et la section
     */
    $scope.goToPage = function(obj){
        var ids = angular.element(obj.currentTarget).attr('data-id');
        var pageId = ids.split('/')[2], sectionId = ids.split('/')[3];
        var id = $cookies.get('joueurId');
//            alert(ids);
        $http.get('/page/'+pageId+'/'+sectionId).success(function(pageJson) {
            $scope.numeroPage = pageJson.id;
            $scope.contenuPage = $sce.trustAsHtml(pageJson.contenu);
            $scope.img = pageJson.img;
            $scope.decision = pageJson.decision;
            $http.put('http://localhost:3000/api/joueurs/avancement/'+id+'/'+pageId+'/'+sectionId).success(function(avancement) {
//                        alert(avancement.pageId);
            });
        });
    }
    /**
     * Est invoquée lorsque le joueur la choisi
     */
    $scope.confirmBtn = function(){
        alert("confirmer");
    }
    /**
     * permet au joueur de combattre
     * @param $event
     */
    $scope.combattre = function($event){
        alert("combattre");
    }
    /**
     * permet au joueur de fuir
     * @param $event
     */
    $scope.fuir = function($event){
        alert("fuir");
    }
    /**
     * Permet au joueur de confirmer le bonus de la guérison et de mettre a jour sa valeur dans la bd
     */
    $scope.confirmGuerison = function(){
        var id = $cookies.get('joueurId');
        $scope.possedeGuerison = false;
        $scope.nbJoueurEnduranceBase++;
        $http.get('http://localhost:3000/api/joueurs/'+id).success(function(joueur) {
            joueur.enduranceBase = parseInt(joueur.enduranceBase) +1;

            $http.put('http://localhost:3000/api/joueurs/'+id+'/'+encodeURIComponent(joueur)).success(function(avancement) {
//                        alert(avancement.pageId);
            });
        });

    }
}]);