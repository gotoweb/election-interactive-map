var Timer = require('../dist/bundle').default.Timer;

test('타이머 클래스', function() {
    expect((new Timer()).constructor.name).toEqual('Timer');
});

test('타이머 테스트', function test3(done) {

    function trigger(value) {
        // console.log(value);
    }

    new Timer({
        limit: 3,
        _speed: 100,
        onTick: trigger,
        onLast: function(tick) {
            expect(tick).toEqual(3);
            done();
        }
    });
    
});

test('타이머 stop 테스트', function test3_2(done) {

    function trigger(value) {
        if(value == 2) {
            this.stop();
        }
    }

    var timer = new Timer({
        limit: 4,
        _speed: 100,
        onTick: trigger,
        onLast: function(tick) {
            // console.log('you cannot reach here!');
        },
        onStop: function(value) {
            // console.log('interrupted');
            // console.log(value);
            expect(value).toEqual(2);
            done();
        }
    });
    
});

test('타이머 pause/resume 테스트', function(done) {
    
    var timer = new Timer({
        limit: 10,
        _speed: 100,
        onTick: function(value) {
            if(value == 2) {
                this.pause();
            }
        },
        onLast: function() {
            done();
        },
        onPause: function(value) {
            // console.log('paused');
            expect(value).toEqual(2);
            setTimeout(() => {

                expect(value).toEqual(2);
                this.resume();
            }, 1000);
        }
    });

    expect(typeof timer.pause).toEqual('function');
    expect(typeof timer.resume).toEqual('function');
})
