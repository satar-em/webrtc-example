import {testDifferenceBy} from "./collectionFunction"
import { expect, test } from 'vitest'

test('chek same array dif', () => {
    const array1=[
        {name:"ali",age:21,address:"yazd"},
        {name:"hasan",age:21,address:"meybod"},
        {name:"reza",age:55,address:"ghom"},
    ]
    expect(testDifferenceBy(array1,array1)).toStrictEqual([])
})

test('chek same array dif2', () => {
    const array1=[
        {name:"ali",age:21,address:"yazd"},
        {name:"hasan",age:68,address:"meybod"},
        {name:"reza",age:55,address:"ghom"},
    ]
    const array2=[
        {name:"ali",age:21,address:"yazd"},
        {name:"hasan",age:66,address:"meybod"},
        {name:"reza",age:55,address:"ghom"},
    ]
    expect(testDifferenceBy(array1,array2,'age')).toStrictEqual([{name:"hasan",age:68,address:"meybod"}])
})