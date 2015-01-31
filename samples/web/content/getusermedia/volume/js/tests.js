//Inject a fake interval service for testing
angular.module('webrtcApp').service('myModuleService', ['$interval', function ($interval) {
    var called = 0;
    $interval(function () {
        called++;
    }, 10);
    this.getCalled = function () {
        return called;
    }
}]);

var controller, scope;
describe("Angular Tests", function() {
    
    beforeEach(function() {
        module('webrtcApp')
        //Inject our scope variables
        inject(function($controller, $rootScope) {
            scope = $rootScope.$new();
            controller =  $controller('noisyTimesController', { $scope: scope });
        })
        
        inject(function (myModuleService, _$interval_) {
            // Initialize the service under test instance
            service = myModuleService;
            $interval = _$interval_;
        });
    })
    
    it("Tests sending text messages", function() {
        scope.$apply(function() { scope.sendTextNotification(); } )
    })
    
    it("Tests Rquirements", function() {
        /* We are replicating this sequence of events
        Sequence    Time    Volume  Cumulative Volume Output    Send Text
        0           .5      .5      .25                         No, sound was not long enough.
        1           1       .25     .25                         Yes, met threshold and CVO requirements.
        2           1       .5      .5                          Yes, met threshold and CVO requirements.
        3           2       .25     .5                          Yes, met threshold and CVO requirements.
        4           1       .25     .25                         No, not one of the top 3 longest/loudest sounds.
        5           1       .5      .5                          Yes, replaces the time from sequence 1 to be in the top 3 loudest/longest sounds.
        */
        audioContext = {}
        soundMeter = {}
        
        audioContext.currentTime = 0
        soundMeter.slow = .2
        scope.initialize()
        expect(scope.noisy).toBe(true)
        
        audioContext.currentTime = 1
        soundMeter.slow = 0
        scope.initialize()
        expect(scope.noisy).toBe(false)
        expect(scope.noisyTimes[0].cumulativeVolumeOutput).toBe(1) //aka 1 second long noisy time
        expect(scope.noisyTimes.length).toBe(1)
        
        audioContext.currentTime = 2
        soundMeter.slow = .2
        scope.initialize()
        expect(scope.noisy).toBe(true)
        
        audioContext.currentTime = 4
        soundMeter.slow = 0
        scope.initialize()
        expect(scope.noisy).toBe(false)
        expect(scope.noisyTimes[0].cumulativeVolumeOutput).toBe(2)
        expect(scope.noisyTimes[1].cumulativeVolumeOutput).toBe(1)
        expect(scope.noisyTimes.length).toBe(2)
        
        audioContext.currentTime = 5
        soundMeter.slow = .2
        scope.initialize()
        expect(scope.noisy).toBe(true)
        
        audioContext.currentTime = 6
        soundMeter.slow = 0
        scope.initialize()
        expect(scope.noisy).toBe(false)
        expect(scope.noisyTimes[0].cumulativeVolumeOutput).toBe(2)
        expect(scope.noisyTimes[1].cumulativeVolumeOutput).toBe(1)
        expect(scope.noisyTimes[2].cumulativeVolumeOutput).toBe(1)
        expect(scope.noisyTimes.length).toBe(3)
        
        // Make sure no 0 second times are added
        audioContext.currentTime = 6
        soundMeter.slow = .2
        scope.initialize()
        expect(scope.noisy).toBe(true)
        
        audioContext.currentTime = 6
        soundMeter.slow = 0
        scope.initialize()
        expect(scope.noisy).toBe(false)
        expect(scope.noisyTimes[0].cumulativeVolumeOutput).toBe(2)
        expect(scope.noisyTimes[1].cumulativeVolumeOutput).toBe(1)
        expect(scope.noisyTimes[2].cumulativeVolumeOutput).toBe(1)
        expect(scope.noisyTimes.length).toBe(3)
        
        //Push a 1 off of the listStyleType
        audioContext.currentTime = 6
        soundMeter.slow = .2
        scope.initialize()
        expect(scope.noisy).toBe(true)
        
        audioContext.currentTime = 8
        soundMeter.slow = 0
        scope.initialize()
        expect(scope.noisy).toBe(false)
        expect(scope.noisyTimes[0].cumulativeVolumeOutput).toBe(2)
        expect(scope.noisyTimes[1].cumulativeVolumeOutput).toBe(2)
        expect(scope.noisyTimes[2].cumulativeVolumeOutput).toBe(1)
        expect(scope.noisyTimes.length).toBe(3)
    })
})