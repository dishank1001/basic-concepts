async function* fakeDB() {
    for(let i=1; i<1000000; i++) {
        yield {
            id: i,
            name: `User ${i}`,
            email: `user_${i}@email.com`,
        }
    }
}

const fun = fakeDB()
console.log(await fun.next())   
console.log(await fun.next())