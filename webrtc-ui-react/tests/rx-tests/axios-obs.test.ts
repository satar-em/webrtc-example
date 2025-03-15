import {test} from "vitest";
import * as RX from "rxjs";
import * as axios from "axios";

test("test timing out", async () => {

    const AxiosObs = new RX.Observable((subscriber) => {
        subscriber.add(() => {
            console.log()
        })
        const controller = new AbortController();
        const {signal} = controller;
        let abortAble = true;
        axios.default.post("https://jsonplaceholder.typicode.com/posts", {
            title: 'foo',
            body: 'bar',
            userId: 1,
        },{signal}).then(response => {
            subscriber.next(response);
            subscriber.complete();
        }).catch(reason => {
            abortAble = false;
            subscriber.error(reason);
        })
        return () => {
            if (abortAble) {
                controller.abort();
            }
        };
    });

    AxiosObs.subscribe(value => {
        console.log(value);
    })

    await RX.firstValueFrom(AxiosObs)

}, 10000)