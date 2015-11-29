var myApp = angular.module('myApp', ['ngCookies']);

//myApp.factory('SharedData', function() {
//    var shared = {};
//
//    return {
//        set: function(value) {
//            shared = value;
//        },
//        get: function() {
//            return shared;
//        }
//    }
//});


myApp.controller('verifierFormualire', ['$scope', '$http', '$cookies', function($scope, $http, $cookies){

    $scope.isValid = true;
    $scope.joueurName = '';
    $scope.joueurId = '';
    $scope.nbJoueur = [];
    $scope.joueurCounter=true;
    $http.get('api/joueurs/').success(function(data) {
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
            alert('YOU MADE IT!!!');
        }
        else{
            $event.preventDefault();
            alert('NOT GOOD!!!');
        }
    }
    $scope.supprimerJoueur = function(obj){
        var id = angular.element(obj.currentTarget).attr('data-id');
        $http.delete('api/joueurs/'+id, id).success(function (data, status) {
            $http.get('api/joueurs/').success(function(joueur) {
                $scope.nbJoueur = joueur;
                $scope.joueurCounter= (joueur.length === 0) ? false : true;
            });
        });
    }
    $scope.goToPlayerPage = function(obj){
        //$scope.avancement = {};
        var id = angular.element(obj.currentTarget).attr('data-id');
        $cookies.put('joueurId', id);
        $http.get('http://localhost:3000/api/joueurs/avancement/'+id).success(function(avancement) {
            //$scope.avancement = avancement;
            window.location.href = '/jeu/'+ avancement.pageId;
        });
    }
}]);


myApp.controller('statPlayer', function($scope, $http, $cookies){
    /*
    * name: String,
     habileteBase: Number,
     habiletePlus: Number,
     enduranceBase: Number,
     endurancePlus: Number,
     pieceOr: Number,
     disciplines: [String],
     armes: [String],
     objets: [String],
     objetsSpeciaux: [String]
    * */
    var id = $cookies.get('joueurId');
    $http.get('http://localhost:3000/api/joueurs/'+id).success(function(joueur) {
        $scope.nbJoueurName = joueur.name;
        $scope.nbJoueurHabileteBase = joueur.habileteBase;
        $scope.nbJoueurHabileteTot = parseInt(joueur.habileteBase)+parseInt(joueur.endurancePlus);
        $scope.nbJoueurEnduranceBase = joueur.enduranceBase;
        $scope.nbJoueurEnduranceBaseTot = parseInt(joueur.enduranceBase)+parseInt(joueur.endurancePlus);
        $scope.pieceOr = joueur.pieceOr;
        $scope.disciplines = joueur.disciplines;
        $scope.armes = joueur.armes;
        $scope.objets = joueur.objets;
        $scope.objetsSpeciaux = joueur.objetsSpeciaux;
    });
//    $http.get('api/joueurs/avancement/'+id).success(function(avancement) {
//        window.location.href = '/jeu/'+ avancement.pageId;
//    });

});