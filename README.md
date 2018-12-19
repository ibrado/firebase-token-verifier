# firebase-token-verifier

Firebase JWT verifier, implements [Verify ID tokens using a third-party JWT library](https://firebase.google.com/docs/auth/admin/verify-id-tokens). Use as a lightweight alternative to the [Firebase Admin SDK](https://www.npmjs.com/package/firebase-admin) if all you need to do is verify or validate a Firebase JWT.

## Install

```
npm install --save firebase-token-verifier
```

## Usage

`firebase-token-verifier` can be used with Promises, `async`, or callbacks.

`validate()` is just a wrapper around `verify()` that also checks the project ID (audience/issuer), and optionally the user ID (subject).

```javascript
const verifier = require('firebase-token-verifier');
const token = 'eyJhb...';
```

### Promise

#### `verify`

```javascript
verifier.verify(token)
.then((verified) => {
  console.log('Verified!');
  console.log(JSON.stringify(verified, null, 2));
})
.catch((err) => {
  console.log('Error!');
  console.log(err);
});
```

#### `validate`

```javascript
// userId is optional
// verifier.validate(token, projectId)
verifier.validate(token, projectId, userId)
.then((validated) => {
  console.log('Validated');
  console.log(JSON.stringify(validated, null, 2));
})
.catch((err) => {
  console.log('Error!');
  console.log(err);
})
```

### async

#### `verify`

```javascript
try {
  let verified = await verifier.verify(token);
  console.log('Verified!');
  console.log(JSON.stringify(verified, null, 2));
} catch(err) {
  console.log('Error!');
  console.log(err);
}
```

#### `validate`

```javascript
try {
  // userId is optional
  // verifier.validate(token, projectId)
  let validated = await verifier.validate(token, projectId, userId);
  console.log('Validated!');
  console.log(JSON.stringify(validated, null, 2));
} catch(err) {
  console.log('Error!');
  console.log(err);
}
```

### callback

#### `verify`

```javascript
verifier.verify(token, (err, verified) => {
  if(err) {
    console.log('Error!');
    console.log(err);
  } else {
    console.log('Verified!');
    console.log(JSON.stringify(verified, null, 2));
  }
})
```

#### `validate`

```javascript
// userId is optional
// verifier.validate(token, projectId, callback)
verifier.validate(token, projectId, userId, (err, validated) => {
  if(err) {
    console.log('Error!');
    console.log(err);
  } else {
    console.log('Validated!');
    console.log(JSON.stringify(validated, null, 2));
  }
})
```

## Examples

Please see `demo.sh` and `demo/*.js`.

```
$ sh demo.sh
```