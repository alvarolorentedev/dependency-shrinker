jest.mock('commander', () => {
    const jestFn = {
            default: this,
            arguments: jest.fn(() => jestFn),
            version: jest.fn(() => jestFn),
            command: jest.fn(() => jestFn),
            description: jest.fn(() => jestFn),
            action: jest.fn(action => {
                let input = ["GOOD","BAD"]
                action(input)
                return jestFn
            }),
            parse: jest.fn(() => jestFn)
        }
    return jestFn
})

jest.mock('../../lib/dependency-shrink', () => {
    let impFun = (param) => {
        if(param=="BAD")
            throw "Boon"
        return Promise.resolve("OK")
      }
      return jest.fn().mockImplementation(impFun)
})

jest.mock('../../package.json', () => {
    const randomNumber = () => Math.floor((Math.random() * 10) + 1)
    return {
        version: `${randomNumber()}.${randomNumber()}.${randomNumber()}`
    }
})
const depshrink = require('../../bin/depshrink')

describe.skip('depshrink', () => {
    it("is version from package.json", () => {
        expect(commander.version.mock.calls[0][0]).toBe(packageJson.version)
    })
    it("is has command to remove dependencies", () => {
        expect(commander.arguments.mock.calls[0][0]).toBe("<executable> <BootTime> [dirs...]")
        expect(commander.description.mock.calls[0][0]).toBe("tests if a file is necessary to run a binary")
        expect(commander.action.mock.calls[0][0]).toBeInstanceOf(Function)
    })
})