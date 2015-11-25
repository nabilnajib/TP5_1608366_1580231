var myApp = angular.module('myApp', []);

myApp.controller('verifierFormualire', function($scope){

    $scope.isValid = true;
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
        //alert($scope.countDiscip +" "+ $scope.countArm);
        $scope.isValid = (countDiscip == 5 && countArm == 2);
    }
    $scope.submitButton = function(){
        if($scope.isValid) {
            alert('YOU MADE IT!!!');
            $http({
                url: '/jeu/1',
                method: "POST",
                data: { 'message' : $scope }
            })
                .then(function(response) {
                    alert('YOU MADE IT AGAIN!!!');
                });
        }
    }
});