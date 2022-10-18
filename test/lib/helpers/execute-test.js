jest.mock('fs', () => ({
    renameSync: jest.fn()
}))

jest.mock('child_process', () => ({
    exec: jest.fn()
}))

jest.mock('tree-kill', () => jest.fn())

jest.useFakeTimers()
jest.spyOn(global, 'setTimeout')
jest.spyOn(global, 'clearTimeout')

const execute = require('../../../lib/helpers/execute'),
    { faker } = require('@faker-js/faker'),
    exec = require('child_process').exec,
    fs = require('fs'),
    EventEmitter = require('events'),
    kill = require('tree-kill')

class TestEmitter extends EventEmitter {}

describe('execute should', () => {
    beforeEach(()=>{
        fs.renameSync.mockClear()
        exec.mockReset()
    })

    it('run an optional file with signal SIGKILL',async () => {
        let bootTime = faker.datatype.number(10000)
        let filename = faker.datatype.uuid()
        let executable = faker.datatype.uuid()
        let code = faker.datatype.uuid()
        let childEmitter = new TestEmitter()
        exec.mockReturnValue(childEmitter)
        
        let executing = execute(executable, filename, bootTime)

        childEmitter.emit('exit',code,'SIGKILL')

        let result = await executing
        
        expect(fs.renameSync).toHaveBeenNthCalledWith(1, filename, `${filename}.back`)
        expect(exec).toBeCalledWith(executable)
        expect(fs.renameSync).toHaveBeenNthCalledWith(2, `${filename}.back`, filename)
        expect(result).toEqual({isOptional: true})
        expect(clearTimeout).toBeCalled()
    })
    
    it('run an optional file with colde 1',async () => {
        let bootTime = faker.datatype.number(10000)
        let filename = faker.datatype.uuid()
        let executable = faker.datatype.uuid()
        let signal = faker.datatype.uuid()
        let childEmitter = new TestEmitter()
        exec.mockReturnValue(childEmitter)
        
        let executing = execute(executable, filename, bootTime)

        childEmitter.emit('exit',1,signal)

        let result = await executing
        
        expect(fs.renameSync).toHaveBeenNthCalledWith(1, filename, `${filename}.back`)
        expect(exec).toBeCalledWith(executable)
        expect(fs.renameSync).toHaveBeenNthCalledWith(2, `${filename}.back`, filename)
        expect(result).toEqual({isOptional: true})
    })
    
    it('run an non optional file with any code and signal',async () => {
        let bootTime = faker.datatype.number(10000)
        let filename = faker.datatype.uuid()
        let executable = faker.datatype.uuid()
        let signal = faker.datatype.uuid()
        let code = faker.datatype.uuid()
        let childEmitter = new TestEmitter()
        exec.mockReturnValue(childEmitter)
        
        let executing = execute(executable, filename, bootTime)

        childEmitter.emit('exit',code,signal)

        let result = await executing
        
        expect(fs.renameSync).toHaveBeenNthCalledWith(1, filename, `${filename}.back`)
        expect(exec).toBeCalledWith(executable)
        expect(fs.renameSync).toHaveBeenNthCalledWith(2, `${filename}.back`, filename)
        expect(result).toEqual({isOptional: false})
    })

    it('timeout should reject and kill process', async () => {
        let bootTime = faker.datatype.number(10000)
        let filename = faker.datatype.uuid()
        let executable = faker.datatype.uuid()
        let pid = faker.datatype.uuid()

        exec.mockReturnValue({pid: pid, on : jest.fn()})

        let executing = execute(executable, filename, bootTime)

        jest.runOnlyPendingTimers()

        let result = await executing

        expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), bootTime)
        expect(kill).toBeCalledWith(pid, 'SIGKILL')
        expect(result).toEqual({isOptional: false})

    })
})
