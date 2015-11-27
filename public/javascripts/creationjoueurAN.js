var myApp = angular.module('myApp', []);

myApp.controller('verifierFormualire', function($scope, $http){

    $scope.isValid = true;
    $scope.joueurName = '';
    $scope.joueurId = '';
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
            $("#affichageJoueur").load(location.href + " #affichageJoueur");
        });
    }
});