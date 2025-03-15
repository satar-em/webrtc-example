import * as RX from "rxjs";
import * as axios from "axios";

export const post = <T = any>(url: string, data: any, config?: any): RX.Observable<axios.AxiosResponse<T>> => general("post", url, data, config)

export const get = <T = any>(url: string, config?: any): RX.Observable<axios.AxiosResponse<T>> => general("get", url, config)

function general<T = any>(type: "get" | "post" | "delete" | "put", url: string, data: any, config?: any): RX.Observable<axios.AxiosResponse<T>> {
    return new RX.Observable<axios.AxiosResponse<T>>((subscriber) => {
        subscriber.add(() => {
            console.log()
        })
        const controller = new AbortController();
        const {signal} = controller;
        let abortAble = true;
        (type === "get" || type === "delete" ?
            axios.default[type]<T>(url, {...config, signal}) :
            axios.default[type]<T>(url, data,{...config, signal}))
            .then(response => {
                abortAble = false;
                subscriber.next(response);
                subscriber.complete();
            })
            .catch(reason => {
                abortAble = false;
                subscriber.error(reason);
            })

        return () => {
            if (abortAble) {
                controller.abort();
            }
        };
    });
}
