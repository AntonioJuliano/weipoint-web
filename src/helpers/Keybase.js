import kbpgp from 'kbpgp';
import bluebird from 'bluebird';

bluebird.promisifyAll(kbpgp);
bluebird.promisifyAll(kbpgp.KeyManager);

async function getPublicKey(username) {
  const pubKeyResponse = await fetch('https://keybase.io/' + username + '/pgp_keys.asc');

  if (pubKeyResponse.status !== 200) {
    return {
      ok: false,
      message: `Cannot find Keybase user. Please check your username and make sure your
                account has a linked public key.`
    };
  }
  const pubKey = await pubKeyResponse.text();
  if (pubKey === 'SELF-SIGNED PUBLIC KEY NOT FOUND') {
    return {
      ok: false,
      message: `Your account does not have a public key. Add one by clicking "add a PGP key"
      on your Keybase account page`
    }
  }

  return {
    ok: true,
    key: pubKey
  }
}

async function getUser(username) {
  const requestPath = 'https://keybase.io/_/api/1.0/user/lookup.json?usernames=' + username;

  const response = await fetch(requestPath);

  if (response.status !== 200) {
    throw new Error('Keybase bad response');
  }

  const json = await response.json();

  return json.them[0];
}

async function verifySignature(signature, username, expectedMessage) {
  // TODO what if user has more than one key
  // TODO cache this request
  const pubKeyResponse = await fetch('https://keybase.io/' + username + '/pgp_keys.asc');

  if (pubKeyResponse.status !== 200) {
    return {
      ok: false,
      message: `Cannot find Keybase user. Please check your username and make sure your
                account has a linked public key.`,
      signature: signature
    };
  }
  const pubKey = await pubKeyResponse.text();
  const keyManager = await kbpgp.KeyManager.import_from_armored_pgpAsync({ armored: pubKey });

  let result = null;
  try {
    result = await kbpgp.unboxAsync({ keyfetch: keyManager, armored: signature });
  } catch(e) {
    switch (e.message) {
      case 'No keys match the given key IDs':
        return {
          ok: false,
          message: 'Not signed by correct user. Check your Username',
          signature: signature
        };
      case 'checksum mismatch':
      case 'no header found':
        return {
          ok: false,
          message: 'Invalid signature. Please make sure you copied the entire signature.',
          signature: signature
        }
      default:
        throw e;
    }
  }

  const message = result[0].toString();

  if (expectedMessage !== message) {
    return {
      ok: false,
      message: 'Message does not match. Please make sure you signed the correct message',
      signature: signature
    };
  }

  return { ok: true, signature: signature };
}

module.exports.verifySignature = verifySignature;
module.exports.getPublicKey = getPublicKey;
module.exports.getUser = getUser;
