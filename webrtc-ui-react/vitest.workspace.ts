import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
    /*"temp-test/tests/test3/vitest.config.ts",
    {
        extends:true,
        test:{
            name:"satar-test-2",
            include:['temp-test/tests/test2/!**!/!*.test.{js,ts}']
        },
    },
    {
        extends:true,
        test:{
            name:"satar-test-1",
            include:['temp-test/tests/test1/!**!/!*.test.{js,ts}']
        },
    }*/
    {
        extends:true,
        test:{
            name:"lodash",
            include:['tests/lodash/**/*.test.{js,ts}']
        },
    },
    {
        extends:true,
        test:{
            name:"RX-tests",
            include:['tests/rx-tests/**/*.test.{js,ts}']
        },
    }
])