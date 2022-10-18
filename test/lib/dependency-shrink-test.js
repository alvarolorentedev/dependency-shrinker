jest.mock('../../lib/helpers/files', () => ({
    getAll: jest.fn()
}))
jest.mock('../../lib/helpers/execute', () => jest.fn())
const shrinker = require('../../lib/dependency-shrink'),
    files = require('../../lib/helpers/files'),
    execute = require('../../lib/helpers/execute'),
    { faker } = require('@faker-js/faker')

describe('list files should', () => {
    let directories
    
    beforeEach(() => {
        directories = [faker.datatype.uuid(), faker.datatype.uuid()]
    })

    it('return a list of files that are optional and non optional',async () => {
        let fileList = [faker.datatype.uuid(), faker.datatype.uuid()],
            bootTime = faker.datatype.number(1000)
            executable = faker.datatype.uuid(),
            recursive = faker.datatype.boolean()
        files.getAll.mockReturnValue(fileList)
        execute.mockReturnValueOnce(Promise.resolve({isOptional: false}))
        execute.mockReturnValueOnce(Promise.resolve({isOptional: true}))

        let result = await shrinker(executable, directories, recursive, bootTime)
        
        expect(files.getAll).toBeCalledWith(directories, recursive)
        fileList.forEach(file => {
            expect(execute).toBeCalledWith(executable, file, bootTime)
        })
        expect(result).toEqual({
            optionals:[fileList[1]],
            notOptionals:[fileList[0]]
        })
    })

})
