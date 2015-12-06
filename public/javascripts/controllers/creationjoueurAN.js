var myApp = angular.module('myApp', ['ngCookies', 'ngResource', 'ngRoute']);

//myApp.config(function($routeProvider) {
//    $routeProvider.when('http://localhost:3000/jeu/1', {
//        templateUrl: 'http://localhost:3000/jeu/1',
//        controller: 'statPlayer'
//    });
//
//});


//myApp.factory('ServicePage', function() {
//    var savedData;
//    function set(data) {
//        savedData = data;
//    }
//    function get() {
//        return savedData;
//    }
//
//    return {
//        set: set,
//        get: get
//    }
//
//});

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
    $scope.goToPlayerPage = function(obj){
        //$scope.avancement = {};
        var id = angular.element(obj.currentTarget).attr('data-id');
        $cookies.put('joueurId', id);

        window.location.href = '/page';
    }
}]);
myApp.controller('pagesCtrl', ['$scope', '$http', '$cookies','$sce',  function($scope, $http, $cookies, $sce){

        var id = $cookies.get('joueurId');
//        alert(id);
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
                $http.get('http://localhost:3000/api/joueurs/avancement/'+id).success(function(avancement) {
                    var  pageid = avancement.pageId;
                    var  sectionid = avancement.sectionId;
                    $http.get('/page/'+pageid+'/'+sectionid).success(function(pageJson) {
                        $scope.numeroPage = pageJson.id;
                        $scope.contenuPage = $sce.trustAsHtml(pageJson.contenu);
                        $scope.img = pageJson.img;
                        $scope.decision = pageJson.decision;

                    });
                });

            });

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
                });
                $http.get('/page/'+pageid+'/'+sectionid).success(function(pageJson) {
                    $scope.numeroPage = pageJson.id;
                    $scope.contenuPage = $sce.trustAsHtml(pageJson.contenu);
                    $scope.img = pageJson.img;
                    $scope.decision = pageJson.decision;
                });
            });
        }
        $scope.goToPage = function(pageId, sectionId){
            alert("goToPage");
            $http.get('/page/'+pageId+'/'+sectionId).success(function(pageJson) {
                $scope.numeroPage = pageJson.id;
                $scope.contenuPage = $sce.trustAsHtml(pageJson.contenu);
                $scope.img = pageJson.img;
                $scope.decision = pageJson.decision;
            });
        }
}]);

//http://stackoverflow.com/questions/20297638/call-function-inside-sce-trustashtml-string-in-angular-js
//myApp.directive('compileTemplate', function($compile, $parse){
//    return {
//        link: function(scope, element, attr){
//            var parsed = $parse(attr.ngBindHtml);
//            function getStringValue() { return (parsed(scope) || '').toString(); }
//            alert('test');
//            //Recompile if the template changes
//            scope.$watch(getStringValue, function() {
//                $compile(element, null, -9999)(scope);  //The -9999 makes it skip directives so that we do not recompile ourselves
//            });
//        }
//    }
//});

m
//verifierFormualire.$inject=['$scope', 'ServicePage'];
//pagesCtrl.$inject=['$scope', 'ServicePage'];