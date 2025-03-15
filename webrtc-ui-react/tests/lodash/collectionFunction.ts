import * as _ from "lodash"

export function testDifferenceBy<T>(array1: T[], array2: T[], field?: string): T[] {
    return _.differenceBy(array1, array2, field)
}