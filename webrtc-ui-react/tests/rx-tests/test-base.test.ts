import {test} from "vitest";
import {fromFetch} from "rxjs/fetch";
import * as RX from "rxjs";
import {InteropObservable} from "rxjs/internal/types";

test("test timing out", async () => {
    await new Promise(resolve => setTimeout(resolve, 3000))
    console.log("i am finished");
}, 10000)


test("test async pip For Observable", async () => {
    let emSbs: RX.Subscriber<number>
    const observable = new RX.Observable<number>((subscriber) => {
        emSbs = subscriber
        subscriber.next(10);
        subscriber.next(100);
    }).pipe(
        RX.map(
            async (value) => {
                await new Promise(resolve => setTimeout(resolve, 1000))
                return value + 1
            }
        ),
        RX.map(
            async (value) => {
                await new Promise(resolve => setTimeout(resolve, 1000))
                return (await value) + 1
            }
        ),
        RX.map(
            async (value) => {
                await new Promise(resolve => setTimeout(resolve, 1000))
                return (await value) + 1
            }
        ),
        RX.map(
            async (value) => {
                await new Promise(resolve => setTimeout(resolve, 1000))
                return (await value) + 1
            }
        ),
        RX.map(
            async (value) => {
                await new Promise(resolve => setTimeout(resolve, 1000))
                //throw Error(`unhandled error: ${value}`);
                return (await value) + 1
            }
        ),
        RX.concatAll(),
        RX.catchError((err) => new RX.Observable(subscriber => {
                subscriber.next("enemy error")
            }
        ))
    );

    observable.subscribe(value => {
        console.log('(1)got value ' + value);
    });
    observable.subscribe(value => {
        console.log('(2)got value ' + value);
    });
    observable.subscribe(value => {
        console.log('(3)got value ' + value);
    });
    emSbs.next(1000)
    await new Promise(resolve => setTimeout(resolve, 7000))
}, 20000)

test("test async pip with From", async () => {
    const subject = new RX.Subject<number>()
    //const finishedPip = new RX.Subject<any>()
    const observable = subject.pipe(
        RX.concatMap((value) => RX.from(async function () {
            console.log({ value });
            await new Promise(resolve => setTimeout(resolve, 3000))
            return value+1
        }())),
        RX.concatMap((value) => RX.from(async function () {
            await new Promise(resolve => setTimeout(resolve, 3000))
            return value+1
        }())),
        RX.concatMap((value) => new RX.Observable(subscriber => {
            setTimeout(()=>{
                subscriber.next(value++)
                subscriber.complete()
            },1000)
        })),
        RX.concatMap((value:number) => new RX.Observable(subscriber => {
            setTimeout(()=>{
                subscriber.next(value++)
                subscriber.complete()
            },2000)
        }))
        , RX.catchError(err => new RX.Observable(subscriber => {
            subscriber.next("bro ridi ba in error")
            subscriber.complete()
        }))
    )
    observable.subscribe(value => {
        console.log('1->got value ' + value);
    });
    observable.subscribe(value => {
        console.log('2->got value ' + value);
    });
    observable.subscribe(value => {
        console.log('3->got value ' + value);
    });

    setTimeout(() => {
        console.log("****starting")
        subject.next(10)
        subject.next(100)
        subject.next(1000)
        console.log("****ending")
    }, 1000)

    await RX.lastValueFrom(observable.pipe(RX.take(3)))

    //await new Promise(resolve => setTimeout(resolve, 20000))
}, 120000)

test("test What i wand", async () => {
    const subject = new RX.Subject<number>()
    //const finishedPip = new RX.Subject<any>()
    const observable = subject.pipe(
        RX.concatMap((value) => new RX.Observable(subscriber => {
            setTimeout(()=>{
                subscriber.next(value++)
                setTimeout(()=>{
                    subscriber.next(value++)
                    subscriber.complete()
                    if (value===1002) subject.complete()
                },2000)
            },1000)
        }))
        , RX.catchError(err => new RX.Observable(subscriber => {
            subscriber.next("bro ridi ba in error")
            subscriber.complete()
        }))
    )
    observable.subscribe(value => {
        console.log('1->got value ' + value);
    });
    setTimeout(() => {
        console.log("****starting")
        subject.next(10)
        subject.next(100)
        subject.next(1000)
        console.log("****ending")
    }, 1000)
    observable.subscribe(value => {
        console.log('2->got value ' + value);
    });

    await RX.lastValueFrom(observable)

    //await new Promise(resolve => setTimeout(resolve, 20000))
}, 120000)

test("test take", async () => {
    /*const intervalCount = RX.interval(1000);
    const takeFive = intervalCount.pipe(RX.take(5));
    takeFive.subscribe(x => console.log(x));*/
    /*const subject = new RX.Subject<number>()
    subject.pipe(RX.take(5)).subscribe(x => console.log(x));
    subject.next(10)
    subject.next(100)
    subject.next(1000)*/
    await new Promise(resolve => setTimeout(resolve, 10000))
}, 60000)

test("test function 1", async () => {
    const fetchBasic = fromFetch("https://jsonplaceholder.typicode.com/posts", {
        method: "POST",
        body: JSON.stringify({
            title: 'foo',
            body: 'bar',
            userId: 1,
        }),
    }).pipe(
        RX.switchMap((response) => {
            if (response.ok) {
                return response.json()
            } else {
                // Server is returning a status requiring the client to try something else.
                return RX.of({error: true, message: `Error ${response.status}`});
            }
        }),
        RX.catchError(err => {
            // Network or other error, handle appropriately
            console.error(err);
            return RX.of({error: true, message: err.message})
        })
    )
    fetchBasic.subscribe({
        next: (response) => {
            console.log({response});
        },
        complete: () => {
            console.log('done')
        },
        error(err) {
            console.error(err);
        },
    })
    await new Promise(resolve => setTimeout(resolve, 5000))
}, 10000)

test("test function 2", async () => {
    const fetchBasic = fromFetch("https://jsonplaceholder.typicode.com/posts", {
        method: "POST",
        body: JSON.stringify({
            title: 'foo',
            body: 'bar',
            userId: 1,
        }),
    }).pipe(
        RX.switchMap((response) => {
            if (response.ok) {
                return response.json()
            } else {
                // Server is returning a status requiring the client to try something else.
                return RX.of({error: true, message: `Error ${response.status}`});
            }
        }),
        RX.catchError(err => {
            // Network or other error, handle appropriately
            console.error(err);
            return RX.of({error: true, message: err.message})
        })
    )
    fetchBasic.subscribe({
        next: (response) => {
            console.log({response});
        },
        complete: () => {
            console.log('done')
        },
        error(err) {
            console.error(err);
        },
    })
    await new Promise(resolve => setTimeout(resolve, 5000))
}, 10000)