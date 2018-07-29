const coffee = require('coffee'),
    executable = require.resolve('../../bin/depshrink.js')

    describe('cli', () => {
        it('should detect optianl and non optional files', done => {
            let expectedOutput = 'executing test/example/executable.sh in test/example\nNot critical files: \n    - test/example/notrequired.txt\nCritical files: \n    - test/example/executable.sh\n    - test/example/required.txt\n'
            coffee.fork(executable, ['test/example/executable.sh', 1000, 'test/example'])
                .expect('stdout',expectedOutput)
                .expect('code', 0)
                .end(done)
        })

    })