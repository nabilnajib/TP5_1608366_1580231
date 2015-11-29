var myApp = angular.module('myApp', ['ngCookies', 'ngResource', 'ngRoute']);

myApp.config(function($locationProvider, $routeProvider) {
    $locationProvider.html5Mode(false);
    $routeProvider.when('http://localhost:3000/jeu/1', {
        templateUrl: 'http://localhost:3000/jeu/78',
        controller: 'homeController'
    });

});


myApp.factory('ServicePage', function(){
    var currentPageNumber =0, currentSectionContent= 0, currentPageContent= {};
    return {
        setPageNumber: function(pageNumber){
            currentPageNumber = pageNumber;
        },

        getPageNumber: function() {
            return currentPageNumber;
        },

        setSectionNumber: function(sectionNumber){
            currentSectionContent = sectionNumber;
        },

        getSectionNumber: function() {
            return currentSectionContent;
        },

        setPageContent: function(pageContent){
            currentPageContent = pageContent;
        },

        getPageContent: function(){
            return currentPageContent;
        }

    };
});
//http://stackoverflow.com/questions/20297638/call-function-inside-sce-trustashtml-string-in-angular-js
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
        $scope.nbJoueurEnduranceTot = parseInt(joueur.enduranceBase)+parseInt(joueur.endurancePlus);
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