var webrtcApp = angular.module('webrtcApp', [])
    
webrtcApp.controller('noisyTimesController', function($scope, $http, $interval) {
    var initializer;
    $scope.noisy = false;
    $scope.noisyStart = 0
    $scope.noisyTimes = [];
    $scope.threshold = ".1";
    $scope.numberToText = "+14103362464"
    $scope.thisNoise = {}
    
    $scope.initialize = function()
    {
        try
        {
            //Detect if it's noisy
            if (soundMeter.slow > $scope.threshold && $scope.noisy === false)
            {
                console.log("its noisy!");
                $scope.noisy = true;
                noisyStart = audioContext.currentTime;
                $scope.thisNoise.start = new Date().toLocaleString();
            }
            else if (soundMeter.slow < $scope.threshold && $scope.noisy === true)
            {
                console.log('it\'s quiet now');
                $scope.noisy = false;
                //TODO: This should be based on the "cumulative volume output", not the seconds elapsed
                $scope.thisNoise.cumulativeVolumeOutput = audioContext.currentTime - noisyStart; // number of seconds
                $scope.thisNoise.end = new Date().toLocaleString();
                
                //copy the scope by value not reference
                var newNoise = JSON.parse( JSON.stringify( $scope.thisNoise ) );
                console.log(newNoise)
                
                if ($scope.noisyTimes.length === 0)
                {
                    $scope.addNoisyTime(0, newNoise)
                }
                else
                {
                    var addedElement = false;
                    for (var i = $scope.noisyTimes.length; i--; i > 0)
                    {
                        if ($scope.noisyTimes[i].cumulativeVolumeOutput < $scope.thisNoise.cumulativeVolumeOutput)
                        {
                            addedElement = true;
                            $scope.addNoisyTime(i-1, newNoise)  //-1 to add before the current item
                            break;
                        }
                    }
                    
                    //append to end if we do not have enough things
                    if (addedElement == false && $scope.noisyTimes.length < 3)
                    {
                        $scope.addNoisyTime($scope.noisyTimes.length, newNoise)
                    }
                }
            }
            
            $scope.audioContext = audioContext;
            $scope.soundMeter = soundMeter;
        } catch(err) {
            console.log(err)
        }
    }
    initializer = $interval($scope.initialize, 1000, 0, true)
    
    $scope.addNoisyTime = function(position, newNoise) {
        console.log('appending new noise at ' + position)
        $scope.noisyTimes.splice(position, 0, newNoise)
        
        //remove last element if we are trackign too many things
        if ($scope.noisyTimes.length > 3)
        {
            $scope.noisyTimes.pop()
        }
        
        //notify phone number that its been noisy
        $scope.sendTextNotification()
    }
    
    $scope.sendTextNotification = function() {
        
            $http({
                method: 'post', 
                url: 'http://cors-anywhere.herokuapp.com/https://api.sendhub.com/v1/messages/',
                params: { 'username': '6506562778', 'api_key': '57e642c3992c52ad08f26f4dced584a17e27588d' }, //its bad practice to put api keys into a javascript file
                data: { 'contacts': [  $scope.numberToText ], 'text':'It\'s so loud in here' }
            })
            .error(function (data, status, headers, config) {  console.log(data, status, headers, config) })
            .success(function (data, status, headers, config) { console.log(data, status, headers, config) })
    }
    
})