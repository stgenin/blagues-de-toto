import Resolver from '@forge/resolver';
import { kvs } from '@forge/kvs';

const resolver = new Resolver();

resolver.define('getCFValue', async (req) => {
  // console.log(req);
  try {
      const stored = await kvs.get('customField');
      if (stored === undefined) {
        return 'undefined';
      }
      return stored;
  } catch (err) {
    // Certains cas exceptionnels (e.g. key invalide, quota atteint)
    // kvs.get peut jeter si invalidité de la clé ou limite atteinte
    // Lorsque api retourne NOT_FOUND dans l'en-tête, ne pas propager
    const errCode = err?.code || err?.error?.code;
    if (errCode === 'NOT_FOUND') {
      return 'undefined';
    }
    throw err;
  }
});

resolver.define('getAPIKeyValue', async (req) => {
    console.log(req);
  try {
      const stored = await kvs.getSecret('openAPIKey');
      if (stored === undefined) {
        return 'undefined';
      }
      return stored;
  } catch (err) {
    // Certains cas exceptionnels (e.g. key invalide, quota atteint)
    // kvs.get peut jeter si invalidité de la clé ou limite atteinte
    // Lorsque api retourne NOT_FOUND dans l'en-tête, ne pas propager
    const errCode = err?.code || err?.error?.code;
    if (errCode === 'NOT_FOUND') {
      return 'undefined';
    }
    throw err;
  }
});

resolver.define('saveParams', async ({ payload }) => {
  const { customField, openAPIKey } = payload;

  // Logique pour sauvegarder les données...
  console.log('Saving customField:', customField);
  // console.log('Saving openAPIKey:', openAPIKey);
  kvs.set('customField',customField);
  kvs.setSecret('openAPIKey',openAPIKey);
  return true;
});

export const handler = resolver.getDefinitions();
