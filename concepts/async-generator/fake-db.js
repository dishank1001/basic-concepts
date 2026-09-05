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

for await (const user of fakeDB()) {
    if (user.id > 5) break             
    console.log(user)
}