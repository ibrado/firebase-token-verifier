'use strict';

const verifier = require('../index.js');

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
})


readline.question('Enter token: ', async (token) => {
  let a_token;

  // Test async/await
  try {
    a_token = await verifier.verify(token);
    console.log('\nasync: Verified!')
    console.log(JSON.stringify(a_token, null, 2));
  } catch(e) {
    console.log('\nasync: Error!')
    console.log(e);
  }

  // Test Promise
  verifier.verify(token)
  .then((p_token) => {
    console.log('\nPromise: Verified!');
    console.log(JSON.stringify(p_token, null, 2));
  }).catch((err) => {
    console.log('\nPromise: Error!');
    console.log(err);
  })

  // Test callback
  verifier.verify(token, (err, c_token) => {
    if(err) {
      console.log('\ncallback: Error!')
      console.log(err)
    } else {
      console.log('\ncallback: Verified!')
      console.log(JSON.stringify(c_token, null, 2));
    }
  })

  readline.close();
})

