function pLimit (concurrency: number) {
    if (concurrency < 1) throw new TypeError('Expected `concurrency` to be a number from 1 and up');

    let active = 0
    let queue: Array<{
        run: () => Promise<any>,
        resolve: (value: any) => void,
        reject: (reason?: any) => void,
    }> = []

    const next = () => {
        while (active < concurrency && queue.length) {
            const { run, resolve, reject } = queue.shift()!
            active++
            run()
                .then((v) => resolve(v))
                .catch(reject)
                .finally(() => {
                    active--
                    next()
                })

        }
    }

    return function <T> (task: () => Promise<T>) : Promise<T> {
        return new Promise<T>((resolve, reject) => {
            queue.push({ run: task, resolve, reject })
            next()
        })
    }
}

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

const tasks: Array<() => Promise<string>> = [
  () => sleep(400).then(() => "A"),
  () => sleep(300).then(() => "B"),
  () => sleep(200).then(() => "C"),
  () => sleep(100).then(() => "D"),
  () => sleep(250).then(() => "E"),
];

async function main() {
  const limit2 = pLimit(2); // <= only 2 tasks in flight

  // schedule all at once; limiter controls concurrency
  const promises = tasks.map((t, i) =>
    limit2(async () => {
      const start = Date.now();
      const out = await t();
      const end = Date.now();
      console.log(`Task ${out} done in ${end - start}ms`);
      return `result:${out}`;
    })
  );

  const results = await Promise.all(promises);
  console.log("All done:", results);
}

main().catch(console.error);