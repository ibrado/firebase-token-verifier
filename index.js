'use strict';

const jwt = require('jwt-simple');
const url = require('url');
const https = require('https');

var firebase_cache;

const base64_decode = (b64) => {
  return Buffer.from(b64, 'base64').toString('utf8');
}

const http_request = (uri, auth, headers, body, meth) => {
  return new Promise((resolve, reject) => {
    let req_opts = url.parse(uri);
    if(auth) {
      headers = Object.assign({}, { 'Authorization': 'Basic '+auth });
    }

    req_opts.headers = Object.assign({}, headers || {});
    req_opts.method = meth || (body ? 'POST' : 'GET');

    var data = '';

    let req = https.request(req_opts, (res) => {
      res.on('data', (d) => {
        data += d;

      }).on('end', () => {
        var body;
        try {
          body = JSON.parse(data);
          resolve({ head: res.headers, body: body });
        } catch(e) {
          reject(e)
        }

      }).on('error', (err) => {
        reject(err)
      });
    });

    req.end();
  })
}

const get_firebase_certs = (now) => {
  return new Promise((resolve, reject) => {
    if(firebase_cache && (firebase_cache.expiry > now)
    && firebase_cache.certs) {
      return resolve(firebase_cache.certs);
    }
  
    http_request('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com')
    .then((resp) => {
      if(!resp.head || !resp.body) 
        return reject('Invalid response received');  

      firebase_cache = {};
      firebase_cache.certs = resp.body;
      firebase_cache.expiry = new Date(resp.head.expires).getTime() / 1000;

      resolve(firebase_cache.certs);
    })
    .catch((err) => {
      reject(err);
    });
  })
}

const response = (err, data, cb, resolve, reject) => {
  if(typeof cb === 'function') return cb(err, data);
  if(err) return reject(err);
  return resolve(data);
}

const verify = (token, cb) => {
  return new Promise((resolve, reject) => {
    let parts = token.split('.');

    let header;
    let payload;

    try {
      header = JSON.parse(base64_decode(parts[0]));
      payload = JSON.parse(base64_decode(parts[1]));
    } catch(err) {
      return response('Invalid token: '+err, null, cb, resolve, reject);
    }

    let kid = header.kid;
    let now = new Date().getTime() / 1000;

    if(header.alg !== 'RS256')
      return response('Invalid algorithm: ' + header.alg, null, cb, resolve, reject);

    if(payload.exp < now)
      return response('Expired token: ' + payload.exp, null, cb, resolve, reject);

    if(payload.iat >= now)
      return response('Invalid issue time: ' + iat, null, cb, resolve, reject);

    if(payload.auth_time >= now)
      return response('Invalid authentication time: ' + auth_time, null, cb, resolve, reject);

    if(!payload.sub)
      return response('Missing subject', null, cb, resolve, reject);

    get_firebase_certs(now)
    .then((certs) => {
      let key = certs[kid];

      if(!key)
        return response('Key ID not found: ' + kid, null, cb, resolve, reject);

      let verified;
      try {
        verified = jwt.decode(token, key);
      } catch(err) {
        return response('Invalid token: '+err, null, cb, resolve, reject);
      }

      if(!verified.uid)
        verified.uid = verified.sub; // Backwards compatibility

      return response(null, verified, cb, resolve, reject);
      
    }).catch((err) => {
      return response(err, null, cb, resolve, reject);
    })
  })
}

// projectId, userId, cb
// projectId, cb
// projectId
const validate = (token, projectId, p1, p2) => {
  return new Promise((resolve, reject) => {
    let userId;
    let cb;

    if(typeof p2 === 'function') {
      cb = p2;
      userId = p1;
    } else if(typeof p1 === 'function') {
      cb = p1;
    } else {
      userId = p1;
    }

    if(!projectId)
      return response('projectId is required', null, cb, resolve, reject);

    verify(token)
    .then((verified) => {
      if(verified.aud !== projectId)
        return response('Invalid audience: ' + projectId + ' vs ' + verified.aud, null, cb, resolve, reject);

      if(verified.iss !== 'https://securetoken.google.com/' + projectId)
        return response('Invalid issuer: ' + verified.iss, null, cb, resolve, reject);
       
      if(userId && (userId !== verified.sub)) 
        return response('Invalid subject: ' + userId + ' vs ' + verified.sub, null, cb, resolve, reject);

      return response(null, verified, cb, resolve, reject);

    })
    .catch((err) => {
      return response(err, null, cb, resolve, reject);
    })
  })
}

module.exports.verify = verify;
module.exports.validate = validate;