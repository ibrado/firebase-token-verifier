'use strict';

const verifier = require('../index.js');

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
})

readline.question('Enter token: ', (token) => {
  readline.question('Enter projectId: ', (projectId) => {
    readline.question('Enter userId (optional): ', async (userId) => {
      // Test async/await
      try {
        let a_token = await verifier.validate(token, projectId, userId);
        console.log('\nasync: Validated!')
        console.log(JSON.stringify(a_token, null, 2));
      } catch(err) {
        console.log('\nasync: Error!')
        console.log(err);
      }

      // Test Promise
      verifier.validate(token, projectId, userId)
      .then((p_token) => {
        console.log('\nPromise: Validated!');
        console.log(JSON.stringify(p_token, null, 2));
      }).catch((err) => {
        console.log('\nPromise: Error!');
        console.log(err);
      })

      // Test callback
      verifier.validate(token, projectId, userId, (err, c_token) => {
        if(err) {
          console.log('\ncallback: Error!')
          console.log(err)
        } else {
          console.log('\ncallback: Validated!')
          console.log(JSON.stringify(c_token, null, 2));
        }
      })

      readline.close();
    })
  })
})

